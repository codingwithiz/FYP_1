import { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Basemap from "./components/Esrimap";
import PlacesPanel from "./components/PlacesPanel";
import MapViewComponent from "./components/MapView";
import "./App.css";
import axios from "axios";
import api from "./api/api";

function App() {
    const [places, setPlaces] = useState([]);
    const [activeCategory, setActiveCategory] = useState(
        "4d4b7105d754a06377d81259"
    );
    const [selectedPlace, setSelectedPlace] = useState(null);

    const apiKey =
        "AAPTxy8BH1VEsoebNVZXo8HurOhukd1E28CYalTpQ2ovQDRMAjTnccKPy00UNDRVFY9ztIq9aC0REycGJGepAJSwmVtTBfKBR7bzv4y4cQxWs8pmVOtqywEIZxJFUzShBJ-gbxFMupHgisPUbDtMh7z_M6hiRlEo-zbHX87ugCtrKsACthqEIwXHN69A1OpyrHBatBXFst8XroSU_-5-VmZ8hMfV_6b1gvWw4ZL7MztKo-U.AT1_uq2IJjly";

      const handlePlacesFound = async (results) => {
          console.log("Places found:", results.length);
          console.log("First Result Categories:", results[0]?.categories);
          
          // Set places immediately to show something while backend processes
          setPlaces(results);

          // Construct simplified objects to send to backend
          const simplifiedResults = results.map((place) => ({
              name: place.name,
              placeId: place.placeId,
              distance: place.distance,
              location: place.location,
              icon: place.icon?.url || null,
              categories: place.categories?.map((cat) => cat.label) || [],
          }));

          try {
              const response = await api.post("/api/process-places", {
                  places: simplifiedResults,
              });

              console.log(
                  "Filtered + Processed Places:",
                  response.data.processed
              );
              
              // Only update places if backend returned non-empty results
              if (response.data.processed && response.data.processed.length > 0) {
                  setPlaces(response.data.processed);
              }
              // Otherwise, keep using the original results (already set above)
          } catch (error) {
              console.error("Error sending places to backend:", error);
              // Original results already set above
          }
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
        <Router>
            <nav style={{ padding: "1rem", backgroundColor: "#eee" }}>
                <Link to="/basemap" style={{ marginRight: "1rem" }}>
                    Basemap
                </Link>
                <Link to="/map">Places Services</Link>
            </nav>

            <Routes>
                <Route path="/basemap" element={<Basemap />} />

                <Route
                    path="/map"
                    element={
                        <div
                            className="app-container"
                            style={{ display: "flex", height: "100vh" }}
                        >
                            <div
                                className="sidebar"
                                style={{
                                    width: "300px",
                                    overflowY: "auto",
                                    borderRight: "1px solid #ccc",
                                }}
                            >
                                <PlacesPanel
                                    places={places}
                                    selectedPlace={selectedPlace}
                                    onPlaceSelect={handlePlaceSelect}
                                    onCategoryChange={handleCategoryChange}
                                />
                            </div>
                            <div className="map-container" style={{ flex: 1 }}>
                                <MapViewComponent
                                    activeCategory={activeCategory}
                                    onPlacesFound={handlePlacesFound}
                                    onPlaceSelect={handlePlaceSelect}
                                    apiKey={apiKey}
                                />
                            </div>
                        </div>
                    }
                />

                <Route
                    path="*"
                    element={
                        <div style={{ padding: "1rem" }}>
                            <h2>Welcome! Please select a view:</h2>
                            <ul>
                                <li>
                                    <Link to="/basemap">Basemap</Link>
                                </li>
                                <li>
                                    <Link to="/map">Places Services</Link>
                                </li>
                            </ul>
                        </div>
                    }
                />
            </Routes>
        </Router>
    );
}

export default App;

// import React, { useState } from "react";
// import MapViewComponent from "./components/MapView";
// import PlacesPanel from "./components/PlacesPanel";
// import "./App.css";

// function App() {
//     const [places, setPlaces] = useState([]);
//     const [activeCategory, setActiveCategory] = useState(
//         "4d4b7105d754a06377d81259"
//     );
//     const [selectedPlace, setSelectedPlace] = useState(null);

//     // Your ArcGIS API key
//     const apiKey =
//         "AAPTxy8BH1VEsoebNVZXo8HurOhukd1E28CYalTpQ2ovQDRMAjTnccKPy00UNDRVFY9ztIq9aC0REycGJGepAJSwmVtTBfKBR7bzv4y4cQxWs8pmVOtqywEIZxJFUzShBJ-gbxFMupHgisPUbDtMh7z_M6hiRlEo-zbHX87ugCtrKsACthqEIwXHN69A1OpyrHBatBXFst8XroSU_-5-VmZ8hMfV_6b1gvWw4ZL7MztKo-U.AT1_uq2IJjly";

//     const handlePlacesFound = (results) => {
//         console.log("Places found:", results.length);
//         setPlaces(results);
//     };

//     const handleCategoryChange = (category) => {
//         console.log("Category changed to:", category);
//         setActiveCategory(category);
//     };

//     const handlePlaceSelect = (place) => {
//         console.log("Selected place:", place);
//         setSelectedPlace(place);
//     };

//     return (
//         <div className="app-container">
//             <div className="sidebar">
//                 <PlacesPanel
//                     places={places}
//                     selectedPlace={selectedPlace}
//                     onPlaceSelect={handlePlaceSelect}
//                     onCategoryChange={handleCategoryChange}
//                 />
//             </div>
//             <div className="map-container">
//                 <MapViewComponent
//                     activeCategory={activeCategory}
//                     onPlacesFound={handlePlacesFound}
//                     onPlaceSelect={handlePlaceSelect}
//                     apiKey={apiKey}
//                 />
//             </div>
//         </div>
//     );
// }

// export default App;
