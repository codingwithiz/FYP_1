# React app demonstrating querying demographic data

This project was created with [Create React App](https://github.com/facebook/create-react-app) to demonstrate using [`arcgis-rest-js`](https://github.com/esri/arcgis-rest-js) to query demographic data, view available data collections, and display data on a map using the [ArcGIS API for JavaScript](https://developers.arcgis.com/javascript/latest/).

## Run the demo

First, you should add in your own API Key here: https://github.com/jwasilgeo/ds2021-working-with-location-services-with-arcgis-rest-js/blob/main/demographics-section/react-app/src/utils/query-data.ts#L31

In the project directory, run:

```bash
npm install
npm start

# navigate to http://localhost:3000
```

## Packages used

- `@esri/arcgis-rest-demographics`: Contains methods for querying demographic data
- `@esri/arcgis-rest-auth`: Used to handle API key authentication
- `@esri/arcgis-rest-request`: Base package for ArcGIS REST JS
- `esri-loader`: Small tool to make it easer to load the ArcGIS JS API within React (https://github.com/Esri/esri-loader)
- `@material-ui/core`: React Material UI library for basic styling of the list and table (https://material-ui.com/)
