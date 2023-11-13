import type { Plan, SnapletClient } from "./snaplet-client";

import type { Prisma, UserPermissionRole } from "@prisma/client";

import { uuid } from "short-uuid"

// @calcom/features
import { hashPassword } from "../packages/features/auth/lib/hashPassword.ts"
// @calcom/lib
import { DEFAULT_SCHEDULE, getAvailabilityFromSchedule } from "../packages/lib/availability.ts"
// @calcom/dayjs
import dayjs from "../packages/dayjs"

type CreateUserAndEventTypeParams = {
  user: {
    email: string;
    username: string;
    name: string;
    password: string;
    completedOnboarding?: boolean;
  },
  eventTypes?: Array<Prisma.EventTypeUncheckedCreateInput & {
    _bookings?: Prisma.BookingCreateInput[];
    _numBookings?: number;
  }>
}

/** create a user */
export const createUserAndEventType = async (
  snaplet: SnapletClient,
  params: CreateUserAndEventTypeParams
) => {
  const { user, eventTypes = [] } = params

  // default = true
  const isCompletedOnboarding = user.completedOnboarding ?? true

  const finalPlan: Plan[] = []

  finalPlan.push(snaplet.users([{
    ...user,
    password: await hashPassword(user.password),
    Schedule: isCompletedOnboarding ?
      [{
        name: "Working Hours",
        // {
        //   days: [ 1, 2, 3, 4, 5 ],
        //   startTime: 2023-11-09T09:00:00.000Z,
        //   endTime: 2023-11-09T17:00:00.000Z
        // }
        Availability: getAvailabilityFromSchedule(DEFAULT_SCHEDULE)
      }]
      : undefined
  }]))

  for (const eventType of eventTypes) {
    const { _bookings, _numBookings } = eventType

    let bookingFields: Prisma.BookingCreateInput[] = [];
    if (_bookings && _numBookings) {
      throw new Error("Cannot specify both _bookings and _numBookings")
    }

    if (_numBookings) {
      bookingFields = [...Array(_numBookings).keys()].map((i) => {
        return {
          // add 1 day, then add 5 minutes for each booking
          startTime: dayjs()
            .add(1, "day")
            .add(i * 5 + 0, "minutes")
            .toDate(),
          // add 1 day, then add 30 minutes for each booking
          endTime: dayjs()
            .add(1, "day")
            .add(i * 5 + 30, "minutes")
            .toDate(),
          title: `${eventType.title}:${i + 1}`,
          uid: uuid()
        }
      })
    }

    if (_bookings) {
      bookingFields = _bookings
    }

    for (const booking of bookingFields) {
      finalPlan.push(snaplet.Booking(booking))
    }
  }

  return finalPlan
}
