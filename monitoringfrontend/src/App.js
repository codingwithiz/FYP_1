import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Heatmap from './components/Heatmap';
import CompetitorPanel from './components/CompetitorPanel';
import AIExplanationModal from './components/AIExplanationModal';
import ExportButton from './components/ExportButton';
import Dashboard from './components/Dashboard';
import LoginPage from './components/LoginPage';
import LogoutPage from './components/LogoutPage';
import { calculateSuitability, toHeatmapPoints } from './modules/SuitabilityModule';

// --- Mock Data for Demo ---
const mockLocations = [
  { lat: 3.107, lng: 101.606, features: { footTraffic: 80, competitorDensity: 20, accessibility: 70, demographics: 60 } },
  { lat: 3.11, lng: 101.61, features: { footTraffic: 60, competitorDensity: 40, accessibility: 80, demographics: 75 } },
  { lat: 3.105, lng: 101.602, features: { footTraffic: 90, competitorDensity: 10, accessibility: 60, demographics: 80 } },
  { lat: 3.112, lng: 101.608, features: { footTraffic: 50, competitorDensity: 60, accessibility: 90, demographics: 55 } },
  { lat: 3.109, lng: 101.604, features: { footTraffic: 70, competitorDensity: 30, accessibility: 75, demographics: 65 } },
];
const mockCompetitors = [
  { name: 'Competitor A', distance: 120, lat: 3.108, lng: 101.607, reasoning: 'Close proximity and similar business type.' },
  { name: 'Competitor B', distance: 300, lat: 3.111, lng: 101.609, reasoning: 'High customer traffic and overlapping service area.' },
  { name: 'Competitor C', distance: 450, lat: 3.106, lng: 101.603, reasoning: 'Known for aggressive pricing in the same market segment.' },
];
const businessTypes = ['Retail', 'Restaurant', 'Cafe', 'Service'];

