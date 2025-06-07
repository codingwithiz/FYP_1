require([
  "esri/map",
  "esri/layers/StreamLayer",
  "esri/InfoTemplate",

  "dojo/dom",
  "dojo/dom-class",
  "dojo/on",

  "dojo/domReady!"
], function(
  Map, StreamLayer, InfoTemplate,
  dom, domClass, on){

  var url = "http://ec2-75-101-155-202.compute-1.amazonaws.com:6080/arcgis/rest/services/GageStatusRenderer/StreamServer";
  var map,
    streamLayer;

  dom.byId("txtWsUrl").value = url;
  on(dom.byId("cmdToggleStream"), "click", toggleStreamLayer);

  map = new Map("mapDiv", {
    basemap: "topo",
    center: [-84.397, 33.766],
    zoom: 8
  });

  function toggleStreamLayer(){
    if (streamLayer){
      disconnectStreamLayer();
    }
    else{
      connectStreamLayer();
    }
  }

  function connectStreamLayer(){
    var url = dom.byId("txtWsUrl").value;

    streamLayer = new StreamLayer(url, {
      purgeOptions: { displayCount: 10000 },
      outFields: ["*"],
      infoTemplate: new InfoTemplate("Attributes", "${*}")
    });
    map.addLayer(streamLayer);

    streamLayer.on("connect", function(){
      dom.byId("cmdToggleStream").value = "Stop Stream";
      domClass.replace("txtWsUrl", "connected", "disconnected");
    });

    streamLayer.on("disconnect", function(){
      dom.byId("cmdToggleStream").value = "Start Stream";
      domClass.replace("txtWsUrl", "disconnected", "connected");
    });

    streamLayer.on("error", function(err){
      console.log("error: ", err);
    });
  }

  function disconnectStreamLayer(){
    if (streamLayer){
      map.removeLayer(streamLayer);
      streamLayer = null;
    }
  }
});