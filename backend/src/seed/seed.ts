import { dbService } from '../services/db';
import { SEED_SCHOLARSHIPS } from './seedData';
import { logger } from '../utils/logger';

export async function runSeed(): Promise<void> {
  logger.info('Starting ScholarSathi database seed operation...');

  // 1. Seed Official Government & Private Scholarships
  for (const scholarship of SEED_SCHOLARSHIPS) {
    await dbService.setScholarship(scholarship.id, scholarship);
    logger.info(`Seeded verified scholarship: ${scholarship.title} (${scholarship.id})`);
  }

  // 5. Seed Initial Audit Log
  await dbService.addAuditLog({
    id: `audit_seed_${Date.now()}`,
    actorUserId: 'system',
    action: 'DATABASE_INITIAL_SEED',
    entityType: 'SYSTEM',
    entityId: 'seed',
    details: {
      scholarshipsCount: SEED_SCHOLARSHIPS.length,
      timestamp: new Date().toISOString(),
    },
    timestamp: new Date().toISOString(),
  });

  logger.info('ScholarSathi database seed completed successfully!');
}

if (require.main === module) {
  runSeed()
    .then(() => process.exit(0))
    .catch((err) => {
      logger.error('Seed execution failed:', { error: (err as Error).message });
      process.exit(1);
    });
}
