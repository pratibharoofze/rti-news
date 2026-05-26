// screens/AttemptQuizScreen.js
import React, { useState } from 'react';
import {
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useToast } from '../components/ui/ToastProvider';
import { UserStore } from '../store/UserStore';
import AttemptQuizStyles from '../styles/AttemptQuizStyles';

export default function AttemptQuizScreen({ navigation, route }) {
  const { showToast } = useToast();
  const { quiz } = route.params || {};

  const [currentQIndex, setCurrentQIndex]   = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [submitting, setSubmitting]           = useState(false);

  const questions = quiz?.questions || [];

  const handleSelectAnswer = (option) => {
    setSelectedAnswers((prev) => ({ ...prev, [currentQIndex]: option }));
  };

  const handleNextOrSubmit = async () => {
    if (!selectedAnswers[currentQIndex]) {
      showToast('Please select an answer.', 'error');
      return;
    }

    const isLast = currentQIndex === questions.length - 1;

    if (!isLast) {
      setCurrentQIndex((prev) => prev + 1);
      return;
    }

    setSubmitting(true);
    const result = await UserStore.submitQuizAnswers(quiz.id, selectedAnswers);
    setSubmitting(false);

    if (!result.ok) {
      showToast(result.message || 'Submission failed.', 'error');
      return;
    }

    navigation.replace('QuizResult', {
      result: {
        id:                     quiz.id,
        quiz_title:             quiz.quiz_title,
        score:                  result.score,
        result_type:            result.result_type,
        certificate_file:       result.certificate_file,
        local_certificate_path: result.local_certificate_path,
        certificate_number:     result.certificate_number,
        user_name:              result.user_name,
        date:                   result.date,
      },
    });
  };

  return (
    <SafeAreaView style={AttemptQuizStyles.root}>

      {/* Top Bar */}
      <View style={AttemptQuizStyles.topBar}>
        <TouchableOpacity
          style={AttemptQuizStyles.backBtn}
          onPress={() => navigation.goBack()}
        >
          {/* ← White icon because topBar background is #FF2D78 */}
          <Feather name="arrow-left" size={20} color="#ffffff" />
        </TouchableOpacity>
        <Text style={AttemptQuizStyles.topBarTitle}>Attempt Quiz</Text>
        <View style={AttemptQuizStyles.topBarSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={AttemptQuizStyles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View style={AttemptQuizStyles.heroCard}>
          <Text style={AttemptQuizStyles.heroEyebrow}>Quiz</Text>
          <Text style={AttemptQuizStyles.heroTitle}>{quiz.quiz_title || 'Quiz'}</Text>
        </View>

        {/* Question Card */}
        <View style={AttemptQuizStyles.card}>
          <Text style={AttemptQuizStyles.quizProgress}>
            Question {currentQIndex + 1} of {questions.length}
          </Text>

          <View style={AttemptQuizStyles.progressBarWrap}>
            <View
              style={[
                AttemptQuizStyles.progressBarFill,
                { width: `${((currentQIndex + 1) / questions.length) * 100}%` },
              ]}
            />
          </View>

          <Text style={AttemptQuizStyles.questionText}>
            {questions[currentQIndex]?.question}
          </Text>

          {['A', 'B', 'C', 'D'].map((opt) => {
            const optionText = questions[currentQIndex]?.options?.[opt];
            if (!optionText) return null;
            const isSelected = selectedAnswers[currentQIndex] === opt;

            return (
              <TouchableOpacity
                key={opt}
                style={[AttemptQuizStyles.optionBtn, isSelected && AttemptQuizStyles.optionBtnSelected]}
                onPress={() => handleSelectAnswer(opt)}
              >
                <View style={[AttemptQuizStyles.optionLabel, isSelected && AttemptQuizStyles.optionLabelSelected]}>
                  <Text style={[AttemptQuizStyles.optionLabelText, isSelected && AttemptQuizStyles.optionLabelTextSelected]}>
                    {opt}
                  </Text>
                </View>
                <Text style={[AttemptQuizStyles.optionText, isSelected && AttemptQuizStyles.optionTextSelected]}>
                  {optionText}
                </Text>
              </TouchableOpacity>
            );
          })}

          <TouchableOpacity
            style={[AttemptQuizStyles.nextBtn, submitting && AttemptQuizStyles.nextBtnDisabled]}
            onPress={handleNextOrSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Text style={AttemptQuizStyles.nextBtnText}>
                  {currentQIndex === questions.length - 1 ? 'Submit Quiz' : 'Next Question'}
                </Text>
                <Feather
                  name={currentQIndex === questions.length - 1 ? 'check' : 'arrow-right'}
                  size={16}
                  color="#fff"
                />
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}