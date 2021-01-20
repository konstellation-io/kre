export enum NotificationType {
  MESSAGE = 'MESSAGE',
  ERROR = 'ERROR'
}

export interface Notification {
  id: string;
  message: string;
  timeout: number;
  type: NotificationType;
  typeLabel: string | null;
  to: string;
}
