import React, { useState, useEffect } from 'react';
import '@esri/calcite-components/dist/calcite/calcite.css';
import { defineCustomElements } from '@esri/calcite-components/dist/loader';

const PlacesPanel = ({ places = [], onPlaceSelect, onCategoryChange }) => {
  const [activeCategory, setActiveCategory] = useState("4d4b7105d754a06377d81259");

  // Initialize Calcite components
  useEffect(() => {
    defineCustomElements(window);
  }, []);

  const handleCategoryChange = (event) => {
    if (event && event.target) {
      const selectedCategory = event.detail.value;
      setActiveCategory(selectedCategory);
      onCategoryChange && onCategoryChange(selectedCategory);
    }
  };

  return (
    <div className="places-panel">
      <calcite-flow>
        <calcite-flow-item heading="Places Nearby">
          <calcite-combobox
            id="categorySelect"
            placeholder="Filter by category"
            selection-mode="single"
            onCalciteComboboxChange={handleCategoryChange}
          >
            <calcite-combobox-item value="4d4b7104d754a06370d81259" text-label="Arts and Entertainment"></calcite-combobox-item>
            <calcite-combobox-item value="4d4b7105d754a06375d81259" text-label="Business and Professional Services"></calcite-combobox-item>
            <calcite-combobox-item value="63be6904847c3692a84b9b9a" text-label="Community and Government"></calcite-combobox-item>
            <calcite-combobox-item value="63be6904847c3692a84b9bb5" text-label="Dining and Drinking"></calcite-combobox-item>
            <calcite-combobox-item value="63be6904847c3692a84b9bb9" text-label="Health and Medicine"></calcite-combobox-item>
            <calcite-combobox-item selected value="4d4b7105d754a06377d81259" text-label="Landmarks and Outdoors"></calcite-combobox-item>
            <calcite-combobox-item value="4d4b7105d754a06378d81259" text-label="Retail"></calcite-combobox-item>
            <calcite-combobox-item value="4f4528bc4b90abdf24c9de85" text-label="Sports and Recreation"></calcite-combobox-item>
            <calcite-combobox-item value="4d4b7105d754a06379d81259" text-label="Travel and Transportation"></calcite-combobox-item>
          </calcite-combobox>

          <calcite-list>
            {places.length > 0 ? (
              places.map((place) => (
                <calcite-list-item
                  key={place.placeId || place.id}
                  label={place.name}
                  description={`${place.categories && place.categories[0] ? place.categories[0].label : 'No category'} - ${Number((place.distance / 1000).toFixed(1))} km`}
                  onClick={() => onPlaceSelect && onPlaceSelect(place)}
                ></calcite-list-item>
              ))
            ) : (
              <calcite-notice open>
                <div slot="message">Click on the map to search for nearby places.</div>
              </calcite-notice>
            )}
          </calcite-list>
        </calcite-flow-item>
      </calcite-flow>
    </div>
  );
};

export default PlacesPanel;