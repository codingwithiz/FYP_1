# ArcGIS Places React

This project is a React application that utilizes the ArcGIS Maps SDK for JavaScript to find and display nearby places based on user interactions with the map. The application allows users to click on the map to search for places, filter results by category, and view detailed information about each place.

## Project Structure

```
arcgis-places-react
├── public
│   └── index.html          # Main HTML document for the React application
├── src
│   ├── components
│   │   ├── MapView.js      # Component for displaying the ArcGIS map and handling user interactions
│   │   └── PlacesPanel.js   # Component for displaying a list of nearby places and their details
│   ├── App.js              # Main application component that combines MapView and PlacesPanel
│   ├── index.js            # Entry point of the React application
│   └── styles
│       └── App.css         # CSS styles for the application
├── package.json             # Configuration file for npm
└── README.md                # Documentation for the project
```

## Setup Instructions

1. **Clone the repository:**

   ```
   git clone <repository-url>
   cd react-places-service
   ```

2. **Install dependencies:**

   ```
   npm install
   ```

3. **Obtain an ArcGIS API key:**

   - Sign up for a free ArcGIS Location Platform account or a free trial of ArcGIS Online.
   - Create developer credentials and obtain your API key.

4. **Update the API key:**

   - Replace the placeholder `YOUR_ACCESS_TOKEN` in the `MapView.js` component with your actual ArcGIS API key.

5. **Run the application:**

   ```
   npm start
   ```

6. **Open your browser:**
   - Navigate to `http://localhost:3000` to view the application.

## Usage

- Click on the map to search for nearby places.
- Use the category filter to narrow down the search results.
- Click on a place in the list to view more details, including address, phone number, and social media links.

## License

This project is licensed under the MIT License. See the LICENSE file for more details.
