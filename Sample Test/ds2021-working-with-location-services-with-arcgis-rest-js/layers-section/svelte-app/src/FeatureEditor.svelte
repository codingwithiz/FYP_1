<script>
  // import arcgis-rest-js methods we want to use
  import {
    addFeatures,
    updateFeatures,
    deleteFeatures,
  } from "@esri/arcgis-rest-feature-layer";

  // props to pass in
  export let featureServiceLayerUrl;
  export let featureObject;

  // editable HTML string bound to a <pre> element below,
  // which is a JSON string representation of the featureObject
  let editableFeatureHtml = JSON.stringify(featureObject, null, 2);

  // react to user changes in the editable HTML string
  $: if (editableFeatureHtml) {
    try {
      // update the featureObject variable by parsing the editable HTML string from JSON into an object
      // the featureObject will be used by the arcgis-rest-js methods in our button clicks
      featureObject = JSON.parse(editableFeatureHtml);
    } catch (error) {
      console.error(error);
      // when there are JSON parsing errors,
      // we could try to enforce some validation or provide more user feedback
      // for example, to revert the HTML string value back to last valid state of the featureObject:
      // editableFeatureHtml = JSON.stringify(featureObject, null, 2);
    }
  }

  // <button> disabled state variables
  // initially set to only allow adding a new feature
  let addButtonDisabled = false;
  let updateButtonDisabled = true;
  let deleteButtonDisabled = true;

  // content to display the results of arcgis-rest-js feature layer network requests in an element under our action buttons
  let responseTextContent = "No arcgis-rest-js requests performed yet.";

  async function handleAddClick() {
    const response = await addFeatures({
      url: featureServiceLayerUrl,
      features: [featureObject],
    });

    // update the displayed read-only response data
    responseTextContent = response;

    if (!response.addResults[0].success) {
      // stop early if adding a new feature was not successful
      return;
    }

    // append the objectId of the newly added feature to the attributes of our feature
    // because we'll need it when we want to make updates or delete the feature in subsequent steps

    // but to maintain a 1-direction data update flow, we make sure to only change the editable HTML string,
    // which will then always try to parse from JSON and update the value of the featureObject
    const objectFromJSON = JSON.parse(editableFeatureHtml);
    objectFromJSON.attributes.objectId = response.addResults[0].objectId;
    editableFeatureHtml = JSON.stringify(objectFromJSON, null, 2);
    // alas, it would have been easier to read if we had done this instead,
    // but it would have incorrectly tried to run the updating logic defined above in the "wrong direction"
    // featureObject.attributes.objectId = response.addResults[0].objectId;

    // update <button> disabled state to allow updates and delete
    addButtonDisabled = true;
    updateButtonDisabled = false;
    deleteButtonDisabled = false;
  }

  async function handleUpdateClick() {
    const response = await updateFeatures({
      url: featureServiceLayerUrl,
      features: [featureObject],
    });

    // update the displayed read-only response data
    responseTextContent = response;
  }

  async function handleDeleteClick() {
    // delete the feature using the objectId of the updated feature
    const objectIdToDelete = featureObject.attributes.objectId;

    const response = await deleteFeatures({
      url: featureServiceLayerUrl,
      objectIds: [objectIdToDelete],
    });

    // update the displayed read-only response data
    responseTextContent = response;

    if (!response.deleteResults[0].success) {
      // stop early if deleting the feature was not successful
      return;
    }

    // update <button> disabled state to only allow adding a new feature
    addButtonDisabled = false;
    updateButtonDisabled = true;
    deleteButtonDisabled = true;
  }
</script>

<!-- editable pre element where you can change the JSON of the feature -->
<pre contenteditable="true" bind:textContent={editableFeatureHtml} />

<!-- buttons with click handlers to add, update, and delete a feature -->
<button on:click={handleAddClick} disabled={addButtonDisabled}>
  🆕 1. Add new feature
</button>

<button on:click={handleUpdateClick} disabled={updateButtonDisabled}>
  💾 2. Update it
</button>

<button on:click={handleDeleteClick} disabled={deleteButtonDisabled}>
  🚮 3. Delete it
</button>

<!-- a read-only pre element to display the results of arcgis-rest-js feature layer network requests -->
<pre>{JSON.stringify(responseTextContent, null, 2)}</pre>

<style>
  pre {
    margin: 12px auto;
    padding: 6px;
    border: 2px solid #eee;
    width: max-content;
    text-align: left;
    font-size: 1.2em;
  }
  button {
    margin: 0.5em;
    font-size: 1.1em;
  }
  pre[contenteditable] {
    border: 2px dotted steelblue;
    border-radius: 4px;
  }
</style>
