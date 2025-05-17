// SuitabilityModule.js
// Handles suitability score logic, heatmap transformation, and backend integration

/**
 * Calculate suitability scores based on criteria and weights.
 * @param {Array} locations - Array of {lat, lng, features}
 * @param {Object} weights - {footTraffic, competitorDensity, accessibility, demographics}
 * @returns {Array} Array of {lat, lng, value}
 */
export function calculateSuitability(locations, weights) {
  // Example: weighted sum (replace with real logic)
  return locations.map(loc => {
    const value =
      loc.features.footTraffic * (weights.footTraffic / 100) +
      (100 - loc.features.competitorDensity) * (weights.competitorDensity / 100) +
      loc.features.accessibility * (weights.accessibility / 100) +
      loc.features.demographics * (weights.demographics / 100);
    return { lat: loc.lat, lng: loc.lng, value };
  });
}

/**
 * Transform suitability data for heatmap rendering.
 * @param {Array} suitabilityData - Array of {lat, lng, value}
 * @returns {Array} Heatmap points
 */
export function toHeatmapPoints(suitabilityData) {
  // Example: [lat, lng, intensity]
  return suitabilityData.map(d => [d.lat, d.lng, d.value]);
}

// TODO: Add functions for fetching data from backend GIS/AI services 