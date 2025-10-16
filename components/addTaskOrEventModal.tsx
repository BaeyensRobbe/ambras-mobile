import React, { useEffect, useRef, useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Switch,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { ambrasGreen, styles } from "../styles";
import { addGoogleCalendarEvent } from "../api/google-calendar";

type AddEventModalProps = {
  visible: boolean;
  onClose: () => void;
  onAdded?: () => void;
};

const recurrenceOptions = ["None", "Daily", "Weekly", "Monthly", "Yearly"];
const colorOptions = [
  { id: "1", hex: "#D6CFEA" },
  { id: "2", hex: "#A4BCA1" },
  { id: "3", hex: "#8E24AA" },
  { id: "4", hex: "#FF6F61" },
  { id: "5", hex: "#FFF176" },
  { id: "6", hex: "#FFA726" },
  { id: "7", hex: "#00ACC1" },
  { id: "8", hex: "#616161" },
  { id: "9", hex: "#42A5F5" },
  { id: "10", hex: "#388E3C" },
  { id: "11", hex: "#E53935" },
];

const AddEventModal: React.FC<AddEventModalProps> = ({ visible, onClose, onAdded }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState(new Date());
  const [startTime, setStartTime] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());
  const [allDay, setAllDay] = useState(false);
  const [location, setLocation] = useState("");
  const [recurrence, setRecurrence] = useState("None");
  const [recurrenceEnd, setRecurrenceEnd] = useState(new Date());
  const [colorId, setColorId] = useState("1");

  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [showRecurrenceEndPicker, setShowRecurrenceEndPicker] = useState(false);

  const titleInputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (visible) setTimeout(() => titleInputRef.current?.focus(), 200);
  }, [visible]);

  const combineDateTime = (date: Date, time: Date) =>
    new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      time.getHours(),
      time.getMinutes(),
      0
    );

  const handleSave = async () => {
  if (!title.trim()) {
    Alert.alert("Validation Error", "Title is required.");
    return;
  }

  let start: Date, end: Date;
  if (allDay) {
  // Keep the exact calendar date, independent of timezone
  start = new Date(Date.UTC(startDate.getFullYear(), startDate.getMonth(), startDate.getDate()));
  end = new Date(Date.UTC(endDate.getFullYear(), endDate.getMonth(), endDate.getDate()));

  // Google Calendar expects exclusive end, so add 1 day
  end.setUTCDate(end.getUTCDate());
} else {
    start = combineDateTime(startDate, startTime);
    end = combineDateTime(endDate, endTime);
  }
  console.log("Combined start:", start, "end:", end);
  try {
    await addGoogleCalendarEvent({
      title,
      description,
      start,
      end,
      location,
      allDay,
      recurrence: recurrence !== "None" ? recurrence : undefined,
      recurrenceEnd: recurrence !== "None" ? recurrenceEnd : undefined,
      color: colorId,
    });
    Alert.alert("Success", "Event added to Google Calendar!");
    onAdded?.();
    handleClose();
  } catch (err) {
    console.error(err);
    Alert.alert("Error", "Could not add event to Google Calendar.");
  }
};


  const handleClose = () => {
    setTitle("");
    setDescription("");
    setStartDate(new Date());
    setStartTime(new Date());
    setEndDate(new Date());
    setEndTime(new Date());
    setAllDay(false);
    setLocation("");
    setRecurrence("None");
    setRecurrenceEnd(new Date());
    setColorId("1");
    onClose();
  };

  const handleDateChange = (event: any, selected: Date | undefined, setter: (d: Date) => void, hide: () => void) => {
    hide();
    if (event.type === "dismissed") return;
    if (selected) setter(selected);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1, justifyContent: "flex-end" }}>
        <View style={styles.modalContainer}>
          <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
            <TextInput
              ref={titleInputRef}
              style={{ fontSize: 22, fontWeight: "600", marginBottom: 10 }}
              placeholder="Add title"
              value={title}
              onChangeText={setTitle}
            />

            <TextInput style={[styles.input, { marginBottom: 10 }]} placeholder="Description" value={description} onChangeText={setDescription} />

            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
              <Text style={{ marginRight: 10 }}>All Day</Text>
              <Switch value={allDay} onValueChange={setAllDay} />
            </View>

            {/* Start */}
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 10 }}>
              <Text>Start</Text>
              <TouchableOpacity onPress={() => setShowStartDatePicker(true)}>
                <Text>{startDate.toLocaleDateString()}</Text>
              </TouchableOpacity>
              {!allDay && (
                <TouchableOpacity onPress={() => setShowStartTimePicker(true)}>
                  <Text>
                    {startTime.getHours().toString().padStart(2, "0")}:{startTime.getMinutes().toString().padStart(2, "0")}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {showStartDatePicker && (
              <DateTimePicker
                value={startDate}
                mode="date"
                display="default"
                onChange={(e, d) => handleDateChange(e, d, setStartDate, () => setShowStartDatePicker(false))}
              />
            )}
            {showStartTimePicker && (
              <DateTimePicker
                value={startTime}
                mode="time"
                display="default"
                onChange={(e, d) => handleDateChange(e, d, setStartTime, () => setShowStartTimePicker(false))}
              />
            )}

            {/* End */}
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 10 }}>
              <Text>End</Text>
              <TouchableOpacity onPress={() => setShowEndDatePicker(true)}>
                <Text>{allDay ? new Date(endDate.getTime() - 1).toLocaleDateString() : endDate.toLocaleDateString()}</Text>
              </TouchableOpacity>
              {!allDay && (
                <TouchableOpacity onPress={() => setShowEndTimePicker(true)}>
                  <Text>
                    {endTime.getHours().toString().padStart(2, "0")}:{endTime.getMinutes().toString().padStart(2, "0")}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {showEndDatePicker && (
              <DateTimePicker
                value={endDate}
                mode="date"
                display="default"
                onChange={(e, d) => handleDateChange(e, d, setEndDate, () => setShowEndDatePicker(false))}
              />
            )}
            {showEndTimePicker && (
              <DateTimePicker
                value={endTime}
                mode="time"
                display="default"
                onChange={(e, d) => handleDateChange(e, d, setEndTime, () => setShowEndTimePicker(false))}
              />
            )}

            <TextInput style={[styles.input, { marginBottom: 10 }]} placeholder="Location" value={location} onChangeText={setLocation} />

            {/* Recurrence */}
            <TouchableOpacity
              style={{ marginBottom: 10 }}
              onPress={() =>
                Alert.alert(
                  "Recurrence",
                  "Select recurrence",
                  recurrenceOptions.map((opt) => ({ text: opt, onPress: () => setRecurrence(opt) }))
                )
              }
            >
              <Text>Recurrence: {recurrence}</Text>
            </TouchableOpacity>

            {recurrence !== "None" && (
              <TouchableOpacity onPress={() => setShowRecurrenceEndPicker(true)} style={{ marginBottom: 10 }}>
                <Text>Recurrence End: {recurrenceEnd.toLocaleDateString()}</Text>
              </TouchableOpacity>
            )}
            {showRecurrenceEndPicker && (
              <DateTimePicker
                value={recurrenceEnd}
                mode="date"
                display="default"
                onChange={(e, d) => handleDateChange(e, d, setRecurrenceEnd, () => setShowRecurrenceEndPicker(false))}
              />
            )}

            {/* Color */}
            <View style={{ flexDirection: "row", marginBottom: 10 }}>
              {colorOptions.map((c) => (
                <TouchableOpacity
                  key={c.id}
                  onPress={() => setColorId(c.id)}
                  style={{
                    backgroundColor: c.hex,
                    width: 30,
                    height: 30,
                    borderRadius: 15,
                    marginRight: 10,
                    borderWidth: colorId === c.id ? 2 : 0,
                    borderColor: "#000",
                  }}
                />
              ))}
            </View>

            <TouchableOpacity style={[styles.actionButton, { backgroundColor: ambrasGreen, marginBottom: 10 }]} onPress={handleSave}>
              <Text style={styles.buttonText}>Save</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.actionButton, { backgroundColor: "gray" }]} onPress={handleClose}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default AddEventModal;
