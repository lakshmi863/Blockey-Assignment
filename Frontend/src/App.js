// File: C:\Users\Lenovo\Desktop\Assignment\Frontend\src\App.js (REVISED LAYOUT)
import React, { useState } from 'react';
import VehicleMap from './components/VehicleMap';
import Navbar from './components/Navbar';
import FilterControls from './components/FilterControls';
import Dashboard from './components/Dashboard';

function App() {
  const [selectedTripId, setSelectedTripId] = useState(null); 
  const [currentPosition, setCurrentPosition] = useState(null);
  const [showFilterPopup, setShowFilterPopup] = useState(false);
  const [reportContext, setReportContext] = useState('This Week'); 

  const handleTitleClick = () => {
    setShowFilterPopup(true);
  };
  
  const handleApplyFilter = (newSelection) => {
    if (newSelection) {
      setSelectedTripId(newSelection.tripId);
    }
    setShowFilterPopup(false);
  };
  
  const handleContextChange = (newContext) => {
    setReportContext(newContext);
    setSelectedTripId(null); // Clear map view when changing the main dashboard context
  }

  return (
    <div className="h-screen font-sans bg-gray-50 overflow-hidden">
      <Navbar
        currentPosition={currentPosition}
        onTitleClick={handleTitleClick}
      />
      
      <main className="h-full w-full pt-14 flex"> {/* Main flex container */}
        
        {/* LEFT PANEL: Sidebar */}
        <div className="w-1/6 bg-white border-r h-[calc(100vh-56px)] p-4 shadow-sm">
             <h3 className="text-lg font-bold mb-4 text-gray-800">Report Context</h3>
             {['Today', 'Yesterday', 'This Week', 'Previous Week', 'This Month', 'Custom'].map(ctx => (
                <div
                    key={ctx}
                    onClick={() => handleContextChange(ctx)}
                    className={`p-2 my-1 rounded-lg cursor-pointer text-sm transition ${
                        reportContext === ctx ? 'bg-blue-600 text-white font-semibold shadow-inner' : 'hover:bg-gray-100'
                    }`}
                >
                    {ctx}
                </div>
             ))}
        </div>

        {/* MAIN CONTENT AREA: Flex column layout for Map and Dashboard */}
        <div className="w-5/6 h-[calc(100vh-56px)] flex flex-col"> 
            
            {/* Map View Container: Appears when a trip is selected */}
            {selectedTripId && (
              <div className="w-full h-2/3 relative shadow-md z-10"> {/* Map takes 2/3 height */}
                  <VehicleMap
                    key={selectedTripId}
                    routeId={selectedTripId}
                    isPlaying={false} 
                    setCurrentPosition={setCurrentPosition}
                  />
              </div>
            )}
            
            {/* Dashboard Container: Always visible, adjusts its height */}
            <div className={`w-full overflow-y-auto ${selectedTripId ? 'h-1/3' : 'h-full'}`}> 
                <Dashboard context={reportContext} />
            </div>

        </div>

        {/* Filter Popup: Modal */}
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