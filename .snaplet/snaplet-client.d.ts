type JsonPrimitive = null | number | string | boolean;
type Nested<V> = V | { [s: string]: V | Nested<V> } | Array<V | Nested<V>>;
type Json = Nested<JsonPrimitive>;

type ColumnValueCallbackContext = {
  /**
   * The seed of the field's model.
   *
   * \@example
   * ```ts
   * "<hash>/0/users/0"
   * ```
   */
  modelSeed: string;
  /**
   * The seed of the field.
   *
   * \@example
   * ```ts
   * "<hash>/0/users/0/email"
   * ```
   */
  seed: string;
};

/**
 * helper type to get the possible values of a scalar field
 */
type ColumnValue<T> = T | ((ctx: ColumnValueCallbackContext) => T);

/**
 * helper type to map a record of scalars to a record of ColumnValue
 */
type MapToColumnValue<T> = { [K in keyof T]: ColumnValue<T[K]> };

/**
 * Create an array of `n` models.
 *
 * Can be read as "Generate `model` times `n`".
 *
 * @param `n` The number of models to generate.
 * @param `callbackFn` The `x` function calls the `callbackFn` function one time for each element in the array.
 *
 * @example Generate 10 users:
 * ```ts
 * snaplet.users((x) => x(10));
 * ```
 *
 * @example Generate 3 projects with a specific name:
 * ```ts
 * snaplet.projects((x) => x(3, (index) => ({ name: `Project ${index}` })));
 * ```
 */
declare function xCallbackFn<T>(
  n: number | MinMaxOption,
  callbackFn?: (index: number) => T
): Array<T>;

type ChildCallbackInputs<T> = (
  x: typeof xCallbackFn<T>,
) => Array<T>;

/**
 * all the possible types for a child field
 */
type ChildInputs<T> = Array<T> | ChildCallbackInputs<T>;

/**
 * omit some keys TKeys from a child field
 * @example we remove ExecTask from the Snapshot child field values as we're coming from ExecTask
 * type ExecTaskChildrenInputs<TPath extends string[]> = {
 *   Snapshot: OmitChildInputs<SnapshotChildInputs<[...TPath, "Snapshot"]>, "ExecTask">;
 * };
 */
type OmitChildInputs<T, TKeys extends string> = T extends ChildCallbackInputs<
  infer U
>
  ? ChildCallbackInputs<Omit<U, TKeys>>
  : T extends Array<infer U>
  ? Array<Omit<U, TKeys>>
  : never;

type ConnectCallbackContext<TGraph, TPath extends string[]> = {
  /**
   * The branch of the current iteration for the relationship field.
   *
   * Learn more in the {@link https://docs.snaplet.dev/core-concepts/generate#branch | documentation}.
   */
  branch: GetBranch<TGraph, TPath>;
  /**
   * The plan's graph.
   *
   * Learn more in the {@link https://docs.snaplet.dev/core-concepts/generate#graph | documentation}.
   */
  graph: TGraph;
  /**
   * The index of the current iteration.
   */
  index: number;
  /**
   * The seed of the relationship field.
   */
  seed: string;
  /**
   * The plan's store.
   */
  store: Store;
};

/**
 * the callback function we can pass to a parent field to connect it to another model
 * @example
 * snaplet.Post({ User: (ctx) => ({ id: ctx.store.User[0] }) })
 */
type ConnectCallback<T, TGraph, TPath extends string[]> = (
  ctx: ConnectCallbackContext<TGraph, TPath>
) => T;

/**
 * compute the Graph type and the tracked path to pass to the connect callback
 */
type ParentCallbackInputs<T, TPath extends string[]> = TPath extends [
  infer TRoot,
  ...infer TRest extends string[],
]
  ? TRoot extends keyof Graph
    ? MergeGraphParts<Graph[TRoot]> extends infer TGraph
      ? ConnectCallback<T, TGraph, TRest>
      : never
    : never
  : never;

type ParentInputs<T, TPath extends string[]> =
  | T
  | ParentCallbackInputs<T, TPath>;

/**
 * omit some keys TKeys from a parent field
 * @example we remove Member from the Organization and User parent fields values as we're coming from Member
 * type MemberParentsInputs<TPath extends string[]> = {
 *   Organization: OmitParentInputs<OrganizationParentInputs<[...TPath, "Organization"]>, "Member", [...TPath, "Organization"]>;
 *   User: OmitParentInputs<UserParentInputs<[...TPath, "User"]>, "Member", [...TPath, "User"]>;
 * };
 */
type OmitParentInputs<
  T,
  TKeys extends string,
  TPath extends string[],
> = T extends ConnectCallback<infer U, any, any>
  ? ParentCallbackInputs<Omit<U, TKeys>, TPath>
  : Omit<T, TKeys>;

/**
 * compute the inputs type for a given model
 */
type Inputs<TScalars, TParents, TChildren> = Partial<
  MapToColumnValue<TScalars> & TParents & TChildren
>;

type OmitChildGraph<
  T extends Array<unknown>,
  TKeys extends string,
> = T extends Array<
  infer TGraph extends { Scalars: any; Parents: any; Children: any }
>
  ? Array<{
      Scalars: TGraph["Scalars"];
      Parents: TGraph["Parents"];
      Children: Omit<TGraph["Children"], TKeys>;
    }>
  : never;

type OmitParentGraph<
  T extends Array<unknown>,
  TKeys extends string,
> = T extends Array<
  infer TGraph extends { Scalars: any; Parents: any; Children: any }
>
  ? Array<{
      Scalars: TGraph["Scalars"];
      Parents: Omit<TGraph["Parents"], TKeys>;
      Children: TGraph["Children"];
    }>
  : never;

type UnwrapArray<T> = T extends Array<infer U> ? U : T;

type DeepUnwrapKeys<TGraph, TKeys extends any[]> = TKeys extends [
  infer THead,
  ...infer TTail,
]
  ? TTail extends any[]
    ? {
        [P in keyof TGraph]: P extends THead
          ? DeepUnwrapKeys<UnwrapArray<TGraph[P]>, TTail>
          : TGraph[P];
      }
    : TGraph
  : TGraph;

type GetBranch<T, K extends any[]> = T extends Array<infer U>
  ? DeepUnwrapKeys<U, K>
  : T;

type MergeGraphParts<T> = T extends Array<
  infer U extends { Scalars: unknown; Parents: unknown; Children: unknown }
>
  ? Array<
      U["Scalars"] & {
        [K in keyof U["Children"]]: MergeGraphParts<U["Children"][K]>;
      } & {
        [K in keyof U["Parents"]]: MergeGraphParts<
          U["Parents"][K]
        > extends Array<infer TParent>
          ? TParent
          : never;
      }
    >
  : never;

/**
 * the configurable map of models' generate and connect functions
 */
export type UserModels = {
  [KStore in keyof Store]?: Store[KStore] extends Array<
    infer TFields extends Record<string, any>
  >
    ? {
        connect?: (ctx: { store: Store }) => TFields;
        data?: Partial<MapToColumnValue<TFields>>;
      }
    : never;
};

type PlanOptions = {
  /**
   * Connect the missing relationships to one of the corresponding models in the store.
   *
   * Learn more in the {@link https://docs.snaplet.dev/core-concepts/generate#using-autoconnect-option | documentation}.
   */
  autoConnect?: boolean;
  /**
   * Provide custom data generation and connect functions for this plan.
   *
   * Learn more in the {@link https://docs.snaplet.dev/core-concepts/generate#using-autoconnect-option | documentation}.
   */
  models?: UserModels;
  /**
   * Pass a custom store instance to use for this plan.
   *
   * Learn more in the {@link https://docs.snaplet.dev/core-concepts/generate#augmenting-external-data-with-createstore | documentation}.
   */
  store?: StoreInstance;
  /**
   * Use a custom seed for this plan.
   */
  seed?: string;
};

/**
 * the plan is extending PromiseLike so it can be awaited
 * @example
 * await snaplet.User({ name: "John" });
 */
export interface Plan extends PromiseLike<any> {
  generate: (initialStore?: Store) => Promise<Store>;
  /**
   * Compose multiple plans together, injecting the store of the previous plan into the next plan.
   *
   * Learn more in the {@link https://docs.snaplet.dev/core-concepts/generate#using-pipe | documentation}.
   */
  pipe: Pipe;
  /**
   * Compose multiple plans together, without injecting the store of the previous plan into the next plan.
   * All stores stay independent and are merged together once all the plans are generated.
   *
   * Learn more in the {@link https://docs.snaplet.dev/core-concepts/generate#using-merge | documentation}.
   */
  merge: Merge;
}

type Pipe = (plans: Plan[], options?: { models?: UserModels, seed?: string }) => Plan;

type Merge = (plans: Plan[], options?: { models?: UserModels, seed?: string }) => Plan;

type StoreInstance<T extends Partial<Store> = {}> = {
  _store: T;
  toSQL: () => string[];
};

type CreateStore = <T extends Partial<Store>>(
  initialData?: T,
  options?: { external: boolean },
) => StoreInstance<T>;
type Store = {
  AccessCode: Array<AccessCodeScalars>;
  Account: Array<AccountScalars>;
  ApiKey: Array<ApiKeyScalars>;
  App: Array<AppScalars>;
  App_RoutingForms_Form: Array<App_RoutingForms_FormScalars>;
  App_RoutingForms_FormResponse: Array<App_RoutingForms_FormResponseScalars>;
  Attendee: Array<AttendeeScalars>;
  Availability: Array<AvailabilityScalars>;
  Booking: Array<BookingScalars>;
  BookingReference: Array<BookingReferenceScalars>;
  BookingSeat: Array<BookingSeatScalars>;
  CalendarCache: Array<CalendarCacheScalars>;
  Credential: Array<CredentialScalars>;
  Deployment: Array<DeploymentScalars>;
  DestinationCalendar: Array<DestinationCalendarScalars>;
  EventType: Array<EventTypeScalars>;
  EventTypeCustomInput: Array<EventTypeCustomInputScalars>;
  Feature: Array<FeatureScalars>;
  Feedback: Array<FeedbackScalars>;
  HashedLink: Array<HashedLinkScalars>;
  Host: Array<HostScalars>;
  Impersonations: Array<ImpersonationsScalars>;
  Membership: Array<MembershipScalars>;
  OAuthClient: Array<OAuthClientScalars>;
  Payment: Array<PaymentScalars>;
  ReminderMail: Array<ReminderMailScalars>;
  ResetPasswordRequest: Array<ResetPasswordRequestScalars>;
  Schedule: Array<ScheduleScalars>;
  SelectedCalendar: Array<SelectedCalendarScalars>;
  SelectedSlots: Array<SelectedSlotsScalars>;
  Session: Array<SessionScalars>;
  Team: Array<TeamScalars>;
  TempOrgRedirect: Array<TempOrgRedirectScalars>;
  VerificationToken: Array<VerificationTokenScalars>;
  VerifiedNumber: Array<VerifiedNumberScalars>;
  Webhook: Array<WebhookScalars>;
  WebhookScheduledTriggers: Array<WebhookScheduledTriggersScalars>;
  Workflow: Array<WorkflowScalars>;
  WorkflowReminder: Array<WorkflowReminderScalars>;
  WorkflowStep: Array<WorkflowStepScalars>;
  WorkflowsOnEventTypes: Array<WorkflowsOnEventTypesScalars>;
  _prisma_migrations: Array<_prisma_migrationsScalars>;
  _user_eventtype: Array<_user_eventtypeScalars>;
  users: Array<usersScalars>;
};
type AccessScopeEnum = "READ_BOOKING" | "READ_PROFILE";
type AppCategoriesEnum = "analytics" | "automation" | "calendar" | "conferencing" | "crm" | "messaging" | "other" | "payment" | "video" | "web3";
type BookingStatusEnum = "accepted" | "cancelled" | "pending" | "rejected";
type EventTypeCustomInputTypeEnum = "bool" | "number" | "phone" | "radio" | "text" | "textLong";
type FeatureTypeEnum = "EXPERIMENT" | "KILL_SWITCH" | "OPERATIONAL" | "PERMISSION" | "RELEASE";
type IdentityProviderEnum = "CAL" | "GOOGLE" | "SAML";
type MembershipRoleEnum = "ADMIN" | "MEMBER" | "OWNER";
type PaymentOptionEnum = "HOLD" | "ON_BOOKING";
type PeriodTypeEnum = "range" | "rolling" | "unlimited";
type RedirectTypeEnum = "team" | "team-event-type" | "user" | "user-event-type";
type ReminderTypeEnum = "PENDING_BOOKING_CONFIRMATION";
type SchedulingTypeEnum = "collective" | "managed" | "roundRobin";
type TimeUnitEnum = "day" | "hour" | "minute";
type UserPermissionRoleEnum = "ADMIN" | "USER";
type WebhookTriggerEventsEnum = "BOOKING_CANCELLED" | "BOOKING_CREATED" | "BOOKING_PAID" | "BOOKING_PAYMENT_INITIATED" | "BOOKING_REJECTED" | "BOOKING_REQUESTED" | "BOOKING_RESCHEDULED" | "FORM_SUBMITTED" | "MEETING_ENDED" | "RECORDING_READY";
type WorkflowActionsEnum = "EMAIL_ADDRESS" | "EMAIL_ATTENDEE" | "EMAIL_HOST" | "SMS_ATTENDEE" | "SMS_NUMBER" | "WHATSAPP_ATTENDEE" | "WHATSAPP_NUMBER";
type WorkflowMethodsEnum = "EMAIL" | "SMS" | "WHATSAPP";
type WorkflowTemplatesEnum = "CANCELLED" | "COMPLETED" | "CUSTOM" | "REMINDER" | "RESCHEDULED";
type WorkflowTriggerEventsEnum = "AFTER_EVENT" | "BEFORE_EVENT" | "EVENT_CANCELLED" | "NEW_EVENT" | "RESCHEDULE_EVENT";
type AccessCodeScalars = {
  /**
   * Column `AccessCode.id`.
   */
  id?: number;
  /**
   * Column `AccessCode.code`.
   */
  code: string;
  /**
   * Column `AccessCode.clientId`.
   */
  clientId: string | null;
  /**
   * Column `AccessCode.expiresAt`.
   */
  expiresAt: string;
  /**
   * Column `AccessCode.scopes`.
   */
  scopes: AccessScopeEnum[] | null;
  /**
   * Column `AccessCode.userId`.
   */
  userId: number | null;
  /**
   * Column `AccessCode.teamId`.
   */
  teamId: number | null;
}
type AccessCodeParentsInputs<TPath extends string[]> = {
  /**
   * Relationship from table `AccessCode` to table `OAuthClient` through the column `AccessCode.clientId`.
   */
  OAuthClient: OmitParentInputs<OAuthClientParentInputs<[...TPath, "OAuthClient"]>, "AccessCode", [...TPath, "OAuthClient"]>;
  /**
   * Relationship from table `AccessCode` to table `Team` through the column `AccessCode.teamId`.
   */
  Team: OmitParentInputs<TeamParentInputs<[...TPath, "Team"]>, "AccessCode", [...TPath, "Team"]>;
  /**
   * Relationship from table `AccessCode` to table `users` through the column `AccessCode.userId`.
   */
  users: OmitParentInputs<usersParentInputs<[...TPath, "users"]>, "AccessCode", [...TPath, "users"]>;
};
type AccessCodeChildrenInputs<TPath extends string[]> = {

};
type AccessCodeInputs<TPath extends string[]> = Inputs<
  AccessCodeScalars,
  AccessCodeParentsInputs<TPath>,
  AccessCodeChildrenInputs<TPath>
>;
type AccessCodeChildInputs<TPath extends string[]> = ChildInputs<AccessCodeInputs<TPath>>;
type AccessCodeParentInputs<TPath extends string[]> = ParentInputs<
AccessCodeInputs<TPath>,
  TPath
>;
type AccountScalars = {
  /**
   * Column `Account.id`.
   */
  id: string;
  /**
   * Column `Account.userId`.
   */
  userId: number;
  /**
   * Column `Account.type`.
   */
  type: string;
  /**
   * Column `Account.provider`.
   */
  provider: string;
  /**
   * Column `Account.providerAccountId`.
   */
  providerAccountId: string;
  /**
   * Column `Account.refresh_token`.
   */
  refresh_token: string | null;
  /**
   * Column `Account.access_token`.
   */
  access_token: string | null;
  /**
   * Column `Account.expires_at`.
   */
  expires_at: number | null;
  /**
   * Column `Account.token_type`.
   */
  token_type: string | null;
  /**
   * Column `Account.scope`.
   */
  scope: string | null;
  /**
   * Column `Account.id_token`.
   */
  id_token: string | null;
  /**
   * Column `Account.session_state`.
   */
  session_state: string | null;
}
type AccountParentsInputs<TPath extends string[]> = {
  /**
   * Relationship from table `Account` to table `users` through the column `Account.userId`.
   */
  users: OmitParentInputs<usersParentInputs<[...TPath, "users"]>, "Account", [...TPath, "users"]>;
};
type AccountChildrenInputs<TPath extends string[]> = {

};
type AccountInputs<TPath extends string[]> = Inputs<
  AccountScalars,
  AccountParentsInputs<TPath>,
  AccountChildrenInputs<TPath>
>;
type AccountChildInputs<TPath extends string[]> = ChildInputs<AccountInputs<TPath>>;
type AccountParentInputs<TPath extends string[]> = ParentInputs<
AccountInputs<TPath>,
  TPath
>;
type ApiKeyScalars = {
  /**
   * Column `ApiKey.id`.
   */
  id: string;
  /**
   * Column `ApiKey.userId`.
   */
  userId: number;
  /**
   * Column `ApiKey.note`.
   */
  note: string | null;
  /**
   * Column `ApiKey.createdAt`.
   */
  createdAt?: string;
  /**
   * Column `ApiKey.expiresAt`.
   */
  expiresAt: string | null;
  /**
   * Column `ApiKey.lastUsedAt`.
   */
  lastUsedAt: string | null;
  /**
   * Column `ApiKey.hashedKey`.
   */
  hashedKey: string;
  /**
   * Column `ApiKey.appId`.
   */
  appId: string | null;
  /**
   * Column `ApiKey.teamId`.
   */
  teamId: number | null;
}
type ApiKeyParentsInputs<TPath extends string[]> = {
  /**
   * Relationship from table `ApiKey` to table `App` through the column `ApiKey.appId`.
   */
  App: OmitParentInputs<AppParentInputs<[...TPath, "App"]>, "ApiKey", [...TPath, "App"]>;
  /**
   * Relationship from table `ApiKey` to table `Team` through the column `ApiKey.teamId`.
   */
  Team: OmitParentInputs<TeamParentInputs<[...TPath, "Team"]>, "ApiKey", [...TPath, "Team"]>;
  /**
   * Relationship from table `ApiKey` to table `users` through the column `ApiKey.userId`.
   */
  users: OmitParentInputs<usersParentInputs<[...TPath, "users"]>, "ApiKey", [...TPath, "users"]>;
};
type ApiKeyChildrenInputs<TPath extends string[]> = {

};
type ApiKeyInputs<TPath extends string[]> = Inputs<
  ApiKeyScalars,
  ApiKeyParentsInputs<TPath>,
  ApiKeyChildrenInputs<TPath>
>;
type ApiKeyChildInputs<TPath extends string[]> = ChildInputs<ApiKeyInputs<TPath>>;
type ApiKeyParentInputs<TPath extends string[]> = ParentInputs<
ApiKeyInputs<TPath>,
  TPath
>;
type AppScalars = {
  /**
   * Column `App.slug`.
   */
  slug: string;
  /**
   * Column `App.dirName`.
   */
  dirName: string;
  /**
   * Column `App.keys`.
   */
  keys: Json | null;
  /**
   * Column `App.categories`.
   */
  categories: AppCategoriesEnum[] | null;
  /**
   * Column `App.createdAt`.
   */
  createdAt?: string;
  /**
   * Column `App.updatedAt`.
   */
  updatedAt: string;
  /**
   * Column `App.enabled`.
   */
  enabled?: boolean;
}
type AppParentsInputs<TPath extends string[]> = {

};
type AppChildrenInputs<TPath extends string[]> = {
  /**
  * Relationship from table `App` to table `ApiKey` through the column `ApiKey.appId`.
  */
  ApiKey: OmitChildInputs<ApiKeyChildInputs<[...TPath, "ApiKey"]>, "App" | "appId">;
  /**
  * Relationship from table `App` to table `Credential` through the column `Credential.appId`.
  */
  Credential: OmitChildInputs<CredentialChildInputs<[...TPath, "Credential"]>, "App" | "appId">;
  /**
  * Relationship from table `App` to table `Payment` through the column `Payment.appId`.
  */
  Payment: OmitChildInputs<PaymentChildInputs<[...TPath, "Payment"]>, "App" | "appId">;
  /**
  * Relationship from table `App` to table `Webhook` through the column `Webhook.appId`.
  */
  Webhook: OmitChildInputs<WebhookChildInputs<[...TPath, "Webhook"]>, "App" | "appId">;
};
type AppInputs<TPath extends string[]> = Inputs<
  AppScalars,
  AppParentsInputs<TPath>,
  AppChildrenInputs<TPath>
>;
type AppChildInputs<TPath extends string[]> = ChildInputs<AppInputs<TPath>>;
type AppParentInputs<TPath extends string[]> = ParentInputs<
AppInputs<TPath>,
  TPath
