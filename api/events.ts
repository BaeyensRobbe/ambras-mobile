import { VERCEL_URL} from '@env';

export const fetchNextEvent = async () => {
  try {
    const response = await fetch(`http://${VERCEL_URL}/events/next`);
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching next event:", error);
    throw error;
  }
}

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