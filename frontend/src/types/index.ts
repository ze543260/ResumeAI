export interface Resume {
  id: string;
  fileName: string;
  uploadDate: Date;
  status: "processing" | "completed" | "error";
  analysis?: ResumeAnalysis;
}

export interface ResumeAnalysis {
  id: string;
  resumeId: string;
  overallScore: number;
  sections: {
    personalInfo: SectionAnalysis;
    experience: SectionAnalysis;
    education: SectionAnalysis;
    skills: SectionAnalysis;
    formatting: SectionAnalysis;
  };
  extractedData: ExtractedData;
  suggestions: string[];
  createdAt: Date;
}

export interface SectionAnalysis {
  score: number;
  feedback: string;
  improvements: string[];
}

export interface ExtractedData {
  personalInfo: {
    name?: string;
    email?: string;
    phone?: string;
    location?: string;
    linkedin?: string;
  };
  experience: Experience[];
  education: Education[];
  skills: string[];
}

export interface Experience {
  company: string;
  position: string;
  startDate: string;
  endDate?: string;
  description: string;
  current: boolean;
}

export interface Education {
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate?: string;
  gpa?: string;
}

export interface JobPosting {
  id: string;
  title: string;
  company: string;
  requirements: string[];
  description: string;
  matchScore?: number;
}
