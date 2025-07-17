// Haversine formula to calculate distance between two points
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km
  return distance;
};

const deg2rad = (deg) => {
  return deg * (Math.PI / 180);
};

// Calculate fare based on distance
const calculateFare = (distance, baseRate = 50, perKmRate = 15, timeMultiplier = 1) => {
  const baseFare = baseRate;
  const distanceFare = distance * perKmRate;
  const totalFare = (baseFare + distanceFare) * timeMultiplier;
  return Math.round(totalFare);
};

// Split fare based on distance for each passenger
const splitFareByDistance = (passengers) => {
  // Calculate total distance for all passengers
  const totalDistance = passengers.reduce((sum, passenger) => {
    return sum + passenger.distance;
  }, 0);

  // Calculate fare share for each passenger
  return passengers.map(passenger => {
    const distanceRatio = passenger.distance / totalDistance;
    const fareShare = Math.round(passenger.totalFare * distanceRatio);
    return {
      ...passenger,
      fareShare
    };
  });
};

export { calculateDistance, calculateFare, splitFareByDistance };
