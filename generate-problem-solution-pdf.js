const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const doc = new PDFDocument({ margin: 40, size: "A4", bufferPages: true });
const outputPath = path.join(process.cwd(), "Lumio_Problem_Statement_and_Solution.pdf");
const writeStream = fs.createWriteStream(outputPath);
doc.pipe(writeStream);

// Colors
const PRIMARY = "#162E29";
const SECONDARY = "#D99B26";
const ACCENT = "#2563EB";
const RED = "#B91C1C";
const GREEN = "#15803D";
const BG_WARM = "#F8F5F0";
const TEXT_DARK = "#1F2937";
const TEXT_MUTED = "#6B7280";
const BORDER_COLOR = "#E5E0D8";

function addFooter() {
  const range = doc.bufferedPageRange();
  for (let i = range.start; i < range.start + range.count; i++) {
    doc.switchToPage(i);
    doc.fontSize(8).fillColor(TEXT_MUTED).text(
      `Lumio • Problem Statement & Solution Architecture • Page ${i + 1} of ${range.count}`,
      40, 795, { align: "center", width: 515 }
    );
  }
}

function sectionHeader(title, color = PRIMARY) {
  if (doc.y > 700) doc.addPage();
  doc.rect(40, doc.y, 515, 24).fill("#EAE5DD");
  doc.fillColor(color).fontSize(12).font("Helvetica-Bold").text(title.toUpperCase(), 50, doc.y + 6);
  doc.y += 15;
}

// --- COVER TITLE BANNER ---
doc.rect(40, 40, 515, 110).fill(PRIMARY);
doc.fillColor("#FFFFFF").fontSize(24).font("Helvetica-Bold").text("Lumio", 60, 55);
doc.fontSize(11).font("Helvetica").fillColor(SECONDARY).text("Clinical Intelligence for Mental Health", 60, 85);
doc.fontSize(14).font("Helvetica-Bold").fillColor("#FFFFFF").text("Problem Statement & Solution Architecture", 60, 105);
doc.fontSize(9).font("Helvetica").fillColor("#E2ECE9").text("Google Calendar & Google Meet Scheduling Integration", 60, 125);

doc.y = 170;

// ============================================================
// SECTION 1: PROBLEM STATEMENT
// ============================================================
sectionHeader("1. Problem Statement", RED);
doc.y += 10;

doc.rect(40, doc.y, 515, 130).fill("#FDF1F0").stroke("#F3C6C2");
const probY = doc.y - 122;

doc.fillColor(RED).fontSize(9.5).font("Helvetica-Bold").text("Business Context:", 55, probY);
doc.font("Helvetica").fillColor(TEXT_DARK).fontSize(9).text(
  "Clinicians and staff at Lumio need to schedule client meetings quickly, without asking clients to install new software or manage separate calendars. Meetings must include a working video-call link and must appear both in the clinician's personal Google Calendar and inside Lumio's own dashboard for record-keeping.",
  55, probY + 14, { width: 490, lineGap: 2 }
);

doc.font("Helvetica-Bold").fillColor(RED).fontSize(9.5).text("Core Problems to Solve:", 55, probY + 68);
doc.font("Helvetica").fillColor(TEXT_DARK).fontSize(8.5);
doc.text("1. Users need one-click login without maintaining a separate app password.", 60, probY + 82);
doc.text("2. Every meeting needs an auto-generated video link (no manual Meet/Zoom link creation).", 60, probY + 92);
doc.text("3. Multiple clients/guests must be invited and notified by email automatically.", 60, probY + 102);
doc.text("4. Meeting must be visible both in the user's personal Google Calendar AND inside the app.", 60, probY + 112);

doc.y = probY + 140;

// Requirements table
doc.fillColor(PRIMARY).fontSize(9.5).font("Helvetica-Bold").text("Functional Requirements", 50, doc.y);
doc.y += 14;

doc.rect(40, doc.y, 515, 16).fill(PRIMARY);
doc.fillColor("#FFFFFF").fontSize(8).font("Helvetica-Bold");
doc.text("#", 50, doc.y + 4);
doc.text("Requirement", 70, doc.y + 4);
doc.text("Priority", 470, doc.y + 4);
doc.y += 16;

const reqs = [
  ["FR-1", "User authentication via Google OAuth 2.0 (no separate username/password store)", "Critical"],
  ["FR-2", "Auto-generate a unique Google Meet link for every meeting created", "Critical"],
  ["FR-3", "Support inviting multiple client/guest emails per meeting", "High"],
  ["FR-4", "Persist every meeting in Lumio's own custom calendar (source of truth)", "Critical"],
  ["FR-5", "Sync meeting + Meet link into organizer's personal Google Calendar", "High"],
  ["FR-6", "Schedule and display all times in Indian Standard Time (IST, GMT+5:30)", "Medium"],
];

