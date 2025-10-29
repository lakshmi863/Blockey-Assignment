// File: C:\Users\Lenovo\Desktop\Assignment\Frontend\src\components\FilterControls.js (Single Card Layout)
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

function FilterControls({ onApplyFilter, initialTripId }) {
  const [reports, setReports] = useState([]); 
  const [activeFilter, setActiveFilter] = useState('This Week');
  const [selectedTrip, setSelectedTrip] = useState(initialTripId);

  const dateFilters = ["Today", "Yesterday", "This Week", "Previous Week", "This Month", "Previous Month", "Custom"];

  useEffect(() => {
    const fetchReports = async () => {
        try {
            const response = await fetch('https://blockey-assignment.onrender.com/api/reports/list');
            if (!response.ok) throw new Error("Failed to fetch reports list");
            
            const data = await response.json();
            setReports(data);

            if (data.length > 0 && !selectedTrip) {
                setSelectedTrip(data[0].trip_id);
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
    onApplyFilter({ 
      tripId: selectedTrip, 
      dateFilter: activeFilter 
    });
  };
  
  const handleClose = () => {
    onApplyFilter(null); 
  }

  // --- CHANGES ARE IN THE RETURN STATEMENT BELOW ---
  return (
    // Full screen overlay with a semi-transparent background, centered content
    <div 
      className="absolute inset-0 z-[1000] bg-black bg-opacity-40 flex items-center justify-center" 
      onClick={handleClose}
    >
      {/* Single, animated card that contains all controls */}
      <motion.div
        className="bg-white rounded-xl shadow-2xl flex overflow-hidden"
        onClick={stopPropagation}
        initial={{ opacity: 0, y: 30 }} // Animate in from bottom
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      >
        {/* Section 1: Report List */}
        <div className="p-6 border-r border-gray-200 w-[280px]">
          <h3 className="text-md font-semibold mb-3 text-gray-700">REPORT LIST</h3>
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

        {/* Section 2: Date Filter Context */}
        <div className="p-6 border-r border-gray-200 w-[200px]">
          <h3 className="text-md font-semibold mb-3 text-gray-700">REPORT CONTEXT</h3>
          <ul className="list-none p-0 m-0 text-gray-800 space-y-1">
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

        {/* Section 3: Action Buttons */}
        <div className="p-2 flex flex-col items-center justify-center gap-4 w-[140px]">
          <button
            onClick={handleClose}
            className="w-full bg-gray-200 text-gray-600 font-bold py-2 px-1 rounded-lg hover:bg-gray-300 transition-colors flex items-center justify-center"
          >
            <X size={20} />
          </button>
          <button
            onClick={handleApply}
            className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
          >
            SHOW
          </button>
          
        </div>
        
      </motion.div>
    </div>
  );
}

export default FilterControls;