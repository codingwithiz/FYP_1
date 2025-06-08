import React, { useState, useEffect } from "react";
import "@esri/calcite-components/dist/calcite/calcite.css";
import { defineCustomElements } from "@esri/calcite-components/dist/loader";

const PlacesPanel = ({
    places = [],
    selectedPlace,
    onPlaceSelect,
    onCategoryChange,
}) => {
    const [activeCategory, setActiveCategory] = useState(
        "4d4b7105d754a06377d81259"
    );
    const [showDetails, setShowDetails] = useState(false);

    // Initialize Calcite components
    useEffect(() => {
        defineCustomElements(window);
    }, []);

    // Show details panel when a place is selected
    useEffect(() => {
        if (selectedPlace) {
            setShowDetails(true);
        }
    }, [selectedPlace]);

    const handleCategoryChange = (event) => {
        if (event && event.target) {
            const selectedCategory = event.detail.value;
            setActiveCategory(selectedCategory);
            onCategoryChange && onCategoryChange(selectedCategory);
        }
    };

    const handlePlaceClick = (place) => {
        onPlaceSelect && onPlaceSelect(place);
    };

    const handleBackClick = () => {
        setShowDetails(false);
    };

    return (
        <div className="places-panel">
            <calcite-flow>
                <calcite-flow-item heading="Places Nearby" hidden={showDetails}>
                    <calcite-combobox
                        id="categorySelect"
                        placeholder="Filter by category"
                        selection-mode="single"
                        onCalciteComboboxChange={handleCategoryChange}
                    >
                        <calcite-combobox-item
                            value="4d4b7104d754a06370d81259"
                            text-label="Arts and Entertainment"
                        ></calcite-combobox-item>
                        <calcite-combobox-item
                            value="4d4b7105d754a06375d81259"
                            text-label="Business and Professional Services"
                        ></calcite-combobox-item>
                        <calcite-combobox-item
                            value="63be6904847c3692a84b9b9a"
                            text-label="Community and Government"
                        ></calcite-combobox-item>
                        <calcite-combobox-item
                            value="63be6904847c3692a84b9bb5"
                            text-label="Dining and Drinking"
                        ></calcite-combobox-item>
                        <calcite-combobox-item
                            value="63be6904847c3692a84b9bb9"
                            text-label="Health and Medicine"
                        ></calcite-combobox-item>
                        <calcite-combobox-item
                            selected
                            value="4d4b7105d754a06377d81259"
                            text-label="Landmarks and Outdoors"
                        ></calcite-combobox-item>
                        <calcite-combobox-item
                            value="4d4b7105d754a06378d81259"
                            text-label="Retail"
                        ></calcite-combobox-item>
                        <calcite-combobox-item
                            value="4f4528bc4b90abdf24c9de85"
                            text-label="Sports and Recreation"
                        ></calcite-combobox-item>
                        <calcite-combobox-item
                            value="4d4b7105d754a06379d81259"
                            text-label="Travel and Transportation"
                        ></calcite-combobox-item>
                    </calcite-combobox>

                    <calcite-list>
                        {places.length > 0 ? (
                            places.map((place) => (
                                <calcite-list-item
                                    key={place.placeId || place.id}
                                    label={place.name}
                                    description={`${
                                        place.categories && place.categories[0]
                                            ? place.categories[0].label
                                            : "No category"
                                    } - ${Number(
                                        (place.distance / 1000).toFixed(1)
                                    )} km`}
                                    onClick={() => handlePlaceClick(place)}
                                ></calcite-list-item>
                            ))
                        ) : (
                            <calcite-notice open>
                                <div slot="message">
                                    Click on the map to search for nearby
                                    places.
                                </div>
                            </calcite-notice>
                        )}
                    </calcite-list>
                </calcite-flow-item>

                {selectedPlace && (
                    <calcite-flow-item
                        heading={selectedPlace.name}
                        description={
                            selectedPlace.categories &&
                            selectedPlace.categories[0]
                                ? selectedPlace.categories[0].label
                                : ""
                        }
                        hidden={!showDetails}
                        onCalciteFlowItemBack={handleBackClick}
                    >
                        {selectedPlace.address &&
                            selectedPlace.address.streetAddress && (
                                <calcite-block heading="Address" open>
                                    <calcite-icon
                                        slot="icon"
                                        icon="map-pin"
                                    ></calcite-icon>
                                    <div>
                                        {selectedPlace.address.streetAddress}
                                    </div>
                                </calcite-block>
                            )}

                        {selectedPlace.contactInfo &&
                            selectedPlace.contactInfo.telephone && (
                                <calcite-block heading="Phone" open>
                                    <calcite-icon
                                        slot="icon"
                                        icon="mobile"
                                    ></calcite-icon>
                                    <div>
                                        {selectedPlace.contactInfo.telephone}
                                    </div>
                                </calcite-block>
                            )}

                        {selectedPlace.contactInfo &&
                            selectedPlace.contactInfo.email && (
                                <calcite-block heading="Email" open>
                                    <calcite-icon
                                        slot="icon"
                                        icon="email-address"
                                    ></calcite-icon>
                                    <div>{selectedPlace.contactInfo.email}</div>
                                </calcite-block>
                            )}

                        {selectedPlace.socialMedia &&
                            selectedPlace.socialMedia.facebookId && (
                                <calcite-block heading="Facebook" open>
                                    <calcite-icon
                                        slot="icon"
                                        icon="speech-bubble-social"
                                    ></calcite-icon>
                                    <div>
                                        <a
                                            href={`https://www.facebook.com/${selectedPlace.socialMedia.facebookId}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            View on Facebook
                                        </a>
                                    </div>
                                </calcite-block>
                            )}

                        {selectedPlace.socialMedia &&
                            selectedPlace.socialMedia.twitter && (
                                <calcite-block heading="X (Twitter)" open>
                                    <calcite-icon
                                        slot="icon"
                                        icon="speech-bubbles"
                                    ></calcite-icon>
                                    <div>
                                        <a
                                            href={`https://www.x.com/${selectedPlace.socialMedia.twitter}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            View on X
                                        </a>
                                    </div>
                                </calcite-block>
                            )}

                        {selectedPlace.socialMedia &&
                            selectedPlace.socialMedia.instagram && (
                                <calcite-block heading="Instagram" open>
                                    <calcite-icon
                                        slot="icon"
                                        icon="camera"
                                    ></calcite-icon>
                                    <div>
                                        <a
                                            href={`https://www.instagram.com/${selectedPlace.socialMedia.instagram}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            View on Instagram
                                        </a>
                                    </div>
                                </calcite-block>
                            )}
                    </calcite-flow-item>
                )}
            </calcite-flow>
        </div>
    );
};

export default PlacesPanel;
