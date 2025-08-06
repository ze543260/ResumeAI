import React from "react";
import { Link, Navigate } from "react-router-dom";
import { ArrowLeft, Download, TrendingUp, AlertTriangle } from "lucide-react";
import {
  RadialBarChart,
  RadialBar,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { useAnalysis } from "../hooks/useAnalysis";

const Analysis: React.FC = () => {
  const { currentAnalysis } = useAnalysis();

  // Se não há análise atual, redireciona para upload
  if (!currentAnalysis) {
    return <Navigate to="/upload" replace />;
  }

  const analysis = currentAnalysis;

  // Helper function to safely get score
  const getScore = (
    score: number | null | undefined,
    fallback: number = 0
  ): number => {
    return typeof score === "number" && !isNaN(score) ? score : fallback;
  };

  // Helper function to format text lists from AI response
  const formatList = (text: string | string[] | undefined) => {
    if (!text) return [];

    // If it's already an array, return it
    if (Array.isArray(text)) {
      return text.filter((item) => item && item.trim().length > 0);
    }

    // If it's a string, split and clean it
    return text
      .split(/\n|•|\*|-|\./)
      .map((item) => item.trim())
      .filter((item) => item && item.length > 3 && !item.match(/^\d+\.?\s*$/)); // Filter out numbers and very short items
  };

  // Cria dados para os gráficos baseados na análise real
  const overallScore = getScore(analysis.analysis.overallScore, 0);
  const atsScore = getScore(analysis.analysis.atsScore, 0);

  const overallScoreData = [
    { name: "Score", value: overallScore, fill: "#3b82f6" },
  ];

  // Dados das seções - usando valores reais da análise
  const sectionData = [
    {
      name: "Overall",
      score: overallScore,
      color: "#3b82f6",
    },
    {
      name: "ATS Score",
      score: atsScore,
      color: "#ef4444",
    },
  ];

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return "bg-green-50 border-green-200";
    if (score >= 60) return "bg-yellow-50 border-yellow-200";
    return "bg-red-50 border-red-200";
  };

  // Debug: log the analysis data
  console.log("📊 Analysis data in component:", {
    overallScore,
    atsScore,
    strengthsType: typeof analysis.analysis.strengths,
    strengthsValue: analysis.analysis.strengths,
    analysisKeys: Object.keys(analysis.analysis),
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            to="/"
            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Resume Analysis
            </h1>
            <p className="text-gray-600 mt-1">
              {analysis.file?.originalName || "Resume"}
            </p>
          </div>
        </div>
        <div className="flex space-x-3">
          <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Download className="h-4 w-4" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Overall Score */}
      <div
        className={`rounded-lg p-6 border-2 ${getScoreBgColor(overallScore)}`}
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Overall Score</h2>
            <p className="text-gray-600">
              Comprehensive analysis of your resume
            </p>
          </div>
          <div className="text-right">
            <div
              className={`text-4xl font-bold ${getScoreColor(overallScore)}`}
            >
              {overallScore}/100
            </div>
            <div className="w-24 h-24 mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart
                  cx="50%"
                  cy="50%"
                  innerRadius="60%"
                  outerRadius="90%"
                  data={overallScoreData}
                  startAngle={90}
                  endAngle={-270}
                >
                  <RadialBar dataKey="value" cornerRadius={10} fill="#3b82f6" />
                </RadialBarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Section Scores */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          Detailed Scores
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={sectionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Bar dataKey="score" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Strengths */}
      {analysis.analysis.strengths && (
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center space-x-2 mb-4">
            <TrendingUp className="h-5 w-5 text-green-600" />
            <h3 className="text-xl font-semibold text-gray-900">Strengths</h3>
          </div>
          <div className="space-y-2">
            {formatList(analysis.analysis.strengths).length > 0 ? (
              <ul className="space-y-2">
                {formatList(analysis.analysis.strengths).map(
                  (strength, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <span className="text-green-600 font-bold">•</span>
                      <span className="text-gray-700">{strength}</span>
                    </li>
                  )
                )}
              </ul>
            ) : (
              <div className="prose max-w-none">
                <p className="text-gray-700">{analysis.analysis.strengths}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Weaknesses */}
      {analysis.analysis.weaknesses && (
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center space-x-2 mb-4">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <h3 className="text-xl font-semibold text-gray-900">
              Areas for Improvement
            </h3>
          </div>
          <div className="space-y-2">
            {formatList(analysis.analysis.weaknesses).length > 0 ? (
              <ul className="space-y-2">
                {formatList(analysis.analysis.weaknesses).map(
                  (weakness, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <span className="text-red-600 font-bold">•</span>
                      <span className="text-gray-700">{weakness}</span>
                    </li>
                  )
                )}
              </ul>
            ) : (
              <div className="prose max-w-none">
                <p className="text-gray-700">{analysis.analysis.weaknesses}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Suggestions */}
      {analysis.analysis.suggestions && (
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Suggestions for Improvement
          </h3>
          <div className="space-y-2">
            {formatList(analysis.analysis.suggestions).length > 0 ? (
              <ul className="space-y-2">
                {formatList(analysis.analysis.suggestions).map(
                  (suggestion, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <span className="text-blue-600 font-bold">•</span>
                      <span className="text-gray-700">{suggestion}</span>
                    </li>
                  )
                )}
              </ul>
            ) : (
              <div className="prose max-w-none">
                <p className="text-gray-700">{analysis.analysis.suggestions}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Keywords */}
      {analysis.analysis.keywords && (
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Keywords Analysis
          </h3>
          <div className="prose max-w-none">
            <p className="text-gray-700">{analysis.analysis.keywords}</p>
          </div>
        </div>
      )}

      {/* Formatting */}
      {analysis.analysis.formatting && (
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Formatting Analysis
          </h3>
          <div className="prose max-w-none">
            <p className="text-gray-700">{analysis.analysis.formatting}</p>
          </div>
        </div>
      )}

      {/* Debug Info */}
      <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          Analysis Summary
        </h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-semibold">Overall Score:</span> {overallScore}
            /100
          </div>
          <div>
            <span className="font-semibold">ATS Score:</span> {atsScore}/100
          </div>
          <div>
            <span className="font-semibold">File Name:</span>{" "}
            {analysis.file?.originalName}
          </div>
          <div>
            <span className="font-semibold">Analysis Date:</span>{" "}
            {new Date(analysis.metadata.analyzedAt).toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analysis;