reqs.forEach((r, i) => {
  const rY = doc.y;
  const bg = i % 2 === 0 ? "#F9F7F3" : "#FFFFFF";
  doc.rect(40, rY, 515, 18).fill(bg).stroke("#EDE8DF");
  doc.fillColor(PRIMARY).fontSize(8).font("Helvetica-Bold").text(r[0], 50, rY + 5);
  doc.fillColor(TEXT_DARK).font("Helvetica").text(r[1], 70, rY + 5, { width: 390 });
  const pColor = r[2] === "Critical" ? RED : r[2] === "High" ? SECONDARY : TEXT_MUTED;
  doc.fillColor(pColor).font("Helvetica-Bold").text(r[2], 470, rY + 5);
  doc.y = rY + 18;
});

doc.addPage();

// ============================================================
// SECTION 2: SOLUTION OVERVIEW
// ============================================================
sectionHeader("2. Solution Overview", GREEN);
doc.y += 10;

doc.rect(40, doc.y, 515, 95).fill("#EFF8F1").stroke("#C9E7CF");
const solY = doc.y - 87;

doc.fillColor(GREEN).fontSize(9.5).font("Helvetica-Bold").text("Approach:", 55, solY);
doc.font("Helvetica").fillColor(TEXT_DARK).fontSize(9).text(
  "Built a Next.js 15 application using Google OAuth 2.0 as the sole sign-in method (no local password store). Each signed-in user's Google refresh token is used server-side to call the Google Calendar API directly on their behalf, so events are created under their own identity as Organizer. Every meeting is written to Lumio's local custom-calendar database first, then synced to Google Calendar with conferenceDataVersion:1 to auto-provision a Google Meet link, and sendUpdates:'all' to email every guest.",
  55, solY + 14, { width: 490, lineGap: 2 }
);

doc.y = solY + 105;

// Requirement -> Solution mapping table
doc.fillColor(PRIMARY).fontSize(9.5).font("Helvetica-Bold").text("Requirement → Solution Mapping", 50, doc.y);
doc.y += 14;

doc.rect(40, doc.y, 515, 16).fill(PRIMARY);
doc.fillColor("#FFFFFF").fontSize(8).font("Helvetica-Bold");
doc.text("Requirement", 50, doc.y + 4);
doc.text("Implementation", 200, doc.y + 4);
doc.y += 16;

const mapping = [
  ["FR-1: Google OAuth login", "NextAuth.js v5 Google Provider, access_type=offline, prompt=consent (auth.ts)"],
  ["FR-2: Auto Meet link", "conferenceDataVersion:1 + conferenceSolutionKey hangoutsMeet on events.insert"],
  ["FR-3: Multi-guest invites", "Chip-input UI collects clientEmails[] -> mapped to attendees[] + sendUpdates:'all'"],
  ["FR-4: Custom calendar record", "lib/events-db.ts JSON-backed store, written in Stage 1 before Google sync"],
  ["FR-5: Personal calendar sync", "calendarId:'primary' with user's own OAuth access/refresh token (Stage 2)"],
  ["FR-6: IST scheduling", "timeZone:'Asia/Kolkata' on start/end + en-IN locale formatting in the UI"],
];

mapping.forEach((r, i) => {
  const rY = doc.y;
  const bg = i % 2 === 0 ? "#F9F7F3" : "#FFFFFF";
  doc.rect(40, rY, 515, 20).fill(bg).stroke("#EDE8DF");
  doc.fillColor(GREEN).fontSize(7.8).font("Helvetica-Bold").text(r[0], 50, rY + 5, { width: 145 });
  doc.fillColor(TEXT_DARK).font("Helvetica").fontSize(7.8).text(r[1], 200, rY + 5, { width: 345 });
  doc.y = rY + 20;
});

doc.y += 15;

// ============================================================
// SECTION 3: ARCHITECTURE
// ============================================================
sectionHeader("3. System Architecture");
doc.y += 10;

doc.rect(40, doc.y, 515, 145).fill("#F3EFE8").stroke(BORDER_COLOR);
const diagY = doc.y - 137;

