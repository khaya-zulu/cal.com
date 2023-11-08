//#region structure
type JsonPrimitive = null | number | string | boolean;
type Nested<V> = V | { [s: string]: V | Nested<V> } | Array<V | Nested<V>>;
type Json = Nested<JsonPrimitive>;
type Enum_public_access_scope = 'READ_BOOKING' | 'READ_PROFILE';
type Enum_public_app_categories = 'analytics' | 'automation' | 'calendar' | 'conferencing' | 'crm' | 'messaging' | 'other' | 'payment' | 'video' | 'web3';
type Enum_public_booking_status = 'accepted' | 'cancelled' | 'pending' | 'rejected';
type Enum_public_event_type_custom_input_type = 'bool' | 'number' | 'phone' | 'radio' | 'text' | 'textLong';
type Enum_public_feature_type = 'EXPERIMENT' | 'KILL_SWITCH' | 'OPERATIONAL' | 'PERMISSION' | 'RELEASE';
type Enum_public_identity_provider = 'CAL' | 'GOOGLE' | 'SAML';
type Enum_public_membership_role = 'ADMIN' | 'MEMBER' | 'OWNER';
type Enum_public_payment_option = 'HOLD' | 'ON_BOOKING';
type Enum_public_period_type = 'range' | 'rolling' | 'unlimited';
type Enum_public_redirect_type = 'team' | 'team-event-type' | 'user' | 'user-event-type';
type Enum_public_reminder_type = 'PENDING_BOOKING_CONFIRMATION';
type Enum_public_scheduling_type = 'collective' | 'managed' | 'roundRobin';
type Enum_public_time_unit = 'day' | 'hour' | 'minute';
type Enum_public_user_permission_role = 'ADMIN' | 'USER';
type Enum_public_webhook_trigger_events = 'BOOKING_CANCELLED' | 'BOOKING_CREATED' | 'BOOKING_PAID' | 'BOOKING_PAYMENT_INITIATED' | 'BOOKING_REJECTED' | 'BOOKING_REQUESTED' | 'BOOKING_RESCHEDULED' | 'FORM_SUBMITTED' | 'MEETING_ENDED' | 'RECORDING_READY';
type Enum_public_workflow_actions = 'EMAIL_ADDRESS' | 'EMAIL_ATTENDEE' | 'EMAIL_HOST' | 'SMS_ATTENDEE' | 'SMS_NUMBER' | 'WHATSAPP_ATTENDEE' | 'WHATSAPP_NUMBER';
type Enum_public_workflow_methods = 'EMAIL' | 'SMS' | 'WHATSAPP';
type Enum_public_workflow_templates = 'CANCELLED' | 'COMPLETED' | 'CUSTOM' | 'REMINDER' | 'RESCHEDULED';
type Enum_public_workflow_trigger_events = 'AFTER_EVENT' | 'BEFORE_EVENT' | 'EVENT_CANCELLED' | 'NEW_EVENT' | 'RESCHEDULE_EVENT';
interface Table_public_access_code {
  id: number;
  code: string;
  clientId: string | null;
  expiresAt: string;
  scopes: Enum_public_access_scope[] | null;
  userId: number | null;
  teamId: number | null;
}
interface Table_public_account {
  id: string;
  userId: number;
  type: string;
  provider: string;
  providerAccountId: string;
  refresh_token: string | null;
  access_token: string | null;
  expires_at: number | null;
  token_type: string | null;
  scope: string | null;
  id_token: string | null;
  session_state: string | null;
}
interface Table_public_api_key {
  id: string;
  userId: number;
  note: string | null;
  createdAt: string;
  expiresAt: string | null;
  lastUsedAt: string | null;
  hashedKey: string;
  appId: string | null;
  teamId: number | null;
}
interface Table_public_app {
  slug: string;
  dirName: string;
  keys: Json | null;
  categories: Enum_public_app_categories[] | null;
  createdAt: string;
  updatedAt: string;
  enabled: boolean;
}
interface Table_public_app_routing_forms_form {
  id: string;
  description: string | null;
  routes: Json | null;
  createdAt: string;
  updatedAt: string;
  name: string;
  fields: Json | null;
  userId: number;
  disabled: boolean;
  settings: Json | null;
  teamId: number | null;
  position: number;
}
interface Table_public_app_routing_forms_form_response {
  id: number;
  formFillerId: string;
  formId: string;
  response: Json;
  createdAt: string;
}
interface Table_public_attendee {
  id: number;
  email: string;
  name: string;
  timeZone: string;
  bookingId: number | null;
  locale: string | null;
}
interface Table_public_availability {
  id: number;
  userId: number | null;
  eventTypeId: number | null;
  days: number[] | null;
  date: string | null;
  startTime: string;
  endTime: string;
  scheduleId: number | null;
}
interface Table_public_booking {
  id: number;
  uid: string;
  userId: number | null;
  eventTypeId: number | null;
  title: string;
  description: string | null;
  startTime: string;
  endTime: string;
  createdAt: string;
  updatedAt: string | null;
  location: string | null;
  paid: boolean;
  status: Enum_public_booking_status;
  cancellationReason: string | null;
  rejectionReason: string | null;
  fromReschedule: string | null;
  rescheduled: boolean | null;
  dynamicEventSlugRef: string | null;
  dynamicGroupSlugRef: string | null;
  recurringEventId: string | null;
  customInputs: Json | null;
  smsReminderNumber: string | null;
  destinationCalendarId: number | null;
  scheduledJobs: string[] | null;
  metadata: Json | null;
  responses: Json | null;
  isRecorded: boolean;
}
interface Table_public_booking_reference {
  id: number;
  type: string;
  uid: string;
  bookingId: number | null;
  meetingId: string | null;
  meetingPassword: string | null;
  meetingUrl: string | null;
  deleted: boolean | null;
  externalCalendarId: string | null;
  credentialId: number | null;
}
interface Table_public_booking_seat {
  id: number;
  referenceUid: string;
  bookingId: number;
  attendeeId: number;
  data: Json | null;
}
interface Table_public_calendar_cache {
  key: string;
  value: Json;
  expiresAt: string;
  credentialId: number;
}
interface Table_public_credential {
  id: number;
  type: string;
  key: Json;
  userId: number | null;
  appId: string | null;
  invalid: boolean | null;
  teamId: number | null;
}
interface Table_public_deployment {
  id: number;
  logo: string | null;
  theme: Json | null;
  licenseKey: string | null;
  agreedLicenseAt: string | null;
}
interface Table_public_destination_calendar {
  id: number;
  integration: string;
  externalId: string;
  userId: number | null;
  eventTypeId: number | null;
  credentialId: number | null;
}
interface Table_public_event_type {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  locations: Json | null;
  length: number;
  hidden: boolean;
  userId: number | null;
  eventName: string | null;
  timeZone: string | null;
  periodCountCalendarDays: boolean | null;
  periodDays: number | null;
  periodEndDate: string | null;
  periodStartDate: string | null;
  requiresConfirmation: boolean;
  minimumBookingNotice: number;
  currency: string;
  price: number;
  schedulingType: Enum_public_scheduling_type | null;
  teamId: number | null;
  disableGuests: boolean;
  position: number;
  periodType: Enum_public_period_type;
  slotInterval: number | null;
  metadata: Json | null;
  afterEventBuffer: number;
  beforeEventBuffer: number;
  hideCalendarNotes: boolean;
  successRedirectUrl: string | null;
  seatsPerTimeSlot: number | null;
  recurringEvent: Json | null;
  scheduleId: number | null;
  bookingLimits: Json | null;
  seatsShowAttendees: boolean | null;
  bookingFields: Json | null;
  durationLimits: Json | null;
  parentId: number | null;
  offsetStart: number;
  requiresBookerEmailVerification: boolean;
  seatsShowAvailabilityCount: boolean | null;
  lockTimeZoneToggleOnBookingPage: boolean;
}
interface Table_public_event_type_custom_input {
  id: number;
  eventTypeId: number;
  label: string;
  required: boolean;
  type: Enum_public_event_type_custom_input_type;
  placeholder: string;
  options: Json | null;
}
interface Table_public_feature {
  slug: string;
  enabled: boolean;
  description: string | null;
  type: Enum_public_feature_type | null;
  stale: boolean | null;
  lastUsedAt: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  updatedBy: number | null;
}
interface Table_public_feedback {
  id: number;
  date: string;
  userId: number;
  rating: string;
  comment: string | null;
}
interface Table_public_hashed_link {
  id: number;
  link: string;
  eventTypeId: number;
}
interface Table_public_host {
  userId: number;
  eventTypeId: number;
  isFixed: boolean;
}
interface Table_public_impersonations {
  id: number;
  createdAt: string;
  impersonatedUserId: number;
  impersonatedById: number;
}
interface Table_public_membership {
  teamId: number;
  userId: number;
  accepted: boolean;
  role: Enum_public_membership_role;
  disableImpersonation: boolean;
  id: number;
}
interface Table_public_o_auth_client {
  clientId: string;
  redirectUri: string;
  clientSecret: string;
  name: string;
  logo: string | null;
}
interface Table_public_payment {
  id: number;
  uid: string;
  bookingId: number;
  amount: number;
  fee: number;
  currency: string;
  success: boolean;
  refunded: boolean;
  data: Json;
  externalId: string;
  appId: string | null;
  paymentOption: Enum_public_payment_option | null;
}
interface Table_public_reminder_mail {
  id: number;
  referenceId: number;
  reminderType: Enum_public_reminder_type;
  elapsedMinutes: number;
  createdAt: string;
}
interface Table_public_reset_password_request {
  id: string;
  createdAt: string;
  updatedAt: string;
  email: string;
  expires: string;
}
interface Table_public_schedule {
  id: number;
  userId: number;
  name: string;
  timeZone: string | null;
}
interface Table_public_selected_calendar {
  userId: number;
  integration: string;
  externalId: string;
  credentialId: number | null;
}
interface Table_public_selected_slots {
  id: number;
  eventTypeId: number;
  userId: number;
  slotUtcStartDate: string;
  slotUtcEndDate: string;
  uid: string;
  releaseAt: string;
  isSeat: boolean;
}
interface Table_public_session {
  id: string;
  sessionToken: string;
  userId: number;
  expires: string;
}
interface Table_public_team {
  id: number;
  name: string;
  slug: string | null;
  bio: string | null;
  hideBranding: boolean;
  logo: string | null;
  createdAt: string;
  metadata: Json | null;
  hideBookATeamMember: boolean;
  brandColor: string;
  darkBrandColor: string;
  theme: string | null;
  appLogo: string | null;
  appIconLogo: string | null;
  parentId: number | null;
  timeFormat: number | null;
  timeZone: string;
  weekStart: string;
  isPrivate: boolean;
}
interface Table_public_temp_org_redirect {
  id: number;
  from: string;
  fromOrgId: number;
  type: Enum_public_redirect_type;
  toUrl: string;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}
