# MonitoringFrontend v2.0

A modern, interactive dashboard for business location suitability analysis, built with React and OpenStreetMap data.

## Features

- **Login/Logout Authentication** (demo: `admin` / `password123`)
- **Interactive Map** with real-time competitor locations (filtered by business type)
- **Top 5 Suitable Locations** recommended by address, using OSM data
- **Suitability Distribution & Business Type Breakdown** charts
- **AI-Extracted Preferences** and analytics modal
- **Export to PDF/CSV**
- **Responsive, modern UI** with a blue dashboard theme

## Getting Started

### Prerequisites

- Node.js (v14+ recommended)
- npm or yarn

### Installation

1. Clone the repository:
   ```sh
   git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git
   cd YOUR_REPO/monitoringfrontend
   ```
2. Install dependencies:
   ```sh
   npm install
   # or
   yarn install
   ```
3. Start the development server:
   ```sh
   npm start
   # or
   yarn start
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

- **Login** with username: `admin` and password: `password123`.
- Select your business type (Retail, Restaurant, Cafe, Service) in the sidebar.
- View recommended locations and competitors on the map.
- See analytics, export reports, and interact with the AI chatbot.
- Use the "Log Out" button (top right) to end your session.

## Data & Credits

- **Competitor and location data** is fetched in real-time from [OpenStreetMap](https://www.openstreetmap.org/) using the Overpass API and Nominatim for reverse geocoding.
- Map tiles by [OpenStreetMap contributors](https://www.openstreetmap.org/copyright).

## Customization

- To change authentication, connect to a real backend.
- To add more business types or improve filtering, edit the Overpass API query in `App.js`.

## License

This project is for academic/demo purposes. See [OpenStreetMap License](https://www.openstreetmap.org/copyright) for data usage.
