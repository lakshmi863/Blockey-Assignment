import { db } from '../src/Database.js';

const createTables = async () => {
    console.log("Initializing database tables...");

    // New Table 1: Stores unique vehicle metadata
    const vehiclesTable = `
        CREATE TABLE IF NOT EXISTS vehicles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            vehicle_number TEXT NOT NULL UNIQUE,
            vehicle_type TEXT NOT NULL,
            vehicle_model TEXT NOT NULL,
            fuel_type TEXT NOT NULL,
            tank_capacity_liters INTEGER,
            battery_capacity_kwh REAL
        )
    `;
    
    // New Table 2: Stores the context of one specific trip/log/report
    const tripsTable = `
        CREATE TABLE IF NOT EXISTS trips (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            route_name TEXT NOT NULL,
            report_context TEXT NOT NULL, -- e.g., 'Today', 'Yesterday', 'Pune Custom'
            vehicle_id INTEGER NOT NULL,
            FOREIGN KEY (vehicle_id) REFERENCES vehicles (id)
        )
    `;
    
    // Updated Table 3: Points now link to a Trip ID
    const pointsTable = `
        CREATE TABLE IF NOT EXISTS route_points (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            latitude REAL NOT NULL,
            longitude REAL NOT NULL,
            timestamp TEXT NOT NULL,
            name TEXT,
            trip_id INTEGER NOT NULL, 
            FOREIGN KEY (trip_id) REFERENCES trips (id) ON DELETE CASCADE
        )
    `;

    try {
        await db.run(vehiclesTable);
        console.log("✅ Table 'vehicles' is ready.");
        await db.run(tripsTable);
        console.log("✅ Table 'trips' is ready.");
        await db.run(pointsTable);
        console.log("✅ Table 'route_points' is ready.");
    } catch (error) {
        console.error("❌ Failed to initialize tables:", error);
    } finally {
        db.close();
    }
};

createTables();