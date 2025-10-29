// File: C:\Users\Lenovo\Desktop\Assignment\Backend\src\WebSocketServer.js
import { Server } from "socket.io";
import { db } from './Database.js';

export class WebSocketServer {
    constructor(httpServer) { this.io = new Server(httpServer, { cors: { origin: "*" } }); }
    init() { this.io.on('connection', (socket) => this._handleConnection(socket)); }

    _handleConnection(socket) {
        console.log(`🔌 A user connected: ${socket.id}`);
        let simulationInterval;

        socket.on('start-simulation', async ({ routeId }) => {
            if (!routeId) return;
            console.log(`▶️ Simulation started for route ID ${routeId} by client ${socket.id}`);
            clearInterval(simulationInterval);
            try {
                const routeDetails = await db.get('SELECT * FROM routes WHERE id = ?', [routeId]);
                if (!routeDetails) return socket.emit('simulation-error', { message: `Route not found.` });
                
                const routePoints = await db.all('SELECT * FROM route_points WHERE route_id = ? ORDER BY timestamp ASC', [routeId]);
                if (routePoints.length === 0) return socket.emit('simulation-error', { message: `Route has no points.` });

                let currentIndex = 0;
                simulationInterval = setInterval(() => {
                    if (currentIndex < routePoints.length) {
                        const currentPoint = routePoints[currentIndex];
                        
                        // Build the comprehensive packet for each update
                        const updatePacket = {
                            latitude: currentPoint.latitude,
                            longitude: currentPoint.longitude,
                            timestamp: currentPoint.timestamp,
                            vehicleNumber: routeDetails.vehicle_number,
                            vehicleType: routeDetails.vehicle_type,
                            vehicleModel: routeDetails.vehicle_model,
                            fuelType: routeDetails.fuel_type,
                            driverHeartRate: routeDetails.driver_heart_rate,
                            driverSleepHours: routeDetails.driver_sleep_hours
                        };
                        
                        if (routeDetails.fuel_type === 'Diesel') updatePacket.tankCapacityLiters = routeDetails.tank_capacity_liters;
                        else if (routeDetails.fuel_type === 'Electrical') updatePacket.batteryCapacityKwh = routeDetails.battery_capacity_kwh;
                        
                        socket.emit('vehicleUpdate', updatePacket);
                        currentIndex++;
                    } else {
                        socket.emit('simulation-ended', { message: 'Route finished.' });
                        clearInterval(simulationInterval);
                    }
                }, 2000);
            } catch (error) {
                socket.emit('simulation-error', { message: 'Failed to load route data from database.' });
            }
        });

        socket.on('disconnect', () => {
            console.log(`🔌 User disconnected: ${socket.id}`);
            clearInterval(simulationInterval);
        });
    }
}