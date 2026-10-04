'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { 
  Bell, 
  Clock, 
  FileText, 
  Sparkles, 
  CheckCheck, 
  ExternalLink
} from 'lucide-react';
import { notificationsApi } from '@/lib/api/notifications';
import { NotificationItem } from '@/types/application';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadNotifs() {
      setIsLoading(true);
      const data = await notificationsApi.getNotifications();
      setNotifications(data);
      setIsLoading(false);
    }
    loadNotifs();
  }, []);

  const handleMarkAllRead = async () => {
    await notificationsApi.markAllAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const handleMarkRead = async (id: string) => {
    await notificationsApi.markAsRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'DEADLINE_ALERT':
        return <Clock className="w-5 h-5 text-[#B45309]" />;
      case 'DOCUMENT_ALERT':
        return <FileText className="w-5 h-5 text-[#1D4ED8]" />;
      case 'NEW_MATCH':
        return <Sparkles className="w-5 h-5 text-[#15803D]" />;
      default:
        return <Bell className="w-5 h-5 text-[#475569]" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 md:py-8 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#0F294A]">Notifications</h1>
          <p className="text-xs md:text-sm text-[#475569] mt-0.5">
            Deadline alerts, automated document extraction results, and scheme updates.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleMarkAllRead}
          className="flex items-center gap-1.5"
        >
          <CheckCheck className="w-4 h-4 text-[#15803D]" />
          <span>Mark all as read</span>
        </Button>
      </div>

      <div className="space-y-3">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-20 bg-white border border-[#E2E8F0] rounded-xl animate-pulse" />
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="bg-white border border-dashed border-[#CBD5E1] p-12 rounded-xl text-center">
            <Bell className="w-10 h-10 text-[#94A3B8] mx-auto mb-2" />
            <p className="text-sm font-bold text-[#0F294A]">You&apos;re all caught up!</p>
            <p className="text-xs text-[#64748B] mt-1">No new alerts or deadline reminders right now.</p>
          </div>
        ) : (
          notifications.map((item) => (
            <div
              key={item.id}
              onClick={() => handleMarkRead(item.id)}
              className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-4 ${
                item.isRead
                  ? 'bg-white border-[#E2E8F0] opacity-80'
                  : 'bg-[#EFF4FF] border-[#BFDBFE] shadow-xs'
              }`}
            >
              <div className="w-10 h-10 rounded-lg bg-white border border-[#E2E8F0] flex items-center justify-center shrink-0">
                {getIcon(item.type)}
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-bold text-[#0F294A] leading-snug">{item.title}</h3>
                  <span className="text-[11px] text-[#94A3B8] shrink-0">{item.timestamp}</span>
                </div>
                <p className="text-xs text-[#475569] mt-1 leading-relaxed">{item.message}</p>
                {item.linkUrl && (
                  <Link
                    href={item.linkUrl}
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#1D4ED8] hover:underline mt-2"
                  >
                    <span>View Details</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                )}
              </div>

              {!item.isRead && (
                <span className="w-2.5 h-2.5 rounded-full bg-[#1D4ED8] shrink-0 self-center"></span>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
