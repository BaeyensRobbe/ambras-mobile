import { StyleSheet } from "react-native";

export const ambrasGreen = "#1F3B28";

export const styles = StyleSheet.create({
  // ────────────────────────────────
  // SCREENS
  // ────────────────────────────────
  screen: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: 0,
  },
  modalContainer: { flex: 1, padding: 10, paddingTop: 30 },

  // ────────────────────────────────
  // TEXT
  // ────────────────────────────────
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: ambrasGreen,
  },
  subtitle: {
    fontSize: 20,
    marginTop: 20,
    marginBottom: 10,
  },
  darkTitle: { fontWeight: "bold", fontSize: 16 },
  taskDue: { fontSize: 14, color: "gray" },
  statLabel: { fontSize: 13, color: "#555", marginTop: 4 },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: ambrasGreen,
    marginBottom: 15,
    textAlign: "center",
  },
  label: { fontSize: 14, marginTop: 10 },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  // ────────────────────────────────
  // CONTAINERS
  // ────────────────────────────────
  fieldContainer: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    marginTop: 10,
  },
  photoContainer: { marginRight: 10, position: "relative" },
  imageContainer: {
    position: "relative",
    flex: 1,
    margin: 5,
    aspectRatio: 1,
    borderRadius: 12,
    overflow: "hidden",
  },
  flexRow: { flexDirection: "row", justifyContent: "space-between" },

  // ────────────────────────────────
  // CARDS
  // ────────────────────────────────
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
  taskCard: {
    backgroundColor: "#c6f6d5",
    marginRight: 10,
    marginTop: 17,
    borderRadius: 5,
    padding: 10,
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
    borderColor: ambrasGreen,
  },
  
  // ────────────────────────────────
  // MODALS
  // ────────────────────────────────
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
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 10,
  },
  modal: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    maxHeight: "90%",
  },

  // ────────────────────────────────
  // INPUTS & LISTS
  // ────────────────────────────────
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    fontSize: 16,
    minWidth: "100%",
  },
  searchContainer: {
    width: "100%",
    backgroundColor: "white",
    borderRadius: 8,
  },
  searchInput: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    fontSize: 16,
  },
  suggestionsList: { maxHeight: 150 },
  suggestionItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },

  // ────────────────────────────────
  // BUTTONS
  // ────────────────────────────────
  button: {
    backgroundColor: ambrasGreen,
    padding: 12,
    borderRadius: 5,
    marginTop: 10,
    alignItems: "center",
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 5,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  deleteButton: {
    position: "absolute",
    top: 5,
    right: 5,
    backgroundColor: "#00000080",
    borderRadius: 12,
    paddingHorizontal: 6,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 20,
  },

  // ────────────────────────────────
  // MAP
  // ────────────────────────────────
  map: {
    width: "100%",
    height: "70%",
    marginTop: 10,
  },
  mapTypeToggle: {
    position: "absolute",
    top: 100,
    right: 20,
    backgroundColor: "rgba(28, 53, 45, 0.9)",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  // ────────────────────────────────
  // PHOTOS
  // ────────────────────────────────
  // photoIndex: {
  //   position: "absolute",
  //   bottom: 4,
  //   left: 4,
  //   color: "white",
  //   fontWeight: "bold",
  //   backgroundColor: "rgba(0,0,0,0.5)",
  //   paddingHorizontal: 4,
  //   borderRadius: 4,
  // },
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

  // ────────────────────────────────
  // MISC
  // ────────────────────────────────
  icon: { width: 50, height: 50, marginBottom: 20 },

  // EXTRA'S
    pickerContainer: {
    width: "85%",
    maxHeight: "70%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
  },
  optionButton: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  selectedOption: {
    color: "#006400",
    fontWeight: "700",
  },
});
