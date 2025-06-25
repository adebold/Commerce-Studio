/**
 * Product Q&A API Types
 * 
 * This file contains TypeScript interfaces for the Product Q&A API.
 */

// Question interface
export interface Question {
  id: string;
  productId: string;
  customerId: string | null; // null for anonymous questions
  customerName: string;
  customerEmail: string;
  content: string;
  status: QuestionStatus;
  isPublic: boolean;
  upvotes: number;
  createdAt: string;
  updatedAt: string;
  answers: Answer[];
  metadata?: Record<string, any>;
}

// Answer interface
export interface Answer {
  id: string;
  questionId: string;
  authorId: string;
  authorName: string;
  authorType: AuthorType;
  content: string;
  status: AnswerStatus;
  isPublic: boolean;
  upvotes: number;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, any>;
}

// Product interface
export interface Product {
  id: string;
  title: string;
  handle: string;
  imageUrl: string;
  questionCount: number;
}

// User interface
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

// Analytics interface
export interface QAAnalytics {
  totalQuestions: number;
  totalAnswers: number;
  averageResponseTime: number; // in hours
  topProducts: {
    productId: string;
    productTitle: string;
    questionCount: number;
  }[];
  questionsByDate: {
    date: string;
    count: number;
  }[];
  answersByDate: {
    date: string;
    count: number;
  }[];
  conversionImpact: {
    withQA: number; // conversion rate for products with Q&A
    withoutQA: number; // conversion rate for products without Q&A
  };
}

// Notification interface
export interface Notification {
  id: string;
  type: NotificationType;
  recipientId: string;
  content: string;
  read: boolean;
  createdAt: string;
}

// Enums
export enum QuestionStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  ANSWERED = 'answered',
}

export enum AnswerStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export enum AuthorType {
  MERCHANT = 'merchant',
  CUSTOMER = 'customer',
  ADMIN = 'admin',
  SYSTEM = 'system',
}

export enum UserRole {
  ADMIN = 'admin',
  MERCHANT = 'merchant',
  CUSTOMER = 'customer',
}

export enum NotificationType {
  NEW_QUESTION = 'new_question',
  NEW_ANSWER = 'new_answer',
  QUESTION_APPROVED = 'question_approved',
  ANSWER_APPROVED = 'answer_approved',
}

// Request and Response types
export interface ListQuestionsRequest {
  productId?: string;
  status?: QuestionStatus;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'upvotes';
  sortOrder?: 'asc' | 'desc';
}

export interface ListQuestionsResponse {
  questions: Question[];
  total: number;
  page: number;
  limit: number;
}

export interface CreateQuestionRequest {
  productId: string;
  customerId?: string;
  customerName: string;
  customerEmail: string;
  content: string;
  isPublic?: boolean;
  metadata?: Record<string, any>;
}

export interface CreateQuestionResponse {
  question: Question;
}

export interface CreateAnswerRequest {
  questionId: string;
  authorId: string;
  authorName: string;
  authorType: AuthorType;
  content: string;
  isPublic?: boolean;
  metadata?: Record<string, any>;
}

export interface CreateAnswerResponse {
  answer: Answer;
}

export interface UpdateQuestionRequest {
  content?: string;
  status?: QuestionStatus;
  isPublic?: boolean;
  metadata?: Record<string, any>;
}

export interface UpdateAnswerRequest {
  content?: string;
  status?: AnswerStatus;
  isPublic?: boolean;
  metadata?: Record<string, any>;
}

export interface UpvoteRequest {
  customerId?: string;
  customerEmail?: string;
}

export interface AnalyticsRequest {
  startDate?: string;
  endDate?: string;
  productId?: string;
}

export interface AnalyticsResponse {
  analytics: QAAnalytics;
}

export interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: any;
  };
}