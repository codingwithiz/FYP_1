# NiagaMap Draft – Business Location Suitability Platform

This project is a full-stack web application for analyzing and recommending suitable business locations using GIS, AI, and real-world data. It features user authentication, interactive maps, AI chatbot, and analytics.

---

## Folder Structure

```
draft/
  backend/
    database/
      dbConfig.js
      init.sql
    routes/
      analysisRoute.js
      auth.js
      chatRoutes.js
      conversationRoutes.js
      processPlaces.js
      suitability.js
      userRoutes.js
    services/
      analysisService.js
      arcgisServices.js
      ...
    .env
    docker-compose.yml
    package.json
    server.js
    ...
  frontend/
    public/
    src/
      components/
        Analysis.jsx
        AuthPage.jsx
        Chatbot.jsx
        Esrimap.jsx
        MapView.jsx
        ...
      api/
      context/
      App.jsx
      App.css
      index.css
      main.jsx
    .env
    package.json
    vite.config.js
    ...
```

---

## Features

### Backend (`draft/backend`)

- **User Authentication**: Firebase-based, with user creation and verification.
- **Business Suitability Analysis**:
  - `/api/suitability` endpoint computes and recommends top locations based on user intent, location, and business category.
  - Integrates ArcGIS and OpenAI for geospatial and reasoning analysis.
- **Chatbot & Conversation Storage**: Stores chat threads and conversations for each user.
- **Analysis Management**:
  - Stores each analysis with reference points and recommended locations.
  - Allows updating and deleting analyses.
- **Database**: Microsoft SQL Server, with Docker support for local development.
- **REST API**: For users, chats, conversations, analyses, and suitability.

### Frontend (`draft/frontend`)

- **React + Vite**: Modern, fast development stack.
- **Authentication UI**: Email/password and Google login.
- **Interactive Map**:
  - Shows recommended locations and competitors.
  - MapView and Esrimap components.
- **AI Chatbot**:
  - Floating button and panel for business Q&A.
  - Integrates with backend for chat history and recommendations.
- **Analysis Dashboard**:
  - View, update, and delete past analyses.
  - See reference points and recommended locations with scores and AI explanations.
- **Responsive UI**: Styled with Tailwind CSS and custom styles.
- **Export/Reporting**: (Planned/partial) Export analysis results as PDF/CSV.

---

## Getting Started

### Prerequisites

- Node.js (v14+)
- Docker (for database, optional but recommended)
- npm

### Backend Setup

1. **Install dependencies:**

   ```sh
   cd draft/backend
   npm install
   ```

2. **Configure environment:**

   - Copy `.env` and set your API keys and DB credentials.

3. **Run SQL Server (Docker):**

   ```sh
   docker-compose up -d
   ```

   Or follow instructions in [backend/README.md](backend/README.md).

4. **Initialize Database:**

   - Run the SQL in `database/init.sql` on your SQL Server instance.

5. **Start backend server:**
   ```sh
   npm start
   ```
   The server runs on `http://localhost:3001`.

### Frontend Setup

1. **Install dependencies:**

   ```sh
   cd draft/frontend
   npm install
   ```

2. **Configure environment:**

   - Copy `.env` and set your API keys.

3. **Start frontend:**
   ```sh
   npm run dev
   ```
   The app runs on `http://localhost:5173`.

---

## Usage

- **Login/Register** with email/password or Google.
- **Ask the Chatbot** for business location advice.
- **View Map** for recommended locations and competitors.
- **See Analysis Results** in the dashboard, update or delete as needed.
- **Export** results (PDF/CSV export in progress).

---

## Technologies

- **Frontend:** React, Vite, Tailwind CSS, ArcGIS JS SDK
- **Backend:** Node.js, Express, Microsoft SQL Server, Firebase Admin, OpenAI API, ArcGIS API
- **Auth:** Firebase Authentication
- **Database:** SQL Server (Dockerized for dev)
- **AI:** OpenAI GPT for reasoning/explanations

---

## Development Notes

- See [backend/README.md](backend/README.md) for Docker/database tips.
- See [frontend/README.md](frontend/README.md) for Vite/React tips.
- Environment variables are required for API keys and DB credentials.

---

## License

This project is for academic/research/demo purposes.
