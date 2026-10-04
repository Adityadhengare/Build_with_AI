import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
import { dbService } from '../src/services/db';
import { SEED_SCHOLARSHIPS } from '../src/seed/seedData';
import { TEST_STUDENT_PROFILE } from './fixtures/testFixtures';

describe('ScholarSathi Backend REST API Endpoints', () => {
  const app = createApp();

  const studentToken = 'Bearer test-student-uid-1';
  const student2Token = 'Bearer test-student-uid-2';
  const adminToken = 'Bearer test-admin-uid-1';

  beforeAll(async () => {
    // Seed initial scholarships & profile
    for (const s of SEED_SCHOLARSHIPS) {
      await dbService.setScholarship(s.id, s);
    }
    await dbService.saveProfile(TEST_STUDENT_PROFILE.userId, TEST_STUDENT_PROFILE);
    await dbService.setUser('test-admin-uid-1', {
      email: 'admin@scholarsaathi.in',
      role: 'ADMIN',
    });
  });

  // Health Check
  it('GET /health: should return 200 UP', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.status).toBe('UP');
  });

  // 1. Authentication Middleware & 13. Unauthorized Access
  it('1 & 13. Auth Middleware: should return 401 when Authorization header is missing on protected endpoint', async () => {
    const res = await request(app).get('/api/profile');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('1. Auth Middleware: should return 200 when valid Bearer token is provided', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', studentToken);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.userId).toBe('test-student-uid-1');
    expect(res.body.data.role).toBe('STUDENT');
  });

  // 2. Profile Creation
  it('2. Profile Creation: should create a new student profile via POST /api/profile', async () => {
    const res = await request(app)
      .post('/api/profile')
      .set('Authorization', student2Token)
      .send({
        fullName: 'Kavita Sharma',
        gender: 'FEMALE',
        domicileState: 'Uttar Pradesh',
        domicileDistrict: 'Lucknow',
        category: 'GENERAL',
        familyAnnualIncome: 180000,
        isDisabled: false,
        minorityStatus: false,
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.fullName).toBe('Kavita Sharma');
    expect(res.body.data.userId).toBe('test-student-uid-2');
  });

  // 3. Profile Update
  it('3. Profile Update: should update profile personal & academic details via PUT /api/profile', async () => {
    const res = await request(app)
      .put('/api/profile')
      .set('Authorization', studentToken)
      .send({
        fullName: 'Aditya R. Patil (Updated)',
        familyAnnualIncome: 240000,
        domicileDistrict: 'Pune Urban',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.fullName).toBe('Aditya R. Patil (Updated)');
    expect(res.body.data.familyAnnualIncome).toBe(240000);

    // Verify academic update endpoint
    const acadRes = await request(app)
      .put('/api/profile/academic')
      .set('Authorization', studentToken)
      .send({
        currentEducationLevel: 'UNDERGRADUATE',
        courseName: 'B.Tech Computer Science',
        institutionName: 'COEP Pune',
        institutionState: 'Maharashtra',
        currentYearOrSemester: 3,
        passingYear: 2027,
        percentageOrCgpa: 82.5,
      });

    expect(acadRes.status).toBe(200);
    expect(acadRes.body.data.education.percentageOrCgpa).toBe(82.5);
  });

  // 4. Scholarship Search & Filtering
  it('4. Scholarship Search: should filter scholarships by search term and state', async () => {
    const res = await request(app)
      .get('/api/scholarships')
      .query({ search: 'MahaDBT', state: 'Maharashtra' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data[0].title).toContain('MahaDBT');
  });

  // 5. Scholarship Details
  it('5. Scholarship Details: should return full details and 404 for invalid ID', async () => {
    const res = await request(app).get('/api/scholarships/sch-mahadbt-post-matric-obc');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe('sch-mahadbt-post-matric-obc');
    expect(res.body.data.officialPortalUrl).toBeTruthy();

    const notFoundRes = await request(app).get('/api/scholarships/non-existent-id-12345');
    expect(notFoundRes.status).toBe(404);
    expect(notFoundRes.body.success).toBe(false);
  });

  // 14. User A cannot access User B data (IDOR)
  it('14. IDOR Protection: User 2 should NOT be able to view or modify User 1 application', async () => {
    // 1. User 1 creates an application
    const createRes = await request(app)
      .post('/api/applications')
      .set('Authorization', studentToken)
      .send({
        scholarshipId: 'sch-mahadbt-post-matric-obc',
        status: 'APPLIED',
        notes: 'Submitted documents on portal',
      });

    expect(createRes.status).toBe(201);
    const appId = createRes.body.data.id;

    // 2. User 2 tries to access User 1 application
    const crossAccessRes = await request(app)
      .get(`/api/applications/${appId}`)
      .set('Authorization', student2Token);

    // Should return 404 (not in User 2's vault) or 403 Forbidden
    expect([403, 404]).toContain(crossAccessRes.status);
    expect(crossAccessRes.body.success).toBe(false);
  });

  // 15. Admin Authorization
  it('15. Admin Authorization: Student should receive 403 Forbidden on admin endpoints', async () => {
    const studentAccess = await request(app)
      .get('/api/admin/metrics')
      .set('Authorization', studentToken);

    expect(studentAccess.status).toBe(403);
    expect(studentAccess.body.success).toBe(false);
    expect(studentAccess.body.error.code).toBe('FORBIDDEN');

    // Admin should receive 200 OK
    const adminAccess = await request(app)
      .get('/api/admin/metrics')
      .set('Authorization', adminToken);

    expect(adminAccess.status).toBe(200);
    expect(adminAccess.body.success).toBe(true);
    expect(adminAccess.body.data.totalStudents).toBeGreaterThan(0);
  });

  it('15. Admin CRUD: Admin should create and delete scholarship with audit logging', async () => {
    const createRes = await request(app)
      .post('/api/admin/scholarships')
      .set('Authorization', adminToken)
      .send({
        title: 'Infosys STEM Excellence Scholarship',
        description: 'Comprehensive financial assistance for high-performing STEM undergraduates.',
        financialAssistance: '₹1,00,000 / year',
        applicationDeadline: '2026-12-31T23:59:59Z',
        officialPortalUrl: 'https://www.infosys.org/csr',
      });

    expect(createRes.status).toBe(201);
    const schId = createRes.body.data.id;

    // Verify Audit log was created
    const auditRes = await request(app)
      .get('/api/admin/audit-logs')
      .set('Authorization', adminToken);

    expect(auditRes.status).toBe(200);
    expect(auditRes.body.data.some((l: any) => l.action === 'SCHOLARSHIP_CREATED')).toBe(true);

    // Delete scholarship
    const delRes = await request(app)
      .delete(`/api/admin/scholarships/${schId}`)
      .set('Authorization', adminToken);

    expect(delRes.status).toBe(200);
    expect(delRes.body.data.deleted).toBe(true);
  });

  // 16. Saved Scholarships
  it('16. Saved Scholarships: should bookmark, list, and remove saved scholarships', async () => {
    const saveRes = await request(app)
      .post('/api/scholarships/sch-nsp-central-sector/save')
      .set('Authorization', studentToken)
      .send({ notes: 'Need to get top 20th percentile cert' });

    expect(saveRes.status).toBe(200);
    expect(saveRes.body.data.saved).toBe(true);

    const listRes = await request(app)
      .get('/api/scholarships/saved')
      .set('Authorization', studentToken);

    expect(listRes.status).toBe(200);
    expect(Array.isArray(listRes.body.data)).toBe(true);
    expect(listRes.body.data.some((s: any) => s.id === 'sch-nsp-central-sector')).toBe(true);

    const removeRes = await request(app)
      .delete('/api/scholarships/sch-nsp-central-sector/save')
      .set('Authorization', studentToken);

    expect(removeRes.status).toBe(200);
    expect(removeRes.body.data.saved).toBe(false);
  });

  // 17. Application Tracking
  it('17. Application Tracking: should create, update status, and list student applications', async () => {
    const createRes = await request(app)
      .post('/api/applications')
      .set('Authorization', studentToken)
      .send({
        scholarshipId: 'sch-tata-trusts-engg',
        scholarshipTitle: 'Tata Trusts Engineering Scholarship',
        status: 'IN_PROGRESS',
        officialApplicationId: 'TT-2026-ENG-4910',
      });

    expect(createRes.status).toBe(201);
    const appId = createRes.body.data.id;

    // Update status to APPLIED
    const updateRes = await request(app)
      .put(`/api/applications/${appId}/status`)
      .set('Authorization', studentToken)
      .send({
        status: 'APPLIED',
        notes: 'Submitted along with Bonafide certificate',
      });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.data.status).toBe('APPLIED');
    expect(updateRes.body.data.notes).toBe('Submitted along with Bonafide certificate');

    // List applications
    const listRes = await request(app)
      .get('/api/applications')
      .set('Authorization', studentToken);

    expect(listRes.status).toBe(200);
    expect(listRes.body.data.some((a: any) => a.id === appId)).toBe(true);
  });

  // 18. Invalid Document Upload (File Security)
  it('18. File Security: should reject invalid file format (magic bytes check)', async () => {
    // Malicious or fake PDF (text masquerading as pdf)
    const fakeFileContent = Buffer.from('FAKE_FILE_CONTENT_NOT_A_PDF_OR_IMAGE');

    const res = await request(app)
      .post('/api/documents/upload')
      .set('Authorization', studentToken)
      .attach('file', fakeFileContent, 'exploit.pdf');

    expect(res.status).toBe(415); // Unsupported Media Type
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('UNSUPPORTED_MEDIA');
  });

  it('18. File Security: should accept genuine PDF with valid %PDF- magic bytes', async () => {
    // Valid PDF signature %PDF-
    const validPdfBuffer = Buffer.from('%PDF-1.5 \n%Sample government income certificate test bytes');

    const res = await request(app)
      .post('/api/documents/upload')
      .set('Authorization', studentToken)
      .field('documentType', 'INCOME_CERTIFICATE')
      .attach('file', validPdfBuffer, 'income_cert.pdf');

    expect(res.status).toBe(202); // 202 Accepted
    expect(res.body.success).toBe(true);
    expect(res.body.data.documentId).toBeTruthy();
    expect(res.body.data.documentType).toBe('INCOME_CERTIFICATE');
  });

  // AI Assistant Chat & Explain
  it('AI Assistant: should answer chat queries and explain eligibility', async () => {
    const chatRes = await request(app)
      .post('/api/ai/chat')
      .set('Authorization', studentToken)
      .send({
        message: 'What documents do I need to prepare?',
      });

    expect(chatRes.status).toBe(200);
    expect(chatRes.body.success).toBe(true);
    expect(chatRes.body.data.content).toBeTruthy();
    expect(chatRes.body.data.toolsUsed.length).toBeGreaterThan(0);

    const explainRes = await request(app)
      .post('/api/ai/explain-eligibility/sch-mahadbt-post-matric-obc')
      .set('Authorization', studentToken);

    expect(explainRes.status).toBe(200);
    expect(explainRes.body.data.status).toBeTruthy();
    expect(explainRes.body.data.checks.length).toBeGreaterThan(0);
  });
});
