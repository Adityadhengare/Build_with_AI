export type ApplicationStatus =
  | 'SAVED'
  | 'NOT_STARTED'
  | 'IN_PROGRESS'
  | 'APPLIED'
  | 'UNDER_REVIEW'
  | 'SELECTED'
  | 'REJECTED';

export interface ApplicationRecord {
  id: string;
  scholarshipId: string;
  scholarshipTitle: string;
  providerName: string;
  providerType: string;
  status: ApplicationStatus;
  officialApplicationId?: string;
  appliedDate?: string;
  deadline: string;
  estimatedAmount: string;
  officialPortalUrl: string;
  notes?: string;
  lastUpdated: string;
}

export type NotificationType =
  | 'DEADLINE_ALERT'
  | 'DOCUMENT_ALERT'
  | 'NEW_MATCH'
  | 'APPLICATION_UPDATE';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  timestamp: string;
  isRead: boolean;
  linkUrl?: string;
}
