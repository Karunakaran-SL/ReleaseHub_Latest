import type { AuditLog } from './definitions';

export async function logAuditEvent(
    event: Omit<AuditLog, '_id' | 'timestamp'>
): Promise<void> {
  try {
    const response = await fetch('/api/audits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Failed to log audit event:', errorData.message);
    }
  } catch (error) {
    console.error('Error logging audit event:', error);
  }
}