interface Table_public_verification_token {
  id: number;
  identifier: string;
  token: string;
  expires: string;
  createdAt: string;
  updatedAt: string;
  expiresInDays: number | null;
  teamId: number | null;
}
interface Table_public_verified_number {
  id: number;
  userId: number | null;
  phoneNumber: string;
  teamId: number | null;
}
interface Table_public_webhook {
  id: string;
  userId: number | null;
  subscriberUrl: string;
  createdAt: string;
  active: boolean;
  eventTriggers: Enum_public_webhook_trigger_events[] | null;
  payloadTemplate: string | null;
  eventTypeId: number | null;
  appId: string | null;
  secret: string | null;
  teamId: number | null;
}
interface Table_public_webhook_scheduled_triggers {
  id: number;
  jobName: string;
  subscriberUrl: string;
  payload: string;
  startAfter: string;
  retryCount: number;
  createdAt: string | null;
}
interface Table_public_workflow {
  id: number;
  name: string;
  userId: number | null;
  trigger: Enum_public_workflow_trigger_events;
  time: number | null;
  timeUnit: Enum_public_time_unit | null;
  teamId: number | null;
  position: number;
}
interface Table_public_workflow_reminder {
  id: number;
  bookingUid: string | null;
  method: Enum_public_workflow_methods;
  scheduledDate: string;
  referenceId: string | null;
  scheduled: boolean;
  workflowStepId: number | null;
  cancelled: boolean | null;
  seatReferenceId: string | null;
}
interface Table_public_workflow_step {
  id: number;
  stepNumber: number;
  action: Enum_public_workflow_actions;
  workflowId: number;
  sendTo: string | null;
  reminderBody: string | null;
  emailSubject: string | null;
  template: Enum_public_workflow_templates;
  numberRequired: boolean | null;
  sender: string | null;
  numberVerificationPending: boolean;
  includeCalendarEvent: boolean;
}
interface Table_public_workflows_on_event_types {
  id: number;
  workflowId: number;
  eventTypeId: number;
}
interface Table_public_prisma_migrations {
  id: string;
  checksum: string;
  finished_at: string | null;
  migration_name: string;
  logs: string | null;
  rolled_back_at: string | null;
  started_at: string;
  applied_steps_count: number;
}
interface Table_public_user_eventtype {
  A: number;
  B: number;
}
interface Table_public_users {
  id: number;
  username: string | null;
  name: string | null;
  email: string;
  password: string | null;
  bio: string | null;
  avatar: string | null;
  timeZone: string;
  weekStart: string;
  startTime: number;
  endTime: number;
  created: string;
  bufferTime: number;
  emailVerified: string | null;
  hideBranding: boolean;
  theme: string | null;
  completedOnboarding: boolean;
  twoFactorEnabled: boolean;
  twoFactorSecret: string | null;
  locale: string | null;
  brandColor: string;
  identityProvider: Enum_public_identity_provider;
  identityProviderId: string | null;
  invitedTo: number | null;
  metadata: Json | null;
  away: boolean;
  verified: boolean | null;
  timeFormat: number | null;
  darkBrandColor: string;
  trialEndsAt: string | null;
  defaultScheduleId: number | null;
  allowDynamicBooking: boolean | null;
  role: Enum_public_user_permission_role;
  disableImpersonation: boolean;
  organizationId: number | null;
  allowSEOIndexing: boolean | null;
  backupCodes: string | null;
  receiveMonthlyDigestEmail: boolean | null;
}
interface Schema_public {
  AccessCode: Table_public_access_code;
  Account: Table_public_account;
  ApiKey: Table_public_api_key;
  App: Table_public_app;
  App_RoutingForms_Form: Table_public_app_routing_forms_form;
  App_RoutingForms_FormResponse: Table_public_app_routing_forms_form_response;
  Attendee: Table_public_attendee;
  Availability: Table_public_availability;
  Booking: Table_public_booking;
  BookingReference: Table_public_booking_reference;
  BookingSeat: Table_public_booking_seat;
  CalendarCache: Table_public_calendar_cache;
  Credential: Table_public_credential;
  Deployment: Table_public_deployment;
  DestinationCalendar: Table_public_destination_calendar;
  EventType: Table_public_event_type;
  EventTypeCustomInput: Table_public_event_type_custom_input;
  Feature: Table_public_feature;
  Feedback: Table_public_feedback;
  HashedLink: Table_public_hashed_link;
  Host: Table_public_host;
  Impersonations: Table_public_impersonations;
  Membership: Table_public_membership;
  OAuthClient: Table_public_o_auth_client;
  Payment: Table_public_payment;
  ReminderMail: Table_public_reminder_mail;
  ResetPasswordRequest: Table_public_reset_password_request;
  Schedule: Table_public_schedule;
  SelectedCalendar: Table_public_selected_calendar;
  SelectedSlots: Table_public_selected_slots;
  Session: Table_public_session;
  Team: Table_public_team;
  TempOrgRedirect: Table_public_temp_org_redirect;
  VerificationToken: Table_public_verification_token;
  VerifiedNumber: Table_public_verified_number;
  Webhook: Table_public_webhook;
  WebhookScheduledTriggers: Table_public_webhook_scheduled_triggers;
  Workflow: Table_public_workflow;
  WorkflowReminder: Table_public_workflow_reminder;
  WorkflowStep: Table_public_workflow_step;
  WorkflowsOnEventTypes: Table_public_workflows_on_event_types;
  _prisma_migrations: Table_public_prisma_migrations;
  _user_eventtype: Table_public_user_eventtype;
  users: Table_public_users;
}
interface Database {
  public: Schema_public;
}
interface Extension {

}
interface Tables_relationships {
  "public.AccessCode": {
    parent: {
       AccessCode_clientId_fkey: "public.OAuthClient";
       AccessCode_teamId_fkey: "public.Team";
       AccessCode_userId_fkey: "public.users";
    };
    children: {

    };
  };
  "public.Account": {
    parent: {
       Account_userId_fkey: "public.users";
    };
    children: {

    };
  };
  "public.ApiKey": {
    parent: {
       ApiKey_appId_fkey: "public.App";
       ApiKey_teamId_fkey: "public.Team";
       ApiKey_userId_fkey: "public.users";
    };
    children: {

    };
  };
  "public.App": {
    parent: {

    };
    children: {
       ApiKey_appId_fkey: "public.ApiKey";
       Credential_appId_fkey: "public.Credential";
       Payment_appId_fkey: "public.Payment";
       Webhook_appId_fkey: "public.Webhook";
    };
  };
  "public.App_RoutingForms_Form": {
    parent: {
       App_RoutingForms_Form_teamId_fkey: "public.Team";
       App_RoutingForms_Form_userId_fkey: "public.users";
    };
    children: {
       App_RoutingForms_FormResponse_formId_fkey: "public.App_RoutingForms_FormResponse";
    };
  };
  "public.App_RoutingForms_FormResponse": {
    parent: {
       App_RoutingForms_FormResponse_formId_fkey: "public.App_RoutingForms_Form";
    };
    children: {

    };
  };
  "public.Attendee": {
    parent: {
       Attendee_bookingId_fkey: "public.Booking";
    };
    children: {
       BookingSeat_attendeeId_fkey: "public.BookingSeat";
    };
  };
  "public.Availability": {
    parent: {
       Availability_eventTypeId_fkey: "public.EventType";
       Availability_scheduleId_fkey: "public.Schedule";
       Availability_userId_fkey: "public.users";
    };
    children: {

    };
  };
  "public.Booking": {
    parent: {
       Booking_destinationCalendarId_fkey: "public.DestinationCalendar";
       Booking_eventTypeId_fkey: "public.EventType";
       Booking_userId_fkey: "public.users";
    };
    children: {
       Attendee_bookingId_fkey: "public.Attendee";
       BookingReference_bookingId_fkey: "public.BookingReference";
       BookingSeat_bookingId_fkey: "public.BookingSeat";
       Payment_bookingId_fkey: "public.Payment";
       WorkflowReminder_bookingUid_fkey: "public.WorkflowReminder";
    };
  };
  "public.BookingReference": {
    parent: {
       BookingReference_bookingId_fkey: "public.Booking";
    };
    children: {

    };
  };
  "public.BookingSeat": {
    parent: {
       BookingSeat_attendeeId_fkey: "public.Attendee";
       BookingSeat_bookingId_fkey: "public.Booking";
    };
    children: {

    };
  };
  "public.CalendarCache": {
    parent: {
       CalendarCache_credentialId_fkey: "public.Credential";
    };
    children: {

    };
  };
  "public.Credential": {
    parent: {
       Credential_appId_fkey: "public.App";
       Credential_teamId_fkey: "public.Team";
       Credential_userId_fkey: "public.users";
    };
    children: {
       CalendarCache_credentialId_fkey: "public.CalendarCache";
       DestinationCalendar_credentialId_fkey: "public.DestinationCalendar";
       SelectedCalendar_credentialId_fkey: "public.SelectedCalendar";
    };
  };
  "public.DestinationCalendar": {
    parent: {
       DestinationCalendar_credentialId_fkey: "public.Credential";
       DestinationCalendar_eventTypeId_fkey: "public.EventType";
       DestinationCalendar_userId_fkey: "public.users";
    };
    children: {
       Booking_destinationCalendarId_fkey: "public.Booking";
    };
  };
  "public.EventType": {
    parent: {
       EventType_parentId_fkey: "public.EventType";
       EventType_scheduleId_fkey: "public.Schedule";
       EventType_teamId_fkey: "public.Team";
       EventType_userId_fkey: "public.users";
    };
    children: {
       Availability_eventTypeId_fkey: "public.Availability";
       Booking_eventTypeId_fkey: "public.Booking";
       DestinationCalendar_eventTypeId_fkey: "public.DestinationCalendar";
       EventType_parentId_fkey: "public.EventType";
       EventTypeCustomInput_eventTypeId_fkey: "public.EventTypeCustomInput";
       HashedLink_eventTypeId_fkey: "public.HashedLink";
       Host_eventTypeId_fkey: "public.Host";
       Webhook_eventTypeId_fkey: "public.Webhook";
       WorkflowsOnEventTypes_eventTypeId_fkey: "public.WorkflowsOnEventTypes";
       _user_eventtype_A_fkey: "public._user_eventtype";
    };
  };
  "public.EventTypeCustomInput": {
    parent: {
       EventTypeCustomInput_eventTypeId_fkey: "public.EventType";
    };
    children: {

    };
  };
  "public.Feedback": {
    parent: {
       Feedback_userId_fkey: "public.users";
    };
    children: {

    };
  };
  "public.HashedLink": {
    parent: {
       HashedLink_eventTypeId_fkey: "public.EventType";
    };
    children: {

    };
  };
  "public.Host": {
    parent: {
       Host_eventTypeId_fkey: "public.EventType";
       Host_userId_fkey: "public.users";
    };
    children: {

    };
  };
  "public.Impersonations": {
    parent: {
       Impersonations_impersonatedById_fkey: "public.users";
       Impersonations_impersonatedUserId_fkey: "public.users";
    };
    children: {

    };
  };
  "public.Membership": {
    parent: {
       Membership_teamId_fkey: "public.Team";
       Membership_userId_fkey: "public.users";
    };
    children: {

    };
  };
  "public.OAuthClient": {
    parent: {

    };
    children: {
       AccessCode_clientId_fkey: "public.AccessCode";
    };
  };
  "public.Payment": {
    parent: {
       Payment_appId_fkey: "public.App";
       Payment_bookingId_fkey: "public.Booking";
    };
    children: {

    };
  };
  "public.Schedule": {
    parent: {
       Schedule_userId_fkey: "public.users";
    };
    children: {
       Availability_scheduleId_fkey: "public.Availability";
       EventType_scheduleId_fkey: "public.EventType";
    };
  };
  "public.SelectedCalendar": {
    parent: {
       SelectedCalendar_credentialId_fkey: "public.Credential";
       SelectedCalendar_userId_fkey: "public.users";
    };
    children: {

    };
  };
  "public.Session": {
    parent: {
       Session_userId_fkey: "public.users";
    };
    children: {

    };
  };
  "public.Team": {
    parent: {
       Team_parentId_fkey: "public.Team";
    };
    children: {
       AccessCode_teamId_fkey: "public.AccessCode";
       ApiKey_teamId_fkey: "public.ApiKey";
       App_RoutingForms_Form_teamId_fkey: "public.App_RoutingForms_Form";
       Credential_teamId_fkey: "public.Credential";
       EventType_teamId_fkey: "public.EventType";
       Membership_teamId_fkey: "public.Membership";
       Team_parentId_fkey: "public.Team";
       VerificationToken_teamId_fkey: "public.VerificationToken";
       VerifiedNumber_teamId_fkey: "public.VerifiedNumber";
       Webhook_teamId_fkey: "public.Webhook";
       Workflow_teamId_fkey: "public.Workflow";
       users_organizationId_fkey: "public.users";
    };
  };
  "public.VerificationToken": {
    parent: {
       VerificationToken_teamId_fkey: "public.Team";
    };
    children: {

    };
  };
  "public.VerifiedNumber": {
    parent: {
       VerifiedNumber_teamId_fkey: "public.Team";
       VerifiedNumber_userId_fkey: "public.users";
    };
    children: {

    };
  };
  "public.Webhook": {
    parent: {
       Webhook_appId_fkey: "public.App";
       Webhook_eventTypeId_fkey: "public.EventType";
       Webhook_teamId_fkey: "public.Team";
       Webhook_userId_fkey: "public.users";
    };
    children: {

    };
  };
  "public.Workflow": {
    parent: {
       Workflow_teamId_fkey: "public.Team";
       Workflow_userId_fkey: "public.users";
    };
    children: {
       WorkflowStep_workflowId_fkey: "public.WorkflowStep";
       WorkflowsOnEventTypes_workflowId_fkey: "public.WorkflowsOnEventTypes";
    };
  };
  "public.WorkflowReminder": {
    parent: {
       WorkflowReminder_bookingUid_fkey: "public.Booking";
       WorkflowReminder_workflowStepId_fkey: "public.WorkflowStep";
    };
    children: {

    };
  };
  "public.WorkflowStep": {
    parent: {
       WorkflowStep_workflowId_fkey: "public.Workflow";
    };
    children: {
       WorkflowReminder_workflowStepId_fkey: "public.WorkflowReminder";
    };
  };
  "public.WorkflowsOnEventTypes": {
    parent: {
       WorkflowsOnEventTypes_eventTypeId_fkey: "public.EventType";
       WorkflowsOnEventTypes_workflowId_fkey: "public.Workflow";
    };
    children: {

    };
  };
  "public._user_eventtype": {
    parent: {
       _user_eventtype_A_fkey: "public.EventType";
       _user_eventtype_B_fkey: "public.users";
    };
    children: {

    };
  };
  "public.users": {
    parent: {
       users_organizationId_fkey: "public.Team";
    };
    children: {
       AccessCode_userId_fkey: "public.AccessCode";
       Account_userId_fkey: "public.Account";
       ApiKey_userId_fkey: "public.ApiKey";
       App_RoutingForms_Form_userId_fkey: "public.App_RoutingForms_Form";
       Availability_userId_fkey: "public.Availability";
       Booking_userId_fkey: "public.Booking";
       Credential_userId_fkey: "public.Credential";
       DestinationCalendar_userId_fkey: "public.DestinationCalendar";
       EventType_userId_fkey: "public.EventType";
       Feedback_userId_fkey: "public.Feedback";
       Host_userId_fkey: "public.Host";
       Impersonations_impersonatedById_fkey: "public.Impersonations";
       Impersonations_impersonatedUserId_fkey: "public.Impersonations";
       Membership_userId_fkey: "public.Membership";
       Schedule_userId_fkey: "public.Schedule";
       SelectedCalendar_userId_fkey: "public.SelectedCalendar";
       Session_userId_fkey: "public.Session";
       VerifiedNumber_userId_fkey: "public.VerifiedNumber";
       Webhook_userId_fkey: "public.Webhook";
       Workflow_userId_fkey: "public.Workflow";
       _user_eventtype_B_fkey: "public._user_eventtype";
    };
  };
}
//#endregion

