# Lumio Google Calendar & Dual-Calendar Sync Engine: Complete Architecture & Setup Specification

## 1. Executive Summary & Overview

The **Lumio Google Calendar & Dual-Calendar Sync Engine** is a full-stack Next.js application designed to seamlessly bridge in-app event scheduling with Google Calendar. 

It implements an **end-to-end multi-guest meeting management workflow**:
- **Single Sign-On (SSO)**: Users authenticate using Google OAuth 2.0.
- **Dual-Calendar Syncing**: Meetings are committed **first** to an internal, in-app custom database (`lib/events-db.ts`), and **second** synced directly to the user's personal Google Calendar.
- **Automated Video Conferencing**: Automatically provisions unique **Google Meet links** (`https://meet.google.com/xxx-xxxx-xxx`).
- **Multi-Guest Invitations**: Dispatches official Google Calendar invitation emails to multiple client/guest email addresses directly from the host user's account.

---

## 2. High-Level System Architecture

```
                       ┌──────────────────────────────────────────┐
                       │          Client Browser (User)           │
                       └────────────────────┬─────────────────────┘
                                            │
                                            │ Google OAuth 2.0 Sign-In
                                            v
                       ┌──────────────────────────────────────────┐
                       │       Next.js 15 App Router App          │
                       │             (Port 3001)                  │
                       └──────┬────────────────────────────┬──────┘
                              │                            │
             (1) Save Event   │                            │ (2) Google Calendar API Call
               Local First    v                            v (With OAuth Refresh Token)
     ┌──────────────────────────────┐        ┌──────────────────────────────┐
     │  Custom In-App Database      │        │     Google Calendar API v3   │
     │     (data/events.json)       │        └──────────────┬───────────────┘
     └──────────────────────────────┘                       │
                                                            │ (3) Auto-Generates Meet Link
                                                            │     & Emails Invites
                                                            v
                                             ┌──────────────────────────────┐
                                             │ Client / Guest Email Inboxes │
                                             │  & Personal Google Calendars │
                                             └──────────────────────────────┘
```

---

## 3. End-to-End Sequence & Data Flow

```
[ User ]        [ Lumio UI ]        [ NextAuth / Auth ]       [ Custom DB ]       [ Google Calendar API ]      [ Guest Inboxes ]
   │                 │                       │                     │                        │                       │
   │─── 1. Sign In ─>│                       │                     │                        │                       │
   │    with Google  │── 2. Authenticate ───>│                     │                        │                       │
   │                 │<── 3. Tokens Saved ───│                     │                        │                       │
   │                 │   (Access/Refresh)    │                     │                        │                       │
   │                 │                       │                     │                        │                       │
   │─── 4. Submit ──>│                       │                     │                        │                       │
   │  Meeting Form   │──────────────────────── 5. Stage 1: Save ──>│                        │                       │
   │ (Title, Times,  │                            Local Event      │                        │                       │
   │  Guests[])      │                                                 │                        │                       │
   │                 │─────────────────────────────────────────────── 6. Stage 2: Call ────>│                       │
   │                 │                                                   calendar.events.insert │                       │
   │                 │                                                   (conferenceDataVer=1)  │                       │
   │                 │                                                                          │── 7. Send Invites & ─>│
   │                 │                                                                          │    Meet Link          │
   │                 │<────────────────────── 8. Stage 3: Return Meet Link ─────────────────│                       │
   │                 │                                                    & Event ID            │                       │
   │                 │─────────────────────────────────────────────── 9. Update DB ────────>│                       │
   │                 │                                                   (Status: Synced)       │                       │
   │                 │                                                                          │                       │
   │<── 10. Render ──│                                                                          │                       │
   │    Grid View &  │                                                                          │                       │
   │    Meet Button  │                                                                          │                       │
```

---

## 4. Technology Stack & Key Dependencies

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Framework** | Next.js 15 (App Router) | Server-side rendering, API routes, Server Actions |
| **Language** | TypeScript | Strong typing for event payloads, NextAuth tokens, and API data |
| **Styling** | Tailwind CSS v4 | Responsive utility-first design system |
| **Authentication** | NextAuth.js (Auth.js v5) | Google OAuth 2.0 authentication with offline refresh tokens |
| **Google Integration** | `googleapis` v144 | Direct communication with Google Calendar API v3 |
| **Database** | JSON File System (`data/events.json`) | Persistent custom calendar event store |
| **UI Components** | Lucide React | Modern vector icon set |
| **Utilities** | `uuid`, `zod` | Unique request ID generation & schema validation |

