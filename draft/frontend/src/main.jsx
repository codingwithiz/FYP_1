import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import "@arcgis/core/assets/esri/themes/light/main.css";

import { defineCustomElements } from "@arcgis/map-components/loader";
defineCustomElements(window);

window.esriConfig = {
    apiKey: "AAPTxy8BH1VEsoebNVZXo8HurOhukd1E28CYalTpQ2ovQDRMAjTnccKPy00UNDRVFY9ztIq9aC0REycGJGepAJSwmVtTBfKBR7bzv4y4cQxWs8pmVOtqywEIZxJFUzShBJ-gbxFMupHgisPUbDtMh7z_M6hiRlEo-zbHX87ugCtrKsACthqEIwXHN69A1OpyrHBatBXFst8XroSU_-5-VmZ8hMfV_6b1gvWw4ZL7MztKo-U.AT1_uq2IJjly", // ← Replace with your actual API key
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
