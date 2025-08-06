import React, { createContext, useState, type ReactNode } from "react";
import type { AnalysisResponse } from "../services/api";

interface AnalysisContextType {
  currentAnalysis: AnalysisResponse | null;
  setCurrentAnalysis: (analysis: AnalysisResponse | null) => void;
  analysisHistory: AnalysisResponse[];
  addToHistory: (analysis: AnalysisResponse) => void;
  clearHistory: () => void;
}

const AnalysisContext = createContext<AnalysisContextType | undefined>(
  undefined
);

interface AnalysisProviderProps {
  children: ReactNode;
}

export const AnalysisProvider: React.FC<AnalysisProviderProps> = ({
  children,
}) => {
  const [currentAnalysis, setCurrentAnalysis] =
    useState<AnalysisResponse | null>(null);
  const [analysisHistory, setAnalysisHistory] = useState<AnalysisResponse[]>(
    []
  );

  const addToHistory = (analysis: AnalysisResponse) => {
    console.log("📝 Adding analysis to history:", {
      hasAnalysis: !!analysis,
      fileName: analysis?.file?.originalName,
      overallScore: analysis?.analysis?.overallScore,
      analysisKeys: Object.keys(analysis?.analysis || {}),
    });
    setAnalysisHistory((prev) => [analysis, ...prev.slice(0, 9)]); // Keep last 10
  };

  const setCurrentAnalysisWithLog = (analysis: AnalysisResponse | null) => {
    console.log("🎯 Setting current analysis:", {
      hasAnalysis: !!analysis,
      fileName: analysis?.file?.originalName,
      overallScore: analysis?.analysis?.overallScore,
    });
    setCurrentAnalysis(analysis);
  };

  const clearHistory = () => {
    setAnalysisHistory([]);
  };

  const value: AnalysisContextType = {
    currentAnalysis,
    setCurrentAnalysis: setCurrentAnalysisWithLog,
    analysisHistory,
    addToHistory,
    clearHistory,
  };

  return (
    <AnalysisContext.Provider value={value}>
      {children}
    </AnalysisContext.Provider>
  );
};

export { AnalysisContext };
