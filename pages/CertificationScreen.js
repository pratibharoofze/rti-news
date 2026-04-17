import React, { useCallback, useState } from 'react';
import {
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Sidebar from '../components/Sidebar';
import { useToast } from '../components/ui/ToastProvider';
import CertificationStyles from '../styles/CertificationStyles';
import { UserStore } from '../store/UserStore';

export default function CertificationScreen({ navigation }) {
  const { showToast } = useToast();

  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [activeTab, setActiveTab]           = useState('Home');
  const [loading, setLoading]               = useState(true);

  const [certData, setCertData] = useState({
    currentUser:    null,
    items:          [],
    totalAttempts:  0,
    passedCount:    0,
    totalDownloads: 0,
  });

  const moduleName = 'Certification';

  // ── Load data ──
  const loadCertification = useCallback(async () => {
    setLoading(true);
    const data = await UserStore.getCertificationSummary();
    setLoading(false);

    if (!data) {
      navigation.replace('Login');
      return;
    }
    setCertData(data);
  }, [navigation]);

  useFocusEffect(
    useCallback(() => {
      loadCertification();
    }, [loadCertification])
  );

  const handleLogout = async () => {
    await UserStore.clearCurrentUser();
    navigation.replace('Login');
  };

  const promptSubscriptionRequired = useCallback(() => {
    Alert.alert(
      'Subscription Required',
      'Certificate dekhne ya download karne ke liye subscription lena zaroori hai.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Take Subscription', onPress: () => navigation.navigate('Subscription Plans') },
      ]
    );
  }, [navigation]);

  // ── Navigate to Quiz Screen ──
  const handleAttemptQuiz = (item) => {
    if (!item.questions || item.questions.length === 0) {
      showToast('No questions available for this quiz.', 'error');
      return;
    }
    navigation.navigate('AttemptQuiz', { quiz: item });
  };

  // ── Navigate to Result Screen ──
  const handleViewResult = (item) => {
    if (!item.score && item.score !== 0) {
      showToast('No result available. Attempt the quiz first.', 'error');
      return;
    }
    if (item.result_type?.toLowerCase() === 'pass' && !UserStore.hasActiveSubscription(certData.currentUser)) {
      promptSubscriptionRequired();
      return;
    }
    navigation.navigate('QuizResult', {
      result: {
        id: item.id,
        quiz_title: item.quiz_title,
        score: item.score,
        result_type: item.result_type,
        certificate_file: item.certificate_file,
        local_certificate_path: item.local_certificate_path,
        certificate_number: item.certificate_number,
        user_name: item.user_name,
        date: item.issued_at ? new Date(item.issued_at).toLocaleDateString('en-IN') : undefined,
      },
    });
  };

  // ── Download Certificate ──
  const handleDownload = async (item) => {
    if (!item.certificate_file) {
      showToast('Certificate not available yet.', 'error');
      return;
    }
    if (!UserStore.hasActiveSubscription(certData.currentUser)) {
      promptSubscriptionRequired();
      return;
    }
    const result = await UserStore.downloadCertificate(item.id);
    if (!result.ok) {
      showToast(result.message || 'Download failed.', 'error');
      return;
    }
    showToast(result.savedPath ? 'Certificate downloaded and saved locally.' : 'Certificate downloaded successfully.', 'success');
    loadCertification();
  };

  // ── Result type helpers ──
  const resultColor = (result_type) =>
    result_type?.toLowerCase() === 'pass'
      ? CertificationStyles.passText
      : CertificationStyles.failText;

  const resultBadgeStyle = (result_type) =>
    result_type?.toLowerCase() === 'pass'
      ? CertificationStyles.passBadge
      : CertificationStyles.retryBadge;

  return (
    <View style={CertificationStyles.root}>
      <Header
        title={moduleName}
        onMenuPress={() => setSidebarVisible(true)}
        onLogout={handleLogout}
      />

      <ScrollView
        style={CertificationStyles.scrollView}
        contentContainerStyle={CertificationStyles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Card */}
        <View style={CertificationStyles.heroCard}>
          <Text style={CertificationStyles.heroEyebrow}>RTI Certification</Text>
          <Text style={CertificationStyles.heroTitle}>My Certifications</Text>
        </View>

        {/* Metrics */}
        <View style={CertificationStyles.metricsRow}>
          <View style={[CertificationStyles.metricCard, CertificationStyles.metricPrimary]}>
            <Text style={CertificationStyles.metricValue}>{certData.totalAttempts}</Text>
            <Text style={CertificationStyles.metricLabel}>Attempts</Text>
          </View>
          <View style={[CertificationStyles.metricCard, CertificationStyles.metricSecondary]}>
            <Text style={CertificationStyles.metricValue}>{certData.passedCount}</Text>
            <Text style={CertificationStyles.metricLabel}>Passed</Text>
          </View>
          <View style={[CertificationStyles.metricCard, CertificationStyles.metricAccent]}>
            <Text style={CertificationStyles.metricValue}>{certData.totalDownloads}</Text>
            <Text style={CertificationStyles.metricLabel}>Downloads</Text>
          </View>
        </View>

        {/* Certification Records */}
        <View style={CertificationStyles.card}>
          <Text style={CertificationStyles.sectionTitle}>Certification Records</Text>

          {loading ? (
            <Text style={CertificationStyles.loadingText}>
              Loading certification records...
            </Text>
          ) : certData.items.length ? (
            certData.items.map((item) => (
              <View key={item.id} style={CertificationStyles.certCard}>
                <View style={CertificationStyles.certTopRow}>
                  <Text style={CertificationStyles.certTitle} numberOfLines={2}>
                    {item.quiz_title || `Quiz #${item.id}`}
                  </Text>
                  {item.result_type ? (
                    <View style={[CertificationStyles.resultBadge, resultBadgeStyle(item.result_type)]}>
                      <Text style={[CertificationStyles.resultBadgeText, resultColor(item.result_type)]}>
                        {item.result_type}
                      </Text>
                    </View>
                  ) : (
                    <View style={CertificationStyles.pendingBadge}>
                      <Text style={CertificationStyles.pendingBadgeText}>Not Attempted</Text>
                    </View>
                  )}
                </View>

                {item.score !== undefined && item.score !== null && (
                  <View style={CertificationStyles.scoreRow}>
                    <Feather name="bar-chart-2" size={14} color="#2563eb" />
                    <Text style={CertificationStyles.scoreText}>
                      Score: <Text style={CertificationStyles.scoreBold}>{item.score}</Text>
                    </Text>
                  </View>
                )}

                {item.certificate_file ? (
                  <View style={CertificationStyles.certFileRow}>
                    <Feather name="file-text" size={13} color="#16a34a" />
                    <Text style={CertificationStyles.certFileText}>
                      Certificate available
                    </Text>
                  </View>
                ) : null}

                <View style={CertificationStyles.actionRow}>
                  <TouchableOpacity
                    style={CertificationStyles.actionBtn}
                    onPress={() => handleAttemptQuiz(item)}
                  >
                    <Feather name="play-circle" size={14} color="#2563eb" />
                    <Text style={CertificationStyles.actionBtnText}>
                      Attempt Quiz
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={CertificationStyles.actionBtn}
                    onPress={() => handleViewResult(item)}
                  >
                    <Feather name="eye" size={14} color="#7c3aed" />
                    <Text style={[CertificationStyles.actionBtnText, CertificationStyles.actionBtnTextPurple]}>
                      View Result
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      CertificationStyles.actionBtn,
                      !item.certificate_file && CertificationStyles.actionBtnDisabled,
                    ]}
                    onPress={() => handleDownload(item)}
                    disabled={!item.certificate_file}
                  >
                    <Feather
                      name="download"
                      size={14}
                      color={item.certificate_file ? '#16a34a' : '#94a3b8'}
                    />
                    <Text
                      style={[
                        CertificationStyles.actionBtnText,
                        item.certificate_file
                          ? CertificationStyles.actionBtnTextGreen
                          : CertificationStyles.actionBtnTextDisabled,
                      ]}
                    >
                      Download
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          ) : (
            <Text style={CertificationStyles.emptyText}>
              No certification records found.
            </Text>
          )}
        </View>

        <Footer activeTab={activeTab} onTabPress={setActiveTab} />
      </ScrollView>

      <Sidebar
        visible={sidebarVisible}
        onClose={() => setSidebarVisible(false)}
        activeItem={moduleName}
      />
    </View>
  );
}

