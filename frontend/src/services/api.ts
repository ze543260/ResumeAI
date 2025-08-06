import axios from "axios";

// Configuração base da API
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Criar instância do axios
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 segundos
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para requisições
apiClient.interceptors.request.use(
  (config) => {
    // Adicionar token de autenticação se existir
    const token = localStorage.getItem("auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log da requisição em desenvolvimento
    if (import.meta.env.DEV) {
      console.log(
        `🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`
      );
    }

    return config;
  },
  (error) => {
    console.error("❌ Request Error:", error);
    return Promise.reject(error);
  }
);

// Interceptor para respostas
apiClient.interceptors.response.use(
  (response) => {
    // Log da resposta em desenvolvimento
    if (import.meta.env.DEV) {
      console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    }
    return response;
  },
  (error) => {
    // Tratar erros de resposta
    console.error("❌ Response Error:", error.response?.data || error.message);

    // Logout se token expirou
    if (error.response?.status === 401) {
      localStorage.removeItem("auth_token");
      // Redirecionar para login se necessário
      // window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

// Tipos para TypeScript
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface AnalysisResult {
  overallScore: number;
  strengths: string[];
  weaknesses: string[];
  suggestions: string;
  keywords: string;
  formatting: string;
  atsScore: number;
  jobMatch?: string;
  missingSkills?: string;
  customization?: string;
}

export interface FileInfo {
  id: string;
  originalName: string;
  fileName: string;
  size: number;
  uploadedAt: string;
  url: string;
}

export interface AnalysisResponse {
  file?: FileInfo;
  analysis: AnalysisResult;
  improvements: {
    suggestions: Array<{
      type: string;
      priority: string;
      suggestion: string;
    }>;
    priority: string;
    estimatedImpact: {
      currentScore: number;
      potentialScore: number;
      estimatedIncrease: number;
    };
  };
  metadata: {
    analyzedAt: string;
    hasJobComparison: boolean;
    textLength: number;
    wordCount?: number;
    resumeText?: string;
  };
}

// Serviços da API
export const apiService = {
  // Health Check
  async healthCheck(): Promise<ApiResponse> {
    const response = await apiClient.get("/health");
    return response.data;
  },

  // Análise de currículo por upload
  async uploadAndAnalyze(
    file: File,
    jobDescription?: string
  ): Promise<ApiResponse<AnalysisResponse>> {
    const formData = new FormData();
    formData.append("resume", file);
    if (jobDescription) {
      formData.append("jobDescription", jobDescription);
    }

    const response = await apiClient.post("/resume/upload-analyze", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  // Análise apenas de texto
  async analyzeText(
    resumeText: string,
    jobDescription?: string
  ): Promise<ApiResponse<AnalysisResponse>> {
    const response = await apiClient.post("/resume/analyze-text", {
      resumeText,
      jobDescription,
    });
    return response.data;
  },

  // Upload apenas
  async uploadFile(file: File): Promise<ApiResponse<{ file: FileInfo }>> {
    const formData = new FormData();
    formData.append("resume", file);

    const response = await apiClient.post("/resume/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  // Estatísticas do sistema
  async getStats(): Promise<ApiResponse> {
    const response = await apiClient.get("/resume/stats");
    return response.data;
  },

  // Health check específico do resume
  async resumeHealthCheck(): Promise<ApiResponse> {
    const response = await apiClient.get("/resume/health");
    return response.data;
  },

  // Gerar melhorias baseadas na análise
  async generateImprovements(
    analysisData: any,
    resumeText: string,
    improvementType?: string
  ): Promise<ApiResponse> {
    const response = await apiClient.post("/resume/generate-improvements", {
      analysisData,
      resumeText,
      improvementType,
    });
    return response.data;
  },

  // Gerar currículo melhorado em PDF
  async generateImprovedPdf(
    analysisData: any,
    resumeText: string
  ): Promise<Blob> {
    const response = await apiClient.post(
      "/resume/generate-improved-pdf",
      {
        analysisData,
        resumeText,
      },
      {
        responseType: "blob", // Importante para receber o PDF como blob
      }
    );
    return response.data;
  },

  // Autenticação (placeholders)
  async login(email: string, password: string): Promise<ApiResponse> {
    const response = await apiClient.post("/auth/login", { email, password });
    return response.data;
  },

  async register(
    name: string,
    email: string,
    password: string
  ): Promise<ApiResponse> {
    const response = await apiClient.post("/auth/register", {
      name,
      email,
      password,
    });
    return response.data;
  },

  async logout(): Promise<ApiResponse> {
    const response = await apiClient.post("/auth/logout");
    return response.data;
  },

  async verifyToken(): Promise<ApiResponse> {
    const response = await apiClient.get("/auth/verify");
    return response.data;
  },

  // Usuário
  async getUserProfile(): Promise<ApiResponse> {
    const response = await apiClient.get("/users/profile");
    return response.data;
  },

  async updateUserProfile(data: any): Promise<ApiResponse> {
    const response = await apiClient.put("/users/profile", data);
    return response.data;
  },

  async getUserAnalysisHistory(): Promise<ApiResponse> {
    const response = await apiClient.get("/users/analysis-history");
    return response.data;
  },
};

// Helper para tratar erros da API
export const handleApiError = (error: any): string => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.response?.data?.error) {
    return error.response.data.error;
  }
  if (error.message) {
    return error.message;
  }
  return "Erro desconhecido na API";
};

// Helper para validar se a API está online
export const checkApiConnection = async (): Promise<boolean> => {
  try {
    await apiService.healthCheck();
    return true;
  } catch (error) {
    console.error("API connection failed:", error);
    return false;
  }
};

export default apiClient;
