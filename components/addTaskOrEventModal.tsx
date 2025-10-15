import React, { useState } from "react";
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
import { styles } from "../styles";

type AddItemModalProps = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (item: any) => void;
  type: "task" | "event";
};

const recurrenceOptions = ["None", "Daily", "Weekly", "Monthly", "Yearly"];

const AddItemModal: React.FC<AddItemModalProps> = ({
  visible,
  onClose,
  onSubmit,
  type,
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  // Task
  const [dueDate, setDueDate] = useState(new Date());
  const [showDuePicker, setShowDuePicker] = useState(false);

  // Event
  const [startDate, setStartDate] = useState(new Date());
  const [startTime, setStartTime] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());

  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);

  const [allDay, setAllDay] = useState(false);
  const [location, setLocation] = useState("");
  const [recurrence, setRecurrence] = useState("None");
  const [recurrenceEnd, setRecurrenceEnd] = useState(new Date());
  const [showRecurrenceEndPicker, setShowRecurrenceEndPicker] = useState(false);

  const combineDateTime = (date: Date, time: Date) =>
    new Date(date.getFullYear(), date.getMonth(), date.getDate(), time.getHours(), time.getMinutes(), time.getSeconds());

  const handleSave = () => {
    if (!title.trim()) {
      Alert.alert("Validation Error", "Title is required.");
      return;
    }

    if (type === "task") {
      onSubmit({
        title,
        description,
        due_date: dueDate.toISOString(),
      });
    } else {
      const start = combineDateTime(startDate, startTime);
      const end = combineDateTime(endDate, endTime);
      onSubmit({
        title,
        description,
        start: start.toISOString(),
        end: end.toISOString(),
        allDay,
        location,
        recurrence: recurrence !== "None" ? recurrence : null,
        recurrenceEnd: recurrence !== "None" ? recurrenceEnd.toISOString() : null,
      });
    }
    
    // Reset
    setTitle("");
    setDescription("");
    setDueDate(new Date());
    setStartDate(new Date());
    setStartTime(new Date());
    setEndDate(new Date());
    setEndTime(new Date());
    setAllDay(false);
    setLocation("");
    setRecurrence("None");
    setRecurrenceEnd(new Date());
    onClose();
  };

  const handleDateChange = (
    event: any,
    selected: Date | undefined,
    setter: (date: Date) => void,
    hidePicker: () => void
  ) => {
    hidePicker();
    if (event.type === "dismissed") return;
    if (selected) setter(selected);
  };

  return (
    
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1, justifyContent: "flex-end" }}
      >
        <View style={{ 
          backgroundColor: "white",
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          maxHeight: "90%",
          padding: 20,
        }}>
          <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
            <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 15 }}>
              {type === "task" ? "Add Task" : "Add Event"}
            </Text>

            <TextInput
              style={[styles.input, { marginBottom: 10 }]}
              placeholder="Title"
              value={title}
              onChangeText={setTitle}
            />
            <TextInput
              style={[styles.input, { marginBottom: 10 }]}
              placeholder="Description"
              value={description}
              onChangeText={setDescription}
            />

            {/* Task */}
            {type === "task" && (
              <>
                <TouchableOpacity onPress={() => setShowDuePicker(true)} style={{ marginBottom: 15 }}>
                  <Text>Due: {dueDate.toLocaleDateString()}</Text>
                </TouchableOpacity>
                {showDuePicker && (
                  <DateTimePicker
                    value={dueDate}
                    mode="date"
                    display="default"
                    onChange={(e, d) => handleDateChange(e, d, setDueDate, () => setShowDuePicker(false))}
                  />
                )}
              </>
            )}

            {/* Event */}
            {type === "event" && (
              <>
              <View style={{ display: "flex", flexDirection: "row", justifyContent: "space-between" }}>
                <Text>Start: </Text>
                <TouchableOpacity onPress={() => setShowStartDatePicker(true)} style={{ marginBottom: 5 }}>
                  <Text>{startDate.toLocaleDateString()}</Text>
                </TouchableOpacity>
                {showStartDatePicker && (
                  <DateTimePicker
                    value={startDate}
                    mode="date"
                    display="default"
                    onChange={(e, d) => handleDateChange(e, d, setStartDate, () => setShowStartDatePicker(false))}
                  />
                )}
                <TouchableOpacity onPress={() => setShowStartTimePicker(true)} style={{ marginBottom: 15 }}>
                  <Text>
                    {startTime.getHours().toString().padStart(2, "0")}:
                    {startTime.getMinutes().toString().padStart(2, "0")}
                  </Text>
                </TouchableOpacity>
                {showStartTimePicker && (
                  <DateTimePicker
                    value={startTime}
                    mode="time"
                    display="default"
                    onChange={(e, d) => handleDateChange(e, d, setStartTime, () => setShowStartTimePicker(false))}
                  />
                )}
              </View>
              <View style={{ display: "flex", flexDirection: "row", justifyContent: "space-between" }}>
                <Text>End: </Text>
                <TouchableOpacity onPress={() => setShowEndDatePicker(true)} style={{ marginBottom: 5 }}>
                  <Text>{endDate.toLocaleDateString()}</Text>
                </TouchableOpacity>
                {showEndDatePicker && (
                  <DateTimePicker
                    value={endDate}
                    mode="date"
                    display="default"
                    onChange={(e, d) => handleDateChange(e, d, setEndDate, () => setShowEndDatePicker(false))}
                  />
                )}
                <TouchableOpacity onPress={() => setShowEndTimePicker(true)} style={{ marginBottom: 15 }}>
                    <Text>
                    {endTime.getHours().toString().padStart(2, "0")}:
                    {endTime.getMinutes().toString().padStart(2, "0")}
                    </Text>
                </TouchableOpacity>
                {showEndTimePicker && (
                  <DateTimePicker
                    value={endTime}
                    mode="time"
                    display="default"
                    onChange={(e, d) => handleDateChange(e, d, setEndTime, () => setShowEndTimePicker(false))}
                  />
                )}
              </View>

                <TextInput
                  style={[styles.input, { marginBottom: 10 }]}
                  placeholder="Location"
                  value={location}
                  onChangeText={setLocation}
                />

                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
                  <Text style={{ marginRight: 10 }}>All Day:</Text>
                  <Switch value={allDay} onValueChange={setAllDay} />
                </View>

                <TouchableOpacity
                  onPress={() =>
                    Alert.alert(
                      "Recurrence",
                      "Select recurrence",
                      recurrenceOptions.map((opt) => ({ text: opt, onPress: () => setRecurrence(opt) }))
                    )
                  }
                  style={{ marginBottom: 10 }}
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
              </>
            )}

            <TouchableOpacity
              style={[styles.button, { marginTop: 20 }]}
              onPress={handleSave}
            >
              <Text style={styles.buttonText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.buttonCancel, { marginTop: 10 }]}
              onPress={onClose}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default AddItemModal;
