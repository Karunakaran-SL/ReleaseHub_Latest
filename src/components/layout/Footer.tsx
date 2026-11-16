// SPDX-License-Identifier: AGPL-3.0-only
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import type { AuditLog } from '@/lib/definitions';
import { formatDistanceToNow, parseISO } from 'date-fns';

function TimeAgo({ dateString }: { dateString: string }) {
  const [timeAgo, setTimeAgo] = useState('');

  useEffect(() => {
    try {
      setTimeAgo(formatDistanceToNow(parseISO(dateString), { addSuffix: true }));
    } catch {
      setTimeAgo('');
    }
  }, [dateString]);

  if (!timeAgo) return null;

  return <span>({timeAgo})</span>;
}

export function Footer() {
  const [latestLog, setLatestLog] = useState<AuditLog | null>(null);
  const [loading, setLoading] = useState(true);

  const sourceCodeUrl =
    process.env.NEXT_PUBLIC_SOURCE_CODE_URL ||
    'https://github.com/Karunakaran-SL/ReleaseHub_Latest';

  useEffect(() => {
    async function fetchLatestLog() {
      try {
        const res = await fetch('/api/audits');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setLatestLog(data[0]);
          }
        }
      } catch (error) {
        console.error('Failed to fetch latest audit log:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchLatestLog();
  }, []);

  const formatLogMessage = (log: AuditLog) => {
    let actionText = '';
    switch (log.action) {
      case 'CREATE':
        actionText = 'created';
        break;
      case 'UPDATE':
        actionText = 'updated';
        break;
      case 'DELETE':
        actionText = 'deleted';
        break;
    }
    return `${log.user} ${actionText} the ${log.entity}: "${log.comment}"`;
  };

  return (
    <footer className="fixed bottom-0 left-0 z-40 w-full border-t bg-background text-foreground">
      <div className="flex min-h-12 flex-wrap items-center justify-between gap-2 px-4 py-1.5 md:px-6 text-xs md:text-sm text-muted-foreground">
        <div className="flex flex-wrap items-center gap-3">
          <p>ReleaseHub is Open Source software licensed under AGPL-3.0.</p>
          <span>•</span>
          <a
            href={sourceCodeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-primary hover:underline"
          >
            Get Source Code (AGPL-3.0 Section 13)
          </a>
          <div className="hidden lg:flex items-center gap-2 ml-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <span>All Systems Operational</span>
          </div>
        </div>
        <div className="flex items-center">
          {loading ? (
            <span>Loading latest activity...</span>
          ) : latestLog ? (
            <Link href="/audits" className="hover:underline hover:text-foreground transition-colors">
              <span className="font-semibold">Latest Activity:</span> {formatLogMessage(latestLog)}{' '}
              <TimeAgo dateString={latestLog.timestamp} />
            </Link>
          ) : (
            <span>No recent activity.</span>
          )}
        </div>
      </div>
    </footer>
  );
}

export default Footer;

