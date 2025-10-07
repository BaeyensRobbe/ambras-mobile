// EditSpotModal.tsx
import React, { useEffect, useState } from "react";
import { View, Text, Modal, TouchableOpacity, ScrollView } from "react-native";
import { Spot, Category, Photo, formDataSpot } from "../types/types";
import { styles, ambrasGreen } from "../styles";
import { PickerInputModal } from "./PickerInputModal";
import { TextInputModal } from "./TextInputModal";
import LocationPickerModal from "./LocationPickerModal";
import PhotoSelectorModal from "./PhotoSelector";

interface EditSpotModalProps {
  visible: boolean;
  spot: Spot | null;
  onClose: () => void;
  onSave: (updatedSpot: formDataSpot) => void;
  onApprove: (updatedSpot: Spot) => void;
}

const EditSpotModal: React.FC<EditSpotModalProps> = ({ visible, spot, onClose, onSave, onApprove }) => {
  const [formData, setFormData] = useState<formDataSpot | null>(spot);
  const [activeField, setActiveField] = useState<keyof Spot | null>(null);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [textInputVisible, setTextInputVisible] = useState(false);
  const [locationPickerVisible, setLocationPickerVisible] = useState(false);
  const [photoSelectorVisible, setPhotoSelectorVisible] = useState(false);

  useEffect(() => {
    setFormData(spot);
  }, [spot]);

  if (!formData) return null;

  const fields: { key: keyof Spot; label: string; type: "text" | "picker" | "check" | "favorite" | "location" | "photos" }[] = [
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
    if (type === "check") {
      setFormData({ ...formData, [field]: !formData[field] });
    } else if (type === "favorite") {
      setFormData({ ...formData, [field]: !formData[field] });
    } else if (type === "picker") {
      setActiveField(field);
      setPickerVisible(true);
    } else if (type === "location") {
      setActiveField(field);
      setLocationPickerVisible(true);
    } else if (type === "photos") {
      console.log(field)
      // setActiveField(field); // problem because its
      setPhotoSelectorVisible(true);
    } else {
      setActiveField(field);
      setTextInputVisible(true);
    }
  };

  const handlePickerSelect = (value: string) => {
    if (!formData || !activeField) return;
    setFormData({ ...formData, [activeField]: value });
    setPickerVisible(false);
    setActiveField(null);
  };

  const handleTextInputSave = (value: string) => {
    if (!formData || !activeField) return;
    setFormData({ ...formData, [activeField]: value });
    setTextInputVisible(false);
    setActiveField(null);
  };

  const handleSave = () => {
    if (!formData) return;
    console.log("Saving spot:", formData);
    onSave(formData);
    onClose();
  };

    const handleApprove = () => {
    if (!formData) return;
    console.log("Approving spot:", formData);
    onApprove(formData);
    onClose();
  }

  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.modalContainer}>
        <Text style={styles.modalHeader}>Edit Spot</Text>
        <ScrollView>
          {fields.map((field) => {
            const value = formData[field.key];
            return (
                <TouchableOpacity
                key={field.key}
                onPress={() => handleFieldPress(field.key, field.type)}
                style={styles.fieldContainer}>

                <Text style={styles.fieldLabel}>{field.label}</Text>
                {field.type === "check" ? (
                  <View
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 4,
                    borderWidth: 1,
                    borderColor: ambrasGreen,
                    backgroundColor: value ? ambrasGreen : "#fff",
                  }}
                  />
                ) : field.type === "favorite" ? (
                  <View
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 4,
                    borderWidth: 1,
                    borderColor: ambrasGreen,
                    backgroundColor: value ? "yellow" : "#fefefeff",
                  }}
                  />
                ) : field.type === "photos" ? (
                  <Text style={{ fontSize: 16, color: (value && value.length > 0) ? "#000" : "#aaa" }}>
                  {(value && value.length > 0)
                    ? `${value.length} photo${value.length > 1 ? "s" : ""}`
                    : `Edit ${field.label}`}
                  </Text>
                ) : (
                  <Text style={{ fontSize: 16, color: value ? "#000" : "#aaa" }}>
                  {value || `Edit ${field.label}`}
                  </Text>
                )}
                </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Picker Modal */}
        <PickerInputModal
          visible={pickerVisible}
          options={
            activeField === "city"
              ? [
                { label: "Antwerp", value: "Antwerp" },
                { label: "Brussels", value: "Brussels" },
                { label: "Ghent", value: "Ghent" },
                { label: "Leuven", value: "Leuven" },
                { label: "Louvain-la-Neuve", value: "Louvain-la-Neuve" },
                { label: "Liège", value: "Liège" },
                { label: "Other", value: "Other" },
              ]
              : activeField === "category"
                ? Object.values(Category).map((cat) => ({ label: cat, value: cat }))
                : []
          }
          selectedValue={activeField ? (formData[activeField] as string) : ""}
          onClose={() => setPickerVisible(false)}
          onSelect={handlePickerSelect}
        />

        {/* Text Input Modal */}
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
          onChange={(photos: (String | Photo)[]) => setFormData({ ...formData, photos })}
        />

        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.buttonText}>Save</Text>
          </TouchableOpacity>
          {/* <TouchableOpacity style={[styles.approveButton]} onPress={handleApprove}>
            <Text style={styles.buttonText}>Approve</Text>
          </TouchableOpacity> */}
        </View>
      </View>
    </Modal>
  );
};

export default EditSpotModal;
