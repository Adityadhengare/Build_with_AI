export type LogLevel = 'info' | 'warn' | 'error' | 'debug';

const SENSITIVE_PATTERNS = [
  /password/i,
  /secret/i,
  /token/i,
  /authorization/i,
  /key/i,
  /aadhaar/i,
  /cookie/i,
];

function sanitize(data: unknown): unknown {
  if (data === null || data === undefined) return data;
  if (typeof data === 'string') {
    // Redact 12-digit numbers (like Aadhaar)
    return data.replace(/\b\d{4}\s?\d{4}\s?\d{4}\b/g, '[REDACTED_AADHAAR]');
  }
  if (Array.isArray(data)) {
    return data.map((item) => sanitize(item));
  }
  if (typeof data === 'object') {
    const clean: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
      if (SENSITIVE_PATTERNS.some((pat) => pat.test(key))) {
        clean[key] = '[REDACTED]';
      } else {
        clean[key] = sanitize(value);
      }
    }
    return clean;
  }
  return data;
}

export const logger = {
  info(message: string, meta?: Record<string, unknown>) {
    const entry = {
      level: 'info',
      timestamp: new Date().toISOString(),
      message,
      ...(meta ? (sanitize(meta) as Record<string, unknown>) : {}),
    };
    // eslint-disable-next-line no-console
    console.log(JSON.stringify(entry));
  },

  warn(message: string, meta?: Record<string, unknown>) {
    const entry = {
      level: 'warn',
      timestamp: new Date().toISOString(),
      message,
      ...(meta ? (sanitize(meta) as Record<string, unknown>) : {}),
    };
    // eslint-disable-next-line no-console
    console.warn(JSON.stringify(entry));
  },

  error(message: string, meta?: Record<string, unknown>) {
    const entry = {
      level: 'error',
      timestamp: new Date().toISOString(),
      message,
      ...(meta ? (sanitize(meta) as Record<string, unknown>) : {}),
    };
    // eslint-disable-next-line no-console
    console.error(JSON.stringify(entry));
  },

  debug(message: string, meta?: Record<string, unknown>) {
    if (process.env.NODE_ENV !== 'production') {
      const entry = {
        level: 'debug',
        timestamp: new Date().toISOString(),
        message,
        ...(meta ? (sanitize(meta) as Record<string, unknown>) : {}),
      };
      // eslint-disable-next-line no-console
      console.debug(JSON.stringify(entry));
    }
  },
};
