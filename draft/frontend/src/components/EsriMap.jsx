import React, { useState, useEffect, useRef } from "react";

const Basemap = () => {
    const mapRef = useRef(null);
    const [showBasemapGallery, setShowBasemapGallery] = useState(true);


    useEffect(() => {
        if (mapRef.current) {
            console.log("arcgis-map element loaded:", mapRef.current);
        }
    }, []);

    return (
        <div style={{ height: "100vh", width: "100vw", margin: 0, padding: 0 }}>
            <button
                style={{ position: "absolute", zIndex: 10, margin: "10px" }}
                onClick={() => setShowBasemapGallery(!showBasemapGallery)}
            >
                {showBasemapGallery
                    ? "Hide Basemap Gallery"
                    : "Show Basemap Gallery"}
            </button>

            <arcgis-map
                basemap="arcgis/topographic"
                center="-118.805, 34.027"
                zoom="13"
                // item-id is example map with heatmaps
                // item-id="d5dda743788a4b0688fe48f43ae7beb9"
                onarcgisViewReadyChange={(event) => {
                    console.log("MapView ready", event);
                }}
            >
                <arcgis-search position="top-right"></arcgis-search>
                {/* <arcgis-legend position="bottom-left"></arcgis-legend> */}
                {showBasemapGallery && (
                    <arcgis-basemap-gallery position="top-left"></arcgis-basemap-gallery>
                )}
            </arcgis-map>
        </div>
    );
};

export default Basemap;