function App() {
  // --- State Management ---
  const [weights, setWeights] = useState({ footTraffic: 70, competitorDensity: 50, accessibility: 60, demographics: 40 });
  const [selectedBusinessType, setSelectedBusinessType] = useState(businessTypes[0]);
  const [query, setQuery] = useState('');
  const [chatHistory, setChatHistory] = useState([]); // For AI chatbot
  const [aiModalOpen, setAIModalOpen] = useState(false);
  const [analyticsModalOpen, setAnalyticsModalOpen] = useState(false); // For analytics modal
  const [aiExplanation, setAIExplanation] = useState('High foot traffic prioritized due to retail business type.');
  const [userLocation, setUserLocation] = useState(null);
  const [competitors, setCompetitors] = useState([]);
  const [locations] = useState(mockLocations);
  const [topLocationAddresses, setTopLocationAddresses] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Fetch user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => setUserLocation(null)
      );
    }
  }, []);

  // Fetch and filter competitors from OSM Overpass API
  useEffect(() => {
    if (!userLocation) return;
    let filter = '';
    if (selectedBusinessType === 'Retail') filter = 'node["shop"]';
    else if (selectedBusinessType === 'Restaurant') filter = 'node["amenity"="restaurant"]';
    else if (selectedBusinessType === 'Cafe') filter = 'node["amenity"="cafe"]';
    else if (selectedBusinessType === 'Service') filter = 'node["amenity"~"bank|pharmacy|post_office"]';
    const query = `
      [out:json][timeout:25];
      (
        ${filter}(around:1000,${userLocation.lat},${userLocation.lng});
      );
      out body;
    `;
    fetch(`https://overpass-api.de/api/interpreter`, {
      method: 'POST',
      body: query,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })
      .then(res => res.json())
      .then(data => {
        if (data && data.elements) {
          // Add reasoning and distance
          const comps = data.elements.map(el => {
            const d = Math.round(
              1000 * Math.sqrt(
                Math.pow(el.lat - userLocation.lat, 2) + Math.pow(el.lon - userLocation.lng, 2)
              )
            );
            return {
              name: el.tags?.name || 'Unnamed',
              lat: el.lat,
              lng: el.lon,
              distance: d,
              type: el.tags?.shop || el.tags?.amenity || 'POI',
              reasoning: `Same business type (${selectedBusinessType}) and within 1km radius.`
            };
          });
          // Sort by distance, take top 10
          comps.sort((a, b) => a.distance - b.distance);
          setCompetitors(comps.slice(0, 10));
        }
      })
      .catch(() => setCompetitors([]));
  }, [userLocation, selectedBusinessType]);

  // --- Suitability Calculation ---
  const suitabilityData = calculateSuitability(locations, weights);
  const heatmapData = toHeatmapPoints(suitabilityData);
  // Use top 5 competitors as recommended locations
  const topLocationsRaw = competitors.slice(0, 5).map((comp, idx) => ({
    name: comp.name,
    distance: comp.distance,
    type: comp.type,
    lat: comp.lat,
    lng: comp.lng,
    reasoning: comp.reasoning
  }));

  // Fetch addresses for top 5 locations
  useEffect(() => {
    async function fetchAddresses() {
      const results = await Promise.all(topLocationsRaw.map(async (loc) => {
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${loc.lat}&lon=${loc.lng}`);
          const data = await res.json();
          return data.display_name || '';
        } catch {
          return '';
        }
      }));
      setTopLocationAddresses(results);
    }
    if (topLocationsRaw.length > 0) fetchAddresses();
    else setTopLocationAddresses([]);
  }, [JSON.stringify(topLocationsRaw)]);

  // Combine address with top location info
  const topLocations = topLocationsRaw.map((loc, idx) => ({
    ...loc,
    address: topLocationAddresses[idx] || ''
  }));

  const avgScore = suitabilityData.reduce((sum, loc) => sum + loc.value, 0) / suitabilityData.length;

  // --- Chart Data ---
  const chartData = {
    bar: {
      labels: topLocations.map(loc => loc.address ? loc.address.split(',')[0] : loc.name),
      datasets: [{
        label: 'Suitability Score',
        data: topLocations.map((_, i) => suitabilityData[i]?.value || 0),
        backgroundColor: '#2563eb',
      }],
    },
    pie: {
      labels: businessTypes,
      datasets: [{
        data: [40, 30, 20, 10],
        backgroundColor: ['#2563eb', '#60a5fa', '#1e40af', '#93c5fd'],
      }],
    },
  };

  // --- Handlers ---
  const handleWeightChange = (key, value) => setWeights(w => ({ ...w, [key]: value }));
  const handleBusinessTypeChange = e => setSelectedBusinessType(e.target.value);
  const handleQueryChange = e => setQuery(e.target.value);
  const handleSend = e => {
    e.preventDefault();
    if (!query.trim()) return;
    // Add user message
    setChatHistory(h => [...h, { role: 'user', message: query }]);
    // Simulate AI response
    setTimeout(() => {
      const aiMsg = `AI: High foot traffic prioritized for ${selectedBusinessType.toLowerCase()}s. [Query: ${query}]`;
      setChatHistory(h => [...h, { role: 'ai', message: aiMsg }]);
      setAIExplanation(aiMsg);
    }, 500);
    setQuery('');
  };
  const handleCompetitorSelect = comp => {
    alert(`Focus map on ${comp.name}`);
  };
  const handleShowResults = () => setAnalyticsModalOpen(true);

  // --- Metrics for Export ---
  const metrics = {
    'Top 1 Location': topLocations[0]?.name || '',
    'Top 1 Score': topLocations[0]?.score?.toFixed(2) || '',
    'Average Score': avgScore.toFixed(2),
  };

  if (!isLoggedIn) {
    if (isLoggingOut) {
      return <LogoutPage onLoginAgain={() => { setIsLoggingOut(false); setIsLoggedIn(false); }} />;
    }
    return <LoginPage onLogin={() => setIsLoggedIn(true)} />;
  }

  // --- Layout ---
  return (
    <div className="relative w-screen h-screen overflow-hidden">
      {/* Logout Button */}
      <button
        onClick={() => { setIsLoggedIn(false); setIsLoggingOut(true); }}
        className="absolute top-4 right-4 z-50 px-4 py-2 bg-blue-500 text-white rounded shadow hover:bg-blue-700 focus:ring-2 focus:ring-blue-400 font-semibold text-sm"
        style={{ minWidth: 90 }}
      >
        Log Out
      </button>
      {/* Map fills the background */}
      <div className="absolute inset-0 z-0">
        <Heatmap
          heatmapData={heatmapData}
          layers={[]}
          competitors={competitors}
          selectedBusinessType={selectedBusinessType}
          userLocation={userLocation}
        />
      </div>
      {/* Floating Sidebar */}
      <div className="absolute top-4 left-4 z-10 w-80 max-w-[90vw] max-h-[90vh] overflow-y-auto scrollbar-none p-4 bg-white rounded-lg shadow-lg flex flex-col gap-4">
        <Sidebar
          weights={weights}
          onWeightChange={handleWeightChange}
          businessTypes={businessTypes}
          selectedBusinessType={selectedBusinessType}
          onBusinessTypeChange={handleBusinessTypeChange}
          query={query}
          onQueryChange={handleQueryChange}
          chatHistory={chatHistory}
          onSend={handleSend}
          onShowResults={handleShowResults}
        />
      </div>
      {/* Floating Analytics Modal */}
      {analyticsModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50" role="dialog" aria-modal="true" aria-label="Analytics Modal">
          <div className="bg-white rounded-lg shadow-lg p-4 w-full max-w-screen-md max-h-[80vh] flex flex-col overflow-y-auto m-4 relative">
            <button onClick={() => setAnalyticsModalOpen(false)} className="self-end text-gray-500 hover:text-blue-600 text-lg font-bold mb-2 absolute top-2 right-2 z-20" aria-label="Close Modal">&times;</button>
            <div className="absolute top-2 right-16 z-20 flex gap-2">
              <ExportButton metrics={metrics} weights={weights} />
            </div>
            <div className="flex-1 overflow-y-auto pt-10">
              <Dashboard
                topLocations={topLocations}
                avgScore={avgScore}
                aiSummary={aiExplanation}
                chartData={chartData}
                chartHeight={200}
              />
            </div>
          </div>
        </div>
      )}
      {/* Floating AI Explanation Modal */}
      <AIExplanationModal isOpen={aiModalOpen} onClose={() => setAIModalOpen(false)} explanation={aiExplanation} />
    </div>
  );
}

export default App;
