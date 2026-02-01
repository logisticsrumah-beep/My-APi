
export type Role = 'ADMIN' | 'MANAGER' | 'OPERATOR' | 'USER';
export type Language = 'EN' | 'AR';
export type RequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface User {
  id: string;
  username: string;
  password?: string;
  role: Role;
  branchId: string;
  email?: string;
  contactNumber: string;
  status: RequestStatus;
}

export interface Branch {
  id: string;
  name: string;
  code: string;
  location: string;
  managerId: string;
}

export interface Equipment {
  id: string;
  type: string;
  companyId: string;
  make: string;
  model: string;
  serialNumber: string;
  power: string;
  branchId: string;
  condition: string;
  imageUrl: string;
}

export interface TransferRequest {
  id: string;
  equipmentId: string;
  sourceBranchId: string;
  targetBranchId: string;
  reason: string;
  status: RequestStatus;
  rejectionReason?: string;
  timestamp: number;
}

export interface RepairRequest {
  id: string;
  equipmentId: string;
  branchId: string;
  targetBranchId: string;
  faults: string[]; // Up to 10 typed fault descriptions
  remarks: string;
  status: RequestStatus;
  timestamp: number;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  link: string;
  read: boolean;
  timestamp: number;
}

export type Translations = {
  [key in Language]: {
    [key: string]: string;
  };
};