>;
type App_RoutingForms_FormScalars = {
  /**
   * Column `App_RoutingForms_Form.id`.
   */
  id: string;
  /**
   * Column `App_RoutingForms_Form.description`.
   */
  description: string | null;
  /**
   * Column `App_RoutingForms_Form.routes`.
   */
  routes: Json | null;
  /**
   * Column `App_RoutingForms_Form.createdAt`.
   */
  createdAt?: string;
  /**
   * Column `App_RoutingForms_Form.updatedAt`.
   */
  updatedAt: string;
  /**
   * Column `App_RoutingForms_Form.name`.
   */
  name: string;
  /**
   * Column `App_RoutingForms_Form.fields`.
   */
  fields: Json | null;
  /**
   * Column `App_RoutingForms_Form.userId`.
   */
  userId: number;
  /**
   * Column `App_RoutingForms_Form.disabled`.
   */
  disabled?: boolean;
  /**
   * Column `App_RoutingForms_Form.settings`.
   */
  settings: Json | null;
  /**
   * Column `App_RoutingForms_Form.teamId`.
   */
  teamId: number | null;
  /**
   * Column `App_RoutingForms_Form.position`.
   */
  position?: number;
}
type App_RoutingForms_FormParentsInputs<TPath extends string[]> = {
  /**
   * Relationship from table `App_RoutingForms_Form` to table `Team` through the column `App_RoutingForms_Form.teamId`.
   */
  Team: OmitParentInputs<TeamParentInputs<[...TPath, "Team"]>, "App_RoutingForms_Form", [...TPath, "Team"]>;
  /**
   * Relationship from table `App_RoutingForms_Form` to table `users` through the column `App_RoutingForms_Form.userId`.
   */
  users: OmitParentInputs<usersParentInputs<[...TPath, "users"]>, "App_RoutingForms_Form", [...TPath, "users"]>;
};
type App_RoutingForms_FormChildrenInputs<TPath extends string[]> = {
  /**
  * Relationship from table `App_RoutingForms_Form` to table `App_RoutingForms_FormResponse` through the column `App_RoutingForms_FormResponse.formId`.
  */
  App_RoutingForms_FormResponse: OmitChildInputs<App_RoutingForms_FormResponseChildInputs<[...TPath, "App_RoutingForms_FormResponse"]>, "App_RoutingForms_Form" | "formId">;
};
type App_RoutingForms_FormInputs<TPath extends string[]> = Inputs<
  App_RoutingForms_FormScalars,
  App_RoutingForms_FormParentsInputs<TPath>,
  App_RoutingForms_FormChildrenInputs<TPath>
>;
type App_RoutingForms_FormChildInputs<TPath extends string[]> = ChildInputs<App_RoutingForms_FormInputs<TPath>>;
type App_RoutingForms_FormParentInputs<TPath extends string[]> = ParentInputs<
App_RoutingForms_FormInputs<TPath>,
  TPath
>;
type App_RoutingForms_FormResponseScalars = {
  /**
   * Column `App_RoutingForms_FormResponse.id`.
   */
  id?: number;
  /**
   * Column `App_RoutingForms_FormResponse.formFillerId`.
   */
  formFillerId: string;
  /**
   * Column `App_RoutingForms_FormResponse.formId`.
   */
  formId: string;
  /**
   * Column `App_RoutingForms_FormResponse.response`.
   */
  response: Json;
  /**
   * Column `App_RoutingForms_FormResponse.createdAt`.
   */
  createdAt?: string;
}
type App_RoutingForms_FormResponseParentsInputs<TPath extends string[]> = {
  /**
   * Relationship from table `App_RoutingForms_FormResponse` to table `App_RoutingForms_Form` through the column `App_RoutingForms_FormResponse.formId`.
   */
  App_RoutingForms_Form: OmitParentInputs<App_RoutingForms_FormParentInputs<[...TPath, "App_RoutingForms_Form"]>, "App_RoutingForms_FormResponse", [...TPath, "App_RoutingForms_Form"]>;
};
type App_RoutingForms_FormResponseChildrenInputs<TPath extends string[]> = {

};
type App_RoutingForms_FormResponseInputs<TPath extends string[]> = Inputs<
  App_RoutingForms_FormResponseScalars,
  App_RoutingForms_FormResponseParentsInputs<TPath>,
  App_RoutingForms_FormResponseChildrenInputs<TPath>
>;
type App_RoutingForms_FormResponseChildInputs<TPath extends string[]> = ChildInputs<App_RoutingForms_FormResponseInputs<TPath>>;
type App_RoutingForms_FormResponseParentInputs<TPath extends string[]> = ParentInputs<
App_RoutingForms_FormResponseInputs<TPath>,
  TPath
>;
type AttendeeScalars = {
  /**
   * Column `Attendee.id`.
   */
  id?: number;
  /**
   * Column `Attendee.email`.
   */
  email: string;
  /**
   * Column `Attendee.name`.
   */
  name: string;
  /**
   * Column `Attendee.timeZone`.
   */
  timeZone: string;
  /**
   * Column `Attendee.bookingId`.
   */
  bookingId: number | null;
  /**
   * Column `Attendee.locale`.
   */
  locale: string | null;
}
type AttendeeParentsInputs<TPath extends string[]> = {
  /**
   * Relationship from table `Attendee` to table `Booking` through the column `Attendee.bookingId`.
   */
  Booking: OmitParentInputs<BookingParentInputs<[...TPath, "Booking"]>, "Attendee", [...TPath, "Booking"]>;
};
type AttendeeChildrenInputs<TPath extends string[]> = {
  /**
  * Relationship from table `Attendee` to table `BookingSeat` through the column `BookingSeat.attendeeId`.
  */
  BookingSeat: OmitChildInputs<BookingSeatChildInputs<[...TPath, "BookingSeat"]>, "Attendee" | "attendeeId">;
};
type AttendeeInputs<TPath extends string[]> = Inputs<
  AttendeeScalars,
  AttendeeParentsInputs<TPath>,
  AttendeeChildrenInputs<TPath>
>;
type AttendeeChildInputs<TPath extends string[]> = ChildInputs<AttendeeInputs<TPath>>;
type AttendeeParentInputs<TPath extends string[]> = ParentInputs<
AttendeeInputs<TPath>,
  TPath
>;
type AvailabilityScalars = {
  /**
   * Column `Availability.id`.
   */
  id?: number;
  /**
   * Column `Availability.userId`.
   */
  userId: number | null;
  /**
   * Column `Availability.eventTypeId`.
   */
  eventTypeId: number | null;
  /**
   * Column `Availability.days`.
   */
  days: number[] | null;
  /**
   * Column `Availability.date`.
   */
  date: string | null;
  /**
   * Column `Availability.startTime`.
   */
  startTime: string;
  /**
   * Column `Availability.endTime`.
   */
  endTime: string;
  /**
   * Column `Availability.scheduleId`.
   */
  scheduleId: number | null;
}
type AvailabilityParentsInputs<TPath extends string[]> = {
  /**
   * Relationship from table `Availability` to table `EventType` through the column `Availability.eventTypeId`.
   */
  EventType: OmitParentInputs<EventTypeParentInputs<[...TPath, "EventType"]>, "Availability", [...TPath, "EventType"]>;
  /**
   * Relationship from table `Availability` to table `Schedule` through the column `Availability.scheduleId`.
   */
  Schedule: OmitParentInputs<ScheduleParentInputs<[...TPath, "Schedule"]>, "Availability", [...TPath, "Schedule"]>;
  /**
   * Relationship from table `Availability` to table `users` through the column `Availability.userId`.
   */
  users: OmitParentInputs<usersParentInputs<[...TPath, "users"]>, "Availability", [...TPath, "users"]>;
};
type AvailabilityChildrenInputs<TPath extends string[]> = {

};
type AvailabilityInputs<TPath extends string[]> = Inputs<
  AvailabilityScalars,
  AvailabilityParentsInputs<TPath>,
  AvailabilityChildrenInputs<TPath>
>;
type AvailabilityChildInputs<TPath extends string[]> = ChildInputs<AvailabilityInputs<TPath>>;
type AvailabilityParentInputs<TPath extends string[]> = ParentInputs<
AvailabilityInputs<TPath>,
  TPath
>;
type BookingScalars = {
  /**
   * Column `Booking.id`.
   */
  id?: number;
  /**
   * Column `Booking.uid`.
   */
  uid: string;
  /**
   * Column `Booking.userId`.
   */
  userId: number | null;
  /**
   * Column `Booking.eventTypeId`.
   */
  eventTypeId: number | null;
  /**
   * Column `Booking.title`.
   */
  title: string;
  /**
   * Column `Booking.description`.
   */
  description: string | null;
  /**
   * Column `Booking.startTime`.
   */
  startTime: string;
  /**
   * Column `Booking.endTime`.
   */
  endTime: string;
  /**
   * Column `Booking.createdAt`.
   */
  createdAt?: string;
  /**
   * Column `Booking.updatedAt`.
   */
  updatedAt: string | null;
  /**
   * Column `Booking.location`.
   */
  location: string | null;
  /**
   * Column `Booking.paid`.
   */
  paid?: boolean;
  /**
   * Column `Booking.status`.
   */
  status?: BookingStatusEnum;
  /**
   * Column `Booking.cancellationReason`.
   */
  cancellationReason: string | null;
  /**
   * Column `Booking.rejectionReason`.
   */
  rejectionReason: string | null;
  /**
   * Column `Booking.fromReschedule`.
   */
  fromReschedule: string | null;
  /**
   * Column `Booking.rescheduled`.
   */
  rescheduled: boolean | null;
  /**
   * Column `Booking.dynamicEventSlugRef`.
   */
  dynamicEventSlugRef: string | null;
  /**
   * Column `Booking.dynamicGroupSlugRef`.
   */
  dynamicGroupSlugRef: string | null;
  /**
   * Column `Booking.recurringEventId`.
   */
  recurringEventId: string | null;
  /**
   * Column `Booking.customInputs`.
   */
  customInputs: Json | null;
  /**
   * Column `Booking.smsReminderNumber`.
   */
  smsReminderNumber: string | null;
  /**
   * Column `Booking.destinationCalendarId`.
   */
  destinationCalendarId: number | null;
  /**
   * Column `Booking.scheduledJobs`.
   */
  scheduledJobs: string[] | null;
  /**
   * Column `Booking.metadata`.
   */
  metadata: Json | null;
  /**
   * Column `Booking.responses`.
   */
  responses: Json | null;
  /**
   * Column `Booking.isRecorded`.
   */
  isRecorded?: boolean;
}
type BookingParentsInputs<TPath extends string[]> = {
  /**
   * Relationship from table `Booking` to table `DestinationCalendar` through the column `Booking.destinationCalendarId`.
   */
  DestinationCalendar: OmitParentInputs<DestinationCalendarParentInputs<[...TPath, "DestinationCalendar"]>, "Booking", [...TPath, "DestinationCalendar"]>;
  /**
   * Relationship from table `Booking` to table `EventType` through the column `Booking.eventTypeId`.
   */
  EventType: OmitParentInputs<EventTypeParentInputs<[...TPath, "EventType"]>, "Booking", [...TPath, "EventType"]>;
  /**
   * Relationship from table `Booking` to table `users` through the column `Booking.userId`.
   */
  users: OmitParentInputs<usersParentInputs<[...TPath, "users"]>, "Booking", [...TPath, "users"]>;
};
type BookingChildrenInputs<TPath extends string[]> = {
  /**
  * Relationship from table `Booking` to table `Attendee` through the column `Attendee.bookingId`.
  */
  Attendee: OmitChildInputs<AttendeeChildInputs<[...TPath, "Attendee"]>, "Booking" | "bookingId">;
  /**
  * Relationship from table `Booking` to table `BookingReference` through the column `BookingReference.bookingId`.
  */
  BookingReference: OmitChildInputs<BookingReferenceChildInputs<[...TPath, "BookingReference"]>, "Booking" | "bookingId">;
  /**
  * Relationship from table `Booking` to table `BookingSeat` through the column `BookingSeat.bookingId`.
  */
  BookingSeat: OmitChildInputs<BookingSeatChildInputs<[...TPath, "BookingSeat"]>, "Booking" | "bookingId">;
  /**
  * Relationship from table `Booking` to table `Payment` through the column `Payment.bookingId`.
  */
  Payment: OmitChildInputs<PaymentChildInputs<[...TPath, "Payment"]>, "Booking" | "bookingId">;
  /**
  * Relationship from table `Booking` to table `WorkflowReminder` through the column `WorkflowReminder.bookingUid`.
  */
  WorkflowReminder: OmitChildInputs<WorkflowReminderChildInputs<[...TPath, "WorkflowReminder"]>, "Booking" | "bookingUid">;
};
type BookingInputs<TPath extends string[]> = Inputs<
  BookingScalars,
  BookingParentsInputs<TPath>,
  BookingChildrenInputs<TPath>
>;
type BookingChildInputs<TPath extends string[]> = ChildInputs<BookingInputs<TPath>>;
type BookingParentInputs<TPath extends string[]> = ParentInputs<
BookingInputs<TPath>,
  TPath
>;
type BookingReferenceScalars = {
  /**
   * Column `BookingReference.id`.
   */
  id?: number;
  /**
   * Column `BookingReference.type`.
   */
  type: string;
  /**
   * Column `BookingReference.uid`.
   */
  uid: string;
  /**
   * Column `BookingReference.bookingId`.
   */
  bookingId: number | null;
  /**
   * Column `BookingReference.meetingId`.
   */
  meetingId: string | null;
  /**
   * Column `BookingReference.meetingPassword`.
   */
  meetingPassword: string | null;
  /**
   * Column `BookingReference.meetingUrl`.
   */
  meetingUrl: string | null;
  /**
   * Column `BookingReference.deleted`.
   */
  deleted: boolean | null;
  /**
   * Column `BookingReference.externalCalendarId`.
   */
  externalCalendarId: string | null;
  /**
   * Column `BookingReference.credentialId`.
   */
  credentialId: number | null;
}
type BookingReferenceParentsInputs<TPath extends string[]> = {
  /**
   * Relationship from table `BookingReference` to table `Booking` through the column `BookingReference.bookingId`.
   */
  Booking: OmitParentInputs<BookingParentInputs<[...TPath, "Booking"]>, "BookingReference", [...TPath, "Booking"]>;
};
type BookingReferenceChildrenInputs<TPath extends string[]> = {

};
type BookingReferenceInputs<TPath extends string[]> = Inputs<
  BookingReferenceScalars,
  BookingReferenceParentsInputs<TPath>,
  BookingReferenceChildrenInputs<TPath>
>;
type BookingReferenceChildInputs<TPath extends string[]> = ChildInputs<BookingReferenceInputs<TPath>>;
type BookingReferenceParentInputs<TPath extends string[]> = ParentInputs<
BookingReferenceInputs<TPath>,
  TPath
>;
type BookingSeatScalars = {
  /**
   * Column `BookingSeat.id`.
   */
  id?: number;
  /**
   * Column `BookingSeat.referenceUid`.
   */
  referenceUid: string;
  /**
   * Column `BookingSeat.bookingId`.
   */
  bookingId: number;
  /**
   * Column `BookingSeat.attendeeId`.
   */
  attendeeId: number;
  /**
   * Column `BookingSeat.data`.
   */
  data: Json | null;
}
type BookingSeatParentsInputs<TPath extends string[]> = {
  /**
   * Relationship from table `BookingSeat` to table `Attendee` through the column `BookingSeat.attendeeId`.
   */
  Attendee: OmitParentInputs<AttendeeParentInputs<[...TPath, "Attendee"]>, "BookingSeat", [...TPath, "Attendee"]>;
  /**
   * Relationship from table `BookingSeat` to table `Booking` through the column `BookingSeat.bookingId`.
   */
  Booking: OmitParentInputs<BookingParentInputs<[...TPath, "Booking"]>, "BookingSeat", [...TPath, "Booking"]>;
};
type BookingSeatChildrenInputs<TPath extends string[]> = {

};
type BookingSeatInputs<TPath extends string[]> = Inputs<
  BookingSeatScalars,
  BookingSeatParentsInputs<TPath>,
  BookingSeatChildrenInputs<TPath>
>;
type BookingSeatChildInputs<TPath extends string[]> = ChildInputs<BookingSeatInputs<TPath>>;
type BookingSeatParentInputs<TPath extends string[]> = ParentInputs<
BookingSeatInputs<TPath>,
  TPath
>;
type CalendarCacheScalars = {
  /**
   * Column `CalendarCache.key`.
   */
  key: string;
  /**
   * Column `CalendarCache.value`.
   */
  value: Json;
  /**
   * Column `CalendarCache.expiresAt`.
   */
  expiresAt: string;
  /**
   * Column `CalendarCache.credentialId`.
   */
  credentialId: number;
}
type CalendarCacheParentsInputs<TPath extends string[]> = {
  /**
   * Relationship from table `CalendarCache` to table `Credential` through the column `CalendarCache.credentialId`.
   */
  Credential: OmitParentInputs<CredentialParentInputs<[...TPath, "Credential"]>, "CalendarCache", [...TPath, "Credential"]>;
};
type CalendarCacheChildrenInputs<TPath extends string[]> = {

};
type CalendarCacheInputs<TPath extends string[]> = Inputs<
  CalendarCacheScalars,
  CalendarCacheParentsInputs<TPath>,
  CalendarCacheChildrenInputs<TPath>
>;
type CalendarCacheChildInputs<TPath extends string[]> = ChildInputs<CalendarCacheInputs<TPath>>;
type CalendarCacheParentInputs<TPath extends string[]> = ParentInputs<
CalendarCacheInputs<TPath>,
  TPath
>;
type CredentialScalars = {
  /**
   * Column `Credential.id`.
   */
  id?: number;
  /**
   * Column `Credential.type`.
   */
  type: string;
  /**
   * Column `Credential.key`.
   */
  key: Json;
  /**
   * Column `Credential.userId`.
   */
  userId: number | null;
  /**
   * Column `Credential.appId`.
   */
  appId: string | null;
  /**
   * Column `Credential.invalid`.
   */
  invalid: boolean | null;
  /**
   * Column `Credential.teamId`.
   */
  teamId: number | null;
}
type CredentialParentsInputs<TPath extends string[]> = {
  /**
   * Relationship from table `Credential` to table `App` through the column `Credential.appId`.
   */
  App: OmitParentInputs<AppParentInputs<[...TPath, "App"]>, "Credential", [...TPath, "App"]>;
  /**
   * Relationship from table `Credential` to table `Team` through the column `Credential.teamId`.
   */
  Team: OmitParentInputs<TeamParentInputs<[...TPath, "Team"]>, "Credential", [...TPath, "Team"]>;
  /**
   * Relationship from table `Credential` to table `users` through the column `Credential.userId`.
   */
  users: OmitParentInputs<usersParentInputs<[...TPath, "users"]>, "Credential", [...TPath, "users"]>;
};
type CredentialChildrenInputs<TPath extends string[]> = {
  /**
  * Relationship from table `Credential` to table `CalendarCache` through the column `CalendarCache.credentialId`.
  */
  CalendarCache: OmitChildInputs<CalendarCacheChildInputs<[...TPath, "CalendarCache"]>, "Credential" | "credentialId">;
  /**
  * Relationship from table `Credential` to table `DestinationCalendar` through the column `DestinationCalendar.credentialId`.
  */
  DestinationCalendar: OmitChildInputs<DestinationCalendarChildInputs<[...TPath, "DestinationCalendar"]>, "Credential" | "credentialId">;
  /**
  * Relationship from table `Credential` to table `SelectedCalendar` through the column `SelectedCalendar.credentialId`.
  */
  SelectedCalendar: OmitChildInputs<SelectedCalendarChildInputs<[...TPath, "SelectedCalendar"]>, "Credential" | "credentialId">;
};
type CredentialInputs<TPath extends string[]> = Inputs<
  CredentialScalars,
  CredentialParentsInputs<TPath>,
  CredentialChildrenInputs<TPath>
>;
type CredentialChildInputs<TPath extends string[]> = ChildInputs<CredentialInputs<TPath>>;
type CredentialParentInputs<TPath extends string[]> = ParentInputs<
CredentialInputs<TPath>,
  TPath
>;
type DeploymentScalars = {
  /**
   * Column `Deployment.id`.
   */
  id?: number;
  /**
   * Column `Deployment.logo`.
   */
  logo: string | null;
  /**
   * Column `Deployment.theme`.
   */
  theme: Json | null;
  /**
   * Column `Deployment.licenseKey`.
   */
  licenseKey: string | null;
  /**
   * Column `Deployment.agreedLicenseAt`.
   */
  agreedLicenseAt: string | null;
}
type DeploymentParentsInputs<TPath extends string[]> = {

};
type DeploymentChildrenInputs<TPath extends string[]> = {

};
type DeploymentInputs<TPath extends string[]> = Inputs<
  DeploymentScalars,
  DeploymentParentsInputs<TPath>,
  DeploymentChildrenInputs<TPath>
>;
type DeploymentChildInputs<TPath extends string[]> = ChildInputs<DeploymentInputs<TPath>>;
type DeploymentParentInputs<TPath extends string[]> = ParentInputs<
DeploymentInputs<TPath>,
  TPath
>;
type DestinationCalendarScalars = {
  /**
   * Column `DestinationCalendar.id`.
   */
  id?: number;
  /**
   * Column `DestinationCalendar.integration`.
   */
  integration: string;
  /**
   * Column `DestinationCalendar.externalId`.
   */
  externalId: string;
  /**
   * Column `DestinationCalendar.userId`.
   */
  userId: number | null;
  /**
   * Column `DestinationCalendar.eventTypeId`.
   */
  eventTypeId: number | null;
  /**
   * Column `DestinationCalendar.credentialId`.
   */
  credentialId: number | null;
}
type DestinationCalendarParentsInputs<TPath extends string[]> = {
  /**
   * Relationship from table `DestinationCalendar` to table `Credential` through the column `DestinationCalendar.credentialId`.
   */
  Credential: OmitParentInputs<CredentialParentInputs<[...TPath, "Credential"]>, "DestinationCalendar", [...TPath, "Credential"]>;
  /**
   * Relationship from table `DestinationCalendar` to table `EventType` through the column `DestinationCalendar.eventTypeId`.
   */
  EventType: OmitParentInputs<EventTypeParentInputs<[...TPath, "EventType"]>, "DestinationCalendar", [...TPath, "EventType"]>;
  /**
   * Relationship from table `DestinationCalendar` to table `users` through the column `DestinationCalendar.userId`.
   */
  users: OmitParentInputs<usersParentInputs<[...TPath, "users"]>, "DestinationCalendar", [...TPath, "users"]>;
};
type DestinationCalendarChildrenInputs<TPath extends string[]> = {
  /**
  * Relationship from table `DestinationCalendar` to table `Booking` through the column `Booking.destinationCalendarId`.
  */
  Booking: OmitChildInputs<BookingChildInputs<[...TPath, "Booking"]>, "DestinationCalendar" | "destinationCalendarId">;
};
type DestinationCalendarInputs<TPath extends string[]> = Inputs<
  DestinationCalendarScalars,
  DestinationCalendarParentsInputs<TPath>,
  DestinationCalendarChildrenInputs<TPath>
