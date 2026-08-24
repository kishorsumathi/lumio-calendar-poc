const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const doc = new PDFDocument({
  margin: 40,
  size: "A4",
  bufferPages: true,
});

const outputPath = path.join(process.cwd(), "Lumio_Architecture_and_Setup_Guide.pdf");
const writeStream = fs.createWriteStream(outputPath);
doc.pipe(writeStream);

// Colors
const PRIMARY = "#162E29";      // Deep Forest Teal
const SECONDARY = "#D99B26";    // Golden Amber
const ACCENT = "#2563EB";       // Blue
const BG_WARM = "#F8F5F0";      // Cream Box Background
const TEXT_DARK = "#1F2937";    // Dark Charcoal
const TEXT_MUTED = "#6B7280";   // Muted Slate
const BORDER_COLOR = "#E5E0D8"; // Soft Border

let pageNumber = 1;

// Helper: Add Footer
function addFooter(doc) {
  const range = doc.bufferedPageRange();
  for (let i = range.start; i < range.start + range.count; i++) {
    doc.switchToPage(i);
    doc
      .fontSize(8)
      .fillColor(TEXT_MUTED)
      .text(
        `Lumio Clinical Platform • Google Calendar & Meet Sync Specification • Page ${i + 1} of ${range.count}`,
        40,
        795,
        { align: "center", width: 515 }
      );
  }
}

// --- COVER HEADER / TITLE BANNER ---
doc.rect(40, 40, 515, 95).fill(PRIMARY);

doc.fillColor("#FFFFFF").fontSize(26).font("Helvetica-Bold").text("Lumio", 60, 55);
doc.fontSize(12).font("Helvetica").fillColor(SECONDARY).text("Clinical Intelligence for Mental Health", 60, 88);
doc.fontSize(10).fillColor("#E2ECE9").text("Google Calendar & Dual-Calendar Sync Architecture Specification", 60, 105);

doc.y = 150;

// --- SECTION 1: EXECUTIVE SUMMARY ---
function drawSectionHeader(title) {
  const currentY = doc.y;
  if (currentY > 700) {
    doc.addPage();
  }
  doc.rect(40, doc.y, 515, 24).fill("#EAE5DD");
  doc.fillColor(PRIMARY).fontSize(12).font("Helvetica-Bold").text(title.toUpperCase(), 50, doc.y + 6);
  doc.y += 15;
}

drawSectionHeader("1. Executive Summary & Key Capabilities");

doc.y += 10;
doc.fillColor(TEXT_DARK).fontSize(9.5).font("Helvetica").text(
  "The Lumio Google Calendar & Dual-Calendar Sync Engine provides automated, HIPAA-compliant event scheduling, multi-guest invitation handling, and instant video link generation. It synchronizes meeting data simultaneously across two distinct destinations:",
  { width: 515, align: "left" }
);

doc.y += 8;

// Feature Bullets Box
doc.rect(40, doc.y, 515, 75).fill(BG_WARM).stroke(BORDER_COLOR);
const boxY = doc.y - 70;

doc.fillColor(PRIMARY).fontSize(9.5).font("Helvetica-Bold");
doc.text("• Dual-Calendar Synchronization:", 55, boxY);
doc.font("Helvetica").fillColor(TEXT_DARK).text(" Saves to Custom App DB (data/events.json) first, then pushes to User's Google Calendar.", 205, boxY);

doc.font("Helvetica-Bold").fillColor(PRIMARY).text("• Instant Google Meet Provisioning:", 55, boxY + 18);
doc.font("Helvetica").fillColor(TEXT_DARK).text(" Generates unique https://meet.google.com URLs automatically.", 215, boxY + 18);

doc.font("Helvetica-Bold").fillColor(PRIMARY).text("• Multi-Guest Direct Invitations:", 55, boxY + 36);
doc.font("Helvetica").fillColor(TEXT_DARK).text(" Sends official Google Calendar email invites to multiple clients directly from the user.", 205, boxY + 36);

