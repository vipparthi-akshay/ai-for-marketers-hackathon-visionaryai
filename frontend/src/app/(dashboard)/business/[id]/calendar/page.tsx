"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import { useUIStore } from "@/stores/uiStore";
import { ChevronLeft, ChevronRight, Plus, Pen, Rocket, Megaphone, Search } from "lucide-react";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const platformColors: Record<string, string> = {
  instagram: "bg-pink-500/10 text-pink-500 border-pink-500/20",
  facebook: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  linkedin: "bg-blue-700/10 text-blue-400 border-blue-700/20",
  twitter: "bg-sky-500/10 text-sky-500 border-sky-500/20",
  email: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  blog: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  general: "bg-primary/10 text-primary border-primary/20",
};

interface CalendarEvent {
  id: string;
  title: string;
  type: string;
  platform: string;
  date: string;
  status: string;
}

export default function ContentCalendarPage() {
  const params = useParams();
  const businessId = params.id as string;
  const { addToast } = useUIStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  useEffect(() => {
    loadContent();
  }, [businessId]);

  const loadContent = async () => {
    try {
      const [content, campaigns] = await Promise.all([
        api.content.list(businessId).catch(() => []),
        api.campaigns.list(businessId).catch(() => []),
      ]);

      const calEvents: CalendarEvent[] = [];

      (content || []).forEach((c: any) => {
        const d = new Date(c.created_at);
        calEvents.push({
          id: c.id,
          title: c.title || `${c.asset_type} content`,
          type: "content",
          platform: c.platform || "general",
          date: d.toISOString().split("T")[0],
          status: c.status || "draft",
        });
      });

      (campaigns || []).forEach((c: any) => {
        if (c.start_date) {
          calEvents.push({
            id: c.id,
            title: c.name || "Campaign",
            type: "campaign",
            platform: c.platforms?.[0] || "general",
            date: c.start_date,
            status: c.status || "draft",
          });
        }
        if (c.content_calendar && Array.isArray(c.content_calendar)) {
          c.content_calendar.forEach((item: any, i: number) => {
            if (item.date) {
              calEvents.push({
                id: `${c.id}-${i}`,
                title: item.topic || item.content_type || "Scheduled post",
                type: "scheduled",
                platform: item.platform || "general",
                date: item.date,
                status: "scheduled",
              });
            }
          });
        }
      });

      setEvents(calEvents);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const getEventsForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return events.filter((e) => e.date === dateStr);
  };

  return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Content Calendar</h2>
            <p className="text-muted-foreground">Plan and track your content across all channels</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-muted transition-colors">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="font-semibold min-w-[160px] text-center">
              {MONTHS[month]} {year}
            </span>
            <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-muted transition-colors">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 rounded-lg border border-border bg-card overflow-hidden">
            <div className="grid grid-cols-7">
              {DAYS.map((day) => (
                <div key={day} className="p-3 text-center text-xs font-medium text-muted-foreground border-b border-border">
                  {day}
                </div>
              ))}
              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`empty-${i}`} className="h-24 md:h-28 border-b border-r border-border bg-muted/20" />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dayEvents = getEventsForDay(day);
                const isToday = today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;
                return (
                  <div
                    key={day}
                    onClick={() => setSelectedDay(selectedDay === day ? null : day)}
                    className={`h-24 md:h-28 border-b border-r border-border p-1.5 cursor-pointer hover:bg-muted/30 transition-colors ${
                      isToday ? "bg-primary/5" : ""
                    } ${selectedDay === day ? "ring-2 ring-primary/50" : ""}`}
                  >
                    <div className={`text-xs font-medium mb-1 ${isToday ? "text-primary font-bold" : ""}`}>
                      {day}
                    </div>
                    <div className="space-y-0.5">
                      {dayEvents.slice(0, 3).map((event) => (
                        <div
                          key={event.id}
                          className={`text-[10px] px-1 py-0.5 rounded truncate border ${platformColors[event.platform] || platformColors.general}`}
                          title={event.title}
                        >
                          {event.title}
                        </div>
                      ))}
                      {dayEvents.length > 3 && (
                        <div className="text-[10px] text-muted-foreground">+{dayEvents.length - 3} more</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-lg border border-border bg-card p-4">
              <h3 className="font-semibold mb-3">Legend</h3>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-pink-500" /> Instagram
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-blue-500" /> Facebook
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-blue-700" /> LinkedIn
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-sky-500" /> Twitter
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-amber-500" /> Email
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-emerald-500" /> Blog
                </div>
              </div>
            </div>

            {selectedDay && (
              <div className="rounded-lg border border-border bg-card p-4">
                <h3 className="font-semibold mb-3">
                  {MONTHS[month]} {selectedDay}
                </h3>
                {getEventsForDay(selectedDay).length === 0 ? (
                  <p className="text-xs text-muted-foreground">No content scheduled</p>
                ) : (
                  <div className="space-y-2">
                    {getEventsForDay(selectedDay).map((event) => (
                      <div key={event.id} className="p-2 rounded-lg bg-muted/50 text-xs">
                        <div className="font-medium">{event.title}</div>
                        <div className="text-muted-foreground capitalize">{event.platform} • {event.status}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="rounded-lg border border-border bg-card p-4">
              <h3 className="font-semibold mb-3">This Month</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Posts</span>
                  <span className="font-medium">{events.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Platforms</span>
                  <span className="font-medium">{new Set(events.map((e) => e.platform)).size}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}
