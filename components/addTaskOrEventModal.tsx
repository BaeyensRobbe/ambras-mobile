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
import { Ionicons } from "@expo/vector-icons";

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

  const formatDate = (date: Date) =>
  date.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const handleDateChange = (
    event: any,
    selected: Date | undefined,
    setter: (d: Date) => void,
    hide: () => void,
    isStartDate: boolean = false
  ) => {
    hide();
    if (event.type === "dismissed") return;
    if (!selected) return;

    if (isStartDate) {
      // calculate delta in ms
      const delta = selected.getTime() - startDate.getTime();

      setter(selected);
      setEndDate(new Date(endDate.getTime() + delta));
    } else {
      setter(selected);
    }
  };

  const handleTimeChange = (
    event: any,
    selected: Date | undefined,
    setter: (d: Date) => void,
    hide: () => void,
    isStartTime: boolean = false
  ) => {
    hide();
    if (event.type === "dismissed") return;
    if (!selected) return;

    if (isStartTime) {
      // calculate delta in ms
      const delta = selected.getTime() - startTime.getTime();

      setter(selected);
      setEndTime(new Date(endTime.getTime() + delta));
    } else {
      setter(selected);
    }
  };




  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1, justifyContent: "flex-end" }}>
        <View style={{ ...styles.modalContainer, padding: 20 }}>
          <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
            <TextInput
              ref={titleInputRef}
              style={{ fontSize: 22, fontWeight: "600", marginBottom: 20, borderBottomWidth: 2 }}
              placeholder="Add title"
              placeholderTextColor={"gray"}
              value={title}
              onChangeText={setTitle}
            />


            <View style={{ marginBottom: 10, borderBottomWidth: 1, borderBottomColor: "#ccc" }}>
              <TouchableOpacity onPress={() => { setAllDay(!allDay) }}>
                <View style={{ ...styles.flexRow, marginBottom: 10 }}>
                  <Text style={styles.addEventText}>All day event</Text>
                  <Ionicons
                    name={allDay ? "checkmark-circle" : "radio-button-off"}
                    size={30}
                    color={allDay ? ambrasGreen : "#999"}
                    style={{ marginTop: -5 }}
                  />
                </View>
              </TouchableOpacity>

             <View style={{ flexDirection: "column", gap: 10 }}>
  <View style={styles.flexRow}>
    <TouchableOpacity onPress={() => setShowStartDatePicker(true)}>
      <Text style={styles.addEventText}>{formatDate(startDate)}</Text>
    </TouchableOpacity>
    {!allDay && (
      <TouchableOpacity onPress={() => setShowStartTimePicker(true)}>
        <Text style={styles.addEventText}>
          {startTime.getHours().toString().padStart(2, "0")}:
          {startTime.getMinutes().toString().padStart(2, "0")}
        </Text>
      </TouchableOpacity>
    )}
  </View>

  <View style={styles.flexRow}>
    <TouchableOpacity onPress={() => setShowEndDatePicker(true)}>
      <Text style={styles.addEventText}>{formatDate(endDate)}</Text>
    </TouchableOpacity>
    {!allDay && (
      <TouchableOpacity onPress={() => setShowEndTimePicker(true)}>
        <Text style={styles.addEventText}>
          {endTime.getHours().toString().padStart(2, "0")}:
          {endTime.getMinutes().toString().padStart(2, "0")}
        </Text>
      </TouchableOpacity>
    )}
  </View>
</View>
              {showStartDatePicker && (
                <DateTimePicker
                  value={startDate}
                  mode="date"
                  display="default"
                  onChange={(e, d) => handleDateChange(e, d, setStartDate, () => setShowStartDatePicker(false), true)}
                />
              )}
             {showStartTimePicker && (
               <DateTimePicker
                 value={startTime}
                 mode="time"
                 display="default"
                 onChange={(e, d) =>
                   handleTimeChange(e, d, setStartTime, () => setShowStartTimePicker(false), true)
                 }
                 />
                )}
              {showEndDatePicker && (
                <DateTimePicker
                  value={endDate}
                  mode="date"
                  display="default"
                  onChange={(e, d) => handleDateChange(e, d, setEndDate, () => setShowEndDatePicker(false), false)}
                />
              )}
              {showEndTimePicker && (
                <DateTimePicker
                  value={endTime}
                  mode="time"
                  display="default"
                  onChange={(e, d) =>
                    handleTimeChange(e, d, setEndTime, () => setShowEndTimePicker(false), false)
                }
              />
              )}

              {/* Recurrence */}
            <TouchableOpacity
              style={{ marginBottom: 10, marginTop: 10 }}
              onPress={() =>
                Alert.alert(
                  "Recurrence",
                  "Select recurrence",
                  recurrenceOptions.map((opt) => ({ text: opt, onPress: () => setRecurrence(opt) }))
                )
              }
            >
              <Text style={styles.addEventText}>Recurrence: {recurrence}</Text>
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

            </View>

            <TextInput style={[styles.input, { marginBottom: 10 }]} placeholder="Description" placeholderTextColor={"gray"} value={description} onChangeText={setDescription} />

            <TextInput style={[styles.input, { marginBottom: 10 }]} placeholder="Location" placeholderTextColor={"gray"} value={location} onChangeText={setLocation} />

            

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
