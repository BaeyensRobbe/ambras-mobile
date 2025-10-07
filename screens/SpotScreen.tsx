// src/screens/SpotScreen.tsx
import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import AppHeader from "../components/AppHeader";
import { ambrasGreen, styles } from "../styles";
import SpotsList from "../components/spotsList";
import { fetchSpots } from "../api/spots";
import { formDataSpot, Photo, Spot } from "../types/types";
import EditSpotModal from "../components/EditSpotModal";
import { Ionicons } from '@expo/vector-icons';
import {
  deletePhotosFromSupabase,
  finalizeApproval,
  saveSpot,
  uploadPhotosToSupabase,
} from "../utils/spotHelperFunctions";
import uuid from "react-native-uuid";
import ApproveSpotModal from "../components/ApproveSpotModal";
import Toast from "react-native-toast-message";
import { simulateProgress } from "../utils/toastHelperFunctions";
import AddSpotModal from "../components/addSpotModal";

const SpotScreen = () => {
  const [showSpotSuggestions, setShowSpotSuggestions] = useState(true);
  const [spots, setSpots] = useState<Spot[]>([]);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedSpot, setSelectedSpot] = useState<Spot | null>(null);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [approveModalVisible, setApproveModalVisible] = useState(false);
  const [showAddSpotModal, setShowAddSpotModal] = useState(false);

  const progressToastId = "uploadProgress"; // persistent toast ID

  const handleCloseApproveModal = () => {
    setApproveModalVisible(false);
    setSelectedSpot(null);
  };

  const handleEdit = (id: number) => {
    const spotToEdit = spots.find((s) => s.id === id) || null;
    setSelectedSpot(spotToEdit);
    setEditModalVisible(true);
  };

  const handleCloseEditModal = () => {
    setEditModalVisible(false);
    setSelectedSpot(null);
  };

  const handleOpenApproveModal = (id: number) => {
    const spotToApprove = spots.find((s) => s.id === id) || null;
    setSelectedSpot(spotToApprove);
    setApproveModalVisible(true);
  };

  const handleApproved = async (updatedSpot: Spot) => {
    if (!updatedSpot || updatedSpot.photos.length === 0) return;

    Toast.show({
      type: "progress",
      text1: "Finalizing approval...",
      props: { progress: 0.2 },
      autoHide: false,
      toastId: progressToastId,
    });

    try {
      await finalizeApproval(updatedSpot);

      Toast.hide();
      Toast.show({
        type: "success",
        text1: "Spot approved successfully",
      });

      setApproveModalVisible(false);
      setSelectedSpot(null);
      fetchData();
    } catch (error) {
      console.error("Error approving spot:", error);
      Toast.hide();
      Toast.show({
        type: "error",
        text1: "Approval failed",
        text2: (error as Error)?.message || "Something went wrong",
      });
    }
  };

  const handleSave = async (updatedSpot: formDataSpot) => {
    if (!selectedSpot) return;

    setUploadingPhotos(true);

    // Show persistent progress toast
    Toast.show({
      type: "progress",
      text1: "Preparing upload...",
      props: { progress: 0 },
      autoHide: false,
      toastId: progressToastId,
    });

    try {
      // 1️⃣ Separate old and new photos
      const oldPhotoEntries = updatedSpot.photos.filter(
        (p) => typeof p !== "string"
      ) as Spot["photos"];
      const newPhotoEntries = updatedSpot.photos.filter(
        (p) => typeof p === "string"
      ) as string[];

      let updatedPhotos: Photo[] = [...oldPhotoEntries];

      const totalSteps = 5 + newPhotoEntries.length;
      let currentStep = 1;

      const updateProgress = (text: string) => {
        const progress = currentStep / totalSteps;
        Toast.show({
          type: "progress",
          text1: text,
          props: { progress },
          autoHide: false,
          toastId: progressToastId,
        });
      };

      // Step 2: Delete removed photos
      const photosToDelete = (selectedSpot.photos || []).filter(
        (p) => !oldPhotoEntries.some((op) => op.url === p.url)
      );
      if (photosToDelete.length > 0) {
        updateProgress("Deleting removed photos...");
        await deletePhotosFromSupabase(photosToDelete);
      }
      currentStep++;

      // Step 3: Upload new photos (each photo is a separate step)
      const folderUUID = oldPhotoEntries[0]?.uuid || (uuid.v4() as string);
      for (let i = 0; i < newPhotoEntries.length; i++) {
        updateProgress(`Uploading photo ${i + 1}/${newPhotoEntries.length}...`);
        const uploadedPhotos = await uploadPhotosToSupabase(
          { ...updatedSpot, photos: [newPhotoEntries[i]] },
          folderUUID
        );
        updatedPhotos = [...updatedPhotos, ...(uploadedPhotos ?? [])];
        currentStep++;
      }

      // Step 4: Save spot data
      updateProgress("Saving spot data...");
      await saveSpot({ ...updatedSpot, photos: updatedPhotos } as Spot);
      currentStep++;

      // Step 5: Refresh spots
      updateProgress("Refreshing data...");
      await fetchData();
      currentStep++;

      // Done
      Toast.hide();
      Toast.show({
        type: "success",
        text1: "Spot saved successfully",
        text2: "All photos uploaded and data updated",
      });

      setEditModalVisible(false);
      setSelectedSpot(null);
    } catch (error) {
      console.error("Error saving spot:", error);
      Toast.hide();
      Toast.show({
        type: "error",
        text1: "Failed to save spot",
        text2: (error as Error)?.message || "Unexpected error occurred",
      });
    } finally {
      setUploadingPhotos(false);
    }
  };

  const fetchData = async () => {
    try {
      Toast.show({
        type: "progress",
        text1: "Loading spots...",
        props: { progress: 0 },
        autoHide: false,
        toastId: "fetchProgress",
      });

      const progressPromise = simulateProgress(1500, (p) => {
        Toast.show({
          type: "progress",
          text1: "Loading spots...",
          props: { progress: p },
          autoHide: false,
          toastId: "fetchProgress",
        });
      });

      const data = showSpotSuggestions
        ? await fetchSpots("suggestions")
        : await fetchSpots("approved");

      await progressPromise;

      setSpots(data);

      Toast.hide();
      Toast.show({
        type: "success",
        text1: "Spots loaded successfully",
      });
    } catch (error) {
      console.error("Error fetching spots:", error);

      Toast.hide();
      Toast.show({
        type: "error",
        text1: "Failed to load spots",
        text2: (error as Error)?.message || "Check connection or API",
      });
    }
  };

  useEffect(() => {
    fetchData();
  }, [showSpotSuggestions]);

  const onRefresh = async () => {
    await fetchData();
  };

  return (
    <View style={{ flex: 1 }}>
      <AppHeader title="Spots" style={{ justifyContent: "flex-start" }} />

      <View style={styles.screen}>
        <View
        style={{ flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",}}>

        <TouchableOpacity
          style={styles.title}
          onPress={() => setShowSpotSuggestions(!showSpotSuggestions)}
        >
          <Text style={styles.title}>
            {showSpotSuggestions ? "Spot suggestions" : "Approved spots"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{ alignItems: "center", padding: 0, margin: 0, position: "relative", bottom: -5 }}
          onPress={() => {
            setShowAddSpotModal(true);
          }}>
          <Ionicons name="add-circle" size={50} color={ambrasGreen}  />
        </TouchableOpacity>
        </View>

        <SpotsList
          spots={spots}
          onEdit={handleEdit}
          onApprove={handleOpenApproveModal}
          onRefresh={onRefresh}
        />

        <EditSpotModal
          visible={editModalVisible}
          spot={selectedSpot}
          onClose={handleCloseEditModal}
          onSave={handleSave}
          onApprove={handleApproved}
        />

        <ApproveSpotModal
          visible={approveModalVisible}
          spot={selectedSpot}
          onClose={handleCloseApproveModal}
          onApprove={handleApproved}
        />

        <AddSpotModal
          visible={showAddSpotModal}
          onClose={() => setShowAddSpotModal(false)}
          onSave={async (newSpot) => {
            setShowAddSpotModal(false);
            await fetchData();
          }}/>

      </View>
    </View>
  );
};

export default SpotScreen;
