// File: C:\Users\Lenovo\Desktop\Assignment\Frontend\src\components\Dashboard.js (REVISED)
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

function Dashboard({ context }) { // Context comes from App.js (e.g., 'Today', 'Yesterday')
    const [summary, setSummary] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042']; 

    useEffect(() => {
        const fetchDashboardData = async () => {
            setIsLoading(true);
            try {
                // *** UPDATED: Fetching actual aggregated data from the new backend API ***
                const url = `http://localhost:3001/api/dashboard/summary?context=${context}`;

                const response = await fetch(url);
                
                if (!response.ok) throw new Error(`Failed to fetch dashboard summary. Status: ${response.status}`);
                
                const data = await response.json();
                console.log("Dashboard Summary Data:", data);
                setSummary(data);
                setIsLoading(false);
            } catch (error) {
                console.error("Error fetching dashboard summary:", error);
                setSummary(null); // Set to null on error
                setIsLoading(false);
            }
        };
        fetchDashboardData();
    }, [context]); // Refetch data when the context filter changes

    if (isLoading) return <div className="text-center p-10">Loading Dashboard Metrics for {context}...</div>;
    if (!summary || summary.totalTrips === 0) return <div className="text-center p-10 text-gray-500">No trips recorded for {context}.</div>;

    // Map the data returned from the backend's /api/dashboard/summary endpoint
    const totalTrips = summary.totalTrips;
    const pieData = summary.pieBreakdown.map((item, index) => ({ 
        name: item.group_name, 
        value: item.count, 
        fill: COLORS[index % COLORS.length] // Map colors cyclically
    }));
    const tripsPerDayData = summary.tripsPerDay || [];
    const utilizationPercent = summary.utilization || 0; // This should come from backend now

    // --- MOCK for Speed Over Time (Still best served by single trip data if required for a specific route) ---
    // Since the backend summary only returns fleet-wide stats, we will use static/mock speed data
    // for the line graph, as the backend doesn't currently aggregate speed by the hour for a *context*.
    const speedData = [
        { time: '6 AM', Speed: 25 + Math.random()*15 },
        { time: '9 AM', Speed: 35 + Math.random()*10 },
        { time: '12 PM', Speed: 50 + Math.random()*20 },
        { time: '3 PM', Speed: 35 + Math.random()*10 },
        { time: '6 PM', Speed: 55 + Math.random()*15 },
    ];

    return (
        <div className="p-6 bg-white shadow-lg rounded-xl m-6">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Historical Report: {context}</h2>
            
            {/* TOP KPI Section */}
            <div className="grid grid-cols-3 gap-6 mb-6 border-b pb-4">
                <div className="text-center p-4 border rounded-lg shadow-md">
                    <p className="text-gray-500 text-sm uppercase">Total Trips</p>
                    <p className="text-5xl font-extrabold text-blue-600">{totalTrips}</p>
                </div>
                <div className="text-center p-4 border rounded-lg shadow-md">
                    <p className="text-gray-500 text-sm uppercase">Fleet Utilization</p>
                    <p className="text-5xl font-extrabold text-green-600">{utilizationPercent}%</p>
                </div>
                <div className="text-center p-4 border rounded-lg shadow-md">
                    <p className="text-gray-500 text-sm uppercase">Total Vehicles</p>
                    {/* Assuming backend now returns total vehicle count if necessary */}
                    <p className="text-2xl font-bold text-gray-800">X</p> 
                </div>
            </div>
            
            {/* CHARTS GRID */}
            <div className="grid grid-cols-6 gap-6">
                
                {/* Pie Chart - Completed Trips Breakdown */}
                <div className="col-span-3 bg-gray-50 p-4 rounded-lg shadow-inner">
                    <h4 className="text-md font-semibold mb-2">Trip Breakdown by Context/Status</h4>
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie
                                data={pieData}
                                cx="50%"
                                cy="50%"
                                innerRadius={50}
                                outerRadius={80}
                                dataKey="value"
                                labelLine={false}
                            >
                                {pieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                
                {/* Bar Chart - Trips per Day (Using Placeholder data since this is complex) */}
                <div className="col-span-3 bg-gray-50 p-4 rounded-lg shadow-inner">
                    <h4 className="text-md font-semibold mb-2">Trips per Day ({context})</h4>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={tripsPerDayData}> 
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="Trips" fill="#3b82f6" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Speed Over Time (Line Graph - using mock data for now) */}
                <div className="col-span-6 bg-gray-50 p-4 rounded-lg shadow-inner">
                     <h4 className="text-md font-semibold mb-2">Average Speed Over Time (Example for Selected Trip)</h4>
                     <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={speedData}> 
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="time" />
                            <YAxis label={{ value: 'Speed (Km/h)', angle: -90, position: 'insideLeft' }} />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="Speed" stroke="#8884d8" name="Speed" strokeWidth={2} dot={false}/>
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;