require([
  "esri/map",
  "esri/layers/StreamLayer",

  "esri/toolbars/draw",

  "esri/InfoTemplate",

  "esri/graphic",

  "esri/symbols/SimpleFillSymbol",
  "esri/symbols/SimpleLineSymbol",

  "dojo/_base/Color",
  "dojo/on",
  "dojo/dom",
  "dojo/dom-class",
  "dojo/domReady!"
], function(Map, StreamLayer,
            Draw,
            InfoTemplate,
            Graphic,
            SimpleFillSymbol, SimpleLineSymbol,
            Color, on, dom, domClass) {

  var streamLayer;

  var url = "http://ec2-75-101-155-202.compute-1.amazonaws.com:6080/arcgis/rest/services/ASDITrackInformation/StreamServer";

  var map = new Map("mapDiv", {
    basemap: "gray",
    center: [-90, 40],
    zoom: 3
  });

  var drawTools = new Draw(map);

  dom.byId("txtUrl").value = url;

  //connect click events to UI buttons
  on(dom.byId("toggle-layer-button"), "click", toggleStreamLayer);
  on(dom.byId("cmdToggleSpatialFilter"), "click", toggleSpatialFilter);
  on(dom.byId("cmdToggleWhereFilter"), "click", toggleWhereFilter);

  on(drawTools, "draw-end", function(evt){
    drawTools.deactivate();
    setSpatialFilter(evt.geometry);
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

    streamLayer.on("filter-change", processFilterChange);

    streamLayer.on("error", function(err){
      console.log("error: ", err);
    });

    map.addLayer(streamLayer);
  }

  function removeStreamLayer(){
    if (streamLayer){
      map.removeLayer(streamLayer);
      streamLayer = null;
      map.graphics.clear();
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
    dom.byId("cmdToggleSpatialFilter").value = "Draw Extent";
    dom.byId("cmdToggleSpatialFilter").disabled = false;
    dom.byId("cmdToggleWhereFilter").value = "Apply Where";
    dom.byId("cmdToggleWhereFilter").disabled = false;
  }

  function processDisconnect(){
    dom.byId("toggle-layer-button").innerHTML = "Add Stream Layer";
    domClass.replace("txtUrl", "disconnected", "connected");
    dom.byId("cmdToggleSpatialFilter").disabled = true;
    dom.byId("cmdToggleWhereFilter").disabled = true;
  }

  function processFilterChange(evt){
    console.log("filter-change: ", evt);

    if(evt.error){
      console.log("Could not set filter: ", evt.error);
      return;
    }

    //clear layer graphics
    streamLayer.clear();

    //the event contains a filter property that is the current filter set on the service
    //update map graphic to show current spatial filter
    var filter = evt.filter || {};
    var bbox = filter.geometry;

    map.graphics.clear();
    if(bbox){
      map.graphics.add(new Graphic(bbox,
        new SimpleFillSymbol(SimpleFillSymbol.STYLE_NULL,
          new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
            new Color( [5, 112, 176] ), 2),
          new Color( [5, 112, 176, 0] ))));
    }
    dom.byId("cmdToggleSpatialFilter").value = bbox ?
      "Clear Spatial Filter" :
      "Draw Extent";

    dom.byId("cmdToggleWhereFilter").value = filter.where ?
      "Clear Where" :
      "Apply Where";
  }

  /**********************************************************************************************
   *
   * Functions to set and clear spatial filter
   *
   **********************************************************************************************/
  function toggleSpatialFilter(){
    if(!streamLayer){
      return;
    }

    var currentSpatialFilter = streamLayer.getGeometryDefinition();
    if (!currentSpatialFilter){
      drawTools.activate(Draw.EXTENT);
    }
    else{
      setSpatialFilter(null);
      dom.byId("toggle-layer-button").value = "Draw Extent";
    }
  }

  //Set spatial filter on stream layer. Setting to null clears filter
  function setSpatialFilter(bbox){
    if (streamLayer){
      streamLayer.setGeometryDefinition(bbox);
    }
  }

  function toggleWhereFilter(){
    if(!streamLayer){
      return;
    }

    var currentWhereFilter = streamLayer.getDefinitionExpression();

    if (!currentWhereFilter){
      var where = dom.byId("txtWhere").value;
      if(!where){
        return;
      }
      streamLayer.setDefinitionExpression(where);
    }
    else{
      streamLayer.setDefinitionExpression(null);
    }
  }
});