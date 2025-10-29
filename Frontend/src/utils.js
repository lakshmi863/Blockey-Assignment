// This Haversine formula is more accurate than the simplified one
function calculateDistanceKm(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

export function calculateSpeedKmH(currentIndex, routeData) {
    if (currentIndex === 0 || routeData.length <= 1) return '0.00';

    const currPoint = routeData[currentIndex];
    const prevPoint = routeData[currentIndex - 1];

    if (!prevPoint || !currPoint) return '0.00';

    const distanceKm = calculateDistanceKm(
        prevPoint.lat, prevPoint.lng,
        currPoint.lat, currPoint.lng
    );

    const timeDeltaMs = new Date(currPoint.timestamp).getTime() - new Date(prevPoint.timestamp).getTime();
    if (timeDeltaMs === 0) return 'N/A';
    
    const timeDeltaHours = timeDeltaMs / (1000 * 60 * 60);
    const speed = distanceKm / timeDeltaHours;
    return speed.toFixed(2);
}