import React, { useEffect, useRef, useState } from 'react';
import '@esri/calcite-components/dist/calcite/calcite.css';
import { defineCustomElements } from '@esri/calcite-components/dist/loader';
import { loadModules } from 'esri-loader';

const MapViewComponent = ({ activeCategory = "4d4b7105d754a06377d81259", onPlacesFound }) => {
  const mapRef = useRef(null);
  const [view, setView] = useState(null);
  const [esriModules, setEsriModules] = useState(null);
  const bufferLayerRef = useRef(null);
  const placesLayerRef = useRef(null);

  useEffect(() => {
    defineCustomElements(window);

    let mapView = null;

    // Specify version 4.32 which includes the Places service
    loadModules([
      "esri/Map",
      "esri/views/MapView",
      "esri/geometry/Circle",
      "esri/Graphic",
      "esri/layers/GraphicsLayer",
      "esri/config",
      "esri/rest/places",
      "esri/rest/support/FetchPlaceParameters",
      "esri/rest/support/PlacesQueryParameters"
    ], { 
      version: "4.32",
      css: true 
    }).then(([
      Map, MapView, Circle, Graphic, GraphicsLayer, esriConfig, places, FetchPlaceParameters, PlacesQueryParameters
    ]) => {
      // Store modules for use in other functions
      setEsriModules({
        Map, MapView, Circle, Graphic, GraphicsLayer, esriConfig, 
        places, FetchPlaceParameters, PlacesQueryParameters
      });

      esriConfig.apiKey = "AAPTxy8BH1VEsoebNVZXo8HurEVRE-FJ8d3j3ykWlfHRt7WH51Izm4ty5j3rsTZEnY8a5mmgR6TL7Vs5JMOdMWi40lLPEvxQ1JZgHYXSmMLJl6OPV6lBv_suBJSEkwbLqtaedGXDvrLd_1H3wdq8zQ6Y2cahlF6_a6neEU-17Fd-2bfyJA9qOxFwsNYQomE_tYyg8q6IWgE_Z1o-VcSoBGFepsuT-0ouI4qYsUd1BaAVP-U.AT1_aU0cHYIh";

      // Create layers and store references
      const bufferLayer = new GraphicsLayer();
      const placesLayer = new GraphicsLayer();
      bufferLayerRef.current = bufferLayer;
      placesLayerRef.current = placesLayer;

      const map = new Map({
        basemap: "arcgis/navigation",
        layers: [bufferLayer, placesLayer]
      });

      mapView = new MapView({
        container: mapRef.current,
        map: map,
        center: [-118.46651, 33.98621],
        zoom: 13
      });

      setView(mapView);

      // Setup click handler
      mapView.on("click", (event) => {
        clearGraphics();
        showPlaces(event.mapPoint);
      });
    }).catch(err => {
      console.error("Error loading ArcGIS modules:", err);
    });

    return () => {
      if (mapView) {
        mapView.destroy();
      }
    };
  }, []);

  const clearGraphics = () => {
    if (bufferLayerRef.current && placesLayerRef.current) {
      bufferLayerRef.current.removeAll();
      placesLayerRef.current.removeAll();
    }
  };

  const showPlaces = async (placePoint) => {
    if (!esriModules || !bufferLayerRef.current || !placesLayerRef.current) return;
    
    const { Circle, Graphic, places, PlacesQueryParameters } = esriModules;

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

    const placesQueryParameters = new PlacesQueryParameters({
      categoryIds: [activeCategory],
      radius: 500,
      point: placePoint,
      icon: "png"
    });

    try {
      const results = await places.queryPlacesNearPoint(placesQueryParameters);
      tabulatePlaces(results);
      
      // Pass results to parent component if callback provided
      if (onPlacesFound && results.results) {
        onPlacesFound(results.results);
      }
    } catch (error) {
      console.error("Error querying places:", error);
    }
  };

  const tabulatePlaces = (results) => {
    if (!results || !results.results) return;
    results.results.forEach(addResult);
  };

  const addResult = async (place) => {
    if (!esriModules || !placesLayerRef.current) return;
    
    const { Graphic } = esriModules;
    
    const placeGraphic = new Graphic({
      geometry: place.location,
      symbol: {
        type: "picture-marker",
        url: place.icon.url,
        width: 15,
        height: 15
      }
    });

    placesLayerRef.current.add(placeGraphic);
  };

  return <div ref={mapRef} style={{ height: '100vh', width: '100%' }} />;
};

export default MapViewComponent;