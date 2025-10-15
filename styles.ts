import { StyleSheet } from "react-native";

export const ambrasGreen = "#1F3B28";

export const styles = StyleSheet.create({
  // SCREENS
  screen: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: 0,
  },

  // TEXT
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: ambrasGreen,
    marginBottom: 0,
    marginTop: 0,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: ambrasGreen,
    marginTop: 20,
    marginBottom: 10,
  },
  cardTitle: {
    fontWeight: "bold",
    fontSize: 16,
  },
  cardValue: {
    fontSize: 20,
    color: ambrasGreen,
  },
  taskText: {
    fontSize: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: ambrasGreen,
    marginBottom: 15,
    textAlign: "center",
  },
    statLabel: {
    fontSize: 13,
    color: "#555",
    marginTop: 4,
  },
    buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  deleteButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  emptyText: {
    textAlign: "center",
    color: "#888",
    marginTop: 20,
  },
    modalHeader: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#006400",
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 10,
    marginBottom: 5,
    color: "#006400",
  },
  fieldLabel: {
    fontWeight: "600",
    fontSize: 16
  },

  // CARDS
  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    width: "100%",
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  taskCard: {
    backgroundColor: "#c6f6d5",
    marginRight: 10,
    marginTop: 17,
    borderRadius: 5,
    padding: 10,
  },
  eventCard: {
    backgroundColor: "#f0fff4",
    marginRight: 10,
    marginTop: 17,
    borderRadius: 5,
    padding: 10,
  },



  taskDue: {
    fontSize: 14,
    color: "gray",
  },
  tabBar: {
    height: 60,
    paddingBottom: 5,
  },

  // Modal-specific styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },

  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    fontSize: 16,
    minWidth: "100%",
  },

  columnPicker: {
    height: 40,
    borderWidth: 1,
    borderColor: ambrasGreen,
    borderRadius: 5,
    backgroundColor: "white", // ensures visibility
  },

  pickerItem: {
    fontSize: 14,
    color: ambrasGreen,
  },

  list: {
    borderBottomWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
  },

  button: {
    backgroundColor: ambrasGreen,
    padding: 12,
    borderRadius: 5,
    marginTop: 10,
    alignItems: "center",
  },
  buttonCancel: {
    backgroundColor: "#ccc",
  },

  // CONTAINERS
  modalContainer: {
    flex: 1,
    padding: 10,
    paddingTop: 30,
  },
  locationContainer: {
    flex: 1,
    padding: 0,
  },
  photoContainer: {
    marginRight: 10,
    position: "relative",
  },
    fieldContainer: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  imageContainer: {
    position: "relative",
    flex: 1,
    margin: 5,
    aspectRatio: 1,
    borderRadius: 12,
    overflow: "hidden",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    marginTop: 10,
  },

  // PHOTOS
  photo: {
    width: 120,
    height: 80,
    borderRadius: 8,
  },
  photoIndex: {
    position: "absolute",
    bottom: 4,
    left: 4,
    color: "white",
    fontWeight: "bold",
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 4,
    borderRadius: 4,
  },



  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 20,
  },
  statCard: {
    flex: 1,
    aspectRatio: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
    borderWidth: 1,
    borderColor: ambrasGreen, // subtle Ambras green border tint
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700",
    color: ambrasGreen,
  },

  pickerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f3f3f3",
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginVertical: 6,
  },

  pickerText: {
    fontSize: 16,
    color: "#333",
  },

  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", padding: 10 },
  modal: { backgroundColor: "white", borderRadius: 12, padding: 20, maxHeight: "90%" },
  heading: { fontSize: 18, fontWeight: "bold", marginBottom: 15 },
  label: { fontSize: 14, marginTop: 10 },


  flexRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  searchContainer: {
    width: "100%",
    backgroundColor: "white",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    padding: 0,
    marginTop: 0,
  },
  searchInput: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    fontSize: 16,
  },
  suggestionsList: {
    maxHeight: 150,
  },
  suggestionItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },

  map: {
    width: "100%",
    height: "70%",
    marginTop: 10, // space for search bar
  },

  mapTypeToggle: {
    position: "absolute",
    top: 100,
    right: 20,
    backgroundColor: "rgba(28, 53, 45, 0.9)", // Ambras dark green with opacity
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },

  mapTypeToggleText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },


  // PhotoSelector styles
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
    borderRadius: 12,
  },


  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: ambrasGreen,
    alignItems: "center",
    justifyContent: "center",
  },

  // BUTTONS
  cancelButton: { flex: 1, marginRight: 5, padding: 12, borderRadius: 8, backgroundColor: "gray", alignItems: "center" },
  saveButton: { flex: 1, marginHorizontal: 5, padding: 12, borderRadius: 8, backgroundColor: "blue", alignItems: "center" },
  approveButton: { flex: 1, marginLeft: 5, padding: 12, borderRadius: 8, backgroundColor: "green", alignItems: "center" },
  deleteButton: { position: "absolute", top: 5, right: 5, backgroundColor: "#00000080",borderRadius: 12, paddingHorizontal: 6},
  removePhotoButton: { position: "absolute", top: 4, right: 4, backgroundColor: "red", padding: 2, borderRadius: 4 },
  addPhotoButton: { backgroundColor: "#006400", padding: 10, borderRadius: 8, marginVertical: 10, alignItems: "center" },

  icon: { width: 50, height: 50, marginBottom: 20 },
});


