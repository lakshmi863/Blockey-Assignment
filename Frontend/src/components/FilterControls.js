// File: C:\Users\Lenovo\Desktop\Assignment\Frontend\src\components\FilterControls.js (FINAL)
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

function FilterControls({ onApplyFilter, initialTripId }) { // *** Updated prop name ***
  const [reports, setReports] = useState([]); 
  const [activeFilter, setActiveFilter] = useState('This Week');
  
  const [selectedTrip, setSelectedTrip] = useState(initialTripId); // State now tracks trip_id

  const dateFilters = ["Today", "Yesterday", "This Week", "Previous Week", "This Month", "Previous Month", "Custom"];

  useEffect(() => {
    const fetchReports = async () => {
        try {
            // *** NEW ENDPOINT CALLED ***
            const response = await fetch('http://localhost:3001/api/reports/list');
            if (!response.ok) throw new Error("Failed to fetch reports list");
            
            const data = await response.json();
            setReports(data);

            // Initialize selection using the new data structure
            if (data.length > 0 && !selectedTrip) {
                setSelectedTrip(data[0].trip_id); // Initialize with the first TRIP ID
            }
        } catch (error) {
            console.error("Error fetching routes/reports for dropdown:", error);
        }
    };
    fetchReports();
  }, [selectedTrip]);

  const stopPropagation = (e) => {
    e.stopPropagation();
  };

  const handleApply = () => {
    // *** UPDATED KEY NAME ***
    onApplyFilter({ 
      tripId: selectedTrip, 
      dateFilter: activeFilter 
    });
  };
  
  const handleClose = () => {
    onApplyFilter(null); 
  }

  return (
    <div className="absolute inset-0 z-[1000] bg-black bg-opacity-5" onClick={handleClose}>
      <div className="absolute bottom-16 left-4 bg-white rounded-lg shadow-xl p-4 w-64" onClick={stopPropagation}>
        <h3 className="text-md font-semibold mb-2 text-gray-700">REPORT LIST</h3>
        
        <select 
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedTrip || ""} 
            onChange={(e) => setSelectedTrip(e.target.value)} 
        >
          <option value="" disabled>Select a Historical Trip...</option>

          {reports.map(report => (
              <option key={report.trip_id} value={report.trip_id}>
                  {report.route_name} - ({report.report_context})
              </option>
          ))}
        </select>

      </div>

      <div className="absolute bottom-16 left-1/2 -translate-x-1/2 bg-white shadow-xl rounded-md p-2 w-48" onClick={stopPropagation}>
        <ul className="list-none p-0 m-0 text-gray-800">
          {dateFilters.map(filter => (
             <li key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`p-2 rounded-md cursor-pointer transition-colors text-sm ${
                    activeFilter === filter ? 'bg-blue-600 text-white font-semibold' : 'hover:bg-gray-100'
                }`}
             >
               {filter}
             </li>
          ))}
        </ul>
      </div>

      <div className="absolute bottom-16 right-48 flex items-center gap-4" onClick={stopPropagation}>
        <button
          onClick={handleApply}
          className="bg-blue-600 text-white font-bold py-2 px-8 rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
        >
          SHOW
        </button>
        <button
          onClick={handleClose}
          className="p-3 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors flex items-center justify-center shadow-lg"
        >
          <X size={20} />
        </button>
      </div>
    </div>
  );
}

export default FilterControls;