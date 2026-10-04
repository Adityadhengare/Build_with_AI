import * as admin from 'firebase-admin';
import fs from 'fs';
import { env } from './env';
import { logger } from '../utils/logger';

let isMockMode = env.USE_FIREBASE_EMULATOR_OR_MOCK;

// Check if Firebase Admin is already initialized
if (!admin.apps.length) {
  try {
    let credential = admin.credential.applicationDefault();

    if (env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      if (fs.existsSync(env.FIREBASE_SERVICE_ACCOUNT_KEY)) {
        const fileContent = fs.readFileSync(env.FIREBASE_SERVICE_ACCOUNT_KEY, 'utf-8');
        credential = admin.credential.cert(JSON.parse(fileContent));
      } else {
        // Maybe raw JSON string
        try {
          const parsed = JSON.parse(env.FIREBASE_SERVICE_ACCOUNT_KEY);
          credential = admin.credential.cert(parsed);
        } catch {
          logger.warn('FIREBASE_SERVICE_ACCOUNT_KEY provided is neither a valid file path nor JSON string');
        }
      }
    }

    admin.initializeApp({
      credential,
      projectId: env.FIREBASE_PROJECT_ID,
      storageBucket: env.FIREBASE_STORAGE_BUCKET,
    });
    logger.info('Firebase Admin initialized successfully with Project ID', {
      projectId: env.FIREBASE_PROJECT_ID,
    });
  } catch (error) {
    logger.warn('Firebase Admin live credentials not available, enabling local mock/emulator adapter', {
      error: (error as Error).message,
    });
    isMockMode = true;
  }
}

// In-Memory Store for Mock/Local Mode (Ensures zero setup friction for tests & local dev)
export class MockFirestoreStore {
  private static instance: MockFirestoreStore;
  private data: Map<string, any> = new Map();

  private constructor() {}

  public static getInstance(): MockFirestoreStore {
    if (!MockFirestoreStore.instance) {
      MockFirestoreStore.instance = new MockFirestoreStore();
    }
    return MockFirestoreStore.instance;
  }

  public get(path: string): any {
    return this.data.get(path);
  }

  public set(path: string, val: any): void {
    this.data.set(path, JSON.parse(JSON.stringify(val)));
  }

  public delete(path: string): void {
    this.data.delete(path);
  }

  public query(prefix: string): any[] {
    const results: any[] = [];
    for (const [key, value] of this.data.entries()) {
      if (key.startsWith(prefix) && key !== prefix) {
        // Ensure only immediate collection children or matched prefix
        results.push(value);
      }
    }
    return results;
  }

  public clear(): void {
    this.data.clear();
  }
}

export const mockStore = MockFirestoreStore.getInstance();

export const firebaseAdmin = admin;
export const isUsingMockFirebase = () => isMockMode;
export const setMockMode = (val: boolean) => {
  isMockMode = val;
};

export const getFirestoreDb = () => {
  if (isMockMode) {
    return null;
  }
  return admin.firestore();
};

export const getFirebaseAuth = () => {
  if (isMockMode) {
    return null;
  }
  return admin.auth();
};

export const getFirebaseStorage = () => {
  if (isMockMode) {
    return null;
  }
  return admin.storage();
};
