// File: C:\Users\Lenovo\Desktop\Assignment\Frontend\src\App.js
import React, { useState } from 'react';
import VehicleMap from './components/VehicleMap';
import Navbar from './components/Navbar';
import FilterControls from './components/FilterControls';
import Dashboard from './components/Dashboard'; // NEW IMPORT

function App() {
  const [selectedTripId, setSelectedTripId] = useState(null); 
  const [currentPosition, setCurrentPosition] = useState(null);
  const [showFilterPopup, setShowFilterPopup] = useState(false);
  
  // STATE: Controls which aggregated data the Dashboard shows ('Today', 'Yesterday', etc.)
  const [reportContext, setReportContext] = useState('Today'); 

  const handleTitleClick = () => {
    setShowFilterPopup(true);
  };
  
  // Handler now expects an object with { tripId, dateFilter }
  const handleApplyFilter = (newSelection) => {
    if (newSelection) {
      setSelectedTripId(newSelection.tripId);
      setReportContext(newSelection.dateFilter); // Set the context for the dashboard
    }
    setShowFilterPopup(false);
  };

  return (
    <div className="h-screen font-sans bg-gray-50 overflow-hidden">
      <Navbar
        currentPosition={currentPosition}
        onTitleClick={handleTitleClick}
      />
      
      <main className="h-full w-full pt-14 relative flex"> 
        
        {/* LEFT PANEL: Context Selector mirroring the dashboard mockup */}
        <div className="w-1/6 bg-white border-r h-[calc(100vh-56px)] p-4 pt-16 shadow-md overflow-y-auto">
             <h3 className="text-lg font-bold mb-4 text-gray-800">Report Context</h3>
             {['Today', 'Yesterday', 'This Week', 'Previous Week', 'This Month', 'Custom'].map(ctx => (
                <div
                    key={ctx}
                    onClick={() => { 
                        setReportContext(ctx);
                        setSelectedTripId(null); // Clear map view when changing context
                    }}
                    className={`p-2 my-1 rounded-lg cursor-pointer text-sm transition ${
                        reportContext === ctx ? 'bg-blue-600 text-white font-semibold' : 'hover:bg-gray-100'
                    }`}
                >
                    {ctx}
                </div>
             ))}
        </div>


        {/* MAIN CONTENT AREA: Swaps between Map View (for simulation) and Dashboard */}
        <div className="w-5/6 h-full relative overflow-y-auto"> 
            
            {/* Map View */}
            {selectedTripId ? (
              <div className="h-1/2 w-full absolute top-0 left-0"> 
                  <VehicleMap
                    key={selectedTripId} // Keyed by trip ID
                    routeId={selectedTripId} // Passed as routeId to match VehicleMap signature
                    // Removed dateFilter prop as map simulation logic might not need it now
                    isPlaying={false} // Historical view defaults to not playing (local control starts it)
                    setCurrentPosition={setCurrentPosition}
                  />
              </div>
            ) : null}
            
            {/* Dashboard View (Sits below or next to the map) */}
            <div className={`w-full h-full ${selectedTripId ? 'mt-1/2' : 'h-full'} p-4`}> 
                <Dashboard context={reportContext} /> {/* Passes the selected context */}
            </div>

        </div>

        {showFilterPopup && 
          <FilterControls 
              onApplyFilter={handleApplyFilter} 
              initialTripId={selectedTripId} 
          />
        }
      </main>
    </div>
  );
}

export default App;