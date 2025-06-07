require([
  "esri/map",

  "esri/InfoTemplate",
  "esri/layers/StreamLayer",

  "dojo/dom",
  "dojo/dom-class",
  "dojo/on",
  "dojo/domReady!"
], function(
  Map,
  InfoTemplate, StreamLayer,
  dom, domClass, on){
  var url = "http://ec2-75-101-155-202.compute-1.amazonaws.com:6080/arcgis/rest/services/ASDITrackInformation/StreamServer";

  dom.byId("txtUrl").value = url;

  var streamLayer;

  //connect click events to UI buttons
  on(dom.byId("toggle-layer-button"), "click", toggleStreamLayer);

  var map = new Map("mapDiv", {
    basemap: "topo",
    center: [-90, 40],
    zoom: 3
  });

  /**********************************************************************************************
   *
   * Functions to add and remove Stream Layer
   *
   **********************************************************************************************/
  function toggleStreamLayer(){
    if(streamLayer){
      removeStreamLayer();
    }
    else{
      addStreamLayer();
    }
  }
  function addStreamLayer(){
    //url to stream service
    var svcUrl = dom.byId("txtUrl").value;

    //construct Stream Layer
    streamLayer = new StreamLayer(svcUrl, {
      purgeOptions: {
        displayCount: 10000
      },
      infoTemplate: new InfoTemplate("Attributes", "${*}")
    });

    streamLayer.on("connect", processConnect);
    streamLayer.on("disconnect", processDisconnect);

    streamLayer.on("error", function(err){
      console.log("error: ", err);
    });

    map.addLayer(streamLayer);
  }

  function removeStreamLayer(){
    if (streamLayer){
      map.removeLayer(streamLayer);
      streamLayer = null;
    }
  }

  /*********************************************************
   *
   * Stream layer event handlers
   *
   *********************************************************/
  function processConnect(){
    dom.byId("toggle-layer-button").innerHTML = "Remove Stream Layer";
    domClass.replace("txtUrl", "connected", "disconnected");
  }

  function processDisconnect(){
    dom.byId("toggle-layer-button").innerHTML = "Add Stream Layer";
    domClass.replace("txtUrl", "disconnected", "connected");
  }
});