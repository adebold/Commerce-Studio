import React, { useState, useEffect } from 'react';
import { Question, Answer, QuestionStatus, AnswerStatus, AuthorType } from '../api/types';

interface ProductQAWidgetProps {
  productId: string;
  productName: string;
  merchantId: string;
  merchantName: string;
  apiBaseUrl: string;
  theme?: {
    primaryColor?: string;
    secondaryColor?: string;
    fontFamily?: string;
    borderRadius?: string;
  };
}

const defaultTheme = {
  primaryColor: '#4A90E2',
  secondaryColor: '#F5F7FA',
  fontFamily: 'Arial, sans-serif',
  borderRadius: '4px',
};

const ProductQAWidget: React.FC<ProductQAWidgetProps> = ({
  productId,
  productName,
  merchantId,
  merchantName,
  apiBaseUrl,
  theme = {},
}) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [newQuestion, setNewQuestion] = useState<string>('');
  const [customerName, setCustomerName] = useState<string>('');
  const [customerEmail, setCustomerEmail] = useState<string>('');
  const [expanded, setExpanded] = useState<boolean>(false);
  const [activeQuestionId, setActiveQuestionId] = useState<string | null>(null);
  const [newAnswer, setNewAnswer] = useState<string>('');
  const [sortBy, setSortBy] = useState<'newest' | 'popular'>('newest');

  const mergedTheme = { ...defaultTheme, ...theme };

  // Fetch questions for this product
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        // In a real implementation, this would be an actual API call
        // const response = await fetch(`${apiBaseUrl}/questions?productId=${productId}`);
        // const data = await response.json();
        
        // For this placeholder, we'll use mock data
        const mockQuestions: Question[] = [
          {
            id: 'q1',
            productId,
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
                authorId: merchantId,
                authorName: merchantName,
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
            productId,
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
        
        setQuestions(mockQuestions);
        setLoading(false);
      } catch (err) {
        setError('Failed to load questions');
        setLoading(false);
        console.error('Error fetching questions:', err);
      }
    };

    fetchQuestions();
  }, [productId, apiBaseUrl, merchantId, merchantName]);

  // Handle submitting a new question
  const handleSubmitQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newQuestion.trim() || !customerName.trim() || !customerEmail.trim()) {
      setError('Please fill in all required fields');
      return;
    }
    
    try {
      // In a real implementation, this would be an actual API call
      // const response = await fetch(`${apiBaseUrl}/questions`, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({
      //     productId,
      //     customerName,
      //     customerEmail,
      //     content: newQuestion,
      //     isPublic: true,
      //   }),
      // });
      // const data = await response.json();
      
      // For this placeholder, we'll create a mock question
      const newQuestionObj: Question = {
        id: `q${questions.length + 1}`,
        productId,
        customerId: null,
        customerName,
        customerEmail,
        content: newQuestion,
        status: QuestionStatus.PENDING,
        isPublic: true,
        upvotes: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        answers: [],
      };
      
      setQuestions([...questions, newQuestionObj]);
      setNewQuestion('');
      setCustomerName('');
      setCustomerEmail('');
      setError(null);
    } catch (err) {
      setError('Failed to submit question');
      console.error('Error submitting question:', err);
    }
  };

  // Handle submitting a new answer
  const handleSubmitAnswer = async (questionId: string) => {
    if (!newAnswer.trim()) {
      setError('Please enter an answer');
      return;
    }
    
    try {
      // In a real implementation, this would be an actual API call
      // const response = await fetch(`${apiBaseUrl}/questions/${questionId}/answers`, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({
      //     authorId: merchantId,
      //     authorName: merchantName,
      //     authorType: AuthorType.MERCHANT,
      //     content: newAnswer,
      //     isPublic: true,
      //   }),
      // });
      // const data = await response.json();
      
      // For this placeholder, we'll create a mock answer
      const newAnswerObj: Answer = {
        id: `a${Math.random().toString(36).substring(7)}`,
        questionId,
        authorId: merchantId,
        authorName: merchantName,
        authorType: AuthorType.MERCHANT,
        content: newAnswer,
        status: AnswerStatus.APPROVED,
        isPublic: true,
        upvotes: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      // Update the questions array with the new answer
      const updatedQuestions = questions.map(q => {
        if (q.id === questionId) {
          return {
            ...q,
            status: QuestionStatus.ANSWERED,
            answers: [...q.answers, newAnswerObj],
          };
        }
        return q;
      });
      
      setQuestions(updatedQuestions);
      setNewAnswer('');
      setActiveQuestionId(null);
      setError(null);
    } catch (err) {
      setError('Failed to submit answer');
      console.error('Error submitting answer:', err);
    }
  };

  // Handle upvoting a question
  const handleUpvoteQuestion = (questionId: string) => {
    const updatedQuestions = questions.map(q => {
      if (q.id === questionId) {
        return {
          ...q,
          upvotes: q.upvotes + 1,
        };
      }
      return q;
    });
    
    setQuestions(updatedQuestions);
  };

  // Handle upvoting an answer
  const handleUpvoteAnswer = (questionId: string, answerId: string) => {
    const updatedQuestions = questions.map(q => {
      if (q.id === questionId) {
        const updatedAnswers = q.answers.map(a => {
          if (a.id === answerId) {
            return {
              ...a,
              upvotes: a.upvotes + 1,
            };
          }
          return a;
        });
        
        return {
          ...q,
          answers: updatedAnswers,
        };
      }
      return q;
    });
    
    setQuestions(updatedQuestions);
  };

  // Sort questions based on the selected sort option
  const sortedQuestions = [...questions].sort((a, b) => {
    if (sortBy === 'newest') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    } else {
      return b.upvotes - a.upvotes;
    }
  });

  // Inline styles for the widget
  const styles = {
    container: {
      fontFamily: mergedTheme.fontFamily,
      maxWidth: '100%',
      border: `1px solid #ddd`,
      borderRadius: mergedTheme.borderRadius,
      margin: '20px 0',
      overflow: 'hidden',
    },
    header: {
      backgroundColor: mergedTheme.primaryColor,
      color: 'white',
      padding: '15px 20px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      cursor: 'pointer',
    },
    headerTitle: {
      margin: 0,
      fontSize: '18px',
      fontWeight: 'bold',
    },
    content: {
      padding: '20px',
      backgroundColor: 'white',
      display: expanded ? 'block' : 'none',
    },
    questionForm: {
      marginBottom: '20px',
      padding: '15px',
      backgroundColor: mergedTheme.secondaryColor,
      borderRadius: mergedTheme.borderRadius,
    },
    formGroup: {
      marginBottom: '15px',
    },
    label: {
      display: 'block',
      marginBottom: '5px',
      fontWeight: 'bold',
    },
    input: {
      width: '100%',
      padding: '8px 12px',
      border: '1px solid #ddd',
      borderRadius: mergedTheme.borderRadius,
      fontSize: '14px',
    },
    textarea: {
      width: '100%',
      padding: '8px 12px',
      border: '1px solid #ddd',
      borderRadius: mergedTheme.borderRadius,
      fontSize: '14px',
      minHeight: '80px',
      resize: 'vertical',
    },
    button: {
      backgroundColor: mergedTheme.primaryColor,
      color: 'white',
      border: 'none',
      padding: '10px 15px',
      borderRadius: mergedTheme.borderRadius,
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: 'bold',
    },
    sortControls: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '15px',
    },
    sortButton: {
      backgroundColor: 'transparent',
      border: 'none',
      cursor: 'pointer',
      padding: '5px 10px',
      fontSize: '14px',
      color: mergedTheme.primaryColor,
      fontWeight: sortBy === 'newest' ? 'bold' : 'normal',
    },
    questionList: {
      listStyle: 'none',
      padding: 0,
      margin: 0,
    },
    questionItem: {
      marginBottom: '15px',
      padding: '15px',
      border: '1px solid #eee',
      borderRadius: mergedTheme.borderRadius,
    },
    questionHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: '10px',
    },
    questionContent: {
      fontSize: '16px',
      marginBottom: '10px',
    },
    questionFooter: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      fontSize: '14px',
      color: '#666',
    },
    upvoteButton: {
      backgroundColor: 'transparent',
      border: 'none',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      color: '#666',
      fontSize: '14px',
    },
    answerList: {
      marginTop: '15px',
      paddingTop: '15px',
      borderTop: '1px solid #eee',
    },
    answerItem: {
      padding: '10px 15px',
      backgroundColor: mergedTheme.secondaryColor,
      borderRadius: mergedTheme.borderRadius,
      marginBottom: '10px',
    },
    answerHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: '5px',
      fontSize: '14px',
      color: '#666',
    },
    answerContent: {
      fontSize: '15px',
    },
    answerForm: {
      marginTop: '15px',
      padding: '15px',
      backgroundColor: mergedTheme.secondaryColor,
      borderRadius: mergedTheme.borderRadius,
    },
    error: {
      color: 'red',
      marginBottom: '15px',
    },
    noQuestions: {
      textAlign: 'center',
      padding: '20px',
      color: '#666',
    },
  } as const;

  return (
    <div style={styles.container}>
      <div style={styles.header} onClick={() => setExpanded(!expanded)}>
        <h3 style={styles.headerTitle}>Questions & Answers ({questions.length})</h3>
        <span>{expanded ? '▲' : '▼'}</span>
      </div>
      
      <div style={styles.content}>
        {error && <div style={styles.error}>{error}</div>}
        
        <div style={styles.questionForm}>
          <h4>Ask a Question</h4>
          <form onSubmit={handleSubmitQuestion}>
            <div style={styles.formGroup}>
              <label style={styles.label} htmlFor="question">Your Question*</label>
              <textarea
                id="question"
                style={styles.textarea}
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                placeholder="Ask a question about this product..."
                required
              />
            </div>
            
            <div style={styles.formGroup}>
              <label style={styles.label} htmlFor="name">Your Name*</label>
              <input
                id="name"
                type="text"
                style={styles.input}
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Enter your name"
                required
              />
            </div>
            
            <div style={styles.formGroup}>
              <label style={styles.label} htmlFor="email">Your Email*</label>
              <input
                id="email"
                type="email"
                style={styles.input}
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>
            
            <button type="submit" style={styles.button}>Submit Question</button>
          </form>
        </div>
        
        <div style={styles.sortControls}>
          <h4>Customer Questions ({questions.length})</h4>
          <div>
            <button
              style={{
                ...styles.sortButton,
                fontWeight: sortBy === 'newest' ? 'bold' : 'normal',
              }}
              onClick={() => setSortBy('newest')}
            >
              Newest
            </button>
            <button
              style={{
                ...styles.sortButton,
                fontWeight: sortBy === 'popular' ? 'bold' : 'normal',
              }}
              onClick={() => setSortBy('popular')}
            >
              Most Helpful
            </button>
          </div>
        </div>
        
        {loading ? (
          <div style={styles.noQuestions}>Loading questions...</div>
        ) : sortedQuestions.length === 0 ? (
          <div style={styles.noQuestions}>No questions yet. Be the first to ask!</div>
        ) : (
          <ul style={styles.questionList}>
            {sortedQuestions.map((question) => (
              <li key={question.id} style={styles.questionItem}>
                <div style={styles.questionHeader}>
                  <span><strong>{question.customerName}</strong></span>
                  <span>{new Date(question.createdAt).toLocaleDateString()}</span>
                </div>
                
                <div style={styles.questionContent}>{question.content}</div>
                
                <div style={styles.questionFooter}>
                  <button
                    style={styles.upvoteButton}
                    onClick={() => handleUpvoteQuestion(question.id)}
                  >
                    👍 Helpful ({question.upvotes})
                  </button>
                  
                  {question.answers.length === 0 && (
                    <button
                      style={styles.button}
                      onClick={() => setActiveQuestionId(activeQuestionId === question.id ? null : question.id)}
                    >
                      Answer
                    </button>
                  )}
                </div>
                
                {question.answers.length > 0 && (
                  <div style={styles.answerList}>
                    <h5>Answers ({question.answers.length})</h5>
                    {question.answers.map((answer) => (
                      <div key={answer.id} style={styles.answerItem}>
                        <div style={styles.answerHeader}>
                          <span><strong>{answer.authorName}</strong> ({answer.authorType.toLowerCase()})</span>
                          <span>{new Date(answer.createdAt).toLocaleDateString()}</span>
                        </div>
                        
                        <div style={styles.answerContent}>{answer.content}</div>
                        
                        <div style={styles.questionFooter}>
                          <button
                            style={styles.upvoteButton}
                            onClick={() => handleUpvoteAnswer(question.id, answer.id)}
                          >
                            👍 Helpful ({answer.upvotes})
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {activeQuestionId === question.id && (
                  <div style={styles.answerForm}>
                    <h5>Your Answer</h5>
                    <div style={styles.formGroup}>
                      <textarea
                        style={styles.textarea}
                        value={newAnswer}
                        onChange={(e) => setNewAnswer(e.target.value)}
                        placeholder="Write your answer..."
                        required
                      />
                    </div>
                    
                    <button
                      style={styles.button}
                      onClick={() => handleSubmitAnswer(question.id)}
                    >
                      Submit Answer
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ProductQAWidget;