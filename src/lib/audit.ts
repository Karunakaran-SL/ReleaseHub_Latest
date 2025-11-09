import type { AuditLog } from './definitions';

interface AuditEvent {
    action: 'CREATE' | 'UPDATE' | 'DELETE';
    entity: string;
    entityId: string;
    comment: string;
    user: string;
}

export async function logAuditEvent(event: Omit<AuditEvent, 'user'> & { user?: string }): Promise<void> {
  // Simulate fetching the current user if not provided
  // In a real app, you'd get this from the session
  const user = event.user || (await (await fetch('/api/auth/session')).json()).user?.name || 'system';

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/audits`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ...event, user }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Failed to log audit event:', errorData.message);
    }
  } catch (error) {
    console.error('Error logging audit event:', error);
  }
}
