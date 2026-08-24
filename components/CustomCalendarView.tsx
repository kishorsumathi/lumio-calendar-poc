"use client";

import { useState } from "react";
import { CustomEvent } from "@/lib/events-db";
import { Calendar as CalendarIcon, Video, Clock, User, Mail, ExternalLink, CheckCircle2, AlertTriangle, RefreshCw, Grid, List, ChevronLeft, ChevronRight, Users } from "lucide-react";

interface CustomCalendarViewProps {
  events: CustomEvent[];
}

function formatISTTime(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return dateStr;
  }
}

export function CustomCalendarView({ events }: CustomCalendarViewProps) {
  const [viewMode, setViewMode] = useState<"grid" | "timeline">("grid");
  const [selectedEvent, setSelectedEvent] = useState<CustomEvent | null>(events[0] || null);

  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const totalDays = getDaysInMonth(currentYear, currentMonth);
  const startDay = getFirstDayOfMonth(currentYear, currentMonth);

  const prevMonthDays = getDaysInMonth(currentYear, currentMonth - 1);

  const calendarCells = [];
  
  for (let i = startDay - 1; i >= 0; i--) {
    calendarCells.push({ day: prevMonthDays - i, currentMonth: false, month: currentMonth - 1 });
  }
  
  for (let i = 1; i <= totalDays; i++) {
    calendarCells.push({ day: i, currentMonth: true, month: currentMonth });
  }

  const remaining = 35 - calendarCells.length;
  if (remaining > 0) {
    for (let i = 1; i <= remaining; i++) {
      calendarCells.push({ day: i, currentMonth: false, month: currentMonth + 1 });
    }
  }

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const getEventsForDay = (day: number, isCurrentMonth: boolean) => {
    if (!isCurrentMonth) return [];
    return events.filter((e) => {
      const d = new Date(e.startTime);
      return d.getDate() === day && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });
  };

  const getGuests = (event: CustomEvent): string[] => {
    if (event.clientEmails && event.clientEmails.length > 0) {
      return event.clientEmails;
    }
    return event.clientEmail ? [event.clientEmail] : [];
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-4">
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <CalendarIcon className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Our Custom In-App Calendar</h2>
            <p className="text-xs text-gray-500">
              IST Timezone (Asia/Kolkata GMT+5:30) • {events.length} event{events.length === 1 ? "" : "s"}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex items-center rounded-lg border border-gray-200 bg-gray-50 p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`flex items-center space-x-1 rounded-md px-3 py-1 text-xs font-semibold transition ${
                viewMode === "grid" ? "bg-white text-blue-600 shadow-xs" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <Grid className="h-3.5 w-3.5" />
              <span>Calendar Grid</span>
            </button>
            <button
              onClick={() => setViewMode("timeline")}
              className={`flex items-center space-x-1 rounded-md px-3 py-1 text-xs font-semibold transition ${
                viewMode === "timeline" ? "bg-white text-blue-600 shadow-xs" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <List className="h-3.5 w-3.5" />
              <span>Timeline View</span>
            </button>
          </div>
        </div>
      </div>

      {events.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 p-8 text-center">
          <CalendarIcon className="mx-auto h-8 w-8 text-gray-300" />
          <p className="mt-2 text-xs font-semibold text-gray-700">No meetings scheduled yet</p>
          <p className="text-[11px] text-gray-400">Use the form on the left to create your first meeting in IST.</p>
        </div>
      ) : viewMode === "grid" ? (
        <div className="space-y-4">
          {/* Month Navigation */}
          <div className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-2.5">
            <h3 className="text-sm font-bold text-gray-900">
              {monthNames[currentMonth]} {currentYear}
            </h3>
            <div className="flex items-center space-x-1">
              <button
                onClick={prevMonth}
                className="rounded-lg p-1 text-gray-600 hover:bg-white hover:shadow-xs transition"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={nextMonth}
                className="rounded-lg p-1 text-gray-600 hover:bg-white hover:shadow-xs transition"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Days Header */}
          <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold text-gray-500">
            {daysOfWeek.map((day) => (
              <div key={day} className="py-1">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid Cells */}
          <div className="grid grid-cols-7 gap-1">
            {calendarCells.map((cell, idx) => {
              const dayEvents = getEventsForDay(cell.day, cell.currentMonth);
              const isToday =
                cell.currentMonth &&
                cell.day === today.getDate() &&
                currentMonth === today.getMonth() &&
                currentYear === today.getFullYear();

              return (
                <div
                  key={idx}
                  className={`min-h-[75px] rounded-lg border p-1.5 transition ${
                    cell.currentMonth
                      ? isToday
                        ? "border-blue-500 bg-blue-50/30"
                        : "border-gray-200 bg-white"
                      : "border-gray-100 bg-gray-50/50 text-gray-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-semibold ${
                        isToday
                          ? "flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-white"
                          : cell.currentMonth
                          ? "text-gray-700"
                          : "text-gray-300"
                      }`}
                    >
                      {cell.day}
                    </span>
                    {dayEvents.length > 0 && (
                      <span className="flex h-2 w-2 rounded-full bg-blue-600" />
                    )}
                  </div>

                  <div className="mt-1.5 space-y-1">
                    {dayEvents.map((event) => (
                      <button
                        key={event.id}
                        onClick={() => setSelectedEvent(event)}
                        className={`w-full text-left truncate rounded px-1.5 py-1 text-[10px] font-medium transition ${
                          selectedEvent?.id === event.id
                            ? "bg-blue-600 text-white"
                            : "bg-blue-50 text-blue-800 hover:bg-blue-100"
                        }`}
                      >
                        <span className="truncate">{event.title}</span>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Event Inspector / Card */}
          {selectedEvent && (
            <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50/40 p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-sm font-bold text-gray-900">{selectedEvent.title}</h4>
                  <p className="text-xs text-gray-600">{selectedEvent.description}</p>
                </div>
                <span className="inline-flex items-center space-x-1 rounded-full bg-green-100 px-2.5 py-0.5 text-[10px] font-semibold text-green-800">
                  <CheckCircle2 className="h-3 w-3 text-green-600" />
                  <span>Synced to Google (IST)</span>
                </span>
              </div>

              <div className="mt-3 grid grid-cols-1 gap-2 text-xs text-gray-700 sm:grid-cols-2">
                <div className="flex items-center space-x-1.5">
                  <Clock className="h-4 w-4 text-blue-600 flex-shrink-0" />
                  <span>
                    <strong className="text-gray-900">Start (IST):</strong> {formatISTTime(selectedEvent.startTime)}
                  </span>
                </div>

                <div className="flex items-center space-x-1.5">
                  <Clock className="h-4 w-4 text-blue-600 flex-shrink-0" />
                  <span>
                    <strong className="text-gray-900">End (IST):</strong> {formatISTTime(selectedEvent.endTime)}
                  </span>
                </div>

                <div className="flex items-center space-x-1.5 sm:col-span-2">
                  <User className="h-4 w-4 text-indigo-600 flex-shrink-0" />
                  <span>
                    <strong className="text-gray-900">Organizer:</strong> {selectedEvent.userName} ({selectedEvent.userEmail})
                  </span>
                </div>
              </div>

              {/* Invited Guests List */}
              <div className="mt-2.5 border-t border-blue-200/40 pt-2 text-xs">
                <div className="flex items-center space-x-1.5 text-gray-700 font-semibold mb-1">
                  <Users className="h-3.5 w-3.5 text-purple-600" />
                  <span>Invited Guests ({getGuests(selectedEvent).length}):</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {getGuests(selectedEvent).map((email) => (
                    <span key={email} className="rounded-md bg-white border border-blue-200 px-2 py-0.5 text-[11px] font-medium text-blue-900 shadow-2xs">
                      {email}
                    </span>
                  ))}
                </div>
              </div>

              {selectedEvent.meetLink && (
                <div className="mt-3 flex items-center justify-between border-t border-blue-200/60 pt-3">
                  <div className="flex items-center space-x-1.5 font-mono text-xs text-blue-800">
                    <Video className="h-4 w-4 text-blue-600" />
                    <span>{selectedEvent.meetLink}</span>
                  </div>

                  <a
                    href={selectedEvent.meetLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1 rounded-lg bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 transition"
                  >
                    <span>Join Google Meet</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        /* Timeline List Mode */
        <div className="space-y-4">
          {events.map((event) => {
            const guests = getGuests(event);

            return (
              <div
                key={event.id}
                className="relative rounded-xl border border-gray-200 bg-gray-50/50 p-4 hover:border-blue-300 hover:bg-white hover:shadow-xs transition"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">{event.title}</h3>
                    {event.description && (
                      <p className="mt-0.5 text-xs text-gray-600 line-clamp-2">{event.description}</p>
                    )}
                  </div>

                  {event.status === "synced" && (
                    <span className="inline-flex items-center space-x-1 rounded-full bg-green-100 px-2.5 py-0.5 text-[10px] font-semibold text-green-800">
                      <CheckCircle2 className="h-3 w-3 text-green-600" />
                      <span>Synced to Google (IST)</span>
                    </span>
                  )}
                  {event.status === "local_pending" && (
                    <span className="inline-flex items-center space-x-1 rounded-full bg-yellow-100 px-2.5 py-0.5 text-[10px] font-semibold text-yellow-800">
                      <RefreshCw className="h-3 w-3 animate-spin text-yellow-600" />
                      <span>Local Pending</span>
                    </span>
                  )}
                  {event.status === "sync_failed" && (
                    <span className="inline-flex items-center space-x-1 rounded-full bg-red-100 px-2.5 py-0.5 text-[10px] font-semibold text-red-800">
                      <AlertTriangle className="h-3 w-3 text-red-600" />
                      <span>Local Saved (Sync Error)</span>
                    </span>
                  )}
                </div>

                <div className="mt-3 grid grid-cols-1 gap-2 text-[11px] text-gray-600 sm:grid-cols-2">
                  <div className="flex items-center space-x-1.5">
                    <Clock className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                    <span>
                      <strong className="text-gray-700">Time (IST):</strong> {formatISTTime(event.startTime)} - {formatISTTime(event.endTime)}
                    </span>
                  </div>

                  <div className="flex items-center space-x-1.5">
                    <User className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                    <span className="font-medium text-gray-700">Organizer:</span> {event.userName} ({event.userEmail})
                  </div>
                </div>

                <div className="mt-2 text-[11px]">
                  <span className="font-medium text-gray-700">Invited Guests ({guests.length}): </span>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {guests.map((g) => (
                      <span key={g} className="rounded bg-blue-50 border border-blue-200 px-2 py-0.5 text-[10px] font-medium text-blue-900">
                        {g}
                      </span>
                    ))}
                  </div>
                </div>

                {event.meetLink && (
                  <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3">
                    <div className="flex items-center space-x-1.5 text-xs text-blue-700">
                      <Video className="h-4 w-4 text-blue-600" />
                      <span className="font-mono text-[11px]">{event.meetLink}</span>
                    </div>

                    <a
                      href={event.meetLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 transition"
                    >
                      <span>Join Meet</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
