import React, { useState } from 'react';
import MapViewComponent from './components/MapView';
import PlacesPanel from './components/PlacesPanel';
import './App.css';

function App() {
  const [places, setPlaces] = useState([]);
  const [activeCategory, setActiveCategory] = useState("4d4b7105d754a06377d81259");
  const [selectedPlace, setSelectedPlace] = useState(null);
  
  // Your ArcGIS API key
  const apiKey = "AAPTxy8BH1VEsoebNVZXo8HurEVRE-FJ8d3j3ykWlfHRt7WH51Izm4ty5j3rsTZEnY8a5mmgR6TL7Vs5JMOdMWi40lLPEvxQ1JZgHYXSmMLJl6OPV6lBv_suBJSEkwbLqtaedGXDvrLd_1H3wdq8zQ6Y2cahlF6_a6neEU-17Fd-2bfyJA9qOxFwsNYQomE_tYyg8q6IWgE_Z1o-VcSoBGFepsuT-0ouI4qYsUd1BaAVP-U.AT1_aU0cHYIh";
  
  const handlePlacesFound = (results) => {
    console.log("Places found:", results.length);
    setPlaces(results);
  };

  const handleCategoryChange = (category) => {
    console.log("Category changed to:", category);
    setActiveCategory(category);
  };

  const handlePlaceSelect = (place) => {
    console.log("Selected place:", place);
    setSelectedPlace(place);
  };

  return (
    <div className="app-container">
      <div className="sidebar">
        <PlacesPanel 
          places={places} 
          selectedPlace={selectedPlace}
          onPlaceSelect={handlePlaceSelect} 
          onCategoryChange={handleCategoryChange}
        />
      </div>
      <div className="map-container">
        <MapViewComponent
          activeCategory={activeCategory}
          onPlacesFound={handlePlacesFound}
          onPlaceSelect={handlePlaceSelect}
          apiKey={apiKey}
        />
      </div>
    </div>
  );
}

export default App;