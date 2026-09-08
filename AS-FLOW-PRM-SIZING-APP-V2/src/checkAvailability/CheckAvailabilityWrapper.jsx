import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import CheckAvailabilityApp from "./App";
import CheckAvailabilityFileUpload from "./CheckAvailabilityFileUpload";
import CheckAvailabilitySearch from "./CheckAvailabilitySearch";

function CheckAvailabilityWrapper() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/check-availability/file-import"
          element={<CheckAvailabilityFileUpload />}
        />
        <Route path="/check-availability" element={<CheckAvailabilityApp />} />
        <Route
          path="/check-availability/search"
          element={<CheckAvailabilitySearch />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default CheckAvailabilityWrapper;
