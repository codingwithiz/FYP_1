import { ApiKey } from "@esri/arcgis-rest-auth";
import { geocode, suggest } from '@esri/arcgis-rest-geocoding';
import debounce from 'lodash.debounce';
import { useEffect, useReducer } from 'react';

// Replace with your API key from the ArcgGIS for Developers' dashboard. This example is for demo purposes only - do not include your API Key in production code. 
const API_KEY = "AAPTxy8BH1VEsoebNVZXo8HurEVRE-FJ8d3j3ykWlfHRt7WH51Izm4ty5j3rsTZEnY8a5mmgR6TL7Vs5JMOdMWi40lLPEvxQ1JZgHYXSmMLJl6OPV6lBv_suBJSEkwbLqtaedGXDvrLd_1H3wdq8zQ6Y2cahlF6_a6neEU-17Fd-2bfyJA9qOxFwsNYQomE_tYyg8q6IWgE_Z1o-VcSoBGFepsuT-0ouI4qYsUd1BaAVP-U.AT1_aU0cHYIh-FJ8d3j3ykWlfHRt7UTM7vSP3Fo2e3vP4pl6Fo50rk8cNN7I5GIwWCIWGqWpBDMlHi6XScsVIJ91MQqPPeOSxljOwPW8yJKu6Cl0aVNUrQWOZ5feaUHDUjoPBoi-evDKhUIYmV2WhQFxA1VZqYhLUrzaBz0UkSWZevMltj6_5_JxICBNjB3iVQWxYOxr3MzZ2dZW0YX0hEaUf0h1Hw.AT1_epC4akb5-FJ8d3j3ykWlfHRt7WH51Izm4ty5j3rsTZEnY8a5mmgR6TL7Vs5JMOdMWi40lLPEvxQ1JZgHYXSmMLJl6OPV6lBv_suBJSEkwbLqtaedGXDvrLd_1H3wdq8zQ6Y2cahlF6_a6neEU-17Fd-2bfyJA9qOxFwsNYQomE_tYyg8q6IWgE_Z1o-VcSoBGFepsuT-0ouI4qYsUd1BaAVP-U.AT1_aU0cHYIh"

const initialState = {
  data: undefined,
  loading: true,
  error: false,
};

const reducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_SUCCESS':
      return {
        data: action.payload,
        loading: false,
        error: false,
      };
    case 'FETCH_ERROR':
      return {
        data: undefined,
        loading: false,
        error: action.payload,
      };

    default:
      return state;
  }
};

function logToBackend(level, service, message) {
    fetch("http://localhost:3001/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ level, service, message }),
    }).catch(console.error); // Catch fetch errors
}


const authentication = new ApiKey({ key: API_KEY });

export function geocodeResult(selectedItem) {
  const { magicKey } = selectedItem;

  geocode({
      magicKey,
      maxLocations: 1,
      countryCode: "MY",
      authentication,
  }).then((res) => {
      const msg = JSON.stringify(res.candidates, null, 2);
      logToBackend("info", "geocoding service", msg); // Logs to backend terminal
      alert(res.candidates[0].address);
  });
}

export function Suggest({ address, children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  useEffect(() => {
    const fetchData = debounce(async () => {
      try {
        const res = await suggest(address, {
          params: { location: [-76.6162, 39.3043], maxSuggestions: 5 },
          authentication
        });
        dispatch({ type: 'FETCH_SUCCESS', payload: res.suggestions });
      } catch (e) {
        dispatch({ type: 'FETCH_ERROR', payload: e.message });

        console.error(e);
      }
    });
    fetchData();
  }, [address]);

  const { data, loading, error } = state;

  return children({
    data,
    loading,
    error,
  });
}
