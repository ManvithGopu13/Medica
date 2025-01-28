// SymptomChecker.tsx
import React, { FC, useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import axios from 'axios';
import { Symptom, Condition, UserResponses, ApiResponse } from './types';

const API_URL = 'https://medica-try.onrender.com/api';
// const API_URL = 'http://172.20.10.3:3000/api';

const SymptomChecker: FC = () => {
  const [symptoms, setSymptoms] = useState<{ [key: string]: Symptom }>({});
  const [currentSymptom, setCurrentSymptom] = useState<Symptom | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [userResponses, setUserResponses] = useState<UserResponses>({});
  const [analysis, setAnalysis] = useState<Condition[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchSymptoms();
  }, []);

  // Update the fetchSymptoms function in SymptomChecker.tsx
const fetchSymptoms = async (): Promise<void> => {
    try {
      const response = await axios.get<ApiResponse>(`${API_URL}/symptoms`);
      setSymptoms(response.data);
      const firstSymptom = Object.values(response.data)[0] as Symptom;
      setCurrentSymptom(firstSymptom);
    } catch (error) {
      Alert.alert('Error', 'Failed to load symptoms');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (questionId: string, answerId: string): void => {
    if (!currentSymptom) return;

    const symptomId = currentSymptom.id;
    setUserResponses(prev => ({
      ...prev,
      [symptomId]: {
        ...prev[symptomId],
        [questionId.split('_')[1]]: answerId
      }
    }));

    if (currentQuestionIndex + 1 < currentSymptom.questions.length) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      const nextSymptoms = Object.values(symptoms);
      const currentIndex = nextSymptoms.findIndex(s => s.id === currentSymptom.id);
      
      if (currentIndex + 1 < nextSymptoms.length) {
        setCurrentSymptom(nextSymptoms[currentIndex + 1]);
        setCurrentQuestionIndex(0);
      } else {
        analyzeSymptoms();
      }
    }
  };

  const analyzeSymptoms = async (): Promise<void> => {
    try {
      setLoading(true);
      const response = await axios.post(`${API_URL}/analyze`, {
        symptoms: userResponses
      });
      setAnalysis(response.data);
    } catch (error) {
      Alert.alert('Error', 'Failed to analyze symptoms');
    } finally {
      setLoading(false);
    }
  };

  const restartCheck = (): void => {
    setUserResponses({});
    setCurrentSymptom(Object.values(symptoms)[0]);
    setCurrentQuestionIndex(0);
    setAnalysis(null);
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (analysis) {
    return (
      <ScrollView style={styles.container}>
        <Text style={styles.title}>Analysis Results</Text>
        {analysis.map((condition, index) => (
          <View key={index} style={styles.conditionCard}>
            <Text style={styles.conditionName}>{condition.name}</Text>
            <Text style={styles.confidence}>
              Match: {Math.round(condition.confidence)}%
            </Text>
            <Text style={[
              styles.urgency,
              { color: condition.urgency === 'high' ? '#e74c3c' : 
                       condition.urgency === 'medium' ? '#f39c12' : '#27ae60' }
            ]}>
              Urgency: {condition.urgency.toUpperCase()}
            </Text>
            <Text style={styles.recommendationsTitle}>Recommendations:</Text>
            {condition.recommendations.map((rec, idx) => (
              <Text key={idx} style={styles.recommendation}>• {rec}</Text>
            ))}
          </View>
        ))}
        <TouchableOpacity 
          style={styles.button} 
          onPress={restartCheck}
          activeOpacity={0.7}
        >
          <Text style={styles.buttonText}>Start New Check</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  if (!currentSymptom) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text>No symptoms available</Text>
      </View>
    );
  }

  const currentQuestion = currentSymptom.questions[currentQuestionIndex];

  return (
    <View style={styles.container}>
      <Text style={styles.progress}>
        Question {currentQuestionIndex + 1} of {currentSymptom.questions.length}
      </Text>
      <Text style={styles.symptomName}>{currentSymptom.name}</Text>
      <Text style={styles.question}>{currentQuestion.text}</Text>
      {currentQuestion.options.map((option) => (
        <TouchableOpacity
          key={option.id}
          style={styles.answerButton}
          onPress={() => handleAnswer(currentQuestion.id, option.id)}
          activeOpacity={0.7}
        >
          <Text style={styles.answerText}>{option.text}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#2c3e50',
  },
  progress: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 10,
  },
  symptomName: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#2c3e50',
  },
  question: {
    fontSize: 18,
    marginBottom: 20,
    color: '#34495e',
  },
  answerButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  answerText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
  conditionCard: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  conditionName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#2c3e50',
  },
  confidence: {
    fontSize: 16,
    color: '#7f8c8d',
    marginBottom: 5,
  },
  urgency: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 10,
  },
  recommendationsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#2c3e50',
  },
  recommendation: {
    fontSize: 14,
    marginLeft: 10,
    marginBottom: 3,
    color: '#34495e',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    marginVertical: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default SymptomChecker;