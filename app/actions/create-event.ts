"use server";

import { auth } from "@/auth";
import { addCustomEvent, updateCustomEvent, CustomEvent, getCustomEvents } from "@/lib/events-db";
import { google } from "googleapis";
import { v4 as uuidv4 } from "uuid";
import { revalidatePath } from "next/cache";

export interface CreateEventInput {
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  clientEmails: string[];
}

function formatISTDateTime(dateTimeStr: string): string {
  if (!dateTimeStr) return new Date().toISOString();
  // If input format is "YYYY-MM-DDTHH:mm", format explicitly with +05:30 IST offset
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(dateTimeStr)) {
    return `${dateTimeStr}:00+05:30`;
  }
  return new Date(dateTimeStr).toISOString();
}

export async function createMeetingAction(input: CreateEventInput) {
  const session = await auth();

  if (!session?.user?.email) {
    return { error: "You must be signed in with Google to create a meeting." };
  }

  const userEmail = session.user.email;
  const userName = session.user.name || userEmail.split("@")[0];
  const accessToken = session.accessToken;
  const refreshToken = session.refreshToken;

  if (!accessToken && !refreshToken) {
    return { error: "Google OAuth tokens missing. Please sign out and sign in again." };
  }

  // Ensure clientEmails is an array of non-empty strings
  const validClientEmails = (input.clientEmails || [])
    .map((e) => e.trim().toLowerCase())
    .filter((e) => e.length > 0 && e.includes("@"));

  if (validClientEmails.length === 0) {
    return { error: "Please add at least one valid client email address." };
  }

  const eventId = uuidv4();
  const startISO = formatISTDateTime(input.startTime);
  const endISO = formatISTDateTime(input.endTime);

  // STAGE 1: Add to Our Custom In-App Calendar Database First
  const initialCustomEvent: CustomEvent = {
    id: eventId,
    userEmail,
    userName,
    title: input.title,
    description: input.description,
    startTime: startISO,
    endTime: endISO,
    clientEmails: validClientEmails,
    clientEmail: validClientEmails[0],
    status: "local_pending",
    createdAt: new Date().toISOString(),
  };

  addCustomEvent(initialCustomEvent);

  try {
    // STAGE 2: Sync to User's Personal Google Calendar in IST (Asia/Kolkata)
    const oauth2Client = new google.auth.OAuth2(
      process.env.AUTH_GOOGLE_ID,
      process.env.AUTH_GOOGLE_SECRET
    );

    oauth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    const calendar = google.calendar({ version: "v3", auth: oauth2Client });

    // Map all client emails to Google Calendar attendees
    const attendees = validClientEmails.map((email) => ({ email }));

    const googleResponse = await calendar.events.insert({
      calendarId: "primary", // User's personal @gmail.com primary calendar
      conferenceDataVersion: 1, // Requests Google Meet link generation
      sendUpdates: "all", // Sends email invitations from userEmail to all clientEmails
      requestBody: {
        summary: input.title,
        description: input.description,
        start: {
          dateTime: startISO,
          timeZone: "Asia/Kolkata", // Indian Standard Time (IST / GMT+5:30)
        },
        end: {
          dateTime: endISO,
          timeZone: "Asia/Kolkata", // Indian Standard Time (IST / GMT+5:30)
        },
        attendees: attendees,
        conferenceData: {
          createRequest: {
            requestId: uuidv4(),
            conferenceSolutionKey: { type: "hangoutsMeet" },
          },
        },
      },
    });

    const meetLink = googleResponse.data.hangoutLink || undefined;
    const googleEventId = googleResponse.data.id || undefined;

    // STAGE 3: Update Custom In-App Calendar Record with Google Meet Link
    const updatedCustomEvent = updateCustomEvent(eventId, {
      meetLink,
      googleEventId,
      status: "synced",
    });

    revalidatePath("/");

    return {
      success: true,
      event: updatedCustomEvent || initialCustomEvent,
      events: getCustomEvents(),
    };
  } catch (error: unknown) {
    console.error("Google Calendar Sync Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to sync with Google Calendar";

    updateCustomEvent(eventId, { status: "sync_failed" });

    return {
      error: `Added to Custom Calendar, but Google Calendar sync failed: ${errorMessage}`,
      event: initialCustomEvent,
      events: getCustomEvents(),
    };
  }
}
