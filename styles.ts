import { StyleSheet } from "react-native";

export const ambrasGreen = "#1F3B28";

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: 0,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: ambrasGreen,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: ambrasGreen,
    marginTop: 20,
    marginBottom: 10,
  },
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
  cardTitle: {
    fontWeight: "bold",
    fontSize: 16,
  },
  cardValue: {
    fontSize: 20,
    color: ambrasGreen,
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

  taskText: {
    fontSize: 16,
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
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: ambrasGreen,
    marginBottom: 15,
    textAlign: "center",
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
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },

  // styles.ts additions
  modalContainer: {
    flex: 1,
    padding: 10,
  },
  locationContainer: {
    flex: 1,
    padding: 0,
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
  photoContainer: {
    marginRight: 10,
    position: "relative",
  },
  photo: {
    width: 120,
    height: 80,
    borderRadius: 8,
  },
  removePhotoButton: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "red",
    padding: 2,
    borderRadius: 4,
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
  addPhotoButton: {
    backgroundColor: "#006400",
    padding: 10,
    borderRadius: 8,
    marginVertical: 10,
    alignItems: "center",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 20,
  },
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
  imageContainer: {
    position: "relative",
    flex: 1,
    margin: 5,
    aspectRatio: 1,
    borderRadius: 12,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
    borderRadius: 12,
  },
  deleteButton: {
    position: "absolute",
    top: 5,
    right: 5,
    backgroundColor: "#00000080",
    borderRadius: 12,
    paddingHorizontal: 6,
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

  fieldContainer: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  fieldLabel: {
     fontWeight: "600", 
     fontSize: 16
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

cancelButton: { flex: 1, marginRight: 5, padding: 12, borderRadius: 8, backgroundColor: "gray", alignItems: "center" },
  saveButton: { flex: 1, marginHorizontal: 5, padding: 12, borderRadius: 8, backgroundColor: "blue", alignItems: "center" },
  approveButton: { flex: 1, marginLeft: 5, padding: 12, borderRadius: 8, backgroundColor: "green", alignItems: "center" },

});


