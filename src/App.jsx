import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import NumericalMethodsUI from "./components/NumericalMethodsUI";
import BisectionPage from "./components/BisectionPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<NumericalMethodsUI />} />
        <Route path="/bisection" element={<BisectionPage />} />
      </Routes>
    </Router>
  );
}

export default App;
