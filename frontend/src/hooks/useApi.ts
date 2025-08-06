import { useState, useCallback } from "react";
import {
  apiService,
  handleApiError,
  type AnalysisResponse,
  type FileInfo,
} from "../services/api";

interface UseResumeAnalysisState {
  isLoading: boolean;
  isUploading: boolean;
  error: string | null;
  result: AnalysisResponse | null;
}

interface UseResumeAnalysisReturn extends UseResumeAnalysisState {
  uploadAndAnalyze: (
    file: File,
    jobDescription?: string
  ) => Promise<AnalysisResponse | null>;
  analyzeText: (text: string, jobDescription?: string) => Promise<void>;
  uploadOnly: (file: File) => Promise<{ file: unknown } | null>;
  reset: () => void;
}

export const useResumeAnalysis = (): UseResumeAnalysisReturn => {
  const [state, setState] = useState<UseResumeAnalysisState>({
    isLoading: false,
    isUploading: false,
    error: null,
    result: null,
  });

  const reset = useCallback(() => {
    setState({
      isLoading: false,
      isUploading: false,
      error: null,
      result: null,
    });
  }, []);

  const uploadAndAnalyze = useCallback(
    async (
      file: File,
      jobDescription?: string
    ): Promise<AnalysisResponse | null> => {
      setState((prev) => ({
        ...prev,
        isLoading: true,
        isUploading: true,
        error: null,
      }));

      try {
        console.log("🚀 Starting upload and analyze...", {
          fileName: file.name,
          hasJobDescription: !!jobDescription,
        });

        const response = await apiService.uploadAndAnalyze(
          file,
          jobDescription
        );

        console.log("📥 Received API response:", response);

        if (response.success && response.data) {
          console.log("✅ Analysis data received:", {
            hasAnalysis: !!response.data.analysis,
            hasFile: !!response.data.file,
            hasImprovements: !!response.data.improvements,
            overallScore: response.data.analysis?.overallScore,
            analysisKeys: Object.keys(response.data.analysis || {}),
          });

          setState((prev) => ({
            ...prev,
            isLoading: false,
            isUploading: false,
            result: response.data!,
            error: null,
          }));
          return response.data;
        } else {
          throw new Error(response.message || "Falha na análise do currículo");
        }
      } catch (error) {
        console.error("❌ Upload and analyze error:", error);
        const errorMessage = handleApiError(error);
        setState((prev) => ({
          ...prev,
          isLoading: false,
          isUploading: false,
          error: errorMessage,
          result: null,
        }));
        throw error;
      }
    },
    []
  );

  const analyzeText = useCallback(
    async (text: string, jobDescription?: string) => {
      setState((prev) => ({
        ...prev,
        isLoading: true,
        error: null,
      }));

      try {
        const response = await apiService.analyzeText(text, jobDescription);

        if (response.success && response.data) {
          setState((prev) => ({
            ...prev,
            isLoading: false,
            result: response.data!,
            error: null,
          }));
        } else {
          throw new Error(response.message || "Falha na análise do texto");
        }
      } catch (error) {
        const errorMessage = handleApiError(error);
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: errorMessage,
          result: null,
        }));
        throw error;
      }
    },
    []
  );

  const uploadOnly = useCallback(async (file: File) => {
    setState((prev) => ({
      ...prev,
      isUploading: true,
      error: null,
    }));

    try {
      const response = await apiService.uploadFile(file);

      if (response.success && response.data) {
        setState((prev) => ({
          ...prev,
          isUploading: false,
          error: null,
        }));
        return response.data;
      } else {
        throw new Error(response.message || "Falha no upload do arquivo");
      }
    } catch (error) {
      const errorMessage = handleApiError(error);
      setState((prev) => ({
        ...prev,
        isUploading: false,
        error: errorMessage,
      }));
      return null;
    }
  }, []);

  return {
    ...state,
    uploadAndAnalyze,
    analyzeText,
    uploadOnly,
    reset,
  };
};

// Hook para verificar status da API
export const useApiStatus = () => {
  const [isOnline, setIsOnline] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const checkStatus = useCallback(async () => {
    setIsChecking(true);
    try {
      await apiService.healthCheck();
      setIsOnline(true);
    } catch {
      setIsOnline(false);
    } finally {
      setIsChecking(false);
    }
  }, []);

  return {
    isOnline,
    isChecking,
    checkStatus,
  };
};

// Hook para gerenciar autenticação
export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await apiService.login(email, password);
      if (response.success) {
        // TODO: Implementar lógica de autenticação quando o backend estiver completo
        setIsAuthenticated(true);
        setUser(response.data);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await apiService.logout();
      setIsAuthenticated(false);
      setUser(null);
      localStorage.removeItem("auth_token");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      setIsLoading(true);
      try {
        const response = await apiService.register(name, email, password);
        if (response.success) {
          // TODO: Implementar lógica de registro quando o backend estiver completo
        }
        return response;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return {
    isAuthenticated,
    user,
    isLoading,
    login,
    logout,
    register,
  };
};
