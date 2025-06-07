require([
  "esri/Map",
  "esri/views/MapView",

  "esri/layers/StreamLayer",

  "esri/PopupTemplate",

  "dojo/on",
  "dojo/dom",
  "dojo/dom-class",
  "dojo/domReady!"
], function(
  Map, MapView,
  StreamLayer,
  PopupTemplate,
  on, dom, domClass
) {
  dom.byId("txtUrl").value = "http://ec2-75-101-155-202.compute-1.amazonaws.com:6080/arcgis/rest/services/ASDITrackInformation/StreamServer";

  on(dom.byId("toggle-layer-button"), "click", toggleStreamLayer);

  var slayer,
    map,
    mapView;

  map = new Map({
    basemap: "gray"
  });

  mapView = new MapView({
    map: map,
    container: "mapDiv",
    center: [-90, 40],
    zoom: 3
  });

  handleConnectionStatus("disconnected");

  function toggleStreamLayer() {
    if (slayer) {
      console.log("remove layer");
      removeLayer();
    }
    else {
      console.log("add layer");
      addLayer();
    }
  }

  function addLayer() {
    slayer = new StreamLayer({
      url: dom.byId("txtUrl").value
    });

    map.add(slayer);

    //handleConnectionStatus("connected");

    mapView.whenLayerView(slayer)
      .then(function(e) {
        //console.log("layer view resolved: ", e);
        e.watch("connectionStatus", handleConnectionStatus);
      })
      .otherwise(function(err) {
        console.log("error making layer view: ", err);
      });
  }

  function removeLayer() {
    map.remove(slayer);
    slayer = null;
    handleConnectionStatus("disconnected");
  }

  function handleConnectionStatus(status) {
    console.log("connection status: ", status);
    var connected = (status === "connected");

    var classToAdd = connected ? "connected" :
      "disconnected";

    var classToRemove = connected ? "disconnected" :
      "connected";

    var toggleLayerText = connected ? "Remove Layer" :
      "Add Stream Layer";

    domClass.replace("txtUrl", classToAdd, classToRemove);

    dom.byId("toggle-layer-button").innerHTML = toggleLayerText;
  }

});