//#region select
type SelectedTable = { id: string; schema: string; table: string };

type SelectDefault = {
  /**
   * Define the "default" behavior to use for the tables in the schema.
   * If true, select all tables in the schema.
   * If false, select no tables in the schema.
   * If "structure", select only the structure of the tables in the schema but not the data.
   * @defaultValue true
   */
  $default?: SelectObject;
};

type DefaultKey = keyof SelectDefault;

type SelectObject = boolean | "structure";

type ExtensionsSelect<TSchema extends keyof Database> =
  TSchema extends keyof Extension
    ? {
        /**
         * Define if you want to select the extension data.
         * @defaultValue false
         */
        $extensions?:
          | boolean
          | {
              [TExtension in Extension[TSchema]]?: boolean;
            };
      }
    : {};

type SelectConfig = SelectDefault & {
  [TSchema in keyof Database]?:
    | SelectObject
    | (SelectDefault &
        ExtensionsSelect<TSchema> & {
          [TTable in keyof Database[TSchema]]?: SelectObject;
        });
};

// Apply the __default key if it exists to each level of the select config (schemas and tables)
type ApplyDefault<TSelectConfig extends SelectConfig> = {
  [TSchema in keyof Database]-?: {
    [TTable in keyof Database[TSchema]]-?: TSelectConfig[TSchema] extends SelectObject
      ? TSelectConfig[TSchema]
      : TSelectConfig[TSchema] extends Record<any, any>
      ? TSelectConfig[TSchema][TTable] extends SelectObject
        ? TSelectConfig[TSchema][TTable]
        : TSelectConfig[TSchema][DefaultKey] extends SelectObject
        ? TSelectConfig[TSchema][DefaultKey]
        : TSelectConfig[DefaultKey] extends SelectObject
        ? TSelectConfig[DefaultKey]
        : true
      : TSelectConfig[DefaultKey] extends SelectObject
      ? TSelectConfig[DefaultKey]
      : true;
  };
};

