// File: C:\Users\Lenovo\Desktop\Assignment\Backend\src\App.js (FINALIZED WITH AGGREGATION API)
import express from 'express';
import cors from 'cors';
import { db } from './Database.js';

export class App {
    constructor() {
        this.app = express();
        this._setupMiddleware();
        this._setupApiRoutes();
    }

    _setupMiddleware() {
        this.app.use(cors());
        this.app.use(express.json());
    }

    _setupApiRoutes() {
        // 1. GET /api/reports/list: Gets the list of available trips/reports for selection
        this.app.get('/api/reports/list', async (req, res) => {
            try {
                const reports = await db.all(`
                    SELECT 
                        t.id AS trip_id, 
                        t.route_name, 
                        t.report_context, 
                        v.vehicle_number,
                        v.vehicle_type
                    FROM trips t
                    JOIN vehicles v ON t.vehicle_id = v.id
                    ORDER BY t.id DESC
                `);
                res.json(reports);
            } catch (error) {
                console.error("Backend Error getting reports list:", error);
                res.status(500).json({ message: "Error fetching reports list" });
            }
        });

        // 2. GET /api/trips/:tripId: Gets the detailed points for a single selected trip
        this.app.get('/api/trips/:tripId', async (req, res) => {
            const { tripId } = req.params;
            
            try {
                const tripDetails = await db.get('SELECT * FROM trips WHERE id = ?', [tripId]);
                
                if (!tripDetails) {
                    return res.status(404).json({ message: `Trip with ID ${tripId} not found.` });
                }
                
                tripDetails.points = await db.all(
                    `SELECT latitude, longitude, timestamp, name FROM route_points WHERE trip_id = ? ORDER BY timestamp ASC`, 
                    [tripId]
                );
                
                const vehicleInfo = await db.get(
                    `SELECT * FROM vehicles WHERE id = (SELECT vehicle_id FROM trips WHERE id = ?)`, 
                    [tripId]
                );
                
                res.json({ ...tripDetails, vehicle: vehicleInfo });

            } catch (error) {
                console.error(`Backend Error fetching trip ${tripId}:`, error);
                res.status(500).json({ message: "Error fetching detailed trip data" });
            }
        });
        
        // *** NEW ENDPOINT 3: For Dashboard Summary Data ***
        this.app.get('/api/dashboard/summary', async (req, res) => {
            const { context } = req.query; 
            
            let filterClause = '';
            let queryParams = [];
            
            if (context && context !== 'All') { 
                filterClause = 'WHERE t.report_context = ?';
                queryParams.push(context);
            }
            
            try {
                // 1. Get Total Trips Count for the context
                const totalTripsResult = await db.get(`
                    SELECT COUNT(*) as total_trips FROM trips t ${filterClause ? filterClause.replace('WHERE', 'WHERE 1=1 AND') : 'WHERE 1=1'}
                `, queryParams.slice(0, 1));

                // 2. Get Trips Breakdown (Grouped by report_context to simulate pie slices)
                const breakdownResult = await db.all(`
                    SELECT 
                        t.report_context AS group_name, 
                        COUNT(t.id) as count 
                    FROM trips t
                    ${filterClause}
                    GROUP BY t.report_context
                `, queryParams);
                
                // 3. Get Utilization Percentage (Simulated: COUNT trips that have points)
                const utilizationQuery = `
                    SELECT CAST(CAST(COUNT(CASE WHEN sub.points_count > 0 THEN 1 END) AS REAL) * 100 / COUNT(t.id) AS INTEGER) as utilization_percent
                    FROM trips t
                    LEFT JOIN (
                        SELECT trip_id, COUNT(*) as points_count FROM route_points GROUP BY trip_id
                    ) sub ON t.id = sub.trip_id
                    ${filterClause}
                `;
                const utilizationResult = await db.get(utilizationQuery, queryParams.slice(0, 1));
                const utilizationPercent = utilizationResult ? utilizationResult.utilization_percent : 0;


                res.json({
                    totalTrips: totalTripsResult?.total_trips || 0,
                    pieBreakdown: breakdownResult, 
                    utilization: utilizationPercent || 0,
                    // Placeholder for "Trips per Day" data
                    tripsPerDay: [ 
                        { name: 'Mon', Trips: 5 }, { name: 'Tue', Trips: 7 }, { name: 'Wed', Trips: 10 },
                        { name: 'Thu', Trips: 8 }, { name: 'Fri', Trips: 4 }, { name: 'Sat', Trips: 2 }
                    ]
                });

            } catch (error) {
                console.error("Backend Error fetching dashboard summary:", error);
                res.status(500).json({ message: "Error fetching dashboard summary" });
            }
        });
    }

    getExpressApp() {
        return this.app;
    }
}