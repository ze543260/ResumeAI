import React from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import {
  ArrowLeft,
  Download,
  User,
  Briefcase,
  GraduationCap,
  Code,
  FileText,
  TrendingUp,
  AlertTriangle,
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

const Analysis: React.FC = () => {
  const { currentAnalysis } = useAnalysis();

  // Se não há análise atual, redireciona para upload
  if (!currentAnalysis) {
    return <Navigate to="/upload" replace />;
  }

  const analysis = currentAnalysis;

  // Cria dados para os gráficos baseados na análise real
  const overallScoreData = [
    { name: "Score", value: (analysis.analysis.overallScore || 0), fill: "#3b82f6" },
  ];

  // Dados das seções - usando valores reais da análise
  const sectionData = [
    {
      name: "Strengths",
      score: analysis.analysis.strengths?.length ? analysis.analysis.strengths.length * 20 : 0,
      color: "#10b981",
    },
    {
      name: "Keywords",
      score: analysis.analysis.keywords ? 75 : 0,
      color: "#f59e0b",
    },
    {
      name: "Formatting",
      score: analysis.analysis.formatting ? 80 : 0,
      color: "#8b5cf6",
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
            <p className="text-gray-600 mt-1">{analysis.file?.originalName || 'Resume'}</p>
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
            <div className="w-24 h-24">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart
                  cx="50%"
                  cy="50%"
                  innerRadius="60%"
                  outerRadius="90%"
                  data={overallScoreData}
                >
                  <RadialBar dataKey="value" cornerRadius={10} fill="#3b82f6" />
                </RadialBarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Section Scores */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Section Performance
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={sectionData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" domain={[0, 100]} />
              <YAxis dataKey="name" type="category" width={80} />
              <Tooltip />
              <Bar dataKey="score" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Section Breakdown
          </h3>
          <div className="space-y-4">
            {Object.entries(mockAnalysis.sections).map(([key, section]) => {
              const icons = {
                personalInfo: User,
                experience: Briefcase,
                education: GraduationCap,
                skills: Code,
                formatting: FileText,
              };
              const IconComponent = icons[key as keyof typeof icons];

              return (
                <div
                  key={key}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <IconComponent className="h-5 w-5 text-gray-600" />
                    <span className="font-medium text-gray-900 capitalize">
                      {key
                        .replace(/([A-Z])/g, " $1")
                        .replace(/^./, (str) => str.toUpperCase())}
                    </span>
                  </div>
                  <span className={`font-bold ${getScoreColor(section.score)}`}>
                    {section.score}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Extracted Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Extracted Information
          </h3>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">
                Personal Information
              </h4>
              <div className="text-sm text-gray-600 space-y-1">
                <p>
                  <span className="font-medium">Name:</span>{" "}
                  {mockAnalysis.extractedData.personalInfo.name}
                </p>
                <p>
                  <span className="font-medium">Email:</span>{" "}
                  {mockAnalysis.extractedData.personalInfo.email}
                </p>
                <p>
                  <span className="font-medium">Phone:</span>{" "}
                  {mockAnalysis.extractedData.personalInfo.phone}
                </p>
                <p>
                  <span className="font-medium">Location:</span>{" "}
                  {mockAnalysis.extractedData.personalInfo.location}
                </p>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-2">
                Skills Identified
              </h4>
              <div className="flex flex-wrap gap-2">
                {mockAnalysis.extractedData.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Work Experience
          </h3>
          <div className="space-y-4">
            {mockAnalysis.extractedData.experience.map((exp, index) => (
              <div key={index} className="border-l-4 border-primary-200 pl-4">
                <h4 className="font-medium text-gray-900">{exp.position}</h4>
                <p className="text-sm text-gray-600">{exp.company}</p>
                <p className="text-xs text-gray-500">
                  {exp.startDate} - {exp.endDate || "Present"}
                </p>
                <p className="text-sm text-gray-700 mt-1">{exp.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detailed Feedback */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            <span>Strengths</span>
          </h3>
          <div className="space-y-3">
            {Object.entries(mockAnalysis.sections).map(([key, section]) => (
              <div
                key={key}
                className="p-3 bg-green-50 border border-green-200 rounded-lg"
              >
                <h4 className="font-medium text-green-900 capitalize mb-1">
                  {key.replace(/([A-Z])/g, " $1")}
                </h4>
                <p className="text-sm text-green-800">{section.feedback}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            <span>Recommendations</span>
          </h3>
          <div className="space-y-3">
            {mockAnalysis.suggestions.map((suggestion, index) => (
              <div
                key={index}
                className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg"
              >
                <p className="text-sm text-yellow-800">{suggestion}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analysis;
