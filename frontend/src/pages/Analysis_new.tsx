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

  // Cria dados para os gráficos baseados na análise real
  const overallScoreData = [
    {
      name: "Score",
      value: analysis.analysis.overallScore || 0,
      fill: "#3b82f6",
    },
  ];

  // Dados das seções - usando valores reais da análise
  const sectionData = [
    {
      name: "Overall",
      score: analysis.analysis.overallScore || 0,
      color: "#3b82f6",
    },
    {
      name: "ATS Score",
      score: analysis.analysis.atsScore || 0,
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

  const formatList = (text: string) => {
    if (!text) return [];
    return text.split("\n").filter((item) => item.trim());
  };

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
        className={`rounded-lg p-6 border-2 ${getScoreBgColor(
          analysis.analysis.overallScore
        )}`}
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
              className={`text-4xl font-bold ${getScoreColor(
                analysis.analysis.overallScore
              )}`}
            >
              {analysis.analysis.overallScore}/100
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
      {analysis.analysis.strengths &&
        analysis.analysis.strengths.length > 0 && (
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center space-x-2 mb-4">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <h3 className="text-xl font-semibold text-gray-900">Strengths</h3>
            </div>
            <ul className="space-y-2">
              {analysis.analysis.strengths.map((strength, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <span className="text-green-600 font-bold">•</span>
                  <span className="text-gray-700">{strength}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

      {/* Weaknesses */}
      {analysis.analysis.weaknesses &&
        analysis.analysis.weaknesses.length > 0 && (
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center space-x-2 mb-4">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <h3 className="text-xl font-semibold text-gray-900">
                Areas for Improvement
              </h3>
            </div>
            <ul className="space-y-2">
              {analysis.analysis.weaknesses.map((weakness, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <span className="text-red-600 font-bold">•</span>
                  <span className="text-gray-700">{weakness}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

      {/* Suggestions */}
      {analysis.analysis.suggestions && (
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Suggestions for Improvement
          </h3>
          <div className="prose max-w-none">
            {formatList(analysis.analysis.suggestions).map(
              (suggestion, index) => (
                <p key={index} className="text-gray-700 mb-2">
                  {suggestion}
                </p>
              )
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
            {formatList(analysis.analysis.keywords).map((keyword, index) => (
              <p key={index} className="text-gray-700 mb-2">
                {keyword}
              </p>
            ))}
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
            {formatList(analysis.analysis.formatting).map((format, index) => (
              <p key={index} className="text-gray-700 mb-2">
                {format}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Raw Analysis */}
      {analysis.analysis && (
        <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Complete Analysis
          </h3>
          <div className="prose max-w-none text-sm">
            <pre className="whitespace-pre-wrap text-gray-700 bg-white p-4 rounded border">
              {JSON.stringify(analysis.analysis, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analysis;
