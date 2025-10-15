const icons = {
  gym: require('../assets/markers/yellow-dot.png'),
  spots: require('../assets/markers/blue-dot.png'),
  non_spot: require('../assets/markers/green-dot.png'),
  specifics: require('../assets/markers/red-dot.png'),
  default: require('../assets/markers/orange-dot.png'),
}

export const getIconByCategory = (category: string | undefined) => {
  switch ((category || '').toLowerCase()) {
    case 'gym':
      return icons.gym;
    case 'spots':
      return icons.spots;
    case 'non_spot':
      return icons.non_spot;
    case 'poleslide':
    case 'roofgap':
    case 'challenge':
    case 'nbd':
    case 'descent':
      return icons.specifics;
    default:
      return icons.default;
  }
};