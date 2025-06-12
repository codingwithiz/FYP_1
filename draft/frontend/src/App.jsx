import { useState } from "react";
import { Routes, Route, Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Basemap from "./components/Esrimap";
import PlacesPanel from "./components/PlacesPanel";
import MapViewComponent from "./components/MapView";
import Chatbot from "./components/Chatbot";
import AuthPage from "./components/AuthPage";
import { signOut } from "firebase/auth";
import { auth } from "./firebase";
import "./App.css";
import api from "./api/api";

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/auth" replace />;
}

function App() {
  const [places, setPlaces] = useState([]);
  const [activeCategory, setActiveCategory] = useState("4d4b7105d754a06377d81259");
  const [recommendedPlace, setRecommendedPlace] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  const apiKey =
    "AAPTxy8BH1VEsoebNVZXo8HurOhukd1E28CYalTpQ2ovQDRMAjTnccKPy00UNDRVFY9ztIq9aC0REycGJGepAJSwmVtTBfKBR7bzv4y4cQxWs8pmVOtqywEIZxJFUzShBJ-gbxFMupHgisPUbDtMh7z_M6hiRlEo-zbHX87ugCtrKsACthqEIwXHN69A1OpyrHBatBXFst8XroSU_-5-VmZ8hMfV_6b1gvWw4ZL7MztKo-U.AT1_uq2IJjly";

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

  const handleChatbotResult = async ({ location, category, radius }) => {
    console.log("Chatbot result received:", { location, category, radius });
    try {
      const res = await api.post("/api/suitability", {
        location,
        category,
        radius,
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
          padding: "1rem",
          backgroundColor: "#eee",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <div>
          {user && (
            <>
              <Link to="/map" style={{ marginRight: "1rem" }}>
                Places Services
              </Link>
              <Link to="/basemap">Basemap</Link>
            </>
          )}
        </div>
        {user && (
          <button onClick={handleLogout} style={{ marginLeft: "auto" }}>
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
              <div className="app-container" style={{ display: "flex", height: "100vh" }}>
                <div className="sidebar" style={{ width: "300px", overflowY: "auto", borderRight: "1px solid #ccc" }}>
                  <Chatbot onExtracted={handleChatbotResult} />
                  <PlacesPanel
                    places={places}
                    recommendedPlace={recommendedPlace}
                    onPlaceSelect={handlePlaceSelect}
                    onCategoryChange={handleCategoryChange}
                  />
                </div>
                <div className="map-container" style={{ flex: 1 }}>
                  <MapViewComponent
                    activeCategory={activeCategory}
                    onPlacesFound={handlePlacesFound}
                    onPlaceSelect={handlePlaceSelect}
                    recommendedPlace={recommendedPlace}
                    apiKey={apiKey}
                  />
                </div>
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

        {/* Any other path redirects to auth */}
        <Route path="*" element={<Navigate to="/auth" replace />} />
      </Routes>
    </>
  );
}

export default App;
