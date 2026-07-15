import React, { useEffect, useState } from 'react';
import {
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useToast } from '../components/ui/ToastProvider';
import { UserStore } from '../store/UserStore';
import QuizResultStyles from '../styles/QuizResultStyles';

export default function QuizResultScreen({ navigation, route }) {
  const { showToast, showPopup } = useToast();
  const { result } = route.params || {};

  const [downloading, setDownloading] = useState(false);
  const [savedPath, setSavedPath] = useState('');
  const [hasSubscription, setHasSubscription] = useState(false);

  const isPass = result?.result_type?.toLowerCase() === 'pass';

  useEffect(() => {
    let mounted = true;
    const loadSubscription = async () => {
      const user = await UserStore.getCurrentUser();
      if (mounted) setHasSubscription(UserStore.hasActiveSubscription(user));
    };
    loadSubscription();
    return () => { mounted = false; };
  }, []);

  const promptSubscriptionRequired = () => {
    showPopup(
      'Certificate dekhne ya download karne ke liye subscription lena zaroori hai.',
      'info',
      {
        primaryLabel: 'Take Subscription',
        secondaryLabel: 'Cancel',
        onPrimaryPress: () => navigation.navigate('Subscription Plans'),
      }
    );
  };

  const handleViewCertificate = () => {
    if (!hasSubscription) {
      promptSubscriptionRequired();
      return;
    }
    navigation.navigate('CertificatePreview', { result });
  };

  const handleDownload = async () => {
    if (!isPass) {
      showToast('Certificate only available for passed exams.', 'error');
      return;
    }
    if (!hasSubscription) {
      promptSubscriptionRequired();
      return;
    }

    if (Platform.OS === 'web') {
      navigation.navigate('CertificatePreview', { result });
      return;
    }

    setDownloading(true);

    try {
      const downloadResult = await UserStore.downloadCertificate(result?.id);
      if (!downloadResult.ok) {
        showToast(downloadResult.message || 'Failed to save certificate.', 'error');
        return;
      }

      setSavedPath(downloadResult.savedPath || '');
      showToast('Certificate saved to your device!', 'success');
    } catch (error) {
      console.error('Certificate download error:', error);
      showToast('Failed to save certificate. Try again.', 'error');
    } finally {
      setDownloading(false);
    }
  };

  const CertificateCard = () => (
    <View collapsable={false} style={QuizResultStyles.certOuter}>
      <View style={QuizResultStyles.certFrame}>
        <View style={QuizResultStyles.certHeaderBand}>
          <Text style={QuizResultStyles.certHeaderText}>RTI NEWS</Text>
          <Text style={QuizResultStyles.certHeaderSub}>Official Certificate</Text>
        </View>

        <View style={QuizResultStyles.certSealRow}>
          <View style={QuizResultStyles.certSeal}>
            <Feather name="award" size={32} color="#b45309" />
          </View>
        </View>

        <Text style={QuizResultStyles.certTitle}>Certificate of Achievement</Text>
        <Text style={QuizResultStyles.certPresented}>This is to certify that</Text>

        <Text style={QuizResultStyles.certName}>
          {result?.user_name || 'Participant'}
        </Text>

        <View style={QuizResultStyles.certDivider} />

        <Text style={QuizResultStyles.certBody}>
          has successfully completed the examination
        </Text>
        <Text style={QuizResultStyles.certQuizTitle}>
          {result?.quiz_title || 'Quiz Examination'}
        </Text>

        <View style={QuizResultStyles.certScoreRow}>
          <View style={QuizResultStyles.certScoreBox}>
            <Text style={QuizResultStyles.certScoreLabel}>Score</Text>
            <Text style={QuizResultStyles.certScoreValue}>{result?.score ?? 0}</Text>
          </View>
          <View style={QuizResultStyles.certScoreBox}>
            <Text style={QuizResultStyles.certScoreLabel}>Result</Text>
            <Text style={QuizResultStyles.certScoreValuePass}>
              {result?.result_type || 'PASS'}
            </Text>
          </View>
          <View style={QuizResultStyles.certScoreBox}>
            <Text style={QuizResultStyles.certScoreLabel}>Date</Text>
            <Text style={QuizResultStyles.certScoreValue}>
              {result?.date || new Date().toLocaleDateString('en-IN')}
            </Text>
          </View>
        </View>

        <View style={QuizResultStyles.certDivider} />

        <View style={QuizResultStyles.certFooterRow}>
          <View style={QuizResultStyles.certSignatureBox}>
            <View style={QuizResultStyles.certSignatureLine} />
            <Text style={QuizResultStyles.certSignatureLabel}>Authorized Signatory</Text>
          </View>
          <View style={QuizResultStyles.certStampBox}>
            <View style={QuizResultStyles.certStamp}>
              <Text style={QuizResultStyles.certStampText}>OK</Text>
            </View>
            <Text style={QuizResultStyles.certSignatureLabel}>Official Seal</Text>
          </View>
        </View>

        <Text style={QuizResultStyles.certFooterNote}>
          {result?.certificate_number || 'RTI News Verified Certificate'} | {new Date().getFullYear()}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={QuizResultStyles.root}>
      {/* Custom Header with Back Button */}
      <View style={QuizResultStyles.customHeader}>
        <TouchableOpacity
          style={QuizResultStyles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Feather name="arrow-left" size={22} color="#F97316" />
        </TouchableOpacity>
        <Text style={QuizResultStyles.headerTitle}>Quiz Result</Text>
        <View style={QuizResultStyles.headerPlaceholder} />
      </View>

      <ScrollView
        contentContainerStyle={QuizResultStyles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View style={QuizResultStyles.heroCard}>
          <Text style={QuizResultStyles.heroEyebrow}>Result</Text>
          <Text style={QuizResultStyles.heroTitle}>{result?.quiz_title || 'Quiz Result'}</Text>
        </View>

        {/* Result Badge */}
        <View style={QuizResultStyles.resultCard}>
          <View style={[QuizResultStyles.resultBadge, isPass ? QuizResultStyles.passBadge : QuizResultStyles.failBadge]}>
            <Feather
              name={isPass ? 'check-circle' : 'x-circle'}
              size={28}
              color={isPass ? '#16a34a' : '#F97316'}
            />
            <Text style={[QuizResultStyles.resultText, isPass ? QuizResultStyles.passText : QuizResultStyles.failText]}>
              {result?.result_type || 'No Result'}
            </Text>
          </View>

          <View style={QuizResultStyles.infoRow}>
            <Text style={QuizResultStyles.infoLabel}>Score</Text>
            <Text style={QuizResultStyles.infoValue}>{result?.score ?? 0}</Text>
          </View>
          <View style={QuizResultStyles.infoRow}>
            <Text style={QuizResultStyles.infoLabel}>Status</Text>
            <Text style={isPass ? QuizResultStyles.infoValuePass : QuizResultStyles.infoValueFail}>
              {isPass ? 'Passed' : 'Failed'}
            </Text>
          </View>
        </View>

        {isPass ? (
          <>
            {hasSubscription ? (
              <>
                <Text style={QuizResultStyles.certSectionLabel}>Your Certificate</Text>
                <CertificateCard />

                <TouchableOpacity
                  style={QuizResultStyles.downloadBtn}
                  onPress={handleViewCertificate}
                >
                  <Feather name="eye" size={18} color="#fff" />
                  <Text style={QuizResultStyles.downloadBtnText}>View Certificate</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[QuizResultStyles.downloadBtn, downloading && QuizResultStyles.downloadBtnDisabled]}
                  onPress={handleDownload}
                  disabled={downloading}
                >
                  <Feather name="download" size={18} color="#fff" />
                  <Text style={QuizResultStyles.downloadBtnText}>
                    {downloading ? 'Saving...' : 'Download Certificate'}
                  </Text>
                </TouchableOpacity>

                {savedPath ? (
                  <Text style={QuizResultStyles.savedNote}>
                    Saved locally: {savedPath.split('/').pop()}
                  </Text>
                ) : null}
              </>
            ) : (
              <View style={QuizResultStyles.failMessageBox}>
                <Feather name="lock" size={16} color="#F97316" />
                <Text style={QuizResultStyles.failMessageText}>
                  Certificate dekhne ke liye pehle subscription lena hoga.
                </Text>
              </View>
            )}
          </>
        ) : (
          <View style={QuizResultStyles.failMessageBox}>
            <Feather name="info" size={16} color="#F97316" />
            <Text style={QuizResultStyles.failMessageText}>
              Certificate is only issued for passing scores. Please retake the exam.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}