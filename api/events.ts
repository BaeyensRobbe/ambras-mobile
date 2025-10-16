import { VERCEL_URL} from '@env';

export const fetchNextEvent = async () => {
  try {
    const response = await fetch("http://" + VERCEL_URL + "/google-calendar/next");

    if (!response.ok) {
      throw new Error(`Failed to fetch next event: ${response.status}`);
    }

    const data = await response.json();

    // Handle both array or object
    const event = Array.isArray(data) ? data[0] : data;

    if (!event) return null;

    // Normalize it for the dashboard
    return {
      id: event.id,
      title: event.summary || "Untitled event",
      description: event.description || "",
      start_time: event.start?.dateTime || event.start?.date,
      end_time: event.end?.dateTime || event.end?.date,
      location: event.location || "",
      htmlLink: event.htmlLink || "",
    };
  } catch (error) {
    console.error("Error fetching next event:", error);
    return null;
  }
};


export const fetchUpcomingTasks = async () => {
  try {
    const response = await fetch(`http://${VERCEL_URL}/tasks`);
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching upcoming tasks:", error);
    throw error;
  }
}

export const addTask = async (task: { title: string; description: string; due_date: string }) => {
  try {
    const response = await fetch(`http://${VERCEL_URL}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(task),
    });

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error adding task:", error);
    throw error;
  }
}

export const addEvent = async (event: {
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  all_day?: boolean;
  location?: string;
}) => {
  try {
    const res = await fetch(`http://${VERCEL_URL}/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(event),
    });

    if (!res.ok) throw new Error("Failed to add event");

    return await res.json();
  } catch (err) {
    console.error("Error adding event:", err);
    throw err;
  }
};