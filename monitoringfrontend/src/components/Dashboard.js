import React from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend } from 'chart.js';
Chart.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

/**
 * Dashboard for displaying key metrics and AI-extracted preferences.
 * Props:
 * - topLocations: Array of {name, score, lat, lng}
 * - avgScore: number
 * - aiSummary: string
 * - chartData: object (for Chart.js)
 * - chartHeight: number (optional, px)
 */
const Dashboard = ({ topLocations, avgScore, aiSummary, chartData, chartHeight = 200 }) => {
  return (
    <section className="w-full bg-white p-2 rounded-lg shadow-lg flex flex-col gap-3 text-xs">
      <div className="flex flex-col md:flex-row gap-3">
        <div className="flex-1 min-w-0">
          <h2 className="text-base font-bold mb-1 text-primary">Top 5 Suitable Locations</h2>
          <ul className="list-disc pl-4">
            {topLocations.map((loc, idx) => (
              <li key={idx} className="mb-0.5">
                <strong>{loc.address || loc.name}</strong>
                {loc.type && <span> ({loc.type})</span>}
                {loc.distance !== undefined && <span> - {loc.distance}m</span>}
                {loc.reasoning && <div className="text-xs text-gray-600">Reason: {loc.reasoning}</div>}
              </li>
            ))}
          </ul>
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-base font-bold mb-1 text-primary">Average Suitability Score</h2>
          <div className="text-2xl font-semibold text-blue-600">{avgScore.toFixed(2)}</div>
        </div>
      </div>
      <div className="flex flex-col md:flex-row gap-3">
        <div className="flex-1 min-w-0">
          <h2 className="text-base font-bold mb-1 text-primary">Suitability Distribution</h2>
          <div style={{ width: '100%', height: chartHeight }}>
            <Bar data={chartData.bar} options={{ responsive: true, plugins: { legend: { display: false } }, maintainAspectRatio: false }} height={chartHeight} />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-base font-bold mb-1 text-primary">Business Type Breakdown within 1km</h2>
          <div style={{ width: '100%', height: chartHeight }}>
            <Pie data={chartData.pie} options={{ responsive: true, maintainAspectRatio: false }} height={chartHeight} />
          </div>
        </div>
      </div>
      <div>
        <h2 className="text-base font-bold mb-1 text-primary">AI-Extracted Preferences</h2>
        <p className="bg-blue-50 p-2 rounded border border-blue-100" aria-live="polite">{aiSummary}</p>
      </div>
    </section>
  );
};

export default Dashboard; 