>;
type DestinationCalendarChildInputs<TPath extends string[]> = ChildInputs<DestinationCalendarInputs<TPath>>;
type DestinationCalendarParentInputs<TPath extends string[]> = ParentInputs<
DestinationCalendarInputs<TPath>,
  TPath
>;
type EventTypeScalars = {
  /**
   * Column `EventType.id`.
   */
  id?: number;
  /**
   * Column `EventType.title`.
   */
  title: string;
  /**
   * Column `EventType.slug`.
   */
  slug: string;
  /**
   * Column `EventType.description`.
   */
  description: string | null;
  /**
   * Column `EventType.locations`.
   */
  locations: Json | null;
  /**
   * Column `EventType.length`.
   */
  length: number;
  /**
   * Column `EventType.hidden`.
   */
  hidden?: boolean;
  /**
   * Column `EventType.userId`.
   */
  userId: number | null;
  /**
   * Column `EventType.eventName`.
   */
  eventName: string | null;
  /**
   * Column `EventType.timeZone`.
   */
  timeZone: string | null;
  /**
   * Column `EventType.periodCountCalendarDays`.
   */
  periodCountCalendarDays: boolean | null;
  /**
   * Column `EventType.periodDays`.
   */
  periodDays: number | null;
  /**
   * Column `EventType.periodEndDate`.
   */
  periodEndDate: string | null;
  /**
   * Column `EventType.periodStartDate`.
   */
  periodStartDate: string | null;
  /**
   * Column `EventType.requiresConfirmation`.
   */
  requiresConfirmation?: boolean;
  /**
   * Column `EventType.minimumBookingNotice`.
   */
  minimumBookingNotice?: number;
  /**
   * Column `EventType.currency`.
   */
  currency?: string;
  /**
   * Column `EventType.price`.
   */
  price?: number;
  /**
   * Column `EventType.schedulingType`.
   */
  schedulingType: SchedulingTypeEnum | null;
  /**
   * Column `EventType.teamId`.
   */
  teamId: number | null;
  /**
   * Column `EventType.disableGuests`.
   */
  disableGuests?: boolean;
  /**
   * Column `EventType.position`.
   */
  position?: number;
  /**
   * Column `EventType.periodType`.
   */
  periodType?: PeriodTypeEnum;
  /**
   * Column `EventType.slotInterval`.
   */
  slotInterval: number | null;
  /**
   * Column `EventType.metadata`.
   */
  metadata: Json | null;
  /**
   * Column `EventType.afterEventBuffer`.
   */
  afterEventBuffer?: number;
  /**
   * Column `EventType.beforeEventBuffer`.
   */
  beforeEventBuffer?: number;
  /**
   * Column `EventType.hideCalendarNotes`.
   */
  hideCalendarNotes?: boolean;
  /**
   * Column `EventType.successRedirectUrl`.
   */
  successRedirectUrl: string | null;
  /**
   * Column `EventType.seatsPerTimeSlot`.
   */
  seatsPerTimeSlot: number | null;
  /**
   * Column `EventType.recurringEvent`.
   */
  recurringEvent: Json | null;
  /**
   * Column `EventType.scheduleId`.
   */
  scheduleId: number | null;
  /**
   * Column `EventType.bookingLimits`.
   */
  bookingLimits: Json | null;
  /**
   * Column `EventType.seatsShowAttendees`.
   */
  seatsShowAttendees: boolean | null;
  /**
   * Column `EventType.bookingFields`.
   */
  bookingFields: Json | null;
  /**
   * Column `EventType.durationLimits`.
   */
  durationLimits: Json | null;
  /**
   * Column `EventType.parentId`.
   */
  parentId: number | null;
  /**
   * Column `EventType.offsetStart`.
   */
  offsetStart?: number;
  /**
   * Column `EventType.requiresBookerEmailVerification`.
   */
  requiresBookerEmailVerification?: boolean;
  /**
   * Column `EventType.seatsShowAvailabilityCount`.
   */
  seatsShowAvailabilityCount: boolean | null;
  /**
   * Column `EventType.lockTimeZoneToggleOnBookingPage`.
   */
  lockTimeZoneToggleOnBookingPage?: boolean;
}
type EventTypeParentsInputs<TPath extends string[]> = {
  /**
   * Relationship from table `EventType` to table `EventType` through the column `EventType.parentId`.
   */
  EventType: OmitParentInputs<EventTypeParentInputs<[...TPath, "EventType"]>, "EventType", [...TPath, "EventType"]>;
  /**
   * Relationship from table `EventType` to table `Schedule` through the column `EventType.scheduleId`.
   */
  Schedule: OmitParentInputs<ScheduleParentInputs<[...TPath, "Schedule"]>, "EventType", [...TPath, "Schedule"]>;
  /**
   * Relationship from table `EventType` to table `Team` through the column `EventType.teamId`.
   */
  Team: OmitParentInputs<TeamParentInputs<[...TPath, "Team"]>, "EventType", [...TPath, "Team"]>;
  /**
   * Relationship from table `EventType` to table `users` through the column `EventType.userId`.
   */
  users: OmitParentInputs<usersParentInputs<[...TPath, "users"]>, "EventType", [...TPath, "users"]>;
};
type EventTypeChildrenInputs<TPath extends string[]> = {
  /**
  * Relationship from table `EventType` to table `Availability` through the column `Availability.eventTypeId`.
  */
  Availability: OmitChildInputs<AvailabilityChildInputs<[...TPath, "Availability"]>, "EventType" | "eventTypeId">;
  /**
  * Relationship from table `EventType` to table `Booking` through the column `Booking.eventTypeId`.
  */
  Booking: OmitChildInputs<BookingChildInputs<[...TPath, "Booking"]>, "EventType" | "eventTypeId">;
  /**
  * Relationship from table `EventType` to table `DestinationCalendar` through the column `DestinationCalendar.eventTypeId`.
  */
  DestinationCalendar: OmitChildInputs<DestinationCalendarChildInputs<[...TPath, "DestinationCalendar"]>, "EventType" | "eventTypeId">;
  /**
  * Relationship from table `EventType` to table `EventTypeCustomInput` through the column `EventTypeCustomInput.eventTypeId`.
  */
  EventTypeCustomInput: OmitChildInputs<EventTypeCustomInputChildInputs<[...TPath, "EventTypeCustomInput"]>, "EventType" | "eventTypeId">;
  /**
  * Relationship from table `EventType` to table `HashedLink` through the column `HashedLink.eventTypeId`.
  */
  HashedLink: OmitChildInputs<HashedLinkChildInputs<[...TPath, "HashedLink"]>, "EventType" | "eventTypeId">;
  /**
  * Relationship from table `EventType` to table `Host` through the column `Host.eventTypeId`.
  */
  Host: OmitChildInputs<HostChildInputs<[...TPath, "Host"]>, "EventType" | "eventTypeId">;
  /**
  * Relationship from table `EventType` to table `Webhook` through the column `Webhook.eventTypeId`.
  */
  Webhook: OmitChildInputs<WebhookChildInputs<[...TPath, "Webhook"]>, "EventType" | "eventTypeId">;
  /**
  * Relationship from table `EventType` to table `WorkflowsOnEventTypes` through the column `WorkflowsOnEventTypes.eventTypeId`.
  */
  WorkflowsOnEventTypes: OmitChildInputs<WorkflowsOnEventTypesChildInputs<[...TPath, "WorkflowsOnEventTypes"]>, "EventType" | "eventTypeId">;
  /**
  * Relationship from table `EventType` to table `_user_eventtype` through the column `_user_eventtype.A`.
  */
  _user_eventtype: OmitChildInputs<_user_eventtypeChildInputs<[...TPath, "_user_eventtype"]>, "EventType" | "A">;
};
type EventTypeInputs<TPath extends string[]> = Inputs<
  EventTypeScalars,
  EventTypeParentsInputs<TPath>,
  EventTypeChildrenInputs<TPath>
>;
type EventTypeChildInputs<TPath extends string[]> = ChildInputs<EventTypeInputs<TPath>>;
type EventTypeParentInputs<TPath extends string[]> = ParentInputs<
EventTypeInputs<TPath>,
  TPath
>;
type EventTypeCustomInputScalars = {
  /**
   * Column `EventTypeCustomInput.id`.
   */
  id?: number;
  /**
   * Column `EventTypeCustomInput.eventTypeId`.
   */
  eventTypeId: number;
  /**
   * Column `EventTypeCustomInput.label`.
   */
  label: string;
  /**
   * Column `EventTypeCustomInput.required`.
   */
  required: boolean;
  /**
   * Column `EventTypeCustomInput.type`.
   */
  type: EventTypeCustomInputTypeEnum;
  /**
   * Column `EventTypeCustomInput.placeholder`.
   */
  placeholder?: string;
  /**
   * Column `EventTypeCustomInput.options`.
   */
  options: Json | null;
}
type EventTypeCustomInputParentsInputs<TPath extends string[]> = {
  /**
   * Relationship from table `EventTypeCustomInput` to table `EventType` through the column `EventTypeCustomInput.eventTypeId`.
   */
  EventType: OmitParentInputs<EventTypeParentInputs<[...TPath, "EventType"]>, "EventTypeCustomInput", [...TPath, "EventType"]>;
};
type EventTypeCustomInputChildrenInputs<TPath extends string[]> = {

};
type EventTypeCustomInputInputs<TPath extends string[]> = Inputs<
  EventTypeCustomInputScalars,
  EventTypeCustomInputParentsInputs<TPath>,
  EventTypeCustomInputChildrenInputs<TPath>
>;
type EventTypeCustomInputChildInputs<TPath extends string[]> = ChildInputs<EventTypeCustomInputInputs<TPath>>;
type EventTypeCustomInputParentInputs<TPath extends string[]> = ParentInputs<
EventTypeCustomInputInputs<TPath>,
  TPath
>;
type FeatureScalars = {
  /**
   * Column `Feature.slug`.
   */
  slug: string;
  /**
   * Column `Feature.enabled`.
   */
  enabled?: boolean;
  /**
   * Column `Feature.description`.
   */
  description: string | null;
  /**
   * Column `Feature.type`.
   */
  type: FeatureTypeEnum | null;
  /**
   * Column `Feature.stale`.
   */
  stale: boolean | null;
  /**
   * Column `Feature.lastUsedAt`.
   */
  lastUsedAt: string | null;
  /**
   * Column `Feature.createdAt`.
   */
  createdAt: string | null;
  /**
   * Column `Feature.updatedAt`.
   */
  updatedAt: string | null;
  /**
   * Column `Feature.updatedBy`.
   */
  updatedBy: number | null;
}
type FeatureParentsInputs<TPath extends string[]> = {

};
type FeatureChildrenInputs<TPath extends string[]> = {

};
type FeatureInputs<TPath extends string[]> = Inputs<
  FeatureScalars,
  FeatureParentsInputs<TPath>,
  FeatureChildrenInputs<TPath>
>;
type FeatureChildInputs<TPath extends string[]> = ChildInputs<FeatureInputs<TPath>>;
type FeatureParentInputs<TPath extends string[]> = ParentInputs<
FeatureInputs<TPath>,
  TPath
>;
type FeedbackScalars = {
  /**
   * Column `Feedback.id`.
   */
  id?: number;
  /**
   * Column `Feedback.date`.
   */
  date?: string;
  /**
   * Column `Feedback.userId`.
   */
  userId: number;
  /**
   * Column `Feedback.rating`.
   */
  rating: string;
  /**
   * Column `Feedback.comment`.
   */
  comment: string | null;
}
type FeedbackParentsInputs<TPath extends string[]> = {
  /**
   * Relationship from table `Feedback` to table `users` through the column `Feedback.userId`.
   */
  users: OmitParentInputs<usersParentInputs<[...TPath, "users"]>, "Feedback", [...TPath, "users"]>;
};
type FeedbackChildrenInputs<TPath extends string[]> = {

};
type FeedbackInputs<TPath extends string[]> = Inputs<
  FeedbackScalars,
  FeedbackParentsInputs<TPath>,
  FeedbackChildrenInputs<TPath>
>;
type FeedbackChildInputs<TPath extends string[]> = ChildInputs<FeedbackInputs<TPath>>;
type FeedbackParentInputs<TPath extends string[]> = ParentInputs<
FeedbackInputs<TPath>,
  TPath
>;
type HashedLinkScalars = {
  /**
   * Column `HashedLink.id`.
   */
  id?: number;
  /**
   * Column `HashedLink.link`.
   */
  link: string;
  /**
   * Column `HashedLink.eventTypeId`.
   */
  eventTypeId: number;
}
type HashedLinkParentsInputs<TPath extends string[]> = {
  /**
   * Relationship from table `HashedLink` to table `EventType` through the column `HashedLink.eventTypeId`.
   */
  EventType: OmitParentInputs<EventTypeParentInputs<[...TPath, "EventType"]>, "HashedLink", [...TPath, "EventType"]>;
};
type HashedLinkChildrenInputs<TPath extends string[]> = {

};
type HashedLinkInputs<TPath extends string[]> = Inputs<
  HashedLinkScalars,
  HashedLinkParentsInputs<TPath>,
  HashedLinkChildrenInputs<TPath>
>;
type HashedLinkChildInputs<TPath extends string[]> = ChildInputs<HashedLinkInputs<TPath>>;
type HashedLinkParentInputs<TPath extends string[]> = ParentInputs<
HashedLinkInputs<TPath>,
  TPath
>;
type HostScalars = {
  /**
   * Column `Host.userId`.
   */
  userId: number;
  /**
   * Column `Host.eventTypeId`.
   */
  eventTypeId: number;
  /**
   * Column `Host.isFixed`.
   */
  isFixed?: boolean;
}
type HostParentsInputs<TPath extends string[]> = {
  /**
   * Relationship from table `Host` to table `EventType` through the column `Host.eventTypeId`.
   */
  EventType: OmitParentInputs<EventTypeParentInputs<[...TPath, "EventType"]>, "Host", [...TPath, "EventType"]>;
  /**
   * Relationship from table `Host` to table `users` through the column `Host.userId`.
   */
  users: OmitParentInputs<usersParentInputs<[...TPath, "users"]>, "Host", [...TPath, "users"]>;
};
type HostChildrenInputs<TPath extends string[]> = {

};
type HostInputs<TPath extends string[]> = Inputs<
  HostScalars,
  HostParentsInputs<TPath>,
  HostChildrenInputs<TPath>
>;
type HostChildInputs<TPath extends string[]> = ChildInputs<HostInputs<TPath>>;
type HostParentInputs<TPath extends string[]> = ParentInputs<
HostInputs<TPath>,
  TPath
>;
type ImpersonationsScalars = {
  /**
   * Column `Impersonations.id`.
   */
  id?: number;
  /**
   * Column `Impersonations.createdAt`.
   */
  createdAt?: string;
  /**
   * Column `Impersonations.impersonatedUserId`.
   */
  impersonatedUserId: number;
  /**
   * Column `Impersonations.impersonatedById`.
   */
  impersonatedById: number;
}
type ImpersonationsParentsInputs<TPath extends string[]> = {
  /**
   * Relationship from table `Impersonations` to table `users` through the column `Impersonations.impersonatedById`.
   */
  users_Impersonations_impersonatedByIdTousers: OmitParentInputs<usersParentInputs<[...TPath, "users_Impersonations_impersonatedByIdTousers"]>, "Impersonations_Impersonations_impersonatedByIdTousers", [...TPath, "users_Impersonations_impersonatedByIdTousers"]>;
  /**
   * Relationship from table `Impersonations` to table `users` through the column `Impersonations.impersonatedUserId`.
   */
  users_Impersonations_impersonatedUserIdTousers: OmitParentInputs<usersParentInputs<[...TPath, "users_Impersonations_impersonatedUserIdTousers"]>, "Impersonations_Impersonations_impersonatedUserIdTousers", [...TPath, "users_Impersonations_impersonatedUserIdTousers"]>;
};
type ImpersonationsChildrenInputs<TPath extends string[]> = {

};
type ImpersonationsInputs<TPath extends string[]> = Inputs<
  ImpersonationsScalars,
  ImpersonationsParentsInputs<TPath>,
  ImpersonationsChildrenInputs<TPath>
>;
type ImpersonationsChildInputs<TPath extends string[]> = ChildInputs<ImpersonationsInputs<TPath>>;
type ImpersonationsParentInputs<TPath extends string[]> = ParentInputs<
ImpersonationsInputs<TPath>,
  TPath
>;
type MembershipScalars = {
  /**
   * Column `Membership.teamId`.
   */
  teamId: number;
  /**
   * Column `Membership.userId`.
   */
  userId: number;
  /**
   * Column `Membership.accepted`.
   */
  accepted?: boolean;
  /**
   * Column `Membership.role`.
   */
  role: MembershipRoleEnum;
  /**
   * Column `Membership.disableImpersonation`.
   */
  disableImpersonation?: boolean;
  /**
   * Column `Membership.id`.
   */
  id?: number;
}
type MembershipParentsInputs<TPath extends string[]> = {
  /**
   * Relationship from table `Membership` to table `Team` through the column `Membership.teamId`.
   */
  Team: OmitParentInputs<TeamParentInputs<[...TPath, "Team"]>, "Membership", [...TPath, "Team"]>;
  /**
   * Relationship from table `Membership` to table `users` through the column `Membership.userId`.
   */
  users: OmitParentInputs<usersParentInputs<[...TPath, "users"]>, "Membership", [...TPath, "users"]>;
};
type MembershipChildrenInputs<TPath extends string[]> = {

};
type MembershipInputs<TPath extends string[]> = Inputs<
  MembershipScalars,
  MembershipParentsInputs<TPath>,
  MembershipChildrenInputs<TPath>
>;
type MembershipChildInputs<TPath extends string[]> = ChildInputs<MembershipInputs<TPath>>;
type MembershipParentInputs<TPath extends string[]> = ParentInputs<
MembershipInputs<TPath>,
  TPath
>;
type OAuthClientScalars = {
  /**
   * Column `OAuthClient.clientId`.
   */
  clientId: string;
  /**
   * Column `OAuthClient.redirectUri`.
   */
  redirectUri: string;
  /**
   * Column `OAuthClient.clientSecret`.
   */
  clientSecret: string;
  /**
   * Column `OAuthClient.name`.
   */
  name: string;
  /**
   * Column `OAuthClient.logo`.
   */
  logo: string | null;
}
type OAuthClientParentsInputs<TPath extends string[]> = {

};
type OAuthClientChildrenInputs<TPath extends string[]> = {
  /**
  * Relationship from table `OAuthClient` to table `AccessCode` through the column `AccessCode.clientId`.
  */
  AccessCode: OmitChildInputs<AccessCodeChildInputs<[...TPath, "AccessCode"]>, "OAuthClient" | "clientId">;
};
type OAuthClientInputs<TPath extends string[]> = Inputs<
  OAuthClientScalars,
  OAuthClientParentsInputs<TPath>,
  OAuthClientChildrenInputs<TPath>
>;
type OAuthClientChildInputs<TPath extends string[]> = ChildInputs<OAuthClientInputs<TPath>>;
type OAuthClientParentInputs<TPath extends string[]> = ParentInputs<
OAuthClientInputs<TPath>,
  TPath
>;
type PaymentScalars = {
  /**
   * Column `Payment.id`.
   */
  id?: number;
  /**
   * Column `Payment.uid`.
   */
  uid: string;
  /**
   * Column `Payment.bookingId`.
   */
  bookingId: number;
  /**
   * Column `Payment.amount`.
   */
  amount: number;
  /**
   * Column `Payment.fee`.
   */
  fee: number;
  /**
   * Column `Payment.currency`.
   */
  currency: string;
  /**
   * Column `Payment.success`.
   */
  success: boolean;
  /**
   * Column `Payment.refunded`.
   */
  refunded: boolean;
  /**
   * Column `Payment.data`.
   */
  data: Json;
  /**
   * Column `Payment.externalId`.
   */
  externalId: string;
  /**
   * Column `Payment.appId`.
   */
  appId: string | null;
  /**
   * Column `Payment.paymentOption`.
   */
  paymentOption: PaymentOptionEnum | null;
}
type PaymentParentsInputs<TPath extends string[]> = {
  /**
   * Relationship from table `Payment` to table `App` through the column `Payment.appId`.
   */
  App: OmitParentInputs<AppParentInputs<[...TPath, "App"]>, "Payment", [...TPath, "App"]>;
  /**
   * Relationship from table `Payment` to table `Booking` through the column `Payment.bookingId`.
   */
  Booking: OmitParentInputs<BookingParentInputs<[...TPath, "Booking"]>, "Payment", [...TPath, "Booking"]>;
};
type PaymentChildrenInputs<TPath extends string[]> = {

};
type PaymentInputs<TPath extends string[]> = Inputs<
  PaymentScalars,
  PaymentParentsInputs<TPath>,
  PaymentChildrenInputs<TPath>
>;
type PaymentChildInputs<TPath extends string[]> = ChildInputs<PaymentInputs<TPath>>;
type PaymentParentInputs<TPath extends string[]> = ParentInputs<
PaymentInputs<TPath>,
  TPath
>;
type ReminderMailScalars = {
  /**
   * Column `ReminderMail.id`.
   */
  id?: number;
  /**
   * Column `ReminderMail.referenceId`.
   */
  referenceId: number;
  /**
   * Column `ReminderMail.reminderType`.
   */
  reminderType: ReminderTypeEnum;
  /**
   * Column `ReminderMail.elapsedMinutes`.
   */
  elapsedMinutes: number;
  /**
   * Column `ReminderMail.createdAt`.
   */
  createdAt?: string;
}
type ReminderMailParentsInputs<TPath extends string[]> = {

};
type ReminderMailChildrenInputs<TPath extends string[]> = {

};
type ReminderMailInputs<TPath extends string[]> = Inputs<
  ReminderMailScalars,
  ReminderMailParentsInputs<TPath>,
  ReminderMailChildrenInputs<TPath>