doc.font("Helvetica-Bold").fillColor(PRIMARY).text("• Seamless Google OAuth 2.0 SSO:", 55, boxY + 54);
doc.font("Helvetica").fillColor(TEXT_DARK).text(" Captures offline refresh tokens for background calendar interaction.", 205, boxY + 54);

doc.y = boxY + 85;

// --- SECTION 2: SYSTEM ARCHITECTURE & SEQUENCE ---
drawSectionHeader("2. System Architecture & Sequence Flow");

doc.y += 10;

// Architecture Diagram Box
doc.rect(40, doc.y, 515, 125).fill("#F3EFE8").stroke(BORDER_COLOR);
const diagY = doc.y - 118;

doc.fillColor(PRIMARY).fontSize(9).font("Helvetica-Bold").text("DATA FLOW ARCHITECTURE DIAGRAM", 50, diagY);

doc.font("Helvetica").fontSize(8.5).fillColor(TEXT_DARK);
doc.text("[ Client Browser ]  ──( Google OAuth SSO )──>  [ NextAuth (Auth.js v5) ]", 60, diagY + 18);
doc.text("                                                            │", 60, diagY + 28);
doc.text("                                                            ▼", 60, diagY + 38);
doc.text("                                              [ 3-Stage Server Action ]", 60, diagY + 48);
doc.text("                                                            │", 60, diagY + 58);
doc.text("           ┌────────────────────────────────────────────────┴────────────────────────────────────────────────┐", 50, diagY + 68);
doc.text("           ▼                                                                                                 ▼", 50, diagY + 78);
doc.text(" [ Stage 1: Commit Local DB ]                                                     [ Stage 2: Call Google Calendar API ]", 50, diagY + 88);
doc.text(" (data/events.json Custom View)                                                   (Generates Meet Link & Emails Guests)", 50, diagY + 98);

doc.y = diagY + 135;

// --- SECTION 3: TECH STACK MATRIX ---
drawSectionHeader("3. Technology Stack & Dependencies");

doc.y += 10;

// Table Header
doc.rect(40, doc.y, 515, 18).fill(PRIMARY);
doc.fillColor("#FFFFFF").fontSize(9).font("Helvetica-Bold");
doc.text("Layer", 50, doc.y + 4);
doc.text("Technology", 150, doc.y + 4);
doc.text("Purpose & Architectural Role", 300, doc.y + 4);

doc.y += 18;

const stackData = [
  ["Framework", "Next.js 15 (App Router)", "SSR, API routes, Server Actions & Turbopack"],
  ["Authentication", "NextAuth.js (Auth.js v5)", "Google OAuth 2.0 with offline access tokens"],
  ["Google SDK", "googleapis v144", "Direct integration with Google Calendar API v3"],
  ["Database", "JSON File Store (events.json)", "In-app custom calendar event persistence"],
  ["UI Styling", "Tailwind CSS v4", "Custom Lumio warm-cream palette & responsive layouts"],
  ["Icons & Utilities", "Lucide React, UUID, Zod", "Vector icons, unique request IDs & validation"]
];

stackData.forEach((row, index) => {
  const rowY = doc.y;
  const bg = index % 2 === 0 ? "#F9F7F3" : "#FFFFFF";
  doc.rect(40, rowY, 515, 18).fill(bg).stroke("#EDE8DF");
  
  doc.fillColor(PRIMARY).fontSize(8.5).font("Helvetica-Bold").text(row[0], 50, rowY + 5);
  doc.fillColor(ACCENT).font("Helvetica").text(row[1], 150, rowY + 5);
  doc.fillColor(TEXT_DARK).text(row[2], 300, rowY + 5);
  
  doc.y = rowY + 18;
});

doc.y += 15;

// --- PAGE BREAK FOR SECTION 4 & 5 ---
doc.addPage();

