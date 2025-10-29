# Vehicle Movement Tracker

A full-stack web application designed to visualize and analyze historical vehicle tracking data. It features an interactive map for replaying trips, a dashboard for aggregated analytics, and a backend API to serve the route data.

![Vehicle Tracker Demo](https://i.imgur.com/8f10jG9.png)

*(**Note**: Replace the image URL above with a link to your own screenshot if you prefer)*

---

## live demo 
<https://blockey-assignment.vercel.app>

## Key Features

-   **Interactive Map Simulation**: Watch vehicles travel along their historical routes on an OpenStreetMap interface, powered by React Leaflet.
-   **Road-Snapped Routing**: Routes are not just straight lines; they snap to actual roads by integrating with the OSRM (Open Source Routing Machine) API.
-   **Dynamic Vehicle Marker**: The vehicle icon smoothly animates and rotates to face its direction of travel.
-   **Map-Following View**: The map viewport automatically pans to keep the moving vehicle centered during simulation.
-   **Interactive Pop-up Card**: Click the moving vehicle to open a draggable, animated card with detailed trip info, telemetry, and a list of all waypoints.
-   **Data-Driven Dashboard**: View aggregated analytics with KPIs and charts powered by Recharts, showing total trips, fleet utilization, and daily trip counts.
-   **Flexible Filtering**:
    -   Switch between dashboard contexts (Today, This Week, This Month, etc.).
    -   Select specific historical trips from a list to view on the map.
-   **Full-Stack Architecture**: A robust Node.js/Express backend serves data from a SQLite database to the responsive React frontend.

---

## Tech Stack

#### **Backend**

-   **Runtime**: Node.js
-   **Framework**: Express.js
-   **Database**: SQLite3
-   **Real-time Communication**: Socket.io
-   **Middleware**: CORS

#### **Frontend**

-   **Library**: React
-   **Mapping**: React Leaflet & Leaflet
-   **Charting**: Recharts
-   **Animations**: Framer Motion
-   **Styling**: Tailwind CSS
-   **Icons**: Lucide React

---

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine.

### Prerequisites

You need to have the following installed on your machine:
-   [Node.js](https://nodejs.org/) (which includes `npm`)
-   [Git](https://git-scm.com/)

### Installation & Setup

1.  **Clone the Repository**

    ```bash
    git clone https://github.com/lakshmi863/Blockey-Assignment.git
    cd Blockey-Assignment
    ```

2.  **Set Up the Backend**

    Navigate to the backend directory and install the necessary packages.

    ```bash
    cd Backend
    npm install
    ```

    Next, initialize and seed the database. These scripts will create the `database.db` file and populate it with the route data from the `/data` directory.

    ```bash
    # Create the database tables
    npm run db:init

    # Populate the tables with data
    npm run db:seed
    ```

3.  **Set Up the Frontend**

    In a new terminal, navigate to the frontend directory and install its dependencies.

    ```bash
    cd Frontend
    npm install
    ```

---

## Running the Application

To run the application, you need to have both the backend and frontend servers running concurrently.

1.  **Start the Backend Server**

    In your backend terminal (`/Backend` directory):

    ```bash
    npm start
    ```
    The backend server will start and be available at `http://localhost:3001`.

2.  **Start the Frontend Server**

    In your frontend terminal (`/Frontend` directory):

    ```bash
    npm start
    ```
    The React development server will start, and the application will automatically open in your browser at `http://localhost:3000`.

You can now use the application, switch between dashboard contexts, and select a vehicle from the "Vehicle List" to watch the map simulation.

---

## API Endpoints

The backend exposes the following REST API endpoints:

| Method | Endpoint                    | Description                                       |
| ------ | --------------------------- | ------------------------------------------------- |
| `GET`  | `/api/reports/list`         | Retrieves a list of all available trips.          |
| `GET`  | `/api/trips/:tripId`        | Fetches detailed data for a single trip by its ID.|
| `GET`  | `/api/dashboard/summary`    | Provides aggregated analytics for the dashboard.  |

---

## License

This project is licensed under the MIT License.
