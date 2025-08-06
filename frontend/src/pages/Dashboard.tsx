import React from "react";
import { Link } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Line,
  Area,
  AreaChart,
} from "recharts";
import {
  FileText,
  Upload,
  TrendingUp,
  Clock,
  CheckCircle,
  Target,
} from "lucide-react";
import { useAnalysis } from "../hooks/useAnalysis";

const scoreDistribution = [
  { range: "0-2", count: 1, fill: "#ef4444" },
  { range: "3-4", count: 2, fill: "#f59e0b" },
  { range: "5-6", count: 4, fill: "#eab308" },
  { range: "7-8", count: 10, fill: "#22c55e" },
  { range: "9-10", count: 7, fill: "#16a34a" },
];

const sectionScores = [
  { name: "Personal Info", value: 85, color: "#3b82f6" },
  { name: "Experience", value: 72, color: "#10b981" },
  { name: "Education", value: 88, color: "#f59e0b" },
  { name: "Skills", value: 79, color: "#ef4444" },
  { name: "Formatting", value: 91, color: "#8b5cf6" },
];

const weeklyTrend = [
  { day: "Mon", resumes: 3, avgScore: 7.2 },
  { day: "Tue", resumes: 5, avgScore: 8.1 },
  { day: "Wed", resumes: 2, avgScore: 7.8 },
  { day: "Thu", resumes: 4, avgScore: 8.5 },
  { day: "Fri", resumes: 6, avgScore: 8.3 },
  { day: "Sat", resumes: 2, avgScore: 9.1 },
  { day: "Sun", resumes: 2, avgScore: 8.7 },
];

