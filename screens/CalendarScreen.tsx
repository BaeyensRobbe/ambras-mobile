import React, { useEffect, useState, useCallback } from "react";
import { View, Dimensions, Alert } from "react-native";
import { Calendar, CalendarEvent as RNBCEvent } from "react-native-big-calendar";
import AppHeader from "../components/AppHeader";
import AddEventModal from "../components/addTaskOrEventModal";
import { styles } from "../styles";
import { fetchGoogleCalendarEvents } from "../api/google-calendar";
import EventDetailsModal from "../components/EventDetailsModal";

interface CalendarEvent extends RNBCEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  description?: string;
  allDay?: boolean;
  colorId?: string;
  location?: string;
}

const ambrasGreen = "#1F3B28";

const CalendarScreen: React.FC = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [modalVisible, setModalVisible] = useState(false);

  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [editModalVisible, setEditModalVisible] = useState(false);

  const fetchEvents = useCallback(async () => {
    try {
      const data = await fetchGoogleCalendarEvents();
      const formatted: CalendarEvent[] = data.map((ev: any) => {
        let start: Date;
        let end: Date;
        let allDay = false;
        if (ev.start?.date) {
          start = new Date(ev.start.date); // start of day in local TZ
          // subtract 1 ms is wrong; instead just subtract 1 day from Google-exclusive end
          end = new Date(ev.end.date);
          end.setDate(end.getDate() - 1); // Google end is exclusive, make it inclusive
          end.setHours(23, 59, 59, 999); // optional, for display in calendar library
          allDay = true;
        } else {
          start = new Date(ev.start.dateTime);
          end = new Date(ev.end.dateTime);
        }
        return {
          id: ev.id,
          title: ev.summary || "Untitled",
          start,
          end,
          description: ev.description || "",
          allDay,
          color: ev.colorId ? `#${ev.colorId}` : ambrasGreen,
          location: ev.location || "",
        };
      });
      setEvents(formatted);
    } catch (err) {
      console.error("Error fetching Google Calendar events:", err);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleEventPress = (event: CalendarEvent) => {
  setSelectedEvent(event);
  setEditModalVisible(true);
};


  const handlePrevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const handleAddEvent = () => setModalVisible(true);

  return (
    <View style={{ flex: 1 }}>
      <AppHeader
        title={currentDate.toLocaleString("default", { month: "long", year: "numeric" })}
        style={{ justifyContent: "space-between" }}
        leftButton={{ icon: "chevron-back", onPress: handlePrevMonth }}
        rightButtons={[{ icon: "add", onPress: handleAddEvent }, { icon: "chevron-forward", onPress: handleNextMonth }]}
      />

      <Calendar
        events={events}
        height={Dimensions.get("window").height - 60}
        mode="month"
        swipeEnabled
        showTime
        date={currentDate}
        onPressEvent={handleEventPress}
        onSwipeEnd={(newDate) => setCurrentDate(newDate)}
        eventCellStyle={(event) => ({ backgroundColor: event.color })}
      />

      <EventDetailsModal
  visible={editModalVisible}
  event={selectedEvent}
  onClose={() => setEditModalVisible(false)}
/>

      <AddEventModal visible={modalVisible} onClose={() => setModalVisible(false)} onAdded={fetchEvents} />
    </View>
  );
};

export default CalendarScreen;