>;
type ReminderMailChildInputs<TPath extends string[]> = ChildInputs<ReminderMailInputs<TPath>>;
type ReminderMailParentInputs<TPath extends string[]> = ParentInputs<
ReminderMailInputs<TPath>,
  TPath
>;
type ResetPasswordRequestScalars = {
  /**
   * Column `ResetPasswordRequest.id`.
   */
  id: string;
  /**
   * Column `ResetPasswordRequest.createdAt`.
   */
  createdAt?: string;
  /**
   * Column `ResetPasswordRequest.updatedAt`.
   */
  updatedAt: string;
  /**
   * Column `ResetPasswordRequest.email`.
   */
  email: string;
  /**
   * Column `ResetPasswordRequest.expires`.
   */
  expires: string;
}
type ResetPasswordRequestParentsInputs<TPath extends string[]> = {

};
type ResetPasswordRequestChildrenInputs<TPath extends string[]> = {

};
type ResetPasswordRequestInputs<TPath extends string[]> = Inputs<
  ResetPasswordRequestScalars,
  ResetPasswordRequestParentsInputs<TPath>,
  ResetPasswordRequestChildrenInputs<TPath>
>;
type ResetPasswordRequestChildInputs<TPath extends string[]> = ChildInputs<ResetPasswordRequestInputs<TPath>>;
type ResetPasswordRequestParentInputs<TPath extends string[]> = ParentInputs<
ResetPasswordRequestInputs<TPath>,
  TPath
>;
type ScheduleScalars = {
  /**
   * Column `Schedule.id`.
   */
  id?: number;
  /**
   * Column `Schedule.userId`.
   */
  userId: number;
  /**
   * Column `Schedule.name`.
   */
  name: string;
  /**
   * Column `Schedule.timeZone`.
   */
  timeZone: string | null;
}
type ScheduleParentsInputs<TPath extends string[]> = {
  /**
   * Relationship from table `Schedule` to table `users` through the column `Schedule.userId`.
   */
  users: OmitParentInputs<usersParentInputs<[...TPath, "users"]>, "Schedule", [...TPath, "users"]>;
};
type ScheduleChildrenInputs<TPath extends string[]> = {
  /**
  * Relationship from table `Schedule` to table `Availability` through the column `Availability.scheduleId`.
  */
  Availability: OmitChildInputs<AvailabilityChildInputs<[...TPath, "Availability"]>, "Schedule" | "scheduleId">;
  /**
  * Relationship from table `Schedule` to table `EventType` through the column `EventType.scheduleId`.
  */
  EventType: OmitChildInputs<EventTypeChildInputs<[...TPath, "EventType"]>, "Schedule" | "scheduleId">;
};
type ScheduleInputs<TPath extends string[]> = Inputs<
  ScheduleScalars,
  ScheduleParentsInputs<TPath>,
  ScheduleChildrenInputs<TPath>
>;
type ScheduleChildInputs<TPath extends string[]> = ChildInputs<ScheduleInputs<TPath>>;
type ScheduleParentInputs<TPath extends string[]> = ParentInputs<
ScheduleInputs<TPath>,
  TPath
>;
type SelectedCalendarScalars = {
  /**
   * Column `SelectedCalendar.userId`.
   */
  userId: number;
  /**
   * Column `SelectedCalendar.integration`.
   */
  integration: string;
  /**
   * Column `SelectedCalendar.externalId`.
   */
  externalId: string;
  /**
   * Column `SelectedCalendar.credentialId`.
   */
  credentialId: number | null;
}
type SelectedCalendarParentsInputs<TPath extends string[]> = {
  /**
   * Relationship from table `SelectedCalendar` to table `Credential` through the column `SelectedCalendar.credentialId`.
   */
  Credential: OmitParentInputs<CredentialParentInputs<[...TPath, "Credential"]>, "SelectedCalendar", [...TPath, "Credential"]>;
  /**
   * Relationship from table `SelectedCalendar` to table `users` through the column `SelectedCalendar.userId`.
   */
  users: OmitParentInputs<usersParentInputs<[...TPath, "users"]>, "SelectedCalendar", [...TPath, "users"]>;
};
type SelectedCalendarChildrenInputs<TPath extends string[]> = {

};
type SelectedCalendarInputs<TPath extends string[]> = Inputs<
  SelectedCalendarScalars,
  SelectedCalendarParentsInputs<TPath>,
  SelectedCalendarChildrenInputs<TPath>
>;
type SelectedCalendarChildInputs<TPath extends string[]> = ChildInputs<SelectedCalendarInputs<TPath>>;
type SelectedCalendarParentInputs<TPath extends string[]> = ParentInputs<
SelectedCalendarInputs<TPath>,
  TPath
>;
type SelectedSlotsScalars = {
  /**
   * Column `SelectedSlots.id`.
   */
  id?: number;
  /**
   * Column `SelectedSlots.eventTypeId`.
   */
  eventTypeId: number;
  /**
   * Column `SelectedSlots.userId`.
   */
  userId: number;
  /**
   * Column `SelectedSlots.slotUtcStartDate`.
   */
  slotUtcStartDate: string;
  /**
   * Column `SelectedSlots.slotUtcEndDate`.
   */
  slotUtcEndDate: string;
  /**
   * Column `SelectedSlots.uid`.
   */
  uid: string;
  /**
   * Column `SelectedSlots.releaseAt`.
   */
  releaseAt: string;
  /**
   * Column `SelectedSlots.isSeat`.
   */
  isSeat?: boolean;
}
type SelectedSlotsParentsInputs<TPath extends string[]> = {

};
type SelectedSlotsChildrenInputs<TPath extends string[]> = {

};
type SelectedSlotsInputs<TPath extends string[]> = Inputs<
  SelectedSlotsScalars,
  SelectedSlotsParentsInputs<TPath>,
  SelectedSlotsChildrenInputs<TPath>
>;
type SelectedSlotsChildInputs<TPath extends string[]> = ChildInputs<SelectedSlotsInputs<TPath>>;
type SelectedSlotsParentInputs<TPath extends string[]> = ParentInputs<
SelectedSlotsInputs<TPath>,
  TPath
>;
type SessionScalars = {
  /**
   * Column `Session.id`.
   */
  id: string;
  /**
   * Column `Session.sessionToken`.
   */
  sessionToken: string;
  /**
   * Column `Session.userId`.
   */
  userId: number;
  /**
   * Column `Session.expires`.
   */
  expires: string;
}
type SessionParentsInputs<TPath extends string[]> = {
  /**
   * Relationship from table `Session` to table `users` through the column `Session.userId`.
   */
  users: OmitParentInputs<usersParentInputs<[...TPath, "users"]>, "Session", [...TPath, "users"]>;
};
type SessionChildrenInputs<TPath extends string[]> = {

};
type SessionInputs<TPath extends string[]> = Inputs<
  SessionScalars,
  SessionParentsInputs<TPath>,
  SessionChildrenInputs<TPath>
>;
type SessionChildInputs<TPath extends string[]> = ChildInputs<SessionInputs<TPath>>;
type SessionParentInputs<TPath extends string[]> = ParentInputs<
SessionInputs<TPath>,
  TPath
>;
type TeamScalars = {
  /**
   * Column `Team.id`.
   */
  id?: number;
  /**
   * Column `Team.name`.
   */
  name: string;
  /**
   * Column `Team.slug`.
   */
  slug: string | null;
  /**
   * Column `Team.bio`.
   */
  bio: string | null;
  /**
   * Column `Team.hideBranding`.
   */
  hideBranding?: boolean;
  /**
   * Column `Team.logo`.
   */
  logo: string | null;
  /**
   * Column `Team.createdAt`.
   */
  createdAt?: string;
  /**
   * Column `Team.metadata`.
   */
  metadata: Json | null;
  /**
   * Column `Team.hideBookATeamMember`.
   */
  hideBookATeamMember?: boolean;
  /**
   * Column `Team.brandColor`.
   */
  brandColor?: string;
  /**
   * Column `Team.darkBrandColor`.
   */
  darkBrandColor?: string;
  /**
   * Column `Team.theme`.
   */
  theme: string | null;
  /**
   * Column `Team.appLogo`.
   */
  appLogo: string | null;
  /**
   * Column `Team.appIconLogo`.
   */
  appIconLogo: string | null;
  /**
   * Column `Team.parentId`.
   */
  parentId: number | null;
  /**
   * Column `Team.timeFormat`.
   */
  timeFormat: number | null;
  /**
   * Column `Team.timeZone`.
   */
  timeZone?: string;
  /**
   * Column `Team.weekStart`.
   */
  weekStart?: string;
  /**
   * Column `Team.isPrivate`.
   */
  isPrivate?: boolean;
}
type TeamParentsInputs<TPath extends string[]> = {
  /**
   * Relationship from table `Team` to table `Team` through the column `Team.parentId`.
   */
  Team: OmitParentInputs<TeamParentInputs<[...TPath, "Team"]>, "Team", [...TPath, "Team"]>;
};
type TeamChildrenInputs<TPath extends string[]> = {
  /**
  * Relationship from table `Team` to table `AccessCode` through the column `AccessCode.teamId`.
  */
  AccessCode: OmitChildInputs<AccessCodeChildInputs<[...TPath, "AccessCode"]>, "Team" | "teamId">;
  /**
  * Relationship from table `Team` to table `ApiKey` through the column `ApiKey.teamId`.
  */
  ApiKey: OmitChildInputs<ApiKeyChildInputs<[...TPath, "ApiKey"]>, "Team" | "teamId">;
  /**
  * Relationship from table `Team` to table `App_RoutingForms_Form` through the column `App_RoutingForms_Form.teamId`.
  */
  App_RoutingForms_Form: OmitChildInputs<App_RoutingForms_FormChildInputs<[...TPath, "App_RoutingForms_Form"]>, "Team" | "teamId">;
  /**
  * Relationship from table `Team` to table `Credential` through the column `Credential.teamId`.
  */
  Credential: OmitChildInputs<CredentialChildInputs<[...TPath, "Credential"]>, "Team" | "teamId">;
  /**
  * Relationship from table `Team` to table `EventType` through the column `EventType.teamId`.
  */
  EventType: OmitChildInputs<EventTypeChildInputs<[...TPath, "EventType"]>, "Team" | "teamId">;
  /**
  * Relationship from table `Team` to table `Membership` through the column `Membership.teamId`.
  */
  Membership: OmitChildInputs<MembershipChildInputs<[...TPath, "Membership"]>, "Team" | "teamId">;
  /**
  * Relationship from table `Team` to table `VerificationToken` through the column `VerificationToken.teamId`.
  */
  VerificationToken: OmitChildInputs<VerificationTokenChildInputs<[...TPath, "VerificationToken"]>, "Team" | "teamId">;
  /**
  * Relationship from table `Team` to table `VerifiedNumber` through the column `VerifiedNumber.teamId`.
  */
  VerifiedNumber: OmitChildInputs<VerifiedNumberChildInputs<[...TPath, "VerifiedNumber"]>, "Team" | "teamId">;
  /**
  * Relationship from table `Team` to table `Webhook` through the column `Webhook.teamId`.
  */
  Webhook: OmitChildInputs<WebhookChildInputs<[...TPath, "Webhook"]>, "Team" | "teamId">;
  /**
  * Relationship from table `Team` to table `Workflow` through the column `Workflow.teamId`.
  */
  Workflow: OmitChildInputs<WorkflowChildInputs<[...TPath, "Workflow"]>, "Team" | "teamId">;
  /**
  * Relationship from table `Team` to table `users` through the column `users.organizationId`.
  */
  users: OmitChildInputs<usersChildInputs<[...TPath, "users"]>, "Team" | "organizationId">;
};
type TeamInputs<TPath extends string[]> = Inputs<
  TeamScalars,
  TeamParentsInputs<TPath>,
  TeamChildrenInputs<TPath>
>;
type TeamChildInputs<TPath extends string[]> = ChildInputs<TeamInputs<TPath>>;
type TeamParentInputs<TPath extends string[]> = ParentInputs<
TeamInputs<TPath>,
  TPath
>;
type TempOrgRedirectScalars = {
  /**
   * Column `TempOrgRedirect.id`.
   */
  id?: number;
  /**
   * Column `TempOrgRedirect.from`.
   */
  from: string;
  /**
   * Column `TempOrgRedirect.fromOrgId`.
   */
  fromOrgId: number;
  /**
   * Column `TempOrgRedirect.type`.
   */
  type: RedirectTypeEnum;
  /**
   * Column `TempOrgRedirect.toUrl`.
   */
  toUrl: string;
  /**
   * Column `TempOrgRedirect.enabled`.
   */
  enabled?: boolean;
  /**
   * Column `TempOrgRedirect.createdAt`.
   */
  createdAt?: string;
  /**
   * Column `TempOrgRedirect.updatedAt`.
   */
  updatedAt: string;
}
type TempOrgRedirectParentsInputs<TPath extends string[]> = {

};
type TempOrgRedirectChildrenInputs<TPath extends string[]> = {

};
type TempOrgRedirectInputs<TPath extends string[]> = Inputs<
  TempOrgRedirectScalars,
  TempOrgRedirectParentsInputs<TPath>,
  TempOrgRedirectChildrenInputs<TPath>
>;
type TempOrgRedirectChildInputs<TPath extends string[]> = ChildInputs<TempOrgRedirectInputs<TPath>>;
type TempOrgRedirectParentInputs<TPath extends string[]> = ParentInputs<
TempOrgRedirectInputs<TPath>,
  TPath
>;
type VerificationTokenScalars = {
  /**
   * Column `VerificationToken.id`.
   */
  id?: number;
  /**
   * Column `VerificationToken.identifier`.
   */
  identifier: string;
  /**
   * Column `VerificationToken.token`.
   */
  token: string;
  /**
   * Column `VerificationToken.expires`.
   */
  expires: string;
  /**
   * Column `VerificationToken.createdAt`.
   */
  createdAt?: string;
  /**
   * Column `VerificationToken.updatedAt`.
   */
  updatedAt: string;
  /**
   * Column `VerificationToken.expiresInDays`.
   */
  expiresInDays: number | null;
  /**
   * Column `VerificationToken.teamId`.
   */
  teamId: number | null;
}
type VerificationTokenParentsInputs<TPath extends string[]> = {
  /**
   * Relationship from table `VerificationToken` to table `Team` through the column `VerificationToken.teamId`.
   */
  Team: OmitParentInputs<TeamParentInputs<[...TPath, "Team"]>, "VerificationToken", [...TPath, "Team"]>;
};
type VerificationTokenChildrenInputs<TPath extends string[]> = {

};
type VerificationTokenInputs<TPath extends string[]> = Inputs<
  VerificationTokenScalars,
  VerificationTokenParentsInputs<TPath>,
  VerificationTokenChildrenInputs<TPath>
>;
type VerificationTokenChildInputs<TPath extends string[]> = ChildInputs<VerificationTokenInputs<TPath>>;
type VerificationTokenParentInputs<TPath extends string[]> = ParentInputs<
VerificationTokenInputs<TPath>,
  TPath
>;
type VerifiedNumberScalars = {
  /**
   * Column `VerifiedNumber.id`.
   */
  id?: number;
  /**
   * Column `VerifiedNumber.userId`.
   */
  userId: number | null;
  /**
   * Column `VerifiedNumber.phoneNumber`.
   */
  phoneNumber: string;
  /**
   * Column `VerifiedNumber.teamId`.
   */
  teamId: number | null;
}
type VerifiedNumberParentsInputs<TPath extends string[]> = {
  /**
   * Relationship from table `VerifiedNumber` to table `Team` through the column `VerifiedNumber.teamId`.
   */
  Team: OmitParentInputs<TeamParentInputs<[...TPath, "Team"]>, "VerifiedNumber", [...TPath, "Team"]>;
  /**
   * Relationship from table `VerifiedNumber` to table `users` through the column `VerifiedNumber.userId`.
   */
  users: OmitParentInputs<usersParentInputs<[...TPath, "users"]>, "VerifiedNumber", [...TPath, "users"]>;
};
type VerifiedNumberChildrenInputs<TPath extends string[]> = {

};
type VerifiedNumberInputs<TPath extends string[]> = Inputs<
  VerifiedNumberScalars,
  VerifiedNumberParentsInputs<TPath>,
  VerifiedNumberChildrenInputs<TPath>
>;
type VerifiedNumberChildInputs<TPath extends string[]> = ChildInputs<VerifiedNumberInputs<TPath>>;
type VerifiedNumberParentInputs<TPath extends string[]> = ParentInputs<
VerifiedNumberInputs<TPath>,
  TPath
>;
type WebhookScalars = {
  /**
   * Column `Webhook.id`.
   */
  id: string;
  /**
   * Column `Webhook.userId`.
   */
  userId: number | null;
  /**
   * Column `Webhook.subscriberUrl`.
   */
  subscriberUrl: string;
  /**
   * Column `Webhook.createdAt`.
   */
  createdAt?: string;
  /**
   * Column `Webhook.active`.
   */
  active?: boolean;
  /**
   * Column `Webhook.eventTriggers`.
   */
  eventTriggers: WebhookTriggerEventsEnum[] | null;
  /**
   * Column `Webhook.payloadTemplate`.
   */
  payloadTemplate: string | null;
  /**
   * Column `Webhook.eventTypeId`.
   */
  eventTypeId: number | null;
  /**
   * Column `Webhook.appId`.
   */
  appId: string | null;
  /**
   * Column `Webhook.secret`.
   */
  secret: string | null;
  /**
   * Column `Webhook.teamId`.
   */
  teamId: number | null;
}
type WebhookParentsInputs<TPath extends string[]> = {
  /**
   * Relationship from table `Webhook` to table `App` through the column `Webhook.appId`.
   */
  App: OmitParentInputs<AppParentInputs<[...TPath, "App"]>, "Webhook", [...TPath, "App"]>;
  /**
   * Relationship from table `Webhook` to table `EventType` through the column `Webhook.eventTypeId`.
   */
  EventType: OmitParentInputs<EventTypeParentInputs<[...TPath, "EventType"]>, "Webhook", [...TPath, "EventType"]>;
  /**
   * Relationship from table `Webhook` to table `Team` through the column `Webhook.teamId`.
   */
  Team: OmitParentInputs<TeamParentInputs<[...TPath, "Team"]>, "Webhook", [...TPath, "Team"]>;
  /**
   * Relationship from table `Webhook` to table `users` through the column `Webhook.userId`.
   */
  users: OmitParentInputs<usersParentInputs<[...TPath, "users"]>, "Webhook", [...TPath, "users"]>;
};
type WebhookChildrenInputs<TPath extends string[]> = {

};
type WebhookInputs<TPath extends string[]> = Inputs<
  WebhookScalars,
  WebhookParentsInputs<TPath>,
  WebhookChildrenInputs<TPath>
>;
type WebhookChildInputs<TPath extends string[]> = ChildInputs<WebhookInputs<TPath>>;
type WebhookParentInputs<TPath extends string[]> = ParentInputs<
WebhookInputs<TPath>,
  TPath
>;
type WebhookScheduledTriggersScalars = {
  /**
   * Column `WebhookScheduledTriggers.id`.
   */
  id?: number;
  /**
   * Column `WebhookScheduledTriggers.jobName`.
   */
  jobName: string;
  /**
   * Column `WebhookScheduledTriggers.subscriberUrl`.
   */
  subscriberUrl: string;
  /**
   * Column `WebhookScheduledTriggers.payload`.
   */
  payload: string;
  /**
   * Column `WebhookScheduledTriggers.startAfter`.
   */
  startAfter: string;
  /**
   * Column `WebhookScheduledTriggers.retryCount`.
   */
  retryCount?: number;
  /**
   * Column `WebhookScheduledTriggers.createdAt`.
   */
  createdAt: string | null;
}
type WebhookScheduledTriggersParentsInputs<TPath extends string[]> = {

};
type WebhookScheduledTriggersChildrenInputs<TPath extends string[]> = {

};
type WebhookScheduledTriggersInputs<TPath extends string[]> = Inputs<
  WebhookScheduledTriggersScalars,
  WebhookScheduledTriggersParentsInputs<TPath>,
  WebhookScheduledTriggersChildrenInputs<TPath>
>;
type WebhookScheduledTriggersChildInputs<TPath extends string[]> = ChildInputs<WebhookScheduledTriggersInputs<TPath>>;
type WebhookScheduledTriggersParentInputs<TPath extends string[]> = ParentInputs<
WebhookScheduledTriggersInputs<TPath>,
  TPath
>;
type WorkflowScalars = {
  /**
   * Column `Workflow.id`.
   */
  id?: number;
  /**
   * Column `Workflow.name`.
   */
  name: string;
  /**
   * Column `Workflow.userId`.
   */
  userId: number | null;
  /**
   * Column `Workflow.trigger`.
   */
  trigger: WorkflowTriggerEventsEnum;
  /**
   * Column `Workflow.time`.
   */
  time: number | null;
  /**
   * Column `Workflow.timeUnit`.
   */
  timeUnit: TimeUnitEnum | null;
  /**
   * Column `Workflow.teamId`.
   */
  teamId: number | null;
  /**
   * Column `Workflow.position`.
   */
  position?: number;
}
type WorkflowParentsInputs<TPath extends string[]> = {
  /**
   * Relationship from table `Workflow` to table `Team` through the column `Workflow.teamId`.
   */
  Team: OmitParentInputs<TeamParentInputs<[...TPath, "Team"]>, "Workflow", [...TPath, "Team"]>;
  /**
   * Relationship from table `Workflow` to table `users` through the column `Workflow.userId`.
   */
  users: OmitParentInputs<usersParentInputs<[...TPath, "users"]>, "Workflow", [...TPath, "users"]>;
};
type WorkflowChildrenInputs<TPath extends string[]> = {
  /**
  * Relationship from table `Workflow` to table `WorkflowStep` through the column `WorkflowStep.workflowId`.
  */
  WorkflowStep: OmitChildInputs<WorkflowStepChildInputs<[...TPath, "WorkflowStep"]>, "Workflow" | "workflowId">;
  /**
  * Relationship from table `Workflow` to table `WorkflowsOnEventTypes` through the column `WorkflowsOnEventTypes.workflowId`.
  */
  WorkflowsOnEventTypes: OmitChildInputs<WorkflowsOnEventTypesChildInputs<[...TPath, "WorkflowsOnEventTypes"]>, "Workflow" | "workflowId">;
};
type WorkflowInputs<TPath extends string[]> = Inputs<
  WorkflowScalars,
  WorkflowParentsInputs<TPath>,
  WorkflowChildrenInputs<TPath>
