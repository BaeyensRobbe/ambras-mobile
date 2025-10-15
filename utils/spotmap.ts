export const getMarkerColor = (category: string): string => {
  switch (category.toLowerCase()) {
    case "poleslide":
      return "orange";
    case "roofgap":
      return "green";
    case "challenge":
      return "red";
    case "descent":
      return "blue";
    case "nbd":
      return "purple";
    case "gym":
      return "brown";
    default:
      return "gray";
  }
};
