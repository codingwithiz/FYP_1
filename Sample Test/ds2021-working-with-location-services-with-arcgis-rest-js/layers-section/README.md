# Supporting materials for "Layers" topic

## Content

- [Svelte](https://svelte.dev/) starter app created with <https://github.com/sveltejs/template>. See contents of `svelte-app/`.
- Demonstration of using [`arcgis-rest-js`](https://github.com/esri/arcgis-rest-js) to edit a feature in a inside of hosted feature service layer, with Svelte as our application framework.
- Live demo: <https://jwasilgeo.github.io/ds2021-working-with-location-services-with-arcgis-rest-js/layers-section/svelte-app/public/>

## Dev instructions

```bash
cd svelte-app/
npm install
npm run dev

# navigate to http://localhost:5000
```

## How was this created in the first place?

If you're curious:

```bash
# https://github.com/sveltejs/template
npx degit sveltejs/template svelte-app

cd svelte-app/

# https://esri.github.io/arcgis-rest-js/api/feature-layer/
npm install @esri/arcgis-rest-feature-layer @esri/arcgis-rest-auth@^3.0.0  @esri/arcgis-rest-request@^3.0.0 
```