type ExtractValues<T> = T extends object ? T[keyof T] : never;

type GetSelectedTable<TSelectSchemas extends SelectConfig> = ExtractValues<
  ExtractValues<{
    [TSchema in keyof TSelectSchemas]: {
      [TTable in keyof TSelectSchemas[TSchema] as TSelectSchemas[TSchema][TTable] extends true
        ? TTable
        : never]: TSchema extends string
        ? TTable extends string
          ? { id: `${TSchema}.${TTable}`; schema: TSchema; table: TTable }
          : never
        : never;
    };
  }>
>;
//#endregion

//#region transform
type TransformMode = "auto" | "strict" | "unsafe" | undefined;


type TransformOptions<TTransformMode extends TransformMode> = {
  /**
   * The type for defining the transform mode.
   *
   * There are three modes available:
   *
   * - "auto" - Automatically transform the data for any columns, tables or schemas that have not been specified in the config
   * - "strict" - In this mode, Snaplet expects a transformation to be given in the config for every column in the database. If any columns have not been provided in the config, Snaplet will not capture the snapshot, but instead tell you which columns, tables, or schemas have not been given
   * - "unsafe" - This mode copies over values without any transformation. If a transformation is given for a column in the config, the transformation will be used instead
   * @defaultValue "unsafe"
   */
  $mode?: TTransformMode;
  /**
   * If true, parse JSON objects during transformation.
   * @defaultValue false
   */
  $parseJson?: boolean;
};

