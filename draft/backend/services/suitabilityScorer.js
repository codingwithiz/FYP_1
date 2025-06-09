const haversine = require("haversine-distance");

/**
 * Scores a place based on proximity to a reference point.
 * Closer places get higher scores. Score is scaled to 0–100.
 *
 * @param {Object} place - The place object with location info.
 * @param {Object} referencePoint - { latitude, longitude } of reference.
 * @returns {number} Scaled proximity score (0–100).
 */
function scorePlaceByDistance(place, referencePoint) {
    const distance = haversine(referencePoint, {
        latitude: place.location.y,
        longitude: place.location.x,
    });

    const maxDistanceMeters = 1000; // 1 km
    if (distance > maxDistanceMeters) return 0;

    // Invert and scale the distance to a 0–100 score
    const proximity = 1 - distance / maxDistanceMeters;
    console.log("Proximity: ", proximity); // e.g. 0.8 if 200m away
    const scaledScore = parseFloat((proximity * 100).toFixed(2)); // e.g. 80.00

    return scaledScore;
}

module.exports = { scorePlaceByDistance };