// --- SECTION 4: GOOGLE CLOUD CONFIGURATION ---
drawSectionHeader("4. Google Cloud Platform (GCP) Configuration");

doc.y += 10;
doc.fillColor(TEXT_DARK).fontSize(9).font("Helvetica").text(
  "To enable authentication and calendar synchronization, the GCP Project must be configured with the following parameters:",
  { width: 515 }
);

doc.y += 8;

doc.rect(40, doc.y, 515, 110).fill(BG_WARM).stroke(BORDER_COLOR);
const gcpY = doc.y - 102;

doc.fillColor(PRIMARY).fontSize(9).font("Helvetica-Bold");
doc.text("• API Enabled:", 55, gcpY);
doc.font("Helvetica").fillColor(TEXT_DARK).text(" Google Calendar API v3", 150, gcpY);

doc.font("Helvetica-Bold").fillColor(PRIMARY).text("• OAuth Scopes:", 55, gcpY + 16);
doc.font("Helvetica").fillColor(TEXT_DARK).text(" openid, profile, email, https://www.googleapis.com/auth/calendar.events", 150, gcpY + 16);

doc.font("Helvetica-Bold").fillColor(PRIMARY).text("• Authorized Origins:", 55, gcpY + 32);
doc.font("Helvetica").fillColor(TEXT_DARK).text(" http://localhost:3001, https://google-calander-hv6k04gxy-vanco.vercel.app", 165, gcpY + 32);

doc.font("Helvetica-Bold").fillColor(PRIMARY).text("• Redirect URIs:", 55, gcpY + 48);
doc.font("Helvetica").fillColor(ACCENT).text(" http://localhost:3001/api/auth/callback/google", 150, gcpY + 48);
doc.text(" https://google-calander-hv6k04gxy-vanco.vercel.app/api/auth/callback/google", 150, gcpY + 62);

doc.font("Helvetica-Bold").fillColor(PRIMARY).text("• Publishing Mode:", 55, gcpY + 78);
doc.font("Helvetica").fillColor(TEXT_DARK).text(" External (Test users added: kishorbrindha18@gmail.com)", 160, gcpY + 78);

doc.y = gcpY + 120;

// --- SECTION 5: LIVE DEPLOYMENT & CREDENTIALS ---
drawSectionHeader("5. Deployment Credentials & Live Endpoints");

doc.y += 10;

doc.rect(40, doc.y, 515, 80).fill("#EBF3F0").stroke("#C6DDD6");
const depY = doc.y - 72;

doc.fillColor(PRIMARY).fontSize(9.5).font("Helvetica-Bold");
doc.text("LIVE VERCEL PRODUCTION URL:", 55, depY);
doc.fontSize(10).fillColor(ACCENT).text("https://google-calander-hv6k04gxy-vanco.vercel.app", 230, depY);

doc.fontSize(9.5).fillColor(PRIMARY).text("GITHUB REPOSITORY:", 55, depY + 22);
doc.fontSize(10).fillColor(ACCENT).text("https://github.com/kishorsumathi/lumio-calendar-poc", 230, depY + 22);

doc.fontSize(9).fillColor(PRIMARY).text("ENVIRONMENT VARIABLES (VERCEL & LOCAL):", 55, depY + 46);
doc.fontSize(8.5).font("Helvetica").fillColor(TEXT_DARK).text("AUTH_SECRET, AUTH_GOOGLE_ID, AUTH_GOOGLE_SECRET configured.", 275, depY + 46);

doc.y = depY + 95;

// --- SECTION 6: CODE IMPLEMENTATION HIGHLIGHTS ---
drawSectionHeader("6. Key Code Implementation Modules");

doc.y += 10;

// Code Snippet Container
doc.rect(40, doc.y, 515, 175).fill("#1E1E1E");
const codeY = doc.y - 168;

