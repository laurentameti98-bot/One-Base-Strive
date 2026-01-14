// Constants
export { UserRole, ErrorCode, ActivityType, DEFAULT_CURRENCY } from './constants.js';
export type {
  UserRole as UserRoleType,
  ErrorCode as ErrorCodeType,
  ActivityType as ActivityTypeType,
} from './constants.js';

// Auth Schemas
export {
  LoginRequestSchema,
  LoginResponseSchema,
  MeResponseSchema,
  UserSchema,
} from './schemas/auth.js';
export type { LoginRequest, LoginResponse, MeResponse, User } from './schemas/auth.js';

// Common Schemas
export {
  SuccessResponseSchema,
  ErrorResponseSchema,
  HealthResponseSchema,
} from './schemas/common.js';
export type { ErrorResponse, HealthResponse } from './schemas/common.js';

// Accounts
export {
  CreateAccountSchema,
  UpdateAccountSchema,
  AccountSchema,
} from './schemas/accounts.js';
export type { CreateAccountRequest, UpdateAccountRequest, Account } from './schemas/accounts.js';

// Contacts
export {
  CreateContactSchema,
  UpdateContactSchema,
  ContactSchema,
} from './schemas/contacts.js';
export type { CreateContactRequest, UpdateContactRequest, Contact } from './schemas/contacts.js';

// Deals
export {
  CreateDealSchema,
  UpdateDealSchema,
  DealSchema,
  DealStageSchema,
} from './schemas/deals.js';
export type {
  CreateDealRequest,
  UpdateDealRequest,
  Deal,
  DealStage,
} from './schemas/deals.js';

// Activities
export {
  CreateActivitySchema,
  UpdateActivitySchema,
  ActivitySchema,
} from './schemas/activities.js';
export type {
  CreateActivityRequest,
  UpdateActivityRequest,
  Activity,
} from './schemas/activities.js';
