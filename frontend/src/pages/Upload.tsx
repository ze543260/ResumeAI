import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import {
  Upload,
  FileText,
  AlertCircle,
  CheckCircle,
  X,
  Loader2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useResumeAnalysis } from "../hooks/useApi";
import { useAnalysis } from "../hooks/useAnalysis";

interface UploadedFile {
  file: File;
  id: string;
  status: "pending" | "uploading" | "completed" | "error";
  progress: number;
  error?: string;
}

const UploadPage: React.FC = () => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [jobDescription, setJobDescription] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const navigate = useNavigate();
  const { uploadAndAnalyze, error: apiError } = useResumeAnalysis();
  const { setCurrentAnalysis, addToHistory } = useAnalysis();

  const handleFileUpload = useCallback(
    async (uploadedFile: UploadedFile) => {
      try {
        // Atualizar status para uploading
        setUploadedFiles((prev) =>
          prev.map((f) =>
            f.id === uploadedFile.id
              ? { ...f, status: "uploading" as const, progress: 50 }
              : f
          )
        );

        setIsAnalyzing(true);

        // Fazer upload e análise
        const response = await uploadAndAnalyze(
          uploadedFile.file,
          jobDescription || undefined
        );

        // Sucesso - atualizar status
        setUploadedFiles((prev) =>
          prev.map((f) =>
            f.id === uploadedFile.id
              ? { ...f, status: "completed" as const, progress: 100 }
              : f
          )
        );

        // Salvar resultado no contexto se a análise foi bem-sucedida
        if (response) {
          setCurrentAnalysis(response);
          addToHistory(response);
        }

        // Navegar para a página de análise após 1 segundo
        setTimeout(() => {
          navigate("/analysis");
        }, 1000);
      } catch (error) {
        // Erro - atualizar status
        const errorMessage =
          error instanceof Error ? error.message : "Erro no upload";
        setUploadedFiles((prev) =>
          prev.map((f) =>
            f.id === uploadedFile.id
              ? {
                  ...f,
                  status: "error" as const,
                  progress: 0,
                  error: errorMessage,
                }
              : f
          )
        );
      } finally {
        setIsAnalyzing(false);
      }
    },
    [
      uploadAndAnalyze,
      jobDescription,
      navigate,
      setCurrentAnalysis,
      addToHistory,
    ]
  );

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const newFiles: UploadedFile[] = acceptedFiles.map((file) => ({
        file,
        id: Math.random().toString(36).substr(2, 9),
        status: "pending",
        progress: 0,
      }));

      setUploadedFiles((prev) => [...prev, ...newFiles]);

      // Processar cada arquivo
      newFiles.forEach((uploadedFile) => {
        handleFileUpload(uploadedFile);
      });
    },
    [handleFileUpload]
  );

  const removeFile = (fileId: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  const viewAnalysis = (fileId: string) => {
    navigate(`/analysis/${fileId}`);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
    },
    maxFiles: 5,
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Upload Resume</h1>
        <p className="text-gray-600 mt-1">
          Upload your resume files for AI-powered analysis and insights
        </p>
      </div>

      {/* Job Description (Optional) */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Job Description (Optional)
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Add a job description to get more targeted analysis and
          recommendations
        </p>
        <textarea
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          placeholder="Paste the job description here..."
          className="w-full h-32 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
        {jobDescription && (
          <p className="text-xs text-gray-500 mt-2">
            {jobDescription.length} characters
          </p>
        )}
      </div>

      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${
            isDragActive
              ? "border-primary-400 bg-primary-50"
              : "border-gray-300 hover:border-primary-400 hover:bg-gray-50"
          }
        `}
      >
        <input {...getInputProps()} />
        <div className="space-y-4">
          <Upload
            className={`mx-auto h-12 w-12 ${
              isDragActive ? "text-primary-600" : "text-gray-400"
            }`}
          />
          <div>
            <p className="text-lg font-medium text-gray-900">
              {isDragActive
                ? "Drop files here"
                : "Drag & drop resume files here"}
            </p>
            <p className="text-gray-600">or click to browse files</p>
          </div>
          <div className="text-sm text-gray-500">
            <p>Supported formats: PDF, DOC, DOCX</p>
            <p>Maximum file size: 10MB</p>
            <p>Maximum files: 5 at once</p>
          </div>
        </div>
      </div>

      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Uploaded Files
            </h3>
          </div>
          <div className="p-4 space-y-4">
            {uploadedFiles.map((uploadedFile) => (
              <div
                key={uploadedFile.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
              >
                <div className="flex items-center space-x-3 flex-1">
                  <FileText className="h-8 w-8 text-gray-400" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {uploadedFile.file.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {(uploadedFile.file.size / 1024 / 1024).toFixed(2)} MB
                    </p>

                    {/* Progress Bar */}
                    {uploadedFile.status === "uploading" && (
                      <div className="mt-2">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${uploadedFile.progress}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Analyzing... {Math.round(uploadedFile.progress)}%
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Status & Actions */}
                <div className="flex items-center space-x-3">
                  {uploadedFile.status === "pending" && (
                    <div className="flex items-center space-x-2 text-yellow-600">
                      <AlertCircle className="h-4 w-4" />
                      <span className="text-sm">Pending</span>
                    </div>
                  )}

                  {uploadedFile.status === "uploading" && (
                    <div className="flex items-center space-x-2 text-blue-600">
                      <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full" />
                      <span className="text-sm">Processing</span>
                    </div>
                  )}

                  {uploadedFile.status === "completed" && (
                    <>
                      <div className="flex items-center space-x-2 text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        <span className="text-sm">Completed</span>
                      </div>
                      <button
                        onClick={() => viewAnalysis(uploadedFile.id)}
                        className="px-3 py-1 text-sm bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors"
                      >
                        View Analysis
                      </button>
                    </>
                  )}

                  {uploadedFile.status === "error" && (
                    <div className="flex items-center space-x-2 text-red-600">
                      <AlertCircle className="h-4 w-4" />
                      <span className="text-sm">Error</span>
                    </div>
                  )}

                  <button
                    onClick={() => removeFile(uploadedFile.id)}
                    className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">
          💡 Tips for Better Analysis
        </h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li>• Ensure your resume is well-formatted and readable</li>
          <li>
            • Include clear section headings (Experience, Education, Skills,
            etc.)
          </li>
          <li>• Use standard fonts and avoid complex layouts</li>
          <li>• Make sure all text is selectable (not scanned images)</li>
          <li>• Include quantifiable achievements and metrics</li>
        </ul>
      </div>
    </div>
  );
};

export default UploadPage;
