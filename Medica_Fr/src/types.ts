// types.ts
export interface Option {
    id: string;
    text: string;
  }
  
  export interface Question {
    id: string;
    text: string;
    options: Option[];
  }
  
  export interface Symptom {
    id: string;
    name: string;
    questions: Question[];
  }
  
  export interface Condition {
    name: string;
    confidence: number;
    urgency: 'low' | 'medium' | 'high';
    recommendations: string[];
  }
  
  export interface UserResponses {
    [symptomId: string]: {
      [questionType: string]: string;
    };
  }

  // First, let's define an interface for our API responses
export interface ApiResponse {
    [key: string]: Symptom;
  }