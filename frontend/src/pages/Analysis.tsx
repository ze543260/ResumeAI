import React, { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import {
  ArrowLeft,
  Download,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  Loader2,
} from "lucide-react";
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
import { apiService } from "../services/api";

const Analysis: React.FC = () => {
  const { currentAnalysis } = useAnalysis();
  const [improvements, setImprovements] = useState<any>(null);
  const [loadingImprovements, setLoadingImprovements] = useState(false);
  const [showImprovements, setShowImprovements] = useState(false);
  const [generatingPdf, setGeneratingPdf] = useState(false);

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

  // Função para gerar melhorias com IA
  const handleGenerateImprovements = async () => {
    try {
      setLoadingImprovements(true);

      console.log("🔍 Debug - Analysis object:", analysis);
      console.log("🔍 Debug - Analysis data:", analysis.analysis);
      console.log("🔍 Debug - Metadata:", analysis.metadata);
      console.log(
        "🔍 Debug - Resume text exists?",
        !!analysis.metadata?.resumeText
      );
      console.log(
        "🔍 Debug - Resume text length:",
        analysis.metadata?.resumeText?.length || 0
      );

      const response = await apiService.generateImprovements(
        analysis.analysis,
        analysis.metadata?.resumeText ||
          "Sample resume text for improvement generation",
        "general"
      );

      if (response.success) {
        setImprovements(response.data.improvements);
        setShowImprovements(true);
      }
    } catch (error) {
      console.error("Error generating improvements:", error);
    } finally {
      setLoadingImprovements(false);
    }
  };

  // Função para gerar PDF melhorado
  const handleGenerateImprovedPdf = async () => {
    try {
      setGeneratingPdf(true);

      console.log("🔍 Generating improved PDF...");

      const pdfBlob = await apiService.generateImprovedPdf(
        analysis.analysis,
        analysis.metadata?.resumeText ||
          "Sample resume text for improvement generation"
      );

      // Criar download do PDF
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `resume_improved_${Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      console.log("✅ PDF generated and downloaded successfully");
    } catch (error) {
      console.error("Error generating improved PDF:", error);
      alert("Erro ao gerar PDF melhorado. Tente novamente.");
    } finally {
      setGeneratingPdf(false);
    }
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
          <button
            onClick={handleGenerateImprovements}
            disabled={loadingImprovements}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loadingImprovements ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Lightbulb className="h-4 w-4" />
            )}
            <span>
              {loadingImprovements ? "Generating..." : "AI Improvements"}
            </span>
          </button>
          <button
            onClick={handleGenerateImprovedPdf}
            disabled={generatingPdf}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {generatingPdf ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            <span>
              {generatingPdf ? "Generating PDF..." : "Download Improved CV"}
            </span>
          </button>
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

      {/* AI Improvements Section */}
      {showImprovements && improvements && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border-2 border-blue-200">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Lightbulb className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-2xl font-semibold text-gray-900">
                  AI-Powered Improvements
                </h3>
                <p className="text-gray-600">
                  Personalized suggestions to enhance your resume
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowImprovements(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Priority Improvements */}
            <div className="bg-white rounded-lg p-5 border border-blue-100 shadow-sm">
              <h4 className="text-lg font-semibold text-red-700 mb-3 flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2" />
                Priority Improvements
              </h4>
              <div className="space-y-2">
                {improvements.priorityImprovements && (
                  <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {typeof improvements.priorityImprovements === "string"
                      ? improvements.priorityImprovements
                      : improvements.priorityImprovements.join("\n• ")}
                  </div>
                )}
              </div>
            </div>

            {/* Content Enhancements */}
            <div className="bg-white rounded-lg p-5 border border-blue-100 shadow-sm">
              <h4 className="text-lg font-semibold text-blue-700 mb-3 flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Content Enhancements
              </h4>
              <div className="space-y-2">
                {improvements.contentEnhancements && (
                  <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {typeof improvements.contentEnhancements === "string"
                      ? improvements.contentEnhancements
                      : improvements.contentEnhancements.join("\n• ")}
                  </div>
                )}
              </div>
            </div>

            {/* Format Optimizations */}
            <div className="bg-white rounded-lg p-5 border border-blue-100 shadow-sm">
              <h4 className="text-lg font-semibold text-green-700 mb-3">
                Format & Structure
              </h4>
              <div className="space-y-2">
                {improvements.formatOptimizations && (
                  <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {typeof improvements.formatOptimizations === "string"
                      ? improvements.formatOptimizations
                      : improvements.formatOptimizations.join("\n• ")}
                  </div>
                )}
              </div>
            </div>

            {/* Keyword Improvements */}
            <div className="bg-white rounded-lg p-5 border border-blue-100 shadow-sm">
              <h4 className="text-lg font-semibold text-purple-700 mb-3">
                Keywords & ATS
              </h4>
              <div className="space-y-2">
                {improvements.keywordImprovements && (
                  <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {typeof improvements.keywordImprovements === "string"
                      ? improvements.keywordImprovements
                      : improvements.keywordImprovements.join("\n• ")}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Estimated Impact */}
          {improvements.estimatedImpact && (
            <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="text-lg font-semibold text-yellow-800 mb-2">
                📊 Estimated Impact
              </h4>
              <div className="text-yellow-700 whitespace-pre-line">
                {improvements.estimatedImpact}
              </div>
            </div>
          )}
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