---

## 5. Google Cloud Platform (GCP) Configuration Guide

To enable Google Calendar API access and OAuth sign-in, configure GCP as follows:

### Step 1: Create GCP Project & Enable Calendar API
1. Navigate to **[console.cloud.google.com](https://console.cloud.google.com)**.
2. Create a new project (e.g. `Lumio-Calendar-Sync`).
3. Go to **APIs & Services** > **Library** -> Search for **Google Calendar API** and click **Enable**.

### Step 2: Configure OAuth Consent Screen
1. Go to **APIs & Services** > **OAuth consent screen** (or **Audience**).
2. Set User Type to **External**.
3. Fill out App Information:
   - **App Name**: Lumio Calendar App
   - **User Support Email**: Your email address
4. Add Scopes:
   - `openid`
   - `https://www.googleapis.com/auth/userinfo.profile`
   - `https://www.googleapis.com/auth/userinfo.email`
   - `https://www.googleapis.com/auth/calendar.events` *(Crucial for creating events & Meet links)*
5. Under **Test Users**, click **+ ADD USERS** and enter your testing Gmail address.

### Step 3: Create OAuth 2.0 Client Credentials
1. Go to **APIs & Services** > **Credentials** > **Create Credentials** > **OAuth client ID**.
2. Application type: **Web application**.
3. **Authorized JavaScript origins**:
   - `http://localhost:3001`
   - `https://lumio-calendar-poc.vercel.app` (Production)
4. **Authorized redirect URIs**:
   - `http://localhost:3001/api/auth/callback/google`
   - `https://lumio-calendar-poc.vercel.app/api/auth/callback/google`
5. Click **Create** and save your `Client ID` and `Client Secret`.

---

## 6. Project Structure & Code Walkthrough

```
google-calander/
├── app/
│   ├── actions/
│   │   └── create-event.ts       # Server action executing 3-stage meeting creation
│   ├── api/
│   │   └── auth/
│   │       └── [...nextauth]/
│   │           └── route.ts      # NextAuth OAuth API route handler
│   ├── favicon.ico
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx                  # Main home page rendering login / dashboard
├── components/
│   ├── CreateMeetingForm.tsx     # Multi-guest chip input meeting form
│   ├── CustomCalendarView.tsx    # Interactive monthly grid & timeline calendar view
│   ├── LumioLoginForm.tsx        # Lumio branded login interface
│   ├── Navbar.tsx                # App navigation bar with user profile
│   └── UserAvatar.tsx            # Referrer-safe Google avatar component
├── data/
│   └── events.json               # Local JSON database for custom calendar events
├── lib/
│   └── events-db.ts              # In-app custom calendar database helpers
├── .env.local                    # Secrets & OAuth credentials
├── auth.ts                       # NextAuth provider & callback configuration
├── next.config.ts
├── package.json
└── tsconfig.json
```

---

## 7. Deep-Dive Code Implementations

### A. NextAuth Google OAuth Setup (`auth.ts`)
```typescript
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    refreshToken?: string;
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      authorization: {
        params: {
          access_type: "offline",
          prompt: "consent",
          scope: "openid profile email https://www.googleapis.com/auth/calendar.events",
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
        if (account.refresh_token) {
          token.refreshToken = account.refresh_token;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.accessToken = token.accessToken as string | undefined;
        session.refreshToken = token.refreshToken as string | undefined;
      }
      return session;
    },
  },
  secret: process.env.AUTH_SECRET,
});
```

---

### B. 3-Stage Server Action for Event Creation (`app/actions/create-event.ts`)
```typescript
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

export async function createMeetingAction(input: CreateEventInput) {
  const session = await auth();
  if (!session?.user?.email) {
    return { error: "You must be signed in with Google to create a meeting." };
  }

  const userEmail = session.user.email;
  const userName = session.user.name || userEmail.split("@")[0];
  const accessToken = session.accessToken;
  const refreshToken = session.refreshToken;

  const validClientEmails = (input.clientEmails || [])
    .map((e) => e.trim().toLowerCase())
    .filter((e) => e.length > 0 && e.includes("@"));

  if (validClientEmails.length === 0) {
    return { error: "Please add at least one valid client email address." };
  }

  const eventId = uuidv4();

  // -------------------------------------------------------------
  // STAGE 1: SAVE TO OUR CUSTOM IN-APP CALENDAR DB FIRST
  // -------------------------------------------------------------
  const initialCustomEvent: CustomEvent = {
    id: eventId,
    userEmail,
    userName,
    title: input.title,
    description: input.description,
    startTime: input.startTime,
    endTime: input.endTime,
    clientEmails: validClientEmails,
    clientEmail: validClientEmails[0],
    status: "local_pending",
    createdAt: new Date().toISOString(),
  };

  addCustomEvent(initialCustomEvent);

  try {
    // -------------------------------------------------------------
    // STAGE 2: SYNC TO USER'S PERSONAL GOOGLE CALENDAR
    // -------------------------------------------------------------
    const oauth2Client = new google.auth.OAuth2(
      process.env.AUTH_GOOGLE_ID,
      process.env.AUTH_GOOGLE_SECRET
    );

    oauth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    const calendar = google.calendar({ version: "v3", auth: oauth2Client });
    const attendees = validClientEmails.map((email) => ({ email }));

    const googleResponse = await calendar.events.insert({
      calendarId: "primary",    // User's personal @gmail.com primary calendar
      conferenceDataVersion: 1, // Triggers Google Meet link creation
      sendUpdates: "all",       // Emails invites directly from user to all clientEmails
      requestBody: {
        summary: input.title,
        description: input.description,
        start: { dateTime: new Date(input.startTime).toISOString() },
        end: { dateTime: new Date(input.endTime).toISOString() },
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

    // -------------------------------------------------------------
    // STAGE 3: UPDATE CUSTOM APP CALENDAR WITH GOOGLE MEET LINK
    // -------------------------------------------------------------
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
```

---

## 8. Deployment & Environment Variable Guide

### Environment Variables (`.env.local`)
```env
AUTH_SECRET="YOUR_JWT_SESSION_SECRET"
AUTH_GOOGLE_ID="YOUR_GOOGLE_CLIENT_ID"
AUTH_GOOGLE_SECRET="YOUR_GOOGLE_CLIENT_SECRET"
NEXTAUTH_URL="http://localhost:3001"
PORT=3001
```

### GitHub Repository
- Repository: **`https://github.com/kishorsumathi/lumio-calendar-poc`**
- Branch: `main`

### Vercel Deployment Steps
1. Import repository at **[vercel.com/new](https://vercel.com/new)**.
2. Add environment variables: `AUTH_SECRET`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`.
3. Set `NEXTAUTH_URL` to your production domain (e.g. `https://lumio-calendar-poc.vercel.app`).
4. Click **Deploy**.
5. Add production callback URL to GCP Console: `https://lumio-calendar-poc.vercel.app/api/auth/callback/google`.

---

## 9. Common Troubleshooting Matrix

| Issue | Root Cause | Solution |
| :--- | :--- | :--- |
| **`Error 400: redirect_uri_mismatch`** | Callback URL in app does not match GCP Console credentials. | Add `http://localhost:3001/api/auth/callback/google` to Authorized Redirect URIs in GCP Console. |
| **`Error 403: access_denied`** | GCP Project is in "Testing" mode and current email is not listed. | Add test email under **OAuth consent screen** > **Test Users**, or click **Publish App**. |
| **Broken Profile Picture** | Google avatar CDN (`lh3.googleusercontent.com`) blocks requests with referrer headers. | Use `<img referrerPolicy="no-referrer" />` or fallback to initial circle badge (`components/UserAvatar.tsx`). |
| **No Google Meet Link Generated** | `conferenceDataVersion: 1` missing in API parameters. | Ensure `conferenceDataVersion: 1` is passed in `calendar.events.insert()` call. |
