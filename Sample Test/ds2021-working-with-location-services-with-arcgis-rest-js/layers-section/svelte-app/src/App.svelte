<script>
  // import a custom component, place it in the HTML structure below, and pass in some props to it
  import FeatureEditor from "./FeatureEditor.svelte";

  export let name;

  // define an initial feature object with some attributes and point geometry
  // that we want to save to an ArcGIS Online hosted feature layer
  const myEsriFeature = {
    attributes: {
      name: "editing test",
      rating: "2",
    },
    geometry: {
      x: -118.807,
      y: 34.002,
      spatialReference: {
        wkid: 4326,
      },
    },
  };
</script>

<main>
  <h1>Hello {name}!</h1>
  <p>
    This is a <a href="https://svelte.dev">Svelte application</a> with a custom
    component that can add, update, and delete data in an ArcGIS Online hosted
    feature layer, all with the help of
    <a href="https://esri.github.io/arcgis-rest-js/">arcgis-rest-js</a>.
  </p>

  <p>
    Check out this <a
      href="https://developers.arcgis.com/arcgis-rest-js/layers/edit-feature-data/"
    >
      ArcGIS for Developers tutorial page
    </a> to see the inspiration behind the custom component below.
  </p>

  <hr />

  <FeatureEditor
    featureServiceLayerUrl="https://services3.arcgis.com/GVgbJbqm8hXASVYi/ArcGIS/rest/services/my_points/FeatureServer/0"
    featureObject={myEsriFeature}
  />
</main>

<style>
  main {
    text-align: center;
    padding: 1em;
    max-width: 240px;
    margin: 0 auto;
  }

  h1 {
    color: #ff3e00;
    text-transform: uppercase;
    font-size: 3em;
    font-weight: 100;
  }

  a {
    font-weight: bold;
  }

  @media (min-width: 640px) {
    main {
      max-width: 640px;
    }
  }
</style>
