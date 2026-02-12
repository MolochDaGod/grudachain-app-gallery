import { z } from 'zod';
import { insertAppSchema, apps } from './schema';

export const errorSchemas = {
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  apps: {
    list: {
      method: 'GET' as const,
      path: '/api/apps' as const,
      responses: {
        200: z.array(z.custom<typeof apps.$inferSelect>()),
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
