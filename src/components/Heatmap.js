import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, LayersControl, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { renderToStaticMarkup } from 'react-dom/server';
// TODO: Import heatmap and overlay plugins as needed

// Default icon fix for Leaflet in React
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
const DefaultIcon = L.icon({ iconUrl, shadowUrl: iconShadow });
L.Marker.prototype.options.icon = DefaultIcon;

/**
 * Heatmap component for visualizing location suitability scores.
 * Props:
 * - heatmapData: Array of {lat, lng, value}
 * - layers: Array of {name, component}
 * - onMapClick: function
 * - competitors: Array of {lat, lng, name, distance}
 * - selectedBusinessType: string
 * - ...other props
 */
const blueMarker = (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
    <circle cx="20" cy="20" r="18" stroke="#2563eb" strokeWidth="4" fill="#e0e7ff"/>
    <circle cx="20" cy="20" r="8" fill="#2563eb"/>
    <rect x="18" y="28" width="4" height="8" rx="2" fill="#2563eb"/>
  </svg>
);
const greenMarker = (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
    <circle cx="20" cy="20" r="18" stroke="#16a34a" strokeWidth="4" fill="#bbf7d0"/>
    <circle cx="20" cy="20" r="8" fill="#16a34a"/>
    <rect x="18" y="28" width="4" height="8" rx="2" fill="#16a34a"/>
  </svg>
);
const Heatmap = ({ heatmapData, layers, onMapClick, competitors, selectedBusinessType, userLocation }) => {
  // Center map on user location if available, else default
  const center = userLocation ? [userLocation.lat, userLocation.lng] : [3.107, 101.606];

  return (
    <MapContainer center={center} zoom={13} className="h-full w-full rounded-lg shadow-lg" aria-label="Suitability Heatmap">
      <LayersControl position="topright">
        <LayersControl.BaseLayer checked name="OpenStreetMap">
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
        </LayersControl.BaseLayer>
        {/* TODO: Add demographic, road, and custom layers from Spatial Data Processing Module */}
        {layers && layers.map((layer, idx) => (
          <LayersControl.Overlay key={idx} name={layer.name} checked={layer.checked}>
            {layer.component}
          </LayersControl.Overlay>
        ))}
      </LayersControl>
      {/* User Location Pin */}
      {userLocation && (
        <Marker position={[userLocation.lat, userLocation.lng]} icon={L.divIcon({ html: renderToStaticMarkup(greenMarker), className: '', iconSize: [40, 40] })}>
          <Popup>Your Current Location</Popup>
        </Marker>
      )}
      {/* Competitor Markers */}
      {competitors.map((comp, idx) => (
        <Marker key={idx} position={[comp.lat, comp.lng]} icon={L.divIcon({ html: renderToStaticMarkup(blueMarker), className: '', iconSize: [40, 40] })}>
          <Popup>
            <div style={{ minWidth: 180 }}>
              <div style={{ width: 40, height: 40, marginBottom: 4 }}>{blueMarker}</div>
              <div><strong>{comp.name}</strong></div>
              <div className="text-xs text-gray-700">{comp.type}</div>
              <div className="text-xs text-gray-600">Distance: {comp.distance}m</div>
              <div className="text-xs text-gray-600">Reason: {comp.reasoning}</div>
              <a
                href={`https://www.openstreetmap.org/?mlat=${comp.lat}&mlon=${comp.lng}#map=19/${comp.lat}/${comp.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline text-xs"
              >
                View on OSM
              </a>
              <span> | </span>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${comp.lat},${comp.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline text-xs"
              >
                Navigate
              </a>
            </div>
          </Popup>
        </Marker>
      ))}
      {/* TODO: Render heatmap here */}
    </MapContainer>
  );
};

export default Heatmap; 