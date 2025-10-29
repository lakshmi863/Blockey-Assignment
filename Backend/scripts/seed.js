import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from '../src/Database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Define the list of configuration files to process.
const SEED_FILES = [
    // Vizag Data Sets (Assuming these files use the array structure [...])
    { fileName: 'vehicle_today.json', dataAlias: 'Today' },
    { fileName: 'vehicle_yesterday.json', dataAlias: 'Yesterday' },
    { fileName: 'vehicle_this_week.json', dataAlias: 'This Week' },
    { fileName: 'vehicle_previous_week.json', dataAlias: 'Previous Week' },
    { fileName: 'vehicle_this_month.json', dataAlias: 'This Month' },
    // Pune Custom Data Set (This file should also be an array [...])
    { fileName: 'vehicle_custom.json', dataAlias: 'Custom' } 
];

const seedDatabase = async () => {
    for (const fileInfo of SEED_FILES) {
        const { fileName, dataAlias } = fileInfo;
        
        const dataPath = path.join(__dirname, '..', 'data', fileName); 
        let fileConfigs = []; // Variable to hold the content of the JSON file
        
        try {
            console.log(`\n--- Seeding Route for: ${dataAlias} from ${fileName} ---`);
            
            const fileContent = fs.readFileSync(dataPath, 'utf-8');
            fileConfigs = JSON.parse(fileContent); // Expects JSON to be an array [...]
            
            if (!Array.isArray(fileConfigs) || fileConfigs.length === 0) {
                 throw new Error("JSON content is not a non-empty array.");
            }

            // Loop through each route configuration object found INSIDE the file's array
            for (const routeConfig of fileConfigs) { 
                
                const { 
                    name: routeName, 
                    vehicleNumber, 
                    vehicleType, 
                    vehicleModel, 
                    fuelType, 
                    tankCapacity,
                    driverHeartRate, 
                    driverSleepHours,
                    points 
                } = routeConfig;
                
                // --- 1. Handle Vehicle Table (Insert only if new) ---
                let vehicleDbEntry = await db.get('SELECT id FROM vehicles WHERE vehicle_number = ?', [vehicleNumber]);
                let vehicleId = vehicleDbEntry ? vehicleDbEntry.id : null;

                if (!vehicleId) {
                    const vehicleSql = `
                        INSERT INTO vehicles (vehicle_number, vehicle_type, vehicle_model, fuel_type, tank_capacity_liters, battery_capacity_kwh) 
                        VALUES (?, ?, ?, ?, ?, ?)
                    `;
                    const vehicleParams = [
                        vehicleNumber, 
                        vehicleType, 
                        vehicleModel, 
                        fuelType, 
                        tankCapacity, 
                        fuelType === 'Electrical' ? 100 : null 
                    ];
                    const { lastID } = await db.run(vehicleSql, vehicleParams);
                    vehicleId = lastID;
                    console.log(`✅ Vehicle '${vehicleNumber}' added with ID: ${vehicleId}`);
                } else {
                    console.log(`⚠️ Vehicle '${vehicleNumber}' already exists (ID: ${vehicleId}).`);
                }
                
                // --- 2. Handle Trips Table ---
                const tripSql = `
                    INSERT INTO trips (route_name, report_context, vehicle_id) 
                    VALUES (?, ?, ?)
                `;
                const tripParams = [routeName, dataAlias, vehicleId]; 
                const { lastID: tripId } = await db.run(tripSql, tripParams);
                console.log(`✅ Trip '${routeName}' created with ID: ${tripId}`);

                // --- 3. Insert into Route_Points Table ---
                if (points && points.length > 0) {
                    for (const point of points) {
                        await db.run(
                            'INSERT INTO route_points (latitude, longitude, timestamp, name, trip_id) VALUES (?, ?, ?, ?, ?)', 
                            [point.latitude, point.longitude, point.timestamp, point.name, tripId]
                        );
                    }
                    console.log(`✅ Successfully seeded ${points.length} points for Trip ID ${tripId}.`);
                } else {
                    console.log("⚠️ Skipping route points seeding: 'points' array was empty or missing.");
                }
            } // END OF INNER ARRAY LOOP

        } catch (error) {
            console.error(`❌ Error processing ${fileName}:`, error.message);
        }
    } // End of outer file loop

    console.log("\n--- Database Seeding Complete ---");
    db.close(); 
};

seedDatabase();