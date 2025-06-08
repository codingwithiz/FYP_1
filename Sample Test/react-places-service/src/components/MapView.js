import React, { useEffect, useRef, useState } from 'react';
import '@esri/calcite-components/dist/calcite/calcite.css';
import { defineCustomElements } from '@esri/calcite-components/dist/loader';
import { loadModules } from 'esri-loader';

const MapViewComponent = ({ activeCategory = "4d4b7105d754a06377d81259", onPlacesFound, onPlaceSelect, apiKey }) => {
  // Add onPlaceSelect prop to component parameters
  
  const mapRef = useRef(null);
  const [view, setView] = useState(null);
  const [esriModules, setEsriModules] = useState(null);
  const bufferLayerRef = useRef(null);
  const placesLayerRef = useRef(null);
  const [initialized, setInitialized] = useState(false);
  const [lastClickPoint, setLastClickPoint] = useState(null);
  const [selectedPlaceId, setSelectedPlaceId] = useState(null);

  useEffect(() => {
    defineCustomElements(window);

    let mapView = null;

    console.log("Loading ArcGIS modules...");
    
    // Load all required modules
    loadModules([
      "esri/config",
      "esri/Map",
      "esri/views/MapView",
      "esri/rest/places",
      "esri/rest/support/FetchPlaceParameters",
      "esri/rest/support/PlacesQueryParameters",
      "esri/geometry/Circle",
      "esri/Graphic",
      "esri/layers/GraphicsLayer"
    ], { 
      version: "4.32",
      css: true 
    }).then(([
      esriConfig, Map, MapView, places, FetchPlaceParameters, 
      PlacesQueryParameters, Circle, Graphic, GraphicsLayer
    ]) => {
      console.log("Modules loaded successfully");
      
      // Set API key first
      esriConfig.apiKey = apiKey;
      console.log("API key set:", apiKey);
      
      // Store modules for use in other functions
      setEsriModules({
        Map, MapView, places, FetchPlaceParameters, PlacesQueryParameters, 
        Circle, Graphic, GraphicsLayer, esriConfig
      });

      // Create layers
      const bufferLayer = new GraphicsLayer({
        id: "bufferLayer"
      });
      const placesLayer = new GraphicsLayer({
        id: "placesLayer"
      });
      bufferLayerRef.current = bufferLayer;
      placesLayerRef.current = placesLayer;

      // Create map with valid basemap
      const map = new Map({
        basemap: "streets-vector",
        layers: [bufferLayer, placesLayer]
      });

      // Initialize view
      mapView = new MapView({
        container: mapRef.current,
        map: map,
        center: [-118.46651, 33.98621],
        zoom: 13
      });

      // Wait for view to be ready before enabling interactions
      mapView.when(() => {
        console.log("Map view ready");
        setView(mapView);
        setInitialized(true);
        
        // Setup click handler
        mapView.on("click", (event) => {
          console.log("Map clicked at:", event.mapPoint);
          setLastClickPoint(event.mapPoint); // Store the click point in state
          clearGraphics();
          showPlaces(event.mapPoint);
        });
      });

      console.log("Map view initialized");
    }).catch(err => {
      console.error("Error loading ArcGIS modules:", err);
    });

    return () => {
      if (mapView) {
        mapView.destroy();
      }
    };
  }, [apiKey]);

  // Effect for category changes
  useEffect(() => {
    if (view && initialized && lastClickPoint) { // Use the lastClickPoint from state
      clearGraphics();
      showPlaces(lastClickPoint);
    }
  }, [activeCategory, initialized, lastClickPoint]);

  const clearGraphics = () => {
    if (!bufferLayerRef.current || !placesLayerRef.current) return;
    
    bufferLayerRef.current.removeAll();
    placesLayerRef.current.removeAll();
  };

  const showPlaces = async (placePoint) => {
    if (!esriModules || !bufferLayerRef.current || !placesLayerRef.current) {
      console.error("Required modules or layers are not initialized");
      return;
    }
    
    console.log("Showing places at:", placePoint);
    
    // No need to store on view anymore since we use state

    const { Circle, Graphic, places, PlacesQueryParameters } = esriModules;

    try {
      // Create search radius visual
      const circleGeometry = new Circle({
        center: placePoint,
        geodesic: true,
        numberOfPoints: 100,
        radius: 500,
        radiusUnit: "meters"
      });

      const circleGraphic = new Graphic({
        geometry: circleGeometry,
        symbol: {
          type: "simple-fill",
          style: "solid",
          color: [3, 140, 255, 0.1],
          outline: {
            width: 1,
            color: [3, 140, 255],
          },
        }
      });

      bufferLayerRef.current.add(circleGraphic);

      // Add point marker at click location
      const pointGraphic = new Graphic({
        geometry: placePoint,
        symbol: {
          type: "simple-marker",
          color: [255, 0, 0],
          size: 8
        }
      });
      bufferLayerRef.current.add(pointGraphic);

      // Set up query parameters
      const placesQueryParameters = new PlacesQueryParameters({
        categoryIds: [activeCategory],
        radius: 500,
        point: placePoint,
        icon: "png"
      });

      console.log("Querying places with category:", activeCategory);

      const results = await places.queryPlacesNearPoint(placesQueryParameters);
      console.log("Places results:", results.results);
      
      if (results.results && results.results.length > 0) {
        console.log(`Found ${results.results.length} places`);
        results.results.forEach(addResult);
        
        // Pass results to parent component
        onPlacesFound && onPlacesFound(results.results);
      } else {
        console.log("No places found in this category");
        onPlacesFound && onPlacesFound([]);
      }
    } catch (error) {
      console.error("Error in showPlaces:", error);
      onPlacesFound && onPlacesFound([]);
    }
  };

  // Modify addResult function to store the graphic reference
  const addResult = (place) => {
    if (!esriModules || !placesLayerRef.current) return;
    
    try {
      const { Graphic } = esriModules;
      
      console.log("Adding place to map:", place.name);
      
      // Use place icon if available, otherwise use default marker
      const symbol = place.icon && place.icon.url ? {
        type: "picture-marker",
        url: place.icon.url,
        width: 20,
        height: 20
      } : {
        type: "simple-marker",
        color: [0, 120, 255],
        size: 10
      };
      
      const placeGraphic = new Graphic({
        geometry: place.location,
        symbol: symbol,
        attributes: {
          name: place.name,
          address: place.addresses && place.addresses[0] ? place.addresses[0].address : "No address",
          category: place.categories && place.categories[0] ? place.categories[0].label : "No category",
          distance: `${Number((place.distance / 1000).toFixed(1))} km`,
          placeId: place.placeId
        },
        popupTemplate: {
          title: "{name}",
          content: "{category} - {distance}<br>{address}"
        }
      });

      // Store the place ID with the graphic
      placeGraphic.placeId = place.placeId;
      placesLayerRef.current.add(placeGraphic);
      
      // Add click event listener to graphics
      if (view) {
        view.on("click", placesLayerRef.current, (event) => {
          // Check if a place feature was clicked
          if (event.graphic && event.graphic.placeId) {
            selectPlace(event.graphic.placeId);
          }
        });
      }
    } catch (error) {
      console.error("Error adding place to map:", error);
    }
  };

  // New function to handle place selection from map
  const selectPlace = async (placeId) => {
    if (!esriModules || !view) return;
    
    try {
      const { FetchPlaceParameters, places } = esriModules;
      
      // Find the place in the current results
      const placeGraphic = placesLayerRef.current.graphics.find(g => g.placeId === placeId);
      
      if (placeGraphic) {
        // Show popup for the place
        view.openPopup({
          location: placeGraphic.geometry,
          title: placeGraphic.attributes.name,
          content: placeGraphic.attributes.address
        });
        
        // Center the view on the place
        view.goTo(placeGraphic);
        
        // Set the selected place ID
        setSelectedPlaceId(placeId);
        
        // Fetch detailed place information
        const fetchPlaceParameters = new FetchPlaceParameters({
          placeId: placeId,
          requestedFields: ["all"]
        });
        
        const result = await places.fetchPlace(fetchPlaceParameters);
        
        // Pass the detailed place to the parent component
        if (onPlaceSelect && result.placeDetails) {
          onPlaceSelect(result.placeDetails);
        }
      }
    } catch (error) {
      console.error("Error selecting place:", error);
    }
  };

  // Add a useEffect to handle place selection from the panel
  useEffect(() => {
    if (selectedPlaceId && view && placesLayerRef.current) {
      // Find the graphic with the selected place ID
      const placeGraphic = placesLayerRef.current.graphics.find(g => g.placeId === selectedPlaceId);
      
      if (placeGraphic) {
        view.openPopup({
          location: placeGraphic.geometry,
          title: placeGraphic.attributes.name,
          content: placeGraphic.attributes.address
        });
        
        view.goTo(placeGraphic);
      }
    }
  }, [selectedPlaceId, view]);

  return <div ref={mapRef} style={{ height: '100%', width: '100%' }} />;
};

export default MapViewComponent;