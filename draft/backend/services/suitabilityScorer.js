const haversine = require("haversine-distance");

function scoreHospital(hospital, referencePoint) {
    const dist = haversine(referencePoint, {
        latitude: hospital.lat,
        longitude: hospital.lon,
    });

    const distanceScore = 1 / (dist + 1);
    const ratingScore = hospital.rating ? hospital.rating / 5 : 0.5;
    const capacityScore = hospital.attributes.capacity
        ? hospital.attributes.capacity / 100
        : 0.5;

    return distanceScore * 0.5 + ratingScore * 0.3 + capacityScore * 0.2;
}

module.exports = { scoreHospital };
