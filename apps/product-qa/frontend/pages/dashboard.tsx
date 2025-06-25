import React, { useState, useEffect } from 'react';
import { Question, Answer, QuestionStatus, AnswerStatus, AuthorType } from '../../api/types';

interface DashboardProps {
  merchantId: string;
  merchantName: string;
  apiBaseUrl: string;
}

const Dashboard: React.FC<DashboardProps> = ({
  merchantId,
  merchantName,
  apiBaseUrl,
}) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'pending' | 'answered' | 'all'>('pending');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [newAnswer, setNewAnswer] = useState<string>('');
  const [activeQuestionId, setActiveQuestionId] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalQuestions: 0,
    pendingQuestions: 0,
    answeredQuestions: 0,
    averageResponseTime: 0,
  });

  // Fetch questions
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        // In a real implementation, this would be an actual API call
        // const response = await fetch(`${apiBaseUrl}/questions`);
        // const data = await response.json();
        
        // For this placeholder, we'll use mock data
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
            productId: 'p2',
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
          },
          {
            id: 'q3',
            productId: 'p1',
            customerId: 'c3',
            customerName: 'Mike Johnson',
            customerEmail: 'mike@example.com',
            content: 'What is the temple length on these frames?',
            status: QuestionStatus.PENDING,
            isPublic: true,
            upvotes: 1,
            createdAt: '2025-04-17T14:20:00Z',
            updatedAt: '2025-04-17T14:20:00Z',
            answers: []
          }
        ];
        
        setQuestions(mockQuestions);
        
        // Calculate stats
        const total = mockQuestions.length;
        const pending = mockQuestions.filter(q => q.status === QuestionStatus.PENDING).length;
        const answered = mockQuestions.filter(q => q.status === QuestionStatus.ANSWERED).length;
        
        // Calculate average response time (in hours)
        let totalResponseTime = 0;
        let answeredCount = 0;
        
        mockQuestions.forEach(question => {
          if (question.answers.length > 0) {
            const questionTime = new Date(question.createdAt).getTime();
            const answerTime = new Date(question.answers[0].createdAt).getTime();
            const responseTime = (answerTime - questionTime) / (1000 * 60 * 60); // Convert to hours
            totalResponseTime += responseTime;
            answeredCount++;
          }
        });
        
        const avgResponseTime = answeredCount > 0 ? totalResponseTime / answeredCount : 0;
        
        setStats({
          totalQuestions: total,
          pendingQuestions: pending,
          answeredQuestions: answered,
          averageResponseTime: parseFloat(avgResponseTime.toFixed(1)),
        });
        
        setLoading(false);
      } catch (err) {
        setError('Failed to load questions');
        setLoading(false);
        console.error('Error fetching questions:', err);
      }
    };

    fetchQuestions();
  }, [apiBaseUrl, merchantId, merchantName]);

  // Filter questions based on active tab and search term
  const filteredQuestions = questions.filter(question => {
    // Filter by tab
    if (activeTab === 'pending' && question.status !== QuestionStatus.PENDING) {
      return false;
    }
    if (activeTab === 'answered' && question.status !== QuestionStatus.ANSWERED) {
      return false;
    }
    
    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        question.content.toLowerCase().includes(searchLower) ||
        question.customerName.toLowerCase().includes(searchLower)
      );
    }
    
    return true;
  });

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
      
      // Update stats
      setStats(prevStats => ({
        ...prevStats,
        pendingQuestions: prevStats.pendingQuestions - 1,
        answeredQuestions: prevStats.answeredQuestions + 1,
      }));
      
      setNewAnswer('');
      setActiveQuestionId(null);
      setError(null);
    } catch (err) {
      setError('Failed to submit answer');
      console.error('Error submitting answer:', err);
    }
  };

  // Handle rejecting a question
  const handleRejectQuestion = (questionId: string) => {
    const updatedQuestions = questions.map(q => {
      if (q.id === questionId) {
        return {
          ...q,
          status: QuestionStatus.REJECTED,
        };
      }
      return q;
    });
    
    setQuestions(updatedQuestions);
    
    // Update stats
    setStats(prevStats => ({
      ...prevStats,
      pendingQuestions: prevStats.pendingQuestions - 1,
    }));
  };

  // Inline styles for the dashboard
  const styles = {
    container: {
      fontFamily: 'Arial, sans-serif',
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '20px',
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '20px',
    },
    title: {
      fontSize: '24px',
      fontWeight: 'bold',
      margin: 0,
    },
    statsContainer: {
      display: 'flex',
      gap: '20px',
      marginBottom: '30px',
    },
    statCard: {
      flex: 1,
      backgroundColor: '#f5f7fa',
      borderRadius: '8px',
      padding: '15px',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    },
    statValue: {
      fontSize: '24px',
      fontWeight: 'bold',
      marginBottom: '5px',
      color: '#4A90E2',
    },
    statLabel: {
      fontSize: '14px',
      color: '#666',
    },
    controls: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '20px',
    },
    tabs: {
      display: 'flex',
      gap: '10px',
    },
    tab: {
      padding: '8px 16px',
      borderRadius: '4px',
      cursor: 'pointer',
      fontWeight: 'normal',
      backgroundColor: '#f5f7fa',
    },
    activeTab: {
      backgroundColor: '#4A90E2',
      color: 'white',
      fontWeight: 'bold',
    },
    searchContainer: {
      display: 'flex',
      alignItems: 'center',
    },
    searchInput: {
      padding: '8px 12px',
      border: '1px solid #ddd',
      borderRadius: '4px',
      fontSize: '14px',
      width: '250px',
    },
    questionList: {
      listStyle: 'none',
      padding: 0,
      margin: 0,
    },
    questionItem: {
      marginBottom: '20px',
      padding: '20px',
      border: '1px solid #eee',
      borderRadius: '8px',
      backgroundColor: 'white',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
    },
    questionHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: '10px',
    },
    customerInfo: {
      fontWeight: 'bold',
    },
    questionDate: {
      color: '#666',
    },
    questionContent: {
      fontSize: '16px',
      marginBottom: '15px',
    },
    productInfo: {
      fontSize: '14px',
      color: '#666',
      marginBottom: '15px',
    },
    questionActions: {
      display: 'flex',
      gap: '10px',
    },
    button: {
      padding: '8px 16px',
      borderRadius: '4px',
      cursor: 'pointer',
      fontWeight: 'bold',
      border: 'none',
    },
    primaryButton: {
      backgroundColor: '#4A90E2',
      color: 'white',
    },
    secondaryButton: {
      backgroundColor: '#f5f7fa',
      color: '#333',
      border: '1px solid #ddd',
    },
    dangerButton: {
      backgroundColor: '#e74c3c',
      color: 'white',
    },
    answerForm: {
      marginTop: '15px',
      padding: '15px',
      backgroundColor: '#f5f7fa',
      borderRadius: '8px',
    },
    textarea: {
      width: '100%',
      padding: '10px',
      border: '1px solid #ddd',
      borderRadius: '4px',
      fontSize: '14px',
      minHeight: '100px',
      resize: 'vertical',
      marginBottom: '10px',
    },
    answerList: {
      marginTop: '15px',
    },
    answerItem: {
      padding: '15px',
      backgroundColor: '#f5f7fa',
      borderRadius: '8px',
      marginBottom: '10px',
    },
    answerHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: '5px',
    },
    answerAuthor: {
      fontWeight: 'bold',
    },
    answerDate: {
      color: '#666',
      fontSize: '14px',
    },
    answerContent: {
      fontSize: '15px',
    },
    error: {
      color: 'red',
      marginBottom: '15px',
    },
    noQuestions: {
      textAlign: 'center',
      padding: '30px',
      color: '#666',
      backgroundColor: '#f5f7fa',
      borderRadius: '8px',
    },
  } as const;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Product Q&A Dashboard</h1>
      </div>
      
      <div style={styles.statsContainer}>
        <div style={styles.statCard}>
          <div style={styles.statValue}>{stats.totalQuestions}</div>
          <div style={styles.statLabel}>Total Questions</div>
        </div>
        
        <div style={styles.statCard}>
          <div style={styles.statValue}>{stats.pendingQuestions}</div>
          <div style={styles.statLabel}>Pending Questions</div>
        </div>
        
        <div style={styles.statCard}>
          <div style={styles.statValue}>{stats.answeredQuestions}</div>
          <div style={styles.statLabel}>Answered Questions</div>
        </div>
        
        <div style={styles.statCard}>
          <div style={styles.statValue}>{stats.averageResponseTime}h</div>
          <div style={styles.statLabel}>Avg. Response Time</div>
        </div>
      </div>
      
      <div style={styles.controls}>
        <div style={styles.tabs}>
          <div
            style={{
              ...styles.tab,
              ...(activeTab === 'pending' ? styles.activeTab : {}),
            }}
            onClick={() => setActiveTab('pending')}
          >
            Pending ({stats.pendingQuestions})
          </div>
          
          <div
            style={{
              ...styles.tab,
              ...(activeTab === 'answered' ? styles.activeTab : {}),
            }}
            onClick={() => setActiveTab('answered')}
          >
            Answered ({stats.answeredQuestions})
          </div>
          
          <div
            style={{
              ...styles.tab,
              ...(activeTab === 'all' ? styles.activeTab : {}),
            }}
            onClick={() => setActiveTab('all')}
          >
            All Questions ({stats.totalQuestions})
          </div>
        </div>
        
        <div style={styles.searchContainer}>
          <input
            type="text"
            placeholder="Search questions..."
            style={styles.searchInput}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      {error && <div style={styles.error}>{error}</div>}
      
      {loading ? (
        <div style={styles.noQuestions}>Loading questions...</div>
      ) : filteredQuestions.length === 0 ? (
        <div style={styles.noQuestions}>No questions found.</div>
      ) : (
        <ul style={styles.questionList}>
          {filteredQuestions.map((question) => (
            <li key={question.id} style={styles.questionItem}>
              <div style={styles.questionHeader}>
                <span style={styles.customerInfo}>{question.customerName} ({question.customerEmail})</span>
                <span style={styles.questionDate}>{new Date(question.createdAt).toLocaleString()}</span>
              </div>
              
              <div style={styles.questionContent}>{question.content}</div>
              
              <div style={styles.productInfo}>
                Product ID: {question.productId} | Upvotes: {question.upvotes}
              </div>
              
              {question.answers.length > 0 ? (
                <div style={styles.answerList}>
                  <h4>Answers</h4>
                  {question.answers.map((answer) => (
                    <div key={answer.id} style={styles.answerItem}>
                      <div style={styles.answerHeader}>
                        <span style={styles.answerAuthor}>{answer.authorName}</span>
                        <span style={styles.answerDate}>{new Date(answer.createdAt).toLocaleString()}</span>
                      </div>
                      
                      <div style={styles.answerContent}>{answer.content}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={styles.questionActions}>
                  {question.status === QuestionStatus.PENDING && (
                    <>
                      <button
                        style={{ ...styles.button, ...styles.primaryButton }}
                        onClick={() => setActiveQuestionId(activeQuestionId === question.id ? null : question.id)}
                      >
                        Answer
                      </button>
                      
                      <button
                        style={{ ...styles.button, ...styles.dangerButton }}
                        onClick={() => handleRejectQuestion(question.id)}
                      >
                        Reject
                      </button>
                    </>
                  )}
                </div>
              )}
              
              {activeQuestionId === question.id && (
                <div style={styles.answerForm}>
                  <h4>Your Answer</h4>
                  <textarea
                    style={styles.textarea}
                    value={newAnswer}
                    onChange={(e) => setNewAnswer(e.target.value)}
                    placeholder="Write your answer..."
                  />
                  
                  <div style={styles.questionActions}>
                    <button
                      style={{ ...styles.button, ...styles.primaryButton }}
                      onClick={() => handleSubmitAnswer(question.id)}
                    >
                      Submit Answer
                    </button>
                    
                    <button
                      style={{ ...styles.button, ...styles.secondaryButton }}
                      onClick={() => {
                        setActiveQuestionId(null);
                        setNewAnswer('');
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Dashboard;