// This type is here to turn a Table with scalars values (string, number, etc..) for columns into a Table
// with either scalar values or a callback function that returns the scalar value
type ColumnWithCallback<TSchema extends keyof Database, TTable extends keyof Database[TSchema]> = {
  [TColumn in keyof Database[TSchema][TTable]]:
    Database[TSchema][TTable][TColumn] |
    ((ctx: {
      row: Database[TSchema][TTable];
      value: Database[TSchema][TTable][TColumn];
    }) => Database[TSchema][TTable][TColumn])
};

type DatabaseWithCallback = {
  [TSchema in keyof Database]: {
    [TTable in keyof Database[TSchema]]:
      | ((ctx: {
          row: Database[TSchema][TTable];
          rowIndex: number;
        }) => ColumnWithCallback<TSchema, TTable>)
      | ColumnWithCallback<TSchema, TTable>
  };
};

type SelectDatabase<TSelectedTable extends SelectedTable> = {
  [TSchema in keyof DatabaseWithCallback as TSchema extends NonNullable<TSelectedTable>["schema"]
    ? TSchema
    : never]: {
    [TTable in keyof DatabaseWithCallback[TSchema] as TTable extends Extract<
      TSelectedTable,
      { schema: TSchema }
    >["table"]
      ? TTable
      : never]: DatabaseWithCallback[TSchema][TTable];
  };
};