>;
type WorkflowChildInputs<TPath extends string[]> = ChildInputs<WorkflowInputs<TPath>>;
type WorkflowParentInputs<TPath extends string[]> = ParentInputs<
WorkflowInputs<TPath>,
  TPath
>;
type WorkflowReminderScalars = {
  /**
   * Column `WorkflowReminder.id`.
   */
  id?: number;
  /**
   * Column `WorkflowReminder.bookingUid`.
   */
  bookingUid: string | null;
  /**
   * Column `WorkflowReminder.method`.
   */
  method: WorkflowMethodsEnum;
  /**
   * Column `WorkflowReminder.scheduledDate`.
   */
  scheduledDate: string;
  /**
   * Column `WorkflowReminder.referenceId`.
   */
  referenceId: string | null;
  /**
   * Column `WorkflowReminder.scheduled`.
   */
  scheduled: boolean;
  /**
   * Column `WorkflowReminder.workflowStepId`.
   */
  workflowStepId: number | null;
  /**
   * Column `WorkflowReminder.cancelled`.
   */
  cancelled: boolean | null;
  /**
   * Column `WorkflowReminder.seatReferenceId`.
   */
  seatReferenceId: string | null;
}
type WorkflowReminderParentsInputs<TPath extends string[]> = {
  /**
   * Relationship from table `WorkflowReminder` to table `Booking` through the column `WorkflowReminder.bookingUid`.
   */
  Booking: OmitParentInputs<BookingParentInputs<[...TPath, "Booking"]>, "WorkflowReminder", [...TPath, "Booking"]>;
  /**
   * Relationship from table `WorkflowReminder` to table `WorkflowStep` through the column `WorkflowReminder.workflowStepId`.
   */
  WorkflowStep: OmitParentInputs<WorkflowStepParentInputs<[...TPath, "WorkflowStep"]>, "WorkflowReminder", [...TPath, "WorkflowStep"]>;
};
type WorkflowReminderChildrenInputs<TPath extends string[]> = {

};
type WorkflowReminderInputs<TPath extends string[]> = Inputs<
  WorkflowReminderScalars,
  WorkflowReminderParentsInputs<TPath>,
  WorkflowReminderChildrenInputs<TPath>
>;
type WorkflowReminderChildInputs<TPath extends string[]> = ChildInputs<WorkflowReminderInputs<TPath>>;
type WorkflowReminderParentInputs<TPath extends string[]> = ParentInputs<
WorkflowReminderInputs<TPath>,
  TPath
>;
type WorkflowStepScalars = {
  /**
   * Column `WorkflowStep.id`.
   */
  id?: number;
  /**
   * Column `WorkflowStep.stepNumber`.
   */
  stepNumber: number;
  /**
   * Column `WorkflowStep.action`.
   */
  action: WorkflowActionsEnum;
  /**
   * Column `WorkflowStep.workflowId`.
   */
  workflowId: number;
  /**
   * Column `WorkflowStep.sendTo`.
   */
  sendTo: string | null;
  /**
   * Column `WorkflowStep.reminderBody`.
   */
  reminderBody: string | null;
  /**
   * Column `WorkflowStep.emailSubject`.
   */
  emailSubject: string | null;
  /**
   * Column `WorkflowStep.template`.
   */
  template?: WorkflowTemplatesEnum;
  /**
   * Column `WorkflowStep.numberRequired`.
   */
  numberRequired: boolean | null;
  /**
   * Column `WorkflowStep.sender`.
   */
  sender: string | null;
  /**
   * Column `WorkflowStep.numberVerificationPending`.
   */
  numberVerificationPending?: boolean;
  /**
   * Column `WorkflowStep.includeCalendarEvent`.
   */
  includeCalendarEvent?: boolean;
}
type WorkflowStepParentsInputs<TPath extends string[]> = {
  /**
   * Relationship from table `WorkflowStep` to table `Workflow` through the column `WorkflowStep.workflowId`.
   */
  Workflow: OmitParentInputs<WorkflowParentInputs<[...TPath, "Workflow"]>, "WorkflowStep", [...TPath, "Workflow"]>;
};
type WorkflowStepChildrenInputs<TPath extends string[]> = {
  /**
  * Relationship from table `WorkflowStep` to table `WorkflowReminder` through the column `WorkflowReminder.workflowStepId`.
  */
  WorkflowReminder: OmitChildInputs<WorkflowReminderChildInputs<[...TPath, "WorkflowReminder"]>, "WorkflowStep" | "workflowStepId">;
};
type WorkflowStepInputs<TPath extends string[]> = Inputs<
  WorkflowStepScalars,
  WorkflowStepParentsInputs<TPath>,
  WorkflowStepChildrenInputs<TPath>
>;
type WorkflowStepChildInputs<TPath extends string[]> = ChildInputs<WorkflowStepInputs<TPath>>;
type WorkflowStepParentInputs<TPath extends string[]> = ParentInputs<
WorkflowStepInputs<TPath>,
  TPath
>;
type WorkflowsOnEventTypesScalars = {
  /**
   * Column `WorkflowsOnEventTypes.id`.
   */
  id?: number;
  /**
   * Column `WorkflowsOnEventTypes.workflowId`.
   */
  workflowId: number;
  /**
   * Column `WorkflowsOnEventTypes.eventTypeId`.
   */
  eventTypeId: number;
}
type WorkflowsOnEventTypesParentsInputs<TPath extends string[]> = {
  /**
   * Relationship from table `WorkflowsOnEventTypes` to table `EventType` through the column `WorkflowsOnEventTypes.eventTypeId`.
   */
  EventType: OmitParentInputs<EventTypeParentInputs<[...TPath, "EventType"]>, "WorkflowsOnEventTypes", [...TPath, "EventType"]>;
  /**
   * Relationship from table `WorkflowsOnEventTypes` to table `Workflow` through the column `WorkflowsOnEventTypes.workflowId`.
   */
  Workflow: OmitParentInputs<WorkflowParentInputs<[...TPath, "Workflow"]>, "WorkflowsOnEventTypes", [...TPath, "Workflow"]>;
};
type WorkflowsOnEventTypesChildrenInputs<TPath extends string[]> = {

};
type WorkflowsOnEventTypesInputs<TPath extends string[]> = Inputs<
  WorkflowsOnEventTypesScalars,
  WorkflowsOnEventTypesParentsInputs<TPath>,
  WorkflowsOnEventTypesChildrenInputs<TPath>
>;
type WorkflowsOnEventTypesChildInputs<TPath extends string[]> = ChildInputs<WorkflowsOnEventTypesInputs<TPath>>;
type WorkflowsOnEventTypesParentInputs<TPath extends string[]> = ParentInputs<
WorkflowsOnEventTypesInputs<TPath>,
  TPath
>;
type _prisma_migrationsScalars = {
  /**
   * Column `_prisma_migrations.id`.
   */
  id: string;
  /**
   * Column `_prisma_migrations.checksum`.
   */
  checksum: string;
  /**
   * Column `_prisma_migrations.finished_at`.
   */
  finished_at: string | null;
  /**
   * Column `_prisma_migrations.migration_name`.
   */
  migration_name: string;
  /**
   * Column `_prisma_migrations.logs`.
   */
  logs: string | null;
  /**
   * Column `_prisma_migrations.rolled_back_at`.
   */
  rolled_back_at: string | null;
  /**
   * Column `_prisma_migrations.started_at`.
   */
  started_at?: string;
  /**
   * Column `_prisma_migrations.applied_steps_count`.
   */
  applied_steps_count?: number;
}
type _prisma_migrationsParentsInputs<TPath extends string[]> = {

};
type _prisma_migrationsChildrenInputs<TPath extends string[]> = {

};
type _prisma_migrationsInputs<TPath extends string[]> = Inputs<
  _prisma_migrationsScalars,
  _prisma_migrationsParentsInputs<TPath>,
  _prisma_migrationsChildrenInputs<TPath>
>;
type _prisma_migrationsChildInputs<TPath extends string[]> = ChildInputs<_prisma_migrationsInputs<TPath>>;
type _prisma_migrationsParentInputs<TPath extends string[]> = ParentInputs<
_prisma_migrationsInputs<TPath>,
  TPath
>;
type _user_eventtypeScalars = {
  /**
   * Column `_user_eventtype.A`.
   */
  A: number;
  /**
   * Column `_user_eventtype.B`.
   */
  B: number;
}
type _user_eventtypeParentsInputs<TPath extends string[]> = {
  /**
   * Relationship from table `_user_eventtype` to table `EventType` through the column `_user_eventtype.A`.
   */
  EventType: OmitParentInputs<EventTypeParentInputs<[...TPath, "EventType"]>, "_user_eventtype", [...TPath, "EventType"]>;
  /**
   * Relationship from table `_user_eventtype` to table `users` through the column `_user_eventtype.B`.
   */
  users: OmitParentInputs<usersParentInputs<[...TPath, "users"]>, "_user_eventtype", [...TPath, "users"]>;
};
type _user_eventtypeChildrenInputs<TPath extends string[]> = {

};
type _user_eventtypeInputs<TPath extends string[]> = Inputs<
  _user_eventtypeScalars,
  _user_eventtypeParentsInputs<TPath>,
  _user_eventtypeChildrenInputs<TPath>
>;
type _user_eventtypeChildInputs<TPath extends string[]> = ChildInputs<_user_eventtypeInputs<TPath>>;
type _user_eventtypeParentInputs<TPath extends string[]> = ParentInputs<
_user_eventtypeInputs<TPath>,
  TPath
>;
type usersScalars = {
  /**
   * Column `users.id`.
   */
  id?: number;
  /**
   * Column `users.username`.
   */
  username: string | null;
  /**
   * Column `users.name`.
   */
  name: string | null;
  /**
   * Column `users.email`.
   */
  email: string;
  /**
   * Column `users.password`.
   */
  password: string | null;
  /**
   * Column `users.bio`.
   */
  bio: string | null;
  /**
   * Column `users.avatar`.
   */
  avatar: string | null;
  /**
   * Column `users.timeZone`.
   */
  timeZone?: string;
  /**
   * Column `users.weekStart`.
   */
  weekStart?: string;
  /**
   * Column `users.startTime`.
   */
  startTime?: number;
  /**
   * Column `users.endTime`.
   */
  endTime?: number;
  /**
   * Column `users.created`.
   */
  created?: string;
  /**
   * Column `users.bufferTime`.
   */
  bufferTime?: number;
  /**
   * Column `users.emailVerified`.
   */
  emailVerified: string | null;
  /**
   * Column `users.hideBranding`.
   */
  hideBranding?: boolean;
  /**
   * Column `users.theme`.
   */
  theme: string | null;
  /**
   * Column `users.completedOnboarding`.
   */
  completedOnboarding?: boolean;
  /**
   * Column `users.twoFactorEnabled`.
   */
  twoFactorEnabled?: boolean;
  /**
   * Column `users.twoFactorSecret`.
   */
  twoFactorSecret: string | null;
  /**
   * Column `users.locale`.
   */
  locale: string | null;
  /**
   * Column `users.brandColor`.
   */
  brandColor?: string;
  /**
   * Column `users.identityProvider`.
   */
  identityProvider?: IdentityProviderEnum;
  /**
   * Column `users.identityProviderId`.
   */
  identityProviderId: string | null;
  /**
   * Column `users.invitedTo`.
   */
  invitedTo: number | null;
  /**
   * Column `users.metadata`.
   */
  metadata: Json | null;
  /**
   * Column `users.away`.
   */
  away?: boolean;
  /**
   * Column `users.verified`.
   */
  verified: boolean | null;
  /**
   * Column `users.timeFormat`.
   */
  timeFormat: number | null;
  /**
   * Column `users.darkBrandColor`.
   */
  darkBrandColor?: string;
  /**
   * Column `users.trialEndsAt`.
   */
  trialEndsAt: string | null;
  /**
   * Column `users.defaultScheduleId`.
   */
  defaultScheduleId: number | null;
  /**
   * Column `users.allowDynamicBooking`.
   */
  allowDynamicBooking: boolean | null;
  /**
   * Column `users.role`.
   */
  role?: UserPermissionRoleEnum;
  /**
   * Column `users.disableImpersonation`.
   */
  disableImpersonation?: boolean;
  /**
   * Column `users.organizationId`.
   */
  organizationId: number | null;
  /**
   * Column `users.allowSEOIndexing`.
   */
  allowSEOIndexing: boolean | null;
  /**
   * Column `users.backupCodes`.
   */
  backupCodes: string | null;
  /**
   * Column `users.receiveMonthlyDigestEmail`.
   */
  receiveMonthlyDigestEmail: boolean | null;
}
type usersParentsInputs<TPath extends string[]> = {
  /**
   * Relationship from table `users` to table `Team` through the column `users.organizationId`.
   */
  Team: OmitParentInputs<TeamParentInputs<[...TPath, "Team"]>, "users", [...TPath, "Team"]>;
};
type usersChildrenInputs<TPath extends string[]> = {
  /**
  * Relationship from table `users` to table `AccessCode` through the column `AccessCode.userId`.
  */
  AccessCode: OmitChildInputs<AccessCodeChildInputs<[...TPath, "AccessCode"]>, "users" | "userId">;
  /**
  * Relationship from table `users` to table `Account` through the column `Account.userId`.
  */
  Account: OmitChildInputs<AccountChildInputs<[...TPath, "Account"]>, "users" | "userId">;
  /**
  * Relationship from table `users` to table `ApiKey` through the column `ApiKey.userId`.
  */
  ApiKey: OmitChildInputs<ApiKeyChildInputs<[...TPath, "ApiKey"]>, "users" | "userId">;
  /**
  * Relationship from table `users` to table `App_RoutingForms_Form` through the column `App_RoutingForms_Form.userId`.
  */
  App_RoutingForms_Form: OmitChildInputs<App_RoutingForms_FormChildInputs<[...TPath, "App_RoutingForms_Form"]>, "users" | "userId">;
  /**
  * Relationship from table `users` to table `Availability` through the column `Availability.userId`.
  */
  Availability: OmitChildInputs<AvailabilityChildInputs<[...TPath, "Availability"]>, "users" | "userId">;
  /**
  * Relationship from table `users` to table `Booking` through the column `Booking.userId`.
  */
  Booking: OmitChildInputs<BookingChildInputs<[...TPath, "Booking"]>, "users" | "userId">;
  /**
  * Relationship from table `users` to table `Credential` through the column `Credential.userId`.
  */
  Credential: OmitChildInputs<CredentialChildInputs<[...TPath, "Credential"]>, "users" | "userId">;
  /**
  * Relationship from table `users` to table `DestinationCalendar` through the column `DestinationCalendar.userId`.
  */
  DestinationCalendar: OmitChildInputs<DestinationCalendarChildInputs<[...TPath, "DestinationCalendar"]>, "users" | "userId">;
  /**
  * Relationship from table `users` to table `EventType` through the column `EventType.userId`.
  */
  EventType: OmitChildInputs<EventTypeChildInputs<[...TPath, "EventType"]>, "users" | "userId">;
  /**
  * Relationship from table `users` to table `Feedback` through the column `Feedback.userId`.
  */
  Feedback: OmitChildInputs<FeedbackChildInputs<[...TPath, "Feedback"]>, "users" | "userId">;
  /**
  * Relationship from table `users` to table `Host` through the column `Host.userId`.
  */
  Host: OmitChildInputs<HostChildInputs<[...TPath, "Host"]>, "users" | "userId">;
  /**
  * Relationship from table `users` to table `Impersonations` through the column `Impersonations.impersonatedById`.
  */
  Impersonations_Impersonations_impersonatedByIdTousers: OmitChildInputs<ImpersonationsChildInputs<[...TPath, "Impersonations_Impersonations_impersonatedByIdTousers"]>, "users_Impersonations_impersonatedByIdTousers" | "impersonatedById">;
  /**
  * Relationship from table `users` to table `Impersonations` through the column `Impersonations.impersonatedUserId`.
  */
  Impersonations_Impersonations_impersonatedUserIdTousers: OmitChildInputs<ImpersonationsChildInputs<[...TPath, "Impersonations_Impersonations_impersonatedUserIdTousers"]>, "users_Impersonations_impersonatedUserIdTousers" | "impersonatedUserId">;
  /**
  * Relationship from table `users` to table `Membership` through the column `Membership.userId`.
  */
  Membership: OmitChildInputs<MembershipChildInputs<[...TPath, "Membership"]>, "users" | "userId">;
  /**
  * Relationship from table `users` to table `Schedule` through the column `Schedule.userId`.
  */
  Schedule: OmitChildInputs<ScheduleChildInputs<[...TPath, "Schedule"]>, "users" | "userId">;
  /**
  * Relationship from table `users` to table `SelectedCalendar` through the column `SelectedCalendar.userId`.
  */
  SelectedCalendar: OmitChildInputs<SelectedCalendarChildInputs<[...TPath, "SelectedCalendar"]>, "users" | "userId">;
  /**
  * Relationship from table `users` to table `Session` through the column `Session.userId`.
  */
  Session: OmitChildInputs<SessionChildInputs<[...TPath, "Session"]>, "users" | "userId">;
  /**
  * Relationship from table `users` to table `VerifiedNumber` through the column `VerifiedNumber.userId`.
  */
  VerifiedNumber: OmitChildInputs<VerifiedNumberChildInputs<[...TPath, "VerifiedNumber"]>, "users" | "userId">;
  /**
  * Relationship from table `users` to table `Webhook` through the column `Webhook.userId`.
  */
  Webhook: OmitChildInputs<WebhookChildInputs<[...TPath, "Webhook"]>, "users" | "userId">;
  /**
  * Relationship from table `users` to table `Workflow` through the column `Workflow.userId`.
  */
  Workflow: OmitChildInputs<WorkflowChildInputs<[...TPath, "Workflow"]>, "users" | "userId">;
  /**
  * Relationship from table `users` to table `_user_eventtype` through the column `_user_eventtype.B`.
  */
  _user_eventtype: OmitChildInputs<_user_eventtypeChildInputs<[...TPath, "_user_eventtype"]>, "users" | "B">;
};
type usersInputs<TPath extends string[]> = Inputs<
  usersScalars,
  usersParentsInputs<TPath>,
  usersChildrenInputs<TPath>
>;
type usersChildInputs<TPath extends string[]> = ChildInputs<usersInputs<TPath>>;
type usersParentInputs<TPath extends string[]> = ParentInputs<
usersInputs<TPath>,
  TPath