doc.fillColor(SECONDARY).fontSize(8.5).font("Helvetica-Bold").text("// app/actions/create-event.ts - 3-Stage Meeting Creation & Google Calendar Sync", 50, codeY);

doc.fillColor("#D4D4D4").fontSize(7.5).font("Courier");
doc.text("export async function createMeetingAction(input: CreateEventInput) {", 50, codeY + 15);
doc.text("  const session = await auth();", 50, codeY + 27);
doc.text("  const validClientEmails = input.clientEmails.map(e => e.trim().toLowerCase());", 50, codeY + 39);
doc.text("  ", 50, codeY + 51);
doc.text("  // STAGE 1: Add to Custom In-App Calendar Database First", 50, codeY + 58);
doc.text("  addCustomEvent({ id, title, clientEmails: validClientEmails, status: 'local_pending' });", 50, codeY + 70);
doc.text("  ", 50, codeY + 82);
doc.text("  // STAGE 2: Call Google Calendar API (Generates Meet Link & Emails Guests)", 50, codeY + 89);
doc.text("  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });", 50, codeY + 101);
doc.text("  const res = await calendar.events.insert({", 50, codeY + 113);
doc.text("    calendarId: 'primary', conferenceDataVersion: 1, sendUpdates: 'all',", 50, codeY + 125);
doc.text("    requestBody: { summary, attendees: validClientEmails.map(email => ({ email })) }", 50, codeY + 137);
doc.text("  });", 50, codeY + 149);
doc.text("  ", 50, codeY + 155);
doc.text("  // STAGE 3: Update Custom App Calendar Record with Meet Link", 50, codeY + 161);
doc.text("  updateCustomEvent(id, { meetLink: res.data.hangoutLink, status: 'synced' });", 50, codeY + 167);

doc.y = codeY + 190;

// --- SECTION 7: TROUBLESHOOTING MATRIX ---
drawSectionHeader("7. Troubleshooting & Error Resolutions");

doc.y += 10;

// Troubleshooting Table
doc.rect(40, doc.y, 515, 18).fill(PRIMARY);
doc.fillColor("#FFFFFF").fontSize(8.5).font("Helvetica-Bold");
doc.text("Error / Symptom", 50, doc.y + 4);
doc.text("Root Cause", 210, doc.y + 4);
doc.text("Resolution", 370, doc.y + 4);

doc.y += 18;

const tData = [
  ["Error 400: redirect_uri_mismatch", "Callback URL in app does not match GCP Console.", "Add http://localhost:3001/api/auth/callback/google to GCP."],
  ["Error 403: access_denied", "GCP App is in Testing mode & email is not listed.", "Add testing email under OAuth Consent Screen > Test Users."],
  ["Broken Google Avatar Picture", "Google CDN blocks requests with referrer headers.", "Use <img referrerPolicy=\"no-referrer\" /> with fallback badge."],
  ["No Google Meet Link", "conferenceDataVersion parameter missing.", "Set conferenceDataVersion: 1 in calendar.events.insert call."]
];

tData.forEach((row, index) => {
  const rY = doc.y;
  const bg = index % 2 === 0 ? "#F9F7F3" : "#FFFFFF";
  doc.rect(40, rY, 515, 22).fill(bg).stroke("#EDE8DF");
  
  doc.fillColor(PRIMARY).fontSize(7.5).font("Helvetica-Bold").text(row[0], 50, rY + 4, { width: 150 });
  doc.fillColor(TEXT_DARK).font("Helvetica").text(row[1], 210, rY + 4, { width: 150 });
  doc.fillColor(ACCENT).text(row[2], 370, rY + 4, { width: 180 });
  
  doc.y = rY + 22;
});

// Finalize Document & Apply Footers
addFooter(doc);
doc.end();

writeStream.on("finish", () => {
  console.log("PDF generation complete: Lumio_Architecture_and_Setup_Guide.pdf");
});
