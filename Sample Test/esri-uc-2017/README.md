# esri-uc-2017
Sample Esri JavaScript API applications using the stream layer

## Description
This is a set of applications that demonstrate different use cases for using the Esri JavaScript API's Stream Layer. There are samples for both the 3.x and 4.x versions of the API

The samples:
* *simplewebsocket.html* - Shows connecting to a Stream Service subscribe endpoint without a Stream Layer. The application is useful for diagnosing problems with connecting to a Stream Service.

* **3.x**
  * *filtering.html* - Demonstrates how to set a spatial and/or attribute filter on a Stream Service from the Stream Layer
  * *gauges.html* - Demonstrates the `relatedFeatures` capability of the Stream Layer to show stream gauges with changing attributes. The stream gauge features come from a map service, and the stream service messages contain attributes only.
  * *message-event.html* - Demonstrates how the `message` event can be used to perform some analysis as messages are received.
  * *streamlayer.html* - Simple map and stream layer.
  * *temporal-renderers.html* - A Stream Layer with a temporal renderer. The temporal renderer is used to symbolize moving observations and their tracks.

* **4.x**
  * *filtering.html* - Demonstrates how to set a spatial and/or attribute filter on a Stream Service from the Stream Layer
  * *streamlayer.html* - Simple map and stream layer.
  * *streamlayer3d.html* - A Stream Layer rendered in 3D in a Scene View.


## Links
* [3.x Stream Layer Documentation](https://developers.arcgis.com/javascript/3/jsapi/streamlayer-amd.html)
* [4.x Stream Layer Documentation](https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-StreamLayer.html).
* [4.x Stream Layer View Documentation](https://developers.arcgis.com/javascript/latest/api-reference/esri-views-layers-StreamLayerView.html).
* Sample Stream Services with simulated data
  * [Server maintained by GeoEvent team](https://geoeventsample3.esri.com:6443/arcgis/rest/)
  * [Server maintained by me](http://ec2-75-101-155-202.compute-1.amazonaws.com:6080/arcgis/rest/services)
