require([
  "esri/Map",
  "esri/views/SceneView",

  "esri/layers/StreamLayer",

  "esri/PopupTemplate",

  "esri/renderers/SimpleRenderer",
  "esri/symbols/PointSymbol3D",
  "esri/symbols/IconSymbol3DLayer",

  "dojo/on",
  "dojo/dom",
  "dojo/dom-class",
  "dojo/domReady!"
], function(Map, SceneView,
            StreamLayer,
            PopupTemplate,
            SimpleRenderer, PointSymbol3D, IconSymbol3DLayer,
            on, dom, domClass){

  var slayer;

  dom.byId("txtUrl").value = "http://ec2-75-101-155-202.compute-1.amazonaws.com:6080/arcgis/rest/services/WorldSatellites/StreamServer";

  var map = new Map({
    basemap: "satellite"
  });

  var sceneView = new SceneView({
    container: "mapDiv",
    map: map
  });

  on(dom.byId("cmdConnect"), "click", connect);
  on(dom.byId("cmdRemove"), "click", removeLayer);

  function connect(){
    //Create the PopupTemplate
    var template = {
      title: "Name: {SatelliteName}",
      content: "Altitude: {AltitudeMeters}<br>Inclination: {Inclination}",
      fieldInfos: [{
        fieldName: "AltitudeMeters",
        format: {
          digitSeparator: true,
          places: 0
        }
      },
        {
          fieldName: "Inclination",
          format: {
            digitSeparator: true,
            places: 2
          }
        }]};

    // Create iconSymbol and add to renderer
    var iconSymbol = new PointSymbol3D({
      symbolLayers: [new IconSymbol3DLayer({
        size: 14,
        resource: {
          primitive: "square"
        },
        material: {
          color: "orange"
        }
      })]
    });

    var objectSymbolRenderer = new SimpleRenderer({
      symbol: iconSymbol
    });

    slayer = new StreamLayer({
      url: dom.byId("txtUrl").value,
      popupTemplate: template,
      purgeOptions: {
        displayCount: 10000
      },
      renderer: objectSymbolRenderer
    });

    map.add(slayer);

    sceneView.whenLayerView(slayer)
      .then(function(layerView) {
        layerView.watch("connectionStatus", handleConnectionStatus);
      });
  }

  function removeLayer(){
    if (slayer) {
      map.remove(slayer);
      slayer = null;
      handleConnectionStatus("disconnected");
    }
  }

  function handleConnectionStatus(status) {
    var connected = status === "connected";
    var classToAdd = "connected";
    var classToRemove = "disconnected";

    if (!connected) {
      classToAdd = "disconnected";
      classToRemove = "connected"
    }

    domClass.replace("txtUrl", classToAdd, classToRemove);

    dom.byId("cmdConnect").disabled = connected;
    dom.byId("cmdRemove").disabled = !connected;

  }
});