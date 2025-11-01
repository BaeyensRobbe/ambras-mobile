import { VERCEL_URL } from "@env";

const apiUrl = VERCEL_URL.startsWith("http") ? VERCEL_URL : `https://${VERCEL_URL}`;

export const fetchGoogleCalendarEvents = async () => {
  try {
    const res = await fetch(`${apiUrl}/google-calendar`);
    if (!res.ok) throw new Error("Failed to fetch calendar events");
    const data = await res.json();
    return data;
  } catch (err) {
    console.error("Error fetching Google Calendar events:", err);
    throw err;
  }
};

export const addGoogleCalendarEvent = async (event: {
  title: string;
  description?: string;
  start: Date;
  end: Date;
  location?: string;
  allDay?: boolean;
  recurrence?: string;
  recurrenceEnd?: Date;
  color?: string;
}) => {
  try {
    let startStr: string;
    let endStr: string;

    if (event.allDay) {
      // All-day events: send exclusive end date to Google
      startStr = event.start.toISOString().split("T")[0];
      // end is already exclusive in frontend (next day)
      endStr = event.end.toISOString().split("T")[0];
    } else {
      startStr = event.start.toISOString();
      endStr = event.end.toISOString();
    }

    const payload: any = {
      title: event.title,
      description: event.description || "",
      start: startStr,
      end: endStr,
      location: event.location || "",
      allDay: event.allDay || false,
      color: event.color,
      recurrence: event.recurrence,
      recurrenceEnd: event.recurrenceEnd?.toISOString(),
    };

    const res = await fetch(`${apiUrl}/google-calendar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error(`Failed to add event: ${res.status}`);

    return await res.json();
  } catch (err) {
    console.error("Error adding Google Calendar event:", err);
    throw err;
  }
};
