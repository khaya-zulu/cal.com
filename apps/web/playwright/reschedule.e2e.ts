import { expect } from "@playwright/test";

import dayjs from "@calcom/dayjs";
import { WEBAPP_URL } from "@calcom/lib/constants";
import prisma from "@calcom/prisma";
import { BookingStatus } from "@calcom/prisma/enums";
import { bookingMetadataSchema } from "@calcom/prisma/zod-utils";

import { test } from "./lib/fixtures";
import { selectFirstAvailableTimeSlotNextMonth, bookTimeSlot } from "./lib/testUtils";

const IS_STRIPE_ENABLED = !!(
  process.env.STRIPE_CLIENT_ID &&
  process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY &&
  process.env.STRIPE_PRIVATE_KEY
);

test.describe.configure({ mode: "parallel" });

test.afterEach(({ users }) => users.deleteAll());

test.describe("Reschedule Tests", async () => {
  test("Should do a booking request reschedule from /bookings", async ({ page, snaplet, prisma, bookings: fix }) => {
    // used to be `const user = await users.create();`
    const { users: seededUsers, EventType } = await snaplet.users([
      {
        EventType: (x) => x(3, () => ({ _user_eventtype: ({ data }) => [{ B: data.users }])),
        completedOnboarding: true,
      },
    ]);

    await snaplet._user_eventtype([{}], {
      connect: { EventType, users: seededUsers },
    });

    const { Booking: bookings } = await snaplet.Booking(
      [
        {
          status: "accepted",
          startTime: dayjs().add(1, "day").toDate().toISOString(),
          endTime: dayjs().add(1, "day").add(30, "minutes").toDate().toISOString(),
          Attendee: (x) => x(2),
        },
      ],
      {
        connect: { EventType, users: seededUsers },
      }
    );

    const user = seededUsers?.[0];

    // used to be `user.apiLogin();`
    // which is why I think we will just need update the user fixture
    const csrfToken = await page
      .context()
      .request.get("/api/auth/csrf")
      .then((response) => response.json())
      .then((json) => json.csrfToken);

    await page.context().request.post("/api/auth/callback/credentials", {
      data: {
        email: user?.email,
        // as the password is hashed, and by default the password is the username
        password: user?.username,
        callbackUrl: WEBAPP_URL,
        redirect: "false",
        json: "true",
        csrfToken,
      },
    });

    await page.goto("/bookings/upcoming");

    await page.locator('[data-testid="edit_booking"]').nth(0).click();

    await page.locator('[data-testid="reschedule_request"]').click();

    await page.fill('[data-testid="reschedule_reason"]', "I can't longer have it");

    await page.locator('button[data-testid="send_request"]').click();
    await expect(page.locator('[id="modal-title"]')).toBeHidden();

    // used to be `const updatedBooking = await booking.self();`
    const updatedBooking = await prisma.booking.findUnique({
      where: { id: bookings?.[0].id },
      include: { attendees: true, seatsReferences: true },
    });

    expect(updatedBooking?.rescheduled).toBe(true);
    expect(updatedBooking?.cancellationReason).toBe("I can't longer have it");
    expect(updatedBooking?.status).toBe(BookingStatus.CANCELLED);
  });

  test("Should display former time when rescheduling availability", async ({ page, users, bookings }) => {
    const user = await users.create();
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const booking = await bookings.create(user.id, user.username, user.eventTypes[0].id!, {
      status: BookingStatus.CANCELLED,
      rescheduled: true,
    });

    await page.goto(`/${user.username}/${user.eventTypes[0].slug}?rescheduleUid=${booking.uid}`);

    await selectFirstAvailableTimeSlotNextMonth(page);

    const formerTimeElement = page.locator('[data-testid="former_time_p"]');
    await expect(formerTimeElement).toBeVisible();
    await booking.delete();
  });

  test("Should display request reschedule send on bookings/cancelled", async ({ page, users, bookings }) => {
    const user = await users.create();
    const booking = await bookings.create(user.id, user.username, user.eventTypes[0].id, {
      status: BookingStatus.CANCELLED,
      rescheduled: true,
    });

    await user.apiLogin();
    await page.goto("/bookings/cancelled");

    const requestRescheduleSentElement = page.locator('[data-testid="request_reschedule_sent"]').nth(1);
    await expect(requestRescheduleSentElement).toBeVisible();
    await booking.delete();
  });

  test("Should do a reschedule from user owner", async ({ page, users, bookings }) => {
    const user = await users.create();
    const [eventType] = user.eventTypes;
    const booking = await bookings.create(user.id, user.username, eventType.id, {
      status: BookingStatus.CANCELLED,
      rescheduled: true,
    });

    await page.goto(`/${user.username}/${eventType.slug}?rescheduleUid=${booking.uid}`);

    await selectFirstAvailableTimeSlotNextMonth(page);

    await expect(page.locator('[name="name"]')).toBeDisabled();
    await expect(page.locator('[name="email"]')).toBeDisabled();

    await page.locator('[data-testid="confirm-reschedule-button"]').click();

    await page.waitForLoadState("networkidle");

    await expect(page.locator("[data-testid=success-page]")).toBeVisible();

    const newBooking = await prisma.booking.findFirstOrThrow({ where: { fromReschedule: booking.uid } });
    const rescheduledBooking = await prisma.booking.findFirstOrThrow({ where: { uid: booking.uid } });

    expect(newBooking).not.toBeNull();
    expect(rescheduledBooking.status).toBe(BookingStatus.CANCELLED);

    await prisma.booking.deleteMany({
      where: {
        id: {
          in: [newBooking.id, rescheduledBooking.id],
        },
      },
    });
  });

  test("Unpaid rescheduling should go to payment page", async ({ page, users, bookings, payments }) => {
    // eslint-disable-next-line playwright/no-skipped-test
    test.skip(!IS_STRIPE_ENABLED, "Skipped as Stripe is not installed");
    const user = await users.create();
    await user.apiLogin();
    await user.getPaymentCredential();
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const eventType = user.eventTypes.find((e) => e.slug === "paid")!;
    const booking = await bookings.create(user.id, user.username, eventType.id, {
      rescheduled: true,
      status: BookingStatus.CANCELLED,
      paid: false,
    });
    await prisma.eventType.update({
      where: {
        id: eventType.id,
      },
      data: {
        metadata: {
          apps: {
            stripe: {
              price: 20000,
              enabled: true,
              currency: "usd",
            },
          },
        },
      },
    });
    const payment = await payments.create(booking.id);
    await page.goto(`/${user.username}/${eventType.slug}?rescheduleUid=${booking.uid}`);

    await selectFirstAvailableTimeSlotNextMonth(page);

    await page.locator('[data-testid="confirm-reschedule-button"]').click();

    await page.waitForURL((url) => {
      return url.pathname.indexOf("/payment") > -1;
    });

    await expect(page).toHaveURL(/.*payment/);
  });

  test("Paid rescheduling should go to success page", async ({ page, users, bookings, payments }) => {
    const user = await users.create();
    await user.apiLogin();
    await user.getPaymentCredential();
    await users.logout();
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const eventType = user.eventTypes.find((e) => e.slug === "paid")!;
    const booking = await bookings.create(user.id, user.username, eventType.id, {
      rescheduled: true,
      status: BookingStatus.CANCELLED,
      paid: true,
    });

    const payment = await payments.create(booking.id);
    await page.goto(`/${user?.username}/${eventType?.slug}?rescheduleUid=${booking?.uid}`);

    await selectFirstAvailableTimeSlotNextMonth(page);

    await page.locator('[data-testid="confirm-reschedule-button"]').click();

    await expect(page).toHaveURL(/.*booking/);
  });

  test("Opt in event should be PENDING when rescheduled by USER", async ({ page, users, bookings }) => {
    const user = await users.create();
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const eventType = user.eventTypes.find((e) => e.slug === "opt-in")!;
    const booking = await bookings.create(user.id, user.username, eventType.id, {
      status: BookingStatus.ACCEPTED,
    });

    await page.goto(`/${user.username}/${eventType.slug}?rescheduleUid=${booking.uid}`);

    await selectFirstAvailableTimeSlotNextMonth(page);

    await page.locator('[data-testid="confirm-reschedule-button"]').click();

    await expect(page).toHaveURL(/.*booking/);

    const newBooking = await prisma.booking.findFirst({ where: { fromReschedule: booking?.uid } });
    expect(newBooking).not.toBeNull();
    expect(newBooking?.status).toBe(BookingStatus.PENDING);
  });

  test("Opt in event should be ACCEPTED when rescheduled by OWNER", async ({ page, users, bookings }) => {
    const user = await users.create();
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const eventType = user.eventTypes.find((e) => e.slug === "opt-in")!;
    const booking = await bookings.create(user.id, user.username, eventType.id, {
      status: BookingStatus.ACCEPTED,
    });
    await user.apiLogin();

    await page.goto(`/${user.username}/${eventType.slug}?rescheduleUid=${booking.uid}`);

    await selectFirstAvailableTimeSlotNextMonth(page);

    await page.locator('[data-testid="confirm-reschedule-button"]').click();

    await expect(page).toHaveURL(/.*booking/);

    const newBooking = await prisma.booking.findFirst({ where: { fromReschedule: booking?.uid } });
    expect(newBooking).not.toBeNull();
    expect(newBooking?.status).toBe(BookingStatus.ACCEPTED);
  });

  test("Attendee should be able to reschedule a booking", async ({ page, users, bookings }) => {
    const user = await users.create();
    const eventType = user.eventTypes[0];
    const booking = await bookings.create(user.id, user.username, eventType.id);

    // Go to attendee's reschedule link
    await page.goto(`/reschedule/${booking.uid}`);

    await selectFirstAvailableTimeSlotNextMonth(page);

    await page.locator('[data-testid="confirm-reschedule-button"]').click();

    await expect(page).toHaveURL(/.*booking/);

    const newBooking = await prisma.booking.findFirst({ where: { fromReschedule: booking?.uid } });
    expect(newBooking).not.toBeNull();
    expect(newBooking?.status).toBe(BookingStatus.ACCEPTED);
  });

  test("Should be able to book slot that overlaps with original rescheduled booking", async ({
    page,
    users,
    bookings,
  }) => {
    const user = await users.create();
    const eventType = user.eventTypes[0];

    let firstOfNextMonth = dayjs().add(1, "month").startOf("month");

    // find first available slot of next month (available monday-friday)
    // eslint-disable-next-line playwright/no-conditional-in-test
    while (firstOfNextMonth.day() < 1 || firstOfNextMonth.day() > 5) {
      firstOfNextMonth = firstOfNextMonth.add(1, "day");
    }

    // set startTime to first available slot
    const startTime = firstOfNextMonth.set("hour", 9).set("minute", 0).toDate();
    const endTime = firstOfNextMonth.set("hour", 9).set("minute", 30).toDate();

    const booking = await bookings.create(user.id, user.username, eventType.id, {}, startTime, endTime);

    await page.goto(`/reschedule/${booking.uid}`);

    await selectFirstAvailableTimeSlotNextMonth(page);

    await page.locator('[data-testid="confirm-reschedule-button"]').click();
    await expect(page).toHaveURL(/.*booking/);
  });
  test("Should load Valid Cal video url after rescheduling Opt in events", async ({
    page,
    users,
    bookings,
  }) => {
    const user = await users.create();
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const eventType = user.eventTypes.find((e) => e.slug === "opt-in")!;

    const confirmBooking = async (bookingId: number) => {
      await user.apiLogin();
      await page.goto("/bookings/upcoming");
      const elem = await page.locator(`[data-bookingid="${bookingId}"][data-testid="confirm"]`);
      await elem.click();
      await page.getByTestId("toast-success").waitFor();
      await user.logout();
    };

    await page.goto(`/${user.username}/${eventType.slug}`);
    await selectFirstAvailableTimeSlotNextMonth(page);
    await bookTimeSlot(page);
    await expect(page.locator("[data-testid=success-page]")).toBeVisible();

    const pageUrl = new URL(page.url());
    const pathSegments = pageUrl.pathname.split("/");
    const bookingUID = pathSegments[pathSegments.length - 1];

    const currentBooking = await prisma.booking.findFirst({ where: { uid: bookingUID } });
    expect(currentBooking).not.toBeUndefined();
    // eslint-disable-next-line playwright/no-conditional-in-test
    if (currentBooking) {
      await confirmBooking(currentBooking.id);

      await page.goto(`/${user.username}/${eventType.slug}?rescheduleUid=${currentBooking.uid}`);
      await selectFirstAvailableTimeSlotNextMonth(page);

      await page.locator('[data-testid="confirm-reschedule-button"]').click();
      await expect(page).toHaveURL(/.*booking/);

      const newBooking = await prisma.booking.findFirst({ where: { fromReschedule: currentBooking.uid } });
      expect(newBooking).not.toBeUndefined();
      expect(newBooking?.status).toBe(BookingStatus.PENDING);
      // eslint-disable-next-line playwright/no-conditional-in-test
      if (newBooking) {
        await confirmBooking(newBooking?.id);

        const booking = await prisma.booking.findFirst({ where: { id: newBooking.id } });
        expect(booking).not.toBeUndefined();
        expect(booking?.status).toBe(BookingStatus.ACCEPTED);
        const locationVideoCallUrl = bookingMetadataSchema.parse(booking?.metadata || {})?.videoCallUrl;
        expect(locationVideoCallUrl).not.toBeUndefined();

        // eslint-disable-next-line playwright/no-conditional-in-test
        if (booking && locationVideoCallUrl) {
          await page.goto(locationVideoCallUrl);
          await expect(page.frameLocator("iFrame").locator('text="Continue"')).toBeVisible();
        }
      }
    }
  });
});
