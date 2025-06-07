import React from 'react';

/**
 * CompetitorPanel for listing nearby competitors.
 * Props:
 * - competitors: Array of {name, distance, lat, lng}
 * - onSelect: function (to focus on map)
 */
const CompetitorPanel = ({ competitors, onSelect }) => {
  return (
    <aside className="w-full bg-white p-4 rounded-lg shadow-lg mt-4" aria-label="Competitor Analysis">
      <h2 className="text-lg font-bold mb-2">Nearby Competitors</h2>
      <ul className="divide-y divide-blue-100">
        {competitors.map((comp, idx) => (
          <li key={idx} className="py-2 flex justify-between items-center cursor-pointer hover:bg-blue-50 rounded" tabIndex={0} aria-label={`Competitor: ${comp.name}, Distance: ${comp.distance}m`} onClick={() => onSelect(comp)} onKeyPress={e => { if (e.key === 'Enter') onSelect(comp); }}>
            <span>{comp.name}</span>
            <span className="text-sm text-blue-600">{comp.distance}m</span>
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default CompetitorPanel; 