doc.fillColor(PRIMARY).fontSize(9).font("Helvetica-Bold").text("COMPONENT & DATA-FLOW DIAGRAM", 50, diagY);
doc.font("Courier").fontSize(7.5).fillColor(TEXT_DARK);
doc.text("[ Browser ] --(Google OAuth 2.0 Sign-In)--> [ NextAuth.js v5 / auth.ts ]", 55, diagY + 16);
doc.text("                                                        |  (access_token, refresh_token in JWT session)", 55, diagY + 27);
doc.text("                                                        v", 55, diagY + 38);
doc.text("                                   [ Server Action: createMeetingAction() ]", 55, diagY + 49);
doc.text("                                                        |", 55, diagY + 60);
doc.text("      +-------------------------------------------------+-------------------------------------------------+", 50, diagY + 71);
doc.text("      v  STAGE 1                                                                          v  STAGE 2", 50, diagY + 82);
doc.text(" [ lib/events-db.ts ]                                                     [ googleapis: calendar.events.insert ]", 50, diagY + 93);
doc.text(" data/events.json (custom calendar,                                        calendarId: primary, conferenceDataVersion:1,", 50, diagY + 104);
doc.text(" status: local_pending -> synced)                                          sendUpdates: all, timeZone: Asia/Kolkata", 50, diagY + 115);
doc.text("                                                        |  STAGE 3: update local record with hangoutLink + status", 50, diagY + 126);
doc.text("                                                        v", 50, diagY + 137);

doc.y = diagY + 150;

doc.fillColor(TEXT_DARK).fontSize(8).font("Helvetica").text(
  "Result: Google generates the Meet link, emails all invited guests directly from the organizer's own Gmail account, " +
  "and Lumio's UI (components/CustomCalendarView.tsx) renders the same meeting from the local database with a live status badge and Join Meet button.",
  40, doc.y, { width: 515, lineGap: 2 }
);

doc.y += 40;

// Tech stack mini table
doc.fillColor(PRIMARY).fontSize(9.5).font("Helvetica-Bold").text("Technology Stack", 50, doc.y);
doc.y += 14;

const stack = [
  ["Framework", "Next.js 15 (App Router, Server Actions)"],
  ["Auth", "NextAuth.js v5 - Google OAuth 2.0 (offline + consent)"],
  ["Calendar API", "googleapis v144 - Google Calendar API v3"],
  ["Local Store", "JSON file store (data/events.json)"],
  ["UI", "React + Tailwind CSS v4, Lucide icons"],
];

stack.forEach((r, i) => {
  const rY = doc.y;
  const bg = i % 2 === 0 ? "#F9F7F3" : "#FFFFFF";
  doc.rect(40, rY, 515, 16).fill(bg).stroke("#EDE8DF");
  doc.fillColor(PRIMARY).fontSize(8).font("Helvetica-Bold").text(r[0], 50, rY + 4, { width: 120 });
  doc.fillColor(ACCENT).font("Helvetica").fontSize(8).text(r[1], 180, rY + 4, { width: 365 });
  doc.y = rY + 16;
});

doc.addPage();

// ============================================================
// SECTION 4: OUTCOME
// ============================================================
sectionHeader("4. Outcome & Verification", GREEN);
doc.y += 10;

doc.rect(40, doc.y, 515, 100).fill("#EFF8F1").stroke("#C9E7CF");
const outY = doc.y - 92;

doc.fillColor(GREEN).fontSize(9).font("Helvetica-Bold");
doc.text("- User signs in with Google in one click; no password management required.", 55, outY);
doc.text("- Creating a meeting instantly appears in the Custom In-App Calendar (Grid + Timeline views).", 55, outY + 16);
doc.text("- Google auto-generates a working https://meet.google.com link on every event.", 55, outY + 32);
doc.text("- All added guest emails receive a native Google Calendar invite with the Meet link attached.", 55, outY + 48);
doc.text("- Meeting appears on the organizer's personal Google Calendar, correctly timed in IST.", 55, outY + 64);
doc.font("Helvetica").fillColor(TEXT_DARK).fontSize(8).text("- Verified live on Vercel production deployment with real Google account sign-in.", 55, outY + 80);

doc.y = outY + 110;

doc.fillColor(PRIMARY).fontSize(9.5).font("Helvetica-Bold").text("Live References", 50, doc.y);
doc.y += 14;
doc.fontSize(8.5).font("Helvetica").fillColor(ACCENT);
doc.text("Repository: https://github.com/kishorsumathi/lumio-calendar-poc", 50, doc.y);
doc.y += 14;
doc.text("Production: https://google-calander-hv6k04gxy-vanco.vercel.app", 50, doc.y);

addFooter();
doc.end();

writeStream.on("finish", () => {
  console.log("PDF generation complete: Lumio_Problem_Statement_and_Solution.pdf");
});
