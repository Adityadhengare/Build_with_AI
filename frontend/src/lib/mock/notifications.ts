import { NotificationItem } from '@/types/application';

export const MOCK_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'Upcoming Deadline Alert',
    message: 'Tata Trusts Engineering Scholarship application closes in 21 days (25 Oct 2026). Ensure your Bonafide Certificate is stamped.',
    type: 'DEADLINE_ALERT',
    timestamp: '2 hours ago',
    isRead: false,
    linkUrl: '/scholarships/sch-tata-trusts-engg',
  },
  {
    id: 'notif-2',
    title: 'Document AI Extraction Completed',
    message: 'Gemini has processed your College Bonafide Certificate. Please review and confirm the extracted institution seal.',
    type: 'DOCUMENT_ALERT',
    timestamp: '5 hours ago',
    isRead: false,
    linkUrl: '/documents',
  },
  {
    id: 'notif-3',
    title: 'New High-Match Scholarship Detected',
    message: 'Rajarshi Shahu Maharaj Yojna (MahaDBT) opened applications for AY 2026-27. You have a 94% profile match.',
    type: 'NEW_MATCH',
    timestamp: '1 day ago',
    isRead: true,
    linkUrl: '/scholarships/sch-mahadbt-ebc',
  },
  {
    id: 'notif-4',
    title: 'MahaDBT Application Status Update',
    message: 'Your application #MH-DBT-2026-89104 was scrutinized and forwarded to the District Nodal Officer.',
    type: 'APPLICATION_UPDATE',
    timestamp: '3 days ago',
    isRead: true,
    linkUrl: '/applications',
  }
];
