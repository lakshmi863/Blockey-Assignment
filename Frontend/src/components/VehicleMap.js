// File: C:\Users\Lenovo\Desktop\Assignment\Frontend\src\components\VehicleMap.js (With Top & Side Animations)
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Polyline, Marker } from 'react-leaflet';
import L from 'leaflet';
import { motion } from 'framer-motion';
import { ArrowUpLeft, ArrowUpRight, ArrowDownLeft, ArrowDownRight } from 'lucide-react';

// --- Helper Functions and Constants (Unchanged) ---
function calculateBearing(lat1, lng1, lat2, lng2) { /* ... */ return (Math.atan2(Math.sin(lng2 - lng1) * Math.cos(lat2), Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(lng2 - lng1)) * 180 / Math.PI + 360) % 360 }
const SIMULATION_INTERVAL_MS = 80;
const OSRM_BASE_URL = 'https://router.project-osrm.org/route/v1/driving/';

function VehicleMap({ tripId, setCurrentPosition }) {
    // --- State Declarations & Hooks (Unchanged) ---
    const [originalStops, setOriginalStops] = useState([]);
    const [roadPath, setRoadPath] = useState([]);
    const [currentPathIndex, setCurrentPathIndex] = useState(0);
    const [localIsPlaying, setLocalIsPlaying] = useState(false);
    const intervalRef = useRef(null);
    const mapRef = useRef(null);
    const mapContainerRef = useRef(null);
    const [routeDetails, setRouteDetails] = useState(null);
    const [showPoiCard, setShowPoiCard] = useState(false);
    const [activePoi, setActivePoi] = useState(null);
    const [cardSnapPosition, setCardSnapPosition] = useState('center');

    // Data Fetching and Simulation Effects remain unchanged
    useEffect(() => {
        const fetchAllData = async () => { setRouteDetails(null); setRoadPath([]); setOriginalStops([]); setCurrentPathIndex(0); try { const stopsResponse = await fetch(`https://blockey-assignment.onrender.com/api/trips/${tripId}`); if (!stopsResponse.ok) throw new Error("Could not fetch route points."); const data = await stopsResponse.json(); setRouteDetails(data); if (!data.points || data.points.length < 2) throw new Error("Not enough data points."); const formattedStops = data.points.map(p => ({ lat: p.latitude, lng: p.longitude, timestamp: p.timestamp, name: p.name || `Point ${data.points.indexOf(p) + 1}`})); setOriginalStops(formattedStops); const coordsString = formattedStops.map(p => `${p.lng},${p.lat}`).join(';'); const osrmUrl = `${OSRM_BASE_URL}${coordsString}?overview=full&geometries=geojson`; const roadPathResponse = await fetch(osrmUrl); if (!roadPathResponse.ok) throw new Error("Routing service failed."); const roadPathData = await roadPathResponse.json(); const path = roadPathData.routes[0].geometry.coordinates.map(coord => [coord[1], coord[0]]); setRoadPath(path); if (mapRef.current) mapRef.current.fitBounds(path); if (formattedStops.length > 0) setCurrentPosition({ lat: formattedStops[0].lat, lng: formattedStops[0].lng, name: formattedStops[0].name }); } catch (err) { console.error("Data fetching error:", err); setCurrentPosition(null); }};
        fetchAllData();
    }, [tripId, setCurrentPosition]);
    useEffect(() => {
        if (localIsPlaying && roadPath.length > 0) {
            intervalRef.current = setInterval(() => {
                setCurrentPathIndex(prevIndex => {
                    const nextIndex = prevIndex + 1;
                    if (nextIndex < roadPath.length) {
                        const currentCarPosition = roadPath[nextIndex];
                        setCurrentPosition({ lat: currentCarPosition[0], lng: currentCarPosition[1] });
                        const stopIndex = originalStops.findIndex(stop => Math.abs(stop.lat - currentCarPosition[0]) < 0.0001 && Math.abs(stop.lng - currentCarPosition[1]) < 0.0001);
                        if (stopIndex !== -1) setCurrentPosition(prevPos => ({ ...prevPos, name: originalStops[stopIndex].name }));
                        return nextIndex;
                    }
                    clearInterval(intervalRef.current); setLocalIsPlaying(false); return prevIndex;
                });
            }, SIMULATION_INTERVAL_MS);
        }
        return () => clearInterval(intervalRef.current);
    }, [localIsPlaying, roadPath, originalStops, setCurrentPosition]);
    
    // Control Handlers remain unchanged
    const handleTogglePlay = useCallback(() => { if (currentPathIndex >= roadPath.length - 1 && roadPath.length > 0) return; setLocalIsPlaying(prev => !prev); }, [currentPathIndex, roadPath.length]);
    const handleReset = useCallback(() => { setLocalIsPlaying(false); setCurrentPathIndex(0); if (originalStops.length > 0) setCurrentPosition({ lat: originalStops[0].lat, lng: originalStops[0].lng, name: originalStops[0].name }); }, [originalStops, setCurrentPosition]);
    const handleCarMarkerClick = () => { if (originalStops.length > 0 && routeDetails && routeDetails.vehicle) { setActivePoi({ telemetry: routeDetails.vehicle, routePoints: originalStops }); setShowPoiCard(true); setCardSnapPosition('center'); } };

    // --- POI Card Component (MODIFIED) ---
    const PoiCard = ({ data, onClose }) => {
        if (!data || !routeDetails || !routeDetails.vehicle) return null;
        
        const vehicle = routeDetails.vehicle; 
        const waypointNames = data.routePoints.map(point => point.name).join('  •  ');
        
        const positionStyles = {
            center: { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' },
            topLeft: { top: '20px', left: '20px', transform: 'none' },
            topRight: { top: '20px', right: '20px', left: 'auto', transform: 'none' },
            bottomLeft: { bottom: '20px', left: '20px', top: 'auto', transform: 'none' },
            bottomRight: { bottom: '20px', right: '20px', top: 'auto', left: 'auto', transform: 'none' },
            free: {}
        };
        
        return (
            <motion.div
                drag dragConstraints={mapContainerRef} dragMomentum={false} onDragStart={() => setCardSnapPosition('free')}
                style={positionStyles[cardSnapPosition]} 
                className="absolute z-[1001] bg-white shadow-2xl rounded-xl w-[350px] pointer-events-auto overflow-hidden cursor-grab active:cursor-grabbing"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
            >
                {/* *** NEW: Animated top border *** */}
                <div className="absolute top-0 left-0 h-1.5 w-full bg-gradient-to-r from-purple-500 via-blue-500 to-green-400 animate-pulse" />

                {/* Animated side border */}
                <div className="absolute top-0 left-0 h-full w-1.5 bg-gradient-to-b from-purple-500 via-blue-500 to-green-400 animate-pulse" />
                
                {/* *** UPDATED: Padding changed from py-4 to pt-6 to avoid overlap with new top bar *** */}
                <div className="pl-6 pr-4 pt-6 pb-4">
                    <div className="absolute top-2 right-12 flex gap-1">
                        <button onClick={() => setCardSnapPosition('topLeft')} className="p-1 rounded text-gray-400 hover:bg-gray-200"><ArrowUpLeft size={14}/></button>
                        <button onClick={() => setCardSnapPosition('topRight')} className="p-1 rounded text-gray-400 hover:bg-gray-200"><ArrowUpRight size={14}/></button>
                        <button onClick={() => setCardSnapPosition('bottomLeft')} className="p-1 rounded text-gray-400 hover:bg-gray-200"><ArrowDownLeft size={14}/></button>
                        <button onClick={() => setCardSnapPosition('bottomRight')} className="p-1 rounded text-gray-400 hover:bg-gray-200"><ArrowDownRight size={14}/></button>
                    </div>

                    <div className="flex justify-between items-center mb-3">
                        <h2 className="text-lg font-bold text-blue-700">{routeDetails.route_name}</h2>
                        <button onClick={onClose} className="text-red-500 hover:text-red-700 text-2xl font-bold leading-none p-1 z-10">&times;</button>
                    </div>

                    {/* Content below this line is the same */}
                    <div className="flex items-center text-sm text-gray-700 mb-3 border-b pb-2">
                        <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                        <span>Vehicle: {vehicle.vehicle_number} ({vehicle.vehicle_type})</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center text-xs mb-4">
                        <div className="p-2 bg-gray-50 rounded"><p className="text-gray-500">Speed</p><p className="font-bold text-sm">0.00 km/h</p></div>
                        <div className="p-2 bg-gray-50 rounded"><p className="text-gray-500">Dist</p><p className="font-bold text-sm">0.00 km</p></div>
                        <div className="p-2 bg-gray-50 rounded"><p className="text-gray-500">Battery</p><p className="font-bold text-sm text-green-600">16%</p></div>
                    </div>
                    <div className="mt-3 max-h-40 overflow-y-auto border p-2 rounded-lg bg-gray-50">
                        <p className="font-semibold text-sm mb-1 text-gray-800 border-b pb-1">Trip Waypoints ({data.routePoints.length} total):</p>
                        <ul className="space-y-1 text-xs">{data.routePoints.map((point, index) => (<li key={index} className="flex justify-between border-b last:border-b-0 py-[1px]"><span className="truncate">{index + 1}. {point.name}</span><span className="text-gray-500 ml-2">({point.lat.toFixed(4)}, {point.lng.toFixed(4)})</span></li>))}</ul>
                    </div>
                    <div className="mt-3 p-2 bg-white rounded-lg border">
                        <p className="text-xs font-semibold text-gray-700 mb-1">Scrolling Waypoints:</p>
                        <div className="marquee-container"><span className="marquee-scroll text-sm font-bold text-purple-700">{waypointNames}</span></div>
                    </div>
                    <div className="flex justify-around mt-3 pt-3 border-t">
                        <button className="text-gray-400 hover:text-blue-500">Log</button>
                        <button className="text-gray-400 hover:text-blue-500">Device</button>
                        <button className="text-gray-400 hover:text-blue-500">Status</button>
                        <button className="text-gray-400 hover:text-blue-500">Lock</button>
                    </div>
                </div>
            </motion.div>
        );
    };

    if (!routeDetails) { return <div className="flex items-center justify-center h-full text-gray-500">Loading Trip Data...</div>; }
    const currentCarPosition = roadPath[currentPathIndex] || (originalStops.length > 0 ? [originalStops[0].lat, originalStops[0].lng] : [0,0]);
    let bearing = 0; if (currentPathIndex > 0 && roadPath.length > 0) { bearing = calculateBearing(roadPath[currentPathIndex - 1][0], roadPath[currentPathIndex - 1][1], roadPath[currentPathIndex][0], roadPath[currentPathIndex][1]); }
    const vehicleIcon = new L.divIcon({ html: `<div style="transform: rotate(${bearing}deg); transition: transform 0.2s linear;"><img src="https://img.icons8.com/?size=100&id=QNXMW3NgF3oq&format=png&color=000000" style="width: 40px; height: 40px;" /></div>`, className: '', iconSize: [40, 40], iconAnchor: [20, 20]});

    return (
        <div ref={mapContainerRef} className="h-full w-full relative">
            <div className="absolute top-4 left-4 z-[1000] p-3 bg-white shadow-xl rounded-lg">
                <div className="flex flex-col gap-2">
                    <button onClick={handleTogglePlay} className={`px-3 py-1 text-white font-semibold rounded-lg transition text-sm ${localIsPlaying ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}>
                        {localIsPlaying ? 'Pause Sim' : 'Play Sim'}
                    </button>
                    <button onClick={handleReset} className="px-3 py-1 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition text-sm">
                        Reset View
                    </button>
                </div>
            </div>
            
            <MapContainer ref={mapRef} center={[17.4118, 78.4358]} zoom={12} className="h-full z-0">
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap' />
                {roadPath.length > 0 && <Polyline positions={roadPath} pathOptions={{ color: 'red', weight: 8 }} />}
                {originalStops.map((stop, index) => <Marker key={`stop-${index}`} position={[stop.lat, stop.lng]} icon={new L.divIcon({ html: `<div style="background-color: #f68d3c; color: white; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 16px; border: 2px solid white; box-shadow: 0 0 5px rgba(0,0,0,0.5);">${index + 1}</div>`, className: '', iconSize: [30, 30], iconAnchor: [15, 15]})} />)}
                {currentCarPosition.length === 2 && <Marker position={currentCarPosition} icon={vehicleIcon} eventHandlers={{ click: handleCarMarkerClick }} />}
            </MapContainer>

            {showPoiCard && <PoiCard data={activePoi} onClose={() => setShowPoiCard(false)} />}
        </div>
    );
}

function VehicleMapWithProps({ routeId, dateFilter, isPlaying, setCurrentPosition }) {
    return <VehicleMap tripId={routeId} setCurrentPosition={setCurrentPosition} />;
}

export default VehicleMapWithProps;