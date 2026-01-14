// Constants
export { UserRole, ErrorCode, ActivityType, InvoiceStatus, PaymentMethod, DEFAULT_CURRENCY } from './constants.js';
export type {
  UserRole as UserRoleType,
  ErrorCode as ErrorCodeType,
  ActivityType as ActivityTypeType,
  InvoiceStatus as InvoiceStatusType,
  PaymentMethod as PaymentMethodType,
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
  AccountResponseSchema,
  AccountsResponseSchema,
} from './schemas/accounts.js';
export type {
  CreateAccountRequest,
  UpdateAccountRequest,
  Account,
  AccountResponse,
  AccountsResponse,
} from './schemas/accounts.js';

// Contacts
export {
  CreateContactSchema,
  UpdateContactSchema,
  ContactSchema,
  ContactResponseSchema,
  ContactsResponseSchema,
} from './schemas/contacts.js';
export type {
  CreateContactRequest,
  UpdateContactRequest,
  Contact,
  ContactResponse,
  ContactsResponse,
} from './schemas/contacts.js';

// Deals
export {
  CreateDealSchema,
  UpdateDealSchema,
  DealSchema,
  DealStageSchema,
  DealResponseSchema,
  DealsResponseSchema,
  DealStageResponseSchema,
  DealStagesResponseSchema,
} from './schemas/deals.js';
export type {
  CreateDealRequest,
  UpdateDealRequest,
  Deal,
  DealStage,
  DealResponse,
  DealsResponse,
  DealStageResponse,
  DealStagesResponse,
} from './schemas/deals.js';

// Activities
export {
  CreateActivitySchema,
  UpdateActivitySchema,
  ActivitySchema,
  ActivityResponseSchema,
  ActivitiesResponseSchema,
} from './schemas/activities.js';
export type {
  CreateActivityRequest,
  UpdateActivityRequest,
  Activity,
  ActivityResponse,
  ActivitiesResponse,
} from './schemas/activities.js';

// Invoice Customers
export {
  CreateInvoiceCustomerSchema,
  UpdateInvoiceCustomerSchema,
  InvoiceCustomerSchema,
  InvoiceCustomerResponseSchema,
  InvoiceCustomersResponseSchema,
} from './schemas/invoiceCustomers.js';
export type {
  CreateInvoiceCustomerRequest,
  UpdateInvoiceCustomerRequest,
  InvoiceCustomer,
  InvoiceCustomerResponse,
  InvoiceCustomersResponse,
} from './schemas/invoiceCustomers.js';

// Invoice Items
export {
  CreateInvoiceItemSchema,
  UpdateInvoiceItemSchema,
  InvoiceItemSchema,
  InvoiceItemResponseSchema,
  InvoiceItemsResponseSchema,
} from './schemas/invoiceItems.js';
export type {
  CreateInvoiceItemRequest,
  UpdateInvoiceItemRequest,
  InvoiceItem,
  InvoiceItemResponse,
  InvoiceItemsResponse,
} from './schemas/invoiceItems.js';

// Invoices
export {
  CreateInvoiceSchema,
  UpdateInvoiceSchema,
  InvoiceSchema,
  InvoiceWithItemsSchema,
  InvoiceResponseSchema,
  InvoicesResponseSchema,
} from './schemas/invoices.js';
export type {
  CreateInvoiceRequest,
  UpdateInvoiceRequest,
  Invoice,
  InvoiceWithItems,
  InvoiceResponse,
  InvoicesResponse,
} from './schemas/invoices.js';
