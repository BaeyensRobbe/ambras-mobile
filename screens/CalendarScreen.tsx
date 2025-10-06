// CalendarScreen.tsx
import React, { useEffect, useState } from "react";
import { View, Dimensions, Alert } from "react-native";
import { Calendar } from "react-native-big-calendar";
import AppHeader from "../components/AppHeader"; 
import AddItemModal from "../components/addTaskOrEventModal";
import { ip_address } from "../config/ip";

type CalendarEvent = {
  id: string;
  title: string;
  start: Date;
  end: Date;
  description?: string;
  allDay?: boolean;
  color?: string;
};

type Task = {
  id: number;
  title: string;
  description?: string;
  due_date: string;
  reminder_time?: string;
};

type Event = {
  id: number;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  all_day?: boolean;
  location?: string;
  reminder_time?: string;
  recurrence_rule?: string;
  recurrence_end?: string;
  status?: string;
};

const CalendarScreen = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());

  //Modal visibility states
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<"task" | "event">("task");



  // Fetch tasks and events
  useEffect(() => {
    const fetchData = async () => {
      try {
        const tasksRes = await fetch(`http://${ip_address}:4000/tasks`);
        const tasksData = await tasksRes.json();
        setTasks(tasksData);

        const eventsRes = await fetch(`http://${ip_address}:4000/events`);
        const eventsData = await eventsRes.json();
        setEvents(eventsData);
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, []);

  // Merge tasks and events into calendar events
  useEffect(() => {
    const merged: CalendarEvent[] = [
      ...tasks.map((t) => ({
        id: `task-${t.id}`,
        title: t.title,
        start: new Date(t.due_date),
        end: new Date(t.due_date),
        description: t.description,
        color: "#006400",
      })),
      ...events.map((e) => ({
        id: `event-${e.id}`,
        title: e.title,
        start: new Date(e.start_time),
        end: new Date(e.end_time),
        description: `${e.description || ""}${e.location ? `\nLocation: ${e.location}` : ""}`,
        allDay: e.all_day,
        color: e.all_day ? "#00AA00" : "#00FF00",
      })),
    ];

    setCalendarEvents(merged);
  }, [tasks, events]);

  const handleEventPress = (event: CalendarEvent) => {
    Alert.alert(event.title, event.description || "");
  };

  const handlePrevMonth = () => {
    const prev = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    setCurrentDate(prev);
  };

  const handleNextMonth = () => {
    const next = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
    setCurrentDate(next);
  };

  const handleAddTask = () => {
    setModalType("task");
    setModalVisible(true);
  };

  const handleAddEvent = () => {
    setModalType("event");
    setModalVisible(true);
  };

  const handleSubmitItem = (item: any) => {
    if (modalType === "task") {
      const newTask: Task = {
        id: Date.now(), // temporary id
        title: item.title,
        description: item.description,
        due_date: item.due,
      };
      setTasks((prev) => [...prev, newTask]);
    } else {
      const newEvent: Event = {
        id: Date.now(), // temporary id
        title: item.title,
        description: item.description,
        start_time: item.start,
        end_time: item.end,
        all_day: item.allDay,
        location: item.location,
      };
      setEvents((prev) => [...prev, newEvent]);
    }

    setModalVisible(false);
  };


  const monthTitle = currentDate.toLocaleString("default", { month: "long", year: "numeric" });

  return (
    <View style={{ flex: 1 }}>
      <AppHeader
        title={monthTitle}
        style={{ justifyContent: "space-between" }}
        leftButton={{ icon: "chevron-back", onPress: handlePrevMonth }}
        rightButtons={[
          { icon: "list", onPress: handleAddTask },
          { icon: "add", onPress: handleAddEvent },
          { icon: "chevron-forward", onPress: handleNextMonth },
        ]}
      />

      <Calendar
        events={calendarEvents}
        height={Dimensions.get("window").height - 60} // leave space for header
        mode="month"
        swipeEnabled
        showTime
        date={currentDate}
        onPressEvent={handleEventPress}
        onSwipeEnd={(setDate) => setCurrentDate(setDate)}
      />
      <AddItemModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSubmit={handleSubmitItem}
        type={modalType}
      />
    </View>
  );
};

export default CalendarScreen;
