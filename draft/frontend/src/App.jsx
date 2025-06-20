import { useState } from "react";
import { Routes, Route, Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Basemap from "./components/Esrimap";
import MapViewComponent from "./components/MapView";
import Chatbot from "./components/Chatbot";
import AuthPage from "./components/AuthPage";
import { signOut } from "firebase/auth";
import { auth } from "./firebase";
import "./App.css";
import api from "./api/api";
import AnalysesPage from "./components/Analysis";


function ProtectedRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/auth" replace />;
}

function App() {
  const [places, setPlaces] = useState([]);
  const [activeCategory, setActiveCategory] = useState("4d4b7105d754a06377d81259");
  const [recommendedPlace, setRecommendedPlace] = useState(null);

  // New: Handler for recommendations from Chatbot
  const handleShowRecommendations = (locations) => {
    setRecommendedPlace({ recommended_locations: locations });
  };

  const [currentLocationCoordinate, setCurrentLocationCoordinate] =
      useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [chatbotOpen, setChatbotOpen] = useState(false);

  const apiKey = import.meta.env.VITE_ESRI_API_KEY;

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/auth");
  };

  const handlePlacesFound = (results) => {
    console.log("Places found:", results.length);
    setPlaces(results);
  };

  const handleCategoryChange = (category) => {
    setActiveCategory(category);
  };

  const handlePlaceSelect = (place) => {
    setPlaces([place]);
  };
  

  const handleChatbotResult = async ({ location, category, radius, nearbyMe, chatId, userId, conversationId }) => {
    console.log("Chatbot result received:", {
      location,
      category,
      radius,
      nearbyMe,
      chatId,
      userId,
    });
  
    let resolvedLocation = currentLocation;
  
    if (nearbyMe) {
      console.log("Fetching current location...");
  
      try {
        console.log("Requesting geolocation...");
        const coord = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(
                (position) =>
                    resolve({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        address: position.coords.address || "Current Location",
                    }),
                (error) => reject(error),
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
            );
        });
        console.log("Geolocation received:", coord);
  
        if (
          typeof coord?.latitude === "number" &&
          typeof coord?.longitude === "number"
        ) {
          resolvedLocation = {
            lat: coord.latitude,
            lon: coord.longitude,
            address: coord.address
          };
          console.log("Resolved current location:", resolvedLocation);
  
          // These setters won't update state immediately, but we use resolvedLocation directly
          setCurrentLocationCoordinate(coord);
          setCurrentLocation(resolvedLocation);
  
          console.log("Using current location:", resolvedLocation);
        } else {
          console.warn("Invalid coordinates received:", coord);
          return;
        }
      } catch (error) {
        console.error("Geolocation error:", error.message);
        alert("Failed to access your location.");
        return;
      }
    }
  
    if (!resolvedLocation && nearbyMe) {
      console.warn("No valid location available after geolocation.");
      return;
    }
  
    try {
      console.log("Calling suitability API with:", {
        locationName: location,
        category,
        radius,
        currentLocation: resolvedLocation,
        nearbyMe,
      });
  
      const res = await api.post("/api/suitability", {
        locationName: location,
        category,
        radius,
        currentLocation: resolvedLocation,
        nearbyMe,
        chatId,
        userId,
        conversationId, // <-- Pass it here!
      });
  
      const results = res.data || [];
      console.log("Recommended places:", results);
      setRecommendedPlace(results);
    } catch (err) {
      console.error("Error calling suitability API:", err);
      alert("Could not fetch recommended locations.");
    }

  };
  

  return (
      <>
          <nav
              style={{
                  padding: "0.75rem 2rem",
                  background: "#fff",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  position: "sticky",
                  top: 0,
                  zIndex: 100,
                  minHeight: 64,
              }}
          >
              <div
                  style={{ display: "flex", alignItems: "center", gap: "2rem" }}
              >
                  <span
                      style={{
                          fontWeight: 700,
                          fontSize: 22,
                          color: "#1976d2",
                          letterSpacing: 1,
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                      }}
                  >
                      <svg
                          width="28"
                          height="28"
                          fill="#1976d2"
                          viewBox="0 0 24 24"
                      >
                          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z" />
                      </svg>
                      NiagaMap
                  </span>
                  {user && (
                      <>
                          <Link
                              to="/map"
                              style={{
                                  color: "#1976d2",
                                  fontWeight: 500,
                                  textDecoration: "none",
                                  padding: "8px 16px",
                                  borderRadius: 6,
                                  transition: "background 0.2s",
                              }}
                              onMouseOver={(e) =>
                                  (e.currentTarget.style.background = "#f0f7ff")
                              }
                              onMouseOut={(e) =>
                                  (e.currentTarget.style.background =
                                      "transparent")
                              }
                          >
                              Places Services
                          </Link>
                          <Link
                              to="/basemap"
                              style={{
                                  color: "#1976d2",
                                  fontWeight: 500,
                                  textDecoration: "none",
                                  padding: "8px 16px",
                                  borderRadius: 6,
                                  transition: "background 0.2s",
                              }}
                              onMouseOver={(e) =>
                                  (e.currentTarget.style.background = "#f0f7ff")
                              }
                              onMouseOut={(e) =>
                                  (e.currentTarget.style.background =
                                      "transparent")
                              }
                          >
                              Basemap
                          </Link>

                          <Link
                              to="/analysis"
                              style={{
                                  color: "#1976d2",
                                  fontWeight: 500,
                                  textDecoration: "none",
                                  padding: "8px 16px",
                                  borderRadius: 6,
                                  transition: "background 0.2s",
                              }}
                              onMouseOver={(e) =>
                                  (e.currentTarget.style.background = "#f0f7ff")
                              }
                              onMouseOut={(e) =>
                                  (e.currentTarget.style.background =
                                      "transparent")
                              }
                          >
                              Analysis
                          </Link>
                      </>
                  )}
              </div>
              {user && (
                  <button
                      onClick={handleLogout}
                      style={{
                          marginLeft: "auto",
                          background: "#f44336",
                          color: "#fff",
                          border: "none",
                          borderRadius: 6,
                          padding: "8px 20px",
                          fontWeight: 600,
                          fontSize: 16,
                          cursor: "pointer",
                          boxShadow: "0 2px 8px rgba(244,67,54,0.08)",
                          transition: "background 0.2s",
                      }}
                      onMouseOver={(e) =>
                          (e.currentTarget.style.background = "#d32f2f")
                      }
                      onMouseOut={(e) =>
                          (e.currentTarget.style.background = "#f44336")
                      }
                  >
                      Logout
                  </button>
              )}
          </nav>

          <Routes>
              {/* Default route redirects to auth page */}
              <Route path="/" element={<Navigate to="/auth" replace />} />

              {/* Auth login/signup */}
              <Route path="/auth" element={<AuthPage />} />

              {/* Protected routes */}
              <Route
                  path="/map"
                  element={
                      <ProtectedRoute>
                          <div
                              className="app-container"
                              style={{
                                  height: "100vh",
                                  width: "100vw",
                                  position: "relative",
                              }}
                          >
                              {/* Remove sidebar */}
                              <div
                                  className="map-container"
                                  style={{ flex: 1, height: "100vh" }}
                              >
                                  <MapViewComponent
                                      activeCategory={activeCategory}
                                      onPlacesFound={handlePlacesFound}
                                      onPlaceSelect={handlePlaceSelect}
                                      recommendedPlace={recommendedPlace}
                                      currentLocationCoordinate={
                                          currentLocationCoordinate
                                      }
                                      apiKey={apiKey}
                                  />
                              </div>
                              {/* Floating Chatbot Button */}
                              {!chatbotOpen && (
                                  <button
                                      onClick={() => setChatbotOpen(true)}
                                      style={{
                                          position: "fixed",
                                          bottom: 32,
                                          right: 32,
                                          zIndex: 1001,
                                          borderRadius: "50%",
                                          width: 64,
                                          height: 64,
                                          background: "#1976d2",
                                          color: "#fff",
                                          fontSize: 32,
                                          border: "none",
                                          boxShadow:
                                              "0 4px 16px rgba(0,0,0,0.2)",
                                          cursor: "pointer",
                                      }}
                                      aria-label="Open Chatbot"
                                  >
                                      💬
                                  </button>
                              )}
                              {/* Floating Chatbot Panel */}
                              {chatbotOpen && (
                                  <div
                                      style={{
                                          position: "fixed",
                                          bottom: 32,
                                          right: 32,
                                          width: 400,
                                          maxWidth: "90vw",
                                          height: 520,
                                          background: "#fff",
                                          borderRadius: 16,
                                          boxShadow:
                                              "0 8px 32px rgba(0,0,0,0.25)",
                                          zIndex: 1002,
                                          display: "flex",
                                          flexDirection: "column",
                                          overflow: "hidden",
                                          animation: "fadeInUp 0.3s",
                                      }}
                                  >
                                      <div
                                          style={{ flex: 1, overflow: "auto" }}
                                      >
                                          <Chatbot
                                              onExtracted={handleChatbotResult}
                                              onClose={() => setChatbotOpen(false)}
                                              onShowRecommendations={handleShowRecommendations}
                                          />
                                      </div>
                                  </div>
                              )}
                          </div>
                      </ProtectedRoute>
                  }
              />

              <Route
                  path="/basemap"
                  element={
                      <ProtectedRoute>
                          <Basemap />
                      </ProtectedRoute>
                  }
              />

              <Route
                  path="/analysis"
                  element={
                      <ProtectedRoute>
                          <AnalysesPage />
                      </ProtectedRoute>
                  }
              />

              {/* Any other path redirects to auth */}
              <Route path="*" element={<Navigate to="/auth" replace />} />
          </Routes>

          {/* Add fadeInUp animation */}
          <style>
              {`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(40px);}
          to { opacity: 1; transform: translateY(0);}
        }
        `}
          </style>
      </>
  );
}

export default App;