type PartialTransform<T> = T extends (...args: infer P) => infer R
  ? (...args: P) => Partial<R>
  : Partial<T>;

type IsNever<T> = [T] extends [never] ? true : false;

type TransformConfig<
  TTransformMode extends TransformMode,
  TSelectedTable extends SelectedTable
> = TransformOptions<TTransformMode> &
  (IsNever<TSelectedTable> extends true
    ? never
    : SelectDatabase<TSelectedTable> extends infer TSelectedDatabase
    ? TTransformMode extends "strict"
      ? TSelectedDatabase
      : {
          [TSchema in keyof TSelectedDatabase]?: {
            [TTable in keyof TSelectedDatabase[TSchema]]?: PartialTransform<
              TSelectedDatabase[TSchema][TTable]
            >;
          };
        }
    : never);
//#endregion

//#region subset
type NonEmptyArray<T> = [T, ...T[]];

/**
 * Represents an exclusive row limit percent.
 */
type ExclusiveRowLimitPercent =
| {
  percent?: never;
  /**
   * Represents a strict limit of the number of rows captured on target
   */
  rowLimit: number
}
| {
  /**
   * Represents a random percent to be captured on target (1-100)
   */
  percent: number;
  rowLimit?: never
}

// Get the type of a target in the config.subset.targets array
type SubsetTarget<TSelectedTable extends SelectedTable> = {
  /**
   * The ID of the table to target
   */
  table: TSelectedTable["id"];
  /**
   * The order on which your target will be filtered useful with rowLimit parameter
   *
   * @example
   * orderBy: `"User"."createdAt" desc`
   */
  orderBy?: string;
} & (
  | {
    /**
     * The where filter to be applied on the target
     *
     * @example
     * where: `"_prisma_migrations"."name" IN ('migration1', 'migration2')`
     */
    where: string
  } & Partial<ExclusiveRowLimitPercent>
  | {
    /**
     * The where filter to be applied on the target
     */
    where?: string
  } & ExclusiveRowLimitPercent
);

