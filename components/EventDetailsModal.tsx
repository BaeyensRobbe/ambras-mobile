import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Platform,
} from "react-native";
import { styles, ambrasGreen } from "../styles";

type EventDetailsModalProps = {
  visible: boolean;
  onClose: () => void;
  event: {
    title: string;
    description?: string;
    location?: string;
    start: Date;
    end: Date;
    allDay?: boolean;
  } | null;
};

const formatDate = (date: Date, allDay?: boolean) => {
  if (allDay) {
    return date.toLocaleDateString();
  } else {
    return date.toLocaleString();
  }
};

const EventDetailsModal: React.FC<EventDetailsModalProps> = ({
  visible,
  onClose,
  event,
}) => {
  if (!event) return null;

  // If all-day, subtract 1 ms from end to show correct inclusive date
  const displayEnd = event.allDay
    ? new Date(event.end.getTime() - 1)
    : event.end;

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.5)",
          justifyContent: "center",
          padding: 20,
        }}
      >
        <View
          style={{
            backgroundColor: "#fff",
            borderRadius: 12,
            padding: 20,
            maxHeight: "80%",
          }}
        >
          <ScrollView>
            <Text style={{ fontSize: 24, fontWeight: "700", marginBottom: 10 }}>
              {event.title}
            </Text>

            {event.description ? (
              <Text style={{ fontSize: 16, marginBottom: 10 }}>
                {event.description}
              </Text>
            ) : null}

            {event.location ? (
              <Text style={{ fontSize: 16, marginBottom: 10 }}>
                📍 {event.location}
              </Text>
            ) : null}

            <Text style={{ fontSize: 16, marginBottom: 5, fontWeight: "600" }}>
              {event.allDay ? "All-Day Event" : "Start"}
            </Text>
            <Text style={{ fontSize: 16, marginBottom: 10 }}>
              {formatDate(event.start, event.allDay)}
            </Text>

            <Text style={{ fontSize: 16, marginBottom: 5, fontWeight: "600" }}>
              End
            </Text>
            <Text style={{ fontSize: 16, marginBottom: 10 }}>
              {formatDate(displayEnd, event.allDay)}
            </Text>
          </ScrollView>

          <TouchableOpacity
            onPress={onClose}
            style={{
              backgroundColor: ambrasGreen,
              paddingVertical: 12,
              borderRadius: 8,
              marginTop: 10,
              alignItems: "center",
            }}
          >
            <Text style={{ color: "#fff", fontSize: 16, fontWeight: "600" }}>
              Close
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default EventDetailsModal;
