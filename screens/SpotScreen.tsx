// src/screens/SpotScreen.tsx
import React, { useEffect, useState, useMemo } from "react";
import { View, Text, TouchableOpacity, TextInput, ActivityIndicator } from "react-native";
import Header from "../components/Header";
import { ambrasGreen, styles } from "../styles";
import SpotsList from "../components/spotsList";
import { addSpotData, formDataSpot, Photo, Spot } from "../types/types";
import { Ionicons } from "@expo/vector-icons";
import { useRoute } from "@react-navigation/native";

// refactor
import { useSpots } from "../hooks/useSpots";
import { addNewSpot, approveSpot, saveSpotChanges } from "../services/spotService";
import ApproveSpotModal from "../components/ApproveSpotModal";
import Toast from "react-native-toast-message";
import SpotModal from "../components/SpotModal";
import DeleteSpotModal from "../components/DeleteSpotModal";

const SpotScreen = () => {
  const [showSpotSuggestions, setShowSpotSuggestions] = useState(true);

  // fetch data hook
  const { spots, isFetching, fetchData } = useSpots(showSpotSuggestions);

  // loading states
  const [uploadingPhotos, setUploadingPhotos] = useState<{ active: boolean; spotName?: string }>({
    active: false,
    spotName: undefined,
  });
  const [loadingApproval, setLoadingApproval] = useState(false); 

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedSpot, setSelectedSpot] = useState<Spot | null>(null);
  const [approveModalVisible, setApproveModalVisible] = useState(false);
  const [showAddSpotModal, setShowAddSpotModal] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const route = useRoute();


  const progressToastId = "uploadProgress";

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
    if (!updatedSpot) return;

    setLoadingApproval(true);
    setApproveModalVisible(false);

    try {
      await approveSpot(updatedSpot, fetchData);

      Toast.show({
        type: "success",
        text1: "Spot approved successfully",
      });

      setSelectedSpot(null);
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Approval failed",
        text2: (error as Error)?.message || "Something went wrong",
      });
    } finally {
      setLoadingApproval(false);
    }
  };

  const handleDeleted = async () => {
    await fetchData();
    setDeleteModalVisible(false);
    setSelectedSpot(null);
  };

  const handleSave = async (updatedSpot: formDataSpot) => {
    if (!selectedSpot) return;

    setUploadingPhotos({ active: true, spotName: updatedSpot.name });

    try {
      await saveSpotChanges(selectedSpot, updatedSpot, fetchData);

      Toast.show({
        type: "success",
        text1: "Spot saved successfully",
      });

      setEditModalVisible(false);
      setSelectedSpot(null);
    } catch (error) {
      console.error("Save failed:", error);
      Toast.show({
        type: "error",
        text1: "Failed to save spot",
        text2: (error as Error)?.message ?? "Unexpected error",
      });
    } finally {
      setUploadingPhotos({ active: false });
    }
  };

  const handleAddSpot = async (newSpot: addSpotData) => {
    if (!newSpot) return;

    try {
      setUploadingPhotos({ active: true, spotName: newSpot.name });

      const result = await addNewSpot(newSpot, fetchData);
      if (!result) {
        console.error("Adding spot failed");
      }
    } finally {
      setUploadingPhotos({ active: false });
      setShowAddSpotModal(false);
    }
  };

  //  useEffect(() => {
  //   if (route.params?.addSpotModal) {
  //     setShowAddSpotModal(true);
  //   }
  // }, [route.params]);

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

      {/* Loading indicator */}
      {isFetching && (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            paddingVertical: 8,
          }}
        >
          <ActivityIndicator size="small" color={ambrasGreen} />
          <Text style={{ marginLeft: 8, fontSize: 14, color: "#555" }}>
            {showSpotSuggestions ? "Loading suggestions..." : "Loading approved spots..."}
          </Text>
        </View>
      )}

      {loadingApproval && (
        <View style={{ padding: 10, alignItems: "center" }}>
          <ActivityIndicator size="small" color={ambrasGreen} />
          <Text style={{ fontSize: 16, color: ambrasGreen }}>Approving spot...</Text>
        </View>
      )}


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

        {uploadingPhotos.active && (
          <View style={{ padding: 10, alignItems: "center" }}>
            <Text style={{ fontSize: 16, color: ambrasGreen }}>
              Uploading {uploadingPhotos.spotName}...
            </Text>
          </View>
        )}


        {/* ✅ Use filteredSpots instead of spots */}
        <SpotsList
          isVisible={!isFetching}
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