>;
type AccessCodeParentsGraph = {
 OAuthClient: OmitChildGraph<OAuthClientGraph, "AccessCode">;
 Team: OmitChildGraph<TeamGraph, "AccessCode">;
 users: OmitChildGraph<usersGraph, "AccessCode">;
};
type AccessCodeChildrenGraph = {

};
type AccessCodeGraph = Array<{
  Scalars: AccessCodeScalars;
  Parents: AccessCodeParentsGraph;
  Children: AccessCodeChildrenGraph;
}>;
type AccountParentsGraph = {
 users: OmitChildGraph<usersGraph, "Account">;
};
type AccountChildrenGraph = {

};
type AccountGraph = Array<{
  Scalars: AccountScalars;
  Parents: AccountParentsGraph;
  Children: AccountChildrenGraph;
}>;
type ApiKeyParentsGraph = {
 App: OmitChildGraph<AppGraph, "ApiKey">;
 Team: OmitChildGraph<TeamGraph, "ApiKey">;
 users: OmitChildGraph<usersGraph, "ApiKey">;
};
type ApiKeyChildrenGraph = {

};
type ApiKeyGraph = Array<{
  Scalars: ApiKeyScalars;
  Parents: ApiKeyParentsGraph;
  Children: ApiKeyChildrenGraph;
}>;
type AppParentsGraph = {

};
type AppChildrenGraph = {
 ApiKey: OmitParentGraph<ApiKeyGraph, "App">;
 Credential: OmitParentGraph<CredentialGraph, "App">;
 Payment: OmitParentGraph<PaymentGraph, "App">;
 Webhook: OmitParentGraph<WebhookGraph, "App">;
};
type AppGraph = Array<{
  Scalars: AppScalars;
  Parents: AppParentsGraph;
  Children: AppChildrenGraph;
}>;
type App_RoutingForms_FormParentsGraph = {
 Team: OmitChildGraph<TeamGraph, "App_RoutingForms_Form">;
 users: OmitChildGraph<usersGraph, "App_RoutingForms_Form">;
};
type App_RoutingForms_FormChildrenGraph = {
 App_RoutingForms_FormResponse: OmitParentGraph<App_RoutingForms_FormResponseGraph, "App_RoutingForms_Form">;
};
type App_RoutingForms_FormGraph = Array<{
  Scalars: App_RoutingForms_FormScalars;
  Parents: App_RoutingForms_FormParentsGraph;
  Children: App_RoutingForms_FormChildrenGraph;
}>;
type App_RoutingForms_FormResponseParentsGraph = {
 App_RoutingForms_Form: OmitChildGraph<App_RoutingForms_FormGraph, "App_RoutingForms_FormResponse">;
};
type App_RoutingForms_FormResponseChildrenGraph = {

};
type App_RoutingForms_FormResponseGraph = Array<{
  Scalars: App_RoutingForms_FormResponseScalars;
  Parents: App_RoutingForms_FormResponseParentsGraph;
  Children: App_RoutingForms_FormResponseChildrenGraph;
}>;
type AttendeeParentsGraph = {
 Booking: OmitChildGraph<BookingGraph, "Attendee">;
};
type AttendeeChildrenGraph = {
 BookingSeat: OmitParentGraph<BookingSeatGraph, "Attendee">;
};
type AttendeeGraph = Array<{
  Scalars: AttendeeScalars;
  Parents: AttendeeParentsGraph;
  Children: AttendeeChildrenGraph;
}>;
type AvailabilityParentsGraph = {
 EventType: OmitChildGraph<EventTypeGraph, "Availability">;
 Schedule: OmitChildGraph<ScheduleGraph, "Availability">;
 users: OmitChildGraph<usersGraph, "Availability">;
};
type AvailabilityChildrenGraph = {

};
type AvailabilityGraph = Array<{
  Scalars: AvailabilityScalars;
  Parents: AvailabilityParentsGraph;
  Children: AvailabilityChildrenGraph;
}>;
type BookingParentsGraph = {
 DestinationCalendar: OmitChildGraph<DestinationCalendarGraph, "Booking">;
 EventType: OmitChildGraph<EventTypeGraph, "Booking">;
 users: OmitChildGraph<usersGraph, "Booking">;
};
type BookingChildrenGraph = {
 Attendee: OmitParentGraph<AttendeeGraph, "Booking">;
 BookingReference: OmitParentGraph<BookingReferenceGraph, "Booking">;
 BookingSeat: OmitParentGraph<BookingSeatGraph, "Booking">;
 Payment: OmitParentGraph<PaymentGraph, "Booking">;
 WorkflowReminder: OmitParentGraph<WorkflowReminderGraph, "Booking">;
};
type BookingGraph = Array<{
  Scalars: BookingScalars;
  Parents: BookingParentsGraph;
  Children: BookingChildrenGraph;
}>;
type BookingReferenceParentsGraph = {
 Booking: OmitChildGraph<BookingGraph, "BookingReference">;
};
type BookingReferenceChildrenGraph = {

};
type BookingReferenceGraph = Array<{
  Scalars: BookingReferenceScalars;
  Parents: BookingReferenceParentsGraph;
  Children: BookingReferenceChildrenGraph;
}>;
type BookingSeatParentsGraph = {
 Attendee: OmitChildGraph<AttendeeGraph, "BookingSeat">;
 Booking: OmitChildGraph<BookingGraph, "BookingSeat">;
};
type BookingSeatChildrenGraph = {

};
type BookingSeatGraph = Array<{
  Scalars: BookingSeatScalars;
  Parents: BookingSeatParentsGraph;
  Children: BookingSeatChildrenGraph;
}>;
type CalendarCacheParentsGraph = {
 Credential: OmitChildGraph<CredentialGraph, "CalendarCache">;
};
type CalendarCacheChildrenGraph = {

};
type CalendarCacheGraph = Array<{
  Scalars: CalendarCacheScalars;
  Parents: CalendarCacheParentsGraph;
  Children: CalendarCacheChildrenGraph;
}>;
type CredentialParentsGraph = {
 App: OmitChildGraph<AppGraph, "Credential">;
 Team: OmitChildGraph<TeamGraph, "Credential">;
 users: OmitChildGraph<usersGraph, "Credential">;
};
type CredentialChildrenGraph = {
 CalendarCache: OmitParentGraph<CalendarCacheGraph, "Credential">;
 DestinationCalendar: OmitParentGraph<DestinationCalendarGraph, "Credential">;
 SelectedCalendar: OmitParentGraph<SelectedCalendarGraph, "Credential">;
};
type CredentialGraph = Array<{
  Scalars: CredentialScalars;
  Parents: CredentialParentsGraph;
  Children: CredentialChildrenGraph;
}>;
type DeploymentParentsGraph = {

};
type DeploymentChildrenGraph = {

};
type DeploymentGraph = Array<{
  Scalars: DeploymentScalars;
  Parents: DeploymentParentsGraph;
  Children: DeploymentChildrenGraph;
}>;
type DestinationCalendarParentsGraph = {
 Credential: OmitChildGraph<CredentialGraph, "DestinationCalendar">;
 EventType: OmitChildGraph<EventTypeGraph, "DestinationCalendar">;
 users: OmitChildGraph<usersGraph, "DestinationCalendar">;
};
type DestinationCalendarChildrenGraph = {
 Booking: OmitParentGraph<BookingGraph, "DestinationCalendar">;
};
type DestinationCalendarGraph = Array<{
  Scalars: DestinationCalendarScalars;
  Parents: DestinationCalendarParentsGraph;
  Children: DestinationCalendarChildrenGraph;
}>;
type EventTypeParentsGraph = {
 EventType: OmitChildGraph<EventTypeGraph, "EventType">;
 Schedule: OmitChildGraph<ScheduleGraph, "EventType">;
 Team: OmitChildGraph<TeamGraph, "EventType">;
 users: OmitChildGraph<usersGraph, "EventType">;
};
type EventTypeChildrenGraph = {
 Availability: OmitParentGraph<AvailabilityGraph, "EventType">;
 Booking: OmitParentGraph<BookingGraph, "EventType">;
 DestinationCalendar: OmitParentGraph<DestinationCalendarGraph, "EventType">;
 EventTypeCustomInput: OmitParentGraph<EventTypeCustomInputGraph, "EventType">;
 HashedLink: OmitParentGraph<HashedLinkGraph, "EventType">;
 Host: OmitParentGraph<HostGraph, "EventType">;
 Webhook: OmitParentGraph<WebhookGraph, "EventType">;
 WorkflowsOnEventTypes: OmitParentGraph<WorkflowsOnEventTypesGraph, "EventType">;
 _user_eventtype: OmitParentGraph<_user_eventtypeGraph, "EventType">;
};
type EventTypeGraph = Array<{
  Scalars: EventTypeScalars;
  Parents: EventTypeParentsGraph;
  Children: EventTypeChildrenGraph;
}>;
type EventTypeCustomInputParentsGraph = {
 EventType: OmitChildGraph<EventTypeGraph, "EventTypeCustomInput">;
};
type EventTypeCustomInputChildrenGraph = {

};
type EventTypeCustomInputGraph = Array<{
  Scalars: EventTypeCustomInputScalars;
  Parents: EventTypeCustomInputParentsGraph;
  Children: EventTypeCustomInputChildrenGraph;
}>;
type FeatureParentsGraph = {

};
type FeatureChildrenGraph = {

};
type FeatureGraph = Array<{
  Scalars: FeatureScalars;
  Parents: FeatureParentsGraph;
  Children: FeatureChildrenGraph;
}>;
type FeedbackParentsGraph = {
 users: OmitChildGraph<usersGraph, "Feedback">;
};
type FeedbackChildrenGraph = {

};
type FeedbackGraph = Array<{
  Scalars: FeedbackScalars;
  Parents: FeedbackParentsGraph;
  Children: FeedbackChildrenGraph;
}>;
type HashedLinkParentsGraph = {
 EventType: OmitChildGraph<EventTypeGraph, "HashedLink">;
};
type HashedLinkChildrenGraph = {

};
type HashedLinkGraph = Array<{
  Scalars: HashedLinkScalars;
  Parents: HashedLinkParentsGraph;
  Children: HashedLinkChildrenGraph;
}>;
type HostParentsGraph = {
 EventType: OmitChildGraph<EventTypeGraph, "Host">;
 users: OmitChildGraph<usersGraph, "Host">;
};
type HostChildrenGraph = {

};
type HostGraph = Array<{
  Scalars: HostScalars;
  Parents: HostParentsGraph;
  Children: HostChildrenGraph;
}>;
type ImpersonationsParentsGraph = {
 users_Impersonations_impersonatedByIdTousers: OmitChildGraph<usersGraph, "Impersonations_Impersonations_impersonatedByIdTousers">;
 users_Impersonations_impersonatedUserIdTousers: OmitChildGraph<usersGraph, "Impersonations_Impersonations_impersonatedUserIdTousers">;
};
type ImpersonationsChildrenGraph = {

};
type ImpersonationsGraph = Array<{
  Scalars: ImpersonationsScalars;
  Parents: ImpersonationsParentsGraph;
  Children: ImpersonationsChildrenGraph;
}>;
type MembershipParentsGraph = {
 Team: OmitChildGraph<TeamGraph, "Membership">;
 users: OmitChildGraph<usersGraph, "Membership">;
};
type MembershipChildrenGraph = {

};
type MembershipGraph = Array<{
  Scalars: MembershipScalars;
  Parents: MembershipParentsGraph;
  Children: MembershipChildrenGraph;
}>;
type OAuthClientParentsGraph = {

};
type OAuthClientChildrenGraph = {
 AccessCode: OmitParentGraph<AccessCodeGraph, "OAuthClient">;
};
type OAuthClientGraph = Array<{
  Scalars: OAuthClientScalars;
  Parents: OAuthClientParentsGraph;
  Children: OAuthClientChildrenGraph;
}>;
type PaymentParentsGraph = {
 App: OmitChildGraph<AppGraph, "Payment">;
 Booking: OmitChildGraph<BookingGraph, "Payment">;
};
type PaymentChildrenGraph = {

};
type PaymentGraph = Array<{
  Scalars: PaymentScalars;
  Parents: PaymentParentsGraph;
  Children: PaymentChildrenGraph;
}>;
type ReminderMailParentsGraph = {

};
type ReminderMailChildrenGraph = {

};
type ReminderMailGraph = Array<{
  Scalars: ReminderMailScalars;
  Parents: ReminderMailParentsGraph;
  Children: ReminderMailChildrenGraph;
}>;
type ResetPasswordRequestParentsGraph = {

};
type ResetPasswordRequestChildrenGraph = {

};
type ResetPasswordRequestGraph = Array<{
  Scalars: ResetPasswordRequestScalars;
  Parents: ResetPasswordRequestParentsGraph;
  Children: ResetPasswordRequestChildrenGraph;
}>;
type ScheduleParentsGraph = {
 users: OmitChildGraph<usersGraph, "Schedule">;
};
type ScheduleChildrenGraph = {
 Availability: OmitParentGraph<AvailabilityGraph, "Schedule">;
 EventType: OmitParentGraph<EventTypeGraph, "Schedule">;
};
type ScheduleGraph = Array<{
  Scalars: ScheduleScalars;
  Parents: ScheduleParentsGraph;
  Children: ScheduleChildrenGraph;
}>;
type SelectedCalendarParentsGraph = {
 Credential: OmitChildGraph<CredentialGraph, "SelectedCalendar">;
 users: OmitChildGraph<usersGraph, "SelectedCalendar">;
};
type SelectedCalendarChildrenGraph = {

};
type SelectedCalendarGraph = Array<{
  Scalars: SelectedCalendarScalars;
  Parents: SelectedCalendarParentsGraph;
  Children: SelectedCalendarChildrenGraph;
}>;
type SelectedSlotsParentsGraph = {

};
type SelectedSlotsChildrenGraph = {

};
type SelectedSlotsGraph = Array<{
  Scalars: SelectedSlotsScalars;
  Parents: SelectedSlotsParentsGraph;
  Children: SelectedSlotsChildrenGraph;
}>;
type SessionParentsGraph = {
 users: OmitChildGraph<usersGraph, "Session">;
};
type SessionChildrenGraph = {

};
type SessionGraph = Array<{
  Scalars: SessionScalars;
  Parents: SessionParentsGraph;
  Children: SessionChildrenGraph;
}>;
type TeamParentsGraph = {
 Team: OmitChildGraph<TeamGraph, "Team">;
};
type TeamChildrenGraph = {
 AccessCode: OmitParentGraph<AccessCodeGraph, "Team">;
 ApiKey: OmitParentGraph<ApiKeyGraph, "Team">;
 App_RoutingForms_Form: OmitParentGraph<App_RoutingForms_FormGraph, "Team">;
 Credential: OmitParentGraph<CredentialGraph, "Team">;
 EventType: OmitParentGraph<EventTypeGraph, "Team">;
 Membership: OmitParentGraph<MembershipGraph, "Team">;
 VerificationToken: OmitParentGraph<VerificationTokenGraph, "Team">;
 VerifiedNumber: OmitParentGraph<VerifiedNumberGraph, "Team">;
 Webhook: OmitParentGraph<WebhookGraph, "Team">;
 Workflow: OmitParentGraph<WorkflowGraph, "Team">;
 users: OmitParentGraph<usersGraph, "Team">;
};
type TeamGraph = Array<{
  Scalars: TeamScalars;
  Parents: TeamParentsGraph;
  Children: TeamChildrenGraph;
}>;
type TempOrgRedirectParentsGraph = {

};
type TempOrgRedirectChildrenGraph = {

};
type TempOrgRedirectGraph = Array<{
  Scalars: TempOrgRedirectScalars;
  Parents: TempOrgRedirectParentsGraph;
  Children: TempOrgRedirectChildrenGraph;
}>;
type VerificationTokenParentsGraph = {
 Team: OmitChildGraph<TeamGraph, "VerificationToken">;
};
type VerificationTokenChildrenGraph = {

};
type VerificationTokenGraph = Array<{
  Scalars: VerificationTokenScalars;
  Parents: VerificationTokenParentsGraph;
  Children: VerificationTokenChildrenGraph;
}>;
type VerifiedNumberParentsGraph = {
 Team: OmitChildGraph<TeamGraph, "VerifiedNumber">;
 users: OmitChildGraph<usersGraph, "VerifiedNumber">;
};
type VerifiedNumberChildrenGraph = {

};
type VerifiedNumberGraph = Array<{
  Scalars: VerifiedNumberScalars;
  Parents: VerifiedNumberParentsGraph;
  Children: VerifiedNumberChildrenGraph;
}>;
type WebhookParentsGraph = {
 App: OmitChildGraph<AppGraph, "Webhook">;
 EventType: OmitChildGraph<EventTypeGraph, "Webhook">;
 Team: OmitChildGraph<TeamGraph, "Webhook">;
 users: OmitChildGraph<usersGraph, "Webhook">;
};
type WebhookChildrenGraph = {

};
type WebhookGraph = Array<{
  Scalars: WebhookScalars;
  Parents: WebhookParentsGraph;
  Children: WebhookChildrenGraph;
}>;
type WebhookScheduledTriggersParentsGraph = {

};
type WebhookScheduledTriggersChildrenGraph = {

};
type WebhookScheduledTriggersGraph = Array<{
  Scalars: WebhookScheduledTriggersScalars;
  Parents: WebhookScheduledTriggersParentsGraph;
  Children: WebhookScheduledTriggersChildrenGraph;
}>;
type WorkflowParentsGraph = {
 Team: OmitChildGraph<TeamGraph, "Workflow">;
 users: OmitChildGraph<usersGraph, "Workflow">;
};
type WorkflowChildrenGraph = {
 WorkflowStep: OmitParentGraph<WorkflowStepGraph, "Workflow">;
 WorkflowsOnEventTypes: OmitParentGraph<WorkflowsOnEventTypesGraph, "Workflow">;
};
type WorkflowGraph = Array<{
  Scalars: WorkflowScalars;
  Parents: WorkflowParentsGraph;
  Children: WorkflowChildrenGraph;
}>;
type WorkflowReminderParentsGraph = {
 Booking: OmitChildGraph<BookingGraph, "WorkflowReminder">;
 WorkflowStep: OmitChildGraph<WorkflowStepGraph, "WorkflowReminder">;
};
type WorkflowReminderChildrenGraph = {

};
type WorkflowReminderGraph = Array<{
  Scalars: WorkflowReminderScalars;
  Parents: WorkflowReminderParentsGraph;
  Children: WorkflowReminderChildrenGraph;
}>;
type WorkflowStepParentsGraph = {
 Workflow: OmitChildGraph<WorkflowGraph, "WorkflowStep">;
};
type WorkflowStepChildrenGraph = {
 WorkflowReminder: OmitParentGraph<WorkflowReminderGraph, "WorkflowStep">;
};
type WorkflowStepGraph = Array<{
  Scalars: WorkflowStepScalars;
  Parents: WorkflowStepParentsGraph;
  Children: WorkflowStepChildrenGraph;
}>;
type WorkflowsOnEventTypesParentsGraph = {
 EventType: OmitChildGraph<EventTypeGraph, "WorkflowsOnEventTypes">;
 Workflow: OmitChildGraph<WorkflowGraph, "WorkflowsOnEventTypes">;
};
type WorkflowsOnEventTypesChildrenGraph = {

};
type WorkflowsOnEventTypesGraph = Array<{
  Scalars: WorkflowsOnEventTypesScalars;
  Parents: WorkflowsOnEventTypesParentsGraph;
  Children: WorkflowsOnEventTypesChildrenGraph;
}>;
type _prisma_migrationsParentsGraph = {

};
type _prisma_migrationsChildrenGraph = {

};
type _prisma_migrationsGraph = Array<{
  Scalars: _prisma_migrationsScalars;
  Parents: _prisma_migrationsParentsGraph;
  Children: _prisma_migrationsChildrenGraph;
}>;
type _user_eventtypeParentsGraph = {
 EventType: OmitChildGraph<EventTypeGraph, "_user_eventtype">;
 users: OmitChildGraph<usersGraph, "_user_eventtype">;
};
type _user_eventtypeChildrenGraph = {

};
type _user_eventtypeGraph = Array<{
  Scalars: _user_eventtypeScalars;
  Parents: _user_eventtypeParentsGraph;
  Children: _user_eventtypeChildrenGraph;
}>;
type usersParentsGraph = {
 Team: OmitChildGraph<TeamGraph, "users">;
};
type usersChildrenGraph = {
 AccessCode: OmitParentGraph<AccessCodeGraph, "users">;
 Account: OmitParentGraph<AccountGraph, "users">;
 ApiKey: OmitParentGraph<ApiKeyGraph, "users">;
 App_RoutingForms_Form: OmitParentGraph<App_RoutingForms_FormGraph, "users">;
 Availability: OmitParentGraph<AvailabilityGraph, "users">;
 Booking: OmitParentGraph<BookingGraph, "users">;
 Credential: OmitParentGraph<CredentialGraph, "users">;
 DestinationCalendar: OmitParentGraph<DestinationCalendarGraph, "users">;
 EventType: OmitParentGraph<EventTypeGraph, "users">;
 Feedback: OmitParentGraph<FeedbackGraph, "users">;
 Host: OmitParentGraph<HostGraph, "users">;
 Impersonations_Impersonations_impersonatedByIdTousers: OmitParentGraph<ImpersonationsGraph, "users_Impersonations_impersonatedByIdTousers">;
 Impersonations_Impersonations_impersonatedUserIdTousers: OmitParentGraph<ImpersonationsGraph, "users_Impersonations_impersonatedUserIdTousers">;
 Membership: OmitParentGraph<MembershipGraph, "users">;
 Schedule: OmitParentGraph<ScheduleGraph, "users">;
 SelectedCalendar: OmitParentGraph<SelectedCalendarGraph, "users">;
 Session: OmitParentGraph<SessionGraph, "users">;
 VerifiedNumber: OmitParentGraph<VerifiedNumberGraph, "users">;
 Webhook: OmitParentGraph<WebhookGraph, "users">;
 Workflow: OmitParentGraph<WorkflowGraph, "users">;
 _user_eventtype: OmitParentGraph<_user_eventtypeGraph, "users">;
};
type usersGraph = Array<{
  Scalars: usersScalars;
  Parents: usersParentsGraph;
  Children: usersChildrenGraph;
}>;
type Graph = {
  AccessCode: AccessCodeGraph;
  Account: AccountGraph;
  ApiKey: ApiKeyGraph;
  App: AppGraph;
  App_RoutingForms_Form: App_RoutingForms_FormGraph;
  App_RoutingForms_FormResponse: App_RoutingForms_FormResponseGraph;
  Attendee: AttendeeGraph;
  Availability: AvailabilityGraph;
  Booking: BookingGraph;
  BookingReference: BookingReferenceGraph;
  BookingSeat: BookingSeatGraph;
  CalendarCache: CalendarCacheGraph;
  Credential: CredentialGraph;
  Deployment: DeploymentGraph;
  DestinationCalendar: DestinationCalendarGraph;
  EventType: EventTypeGraph;
  EventTypeCustomInput: EventTypeCustomInputGraph;
  Feature: FeatureGraph;
  Feedback: FeedbackGraph;
  HashedLink: HashedLinkGraph;
  Host: HostGraph;
  Impersonations: ImpersonationsGraph;
  Membership: MembershipGraph;
  OAuthClient: OAuthClientGraph;
  Payment: PaymentGraph;
  ReminderMail: ReminderMailGraph;
  ResetPasswordRequest: ResetPasswordRequestGraph;
  Schedule: ScheduleGraph;
  SelectedCalendar: SelectedCalendarGraph;
  SelectedSlots: SelectedSlotsGraph;
  Session: SessionGraph;
  Team: TeamGraph;
  TempOrgRedirect: TempOrgRedirectGraph;
  VerificationToken: VerificationTokenGraph;
  VerifiedNumber: VerifiedNumberGraph;
  Webhook: WebhookGraph;
  WebhookScheduledTriggers: WebhookScheduledTriggersGraph;
  Workflow: WorkflowGraph;
  WorkflowReminder: WorkflowReminderGraph;
  WorkflowStep: WorkflowStepGraph;
  WorkflowsOnEventTypes: WorkflowsOnEventTypesGraph;
  _prisma_migrations: _prisma_migrationsGraph;
  _user_eventtype: _user_eventtypeGraph;
  users: usersGraph;
};
export type SnapletClient = {
  /**
   * Generate one or more `AccessCode`.
   * @example With static inputs:
   * ```ts
   * snaplet.AccessCode([{}, {}]);
   * ```
   * @example Using the `x` helper:
   * ```ts
   * snaplet.AccessCode((x) => x(3));
   * snaplet.AccessCode((x) => x({ min: 1, max: 10 }));
   * ```
   * @example Mixing both:
   * ```ts
   * snaplet.AccessCode((x) => [{}, ...x(3), {}]);
   * ```
   */
  AccessCode: (
    inputs: AccessCodeChildInputs<["AccessCode"]>,
    options?: PlanOptions,
  ) => Plan;
  /**
   * Generate one or more `Account`.
   * @example With static inputs:
   * ```ts
   * snaplet.Account([{}, {}]);
   * ```
   * @example Using the `x` helper:
   * ```ts
   * snaplet.Account((x) => x(3));
   * snaplet.Account((x) => x({ min: 1, max: 10 }));
   * ```
   * @example Mixing both:
   * ```ts
   * snaplet.Account((x) => [{}, ...x(3), {}]);
   * ```
   */
  Account: (
    inputs: AccountChildInputs<["Account"]>,
    options?: PlanOptions,
  ) => Plan;
  /**
   * Generate one or more `ApiKey`.
   * @example With static inputs:
   * ```ts
   * snaplet.ApiKey([{}, {}]);
   * ```
   * @example Using the `x` helper:
   * ```ts
   * snaplet.ApiKey((x) => x(3));
   * snaplet.ApiKey((x) => x({ min: 1, max: 10 }));
   * ```
   * @example Mixing both:
   * ```ts
   * snaplet.ApiKey((x) => [{}, ...x(3), {}]);
   * ```
   */
  ApiKey: (
    inputs: ApiKeyChildInputs<["ApiKey"]>,
    options?: PlanOptions,
  ) => Plan;
  /**
   * Generate one or more `App`.
   * @example With static inputs:
   * ```ts
   * snaplet.App([{}, {}]);
   * ```
   * @example Using the `x` helper:
   * ```ts
   * snaplet.App((x) => x(3));
   * snaplet.App((x) => x({ min: 1, max: 10 }));
   * ```
   * @example Mixing both:
   * ```ts
   * snaplet.App((x) => [{}, ...x(3), {}]);
   * ```
   */
  App: (
    inputs: AppChildInputs<["App"]>,
    options?: PlanOptions,
  ) => Plan;
  /**
   * Generate one or more `App_RoutingForms_Form`.
   * @example With static inputs:
   * ```ts
   * snaplet.App_RoutingForms_Form([{}, {}]);
   * ```
   * @example Using the `x` helper:
   * ```ts
   * snaplet.App_RoutingForms_Form((x) => x(3));
   * snaplet.App_RoutingForms_Form((x) => x({ min: 1, max: 10 }));
   * ```
   * @example Mixing both:
   * ```ts
   * snaplet.App_RoutingForms_Form((x) => [{}, ...x(3), {}]);
   * ```
   */
  App_RoutingForms_Form: (
    inputs: App_RoutingForms_FormChildInputs<["App_RoutingForms_Form"]>,
    options?: PlanOptions,
  ) => Plan;
  /**
   * Generate one or more `App_RoutingForms_FormResponse`.
   * @example With static inputs:
   * ```ts
   * snaplet.App_RoutingForms_FormResponse([{}, {}]);
   * ```
   * @example Using the `x` helper:
   * ```ts
   * snaplet.App_RoutingForms_FormResponse((x) => x(3));
   * snaplet.App_RoutingForms_FormResponse((x) => x({ min: 1, max: 10 }));
   * ```
   * @example Mixing both:
   * ```ts
   * snaplet.App_RoutingForms_FormResponse((x) => [{}, ...x(3), {}]);
   * ```
   */
  App_RoutingForms_FormResponse: (
    inputs: App_RoutingForms_FormResponseChildInputs<["App_RoutingForms_FormResponse"]>,
    options?: PlanOptions,
  ) => Plan;
  /**
   * Generate one or more `Attendee`.
   * @example With static inputs:
   * ```ts
   * snaplet.Attendee([{}, {}]);
   * ```
   * @example Using the `x` helper:
   * ```ts
   * snaplet.Attendee((x) => x(3));
   * snaplet.Attendee((x) => x({ min: 1, max: 10 }));
   * ```
   * @example Mixing both:
   * ```ts
   * snaplet.Attendee((x) => [{}, ...x(3), {}]);
   * ```
   */
  Attendee: (
    inputs: AttendeeChildInputs<["Attendee"]>,
    options?: PlanOptions,
  ) => Plan;
  /**
   * Generate one or more `Availability`.
   * @example With static inputs:
   * ```ts
   * snaplet.Availability([{}, {}]);
   * ```
   * @example Using the `x` helper:
   * ```ts
   * snaplet.Availability((x) => x(3));
   * snaplet.Availability((x) => x({ min: 1, max: 10 }));
   * ```
   * @example Mixing both:
   * ```ts
   * snaplet.Availability((x) => [{}, ...x(3), {}]);
   * ```
   */
  Availability: (
    inputs: AvailabilityChildInputs<["Availability"]>,
    options?: PlanOptions,
  ) => Plan;
  /**
   * Generate one or more `Booking`.
   * @example With static inputs:
   * ```ts
   * snaplet.Booking([{}, {}]);
   * ```
   * @example Using the `x` helper:
   * ```ts
   * snaplet.Booking((x) => x(3));
   * snaplet.Booking((x) => x({ min: 1, max: 10 }));
   * ```
   * @example Mixing both:
   * ```ts
   * snaplet.Booking((x) => [{}, ...x(3), {}]);
   * ```
   */
  Booking: (
    inputs: BookingChildInputs<["Booking"]>,
    options?: PlanOptions,
  ) => Plan;
  /**
   * Generate one or more `BookingReference`.
   * @example With static inputs:
   * ```ts
   * snaplet.BookingReference([{}, {}]);
   * ```
   * @example Using the `x` helper:
   * ```ts
   * snaplet.BookingReference((x) => x(3));
   * snaplet.BookingReference((x) => x({ min: 1, max: 10 }));
   * ```
   * @example Mixing both:
   * ```ts
   * snaplet.BookingReference((x) => [{}, ...x(3), {}]);
   * ```
   */
  BookingReference: (
    inputs: BookingReferenceChildInputs<["BookingReference"]>,
    options?: PlanOptions,
  ) => Plan;
  /**
   * Generate one or more `BookingSeat`.
   * @example With static inputs:
   * ```ts
   * snaplet.BookingSeat([{}, {}]);
   * ```
   * @example Using the `x` helper:
   * ```ts
   * snaplet.BookingSeat((x) => x(3));
   * snaplet.BookingSeat((x) => x({ min: 1, max: 10 }));
   * ```
   * @example Mixing both:
   * ```ts
   * snaplet.BookingSeat((x) => [{}, ...x(3), {}]);
   * ```
   */
  BookingSeat: (
    inputs: BookingSeatChildInputs<["BookingSeat"]>,
    options?: PlanOptions,
  ) => Plan;
  /**
   * Generate one or more `CalendarCache`.
   * @example With static inputs:
   * ```ts
   * snaplet.CalendarCache([{}, {}]);
   * ```
   * @example Using the `x` helper:
   * ```ts
   * snaplet.CalendarCache((x) => x(3));
   * snaplet.CalendarCache((x) => x({ min: 1, max: 10 }));
   * ```
   * @example Mixing both:
   * ```ts
   * snaplet.CalendarCache((x) => [{}, ...x(3), {}]);
   * ```
   */
  CalendarCache: (
    inputs: CalendarCacheChildInputs<["CalendarCache"]>,
    options?: PlanOptions,
  ) => Plan;
  /**
   * Generate one or more `Credential`.
   * @example With static inputs:
   * ```ts
   * snaplet.Credential([{}, {}]);
   * ```
   * @example Using the `x` helper:
   * ```ts
   * snaplet.Credential((x) => x(3));
   * snaplet.Credential((x) => x({ min: 1, max: 10 }));
   * ```
   * @example Mixing both:
   * ```ts
   * snaplet.Credential((x) => [{}, ...x(3), {}]);
   * ```
   */
  Credential: (
    inputs: CredentialChildInputs<["Credential"]>,
    options?: PlanOptions,
  ) => Plan;
  /**
   * Generate one or more `Deployment`.
   * @example With static inputs:
   * ```ts
   * snaplet.Deployment([{}, {}]);
   * ```
   * @example Using the `x` helper:
   * ```ts
   * snaplet.Deployment((x) => x(3));
   * snaplet.Deployment((x) => x({ min: 1, max: 10 }));
   * ```
   * @example Mixing both:
   * ```ts
   * snaplet.Deployment((x) => [{}, ...x(3), {}]);
   * ```
   */
  Deployment: (
    inputs: DeploymentChildInputs<["Deployment"]>,
    options?: PlanOptions,
  ) => Plan;
  /**
   * Generate one or more `DestinationCalendar`.
   * @example With static inputs:
   * ```ts
   * snaplet.DestinationCalendar([{}, {}]);
   * ```
   * @example Using the `x` helper:
   * ```ts
   * snaplet.DestinationCalendar((x) => x(3));
   * snaplet.DestinationCalendar((x) => x({ min: 1, max: 10 }));
   * ```
   * @example Mixing both:
   * ```ts
   * snaplet.DestinationCalendar((x) => [{}, ...x(3), {}]);
   * ```
   */
  DestinationCalendar: (
    inputs: DestinationCalendarChildInputs<["DestinationCalendar"]>,
    options?: PlanOptions,
  ) => Plan;
  /**
   * Generate one or more `EventType`.
   * @example With static inputs:
   * ```ts
   * snaplet.EventType([{}, {}]);
   * ```
   * @example Using the `x` helper:
   * ```ts
   * snaplet.EventType((x) => x(3));
   * snaplet.EventType((x) => x({ min: 1, max: 10 }));
   * ```
   * @example Mixing both:
   * ```ts
   * snaplet.EventType((x) => [{}, ...x(3), {}]);
   * ```
   */
  EventType: (
    inputs: EventTypeChildInputs<["EventType"]>,
    options?: PlanOptions,
  ) => Plan;
  /**
   * Generate one or more `EventTypeCustomInput`.
   * @example With static inputs:
   * ```ts
   * snaplet.EventTypeCustomInput([{}, {}]);
   * ```
   * @example Using the `x` helper:
   * ```ts
   * snaplet.EventTypeCustomInput((x) => x(3));
   * snaplet.EventTypeCustomInput((x) => x({ min: 1, max: 10 }));
   * ```
   * @example Mixing both:
   * ```ts
   * snaplet.EventTypeCustomInput((x) => [{}, ...x(3), {}]);
   * ```
   */
  EventTypeCustomInput: (
    inputs: EventTypeCustomInputChildInputs<["EventTypeCustomInput"]>,
    options?: PlanOptions,
  ) => Plan;
  /**
   * Generate one or more `Feature`.
   * @example With static inputs:
   * ```ts
   * snaplet.Feature([{}, {}]);
   * ```
   * @example Using the `x` helper:
   * ```ts
   * snaplet.Feature((x) => x(3));
   * snaplet.Feature((x) => x({ min: 1, max: 10 }));
   * ```
   * @example Mixing both:
   * ```ts
   * snaplet.Feature((x) => [{}, ...x(3), {}]);
   * ```
   */
  Feature: (
    inputs: FeatureChildInputs<["Feature"]>,
    options?: PlanOptions,
  ) => Plan;
  /**
   * Generate one or more `Feedback`.
   * @example With static inputs:
   * ```ts
   * snaplet.Feedback([{}, {}]);
   * ```
   * @example Using the `x` helper:
   * ```ts
   * snaplet.Feedback((x) => x(3));
   * snaplet.Feedback((x) => x({ min: 1, max: 10 }));
   * ```
   * @example Mixing both:
   * ```ts
   * snaplet.Feedback((x) => [{}, ...x(3), {}]);
   * ```
   */
  Feedback: (
    inputs: FeedbackChildInputs<["Feedback"]>,
    options?: PlanOptions,
  ) => Plan;
  /**
   * Generate one or more `HashedLink`.
   * @example With static inputs:
   * ```ts
   * snaplet.HashedLink([{}, {}]);
   * ```
   * @example Using the `x` helper:
   * ```ts
   * snaplet.HashedLink((x) => x(3));
   * snaplet.HashedLink((x) => x({ min: 1, max: 10 }));
   * ```
   * @example Mixing both:
   * ```ts
   * snaplet.HashedLink((x) => [{}, ...x(3), {}]);
   * ```
   */
  HashedLink: (
    inputs: HashedLinkChildInputs<["HashedLink"]>,
    options?: PlanOptions,
  ) => Plan;
  /**
   * Generate one or more `Host`.
   * @example With static inputs:
   * ```ts
   * snaplet.Host([{}, {}]);
   * ```
   * @example Using the `x` helper:
   * ```ts
   * snaplet.Host((x) => x(3));
   * snaplet.Host((x) => x({ min: 1, max: 10 }));
   * ```
   * @example Mixing both:
   * ```ts
   * snaplet.Host((x) => [{}, ...x(3), {}]);
   * ```
   */
  Host: (
    inputs: HostChildInputs<["Host"]>,
    options?: PlanOptions,
  ) => Plan;
  /**
   * Generate one or more `Impersonations`.
   * @example With static inputs:
   * ```ts
   * snaplet.Impersonations([{}, {}]);
   * ```
   * @example Using the `x` helper:
   * ```ts
   * snaplet.Impersonations((x) => x(3));
   * snaplet.Impersonations((x) => x({ min: 1, max: 10 }));
   * ```
   * @example Mixing both:
   * ```ts
   * snaplet.Impersonations((x) => [{}, ...x(3), {}]);
   * ```
   */
  Impersonations: (
    inputs: ImpersonationsChildInputs<["Impersonations"]>,
    options?: PlanOptions,
  ) => Plan;
  /**
   * Generate one or more `Membership`.
   * @example With static inputs:
   * ```ts
   * snaplet.Membership([{}, {}]);
   * ```
   * @example Using the `x` helper:
   * ```ts
   * snaplet.Membership((x) => x(3));
   * snaplet.Membership((x) => x({ min: 1, max: 10 }));
   * ```
   * @example Mixing both:
   * ```ts
   * snaplet.Membership((x) => [{}, ...x(3), {}]);
   * ```
   */
  Membership: (
    inputs: MembershipChildInputs<["Membership"]>,
    options?: PlanOptions,
  ) => Plan;
  /**
   * Generate one or more `OAuthClient`.
   * @example With static inputs:
   * ```ts
   * snaplet.OAuthClient([{}, {}]);
   * ```
   * @example Using the `x` helper:
   * ```ts
   * snaplet.OAuthClient((x) => x(3));
   * snaplet.OAuthClient((x) => x({ min: 1, max: 10 }));
   * ```
   * @example Mixing both:
   * ```ts
   * snaplet.OAuthClient((x) => [{}, ...x(3), {}]);
   * ```
   */
  OAuthClient: (
    inputs: OAuthClientChildInputs<["OAuthClient"]>,
    options?: PlanOptions,
  ) => Plan;
  /**
   * Generate one or more `Payment`.
   * @example With static inputs:
   * ```ts
   * snaplet.Payment([{}, {}]);
   * ```
   * @example Using the `x` helper:
   * ```ts
   * snaplet.Payment((x) => x(3));
   * snaplet.Payment((x) => x({ min: 1, max: 10 }));
   * ```
   * @example Mixing both:
   * ```ts
   * snaplet.Payment((x) => [{}, ...x(3), {}]);
   * ```
   */
  Payment: (
    inputs: PaymentChildInputs<["Payment"]>,
    options?: PlanOptions,
  ) => Plan;
  /**
   * Generate one or more `ReminderMail`.
   * @example With static inputs:
   * ```ts
   * snaplet.ReminderMail([{}, {}]);
   * ```
   * @example Using the `x` helper:
   * ```ts
   * snaplet.ReminderMail((x) => x(3));
   * snaplet.ReminderMail((x) => x({ min: 1, max: 10 }));
   * ```
   * @example Mixing both:
   * ```ts
   * snaplet.ReminderMail((x) => [{}, ...x(3), {}]);
   * ```
   */
  ReminderMail: (
    inputs: ReminderMailChildInputs<["ReminderMail"]>,
    options?: PlanOptions,
  ) => Plan;
  /**
   * Generate one or more `ResetPasswordRequest`.
   * @example With static inputs:
   * ```ts
   * snaplet.ResetPasswordRequest([{}, {}]);
   * ```
   * @example Using the `x` helper:
   * ```ts
   * snaplet.ResetPasswordRequest((x) => x(3));
   * snaplet.ResetPasswordRequest((x) => x({ min: 1, max: 10 }));
   * ```
   * @example Mixing both:
   * ```ts
   * snaplet.ResetPasswordRequest((x) => [{}, ...x(3), {}]);
   * ```
   */
  ResetPasswordRequest: (
    inputs: ResetPasswordRequestChildInputs<["ResetPasswordRequest"]>,
    options?: PlanOptions,
  ) => Plan;
  /**
   * Generate one or more `Schedule`.
   * @example With static inputs:
   * ```ts
   * snaplet.Schedule([{}, {}]);
   * ```
   * @example Using the `x` helper:
   * ```ts
   * snaplet.Schedule((x) => x(3));
   * snaplet.Schedule((x) => x({ min: 1, max: 10 }));
   * ```
   * @example Mixing both:
   * ```ts
   * snaplet.Schedule((x) => [{}, ...x(3), {}]);
   * ```
   */
  Schedule: (
    inputs: ScheduleChildInputs<["Schedule"]>,
    options?: PlanOptions,
  ) => Plan;
  /**
   * Generate one or more `SelectedCalendar`.
   * @example With static inputs:
   * ```ts
   * snaplet.SelectedCalendar([{}, {}]);
   * ```
   * @example Using the `x` helper:
   * ```ts
   * snaplet.SelectedCalendar((x) => x(3));
   * snaplet.SelectedCalendar((x) => x({ min: 1, max: 10 }));
   * ```
   * @example Mixing both:
   * ```ts
   * snaplet.SelectedCalendar((x) => [{}, ...x(3), {}]);
   * ```
   */
  SelectedCalendar: (
    inputs: SelectedCalendarChildInputs<["SelectedCalendar"]>,
    options?: PlanOptions,
  ) => Plan;
  /**
   * Generate one or more `SelectedSlots`.
   * @example With static inputs:
   * ```ts
   * snaplet.SelectedSlots([{}, {}]);
   * ```
   * @example Using the `x` helper:
   * ```ts
   * snaplet.SelectedSlots((x) => x(3));
   * snaplet.SelectedSlots((x) => x({ min: 1, max: 10 }));
   * ```
   * @example Mixing both:
   * ```ts
   * snaplet.SelectedSlots((x) => [{}, ...x(3), {}]);
   * ```
   */
  SelectedSlots: (
    inputs: SelectedSlotsChildInputs<["SelectedSlots"]>,
    options?: PlanOptions,
  ) => Plan;
  /**
   * Generate one or more `Session`.
   * @example With static inputs:
   * ```ts
   * snaplet.Session([{}, {}]);
   * ```
   * @example Using the `x` helper:
   * ```ts
   * snaplet.Session((x) => x(3));
   * snaplet.Session((x) => x({ min: 1, max: 10 }));
   * ```
   * @example Mixing both:
   * ```ts
   * snaplet.Session((x) => [{}, ...x(3), {}]);
   * ```
   */
  Session: (
    inputs: SessionChildInputs<["Session"]>,
    options?: PlanOptions,
  ) => Plan;
  /**
   * Generate one or more `Team`.
   * @example With static inputs:
   * ```ts
   * snaplet.Team([{}, {}]);
   * ```
   * @example Using the `x` helper:
   * ```ts
   * snaplet.Team((x) => x(3));
   * snaplet.Team((x) => x({ min: 1, max: 10 }));
   * ```
   * @example Mixing both:
   * ```ts
   * snaplet.Team((x) => [{}, ...x(3), {}]);
   * ```
   */
  Team: (
    inputs: TeamChildInputs<["Team"]>,
    options?: PlanOptions,
  ) => Plan;
  /**
   * Generate one or more `TempOrgRedirect`.
   * @example With static inputs:
   * ```ts
   * snaplet.TempOrgRedirect([{}, {}]);
   * ```
   * @example Using the `x` helper:
   * ```ts
   * snaplet.TempOrgRedirect((x) => x(3));
   * snaplet.TempOrgRedirect((x) => x({ min: 1, max: 10 }));
   * ```
   * @example Mixing both:
   * ```ts
   * snaplet.TempOrgRedirect((x) => [{}, ...x(3), {}]);
   * ```
   */
  TempOrgRedirect: (
    inputs: TempOrgRedirectChildInputs<["TempOrgRedirect"]>,
    options?: PlanOptions,
  ) => Plan;
  /**
   * Generate one or more `VerificationToken`.
   * @example With static inputs:
   * ```ts
   * snaplet.VerificationToken([{}, {}]);
   * ```
   * @example Using the `x` helper:
   * ```ts
   * snaplet.VerificationToken((x) => x(3));
   * snaplet.VerificationToken((x) => x({ min: 1, max: 10 }));
   * ```
   * @example Mixing both:
   * ```ts
   * snaplet.VerificationToken((x) => [{}, ...x(3), {}]);
   * ```
   */
  VerificationToken: (
    inputs: VerificationTokenChildInputs<["VerificationToken"]>,
    options?: PlanOptions,
  ) => Plan;
  /**
   * Generate one or more `VerifiedNumber`.
   * @example With static inputs:
   * ```ts
   * snaplet.VerifiedNumber([{}, {}]);
   * ```
   * @example Using the `x` helper:
   * ```ts
   * snaplet.VerifiedNumber((x) => x(3));
   * snaplet.VerifiedNumber((x) => x({ min: 1, max: 10 }));
   * ```
   * @example Mixing both:
   * ```ts
   * snaplet.VerifiedNumber((x) => [{}, ...x(3), {}]);
   * ```
   */
  VerifiedNumber: (
    inputs: VerifiedNumberChildInputs<["VerifiedNumber"]>,
    options?: PlanOptions,
  ) => Plan;
  /**
   * Generate one or more `Webhook`.
   * @example With static inputs:
   * ```ts
   * snaplet.Webhook([{}, {}]);
   * ```
   * @example Using the `x` helper:
   * ```ts
   * snaplet.Webhook((x) => x(3));
   * snaplet.Webhook((x) => x({ min: 1, max: 10 }));
   * ```
   * @example Mixing both:
   * ```ts
   * snaplet.Webhook((x) => [{}, ...x(3), {}]);
   * ```
   */
  Webhook: (
    inputs: WebhookChildInputs<["Webhook"]>,
    options?: PlanOptions,
  ) => Plan;
  /**
   * Generate one or more `WebhookScheduledTriggers`.
   * @example With static inputs:
   * ```ts
   * snaplet.WebhookScheduledTriggers([{}, {}]);
   * ```
   * @example Using the `x` helper:
   * ```ts
   * snaplet.WebhookScheduledTriggers((x) => x(3));
   * snaplet.WebhookScheduledTriggers((x) => x({ min: 1, max: 10 }));
   * ```
   * @example Mixing both:
   * ```ts
   * snaplet.WebhookScheduledTriggers((x) => [{}, ...x(3), {}]);
   * ```
   */
  WebhookScheduledTriggers: (
    inputs: WebhookScheduledTriggersChildInputs<["WebhookScheduledTriggers"]>,
    options?: PlanOptions,
  ) => Plan;
  /**
   * Generate one or more `Workflow`.
   * @example With static inputs:
   * ```ts
   * snaplet.Workflow([{}, {}]);
   * ```
   * @example Using the `x` helper:
   * ```ts
   * snaplet.Workflow((x) => x(3));
   * snaplet.Workflow((x) => x({ min: 1, max: 10 }));
   * ```
   * @example Mixing both:
   * ```ts
   * snaplet.Workflow((x) => [{}, ...x(3), {}]);
   * ```
   */
  Workflow: (
    inputs: WorkflowChildInputs<["Workflow"]>,
    options?: PlanOptions,
  ) => Plan;
  /**
   * Generate one or more `WorkflowReminder`.
   * @example With static inputs:
   * ```ts
   * snaplet.WorkflowReminder([{}, {}]);
   * ```
   * @example Using the `x` helper:
   * ```ts
   * snaplet.WorkflowReminder((x) => x(3));
   * snaplet.WorkflowReminder((x) => x({ min: 1, max: 10 }));
   * ```
   * @example Mixing both:
   * ```ts
   * snaplet.WorkflowReminder((x) => [{}, ...x(3), {}]);
   * ```
   */
  WorkflowReminder: (
    inputs: WorkflowReminderChildInputs<["WorkflowReminder"]>,
    options?: PlanOptions,
  ) => Plan;
  /**
   * Generate one or more `WorkflowStep`.
   * @example With static inputs:
   * ```ts
   * snaplet.WorkflowStep([{}, {}]);
   * ```
   * @example Using the `x` helper:
   * ```ts
   * snaplet.WorkflowStep((x) => x(3));
   * snaplet.WorkflowStep((x) => x({ min: 1, max: 10 }));
   * ```
   * @example Mixing both:
   * ```ts
   * snaplet.WorkflowStep((x) => [{}, ...x(3), {}]);
   * ```
   */
  WorkflowStep: (
    inputs: WorkflowStepChildInputs<["WorkflowStep"]>,
    options?: PlanOptions,
  ) => Plan;
  /**
   * Generate one or more `WorkflowsOnEventTypes`.
   * @example With static inputs:
   * ```ts
   * snaplet.WorkflowsOnEventTypes([{}, {}]);
   * ```
   * @example Using the `x` helper:
   * ```ts
   * snaplet.WorkflowsOnEventTypes((x) => x(3));
   * snaplet.WorkflowsOnEventTypes((x) => x({ min: 1, max: 10 }));
   * ```
   * @example Mixing both:
   * ```ts
   * snaplet.WorkflowsOnEventTypes((x) => [{}, ...x(3), {}]);
   * ```
   */
  WorkflowsOnEventTypes: (
    inputs: WorkflowsOnEventTypesChildInputs<["WorkflowsOnEventTypes"]>,
    options?: PlanOptions,
  ) => Plan;
  /**
   * Generate one or more `_prisma_migrations`.
   * @example With static inputs:
   * ```ts
   * snaplet._prisma_migrations([{}, {}]);
   * ```
   * @example Using the `x` helper:
   * ```ts
   * snaplet._prisma_migrations((x) => x(3));
   * snaplet._prisma_migrations((x) => x({ min: 1, max: 10 }));
   * ```
   * @example Mixing both:
   * ```ts
   * snaplet._prisma_migrations((x) => [{}, ...x(3), {}]);
   * ```
   */
  _prisma_migrations: (
    inputs: _prisma_migrationsChildInputs<["_prisma_migrations"]>,
    options?: PlanOptions,
  ) => Plan;
  /**
   * Generate one or more `_user_eventtype`.
   * @example With static inputs:
   * ```ts
   * snaplet._user_eventtype([{}, {}]);
   * ```
   * @example Using the `x` helper:
   * ```ts
   * snaplet._user_eventtype((x) => x(3));
   * snaplet._user_eventtype((x) => x({ min: 1, max: 10 }));
   * ```
   * @example Mixing both:
   * ```ts
   * snaplet._user_eventtype((x) => [{}, ...x(3), {}]);
   * ```
   */
  _user_eventtype: (
    inputs: _user_eventtypeChildInputs<["_user_eventtype"]>,
    options?: PlanOptions,
  ) => Plan;
  /**
   * Generate one or more `users`.
   * @example With static inputs:
   * ```ts
   * snaplet.users([{}, {}]);
   * ```
   * @example Using the `x` helper:
   * ```ts
   * snaplet.users((x) => x(3));
   * snaplet.users((x) => x({ min: 1, max: 10 }));
   * ```
   * @example Mixing both:
   * ```ts
   * snaplet.users((x) => [{}, ...x(3), {}]);
   * ```
   */
  users: (
    inputs: usersChildInputs<["users"]>,
    options?: PlanOptions,
  ) => Plan;
  /**
   * Compose multiple plans together, injecting the store of the previous plan into the next plan.
   *
   * Learn more in the {@link https://docs.snaplet.dev/core-concepts/generate#using-pipe | documentation}.
   */
  $pipe: Pipe;
  /**
   * Compose multiple plans together, without injecting the store of the previous plan into the next plan.
   * All stores stay independent and are merged together once all the plans are generated.
   *
   * Learn more in the {@link https://docs.snaplet.dev/core-concepts/generate#using-merge | documentation}.
   */
  $merge: Merge;
  /**
   * Create a store instance.
   *
   * Learn more in the {@link https://docs.snaplet.dev/core-concepts/generate#augmenting-external-data-with-createstore | documentation}.
   */
  $createStore: CreateStore;
};
type ScalarField = {
  name: string;
  type: string;
};
type ObjectField = ScalarField & {
  relationFromFields: string[];
  relationToFields: string[];
};
type Inflection = {
  modelName?: (name: string) => string;
  scalarField?: (field: ScalarField) => string;
  parentField?: (field: ObjectField, oppositeBaseNameMap: Record<string, string>) => string;
  childField?: (field: ObjectField, oppositeField: ObjectField, oppositeBaseNameMap: Record<string, string>) => string;
  oppositeBaseNameMap?: Record<string, string>;
};
type Override = {
  AccessCode?: {
    name?: string;
    fields?: {
      id?: string;
      code?: string;
      clientId?: string;
      expiresAt?: string;
      scopes?: string;
      userId?: string;
      teamId?: string;
      OAuthClient?: string;
      Team?: string;
      users?: string;
    };
  }
  Account?: {
    name?: string;
    fields?: {
      id?: string;
      userId?: string;
      type?: string;
      provider?: string;
      providerAccountId?: string;
      refresh_token?: string;
      access_token?: string;
      expires_at?: string;
      token_type?: string;
      scope?: string;
      id_token?: string;
      session_state?: string;
      users?: string;
    };
  }
  ApiKey?: {
    name?: string;
    fields?: {
      id?: string;
      userId?: string;
      note?: string;
      createdAt?: string;
      expiresAt?: string;
      lastUsedAt?: string;
      hashedKey?: string;
      appId?: string;
      teamId?: string;
      App?: string;
      Team?: string;
      users?: string;
    };
  }
  App?: {
    name?: string;
    fields?: {
      slug?: string;
      dirName?: string;
      keys?: string;
      categories?: string;
      createdAt?: string;
      updatedAt?: string;
      enabled?: string;
      ApiKey?: string;
      Credential?: string;
      Payment?: string;
      Webhook?: string;
    };
  }
  App_RoutingForms_Form?: {
    name?: string;
    fields?: {
      id?: string;
      description?: string;
      routes?: string;
      createdAt?: string;
      updatedAt?: string;
      name?: string;
      fields?: string;
      userId?: string;
      disabled?: string;
      settings?: string;
      teamId?: string;
      position?: string;
      Team?: string;
      users?: string;
      App_RoutingForms_FormResponse?: string;
    };
  }
  App_RoutingForms_FormResponse?: {
    name?: string;
    fields?: {
      id?: string;
      formFillerId?: string;
      formId?: string;
      response?: string;
      createdAt?: string;
      App_RoutingForms_Form?: string;
    };
  }
  Attendee?: {
    name?: string;
    fields?: {
      id?: string;
      email?: string;
      name?: string;
      timeZone?: string;
      bookingId?: string;
      locale?: string;
      Booking?: string;
      BookingSeat?: string;
    };
  }
  Availability?: {
    name?: string;
    fields?: {
      id?: string;
      userId?: string;
      eventTypeId?: string;
      days?: string;
      date?: string;
      startTime?: string;
      endTime?: string;
      scheduleId?: string;
      EventType?: string;
      Schedule?: string;
      users?: string;
    };
  }
  Booking?: {
    name?: string;
    fields?: {
      id?: string;
      uid?: string;
      userId?: string;
      eventTypeId?: string;
      title?: string;
      description?: string;
      startTime?: string;
      endTime?: string;
      createdAt?: string;
      updatedAt?: string;
      location?: string;
      paid?: string;
      status?: string;
      cancellationReason?: string;
      rejectionReason?: string;
      fromReschedule?: string;
      rescheduled?: string;
      dynamicEventSlugRef?: string;
      dynamicGroupSlugRef?: string;
      recurringEventId?: string;
      customInputs?: string;
      smsReminderNumber?: string;
      destinationCalendarId?: string;
      scheduledJobs?: string;
      metadata?: string;
      responses?: string;
      isRecorded?: string;
      DestinationCalendar?: string;
      EventType?: string;
      users?: string;
      Attendee?: string;
      BookingReference?: string;
      BookingSeat?: string;
      Payment?: string;
      WorkflowReminder?: string;
    };
  }
  BookingReference?: {
    name?: string;
    fields?: {
      id?: string;
      type?: string;
      uid?: string;
      bookingId?: string;
      meetingId?: string;
      meetingPassword?: string;
      meetingUrl?: string;
      deleted?: string;
      externalCalendarId?: string;
      credentialId?: string;
      Booking?: string;
    };
  }
  BookingSeat?: {
    name?: string;
    fields?: {
      id?: string;
      referenceUid?: string;
      bookingId?: string;
      attendeeId?: string;
      data?: string;
      Attendee?: string;
      Booking?: string;
    };
  }
  CalendarCache?: {
    name?: string;
    fields?: {
      key?: string;
      value?: string;
      expiresAt?: string;
      credentialId?: string;
      Credential?: string;
    };
  }
  Credential?: {
    name?: string;
    fields?: {
      id?: string;
      type?: string;
      key?: string;
      userId?: string;
      appId?: string;
      invalid?: string;
      teamId?: string;
      App?: string;
      Team?: string;
      users?: string;
      CalendarCache?: string;
      DestinationCalendar?: string;
      SelectedCalendar?: string;
    };
  }
  Deployment?: {
    name?: string;
    fields?: {
      id?: string;
      logo?: string;
      theme?: string;
      licenseKey?: string;
      agreedLicenseAt?: string;
    };
  }
  DestinationCalendar?: {
    name?: string;
    fields?: {
      id?: string;
      integration?: string;
      externalId?: string;
      userId?: string;
      eventTypeId?: string;
      credentialId?: string;
      Credential?: string;
      EventType?: string;
      users?: string;
      Booking?: string;
    };
  }
  EventType?: {
    name?: string;
    fields?: {
      id?: string;
      title?: string;
      slug?: string;
      description?: string;
      locations?: string;
      length?: string;
      hidden?: string;
      userId?: string;
      eventName?: string;
      timeZone?: string;
      periodCountCalendarDays?: string;
      periodDays?: string;
      periodEndDate?: string;
      periodStartDate?: string;
      requiresConfirmation?: string;
      minimumBookingNotice?: string;
      currency?: string;
      price?: string;
      schedulingType?: string;
      teamId?: string;
      disableGuests?: string;
      position?: string;
      periodType?: string;
      slotInterval?: string;
      metadata?: string;
      afterEventBuffer?: string;
      beforeEventBuffer?: string;
      hideCalendarNotes?: string;
      successRedirectUrl?: string;
      seatsPerTimeSlot?: string;
      recurringEvent?: string;
      scheduleId?: string;
      bookingLimits?: string;
      seatsShowAttendees?: string;
      bookingFields?: string;
      durationLimits?: string;
      parentId?: string;
      offsetStart?: string;
      requiresBookerEmailVerification?: string;
      seatsShowAvailabilityCount?: string;
      lockTimeZoneToggleOnBookingPage?: string;
      EventType?: string;
      Schedule?: string;
      Team?: string;
      users?: string;
      Availability?: string;
      Booking?: string;
      DestinationCalendar?: string;
      EventType?: string;
      EventTypeCustomInput?: string;
      HashedLink?: string;
      Host?: string;
      Webhook?: string;
      WorkflowsOnEventTypes?: string;
      _user_eventtype?: string;
    };
  }
  EventTypeCustomInput?: {
    name?: string;
    fields?: {
      id?: string;
      eventTypeId?: string;
      label?: string;
      required?: string;
      type?: string;
      placeholder?: string;
      options?: string;
      EventType?: string;
    };
  }
  Feature?: {
    name?: string;
    fields?: {
      slug?: string;
      enabled?: string;
      description?: string;
      type?: string;
      stale?: string;
      lastUsedAt?: string;
      createdAt?: string;
      updatedAt?: string;
      updatedBy?: string;
    };
  }
  Feedback?: {
    name?: string;
    fields?: {
      id?: string;
      date?: string;
      userId?: string;
      rating?: string;
      comment?: string;
      users?: string;
    };
  }
  HashedLink?: {
    name?: string;
    fields?: {
      id?: string;
      link?: string;
      eventTypeId?: string;
      EventType?: string;
    };
  }
  Host?: {
    name?: string;
    fields?: {
      userId?: string;
      eventTypeId?: string;
      isFixed?: string;
      EventType?: string;
      users?: string;
    };
  }
  Impersonations?: {
    name?: string;
    fields?: {
      id?: string;
      createdAt?: string;
      impersonatedUserId?: string;
      impersonatedById?: string;
      users_Impersonations_impersonatedByIdTousers?: string;
      users_Impersonations_impersonatedUserIdTousers?: string;
    };
  }
  Membership?: {
    name?: string;
    fields?: {
      teamId?: string;
      userId?: string;
      accepted?: string;
      role?: string;
      disableImpersonation?: string;
      id?: string;
      Team?: string;
      users?: string;
    };
  }
  OAuthClient?: {
    name?: string;
    fields?: {
      clientId?: string;
      redirectUri?: string;
      clientSecret?: string;
      name?: string;
      logo?: string;
      AccessCode?: string;
    };
  }
  Payment?: {
    name?: string;
    fields?: {
      id?: string;
      uid?: string;
      bookingId?: string;
      amount?: string;
      fee?: string;
      currency?: string;
      success?: string;
      refunded?: string;
      data?: string;
      externalId?: string;
      appId?: string;
      paymentOption?: string;
      App?: string;
      Booking?: string;
    };
  }
  ReminderMail?: {
    name?: string;
    fields?: {
      id?: string;
      referenceId?: string;
      reminderType?: string;
      elapsedMinutes?: string;
      createdAt?: string;
    };
  }
  ResetPasswordRequest?: {
    name?: string;
    fields?: {
      id?: string;
      createdAt?: string;
      updatedAt?: string;
      email?: string;
      expires?: string;
    };
  }
  Schedule?: {
    name?: string;
    fields?: {
      id?: string;
      userId?: string;
      name?: string;
      timeZone?: string;
      users?: string;
      Availability?: string;
      EventType?: string;
    };
  }
  SelectedCalendar?: {
    name?: string;
    fields?: {
      userId?: string;
      integration?: string;
      externalId?: string;
      credentialId?: string;
      Credential?: string;
      users?: string;
    };
  }
  SelectedSlots?: {
    name?: string;
    fields?: {
      id?: string;
      eventTypeId?: string;
      userId?: string;
      slotUtcStartDate?: string;
      slotUtcEndDate?: string;
      uid?: string;
      releaseAt?: string;
      isSeat?: string;
    };
  }
  Session?: {
    name?: string;
    fields?: {
      id?: string;
      sessionToken?: string;
      userId?: string;
      expires?: string;
      users?: string;
    };
  }
  Team?: {
    name?: string;
    fields?: {
      id?: string;
      name?: string;
      slug?: string;
      bio?: string;
      hideBranding?: string;
      logo?: string;
      createdAt?: string;
      metadata?: string;
      hideBookATeamMember?: string;
      brandColor?: string;
      darkBrandColor?: string;
      theme?: string;
      appLogo?: string;
      appIconLogo?: string;
      parentId?: string;
      timeFormat?: string;
      timeZone?: string;
      weekStart?: string;
      isPrivate?: string;
      Team?: string;
      AccessCode?: string;
      ApiKey?: string;
      App_RoutingForms_Form?: string;
      Credential?: string;
      EventType?: string;
      Membership?: string;
      Team?: string;
      VerificationToken?: string;
      VerifiedNumber?: string;
      Webhook?: string;
      Workflow?: string;
      users?: string;
    };
  }
  TempOrgRedirect?: {
    name?: string;
    fields?: {
      id?: string;
      from?: string;
      fromOrgId?: string;
      type?: string;
      toUrl?: string;
      enabled?: string;
      createdAt?: string;
      updatedAt?: string;
    };
  }
  VerificationToken?: {
    name?: string;
    fields?: {
      id?: string;
      identifier?: string;
      token?: string;
      expires?: string;
      createdAt?: string;
      updatedAt?: string;
      expiresInDays?: string;
      teamId?: string;
      Team?: string;
    };
  }
  VerifiedNumber?: {
    name?: string;
    fields?: {
      id?: string;
      userId?: string;
      phoneNumber?: string;
      teamId?: string;
      Team?: string;
      users?: string;
    };
  }
  Webhook?: {
    name?: string;
    fields?: {
      id?: string;
      userId?: string;
      subscriberUrl?: string;
      createdAt?: string;
      active?: string;
      eventTriggers?: string;
      payloadTemplate?: string;
      eventTypeId?: string;
      appId?: string;
      secret?: string;
      teamId?: string;
      App?: string;
      EventType?: string;
      Team?: string;
      users?: string;
    };
  }
  WebhookScheduledTriggers?: {
    name?: string;
    fields?: {
      id?: string;
      jobName?: string;
      subscriberUrl?: string;
      payload?: string;
      startAfter?: string;
      retryCount?: string;
      createdAt?: string;
    };
  }
  Workflow?: {
    name?: string;
    fields?: {
      id?: string;
      name?: string;
      userId?: string;
      trigger?: string;
      time?: string;
      timeUnit?: string;
      teamId?: string;
      position?: string;
      Team?: string;
      users?: string;
      WorkflowStep?: string;
      WorkflowsOnEventTypes?: string;
    };
  }
  WorkflowReminder?: {
    name?: string;
    fields?: {
      id?: string;
      bookingUid?: string;
      method?: string;
      scheduledDate?: string;
      referenceId?: string;
      scheduled?: string;
      workflowStepId?: string;
      cancelled?: string;
      seatReferenceId?: string;
      Booking?: string;
      WorkflowStep?: string;
    };
  }
  WorkflowStep?: {
    name?: string;
    fields?: {
      id?: string;
      stepNumber?: string;
      action?: string;
      workflowId?: string;
      sendTo?: string;
      reminderBody?: string;
      emailSubject?: string;
      template?: string;
      numberRequired?: string;
      sender?: string;
      numberVerificationPending?: string;
      includeCalendarEvent?: string;
      Workflow?: string;
      WorkflowReminder?: string;
    };
  }
  WorkflowsOnEventTypes?: {
    name?: string;
    fields?: {
      id?: string;
      workflowId?: string;
      eventTypeId?: string;
      EventType?: string;
      Workflow?: string;
    };
  }
  _prisma_migrations?: {
    name?: string;
    fields?: {
      id?: string;
      checksum?: string;
      finished_at?: string;
      migration_name?: string;
      logs?: string;
      rolled_back_at?: string;
      started_at?: string;
      applied_steps_count?: string;
    };
  }
  _user_eventtype?: {
    name?: string;
    fields?: {
      A?: string;
      B?: string;
      EventType?: string;
      users?: string;
    };
  }
  users?: {
    name?: string;
    fields?: {
      id?: string;
      username?: string;
      name?: string;
      email?: string;
      password?: string;
      bio?: string;
      avatar?: string;
      timeZone?: string;
      weekStart?: string;
      startTime?: string;
      endTime?: string;
      created?: string;
      bufferTime?: string;
      emailVerified?: string;
      hideBranding?: string;
      theme?: string;
      completedOnboarding?: string;
      twoFactorEnabled?: string;
      twoFactorSecret?: string;
      locale?: string;
      brandColor?: string;
      identityProvider?: string;
      identityProviderId?: string;
      invitedTo?: string;
      metadata?: string;
      away?: string;
      verified?: string;
      timeFormat?: string;
      darkBrandColor?: string;
      trialEndsAt?: string;
      defaultScheduleId?: string;
      allowDynamicBooking?: string;
      role?: string;
      disableImpersonation?: string;
      organizationId?: string;
      allowSEOIndexing?: string;
      backupCodes?: string;
      receiveMonthlyDigestEmail?: string;
      Team?: string;
      AccessCode?: string;
      Account?: string;
      ApiKey?: string;
      App_RoutingForms_Form?: string;
      Availability?: string;
      Booking?: string;
      Credential?: string;
      DestinationCalendar?: string;
      EventType?: string;
      Feedback?: string;
      Host?: string;
      Impersonations_Impersonations_impersonatedByIdTousers?: string;
      Impersonations_Impersonations_impersonatedUserIdTousers?: string;
      Membership?: string;
      Schedule?: string;
      SelectedCalendar?: string;
      Session?: string;
      VerifiedNumber?: string;
      Webhook?: string;
      Workflow?: string;
      _user_eventtype?: string;
    };
  }}
export type Alias = {
  inflection?: Inflection | boolean;
  override?: Override;
};