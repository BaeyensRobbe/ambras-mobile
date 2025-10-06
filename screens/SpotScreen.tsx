import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import AppHeader from "../components/AppHeader";
import { styles } from "../styles";
import SpotsList from "../components/spotsList";
import { fetchSpotSuggestions, fetchApprovedSpots } from "../api/spots"; // your helper
import { formDataSpot, Photo, Spot } from "../types/types";
import EditSpotModal from "../components/EditSpotModal";
import { deleteFolderFromSupabase, deletePhotosFromSupabase, finalizeApproval, saveSpot, uploadPhotosToSupabase } from "../utils/spotHelperFunctions";
import { v4 as uuidv4 } from "uuid";
import ApproveSpotModal from "../components/ApproveSpotModal";
// import SpotEditApprovalModal from "../components/spotEditModal";

const SpotScreen = () => {
  const [showSpotSuggestions, setShowSpotSuggestions] = useState(true);
  const [spots, setSpots] = useState([]);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedSpot, setSelectedSpot] = useState<Spot | null>(null);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [approveModalVisible, setApproveModalVisible] = useState(false);

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
    await finalizeApproval(updatedSpot);
    setApproveModalVisible(false);
    setSelectedSpot(null);
    fetchData();
  };

  const handleSave = async (updatedSpot: formDataSpot) => {
    if (!selectedSpot) return;

    setUploadingPhotos(true);

    try {
      // Separate old (existing) and new (local file URI) photos
      const oldPhotoEntries = updatedSpot.photos.filter(p => typeof p !== 'string') as Spot['photos'];
      const newPhotoEntries = updatedSpot.photos.filter(p => typeof p === 'string') as string[];

      let updatedPhotos: Photo[] = [...oldPhotoEntries];

      // 1️⃣ Delete removed photos from Supabase
      const photosToDelete = (selectedSpot.photos || []).filter(
        p => !oldPhotoEntries.some(op => op.url === p.url)
      );
      if (photosToDelete.length > 0) {
        console.log("Deleting removed photos:", photosToDelete);
        await deletePhotosFromSupabase(photosToDelete);
      }

      const folderUUID = oldPhotoEntries[0]?.uuid || uuidv4();
      if (newPhotoEntries.length > 0) {
        console.log("Uploading new photos:", newPhotoEntries);
        const uploadedPhotos = await uploadPhotosToSupabase(
          { ...updatedSpot, photos: newPhotoEntries },
          folderUUID
        );
        console.log("Uploaded photos:", uploadedPhotos);
        updatedPhotos = [...updatedPhotos, ...(uploadedPhotos ?? [])];
      }

      // 3️⃣ Save the spot with updated photo list
      await saveSpot({ ...updatedSpot, photos: updatedPhotos } as Spot);

      // 4️⃣ Refresh data & close modal
      fetchData();
      setEditModalVisible(false);
      setSelectedSpot(null);

      console.log("✅ Spot saved with updated photos:", updatedPhotos);
      return updatedPhotos;
    } catch (error) {
      console.error("❌ Error saving spot:", error);
    } finally {
      setUploadingPhotos(false);
    }
  };

  const fetchData = async () => {
    const data = showSpotSuggestions
      ? await fetchSpotSuggestions()
      : await fetchApprovedSpots();
    console.log(data);
    setSpots(data);
  };

  useEffect(() => {
    fetchData();
  }, [showSpotSuggestions]);


  return (
    <View style={{ flex: 1 }}>
      <AppHeader title="Spots" style={{ justifyContent: "flex-start" }} />

      <View style={styles.screen}>
        <TouchableOpacity style={styles.title} onPress={() => setShowSpotSuggestions(!showSpotSuggestions)}>
          <Text style={styles.title}>
            {showSpotSuggestions ? "Spot suggestions" : "Approved spots"}
          </Text>
        </TouchableOpacity>

        <SpotsList spots={spots} onEdit={handleEdit} onApprove={handleOpenApproveModal} />
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
      </View>
    </View>
  );
};

export default SpotScreen;
