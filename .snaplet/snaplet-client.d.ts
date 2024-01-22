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
      iCalSequence?: string;
      iCalUID?: string;
      DestinationCalendar?: string;
      EventType?: string;
      users?: string;
      Attendee?: string;
      BookingReference?: string;
      BookingSeat?: string;
      InstantMeetingToken?: string;
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
      thirdPartyRecurringEventId?: string;
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
      billingCycleStart?: string;
      paymentStatus?: string;
      subscriptionId?: string;
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
      onlyShowFirstAvailableSlot?: string;
      isInstantEvent?: string;
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
  InstantMeetingToken?: {
    name?: string;
    fields?: {
      id?: string;
      token?: string;
      expires?: string;
      teamId?: string;
      bookingId?: string;
      createdAt?: string;
      updatedAt?: string;
      Booking?: string;
      Team?: string;
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
  OutOfOfficeEntry?: {
    name?: string;
    fields?: {
      id?: string;
      uuid?: string;
      start?: string;
      end?: string;
      userId?: string;
      toUserId?: string;
      createdAt?: string;
      updatedAt?: string;
      users_OutOfOfficeEntry_toUserIdTousers?: string;
      users_OutOfOfficeEntry_userIdTousers?: string;
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
      logoUrl?: string;
      calVideoLogo?: string;
      pendingPayment?: string;
      Team?: string;
      AccessCode?: string;
      ApiKey?: string;
      App_RoutingForms_Form?: string;
      Credential?: string;
      EventType?: string;
      InstantMeetingToken?: string;
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
      isMandatoryReminder?: string;
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
  avatars?: {
    name?: string;
    fields?: {
      teamId?: string;
      userId?: string;
      data?: string;
      objectKey?: string;
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
      avatarUrl?: string;
      locked?: string;
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
      OutOfOfficeEntry_OutOfOfficeEntry_toUserIdTousers?: string;
      OutOfOfficeEntry_OutOfOfficeEntry_userIdTousers?: string;
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
interface FingerprintRelationField {
  count?: number | MinMaxOption;
}
interface FingerprintJsonField {
  schema?: any;
}
interface FingerprintDateField {
  options?: {
    minYear?: number;
    maxYear?: number;
  }
}
interface FingerprintNumberField {
  options?: {
    min?: number;
    max?: number;
  }
}
export interface Fingerprint {
  AccessCode?: {
    id?: FingerprintNumberField;
    expiresAt?: FingerprintDateField;
    userId?: FingerprintNumberField;
    teamId?: FingerprintNumberField;
    OAuthClient?: FingerprintRelationField;
    Team?: FingerprintRelationField;
    users?: FingerprintRelationField;
  }
  Account?: {
    userId?: FingerprintNumberField;
    expires_at?: FingerprintNumberField;
    users?: FingerprintRelationField;
  }
  ApiKey?: {
    userId?: FingerprintNumberField;
    createdAt?: FingerprintDateField;
    expiresAt?: FingerprintDateField;
    lastUsedAt?: FingerprintDateField;
    teamId?: FingerprintNumberField;
    App?: FingerprintRelationField;
    Team?: FingerprintRelationField;
    users?: FingerprintRelationField;
  }
  App?: {
    keys?: FingerprintJsonField;
    createdAt?: FingerprintDateField;
    updatedAt?: FingerprintDateField;
    ApiKey?: FingerprintRelationField;
    Credential?: FingerprintRelationField;
    Payment?: FingerprintRelationField;
    Webhook?: FingerprintRelationField;
  }
  App_RoutingForms_Form?: {
    routes?: FingerprintJsonField;
    createdAt?: FingerprintDateField;
    updatedAt?: FingerprintDateField;
    fields?: FingerprintJsonField;
    userId?: FingerprintNumberField;
    settings?: FingerprintJsonField;
    teamId?: FingerprintNumberField;
    position?: FingerprintNumberField;
    Team?: FingerprintRelationField;
    users?: FingerprintRelationField;
    App_RoutingForms_FormResponse?: FingerprintRelationField;
  }
  App_RoutingForms_FormResponse?: {
    id?: FingerprintNumberField;
    response?: FingerprintJsonField;
    createdAt?: FingerprintDateField;
    App_RoutingForms_Form?: FingerprintRelationField;
  }
  Attendee?: {
    id?: FingerprintNumberField;
    bookingId?: FingerprintNumberField;
    Booking?: FingerprintRelationField;
    BookingSeat?: FingerprintRelationField;
  }
  Availability?: {
    id?: FingerprintNumberField;
    userId?: FingerprintNumberField;
    eventTypeId?: FingerprintNumberField;
    date?: FingerprintDateField;
    scheduleId?: FingerprintNumberField;
    EventType?: FingerprintRelationField;
    Schedule?: FingerprintRelationField;
    users?: FingerprintRelationField;
  }
  Booking?: {
    id?: FingerprintNumberField;
    userId?: FingerprintNumberField;
    eventTypeId?: FingerprintNumberField;
    startTime?: FingerprintDateField;
    endTime?: FingerprintDateField;
    createdAt?: FingerprintDateField;
    updatedAt?: FingerprintDateField;
    customInputs?: FingerprintJsonField;
    destinationCalendarId?: FingerprintNumberField;
    metadata?: FingerprintJsonField;
    responses?: FingerprintJsonField;
    iCalSequence?: FingerprintNumberField;
    DestinationCalendar?: FingerprintRelationField;
    EventType?: FingerprintRelationField;
    users?: FingerprintRelationField;
    Attendee?: FingerprintRelationField;
    BookingReference?: FingerprintRelationField;
    BookingSeat?: FingerprintRelationField;
    InstantMeetingToken?: FingerprintRelationField;
    Payment?: FingerprintRelationField;
    WorkflowReminder?: FingerprintRelationField;
  }
  BookingReference?: {
    id?: FingerprintNumberField;
    bookingId?: FingerprintNumberField;
    credentialId?: FingerprintNumberField;
    Booking?: FingerprintRelationField;
  }
  BookingSeat?: {
    id?: FingerprintNumberField;
    bookingId?: FingerprintNumberField;
    attendeeId?: FingerprintNumberField;
    data?: FingerprintJsonField;
    Attendee?: FingerprintRelationField;
    Booking?: FingerprintRelationField;
  }
  CalendarCache?: {
    value?: FingerprintJsonField;
    expiresAt?: FingerprintDateField;
    credentialId?: FingerprintNumberField;
    Credential?: FingerprintRelationField;
  }
  Credential?: {
    id?: FingerprintNumberField;
    key?: FingerprintJsonField;
    userId?: FingerprintNumberField;
    teamId?: FingerprintNumberField;
    billingCycleStart?: FingerprintNumberField;
    App?: FingerprintRelationField;
    Team?: FingerprintRelationField;
    users?: FingerprintRelationField;
    CalendarCache?: FingerprintRelationField;
    DestinationCalendar?: FingerprintRelationField;
    SelectedCalendar?: FingerprintRelationField;
  }
  Deployment?: {
    id?: FingerprintNumberField;
    theme?: FingerprintJsonField;
    agreedLicenseAt?: FingerprintDateField;
  }
  DestinationCalendar?: {
    id?: FingerprintNumberField;
    userId?: FingerprintNumberField;
    eventTypeId?: FingerprintNumberField;
    credentialId?: FingerprintNumberField;
    Credential?: FingerprintRelationField;
    EventType?: FingerprintRelationField;
    users?: FingerprintRelationField;
    Booking?: FingerprintRelationField;
  }
  EventType?: {
    id?: FingerprintNumberField;
    locations?: FingerprintJsonField;
    length?: FingerprintNumberField;
    userId?: FingerprintNumberField;
    periodDays?: FingerprintNumberField;
    periodEndDate?: FingerprintDateField;
    periodStartDate?: FingerprintDateField;
    minimumBookingNotice?: FingerprintNumberField;
    price?: FingerprintNumberField;
    teamId?: FingerprintNumberField;
    position?: FingerprintNumberField;
    slotInterval?: FingerprintNumberField;
    metadata?: FingerprintJsonField;
    afterEventBuffer?: FingerprintNumberField;
    beforeEventBuffer?: FingerprintNumberField;
    seatsPerTimeSlot?: FingerprintNumberField;
    recurringEvent?: FingerprintJsonField;
    scheduleId?: FingerprintNumberField;
    bookingLimits?: FingerprintJsonField;
    bookingFields?: FingerprintJsonField;
    durationLimits?: FingerprintJsonField;
    parentId?: FingerprintNumberField;
    offsetStart?: FingerprintNumberField;
    EventType?: FingerprintRelationField;
    Schedule?: FingerprintRelationField;
    Team?: FingerprintRelationField;
    users?: FingerprintRelationField;
    Availability?: FingerprintRelationField;
    Booking?: FingerprintRelationField;
    DestinationCalendar?: FingerprintRelationField;
    EventType?: FingerprintRelationField;
    EventTypeCustomInput?: FingerprintRelationField;
    HashedLink?: FingerprintRelationField;
    Host?: FingerprintRelationField;
    Webhook?: FingerprintRelationField;
    WorkflowsOnEventTypes?: FingerprintRelationField;
    _user_eventtype?: FingerprintRelationField;
  }
  EventTypeCustomInput?: {
    id?: FingerprintNumberField;
    eventTypeId?: FingerprintNumberField;
    options?: FingerprintJsonField;
    EventType?: FingerprintRelationField;
  }
  Feature?: {
    lastUsedAt?: FingerprintDateField;
    createdAt?: FingerprintDateField;
    updatedAt?: FingerprintDateField;
    updatedBy?: FingerprintNumberField;
  }
  Feedback?: {
    id?: FingerprintNumberField;
    date?: FingerprintDateField;
    userId?: FingerprintNumberField;
    users?: FingerprintRelationField;
  }
  HashedLink?: {
    id?: FingerprintNumberField;
    eventTypeId?: FingerprintNumberField;
    EventType?: FingerprintRelationField;
  }
  Host?: {
    userId?: FingerprintNumberField;
    eventTypeId?: FingerprintNumberField;
    EventType?: FingerprintRelationField;
    users?: FingerprintRelationField;
  }
  Impersonations?: {
    id?: FingerprintNumberField;
    createdAt?: FingerprintDateField;
    impersonatedUserId?: FingerprintNumberField;
    impersonatedById?: FingerprintNumberField;
    users_Impersonations_impersonatedByIdTousers?: FingerprintRelationField;
    users_Impersonations_impersonatedUserIdTousers?: FingerprintRelationField;
  }
  InstantMeetingToken?: {
    id?: FingerprintNumberField;
    expires?: FingerprintDateField;
    teamId?: FingerprintNumberField;
    bookingId?: FingerprintNumberField;
    createdAt?: FingerprintDateField;
    updatedAt?: FingerprintDateField;
    Booking?: FingerprintRelationField;
    Team?: FingerprintRelationField;
  }
  Membership?: {
    teamId?: FingerprintNumberField;
    userId?: FingerprintNumberField;
    id?: FingerprintNumberField;
    Team?: FingerprintRelationField;
    users?: FingerprintRelationField;
  }
  OAuthClient?: {
    AccessCode?: FingerprintRelationField;
  }
  OutOfOfficeEntry?: {
    id?: FingerprintNumberField;
    start?: FingerprintDateField;
    end?: FingerprintDateField;
    userId?: FingerprintNumberField;
    toUserId?: FingerprintNumberField;
    createdAt?: FingerprintDateField;
    updatedAt?: FingerprintDateField;
    users_OutOfOfficeEntry_toUserIdTousers?: FingerprintRelationField;
    users_OutOfOfficeEntry_userIdTousers?: FingerprintRelationField;
  }
  Payment?: {
    id?: FingerprintNumberField;
    bookingId?: FingerprintNumberField;
    amount?: FingerprintNumberField;
    fee?: FingerprintNumberField;
    data?: FingerprintJsonField;
    App?: FingerprintRelationField;
    Booking?: FingerprintRelationField;
  }
  ReminderMail?: {
    id?: FingerprintNumberField;
    referenceId?: FingerprintNumberField;
    elapsedMinutes?: FingerprintNumberField;
    createdAt?: FingerprintDateField;
  }
  ResetPasswordRequest?: {
    createdAt?: FingerprintDateField;
    updatedAt?: FingerprintDateField;
    expires?: FingerprintDateField;
  }
  Schedule?: {
    id?: FingerprintNumberField;
    userId?: FingerprintNumberField;
    users?: FingerprintRelationField;
    Availability?: FingerprintRelationField;
    EventType?: FingerprintRelationField;
  }
  SelectedCalendar?: {
    userId?: FingerprintNumberField;
    credentialId?: FingerprintNumberField;
    Credential?: FingerprintRelationField;
    users?: FingerprintRelationField;
  }
  SelectedSlots?: {
    id?: FingerprintNumberField;
    eventTypeId?: FingerprintNumberField;
    userId?: FingerprintNumberField;
    slotUtcStartDate?: FingerprintDateField;
    slotUtcEndDate?: FingerprintDateField;
    releaseAt?: FingerprintDateField;
  }
  Session?: {
    userId?: FingerprintNumberField;
    expires?: FingerprintDateField;
    users?: FingerprintRelationField;
  }
  Team?: {
    id?: FingerprintNumberField;
    createdAt?: FingerprintDateField;
    metadata?: FingerprintJsonField;
    parentId?: FingerprintNumberField;
    timeFormat?: FingerprintNumberField;
    Team?: FingerprintRelationField;
    AccessCode?: FingerprintRelationField;
    ApiKey?: FingerprintRelationField;
    App_RoutingForms_Form?: FingerprintRelationField;
    Credential?: FingerprintRelationField;
    EventType?: FingerprintRelationField;
    InstantMeetingToken?: FingerprintRelationField;
    Membership?: FingerprintRelationField;
    Team?: FingerprintRelationField;
    VerificationToken?: FingerprintRelationField;
    VerifiedNumber?: FingerprintRelationField;
    Webhook?: FingerprintRelationField;
    Workflow?: FingerprintRelationField;
    users?: FingerprintRelationField;
  }
  TempOrgRedirect?: {
    id?: FingerprintNumberField;
    fromOrgId?: FingerprintNumberField;
    createdAt?: FingerprintDateField;
    updatedAt?: FingerprintDateField;
  }
  VerificationToken?: {
    id?: FingerprintNumberField;
    expires?: FingerprintDateField;
    createdAt?: FingerprintDateField;
    updatedAt?: FingerprintDateField;
    expiresInDays?: FingerprintNumberField;
    teamId?: FingerprintNumberField;
    Team?: FingerprintRelationField;
  }
  VerifiedNumber?: {
    id?: FingerprintNumberField;
    userId?: FingerprintNumberField;
    teamId?: FingerprintNumberField;
    Team?: FingerprintRelationField;
    users?: FingerprintRelationField;
  }
  Webhook?: {
    userId?: FingerprintNumberField;
    createdAt?: FingerprintDateField;
    eventTypeId?: FingerprintNumberField;
    teamId?: FingerprintNumberField;
    App?: FingerprintRelationField;
    EventType?: FingerprintRelationField;
    Team?: FingerprintRelationField;
    users?: FingerprintRelationField;
  }
  WebhookScheduledTriggers?: {
    id?: FingerprintNumberField;
    startAfter?: FingerprintDateField;
    retryCount?: FingerprintNumberField;
    createdAt?: FingerprintDateField;
  }
  Workflow?: {
    id?: FingerprintNumberField;
    userId?: FingerprintNumberField;
    time?: FingerprintNumberField;
    teamId?: FingerprintNumberField;
    position?: FingerprintNumberField;
    Team?: FingerprintRelationField;
    users?: FingerprintRelationField;
    WorkflowStep?: FingerprintRelationField;
    WorkflowsOnEventTypes?: FingerprintRelationField;
  }
  WorkflowReminder?: {
    id?: FingerprintNumberField;
    scheduledDate?: FingerprintDateField;
    workflowStepId?: FingerprintNumberField;
    Booking?: FingerprintRelationField;
    WorkflowStep?: FingerprintRelationField;
  }
  WorkflowStep?: {
    id?: FingerprintNumberField;
    stepNumber?: FingerprintNumberField;
    workflowId?: FingerprintNumberField;
    Workflow?: FingerprintRelationField;
    WorkflowReminder?: FingerprintRelationField;
  }
  WorkflowsOnEventTypes?: {
    id?: FingerprintNumberField;
    workflowId?: FingerprintNumberField;
    eventTypeId?: FingerprintNumberField;
    EventType?: FingerprintRelationField;
    Workflow?: FingerprintRelationField;
  }
  _prisma_migrations?: {
    finished_at?: FingerprintDateField;
    rolled_back_at?: FingerprintDateField;
    started_at?: FingerprintDateField;
    applied_steps_count?: FingerprintNumberField;
  }
  _user_eventtype?: {
    A?: FingerprintNumberField;
    B?: FingerprintNumberField;
    EventType?: FingerprintRelationField;
    users?: FingerprintRelationField;
  }
  avatars?: {
    teamId?: FingerprintNumberField;
    userId?: FingerprintNumberField;
  }
  users?: {
    id?: FingerprintNumberField;
    startTime?: FingerprintNumberField;
    endTime?: FingerprintNumberField;
    created?: FingerprintDateField;
    bufferTime?: FingerprintNumberField;
    emailVerified?: FingerprintDateField;
    invitedTo?: FingerprintNumberField;
    metadata?: FingerprintJsonField;
    timeFormat?: FingerprintNumberField;
    trialEndsAt?: FingerprintDateField;
    defaultScheduleId?: FingerprintNumberField;
    organizationId?: FingerprintNumberField;
    Team?: FingerprintRelationField;
    AccessCode?: FingerprintRelationField;
    Account?: FingerprintRelationField;
    ApiKey?: FingerprintRelationField;
    App_RoutingForms_Form?: FingerprintRelationField;
    Availability?: FingerprintRelationField;
    Booking?: FingerprintRelationField;
    Credential?: FingerprintRelationField;
    DestinationCalendar?: FingerprintRelationField;
    EventType?: FingerprintRelationField;
    Feedback?: FingerprintRelationField;
    Host?: FingerprintRelationField;
    Impersonations_Impersonations_impersonatedByIdTousers?: FingerprintRelationField;
    Impersonations_Impersonations_impersonatedUserIdTousers?: FingerprintRelationField;
    Membership?: FingerprintRelationField;
    OutOfOfficeEntry_OutOfOfficeEntry_toUserIdTousers?: FingerprintRelationField;
    OutOfOfficeEntry_OutOfOfficeEntry_userIdTousers?: FingerprintRelationField;
    Schedule?: FingerprintRelationField;
    SelectedCalendar?: FingerprintRelationField;
    Session?: FingerprintRelationField;
    VerifiedNumber?: FingerprintRelationField;
    Webhook?: FingerprintRelationField;
    Workflow?: FingerprintRelationField;
    _user_eventtype?: FingerprintRelationField;
  }}