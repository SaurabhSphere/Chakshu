import React, { createContext, useReducer, useCallback } from 'react';

export const InterviewContext = createContext();

const initialState = {
  sessionId: null,
  jobId: null,
  candidateId: null,
  currentQuestionIndex: 0,
  questions: [],
  answers: [],
  status: 'pending', // pending, in-progress, completed
  loading: false,
  error: null,
};

const interviewReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload, error: null };
    case 'INIT_SESSION':
      return {
        ...state,
        sessionId: action.payload.sessionId,
        jobId: action.payload.jobId,
        candidateId: action.payload.candidateId,
        status: 'in-progress',
      };
    case 'SET_QUESTIONS':
      return { ...state, questions: action.payload };
    case 'ADD_ANSWER':
      return {
        ...state,
        answers: [...state.answers, action.payload],
        currentQuestionIndex: state.currentQuestionIndex + 1,
      };
    case 'UPDATE_ANSWER':
      return {
        ...state,
        answers: state.answers.map((ans, idx) =>
          idx === action.payload.index ? action.payload.answer : ans
        ),
      };
    case 'SET_CURRENT_QUESTION':
      return { ...state, currentQuestionIndex: action.payload };
    case 'COMPLETE_SESSION':
      return { ...state, status: 'completed', loading: false };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
};

export const InterviewProvider = ({ children }) => {
  const [state, dispatch] = useReducer(interviewReducer, initialState);

  const initSession = useCallback((sessionId, jobId, candidateId) => {
    dispatch({
      type: 'INIT_SESSION',
      payload: { sessionId, jobId, candidateId },
    });
  }, []);

  const setQuestions = useCallback((questions) => {
    dispatch({ type: 'SET_QUESTIONS', payload: questions });
  }, []);

  const addAnswer = useCallback((answer) => {
    dispatch({ type: 'ADD_ANSWER', payload: answer });
  }, []);

  const updateAnswer = useCallback((index, answer) => {
    dispatch({ type: 'UPDATE_ANSWER', payload: { index, answer } });
  }, []);

  const setCurrentQuestion = useCallback((index) => {
    dispatch({ type: 'SET_CURRENT_QUESTION', payload: index });
  }, []);

  const completeSession = useCallback(() => {
    dispatch({ type: 'COMPLETE_SESSION' });
  }, []);

  const setError = useCallback((error) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  }, []);

  const setLoading = useCallback((loading) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  const value = {
    ...state,
    initSession,
    setQuestions,
    addAnswer,
    updateAnswer,
    setCurrentQuestion,
    completeSession,
    setError,
    setLoading,
    reset,
  };

  return (
    <InterviewContext.Provider value={value}>
      {children}
    </InterviewContext.Provider>
  );
};
