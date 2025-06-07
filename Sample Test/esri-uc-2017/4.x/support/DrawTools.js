/**
 * A set of draw tools that can be used until the draw tools are implemented in the 4.x api.
 * Currently only point and extent is supported.
 */
define([
  "dojo/_base/declare",

  "dojo/Evented",
  "dojo/on",

  "dojo/dom-construct",
  "dojo/dom-style",

  "dojo/keys",

  "esri/Graphic",

  "esri/geometry/Point",
  "esri/geometry/Extent",

  "esri/symbols/SimpleFillSymbol"
], function(
  declare,
  Evented, on,
  domConstruct, domStyle,
  keys,
  Graphic,
  Point, Extent,
  SimpleFillSymbol
)
{
  var DrawTools = declare([Evented], {
    /**
     * Creates new DrawTools. The options object can have these properties:
     * * view: MapView - The map view to attach the tools to. Required
     * * showTooltips: boolean. Flag to show tooltips that follow mouse. Default is false
     * @param {Object} options
     */
    constructor: function(options) {
      if (!options || !options.view) {
        throw new Error("view is a required options property");
      }

      this._view = options.view;

      this._showTooltips = false;
      this._tooltipOffset = 15;

      if (options.hasOwnProperty("showTooltips")) {
        this._showTooltips = options.showTooltips;
      }

      if (options.hasOwnProperty("tooltipOffset")) {
        this._tooltipOffset = options.tooltipOffset;
      }

      this._mapMouseHandlers = [];
      this._drawMouseHandlers = [];

      this._geometryType = null;

      this._drawGraphic = null;

      this._drawSymbol = null;
    },

    /***************************************
     *
     * Public Methods
     *
     ***************************************/

    /**
     * Activates the tool to draw the specified geometryType.
     * geometryType can be:
     * * point
     * * extent - Click and drag to draw extent. Mouse up ends drawing
     * @param {String} geometryType
     */
    activate: function(geometryType) {
      //first deactivate in case the tool was activated before with a different geometry type
      //  and never deactivated
      this.deactivate();

      //Attach events to the view that are needed to draw the geometry
      if (geometryType === "point") {
        this._mapMouseHandlers.push(on(this._view, "click", this._handleClick.bind(this)));
      }
      else if (geometryType === "extent") {
        this._mapMouseHandlers.push(on(this._view, "drag", this._handleDrag.bind(this)));
        this._drawSymbol = this._extentSymbol;
      }
      else {
        this._geometryType = null;
        throw new Error("only point and extent draw tools are enabled");
      }

      if (this._mapMouseHandlers.length) {
        this._geometryType = geometryType;
        this._mapMouseHandlers.push(on(window, "keydown", this._handleKeyDown.bind(this)));

        this._toggleToolTip(true);
      }
    },

    deactivate: function() {
      //Remove the mouse events added by the draw tool
      if (this._mapMouseHandlers && this._mapMouseHandlers.length) {
        for (var i = this._mapMouseHandlers.length - 1; i >= 0; i--) {
          this._mapMouseHandlers.pop().remove();
        }
      }

      this._toggleToolTip(false);

      this._drawGraphic = null;
      this._drawSymbol = null;
    },


    /***************************************
     *
     * Events
     *
     ***************************************/

    /**
     * draw-complete
     *     emitted when the draw is finished
     * @returns {geometry} The geometry that was drawn. It is in the map spatial reference
     *
     */


    /***************************************
     *
     * Private Methods
     *
     ***************************************/

    /********************************
     * Map Mouse Events for drawing
     ********************************/

    /**
     * The view click handler
     * @param {MouseEvent} e
     * @private
     */
    _handleClick: function(e) {
      e.stopPropagation();

      this._hideTooltip();

      if (this._geometryType === "point") {
        this.emit("draw-complete", {
          geometry: e.mapPoint
        });
      }
    },

    //TODO Use this handler to finish polygon and line drawing when implemented
    /**
     * The view double click handler
     * @param {MouseEvent} e
     * @private
     */
    _handleDoubleClick: function(e) {
      console.log("double click: ", e);
    },

    /**
     * The view drag handler
     * @param {MouseEvent} e
     * @private
     */
    _handleDrag: function(e) {
      e.stopPropagation();

      var extent;

      if (e.action === "start") {
        this._hideTooltip();

        this._drawGraphic = new Graphic({
          symbol: this._drawSymbol
        });
        this._view.graphics.add(this._drawGraphic);
      }

      if (e.action === "end" || e.action === "update") {
        extent = this._makeMapExtentFromDragEvent(e);
      }

      if (e.action === "end") {
        this._view.graphics.remove(this._drawGraphic);
        this.emit("draw-complete", {
          geometry: extent
        });
      }

      if (e.action === "update") {
        if (this._drawGraphic) {
         this._view.graphics.remove(this._drawGraphic);
         }

        if (extent) {
          this._drawGraphic = new Graphic({
            symbol: this._drawSymbol,
            geometry: extent
          });

          this._view.graphics.add(this._drawGraphic);
        }
      }
    },

    /**
     * The view key down handler. ESCAPE cancels the current draw session
     * @param {MouseEvent} e
     * @private
     */
    _handleKeyDown: function(e) {
      if (e.keyCode === keys.ESCAPE) {
        this.deactivate();

        this.emit("draw-complete", {
          geometry: null
        });
      }
    },

    /**
     * Makes an extent geometry from a mouse drag event. The extent geometry is in the map spatial reference
     * @param {event} e A mouse drag event
     * @returns {object} An extent geometry in map coordinates
     * @private
     */
    _makeMapExtentFromDragEvent: function(e) {
      var start = e.origin;

      var end = {
        x: e.x,
        y: e.y
      };

      var coords = this._makeScreenExtentFromScreenPoints(start, end);

      var llMapPoint,
        urMapPoint,
        extent;

      if (coords && coords.ll) {
        llMapPoint = this._view.toMap(coords.ll);
        urMapPoint = this._view.toMap(coords.ur);

        extent = new Extent({
          xmin: llMapPoint.x,
          ymin: llMapPoint.y,
          xmax: urMapPoint.x,
          ymax: urMapPoint.y,
          spatialReference: this._view.spatialReference
        });
      }

      return extent;
    },

    /**
     * Figures out the lower left point and upper right point from the start point and end point of a drag
     * All coordinates are screen coordinates. Since screen y is measured from the top of the screen,
     * the higher the y value is, the further the point is from the top of the screen.
     * That's why the y logic seems backwards
     * @param {object} startPt Has x and y properties that are screen coordinates
     * @param {object} endPt  Has x and y properties that are screen coordinates
     * @returns {object} The return objects has
     *   * startpos: string that is the starting position of the drag. uL, ll, ur, or lr
     *   * ll: lower left point of the drag extent in screen coordinates
     *   * ur: upper right point of the drag extent in screen coordinates
     * @private
     */
    _makeScreenExtentFromScreenPoints: function(startPt, endPt) {
      var startpos;
      var ll;
      var ur;

      var sx = startPt.x;
      var sy = startPt.y;

      var ex = endPt.x;
      var ey = endPt.y;

      if (sx < ex && sy < ey) {
        startpos = "ul";
        ll = {
          x: sx,
          y: ey
        };

        ur = {
          x: ex,
          y: sy
        };
      }
      else if (sx > ex && sy > ey) {
        startpos = "lr";
        ll = {
          x: ex,
          y: sy
        };

        ur = {
          x: sx,
          y: ey
        };
      }
      else if (sx > ex && sy < ey) {
        startpos = "ur";
        ll = {
          x: ex,
          y: ey
        };

        ur = {
          x: sx,
          y: sy
        };
      }
      else if (sx < ex && sy > ey) {
        startpos = "ll";
        ll = {
          x: sx,
          y: sy
        };

        ur = {
          x: ex,
          y: ey
        };
      }

      return {
        startpos: startpos,
        ll: ll,
        ur: ur
      };
    },

    /****************************
     * Tooltip utilities
     ****************************/

    /**
     * Creates a div to show drawing tooltip
     * @private
     */
    _createTooltipDiv: function() {
      var message;

      if (this._geometryType === "point") {
        message = "click to draw point";
      }
      else if (this._geometryType === "extent") {
        message = "click and drag to draw extent";
      }
      this._tooltip = domConstruct.create("div", {
        style: this.drawtooltipStyle,
        innerHTML: message
      }, this._view.container);
    },

    _hideTooltip: function() {
      if (this._showTooltips && this._tooltip) {
        this._tooltip.style.display = "none";
      }
    },

    _toggleToolTip: function(show) {
      if (!this._showTooltips) {
        return;
      }

      if (show && !this._tooltip) {
        //Create div and connect to mouse events
        this._createTooltipDiv();

        this._drawMouseHandlers.push(on(this._view.container, "mousemove", this._updateTooltip.bind(this)));
        this._drawMouseHandlers.push(on(this._view.container, "mouseover", this._updateTooltip.bind(this)));
        this._drawMouseHandlers.push(on(this._view.container, "mouseout", this._hideTooltip.bind(this)));
      }
      else if (this._tooltip) {
        //remove mouse events and destroy tooltip div
        for (var i = this._drawMouseHandlers.length - 1; i >= 0; i--) {
          this._drawMouseHandlers.pop().remove();
        }

        domConstruct.destroy(this._tooltip);
        this._tooltip = null;
      }
    },

    _updateTooltip: function(evt) {
      var tooltip = this._tooltip;
      if (!tooltip) {
        return;
      }

      var px, py, body;
      if (evt.offsetX) {
        px = evt.offsetX;
        py = evt.offsetY;
      }
      else if (evt.clientX || evt.pageY) {
        px = evt.clientX;
        py = evt.clientY;
      } else {
        body = document.body;
        px = evt.clientX + body.scrollLeft - body.clientLeft;
        py = evt.clientY + body.scrollTop - body.clientTop;
      }

      px += this._tooltipOffset;

      tooltip.style.display = "none";
      domStyle.set(tooltip, {left: (px + this._tooltipOffset) + "px", top: py + "px"});
      tooltip.style.display = "";
    },

    //-----------------------
    // Symbols for graphics
    //-----------------------
    _extentSymbol: new SimpleFillSymbol({
      color: [30, 144, 255, 0.4],
      style: "solid",
      outline: {
        color: [65, 105, 225],
        width: 1
      }
    }),

    //Tooltip style
    drawtooltipStyle: {
      color: "#49b0f2",
      position: "absolute",
      display: "none",
      "background-color": "#fff",
      "font-size": "0.8rem",
      "padding-left": "5px",
      "padding-right": "5px"
    }
  });

  return DrawTools;
}
);