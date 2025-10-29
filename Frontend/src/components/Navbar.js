import React from "react";

// Accept the onTitleClick prop from App.js
function Navbar({ currentPosition, onTitleClick }) {
  return (
    <nav className="fixed top-0 left-0 w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-lg z-50">
      <div className="flex justify-between items-center px-6 py-3">
        {/* Make this entire section a clickable div */}
        <div 
          className="flex items-center gap-3 cursor-pointer"
          onClick={onTitleClick} // This will show the popup
        >
          <img
            src="https://images.jdmagicbox.com/v2/comp/nashik/f5/0253px253.x253.240712174615.c6f5/catalogue/blockly-technologies-private-limited-nashik-main-road-nashik-it-solution-providers-6bm0r8ygpe.jpg"
            alt="App Logo"
            className="w-28 h-10"
          />
          <h1 className="text-2xl font-bold tracking-tight">
            Vehicle Movement Tracker
          </h1>
        </div>

        {/* --- Right Section: Live Data --- */}
        <div className="text-sm text-gray-100">
          {currentPosition ? (
            <>
              <span className="font-semibold">Lat:</span>{" "}
              {currentPosition.lat.toFixed(4)}{" "}
              <span className="mx-1">|</span>{" "}
              <span className="font-semibold">Lng:</span>{" "}
              {currentPosition.lng.toFixed(4)}
            </>
          ) : (
            <span className="italic text-gray-200">No position yet</span>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;