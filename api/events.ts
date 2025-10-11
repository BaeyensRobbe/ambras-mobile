import { API2_URL, VERCEL_URL} from '@env';

export const fetchNextEvent = async () => {
  try {
    const response = await fetch(`http://${VERCEL_URL}:4000/events/next`);
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
    const response = await fetch(`http://${VERCEL_URL}:4000/tasks/upcoming`);
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
    const response = await fetch(`http://${VERCEL_URL}:4000/tasks`, {
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