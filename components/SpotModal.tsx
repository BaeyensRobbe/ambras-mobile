import React, { useEffect, useState } from "react";
import { View, Text, Modal, TouchableOpacity, ScrollView } from "react-native";
import { Spot, addSpotData, Photo, formDataSpot, Category } from "../types/types";
import { styles, ambrasGreen } from "../styles";
import { PickerInputModal } from "./PickerInputModal";
import { TextInputModal } from "./TextInputModal";
import LocationPickerModal from "./LocationPickerModal";
import PhotoSelectorModal from "./PhotoSelector";
import { fetchCitiesOnly } from "../utils/spotHelperFunctions";
import NotesInputModal from "./notesInputModal";

// Define props
interface SpotModalProps {
  visible: boolean;
  mode: "edit" | "add"; // edit or add
  spot?: Spot | null;    // initial spot data for edit
  onClose: () => void;
  onSave: (data: formDataSpot | addSpotData) => void;
}

const SpotModal: React.FC<SpotModalProps> = ({ visible, mode, spot = null, onClose, onSave }) => {
  const initialData = mode === "edit"
    ? spot
    : {
      name: '',
      category: '',
      lat: 0,
      lng: 0,
      photos: [],
      notes: '',
      city: '',
      isPkPark: false,
      isCovered: false,
      hasFlipArea: false,
      hasSwings: false,
      isFavorite: false,
    };

  const [formData, setFormData] = useState<formDataSpot | addSpotData | null>(initialData);
  const [activeField, setActiveField] = useState<keyof Spot | null>(null);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [textInputVisible, setTextInputVisible] = useState(false);
  const [locationPickerVisible, setLocationPickerVisible] = useState(false);
  const [photoSelectorVisible, setPhotoSelectorVisible] = useState(false);
  const [cities, setCities] = useState<string[]>(["Leuven", "Brussels", "Antwerp", "Ghent", "Liège", "Louvain-la-Neuve", "Other"]);
  const [notesModalVisible, setNotesModalVisible] = useState(false); // new state for notes modal

  useEffect(() => {
    setFormData(initialData);
  }, [spot, visible]);

  useEffect(() => {
    const fetchCities = async () => {
      const fetchedCities = await fetchCitiesOnly();
      const uniqueCities = [...new Set(fetchedCities)];
      setCities([...uniqueCities, "Other"]);
    };
    fetchCities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!formData) return null;

  const fields = [
    { key: "name", label: "Name", type: "text" },
    { key: "city", label: "City", type: "picker" },
    { key: "category", label: "Category", type: "picker" },
    { key: "notes", label: "Notes", type: "text" },
    { key: "isPkPark", label: "Parkour park", type: "check" },
    { key: "isCovered", label: "Covered", type: "check" },
    { key: "hasFlipArea", label: "Flip area", type: "check" },
    { key: "hasSwings", label: "Swings", type: "check" },
    { key: "isFavorite", label: "Favorite", type: "favorite" },
    { key: "lat", label: "Location", type: "location" },
    { key: "photos", label: "Photos (URLs)", type: "photos" },
  ];

  const handleFieldPress = (field: keyof Spot, type: string) => {
    if (type === "check" || type === "favorite") {
      setFormData({ ...formData, [field]: !((formData as any)[field]) });
    } else if (type === "picker") {
      setActiveField(field);
      setPickerVisible(true);
    } else if (type === "location") {
      setActiveField(field);
      setLocationPickerVisible(true);
    } else if (type === "photos") {
      setPhotoSelectorVisible(true);
    } else if (field === "notes") {
      setActiveField(field);
      setNotesModalVisible(true); // new state
    } else {
      setActiveField(field);
      setTextInputVisible(true);
    }
  };

  const handlePickerSelect = (value: string) => {
    if (!activeField) return;

    if (activeField === "city" && value === "Other") {
      setPickerVisible(false);
      setTextInputVisible(true);
      setActiveField("city"); // stay in city mode
      return;
    }

    setFormData({ ...formData, [activeField]: value });
    setPickerVisible(false);
    setActiveField(null);
  };

  const handleTextInputSave = (value: string) => {
    if (!activeField) return;
    const updatedData = { ...formData, [activeField]: value };

    // If user added a new city, append it to the cities list
    if (activeField === "city" && value && !cities.includes(value)) {
      setCities(prev => [...prev.filter(c => c !== "Other"), value, "Other"]);
    }

    setFormData(updatedData);
    setTextInputVisible(false);
    setActiveField(null);
  };


  const handleSave = () => {
    if (!formData) return;
    onSave(formData);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.modalContainer}>
        <Text style={styles.modalTitle}>{mode === "edit" ? "Edit Spot" : "Add New Spot"}</Text>
        <ScrollView>
          {fields.map((field) => {
            const value = formData[field.key as keyof typeof formData];
            return (
              <TouchableOpacity
                key={field.key}
                onPress={() => handleFieldPress(field.key as keyof Spot, field.type)}
                style={styles.fieldContainer}
              >
                <Text style={styles.darkTitle}>{field.label}</Text>
                {field.type === "check" ? (
                  <View style={[styles.checkbox, { backgroundColor: value ? ambrasGreen : "#fff" }]} />
                ) : field.type === "favorite" ? (
                  <View style={[styles.checkbox, { backgroundColor: value ? "yellow" : "#fff" }]} />
                ) : field.type === "photos" ? (
                  <Text style={{ fontSize: 16, color: (value && value.length > 0) ? "#000" : "#aaa" }}>
                    {(value && value.length > 0) ? `${value.length} photo${value.length > 1 ? "s" : ""}` : `Edit ${field.label}`}
                  </Text>
                ) : (
                  <Text style={{ fontSize: 16, color: value ? "#000" : "#ff0000ff" }}>
                    {value || (mode === "edit" ? `Add ${field.label}` : `Add ${field.label}`)}
                  </Text>
                )}
              </TouchableOpacity>
            );
          })}

          <PickerInputModal
            visible={pickerVisible}
            options={
              activeField === "city"
                ? cities?.map(v => ({ label: v, value: v }))
                : activeField === "category"
                  ? Object.values(Category).map(cat => ({ label: cat, value: cat }))
                  : []
            }
            selectedValue={activeField && activeField in formData ? (formData[activeField as keyof typeof formData] as string) : ""}
            onClose={() => setPickerVisible(false)}
            onSelect={handlePickerSelect}
          />

          <TextInputModal
            visible={textInputVisible}
            fieldLabel={activeField || ""}
            value={activeField ? (formData[activeField] as string) : ""}
            onClose={() => setTextInputVisible(false)}
            onSave={handleTextInputSave}
          />

          <LocationPickerModal
            visible={locationPickerVisible}
            lat={formData.lat}
            lng={formData.lng}
            onClose={() => setLocationPickerVisible(false)}
            onSelect={(lat, lng) => setFormData({ ...formData, lat, lng })}
          />

          <PhotoSelectorModal
            visible={photoSelectorVisible}
            photos={formData.photos || []}
            onClose={() => setPhotoSelectorVisible(false)}
            onChange={(photos: (string | Photo)[]) => setFormData({ ...formData, photos })}
          />

          <NotesInputModal
            visible={notesModalVisible}
            value={formData.notes || ""}
            onClose={() => setNotesModalVisible(false)}
            onSave={(newNotes) => {
              setFormData({ ...formData, notes: newNotes });
              setNotesModalVisible(false);
            }}
          />


          <View style={styles.buttonRow}>
            <TouchableOpacity onPress={onClose} style={[styles.actionButton, { backgroundColor: "gray" }]}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSave} style={[styles.actionButton, { backgroundColor: ambrasGreen }]}>
              <Text style={styles.buttonText}>{mode === "edit" ? "Save" : "Add spot"}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

export default SpotModal;
