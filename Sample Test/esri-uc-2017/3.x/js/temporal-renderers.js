require([
  "esri/InfoTemplate",

  "esri/map",
  "esri/layers/StreamLayer",

  "esri/symbols/SimpleFillSymbol",
  "esri/symbols/SimpleLineSymbol",
  "esri/symbols/SimpleMarkerSymbol",

  "esri/renderers/SimpleRenderer",
  "esri/renderers/TemporalRenderer",

  "dojo/_base/Color",
  "dojo/on",
  "dojo/dom",
  "dojo/dom-class",
  "dojo/domReady!"
], function(InfoTemplate,
            Map, StreamLayer,
            SimpleFillSymbol, SimpleLineSymbol, SimpleMarkerSymbol,
            SimpleRenderer, TemporalRenderer,
            Color,
            on, dom, domClass){

  var url = "http://ec2-75-101-155-202.compute-1.amazonaws.com:6080/arcgis/rest/services/ASDITrackInformation/StreamServer";
  var streamLayer;

  dom.byId("txtWsUrl").value = url;

  var map = new Map("mapDiv",{
    basemap: "dark-gray",
    center: [-96, 36.428],
    zoom: 4
  });

  on(dom.byId("toggle-layer-button"), "click", toggleStreamLayer);

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
      purgeOptions: {
        displayCount: 1000
      },
      maximumTrackPoints: 5,
      infoTemplate: new InfoTemplate("Attributes", "${*}")
    });

    var renderer = makeTemporalRenderer("esriGeometryPoint", true);

    streamLayer.setRenderer(renderer);

    streamLayer.on("connect", function(){
      dom.byId("toggle-layer-button").innerHTML = "Remove Stream Layer";
      domClass.replace("txtWsUrl", "connected", "disconnected");
    });

    streamLayer.on("disconnect", function(){
      dom.byId("toggle-layer-button").innerHTML = "Add Stream Layer";
      domClass.replace("txtWsUrl", "disconnected", "connected");
    });

    streamLayer.on("error", function(err){
      console.log("error: ", err);
    });

    map.addLayer(streamLayer);
  }

  function disconnectStreamLayer(){
    if (streamLayer){
      map.removeLayer(streamLayer);
      streamLayer = null;
    }
  }

  function makeTemporalRenderer(){
    var fillcolor = new Color([5, 112, 176, 0.8]);
    var outline = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
      new Color([255, 255, 255]),
      1);

    var curPosSymbol = new SimpleMarkerSymbol(SimpleMarkerSymbol.STYLE_CIRCLE, 14, outline, fillcolor),
      curPositionRenderer = new SimpleRenderer(curPosSymbol);

    var posSymbol = new SimpleMarkerSymbol(SimpleMarkerSymbol.STYLE_CIRCLE, 8, outline, fillcolor),
      positionRenderer = new SimpleRenderer(posSymbol);

    var lineSymbol = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([255, 255, 0]), 1.5),
      trackRenderer = new SimpleRenderer(lineSymbol);

    return new TemporalRenderer(positionRenderer, curPositionRenderer, trackRenderer);
  }
});