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

  var url = "http://ec2-75-101-155-202.compute-1.amazonaws.com:6080/arcgis/rest/services/ASDITrackInformation/StreamServer";
  dom.byId("txtUrl").value = url;

  var map,
    streamLayer,
    flights = {},
    gtCnt = 0,
    ltCnt = 0,
    intervalTimer;

  map = new Map("mapDiv", {
    basemap: "topo",
    center: [-90, 40],
    zoom: 3
  });

  on(dom.byId("toggle-layer-button"), "click", toggleStreamLayer);

  //connectStreamLayer();

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

    streamLayer.on("message", function(evt){
      var id = evt.attributes.FltId,
        alt = evt.attributes.AltitudeFeet,
        oldalt = flights.hasOwnProperty(id) ? flights[id] : -1;
      if(oldalt < 0) {
        flights[id] = alt;
      }
      else {
        oldalt < 18000 ? ltCnt-- : gtCnt--;
      }

      if (alt > 18000) {
        gtCnt++;
      }
      else{
        ltCnt++
      }
    });
  }

  function removeStreamLayer(){
    if (streamLayer){
      map.removeLayer(streamLayer);
      streamLayer = null;
    }

    clearInterval(intervalTimer);

    gtCnt = 0;
    ltCnt = 0;
    updateCounts();
  }

  /*********************************************************
   *
   * Stream layer event handlers
   *
   *********************************************************/
  function processConnect(){
    dom.byId("toggle-layer-button").innerHTML = "Remove Stream Layer";
    domClass.replace("txtUrl", "connected", "disconnected");

    intervalTimer = setInterval(updateCounts, 1000);
  }

  function processDisconnect(){
    dom.byId("toggle-layer-button").innerHTML = "Add Stream Layer";
    domClass.replace("txtUrl", "disconnected", "connected");
  }

  function connectStreamLayer(){
    streamLayer = new StreamLayer(url, {
      purgeOptions: { displayCount: 10000 },
      outFields: ["*"],
      infoTemplate: new InfoTemplate("Attributes", "${*}")
    });
    map.addLayer(streamLayer);

    streamLayer.on("error", function(err){
      console.log("error: ", err);
    });

    streamLayer.on("message", function(evt){
      var id = evt.attributes.FltId,
        alt = evt.attributes.AltitudeFeet,
        oldalt = flights.hasOwnProperty(id) ? flights[id] : -1;
      if(oldalt < 0) {
        flights[id] = alt;
      }
      else {
        oldalt < 18000 ? ltCnt-- : gtCnt--;
      }

      if (alt > 18000) {
        gtCnt++;
      }
      else{
        ltCnt++
      }
    });

    intervalTimer = setInterval(updateCounts, 1000);
  }

  function updateCounts(){
    dom.byId("gt18000").innerHTML = gtCnt;
    dom.byId("lt18000").innerHTML = ltCnt;
    dom.byId("total").innerHTML = ltCnt + gtCnt;
  }
});