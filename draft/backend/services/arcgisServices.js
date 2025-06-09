const axios = require("axios");
const ARC_API_KEY = process.env.ARCGIS_API_KEY;

exports.geocodeLocation = async (location) => {
    const url = `https://geocode-api.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates`;
    const params = {
        SingleLine: location,
        f: "json",
        outFields: "Match_addr,Addr_type",
        token: "AAPTxy8BH1VEsoebNVZXo8HurOhukd1E28CYalTpQ2ovQDRMAjTnccKPy00UNDRVFY9ztIq9aC0REycGJGepAJSwmVtTBfKBR7bzv4y4cQxWs8pmVOtqywEIZxJFUzShBJ-gbxFMupHgisPUbDtMh7z_M6hiRlEo-zbHX87ugCtrKsACthqEIwXHN69A1OpyrHBatBXFst8XroSU_-5-VmZ8hMfV_6b1gvWw4ZL7MztKo-U.AT1_uq2IJjly",
    };
    const res = await axios.get(url, { params });
    console.log("Geocode response:", res.data);
    return res.data.candidates[0].location; // { x, y }
};

exports.getNearbyPlaces = async (lat, lon, radius, searchText = "hospital") => {
    const url =
        "https://places-api.arcgis.com/arcgis/rest/services/places-service/v1/places/near-point";

    const params = {
        x: lon.toString(), // longitude
        y: lat.toString(), // latitude
        searchText,
        radius: radius.toString(), // in meters
        categoryIds:
            "4bf58dd8d48988d11b941735,4edd64a0c7ddd24ca188df1a,52e81612bcbc57f1066b7a2e", // example categories
        pageSize: "20",
        f: "pjson",
        token: "AAPTxy8BH1VEsoebNVZXo8HurOhukd1E28CYalTpQ2ovQDRMAjTnccKPy00UNDRVFY9ztIq9aC0REycGJGepAJSwmVtTBfKBR7bzv4y4cQxWs8pmVOtqywEIZxJFUzShBJ-gbxFMupHgisPUbDtMh7z_M6hiRlEo-zbHX87ugCtrKsACthqEIwXHN69A1OpyrHBatBXFst8XroSU_-5-VmZ8hMfV_6b1gvWw4ZL7MztKo-U.AT1_uq2IJjly", // Use your actual token or keep it in .env
    };

    try {
        const res = await axios.get(url, { params });
        console.log("Nearby places response:", res.data);
        return res.data.results;
    } catch (err) {
        console.error(
            "Error fetching nearby places:",
            err.response?.data || err.message
        );
        return [];
    }
};
