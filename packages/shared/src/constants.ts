// User Roles
export enum UserRole {
  ADMIN = 'admin',
  MEMBER = 'member',
}

// Error Codes
export enum ErrorCode {
  AUTH_REQUIRED = 'AUTH_REQUIRED',
  AUTH_INVALID = 'AUTH_INVALID',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  FORBIDDEN = 'FORBIDDEN',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
}

// Activity Types
export enum ActivityType {
  NOTE = 'note',
  CALL = 'call',
  MEETING = 'meeting',
}

// Invoice Status
export enum InvoiceStatus {
  DRAFT = 'draft',
  SENT = 'sent',
  PAID = 'paid',
  VOID = 'void',
}

// Payment Method
export enum PaymentMethod {
  BANK_TRANSFER = 'bank_transfer',
  CARD = 'card',
  CASH = 'cash',
  OTHER = 'other',
}

// Default Currency
export const DEFAULT_CURRENCY = 'EUR';
