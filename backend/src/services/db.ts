import { getFirestoreDb, isUsingMockFirebase, setMockMode, mockStore } from '../config/firebase';
import {
  StudentProfile,
  Scholarship,
  StudentDocument,
  ApplicationRecord,
  SavedScholarship,
  NotificationItem,
  AuditLogEntry,
  UserRole,
} from '../types';

async function safeDbOp<T>(
  firestoreFn: () => Promise<T>,
  mockFallbackFn: () => Promise<T> | T
): Promise<T> {
  if (isUsingMockFirebase()) {
    return mockFallbackFn();
  }
  try {
    const db = getFirestoreDb();
    if (!db) return mockFallbackFn();
    return await firestoreFn();
  } catch (error: any) {
    if (process.env.NODE_ENV === 'test') {
      if (
        error.message?.includes('Could not load the default credentials') ||
        error.message?.includes('credential') ||
        error.code === 7 ||
        error.code === 14
      ) {
        setMockMode(true);
        return mockFallbackFn();
      }
    }
    throw error;
  }
}

export const dbService = {
  // USER COLLECTION (users/{uid})
  async getUser(uid: string): Promise<{ uid: string; email?: string; role: UserRole } | null> {
    return safeDbOp(
      async () => {
        const snap = await getFirestoreDb()!.collection('users').doc(uid).get();
        return snap.exists ? (snap.data() as { uid: string; email?: string; role: UserRole }) : null;
      },
      () => mockStore.get(`users/${uid}`) || null
    );
  },

  async setUser(uid: string, data: { email?: string; role: UserRole; createdAt?: string }): Promise<void> {
    const payload = {
      uid,
      ...data,
      updatedAt: new Date().toISOString(),
    };
    return safeDbOp(
      async () => {
        await getFirestoreDb()!.collection('users').doc(uid).set(payload, { merge: true });
      },
      () => {
        mockStore.set(`users/${uid}`, payload);
      }
    );
  },

  // STUDENT PROFILE (users/{uid}/profile/main)
  async getProfile(uid: string): Promise<StudentProfile | null> {
    return safeDbOp(
      async () => {
        const snap = await getFirestoreDb()!
          .collection('users')
          .doc(uid)
          .collection('profile')
          .doc('main')
          .get();
        return snap.exists ? (snap.data() as StudentProfile) : null;
      },
      () => mockStore.get(`users/${uid}/profile/main`) || null
    );
  },

  async saveProfile(uid: string, profile: StudentProfile): Promise<void> {
    return safeDbOp(
      async () => {
        await getFirestoreDb()!
          .collection('users')
          .doc(uid)
          .collection('profile')
          .doc('main')
          .set(profile, { merge: true });
      },
      () => {
        mockStore.set(`users/${uid}/profile/main`, profile);
      }
    );
  },

  // SCHOLARSHIPS COLLECTION (scholarships/{scholarshipId})
  async getScholarships(filters?: {
    search?: string;
    state?: string;
    category?: string;
    educationLevel?: string;
    providerType?: string;
    status?: string;
    gender?: string;
    maxIncome?: number;
    minPercentage?: number;
  }): Promise<Scholarship[]> {
    const list: Scholarship[] = await safeDbOp(
      async () => {
        const snap = await getFirestoreDb()!.collection('scholarships').get();
        return snap.docs.map((doc) => doc.data() as Scholarship);
      },
      () => mockStore.query('scholarships/')
    );

    if (!filters) return list;

    // Apply filtering in memory
    return list.filter((s) => {
      // Status filter
      if (filters.status && filters.status !== 'ALL' && s.status !== filters.status) {
        return false;
      }

      // Provider Type filter
      if (filters.providerType && filters.providerType !== 'ALL' && s.provider.type !== filters.providerType) {
        return false;
      }

      // State filter
      if (filters.state && filters.state !== 'ALL') {
        const allowedStates = s.eligibilityRules?.allowedStates || ['ALL'];
        const matchesState =
          allowedStates.includes('ALL') ||
          allowedStates.includes(filters.state) ||
          s.provider.state === filters.state;
        if (!matchesState) return false;
      }

      // Category filter
      if (filters.category && filters.category !== 'ALL') {
        const allowedCategories = s.eligibilityRules?.allowedCategories || [];
        if (allowedCategories.length > 0 && !allowedCategories.includes(filters.category)) {
          return false;
        }
      }

      // Education Level filter
      if (filters.educationLevel && filters.educationLevel !== 'ALL') {
        const allowedEdu = s.eligibilityRules?.allowedEducationLevels || ['ALL'];
        if (!allowedEdu.includes('ALL') && !allowedEdu.includes(filters.educationLevel)) {
          return false;
        }
      }

      // Gender filter
      if (filters.gender && filters.gender !== 'ALL') {
        const allowedGenders = s.eligibilityRules?.allowedGenders || ['ALL'];
        if (!allowedGenders.includes('ALL') && !allowedGenders.includes(filters.gender)) {
          return false;
        }
      }

      // Search keyword filter
      if (filters.search) {
        const q = filters.search.toLowerCase();
        const inTitle = s.title.toLowerCase().includes(q);
        const inDesc = s.description.toLowerCase().includes(q);
        const inProvider = s.provider.name.toLowerCase().includes(q);
        const inTags = s.tags?.some((t) => t.toLowerCase().includes(q)) ?? false;
        if (!inTitle && !inDesc && !inProvider && !inTags) {
          return false;
        }
      }

      return true;
    });
  },

  async getScholarshipById(id: string): Promise<Scholarship | null> {
    return safeDbOp(
      async () => {
        const snap = await getFirestoreDb()!.collection('scholarships').doc(id).get();
        if (snap.exists) {
          return snap.data() as Scholarship;
        }
        const querySnap = await getFirestoreDb()!
          .collection('scholarships')
          .where('slug', '==', id)
          .limit(1)
          .get();
        if (!querySnap.empty) {
          return querySnap.docs[0].data() as Scholarship;
        }
        return null;
      },
      () => {
        const byId = mockStore.get(`scholarships/${id}`);
        if (byId) return byId;
        const all: Scholarship[] = mockStore.query('scholarships/');
        return all.find((s) => s.slug === id) || null;
      }
    );
  },

  async setScholarship(id: string, scholarship: Scholarship): Promise<void> {
    return safeDbOp(
      async () => {
        await getFirestoreDb()!.collection('scholarships').doc(id).set(scholarship, { merge: true });
      },
      () => {
        mockStore.set(`scholarships/${id}`, scholarship);
      }
    );
  },

  async deleteScholarship(id: string): Promise<boolean> {
    return safeDbOp(
      async () => {
        await getFirestoreDb()!.collection('scholarships').doc(id).delete();
        return true;
      },
      () => {
        mockStore.delete(`scholarships/${id}`);
        return true;
      }
    );
  },

  // DOCUMENTS COLLECTION (users/{uid}/documents/{docId})
  async getDocuments(uid: string): Promise<StudentDocument[]> {
    return safeDbOp(
      async () => {
        const snap = await getFirestoreDb()!
          .collection('users')
          .doc(uid)
          .collection('documents')
          .orderBy('uploadedAt', 'desc')
          .get();
        return snap.docs.map((doc) => doc.data() as StudentDocument);
      },
      () => mockStore.query(`users/${uid}/documents/`)
    );
  },

  async getDocumentById(uid: string, docId: string): Promise<StudentDocument | null> {
    return safeDbOp(
      async () => {
        const snap = await getFirestoreDb()!
          .collection('users')
          .doc(uid)
          .collection('documents')
          .doc(docId)
          .get();
        return snap.exists ? (snap.data() as StudentDocument) : null;
      },
      () => mockStore.get(`users/${uid}/documents/${docId}`) || null
    );
  },

  async saveDocument(uid: string, doc: StudentDocument): Promise<void> {
    return safeDbOp(
      async () => {
        await getFirestoreDb()!
          .collection('users')
          .doc(uid)
          .collection('documents')
          .doc(doc.id)
          .set(doc, { merge: true });
      },
      () => {
        mockStore.set(`users/${uid}/documents/${doc.id}`, doc);
      }
    );
  },

  async deleteDocument(uid: string, docId: string): Promise<boolean> {
    return safeDbOp(
      async () => {
        await getFirestoreDb()!
          .collection('users')
          .doc(uid)
          .collection('documents')
          .doc(docId)
          .delete();
        return true;
      },
      () => {
        mockStore.delete(`users/${uid}/documents/${docId}`);
        return true;
      }
    );
  },

  // SAVED SCHOLARSHIPS (users/{uid}/savedScholarships/{scholarshipId})
  async getSavedScholarships(uid: string): Promise<SavedScholarship[]> {
    return safeDbOp(
      async () => {
        const snap = await getFirestoreDb()!
          .collection('users')
          .doc(uid)
          .collection('savedScholarships')
          .get();
        return snap.docs.map((doc) => doc.data() as SavedScholarship);
      },
      () => mockStore.query(`users/${uid}/savedScholarships/`)
    );
  },

  async saveScholarshipBookmark(uid: string, scholarshipId: string, notes?: string): Promise<void> {
    const item: SavedScholarship = {
      scholarshipId,
      userId: uid,
      savedAt: new Date().toISOString(),
      notes,
    };
    return safeDbOp(
      async () => {
        await getFirestoreDb()!
          .collection('users')
          .doc(uid)
          .collection('savedScholarships')
          .doc(scholarshipId)
          .set(item, { merge: true });
      },
      () => {
        mockStore.set(`users/${uid}/savedScholarships/${scholarshipId}`, item);
      }
    );
  },

  async removeSavedScholarship(uid: string, scholarshipId: string): Promise<boolean> {
    return safeDbOp(
      async () => {
        await getFirestoreDb()!
          .collection('users')
          .doc(uid)
          .collection('savedScholarships')
          .doc(scholarshipId)
          .delete();
        return true;
      },
      () => {
        mockStore.delete(`users/${uid}/savedScholarships/${scholarshipId}`);
        return true;
      }
    );
  },

  // APPLICATIONS (users/{uid}/applications/{appId})
  async getApplications(uid: string): Promise<ApplicationRecord[]> {
    return safeDbOp(
      async () => {
        const snap = await getFirestoreDb()!
          .collection('users')
          .doc(uid)
          .collection('applications')
          .orderBy('lastUpdated', 'desc')
          .get();
        return snap.docs.map((doc) => doc.data() as ApplicationRecord);
      },
      () => mockStore.query(`users/${uid}/applications/`)
    );
  },

  async getApplicationById(uid: string, appId: string): Promise<ApplicationRecord | null> {
    return safeDbOp(
      async () => {
        const snap = await getFirestoreDb()!
          .collection('users')
          .doc(uid)
          .collection('applications')
          .doc(appId)
          .get();
        return snap.exists ? (snap.data() as ApplicationRecord) : null;
      },
      () => mockStore.get(`users/${uid}/applications/${appId}`) || null
    );
  },

  async saveApplication(uid: string, app: ApplicationRecord): Promise<void> {
    return safeDbOp(
      async () => {
        await getFirestoreDb()!
          .collection('users')
          .doc(uid)
          .collection('applications')
          .doc(app.id)
          .set(app, { merge: true });
      },
      () => {
        mockStore.set(`users/${uid}/applications/${app.id}`, app);
      }
    );
  },

  async deleteApplication(uid: string, appId: string): Promise<boolean> {
    return safeDbOp(
      async () => {
        await getFirestoreDb()!
          .collection('users')
          .doc(uid)
          .collection('applications')
          .doc(appId)
          .delete();
        return true;
      },
      () => {
        mockStore.delete(`users/${uid}/applications/${appId}`);
        return true;
      }
    );
  },

  // NOTIFICATIONS (users/{uid}/notifications/{notifId})
  async getNotifications(uid: string): Promise<NotificationItem[]> {
    return safeDbOp(
      async () => {
        const snap = await getFirestoreDb()!
          .collection('users')
          .doc(uid)
          .collection('notifications')
          .orderBy('timestamp', 'desc')
          .get();
        return snap.docs.map((doc) => doc.data() as NotificationItem);
      },
      () => mockStore.query(`users/${uid}/notifications/`)
    );
  },

  async saveNotification(uid: string, notif: NotificationItem): Promise<void> {
    return safeDbOp(
      async () => {
        await getFirestoreDb()!
          .collection('users')
          .doc(uid)
          .collection('notifications')
          .doc(notif.id)
          .set(notif, { merge: true });
      },
      () => {
        mockStore.set(`users/${uid}/notifications/${notif.id}`, notif);
      }
    );
  },

  async markNotificationRead(uid: string, notifId: string): Promise<boolean> {
    return safeDbOp(
      async () => {
        await getFirestoreDb()!
          .collection('users')
          .doc(uid)
          .collection('notifications')
          .doc(notifId)
          .update({ isRead: true });
        return true;
      },
      () => {
        const item: NotificationItem | undefined = mockStore.get(`users/${uid}/notifications/${notifId}`);
        if (item) {
          item.isRead = true;
          mockStore.set(`users/${uid}/notifications/${notifId}`, item);
          return true;
        }
        return false;
      }
    );
  },

  async markAllNotificationsRead(uid: string): Promise<boolean> {
    return safeDbOp(
      async () => {
        const snap = await getFirestoreDb()!
          .collection('users')
          .doc(uid)
          .collection('notifications')
          .where('isRead', '==', false)
          .get();
        const batch = getFirestoreDb()!.batch();
        snap.docs.forEach((doc) => {
          batch.update(doc.ref, { isRead: true });
        });
        await batch.commit();
        return true;
      },
      () => {
        const list: NotificationItem[] = mockStore.query(`users/${uid}/notifications/`);
        list.forEach((n) => {
          n.isRead = true;
          mockStore.set(`users/${uid}/notifications/${n.id}`, n);
        });
        return true;
      }
    );
  },

  // AUDIT LOGS (audit_logs/{logId})
  async addAuditLog(entry: AuditLogEntry): Promise<void> {
    return safeDbOp(
      async () => {
        await getFirestoreDb()!.collection('audit_logs').doc(entry.id).set(entry);
      },
      () => {
        mockStore.set(`audit_logs/${entry.id}`, entry);
      }
    );
  },

  async getAuditLogs(limit = 100): Promise<AuditLogEntry[]> {
    return safeDbOp(
      async () => {
        const snap = await getFirestoreDb()!
          .collection('audit_logs')
          .orderBy('timestamp', 'desc')
          .limit(limit)
          .get();
        return snap.docs.map((doc) => doc.data() as AuditLogEntry);
      },
      () => {
        const logs: AuditLogEntry[] = mockStore.query('audit_logs/');
        return logs
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
          .slice(0, limit);
      }
    );
  },

  // ALL STUDENTS (for admin directory)
  async getAllStudents(): Promise<StudentProfile[]> {
    return safeDbOp(
      async () => {
        const snap = await getFirestoreDb()!.collection('users').get();
        return snap.docs
          .map((doc) => doc.data() as StudentProfile)
          .filter((p) => Boolean(p && p.uid));
      },
      () => mockStore.query<StudentProfile>('users/').filter((p) => Boolean(p && p.uid))
    );
  },

  // ALL APPLICATIONS (for admin oversight)
  async getAllApplications(): Promise<ApplicationRecord[]> {
    return safeDbOp(
      async () => {
        const snap = await getFirestoreDb()!.collectionGroup('applications').get();
        return snap.docs.map((doc) => doc.data() as ApplicationRecord);
      },
      () => mockStore.query<ApplicationRecord>('users/applications/')
    );
  },

  // PLATFORM METRICS
  async getPlatformStats() {
    return safeDbOp(
      async () => {
        const db = getFirestoreDb()!;
        const [usersSnap, schOpenSnap, allSchSnap, appSnap, docSnap] = await Promise.all([
          db.collection('users').get(),
          db.collection('scholarships').where('status', '==', 'OPEN').get(),
          db.collection('scholarships').get(),
          db.collectionGroup('applications').get().catch(() => ({ size: 0, docs: [] })),
          db.collectionGroup('documents').get().catch(() => ({ size: 0, docs: [] })),
        ]);

        let totalFunds = 0;
        schOpenSnap.docs.forEach((d) => {
          const data = d.data() as Scholarship;
          totalFunds += data.estimatedAmountINR || 0;
        });

        const pendingDocs = docSnap.docs.filter((d: any) => d.data().status !== 'VERIFIED').length;

        const formatFunds = (amount: number) => {
          if (amount === 0) return '₹0';
          if (amount >= 10000000) {
            return `₹${(amount / 10000000).toFixed(1)} Cr`;
          }
          if (amount >= 100000) {
            return `₹${(amount / 100000).toFixed(1)} Lakhs`;
          }
          return `₹${amount.toLocaleString('en-IN')}`;
        };

        return {
          totalStudents: usersSnap.size,
          activeScholarships: schOpenSnap.size,
          totalScholarships: allSchSnap.size,
          totalFundsCatalogedINR: formatFunds(totalFunds),
          pendingVerifications: pendingDocs,
          activeApplicationsCount: appSnap.size,
        };
      },
      () => {
        const scholarships: Scholarship[] = mockStore.query('scholarships/');
        const open = scholarships.filter((s) => s.status === 'OPEN');
        const users: StudentProfile[] = mockStore.query('users/').filter((p) => Boolean(p && p.uid));
        const totalFunds = open.reduce((acc, s) => acc + (s.estimatedAmountINR || 0), 0);
        return {
          totalStudents: users.length,
          activeScholarships: open.length,
          totalScholarships: scholarships.length,
          totalFundsCatalogedINR: totalFunds >= 10000000 ? `₹${(totalFunds / 10000000).toFixed(1)} Cr` : `₹${totalFunds.toLocaleString('en-IN')}`,
          pendingVerifications: 0,
          activeApplicationsCount: 0,
        };
      }
    );
  },
};
