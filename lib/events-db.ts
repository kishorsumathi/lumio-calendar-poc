import fs from "fs";
import path from "path";

export interface CustomEvent {
  id: string;
  userEmail: string;
  userName: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  clientEmails: string[];
  clientEmail?: string; // Optional for backwards compatibility
  meetLink?: string;
  googleEventId?: string;
  status: "local_pending" | "synced" | "sync_failed";
  createdAt: string;
}

const dataFilePath = path.join(process.cwd(), "data", "events.json");

function ensureDirectoryExists() {
  const dir = path.dirname(dataFilePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

export function getCustomEvents(): CustomEvent[] {
  try {
    ensureDirectoryExists();
    if (!fs.existsSync(dataFilePath)) {
      return [];
    }
    const content = fs.readFileSync(dataFilePath, "utf-8");
    const parsed = JSON.parse(content) as CustomEvent[];
    
    // Normalize events so clientEmails is always an array
    return parsed.map((e) => ({
      ...e,
      clientEmails: e.clientEmails || (e.clientEmail ? [e.clientEmail] : []),
    }));
  } catch (error) {
    console.error("Error reading events DB:", error);
    return [];
  }
}

export function saveCustomEvents(events: CustomEvent[]): void {
  try {
    ensureDirectoryExists();
    fs.writeFileSync(dataFilePath, JSON.stringify(events, null, 2), "utf-8");
  } catch (error) {
    console.error("Error writing events DB:", error);
  }
}

export function addCustomEvent(event: CustomEvent): CustomEvent {
  const events = getCustomEvents();
  events.unshift(event);
  saveCustomEvents(events);
  return event;
}

export function updateCustomEvent(
  id: string,
  updates: Partial<CustomEvent>
): CustomEvent | null {
  const events = getCustomEvents();
  const index = events.findIndex((e) => e.id === id);
  if (index === -1) return null;

  events[index] = { ...events[index], ...updates };
  saveCustomEvents(events);
  return events[index];
}