const Dashboard: React.FC = () => {
  const { analysisHistory } = useAnalysis();

  // Usar dados reais quando disponíveis, senão usar dados mock
  const recentAnalyses =
    analysisHistory.length > 0
      ? analysisHistory.slice(0, 5).map((analysis, index) => ({
          id: index.toString(),
          fileName: analysis.file?.originalName || `resume_${index + 1}.pdf`,
          score: analysis.analysis.overallScore || 0,
          date: analysis.metadata.analyzedAt.split("T")[0],
          status: "completed" as const,
        }))
      : [
          {
            id: "1",
            fileName: "sample_resume.pdf",
            score: 85,
            date: "2025-01-15",
            status: "completed" as const,
          },
        ];

  const stats = {
    totalResumes: analysisHistory.length || 1,
    avgScore:
      analysisHistory.length > 0
        ? Math.round(
            analysisHistory.reduce(
              (sum, analysis) => sum + (analysis.analysis.overallScore || 0),
              0
            ) / analysisHistory.length
          )
        : 85,
    completedAnalyses: analysisHistory.length || 1,
    pendingAnalyses: 0,
    improvement: 12.5,
    topScore:
      analysisHistory.length > 0
        ? Math.max(...analysisHistory.map((a) => a.analysis.overallScore || 0))
        : 85,
  };
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6 space-y-8">
        {/* Clean Header */}
        <div className="bg-white rounded-lg border border-gray-200 p-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-medium text-gray-900 mb-2">
                Resume Analytics
              </h1>
              <p className="text-gray-600">
                Análise inteligente de currículos com insights detalhados
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm text-gray-500">Melhoria</div>
                <div className="text-2xl font-semibold text-emerald-600">
                  +{stats.improvement}%
                </div>
              </div>
              <Link
                to="/upload"
                className="bg-gray-900 text-white px-6 py-3 rounded-lg flex items-center space-x-2 hover:bg-gray-800 transition-colors"
              >
                <Upload className="h-4 w-4" />
                <span>Nova Análise</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Minimal Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total de Currículos
                </p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats.totalResumes}
                </p>
              </div>
              <div className="h-12 w-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-sm text-green-600">+12% este mês</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Score Médio</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats.avgScore}/100
                  <span className="text-lg text-gray-500">/10</span>
                </p>
              </div>
              <div className="h-12 w-12 bg-emerald-50 rounded-lg flex items-center justify-center">
                <Target className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></div>
              <span className="text-sm text-gray-600">Qualidade excelente</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Análises Completas
                </p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats.completedAnalyses}
                </p>
              </div>
              <div className="h-12 w-12 bg-purple-50 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <CheckCircle className="h-4 w-4 text-purple-500 mr-1" />
              <span className="text-sm text-gray-600">
                Prontas para revisão
              </span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Em Processamento
                </p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats.pendingAnalyses}
                </p>
              </div>
              <div className="h-12 w-12 bg-orange-50 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <Clock className="h-4 w-4 text-orange-500 mr-1" />
              <span className="text-sm text-gray-600">Em andamento</span>
            </div>
          </div>
        </div>

        {/* Clean Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Score Distribution Chart */}
          <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-6">
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-1">
                Distribuição de Scores
              </h3>
              <p className="text-sm text-gray-600">
                Breakdown da qualidade por faixa de pontuação
              </p>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={scoreDistribution}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis
                  dataKey="range"
                  tick={{ fontSize: 12, fill: "#6b7280" }}
                  axisLine={{ stroke: "#e5e7eb" }}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: "#6b7280" }}
                  axisLine={{ stroke: "#e5e7eb" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "6px",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                  }}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Section Performance */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-1">
                Performance por Seção
              </h3>
              <p className="text-sm text-gray-600">
                Scores médios por categoria
              </p>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={sectionScores}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={1}
                  dataKey="value"
                  stroke="#ffffff"
                  strokeWidth={2}
                >
                  {sectionScores.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {sectionScores.map((entry, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center text-sm">
                    <div
                      className="w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: entry.color }}
                    ></div>
                    <span className="text-gray-700">{entry.name}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {entry.value}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Weekly Activity Chart */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-1">
              Atividade Semanal
            </h3>
            <p className="text-sm text-gray-600">
              Volume de submissões e tendências de qualidade
            </p>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart
              data={weeklyTrend}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 12, fill: "#6b7280" }}
                axisLine={{ stroke: "#e5e7eb" }}
              />
              <YAxis
                tick={{ fontSize: 12, fill: "#6b7280" }}
                axisLine={{ stroke: "#e5e7eb" }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "6px",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                }}
              />
              <Area
                type="monotone"
                dataKey="resumes"
                stroke="#3b82f6"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorGradient)"
              />
              <Line
                type="monotone"
                dataKey="avgScore"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ fill: "#10b981", r: 4 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Clean Recent Analyses Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  Análises Recentes
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Últimas submissões e resultados
                </p>
              </div>
              <Link
                to="/upload"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Ver todas →
              </Link>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Documento
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Score
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Data
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentAnalyses.map((analysis) => (
                  <tr
                    key={analysis.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="bg-gray-100 p-2 rounded-lg mr-3">
                          <FileText className="h-4 w-4 text-gray-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {analysis.fileName}
                          </p>
                          <p className="text-xs text-gray-500">PDF</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {analysis.status === "completed" ? (
                        <div className="flex items-center">
                          <div className="text-sm font-medium text-gray-900">
                            {analysis.score}/10
                          </div>
                          <div className="ml-3 w-16 bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                analysis.score >= 8
                                  ? "bg-green-500"
                                  : analysis.score >= 6
                                  ? "bg-yellow-500"
                                  : "bg-red-500"
                              }`}
                              style={{ width: `${analysis.score * 10}%` }}
                            ></div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <div className="animate-spin h-4 w-4 border-2 border-gray-300 border-t-blue-600 rounded-full mr-2"></div>
                          <span className="text-sm text-gray-500">
                            Processando
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(analysis.date).toLocaleDateString("pt-BR")}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          analysis.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {analysis.status === "completed" ? (
                          <>
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Completo
                          </>
                        ) : (
                          <>
                            <Clock className="h-3 w-3 mr-1" />
                            Processando
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {analysis.status === "completed" ? (
                        <Link
                          to={`/analysis/${analysis.id}`}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          Ver Relatório
                        </Link>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
