/**
 * Product Q&A API
 * 
 * This file contains the main API handlers for the Product Q&A app.
 */

// Define our own request and response types since this is a placeholder integration
interface NextApiRequest {
  method?: string;
  query: Record<string, string | string[]>;
  body: any;
}

interface NextApiResponse {
  status: (code: number) => NextApiResponse;
  json: (data: any) => void;
  end: () => void;
}
import {
  Question,
  Answer,
  QuestionStatus,
  AnswerStatus,
  AuthorType,
  CreateQuestionRequest,
  CreateAnswerRequest,
  UpdateQuestionRequest,
  UpdateAnswerRequest,
  ListQuestionsRequest,
  ErrorResponse
} from './types';

// Mock data for demonstration purposes
const mockQuestions: Question[] = [
  {
    id: 'q1',
    productId: 'p1',
    customerId: 'c1',
    customerName: 'John Doe',
    customerEmail: 'john@example.com',
    content: 'Do these frames come in other colors?',
    status: QuestionStatus.ANSWERED,
    isPublic: true,
    upvotes: 5,
    createdAt: '2025-04-15T10:30:00Z',
    updatedAt: '2025-04-15T10:30:00Z',
    answers: [
      {
        id: 'a1',
        questionId: 'q1',
        authorId: 'm1',
        authorName: 'Store Owner',
        authorType: AuthorType.MERCHANT,
        content: 'Yes, these frames are available in black, tortoise, and clear.',
        status: AnswerStatus.APPROVED,
        isPublic: true,
        upvotes: 2,
        createdAt: '2025-04-15T11:30:00Z',
        updatedAt: '2025-04-15T11:30:00Z',
      }
    ]
  },
  {
    id: 'q2',
    productId: 'p1',
    customerId: 'c2',
    customerName: 'Jane Smith',
    customerEmail: 'jane@example.com',
    content: 'Are these frames suitable for high prescription lenses?',
    status: QuestionStatus.PENDING,
    isPublic: true,
    upvotes: 3,
    createdAt: '2025-04-16T09:15:00Z',
    updatedAt: '2025-04-16T09:15:00Z',
    answers: []
  }
];

/**
 * API handler for questions
 */
export const handleQuestions = async (req: NextApiRequest, res: NextApiResponse) => {
  const { method } = req;

  try {
    switch (method) {
      case 'GET':
        return getQuestions(req, res);
      case 'POST':
        return createQuestion(req, res);
      default:
        return res.status(405).json({ error: { code: 'method_not_allowed', message: 'Method not allowed' } });
    }
  } catch (error) {
    console.error('Error handling questions:', error);
    return res.status(500).json({ 
      error: { 
        code: 'internal_server_error', 
        message: 'An unexpected error occurred' 
      } 
    });
  }
};

/**
 * API handler for a specific question
 */
export const handleQuestion = async (req: NextApiRequest, res: NextApiResponse) => {
  const { method } = req;
  const { id } = req.query;

  try {
    switch (method) {
      case 'GET':
        return getQuestion(req, res, id as string);
      case 'PUT':
        return updateQuestion(req, res, id as string);
      case 'DELETE':
        return deleteQuestion(req, res, id as string);
      default:
        return res.status(405).json({ error: { code: 'method_not_allowed', message: 'Method not allowed' } });
    }
  } catch (error) {
    console.error(`Error handling question ${id}:`, error);
    return res.status(500).json({ 
      error: { 
        code: 'internal_server_error', 
        message: 'An unexpected error occurred' 
      } 
    });
  }
};

/**
 * API handler for answers to a specific question
 */
export const handleAnswers = async (req: NextApiRequest, res: NextApiResponse) => {
  const { method } = req;
  const { questionId } = req.query;

  try {
    switch (method) {
      case 'GET':
        return getAnswers(req, res, questionId as string);
      case 'POST':
        return createAnswer(req, res, questionId as string);
      default:
        return res.status(405).json({ error: { code: 'method_not_allowed', message: 'Method not allowed' } });
    }
  } catch (error) {
    console.error(`Error handling answers for question ${questionId}:`, error);
    return res.status(500).json({ 
      error: { 
        code: 'internal_server_error', 
        message: 'An unexpected error occurred' 
      } 
    });
  }
};

/**
 * API handler for a specific answer
 */
