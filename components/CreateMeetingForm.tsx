"use client";

import { useState } from "react";
import { createMeetingAction } from "@/app/actions/create-event";
import { Video, Calendar, Mail, Clock, CheckCircle, AlertCircle, Loader2, Plus, X, Users } from "lucide-react";

export function CreateMeetingForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdMeetLink, setCreatedMeetLink] = useState<string | null>(null);

  // Set default times (Tomorrow at 10:00 AM to 11:00 AM)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(10, 0, 0, 0);

  const tomorrowEnd = new Date(tomorrow);
  tomorrowEnd.setHours(11, 0, 0, 0);

  const formatForInput = (d: Date) => {
    const pad = (n: number) => n.toString().padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const [title, setTitle] = useState("Client Technical Sync & Review");
  const [description, setDescription] = useState("Discuss project requirements, timeline, and deliverables.");
  const [startTime, setStartTime] = useState(formatForInput(tomorrow));
  const [endTime, setEndTime] = useState(formatForInput(tomorrowEnd));

  // Multi-guest state
  const [clientEmails, setClientEmails] = useState<string[]>(["client1@example.com", "client2@company.com"]);
  const [guestInput, setGuestInput] = useState("");

  const addGuestEmail = () => {
    if (!guestInput.trim()) return;

    // Split by comma or space to support pasting multiple emails at once
    const rawEmails = guestInput.split(/[\s,]+/);
    const newValidEmails: string[] = [];

    for (const raw of rawEmails) {
      const cleaned = raw.trim().toLowerCase();
      if (cleaned && cleaned.includes("@") && !clientEmails.includes(cleaned)) {
        newValidEmails.push(cleaned);
      }
    }

    if (newValidEmails.length > 0) {
      setClientEmails([...clientEmails, ...newValidEmails]);
      setGuestInput("");
    }
  };

  const removeGuestEmail = (emailToRemove: string) => {
    setClientEmails(clientEmails.filter((e) => e !== emailToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === "," || e.key === "Tab") {
      e.preventDefault();
      addGuestEmail();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setCreatedMeetLink(null);

    // Add current typed text if user didn't hit Enter
    let finalEmails = [...clientEmails];
    if (guestInput.trim() && guestInput.includes("@") && !finalEmails.includes(guestInput.trim().toLowerCase())) {
      finalEmails.push(guestInput.trim().toLowerCase());
      setClientEmails(finalEmails);
      setGuestInput("");
    }

    if (finalEmails.length === 0) {
      setError("Please add at least one guest/client email address.");
      return;
    }

    setLoading(true);

    try {
      const res = await createMeetingAction({
        title,
        description,
        startTime,
        endTime,
        clientEmails: finalEmails,
      });

      if (res.error) {
        setError(res.error);
        if (res.event?.meetLink) {
          setCreatedMeetLink(res.event.meetLink);
        }
      } else if (res.event?.meetLink) {
        setCreatedMeetLink(res.event.meetLink);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center space-x-3 border-b border-gray-100 pb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
          <Calendar className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900">Create New Meeting</h2>
          <p className="text-xs text-gray-500">
            Saves to <span className="font-semibold text-blue-600">Custom App Calendar</span> & syncs to <span className="font-semibold text-green-600">Google Calendar</span>
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-5 flex items-start space-x-3 rounded-xl bg-red-50 p-4 text-xs text-red-700 border border-red-200">
          <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-500" />
          <div className="flex-1">{error}</div>
        </div>
      )}

      {createdMeetLink && (
        <div className="mb-6 rounded-xl border border-green-200 bg-green-50 p-5">
          <div className="flex items-center space-x-2 text-green-800">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <h3 className="font-bold text-sm">Meeting Successfully Created & Synced!</h3>
          </div>
          <p className="mt-1 text-xs text-green-700">
            Google Calendar invitations sent to {clientEmails.length} guest{clientEmails.length === 1 ? "" : "s"}:{" "}
            <span className="font-semibold">{clientEmails.join(", ")}</span>.
          </p>
          <div className="mt-3 flex items-center justify-between rounded-lg border border-green-300 bg-white p-3 shadow-xs">
            <div className="flex items-center space-x-2 text-xs font-mono text-gray-800 truncate">
              <Video className="h-4 w-4 text-blue-600 flex-shrink-0" />
              <span className="truncate">{createdMeetLink}</span>
            </div>
            <a
              href={createdMeetLink}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-3 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 transition"
            >
              Join Meet
            </a>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Meeting Title
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3.5 py-2 text-xs text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="e.g. Client Technical Review"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Description
          </label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3.5 py-2 text-xs text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Meeting agenda or details..."
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Start Time
            </label>
            <input
              type="datetime-local"
              required
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              End Time
            </label>
            <input
              type="datetime-local"
              required
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Multi-Guest Email Chip Input Component */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-semibold text-gray-700 flex items-center space-x-1.5">
              <Users className="h-3.5 w-3.5 text-blue-600" />
              <span>Add Guests / Client Emails (Multiple Invites)</span>
            </label>
            <span className="text-[11px] font-medium text-gray-500">
              {clientEmails.length} guest{clientEmails.length === 1 ? "" : "s"} added
            </span>
          </div>

          <div className="rounded-xl border border-gray-300 bg-gray-50/50 p-2.5 space-y-2 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
            {/* Added Email Chips */}
            <div className="flex flex-wrap gap-1.5">
              {clientEmails.map((email) => (
                <span
                  key={email}
                  className="inline-flex items-center space-x-1.5 rounded-full bg-blue-100/80 px-2.5 py-1 text-xs font-medium text-blue-900 border border-blue-200"
                >
                  <Mail className="h-3 w-3 text-blue-600" />
                  <span>{email}</span>
                  <button
                    type="button"
                    onClick={() => removeGuestEmail(email)}
                    className="rounded-full p-0.5 text-blue-700 hover:bg-blue-200 hover:text-blue-900 transition"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>

            {/* Input field + Add button */}
            <div className="flex items-center space-x-2 pt-1 border-t border-gray-200/60">
              <input
                type="email"
                value={guestInput}
                onChange={(e) => setGuestInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 bg-transparent px-2 py-1 text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none"
                placeholder="Type email and press Enter, comma, or paste..."
              />
              <button
                type="button"
                onClick={addGuestEmail}
                className="inline-flex items-center space-x-1 rounded-lg bg-gray-200 px-2.5 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-300 transition"
              >
                <Plus className="h-3.5 w-3.5 text-gray-600" />
                <span>Add</span>
              </button>
            </div>
          </div>
          <p className="mt-1 text-[10px] text-gray-400">
            Press Enter, comma, or paste multiple emails. All listed guests will receive Google Calendar email invites with the Google Meet link.
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center space-x-2 rounded-xl bg-blue-600 py-3 text-xs font-semibold text-white shadow-md hover:bg-blue-700 disabled:bg-blue-300 transition"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin text-white" />
              <span>Creating & Syncing Meeting...</span>
            </>
          ) : (
            <>
              <Video className="h-4 w-4 text-white" />
              <span>Create Event & Invite {clientEmails.length} Guest{clientEmails.length === 1 ? "" : "s"}</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
