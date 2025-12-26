// src/screens/SpotScreen.tsx
import React, { useEffect, useState, useMemo } from "react";
import { View, Text, TouchableOpacity, TextInput } from "react-native";
import Header from "../components/Header";
import { ambrasGreen, styles } from "../styles";
import SpotsList from "../components/spotsList";
import { fetchSpots } from "../api/spots";
import { addSpotData, formDataSpot, Photo, Spot } from "../types/types";
import { Ionicons } from "@expo/vector-icons";
import { useRoute } from "@react-navigation/native";

import {
  deletePhotosFromSupabase,
  finalizeApproval,
  saveSpot,
  uploadPhotosToSupabase,
  addSpot,
  insertPhotoRecords,
  uploadPhotosToR2,
  deletePhotosFromR2,
} from "../utils/spotHelperFunctions";
import uuid from "react-native-uuid";
import ApproveSpotModal from "../components/ApproveSpotModal";
import Toast from "react-native-toast-message";
import { simulateProgress } from "../utils/toastHelperFunctions";
import SpotModal from "../components/SpotModal";
import DeleteSpotModal from "../components/DeleteSpotModal";

const SpotScreen = () => {
  const [showSpotSuggestions, setShowSpotSuggestions] = useState(true);
  const [spots, setSpots] = useState<Spot[]>([]);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedSpot, setSelectedSpot] = useState<Spot | null>(null);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [approveModalVisible, setApproveModalVisible] = useState(false);
  const [showAddSpotModal, setShowAddSpotModal] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFecthing, setIsFecthing] = useState(false);
  const route = useRoute();


  const progressToastId = "uploadProgress";

  const handleCloseApproveModal = () => {
    setApproveModalVisible(false);
    setSelectedSpot(null);
  };

  // Opens the edit modal for a specific spot
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
    setApproveModalVisible(false);

    const toastId = "approveProgress";
    Toast.show({
      type: "progress",
      text1: "Starting approval...",
      props: { progress: 0 },
      autoHide: false,
      toastId,
    });

    try {
      const totalSteps = 5;
      let currentStep = 1;

      const updateProgress = (text: string) => {
        const progress = Math.min(currentStep / totalSteps, 1);
        Toast.show({
          type: "progress",
          text1: text,
          props: { progress },
          autoHide: false,
          toastId,
        });
      };

      // Step 1: Start visual loading (simulate initial work)
      updateProgress("Preparing data...");
      await simulateProgress(800, (p) => {
        Toast.show({
          type: "progress",
          text1: "Preparing data...",
          props: { progress: p * 0.2 },
          autoHide: false,
          toastId,
        });
      });
      currentStep++;

      // Step 2: Run finalizeApproval
      updateProgress("Finalizing approval...");
      await finalizeApproval(updatedSpot);
      currentStep++;

      // Step 3: Simulate syncing / server confirmation
      updateProgress("Syncing changes...");
      await simulateProgress(1000, (p) => {
        Toast.show({
          type: "progress",
          text1: "Syncing changes...",
          props: { progress: 0.4 + p * 0.3 },
          autoHide: false,
          toastId,
        });
      });
      currentStep++;

      // Step 4: Refresh data
      updateProgress("Refreshing data...");
      await fetchData();
      currentStep++;

      // Step 5: Finalizing visual completion
      updateProgress("Wrapping up...");
      await simulateProgress(600, (p) => {
        Toast.show({
          type: "progress",
          text1: "Wrapping up...",
          props: { progress: 0.8 + p * 0.2 },
          autoHide: false,
          toastId,
        });
      });

      Toast.hide();
      Toast.show({
        type: "success",
        text1: "Spot approved successfully",
      });

      setApproveModalVisible(false);
      setSelectedSpot(null);
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

  const handleDeleted = async () => {
    await fetchData();
    setDeleteModalVisible(false);
    setSelectedSpot(null);
  };

  const handleSave = async (updatedSpot: formDataSpot) => {
    if (!selectedSpot) return;
    setUploadingPhotos(true);
    
    Toast.show({
      type: "progress",
      text1: "Preparing upload...",
      props: { progress: 0 },
      autoHide: false,
      toastId: progressToastId,
    });

    try {
      // Separate old and new photos
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

      const photosToDelete = (selectedSpot.photos || []).filter(
        (p) => !oldPhotoEntries.some((op) => op.url === p.url)
      );
      if (photosToDelete.length > 0) {
        updateProgress("Deleting removed photos...");
        if (updatedSpot.status === "Approved") {
          await deletePhotosFromR2(photosToDelete);
        } else {
          await deletePhotosFromSupabase(photosToDelete);
        }
      }
      currentStep++;

      if (updatedSpot.status === "Approved" && newPhotoEntries.length > 0) {
        const folderID = oldPhotoEntries[0]?.spotId || selectedSpot.id;
        for (let i = 0; i < newPhotoEntries.length; i++) {
          updateProgress(`Uploading photo ${i + 1}/${newPhotoEntries.length}...`);
          const uploadedPhotos = await uploadPhotosToR2(
            { ...updatedSpot, photos: [newPhotoEntries[i]] },
            folderID.toString()
          );
          updatedPhotos = [...updatedPhotos, ...(uploadedPhotos ?? [])];
          currentStep++;
        }
      } else {
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

      }

      updateProgress("Saving spot data...");
      console.log("Final spot data to save:", { ...updatedSpot, photos: updatedPhotos });
      await saveSpot({ ...updatedSpot, photos: updatedPhotos } as Spot);
      currentStep++;

      updateProgress("Refreshing data...");
      await fetchData();
      currentStep++;

      Toast.hide();
      Toast.show({
        type: "success",
        text1: "Spot saved successfully",
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

  const handleAddSpot = async (newSpot: addSpotData) => {
    if (!newSpot) return;

    Toast.show({
      type: "progress",
      text1: "Preparing new spot...",
      props: { progress: 0 },
      autoHide: false,
      toastId: progressToastId,
    });

    try {
      const folderUUID = uuid.v4() as string;
      let uploadedPhotos: Photo[] = [];
      const totalSteps = 3 + newSpot.photos.length;
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

      for (let i = 0; i < newSpot.photos.length; i++) {
        updateProgress(`Uploading photo ${i + 1}/${newSpot.photos.length}...`);
        const photos = await uploadPhotosToSupabase(
          { ...newSpot, photos: [newSpot.photos[i]] },
          folderUUID
        );
        if (photos) uploadedPhotos.push(...photos);
        currentStep++;
      }

      updateProgress("Saving new spot...");
      const res = await addSpot({ ...newSpot, photos: uploadedPhotos } as Spot);
      currentStep++;

      if (uploadedPhotos.length > 0) {
        updateProgress("Finalizing photos...");
        const photoRecords = uploadedPhotos.map((p) => ({
          url: p.url,
          uuid: folderUUID,
          spotId: res.id,
        }));
        const { error: photoInsertError } = await insertPhotoRecords(photoRecords);
        if (photoInsertError) throw new Error("Failed to insert photo records");
      }

      updateProgress("Refreshing data...");
      await fetchData();
      currentStep++;

      Toast.hide();
      Toast.show({
        type: "success",
        text1: "Spot added successfully",
      });
    } catch (error) {
      console.error("Error adding new spot:", error);
      Toast.hide();
      Toast.show({
        type: "error",
        text1: "Failed to add spot",
        text2: (error as Error)?.message || "Unexpected error occurred",
      });
    }
  };

  const fetchData = async () => {
    try {
      setIsFecthing(true);
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
      setIsFecthing(false);

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
    if (route.params?.addSpotModal) {
      setShowAddSpotModal(true);
    }
  }, [route.params]);

  useEffect(() => {
    fetchData();
  }, [showSpotSuggestions]);

  const onRefresh = async () => await fetchData();

  // ✅ Memoized filtered list for search
  const filteredSpots = useMemo(() => {
    if (!searchQuery.trim()) return spots;
    const query = searchQuery.toLowerCase();
    return spots.filter(
      (s) =>
        s.name.toLowerCase().includes(query) ||
        s.city?.toLowerCase().includes(query) ||
        s.category?.toLowerCase().includes(query)
    );
  }, [spots, searchQuery]);

  return (
    <View style={{ flex: 1 }}>
      <Header title="Spots" style={{ justifyContent: "flex-start" }} />

      <View style={styles.screen}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <TouchableOpacity
            style={styles.title}
            onPress={() => setShowSpotSuggestions(!showSpotSuggestions)}
          >
            <Text style={styles.title}>
              {showSpotSuggestions ? "Suggestions" : "Approved"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              alignItems: "center",
              padding: 0,
              margin: 0,
              position: "relative",
            }}
            onPress={() => setShowAddSpotModal(true)}
          >
            <Ionicons name="add-circle" size={50} color={ambrasGreen} />
          </TouchableOpacity>
        </View>

        {/* ✅ Search bar */}
        <View style={{ marginVertical: 10 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "#f0f0f0",
              borderRadius: 8,
              paddingHorizontal: 10,
              height: 40,
            }}
          >
            <Ionicons
              name="search"
              size={20}
              color="#888"
              style={{ marginRight: 8 }}
            />
            <TextInput
              style={{ flex: 1, fontSize: 16 }}
              placeholder="Search spots..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              editable={!uploadingPhotos}
            />
          </View>
        </View>

        {/* ✅ Use filteredSpots instead of spots */}
        <SpotsList
          isVisible={!isFecthing}
          spots={filteredSpots}
          mode={showSpotSuggestions ? "suggestions" : "approvals"}
          onEdit={handleEdit}
          onDelete={(id) => {
            setSelectedSpot(spots.find((s) => s.id === id) || null);
            setDeleteModalVisible(true);
          }}
          onApprove={handleOpenApproveModal}
          onRefresh={onRefresh}
        />

        <SpotModal
          visible={editModalVisible}
          mode="edit"
          spot={selectedSpot}
          onClose={handleCloseEditModal}
          onSave={handleSave}
        />

        <SpotModal
          visible={showAddSpotModal}
          mode="add"
          onClose={() => setShowAddSpotModal(false)}
          onSave={handleAddSpot}
        />

        <ApproveSpotModal
          visible={approveModalVisible}
          spot={selectedSpot}
          onClose={handleCloseApproveModal}
          onApprove={handleApproved}
        />

        <DeleteSpotModal
          visible={deleteModalVisible}
          spot={selectedSpot}
          onClose={() => {
            setDeleteModalVisible(false);
            setSelectedSpot(null);
          }}
          onDeleted={handleDeleted}
        />
      </View>
    </View>
  );
};

export default SpotScreen;