type GetSelectedTableChildrenKeys<TTable extends keyof Tables_relationships> = keyof Tables_relationships[TTable]['children']
type GetSelectedTableParentKeys<TTable extends keyof Tables_relationships> = keyof Tables_relationships[TTable]['parent']
type GetSelectedTableRelationsKeys<TTable extends keyof Tables_relationships> = GetSelectedTableChildrenKeys<TTable> | GetSelectedTableParentKeys<TTable>
type SelectedTablesWithRelationsIds<TSelectedTable extends SelectedTable['id']> = TSelectedTable extends keyof Tables_relationships ? TSelectedTable : never

/**
 * Represents the options to choose the followNullableRelations of subsetting.
 */
type FollowNullableRelationsOptions<TSelectedTable extends SelectedTable> =
  // Type can be a global boolean definition
  boolean
  // Or can be a mix of $default and table specific definition
  | { $default: boolean } & ({
  // If it's a table specific definition and the table has relationships
  [TTable in SelectedTablesWithRelationsIds<TSelectedTable["id"]>]?:
    // It's either a boolean or a mix of $default and relationship specific definition
    boolean |
    {
      [Key in GetSelectedTableRelationsKeys<TTable> | '$default']?:  boolean
    }
});


/**
 * Represents the options to choose the maxCyclesLoop of subsetting.
 */
type MaxCyclesLoopOptions<TSelectedTable extends SelectedTable> =
// Type can be a global number definition
number
// Or can be a mix of $default and table specific definition
| { $default: number } & ({
  // If it's a table specific definition and the table has relationships
  [TTable in SelectedTablesWithRelationsIds<TSelectedTable["id"]>]?:
    // It's either a number or a mix of $default and relationship specific definition
    number |
    {
      [Key in GetSelectedTableRelationsKeys<TTable> | '$default']?:  number
    }
});


/**
 * Represents the options to choose the maxChildrenPerNode of subsetting.
 */
