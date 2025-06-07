import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "esri-leaflet";
import { vectorBasemapLayer } from "esri-leaflet-vector";
import * as arcgisRest from "@esri/arcgis-rest-routing";
import { ApiKey } from "@esri/arcgis-rest-auth";

const apiKey =
  "AAPTxy8BH1VEsoebNVZXo8HurEVRE-FJ8d3j3ykWlfHRt7UTM7vSP3Fo2e3vP4pl6Fo50rk8cNN7I5GIwWCIWGqWpBDMlHi6XScsVIJ91MQqPPeOSxljOwPW8yJKu6Cl0aVNUrQWOZ5feaUHDUjoPBoi-evDKhUIYmV2WhQFxA1VZqYhLUrzaBz0UkSWZevMltj6_5_JxICBNjB3iVQWxYOxr3MzZ2dZW0YX0hEaUf0h1Hw.AT1_epC4akb5-oCuiincUbqJI4DgwBMdKnBoWM3cCNkVOw";
const basemapEnum = "ArcGIS:Streets";

// Define a pin icon using Leaflet's default marker from CDN
const pinIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function App() {
  const mapRef = useRef(null);
  const directionsRef = useRef(null);

  useEffect(() => {
    const map = L.map(mapRef.current, { minZoom: 2 }).setView([34.02, -118.805], 13);
    vectorBasemapLayer(basemapEnum, { apiKey }).addTo(map);

    const startLayerGroup = L.layerGroup().addTo(map);
    const endLayerGroup = L.layerGroup().addTo(map);
    const routeLines = L.layerGroup().addTo(map);

    let currentStep = "start";
    let startCoords = null;
    let endCoords = null;

    function updateRoute() {
      const authentication = new ApiKey({ key: apiKey });
      arcgisRest
        .solveRoute({
          stops: [startCoords, endCoords],
          authentication,
        })
        .then((response) => {
          routeLines.clearLayers();
          L.geoJSON(response.routes.geoJson).addTo(routeLines);
          const directionsHTML = response.directions[0].features
            .map((f) => f.attributes.text)
            .join("<br/>");
          if (directionsRef.current) directionsRef.current.innerHTML = directionsHTML;
          startCoords = null;
          endCoords = null;
        })
        .catch((error) => {
          console.error(error);
          alert("There was a problem using the route service. See the console for details.");
        });
    }

    function onMapClick(e) {
      const coordinates = [e.latlng.lng, e.latlng.lat];
      if (currentStep === "start") {
        startLayerGroup.clearLayers();
        endLayerGroup.clearLayers();
        routeLines.clearLayers();
        L.marker(e.latlng, { icon: pinIcon }).addTo(startLayerGroup); // Use pin icon
        startCoords = coordinates;
        currentStep = "end";
      } else {
        L.marker(e.latlng, { icon: pinIcon }).addTo(endLayerGroup); // Use pin icon
        endCoords = coordinates;
        currentStep = "start";
      }
      if (startCoords && endCoords) {
        updateRoute();
      }
    }

    map.on("click", onMapClick);

    return () => {
      map.off("click", onMapClick);
      map.remove();
    };
  }, []);

  return (
    <div style={{ height: "100vh", width: "100vw", position: "relative" }}>
      <div
        ref={mapRef}
        id="map"
        style={{ height: "100%", width: "100%", position: "absolute" }}
      />
      <div
        ref={directionsRef}
        id="directions"
        style={{
          position: "absolute",
          zIndex: 1000,
          width: "30%",
          maxHeight: "50%",
          right: 20,
          top: 20,
          overflowY: "auto",
          background: "white",
          fontFamily: "Arial, Helvetica, Verdana",
          lineHeight: 1.5,
          fontSize: 14,
          padding: 10,
          boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
        }}
      >
        Click on the map to create a start and end for the route.
      </div>
    </div>
  );
}

export default App;