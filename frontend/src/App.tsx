import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AnalysisProvider } from "./contexts/AnalysisContext";
import Header from "./components/Header";
import Dashboard from "./pages/Dashboard";
import Upload from "./pages/Upload";
import Analysis from "./pages/Analysis";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AnalysisProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Header />
            <main className="container mx-auto px-4 py-8">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/upload" element={<Upload />} />
                <Route path="/analysis/:id" element={<Analysis />} />
                <Route path="/analysis" element={<Analysis />} />
              </Routes>
            </main>
          </div>
        </Router>
      </AnalysisProvider>
    </QueryClientProvider>
  );
}

export default App;
