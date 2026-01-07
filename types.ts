
export enum RequestStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}

export enum ActivityType {
  WATCH_AD = 'WATCH_AD',
  DAILY_CHECKIN = 'DAILY_CHECKIN',
  REFERRAL = 'REFERRAL',
  WITHDRAWAL = 'WITHDRAWAL'
}

export interface User {
  uid: string;
  name: string;
  email: string;
  points: number;
  photoUrl?: string;
  createdAt: number;
  isAdmin?: boolean;
}

export interface WithdrawRequest {
  id: string;
  userId: string;
  userEmail: string;
  points: number;
  status: RequestStatus;
  method: string;
  code?: string;
  createdAt: number;
  amountInInr: number;
  adminNote?: string;
}

export interface Activity {
  id: string;
  userId: string;
  type: ActivityType;
  points: number;
  title: string;
  createdAt: number;
  status: 'Completed' | 'Pending' | 'Rejected' | 'Bonus';
}