export const handleAnswer = async (req: NextApiRequest, res: NextApiResponse) => {
  const { method } = req;
  const { id } = req.query;

  try {
    switch (method) {
      case 'GET':
        return getAnswer(req, res, id as string);
      case 'PUT':
        return updateAnswer(req, res, id as string);
      case 'DELETE':
        return deleteAnswer(req, res, id as string);
      default:
        return res.status(405).json({ error: { code: 'method_not_allowed', message: 'Method not allowed' } });
    }
  } catch (error) {
    console.error(`Error handling answer ${id}:`, error);
    return res.status(500).json({ 
      error: { 
        code: 'internal_server_error', 
        message: 'An unexpected error occurred' 
      } 
    });
  }
};

/**
 * Get questions
 */
const getQuestions = async (req: NextApiRequest, res: NextApiResponse) => {
  const { productId, status, page = '1', limit = '10', sortBy = 'createdAt', sortOrder = 'desc' } = req.query as Record<string, string>;
  
  // Filter questions based on query parameters
  let filteredQuestions = [...mockQuestions];
  
  if (productId) {
    filteredQuestions = filteredQuestions.filter(q => q.productId === productId);
  }
  
  if (status) {
    filteredQuestions = filteredQuestions.filter(q => q.status === status);
  }
  
  // Sort questions
  filteredQuestions.sort((a, b) => {
    if (sortBy === 'upvotes') {
      return sortOrder === 'desc' ? b.upvotes - a.upvotes : a.upvotes - b.upvotes;
    } else {
      return sortOrder === 'desc' 
        ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        : new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    }
  });
  
  // Paginate questions
  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const startIndex = (pageNum - 1) * limitNum;
  const endIndex = pageNum * limitNum;
  const paginatedQuestions = filteredQuestions.slice(startIndex, endIndex);
  
  return res.status(200).json({
    questions: paginatedQuestions,
    total: filteredQuestions.length,
    page: pageNum,
    limit: limitNum
  });
};

/**
 * Get a specific question
 */
const getQuestion = async (req: NextApiRequest, res: NextApiResponse, id: string) => {
  const question = mockQuestions.find(q => q.id === id);
  
  if (!question) {
    return res.status(404).json({ 
      error: { 
        code: 'question_not_found', 
        message: 'Question not found' 
      } 
    });
  }
  
  return res.status(200).json({ question });
};

/**
 * Create a new question
 */
const createQuestion = async (req: NextApiRequest, res: NextApiResponse) => {
  const { productId, customerId, customerName, customerEmail, content, isPublic = true, metadata } = req.body as CreateQuestionRequest;
  
  // Validate required fields
  if (!productId || !customerName || !customerEmail || !content) {
    return res.status(400).json({ 
      error: { 
        code: 'invalid_request', 
        message: 'Missing required fields' 
      } 
    });
  }
  
  // Create new question
  const newQuestion: Question = {
    id: `q${mockQuestions.length + 1}`,
    productId,
    customerId: customerId || null,
    customerName,
    customerEmail,
    content,
    status: QuestionStatus.PENDING,
    isPublic,
    upvotes: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    answers: [],
    metadata
  };
  
  // Add to mock data (in a real app, this would be saved to a database)
  mockQuestions.push(newQuestion);
  
  return res.status(201).json({ question: newQuestion });
};

/**
 * Update a question
 */
const updateQuestion = async (req: NextApiRequest, res: NextApiResponse, id: string) => {
  const { content, status, isPublic, metadata } = req.body as UpdateQuestionRequest;
  
  const questionIndex = mockQuestions.findIndex(q => q.id === id);
  
  if (questionIndex === -1) {
    return res.status(404).json({ 
      error: { 
        code: 'question_not_found', 
        message: 'Question not found' 
      } 
    });
  }
  
  // Update question
  const updatedQuestion = {
    ...mockQuestions[questionIndex],
    ...(content && { content }),
    ...(status && { status }),
    ...(isPublic !== undefined && { isPublic }),
    ...(metadata && { metadata }),
    updatedAt: new Date().toISOString()
  };
  
  mockQuestions[questionIndex] = updatedQuestion;
  
  return res.status(200).json({ question: updatedQuestion });
};

/**
 * Delete a question
 */
