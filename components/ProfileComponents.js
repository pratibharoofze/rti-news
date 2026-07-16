import { Feather } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';
import ProfileStyles from '../styles/ProfileStyles';
import { generateMemberId, getRank, getNextRank, hasDocumentSource } from '../utils/profileHelpers';

export function RankBadge({ referralCount }) {
  const rank = getRank(referralCount);
  const next = getNextRank(referralCount);
  const needed = next ? Math.max(0, next.minReferrals - referralCount) : 0;
  return (
    <View style={[ProfileStyles.rankCard, { borderColor: rank.color + '33' }]}>
      <View style={[ProfileStyles.rankCardBg, { backgroundColor: rank.color + '11' }]} />
      <Text style={ProfileStyles.rankIcon}>{rank.icon}</Text>
      <Text style={ProfileStyles.rankLabel}>{rank.title}</Text>
      <Text style={[ProfileStyles.rankValue, { color: rank.color }]}>{referralCount || 0}</Text>
      {next ? <Text style={ProfileStyles.rankSubtext}>{needed} more to {next.title}</Text> : null}
    </View>
  );
}

export function ReferralCodeCard({ referralCode, onCopy }) {
  return (
    <View style={ProfileStyles.referralCard}>
      <View style={ProfileStyles.referralLeft}>
        <Text style={ProfileStyles.referralLabel}>My Referral Code</Text>
        <Text style={ProfileStyles.referralCode}>{referralCode || 'Generating...'}</Text>
        <Text style={ProfileStyles.referralHint}>Share this code to earn referral bonus</Text>
      </View>
      <TouchableOpacity style={ProfileStyles.copyBtn} onPress={onCopy} disabled={!referralCode}>
        <Feather name="copy" size={16} color="#fff" />
        <Text style={ProfileStyles.copyBtnText}>Copy</Text>
      </TouchableOpacity>
    </View>
  );
}

export function SavedProfileCard({ profile, onOpenIdCard, onOpenAppointmentLetter, onDownloadIdCard, onDownloadAppointmentLetter }) {
  const canGenerateDocuments = hasDocumentSource(profile);
  const fields = [
    { icon: 'user', label: 'Full Name', value: profile.name, accent: '#7d38ff' },
    { icon: 'mail', label: 'Email Address', value: profile.email, accent: '#22aaf3' },
    { icon: 'map-pin', label: 'State', value: profile.state, accent: '#f97316' },
    { icon: 'home', label: 'Village', value: profile.village, accent: '#F97316' },
    { icon: 'phone', label: 'Phone Number', value: profile.phone_number, accent: '#1ec9b0' },
    { icon: 'smartphone', label: 'Mobile Number', value: profile.mobile_number || profile.contact_number, accent: '#14b8a6' },
    { icon: 'star', label: 'Subscription Type', value: profile.subscription_type, accent: '#eab308' },
    { icon: 'file-text', label: 'Bio', value: profile.bio, accent: '#EA580C', fullWidth: true },
    { icon: 'credit-card', label: 'ID Card', value: canGenerateDocuments ? 'Generated' : 'Not ready', accent: '#ea580c', onPress: onOpenIdCard, onDownload: () => onDownloadIdCard?.(), isDocument: true },
    { icon: 'file', label: 'Appointment Letter', value: canGenerateDocuments ? 'Generated' : 'Not ready', accent: '#f97316', onPress: onOpenAppointmentLetter, onDownload: () => onDownloadAppointmentLetter?.(), isDocument: true },
  ];

  return (
    <View style={ProfileStyles.infoCard}>
      <View style={ProfileStyles.headerStrip}>
        <View style={ProfileStyles.headerLeft}>
          <View style={ProfileStyles.headerIconWrap}><Feather name="user-check" size={15} color="#fff" /></View>
          <View>
            <Text style={ProfileStyles.cardTitle}>Saved Profile</Text>
            <Text style={ProfileStyles.cardSubtitle}>Your current information</Text>
          </View>
        </View>
        <View style={ProfileStyles.memberBadge}><Text style={ProfileStyles.memberBadgeText}>{generateMemberId(profile.email)}</Text></View>
      </View>
      <View style={ProfileStyles.divider} />
      <View style={ProfileStyles.fieldList}>
        {fields.map((f, i) => {
          const isReady = Boolean(f.value && f.value !== 'Not ready');
          const isClickable = Boolean(f.onPress && isReady && f.isDocument);

          return (
            <View
              key={f.label}
              style={[ProfileStyles.fieldRow, f.fullWidth && ProfileStyles.fieldRowFull, i !== fields.length - 1 && ProfileStyles.fieldRowBorder]}
            >
              <View style={[ProfileStyles.accentBar, { backgroundColor: f.accent }]} />
              <View style={[ProfileStyles.fieldIconWrap, { backgroundColor: f.accent + '18' }]}><Feather name={f.icon} size={14} color={f.accent} /></View>
              <View style={ProfileStyles.fieldContent}>
                <Text style={ProfileStyles.fieldLabel}>{f.label}</Text>
                <Text style={[ProfileStyles.fieldValue, (!f.value || f.value === 'Not ready') && ProfileStyles.fieldValueEmpty]} numberOfLines={f.fullWidth ? 3 : 1}>{f.value || 'Not added yet'}</Text>
              </View>
              {isClickable ? (
  <View style={{ flexDirection: 'row', gap: 6 }}>
    <TouchableOpacity
      onPress={f.onPress}
      activeOpacity={0.75}
      style={{ flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 8, backgroundColor: f.accent + '18', paddingHorizontal: 10, paddingVertical: 6 }}
    >
      <Feather name="eye" size={13} color={f.accent} />
      <Text style={{ color: f.accent, fontSize: 12, fontWeight: '700' }}>View</Text>
    </TouchableOpacity>
    <TouchableOpacity
      onPress={f.onDownload}
      activeOpacity={0.75}
      style={{ flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 8, backgroundColor: f.accent, paddingHorizontal: 10, paddingVertical: 6 }}
    >
      <Feather name="download" size={13} color="#fff" />
      <Text style={{ color: '#fff', fontSize: 12, fontWeight: '700' }}>PDF</Text>
    </TouchableOpacity>
  </View>
) : null}
              <View style={[ProfileStyles.statusDot, { backgroundColor: isReady ? '#32d27c' : '#e2e5f0' }]} />
            </View>
          );
        })}
      </View>
      <View style={ProfileStyles.hintRow}>
        <Feather name="info" size={12} color="#a0a8bf" />
        <Text style={ProfileStyles.hintText}>Tap <Text style={ProfileStyles.hintBold}>Edit Profile</Text> below to update your details</Text>
      </View>
    </View>
  );
}

