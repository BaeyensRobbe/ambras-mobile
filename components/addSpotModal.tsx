import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { Spot, Category, Photo, addSpotData } from '../types/types';
import { styles, ambrasGreen } from '../styles';
import { PickerInputModal } from './PickerInputModal';
import { TextInputModal } from './TextInputModal';
import LocationPickerModal from './LocationPickerModal';
import PhotoSelectorModal from './PhotoSelector';
import { fields } from '../constants/spots';

interface AddSpotModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (newSpot: addSpotData) => void;
}

const AddSpotModal: React.FC<AddSpotModalProps> = ({ visible, onClose, onSave }) => {
  const [formData, setFormData] = useState<addSpotData>({
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
  });

  const handleFieldPress = (field: keyof addSpotData, type: string) => {
    console.log(field, type)
  }

  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.modalContainer}>
        <Text style={styles.modalTitle}>Add New Spot</Text>
        <ScrollView>
          {fields.map((field) => {
            const value = formData[field.key as keyof addSpotData];
            return (
              <TouchableOpacity
                key={field.key}
                onPress={() => handleFieldPress(field.key, field.type)}
                style={styles.fieldContainer}>

                <Text style={styles.fieldLabel}>{field.label}</Text>
                {field.type === "check" ? (
                  <View
                    style={[styles.checkbox, { backgroundColor: value ? ambrasGreen : "white" }]}
                  />
                ) : field.type === "favorite" ? (
                  <View
                    style={[styles.checkbox, { backgroundColor: value ? "yellow" : "white" }]}
                  />
                ) : field.type === "photos" ? (
                  <Text style={{ fontSize: 16, color: (value && value.length > 0) ? "#000" : "#aaa" }}>
                    {(value && value.length > 0)
                      ? `${value.length} photo${value.length > 1 ? "s" : ""}`
                      : `Edit ${field.label}`}
                  </Text>
                ) : (
                  <Text style={{ fontSize: 16, color: value ? "#000" : "#ff0000ff" }}>
                    {value || `Add ${field.label}`}
                  </Text>
                )}
              </TouchableOpacity>
            )
          })}
          <View style={styles.buttonRow}>
            <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => onSave(formData)} style={styles.saveButton}>
              <Text style={styles.buttonText}>Add spot</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </Modal>
  )


}

export default AddSpotModal;