import { cookies, headers } from 'next/headers';
import type { AuditLog } from './definitions';

interface AuditEvent {
    action: 'CREATE' | 'UPDATE' | 'DELETE';
    entity: string;
    entityId: string;
    comment: string;
    user: string;
}

export async function logAuditEvent(event: Omit<AuditEvent, 'user'> & { user?: string }): Promise<void> {
  const sessionCookie = cookies().get('session')?.value;

  if (!sessionCookie) {
      console.error("Audit log failed: No session cookie found.");
      return;
  }
  
  const requestHeaders = headers();
  const host = requestHeaders.get('host');
  const protocol = requestHeaders.get('x-forwarded-proto') || 'http';
  const baseUrl = `${protocol}://${host}`;

  try {
    const response = await fetch(`${baseUrl}/api/audits`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Cookie': `session=${sessionCookie}`
      },
      body: JSON.stringify(event),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Failed to log audit event:', errorData.message || 'Unknown error');
    }
  } catch (error) {
    console.error('Error logging audit event:', error);
  }
}
