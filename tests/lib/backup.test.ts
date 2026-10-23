import { describe, it, expect } from 'vitest';
import { validateBackupPayload } from '../../src/lib/backup';

describe('Backup & Disaster Recovery', () => {
  it('validates authentic backup format successfully', () => {
    const validPayload = {
      version: 1,
      exportedAt: '2026-10-16T12:00:00Z',
      source: 'CADENCE',
      data: {
        habits: [
          {
            id: 'h1',
            name: 'Hydration',
            categoryId: 'cat_body',
            trackingType: 'quantified',
            target: 3,
            step: 0.5,
            unit: 'L',
            schedule: { type: 'daily' },
            startDate: '2026-10-01',
            status: 'active',
          },
        ],
        habitLogs: [
          {
            id: 'l1',
            habitId: 'h1',
            localDate: '2026-10-16',
            value: 3,
            completionStatus: 'completed',
          },
        ],
        reflections: [],
        goals: [],
        milestones: [],
      },
    };

    const res = validateBackupPayload(validPayload);
    expect(res.valid).toBe(true);
    expect(res.payload?.data.habits).toHaveLength(1);
  });

  it('rejects malformed or empty data payloads', () => {
    expect(validateBackupPayload(null).valid).toBe(false);
    expect(validateBackupPayload('string').valid).toBe(false);
    expect(validateBackupPayload({}).valid).toBe(false);
    expect(validateBackupPayload({ data: {} }).valid).toBe(false);
    expect(validateBackupPayload({ data: { habits: 'not an array' } }).valid).toBe(false);
  });
});
