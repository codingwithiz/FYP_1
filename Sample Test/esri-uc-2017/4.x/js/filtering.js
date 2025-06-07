require([
  "esri/Map",
  "esri/views/MapView",

  "esri/layers/StreamLayer",

  "esri/PopupTemplate",

  "esri/Graphic",

  "esri/symbols/SimpleFillSymbol",
  "esri/symbols/SimpleLineSymbol",

  "4.x/support/DrawTools",

  "dojo/on",
  "dojo/dom",
  "dojo/dom-class",
  "dojo/query",
  "dojo/domReady!"
], function
  (
    Map, MapView,
    StreamLayer,
    PopupTemplate,
    Graphic,
    SimpleFillSymbol, SimpleLineSymbol,
    DrawTools,
    on, dom, domClass, query) {

  var attributeFilter = null;
  var spatialFilter = null;

  var url = "http://ec2-75-101-155-202.compute-1.amazonaws.com:6080/arcgis/rest/services/ASDITrackInformation/StreamServer";

  var bboxSymbol = new SimpleFillSymbol({
    style: "none",
    outline: {
      color: "#ff0000",
      style: "solid",
      width: "1px"
    }
  });
  var streamLayer,
    streamLayerView,
    drawTools;

  var map = new Map({
    basemap: "gray"
  });

  var mapView = new MapView({
    container: "mapDiv",
    map: map,
    center: [-90, 40],
    zoom: 3
  });

  mapView
    .then(function(response) {
      drawTools = new DrawTools({
        view: mapView,
        showTooltips: true
      });
    });

  var template = {
    title: "Flight ID: {FltId",
    content: "Altitude (Feet): {AltitudeFeet}"
  };

  dom.byId("txtUrl").value = url;

  //connect click events to UI buttons
  on(dom.byId("toggle-layer-button"), "click", toggleStreamLayer);

  on(query("[data-spatial-action]"), "click", handleSpatialClick);
  on(query("[data-where-action]"), "click", handleWhereClick);

  /**********************************************************************************************
   *
   * Functions to add and remove Stream Layer
   *
   **********************************************************************************************/
  function toggleStreamLayer() {
    if (streamLayer) {
      removeStreamLayer();
    }
    else {
      addStreamLayer();
    }
  }

  function addStreamLayer() {
    //url to stream service
    var svcUrl = dom.byId("txtUrl").value;

    var layerProps = {
      url: svcUrl,
      purgeOptions: {
        displayCount: 10000
      },
      popupTemplate: template
    };

    if (attributeFilter || spatialFilter) {
      layerProps.filter = {
        geometry: spatialFilter,
        where: attributeFilter
      };
    }

    //construct Stream Layer
    streamLayer = new StreamLayer(layerProps);

    map.add(streamLayer);

    mapView.whenLayerView(streamLayer)
      .then(function(layerView) {
        streamLayerView = layerView;
        layerView.watch("connectionStatus", handleConnectionStatus);
      })
      .otherwise(function(err) {
        console.log("Error adding stream layer", err);
      });
  }

  function removeStreamLayer() {
    if (streamLayer) {
      map.remove(streamLayer);

      streamLayer = null;
      streamLayerView = null;

      handleConnectionStatus("disconnected");
    }
  }

  /*********************************************************
   *
   * Stream layer event handlers
   *
   *********************************************************/

  function handleConnectionStatus(status) {
    var connected = (status === "connected");

    if (connected && streamLayerView.filter.where) {
      dom.byId("current-filter").innerHTML = streamLayerView.filter.where;
    }

    var classToAdd = connected ? "connected" :
      "disconnected";

    var classToRemove = connected ? "disconnected" :
      "connected";

    var toggleLayerText = connected ? "Remove Layer" :
      "Add Stream Layer";

    domClass.replace("txtUrl", classToAdd, classToRemove);

    dom.byId("toggle-layer-button").innerHTML = toggleLayerText;
  }

  /*********************************************************
   *
   * Filtering
   *
   *********************************************************/
  function handleWhereClick(evt) {
    var action = evt.target.getAttribute("data-where-action");
    var newVal;

    if (action === "add") {
      newVal = dom.byId("txtWhere").value;
    }
    else {
      newVal = null;
    }

    updateWhere(newVal);
  }

  function handleSpatialClick(evt) {
    var action = evt.target.getAttribute("data-spatial-action");

    if (action === "add") {
      drawTools.activate("extent");

      var drawEndHandler = drawTools.on("draw-complete", function(e) {
        var bbox = e.geometry;

        mapView.graphics.add(new Graphic({
          symbol: bboxSymbol,
          geometry: bbox
        }));

        drawTools.deactivate();
        drawEndHandler.remove();

        updateGeometry(bbox);
      });
    }
    else {
      mapView.graphics.removeAll();
      updateGeometry(null);
    }
  }

  //-----------------------
  // Attribute Filter
  //-----------------------

  function updateWhere(value) {
    if (!streamLayer) {
      attributeFilter = value;
    }
    else {
      dom.byId("filter-status").innerHTML = "";
      streamLayerView.updateFilter({
        where: value
      })
        .then(function(response) {
          streamLayerView.graphics.removeAll();

          attributeFilter = response.filter.where;
          dom.byId("current-filter").innerHTML = response.filter.where;

          var statusDiv = dom.byId("filter-status");

          domClass.remove(statusDiv, "disconnected");
          domClass.add(statusDiv, "connected");
          statusDiv.innerHTML = "Filter updated";
        })
        .otherwise(function(err) {
          console.log("filter error: ", err.message);

          var statusDiv = dom.byId("filter-status");

          domClass.remove(statusDiv, "connected");
          domClass.add(statusDiv, "disconnected");
          statusDiv.innerHTML = err.message;
        });
    }
  }

  //-----------------------
  // Spatial Filter
  //-----------------------

  function updateGeometry(extent) {
    if (!streamLayer) {
      spatialFilter = extent;
    }
    else {
      streamLayerView.updateFilter({
        geometry: extent
      })
        .then(function(response) {
          streamLayerView.graphics.removeAll();
        })
    }
  }


});