type MaxChildrenPerNodeOptions<TSelectedTable extends SelectedTable> =
// Type can be a global number definition
number
// Or can be a mix of $default and table specific definition
| { $default: number } & ({
  // If it's a table specific definition and the table has relationships
  [TTable in SelectedTablesWithRelationsIds<TSelectedTable["id"]>]?:
    // It's either a number or a mix of $default and relationship specific definition
    number |
    {
      [Key in GetSelectedTableRelationsKeys<TTable> | '$default']?:  number
    }
});

/**
 * Represents the configuration for subsetting the snapshot.
 */
type SubsetConfig<TSelectedTable extends SelectedTable> = {
  /**
   * Specifies whether subsetting is enabled.
   *  @defaultValue true
   */
  enabled?: boolean;

  /**
   * Specifies the version of the subsetting algorithm
   *
   * @defaultValue "3"
   * @deprecated
   */
  version?: "1" | "2" | "3";

  /**
   * Specifies whether to eagerly load related tables.
   * @defaultValue false
   */
  eager?: boolean;

  /**
   * Specifies whether to keep tables that are not connected to any other tables.
   * @defaultValue false
   */
  keepDisconnectedTables?: boolean;

  /**
   * Specifies whether to follow nullable relations.
   * @defaultValue false
   */
  followNullableRelations?: FollowNullableRelationsOptions<TSelectedTable>;

  /**
   *  Specifies the maximum number of children per node.
   *  @defaultValue unlimited
   */
  maxChildrenPerNode?: MaxChildrenPerNodeOptions<TSelectedTable>;

  /**
   * Specifies the maximum number of cycles in a loop.
   * @defaultValue 10
   */
  maxCyclesLoop?: MaxCyclesLoopOptions<TSelectedTable>;

  /**
   * Specifies the root targets for subsetting. Must be a non-empty array
   */
  targets: NonEmptyArray<SubsetTarget<TSelectedTable>>;

  /**
   * Specifies the task sorting algorithm.
   * By default, the algorithm will not sort the tasks.
   */
  taskSortAlgorithm?: "children" | "idsCount";
}
//#endregion


  //#region introspect
  type VirtualForeignKey<
    TTFkTable extends SelectedTable,
    TTargetTable extends SelectedTable
  > =
  {
    fkTable: TTFkTable['id'];
    targetTable: TTargetTable['id'];
    keys: NonEmptyArray<
      {
        // TODO: Find a way to strongly type this to provide autocomplete when writing the config
        /**
         * The column name present in the fkTable that is a foreign key to the targetTable
         */
        fkColumn: string;
        /**
         * The column name present in the targetTable that is a foreign key to the fkTable
         */
        targetColumn: string;
      }
    >
  }

  type IntrospectConfig<TSelectedTable extends SelectedTable> = {
    /**
     * Allows you to declare virtual foreign keys that are not present as foreign keys in the database.
     * But are still used and enforced by the application.
     */
    virtualForeignKeys?: Array<VirtualForeignKey<TSelectedTable, TSelectedTable>>;
  }
  //#endregion

type Validate<T, Target> = {
  [K in keyof T]: K extends keyof Target ? T[K] : never;
};

type TypedConfig<
  TSelectConfig extends SelectConfig,
  TTransformMode extends TransformMode
> =  GetSelectedTable<
  ApplyDefault<TSelectConfig>
> extends SelectedTable
  ? {
    /**
     * Parameter to configure the generation of data.
     * {@link https://docs.snaplet.dev/core-concepts/generate}
     */
      generate?: {
        alias?: import("./snaplet-client").Alias;
        models?: import("./snaplet-client").UserModels;
        run: (snaplet: import("./snaplet-client").SnapletClient) => Promise<any>;
      }
    /**
     * Parameter to configure the inclusion/exclusion of schemas and tables from the snapshot.
     * {@link https://docs.snaplet.dev/reference/configuration#select}
     */
      select?: Validate<TSelectConfig, SelectConfig>;
      /**
       * Parameter to configure the transformations applied to the data.
       * {@link https://docs.snaplet.dev/reference/configuration#transform}
       */
      transform?: TransformConfig<TTransformMode, GetSelectedTable<ApplyDefault<TSelectConfig>>>;
      /**
       * Parameter to capture a subset of the data.
       * {@link https://docs.snaplet.dev/reference/configuration#subset}
       */
      subset?: SubsetConfig<GetSelectedTable<ApplyDefault<TSelectConfig>>>;

      /**
       * Parameter to augment the result of the introspection of your database.
       * {@link https://docs.snaplet.dev/references/data-operations/introspect}
       */
      introspect?: IntrospectConfig<GetSelectedTable<ApplyDefault<TSelectConfig>>>;
    }
  : never;

declare module "snaplet" {
  class JsonNull {}
  type JsonClass = typeof JsonNull;
  /**
   * Use this value to explicitely set a json or jsonb column to json null instead of the database NULL value.
   */
  export const jsonNull: InstanceType<JsonClass>;
  /**
  * Define the configuration for Snaplet capture process.
  * {@link https://docs.snaplet.dev/reference/configuration}
  */
  export function defineConfig<
    TSelectConfig extends SelectConfig,
    TTransformMode extends TransformMode = undefined
  >(
    config: TypedConfig<TSelectConfig, TTransformMode>
  ): TypedConfig<TSelectConfig, TTransformMode>;

  export type SnapletClient = import("./snaplet-client").SnapletClient;
}
