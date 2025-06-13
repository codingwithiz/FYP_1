import React, { useEffect, useRef, useState } from "react";
import "@esri/calcite-components/dist/calcite/calcite.css";
import { defineCustomElements } from "@esri/calcite-components/dist/loader";
import { loadModules } from "esri-loader";
import axios from "axios";

const MapViewComponent = ({
    activeCategory = "4d4b7105d754a06377d81259",
    onPlacesFound,
    recommendedPlace,
    onPlaceSelect,
    apiKey,
}) => {
    const mapRef = useRef(null);
    const bufferLayerRef = useRef(null);
    const placesLayerRef = useRef(null);

    const [view, setView] = useState(null);
    const [esriModules, setEsriModules] = useState(null);
    const [initialized, setInitialized] = useState(false);
    const [lastClickPoint, setLastClickPoint] = useState(null);
    const [selectedPlaceId, setSelectedPlaceId] = useState(null);

    useEffect(() => {
        defineCustomElements(window);

        let mapView = null;

        loadModules(
            [
                "esri/config",
                "esri/Map",
                "esri/views/MapView",
                "esri/rest/places",
                "esri/rest/support/FetchPlaceParameters",
                "esri/rest/support/PlacesQueryParameters",
                "esri/geometry/Circle",
                "esri/geometry/Point",
                "esri/Graphic",
                "esri/layers/GraphicsLayer",
                "esri/widgets/BasemapGallery",
                "esri/widgets/Expand",
                "esri/widgets/Search",
                "esri/widgets/Legend",
            ],
            { version: "4.32", css: true }
        )
            .then(
                ([
                    esriConfig,
                    Map,
                    MapView,
                    places,
                    FetchPlaceParameters,
                    PlacesQueryParameters,
                    Circle,
                    Point,
                    Graphic,
                    GraphicsLayer,
                    BasemapGallery,
                    Expand,
                    Search,
                    Legend,
                ]) => {
                    esriConfig.apiKey = apiKey;

                    setEsriModules({
                        Map,
                        MapView,
                        places,
                        FetchPlaceParameters,
                        PlacesQueryParameters,
                        Circle,
                        Point,
                        Graphic,
                        GraphicsLayer,
                        BasemapGallery,
                        Expand,
                        Search,
                        esriConfig,
                        Legend,
                    });

                    const bufferLayer = new GraphicsLayer({
                        id: "bufferLayer",
                    });
                    const placesLayer = new GraphicsLayer({
                        id: "placesLayer",
                    });

                    bufferLayerRef.current = bufferLayer;
                    placesLayerRef.current = placesLayer;

                    const map = new Map({
                        basemap: "streets-vector", // default basemap
                        layers: [bufferLayer, placesLayer],
                    });

                    mapView = new MapView({
                        container: mapRef.current,
                        map: map,
                        center: [-118.46651, 33.98621],
                        zoom: 13,
                    });

                    mapView.when(() => {
                        setView(mapView);
                        setInitialized(true);

                        // BasemapGallery widget with Expand
                        const basemapGallery = new BasemapGallery({
                            view: mapView,
                            source: {
                                portal: {
                                    url: "https://www.arcgis.com",
                                    useVectorBasemaps: true,
                                },
                            },
                        });

                        const expand = new Expand({
                            view: mapView,
                            content: basemapGallery,
                            expanded: false,
                        });

                        mapView.ui.add(expand, "top-right");

                        basemapGallery.watch("activeBasemap", (newBasemap) => {
                            if (newBasemap) {
                                mapView.map.basemap = newBasemap;
                            }
                        });

                        const searchWidget = new Search({
                            view: mapView,
                            resultGraphicEnabled: true,
                            popupEnabled: true,
                        });
                        mapView.ui.add(searchWidget, {
                            position: "top-left",
                            index: 0,
                        });

                        const legend = new Legend({
                            view: mapView,
                            layerInfos: [
                                {
                                    layer: placesLayer,
                                    title: "Locations",
                                },
                            ],
                        });

                        mapView.ui.add(legend, "bottom-left");
                        mapView.on("pointer-move", (event) => {
                            mapView.hitTest(event).then((response) => {
                                const graphic = response.results.find(
                                    (r) => r.graphic.layer === placesLayer
                                )?.graphic;

                                if (graphic && graphic.popupTemplate) {
                                    mapView.openPopup({
                                        location: graphic.geometry,
                                        title: graphic.popupTemplate.title,
                                        content: graphic.popupTemplate.content,
                                    });
                                }
                            });
                        });
                        // Map click handler
                        mapView.on("click", (event) => {
                            console.log("event map point: ", event.mapPoint);
                            setLastClickPoint(event.mapPoint);
                            clearGraphics();
                            showPlaces(event.mapPoint);
                        });
                    });
                }
            )
            .catch((err) => {
                console.error("Error loading ArcGIS modules:", err);
            });

        return () => {
            if (mapView) {
                mapView.destroy();
            }
        };
    }, [apiKey]);

    useEffect(() => {
        if (view && initialized && lastClickPoint) {
            clearGraphics();
            showPlaces(lastClickPoint);
        }
    }, [activeCategory, initialized, lastClickPoint]);

    const clearGraphics = () => {
        if (!bufferLayerRef.current || !placesLayerRef.current) return;

        bufferLayerRef.current.removeAll();
        placesLayerRef.current.removeAll();
    };

    const normalizeLongitude = (point) => {
        if (!esriModules || !esriModules.Point) {
            console.warn("esriModules.Point is not loaded yet");
            return point;
        }

        const normalizedX =
            ((((point.longitude + 180) % 360) + 360) % 360) - 180;

        return new esriModules.Point({
            latitude: point.latitude,
            longitude: normalizedX,
            spatialReference: point.spatialReference,
        });
    };

    const showPlaces = async (placePoint) => {
        const normalizedPoint = normalizeLongitude(placePoint);
        console.log("normalizedPoint: ", normalizedPoint);
        if (!esriModules || !bufferLayerRef.current || !placesLayerRef.current)
            return;

        const { Circle, Graphic, places, PlacesQueryParameters } = esriModules;

        try {
            const circleGeometry = new Circle({
                center: normalizedPoint,
                geodesic: true,
                numberOfPoints: 100,
                radius: 500,
                radiusUnit: "meters",
            });

            const circleGraphic = new Graphic({
                geometry: circleGeometry,
                symbol: {
                    type: "simple-fill",
                    style: "solid",
                    color: [3, 140, 255, 0.1],
                    outline: { width: 1, color: [3, 140, 255] },
                },
            });

            bufferLayerRef.current.add(circleGraphic);

            const pointGraphic = new Graphic({
                geometry: normalizedPoint,
                symbol: {
                    type: "simple-marker",
                    color: [255, 0, 0],
                    size: 8,
                },
            });
            bufferLayerRef.current.add(pointGraphic);

            const queryParams = new PlacesQueryParameters({
                categoryIds: [activeCategory],
                radius: 500,
                point: normalizedPoint,
                icon: "png",
            });

            const results = await places.queryPlacesNearPoint(queryParams);

            if (results.results && results.results.length > 0) {
                results.results.forEach(addResult);
                onPlacesFound && onPlacesFound(results.results);
            } else {
                onPlacesFound && onPlacesFound([]);
            }
        } catch (error) {
            console.error("Error in showPlaces:", error);
            onPlacesFound && onPlacesFound([]);
        }
    };

    const addResult = (place) => {
        if (!esriModules || !placesLayerRef.current) return;

        const { Graphic } = esriModules;

        const symbol =
            place.icon && place.icon.url
                ? {
                      type: "picture-marker",
                      url: place.icon.url,
                      width: 20,
                      height: 20,
                  }
                : {
                      type: "simple-marker",
                      color: [0, 120, 255],
                      size: 10,
                  };

        const placeGraphic = new Graphic({
            geometry: place.location,
            symbol: symbol,
            attributes: {
                name: place.name,
                address:
                    place.addresses && place.addresses[0]
                        ? place.addresses[0].address
                        : "No address",
                category:
                    place.categories && place.categories[0]
                        ? place.categories[0].label
                        : "No category",
                distance: `${Number((place.distance / 1000).toFixed(1))} km`,
                placeId: place.placeId,
            },
            popupTemplate: {
                title: "{name}",
                content: "{category} - {distance}<br>{address}",
            },
        });

        placeGraphic.placeId = place.placeId;
        placesLayerRef.current.add(placeGraphic);

        // Add click event listener on placesLayer only once
        if (view && !placesLayerRef.current._clickListenerAdded) {
            placesLayerRef.current._clickListenerAdded = true;
            view.on("click", placesLayerRef.current, (event) => {
                if (event.graphic && event.graphic.placeId) {
                    selectPlace(event.graphic.placeId);
                }
            });
        }
    };

    const selectPlace = async (placeId) => {
        if (!esriModules || !view) return;

        const { FetchPlaceParameters, places } = esriModules;

        try {
            const placeGraphic = placesLayerRef.current.graphics.find(
                (g) => g.placeId === placeId
            );

            if (placeGraphic) {
                view.openPopup({
                    location: placeGraphic.geometry,
                    title: placeGraphic.attributes.name,
                    content: placeGraphic.attributes.address,
                });

                view.goTo(placeGraphic);
                setSelectedPlaceId(placeId);

                const fetchParams = new FetchPlaceParameters({
                    placeId: placeId,
                    requestedFields: ["all"],
                });

                const result = await places.fetchPlace(fetchParams);

                if (onPlaceSelect && result.placeDetails) {
                    onPlaceSelect(result.placeDetails);
                }
            }
        } catch (error) {
            console.error("Error selecting place:", error);
        }
    };

    const handleSuitabilityRequest = async () => {
        try {
            const response = await axios.post(
                "http://localhost:3001/api/suitability",
                {
                    location: "Universiti Malaya", // or lastClickPoint if geocoded
                    category: "hospitals",
                    radius: 1000,
                }
            );

            const results = response.data;
        
            addSuitabilityMarkers(results);
        } catch (error) {
            console.error("Suitability API call failed:", error);
        }
    };

    const addSuitabilityMarkers = (locations) => {
        if (!esriModules || !placesLayerRef.current) return;

        const { Graphic, Point } = esriModules;
        placesLayerRef.current.removeAll(); // Optional: Clear previous

        locations.recommended_locations.forEach(({ lat, lon, score, reason }) => {
            const point = new Point({ latitude: lat, longitude: lon });

            const marker = new Graphic({
                geometry: point,
                symbol: {
                    type: "simple-marker",
                    style: "circle",
                    color: [0, 255, 100, 0.8],
                    size: 12,
                    outline: {
                        color: [0, 100, 50],
                        width: 1,
                    },
                },
                attributes: {
                    score: score,
                },
                popupTemplate: {
                    title: "Recommended Location",
                    content: `Score: ${score}<br>Reason: ${reason}`,
                },
            });

            placesLayerRef.current.add(marker);
        });

        if (locations.reference_point) {
            console.log("Adding reference point: ", locations.reference_point);
            const refPoint = new Point({
                latitude: locations.reference_point.lat,
                longitude: locations.reference_point.lon,
            });

            const refMarker = new Graphic({
                geometry: refPoint,
                symbol: {
                    type: "simple-marker",
                    style: "cross",
                    color: [0, 120, 255], // bright blue
                    size: 14,
                    outline: {
                        color: [0, 80, 200],
                        width: 4,
                    },
                },
                attributes: {
                    name: "Reference Point",
                },
                popupTemplate: {
                    title: "Reference Point",
                    content: `Address: ${locations.reference_point.address}`,
                },
            });

            placesLayerRef.current.add(refMarker);
        }

        if (locations.recommended_locations.length > 0 && view && esriModules?.Point) {
    const { Point } = esriModules;

    const targetPoints = locations.recommended_locations.map(
        ({ lat, lon }) =>
            new Point({
                latitude: lat,
                longitude: lon,
            })
    );

    view.goTo(targetPoints, { zoom: 15 }).catch((error) => {
        console.error("view.goTo failed:", error);
    });
}
    };

    useEffect(() => {
        
        if (recommendedPlace) {
            addSuitabilityMarkers(recommendedPlace);
        }
        if (selectedPlaceId && view && placesLayerRef.current) {
            const placeGraphic = placesLayerRef.current.graphics.find(
                (g) => g.placeId === selectedPlaceId
            );

            console.log("placeGraphic: ", placeGraphic);
            
            if (placeGraphic) {
                view.openPopup({
                    location: placeGraphic.geometry,
                    title: placeGraphic.attributes.name,
                    content: placeGraphic.attributes.address,
                });

                view.goTo(placeGraphic);
            }
            
            
        }
        
    }, [selectedPlaceId, view, recommendedPlace]);

    return (
        <>
            <button
                onClick={handleSuitabilityRequest}
                style={{ position: "absolute", zIndex: 10 }}
            >
                Run Suitability Analysis
            </button>
            <div ref={mapRef} style={{ height: "100%", width: "100%" }} />
        </>
    );
};

export default MapViewComponent;
