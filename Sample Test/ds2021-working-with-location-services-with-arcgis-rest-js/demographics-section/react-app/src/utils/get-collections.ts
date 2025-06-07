import { getAvailableDataCollections } from "@esri/arcgis-rest-demographics";

/**
 * Get all the available demographic data collections in the United States
 */
export async function getDataCollections() {
  // This data is publicly available so it doesn't require authentication
  const response = await getAvailableDataCollections({
    countryCode: "us",
  });

  // Return the collections after sorting them alphabetically
  return (
    response.DataCollections?.sort((a, b) =>
      a.metadata.title.localeCompare(b.metadata.title)
    ) || []
  );
}