const deleteQuestion = async (req: NextApiRequest, res: NextApiResponse, id: string) => {
  const questionIndex = mockQuestions.findIndex(q => q.id === id);
  
  if (questionIndex === -1) {
    return res.status(404).json({ 
      error: { 
        code: 'question_not_found', 
        message: 'Question not found' 
      } 
    });
  }
  
  // Remove question from mock data
  mockQuestions.splice(questionIndex, 1);
  
  return res.status(204).end();
};

/**
 * Get answers for a question
 */
const getAnswers = async (req: NextApiRequest, res: NextApiResponse, questionId: string) => {
  const question = mockQuestions.find(q => q.id === questionId);
  
  if (!question) {
    return res.status(404).json({ 
      error: { 
        code: 'question_not_found', 
        message: 'Question not found' 
      } 
    });
  }
  
  return res.status(200).json({ answers: question.answers });
};

/**
 * Create a new answer
 */
const createAnswer = async (req: NextApiRequest, res: NextApiResponse, questionId: string) => {
  const { authorId, authorName, authorType, content, isPublic = true, metadata } = req.body as CreateAnswerRequest;
  
  const questionIndex = mockQuestions.findIndex(q => q.id === questionId);
  
  if (questionIndex === -1) {
    return res.status(404).json({ 
      error: { 
        code: 'question_not_found', 
        message: 'Question not found' 
      } 
    });
  }
  
  // Validate required fields
  if (!authorId || !authorName || !authorType || !content) {
    return res.status(400).json({ 
      error: { 
        code: 'invalid_request', 
        message: 'Missing required fields' 
      } 
    });
  }
  
  // Create new answer
  const newAnswer: Answer = {
    id: `a${mockQuestions[questionIndex].answers.length + 1}`,
    questionId,
    authorId,
    authorName,
    authorType,
    content,
    status: AnswerStatus.PENDING,
    isPublic,
    upvotes: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    metadata
  };
  
  // Add to question's answers
  mockQuestions[questionIndex].answers.push(newAnswer);
  
  // Update question status
  mockQuestions[questionIndex].status = QuestionStatus.ANSWERED;
  mockQuestions[questionIndex].updatedAt = new Date().toISOString();
  
  return res.status(201).json({ answer: newAnswer });
};

/**
 * Get a specific answer
 */
const getAnswer = async (req: NextApiRequest, res: NextApiResponse, id: string) => {
  for (const question of mockQuestions) {
    const answer = question.answers.find(a => a.id === id);
    
    if (answer) {
      return res.status(200).json({ answer });
    }
  }
  
  return res.status(404).json({ 
    error: { 
      code: 'answer_not_found', 
      message: 'Answer not found' 
    } 
  });
};

/**
 * Update an answer
 */
const updateAnswer = async (req: NextApiRequest, res: NextApiResponse, id: string) => {
  const { content, status, isPublic, metadata } = req.body as UpdateAnswerRequest;
  
  for (const question of mockQuestions) {
    const answerIndex = question.answers.findIndex(a => a.id === id);
    
    if (answerIndex !== -1) {
      // Update answer
      const updatedAnswer = {
        ...question.answers[answerIndex],
        ...(content && { content }),
        ...(status && { status }),
        ...(isPublic !== undefined && { isPublic }),
        ...(metadata && { metadata }),
        updatedAt: new Date().toISOString()
      };
      
      question.answers[answerIndex] = updatedAnswer;
      
      return res.status(200).json({ answer: updatedAnswer });
    }
  }
  
  return res.status(404).json({ 
    error: { 
      code: 'answer_not_found', 
      message: 'Answer not found' 
    } 
  });
};

/**
 * Delete an answer
 */
const deleteAnswer = async (req: NextApiRequest, res: NextApiResponse, id: string) => {
  for (const question of mockQuestions) {
    const answerIndex = question.answers.findIndex(a => a.id === id);
    
    if (answerIndex !== -1) {
      // Remove answer from question
      question.answers.splice(answerIndex, 1);
      
      // Update question status if no answers left
      if (question.answers.length === 0) {
        question.status = QuestionStatus.APPROVED;
      }
      
      question.updatedAt = new Date().toISOString();
      
      return res.status(204).end();
    }
  }
  
  return res.status(404).json({ 
    error: { 
      code: 'answer_not_found', 
      message: 'Answer not found' 
    } 
  });
};

export default {
  handleQuestions,
  handleQuestion,
  handleAnswers,
  handleAnswer
};