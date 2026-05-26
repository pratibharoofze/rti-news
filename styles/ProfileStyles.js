import { StyleSheet } from 'react-native';

const ProfileStyles = StyleSheet.create({

  // ─── Root ──────────────────────────────────────────────────────────────────
  root:           { flex: 1, backgroundColor: '#F0F0F5' },
  bgOrbPrimary:   { position: 'absolute', top: -40, left: -60,  width: 220, height: 220, borderRadius: 110, backgroundColor: 'rgba(249,115,22,0.05)' },
  bgOrbSecondary: { position: 'absolute', top: 100, right: 10,  width: 60,  height: 60,  borderRadius: 30,  backgroundColor: 'rgba(249,115,22,0.07)' },
  bgOrbTertiary:  { position: 'absolute', bottom: 100, right: -40, width: 180, height: 180, borderRadius: 90, backgroundColor: 'rgba(255,255,255,0.4)' },

  // ─── Top Bar ───────────────────────────────────────────────────────────────
  topBar: {
    paddingHorizontal: 16, paddingTop: 48, paddingBottom: 12,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#ffffff', borderBottomWidth: 1, borderBottomColor: '#F0F0F0',
  },
  topBarBackBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F5F5F5' },
  topBarActions: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  topBarIconBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F5F5F5' },

  // ─── Scroll ────────────────────────────────────────────────────────────────
  scrollView:    { flex: 1 },
  scrollContent: { paddingBottom: 140 },
  profileShell:  { gap: 0 },

  // ─── Summary Card ──────────────────────────────────────────────────────────
  summaryCard: {
    backgroundColor: '#ffffff',
    paddingTop: 24,
    paddingBottom: 20,
    paddingHorizontal: 20,
    marginBottom: 8,
  },

  // ── TOP ROW: avatar LEFT + info RIGHT (Threads/Instagram style) ────────────
  summaryTopRow: {
    flexDirection: 'row',        // horizontal
    alignItems: 'center',
    gap: 20,
    marginBottom: 16,
  },

  // Avatar — LEFT side, bigger
  avatarRing: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    shadowColor: '#F97316',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  avatar:    { width: 78, height: 78, borderRadius: 39, backgroundColor: '#FED7AA' },
  onlineDot: { position: 'absolute', bottom: 4, left: 4, width: 18, height: 18, borderRadius: 9, backgroundColor: '#F97316', borderWidth: 3, borderColor: '#ffffff' },

  // Info — RIGHT side
  summaryContent: {
    flex: 1,
  },

  profileNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 8,
  },
  profileName: { fontSize: 18, fontWeight: '700', color: '#111111', flexShrink: 1 },
  profileRole: { fontSize: 13, color: '#999999', fontWeight: '400' },
  profileBio: {
  fontSize: 13,
  color: '#444444',
  lineHeight: 19,
  marginBottom: 12,
  marginTop: -4,
},
  

  // ── Stats row: 0 posts | 1 follower | 1 following ─────────────────────────
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    marginBottom: 6,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111111',
  },
  statLabel: {
    fontSize: 12,
    color: '#999999',
    fontWeight: '400',
    marginTop: 1,
  },

  summaryRankRow:   { flexDirection: 'row', alignItems: 'center', gap: 4, flexWrap: 'wrap' },
  summaryRankEmoji: { fontSize: 12 },
  summaryRankText:  { fontSize: 12, fontWeight: '600', color: '#555555' },
  summaryDot:       { fontSize: 12, color: '#DDDDDD' },
  locationRow:      { flexDirection: 'row', alignItems: 'center', gap: 3 },
  locationText:     { fontSize: 12, color: '#999999', fontWeight: '500' },

  // Progress bar section (below top row)
  metricRow: { width: '100%', marginBottom: 6, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  metricLabel:        { fontSize: 13, color: '#555555', fontWeight: '500' },
  metricValuePrimary: { fontSize: 15, fontWeight: '700', color: '#111111' },
  metricRightBlock:   { alignItems: 'flex-end' },
  metricValueAccent:  { fontSize: 12, fontWeight: '700', color: '#F97316' },

  uploadBarCard:  { width: '100%' },
  uploadBarTrack: { height: 7, backgroundColor: '#EEEEEE', borderRadius: 4, overflow: 'hidden', marginBottom: 10 },
  uploadWaveOne:  { position: 'absolute', left: 0, top: 0, bottom: 0, backgroundColor: '#111111', borderRadius: 4 },
  uploadWaveTwo:  { display: 'none', position: 'absolute', width: 0 },
  uploadDotOne:   { display: 'none', position: 'absolute', width: 0 },
  uploadDotTwo:   { display: 'none', position: 'absolute', width: 0 },
  uploadDotThree: { display: 'none', position: 'absolute', width: 0 },

  quickIconRow: {
  marginTop: 10,
  flexDirection: 'row',
  alignItems: 'center',
  gap: 8,
},
quickIconButtonText: {
  fontSize: 13,
  fontWeight: '700',
  color: '#111111',
},
  quickIconButton: {
  flex: 1, height: 36, borderRadius: 10,
  alignItems: 'center', justifyContent: 'center',
  backgroundColor: '#F0F0F0', borderWidth: 1, borderColor: '#E0E0E0',
},

  // Post News button
  quickPostNewsBtn: {
  flex: 1, flexDirection: 'row', alignItems: 'center',
  justifyContent: 'center', gap: 5, height: 36,
  backgroundColor: '#F0F0F0', borderRadius: 10,
  borderWidth: 1, borderColor: '#E0E0E0',
},
quickPostNewsBtnText: { color: '#111111', fontSize: 13, fontWeight: '700' },

  // ─── Rank Card ─────────────────────────────────────────────────────────────
  rankCard: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#ffffff', marginHorizontal: 12, marginBottom: 6,
    borderRadius: 14, paddingVertical: 10, paddingHorizontal: 14,
    borderWidth: 1, borderColor: '#F0F0F0', elevation: 2,
  },
  rankIconWrap:   { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFF7ED' },
  rankEmoji:      { fontSize: 17 },
  rankLabel:      { fontSize: 9, fontWeight: '700', color: '#AAAAAA', textTransform: 'uppercase', letterSpacing: 0.5 },
  rankName:       { fontSize: 13, fontWeight: '700', color: '#111111', marginTop: 1 },
  rankNext:       { fontSize: 10, color: '#AAAAAA', marginTop: 1 },
  rankCountBadge: { marginLeft: 'auto', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5, alignItems: 'center', backgroundColor: '#F97316' },
  rankCountText:  { fontSize: 13, fontWeight: '800', color: '#ffffff' },
  rankCountSub:   { fontSize: 8, fontWeight: '600', color: 'rgba(255,255,255,0.75)', textTransform: 'uppercase' },

  // ─── Referral Card ─────────────────────────────────────────────────────────
  referralCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F97316', marginHorizontal: 12, marginBottom: 6,
    borderRadius: 14, paddingVertical: 11, paddingHorizontal: 14,
    shadowColor: '#F97316', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 4, gap: 10,
  },
  referralLeft:    { flex: 1 },
  referralLabel:   { fontSize: 9, fontWeight: '700', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 },
  referralCode:    { fontSize: 16, fontWeight: '800', color: '#ffffff', letterSpacing: 1 },
  referralCopyBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 7, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
  referralCopyText:{ fontSize: 11, fontWeight: '700', color: '#ffffff' },

  // ─── Dropdown ──────────────────────────────────────────────────────────────
  dropdownTrigger:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 11, backgroundColor: '#F5F5F5', borderWidth: 1, borderColor: '#EEEEEE', minHeight: 44 },
  dropdownValue:         { flex: 1, color: '#111111', fontSize: 14, fontWeight: '500' },
  dropdownPlaceholder:   { flex: 1, color: '#BBBBBB', fontSize: 14 },
  dropdownList:          { position: 'absolute', top: 48, left: 0, right: 0, backgroundColor: '#ffffff', borderRadius: 10, elevation: 12, borderWidth: 1, borderColor: '#EEEEEE', zIndex: 9999, overflow: 'hidden' },
  dropdownItem:          { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F8F8F8' },
  dropdownItemActive:    { backgroundColor: '#FFF7ED' },
  dropdownItemText:      { fontSize: 14, color: '#111111', fontWeight: '500' },
  dropdownItemTextActive:{ color: '#F97316', fontWeight: '700' },

  // ─── ID Card & Appointment Letter ──────────────────────────────────────────
  idCardTemplate:  { width: '100%', aspectRatio: 54 / 85 },
  idCardImage:     { resizeMode: 'cover' },
  idCardOverlay:   { ...StyleSheet.absoluteFillObject },
  idCardPhotoFrame:{ position: 'absolute', top: '30%', left: '30%', width: '40%', aspectRatio: 1, borderRadius: 6, overflow: 'hidden' },
  idCardNameValue: { position: 'absolute', top: '60%', left: '24%', right: '8%', fontSize: 11, fontWeight: '700', color: '#111111' },
  idCardDesigValue:{ position: 'absolute', top: '65%', left: '24%', right: '8%', fontSize: 10, fontWeight: '600', color: '#333333' },
  idCardAreaValue: { position: 'absolute', top: '70%', left: '24%', right: '8%', fontSize: 9.5, color: '#333333' },
  idCardMoValue:   { position: 'absolute', top: '74.5%', left: '24%', right: '8%', fontSize: 9.5, color: '#333333' },
  idCardIdValue:   { position: 'absolute', top: '79%', left: '24%', fontSize: 10, fontWeight: '800', color: '#F97316' },
  idCardValidValue:{ position: 'absolute', top: '79%', right: '8%', fontSize: 9, fontWeight: '700', color: '#333333' },

  apptTemplate:      { width: '100%', aspectRatio: 210 / 297 },
  apptImage:         { resizeMode: 'cover' },
  apptOverlay:       { ...StyleSheet.absoluteFillObject },
  apptNameValue:     { position: 'absolute', top: '55%', left: '24%', right: '10%', fontSize: 12, fontWeight: '700', color: '#F97316' },
  apptDesigValue:    { position: 'absolute', top: '59%', left: '28%', right: '10%', fontSize: 11, fontWeight: '600', color: '#F97316' },
  apptLocationValue: { position: 'absolute', top: '63%', left: '36%', right: '10%', fontSize: 10.5, fontWeight: '600', color: '#F97316' },
  apptDateFromValue: { position: 'absolute', top: '67%', left: '24%', fontSize: 10.5, fontWeight: '600', color: '#F97316' },
  apptDateToValue:   { position: 'absolute', top: '67%', left: '40%', fontSize: 10.5, fontWeight: '600', color: '#F97316' },
  apptPhotoFrame:    { position: 'absolute', top: '61%', right: '14%', width: '18%', aspectRatio: 3 / 4, borderWidth: 1, borderColor: '#EEEEEE', backgroundColor: '#F5F5F5', overflow: 'hidden' },

  // ─── Saved Profile Card ────────────────────────────────────────────────────
  infoCard: {
    backgroundColor: '#ffffff', marginHorizontal: 12, borderRadius: 16,
    marginBottom: 6, overflow: 'hidden', elevation: 2,
  },
  headerStrip:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14, paddingVertical: 11 },
  headerLeft:     { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerIconWrap: { width: 28, height: 28, borderRadius: 8, backgroundColor: '#FFF7ED', alignItems: 'center', justifyContent: 'center' },
  cardTitle:      { fontSize: 14, fontWeight: '700', color: '#111111' },
  cardSubtitle:   { fontSize: 11, color: '#999999', marginTop: 1 },
  memberBadge:    { backgroundColor: '#FFF7ED', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  memberBadgeText:{ fontSize: 11, fontWeight: '700', color: '#F97316' },
  divider:        { height: 1, backgroundColor: '#F5F5F5' },

  fieldList: { paddingHorizontal: 0, paddingVertical: 0 },
  fieldRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 11, paddingHorizontal: 14,
    gap: 10, backgroundColor: '#ffffff',
    borderBottomWidth: 1, borderBottomColor: '#F8F8F8',
  },
  fieldRowFull:   { alignItems: 'flex-start' },
  fieldRowBorder: { borderBottomWidth: 1, borderBottomColor: '#F8F8F8' },
  accentBar:      { display: 'none', width: 0 },
  fieldIconWrap:  { width: 32, height: 32, borderRadius: 9, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F5F5F5' },
  fieldContent:   { flex: 1 },
  fieldLabel:     { fontSize: 10, fontWeight: '600', color: '#AAAAAA', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 },
  fieldValue:     { fontSize: 14, fontWeight: '500', color: '#111111' },
  fieldValueEmpty:{ color: '#CCCCCC', fontStyle: 'italic', fontWeight: '400' },
  statusDot:      { width: 7, height: 7, borderRadius: 3.5 },
  hintRow:        { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#F8F8F8', paddingHorizontal: 14, paddingVertical: 10 },
  hintText:       { fontSize: 11, color: '#999999', lineHeight: 16, flex: 1 },
  hintBold:       { fontWeight: '700', color: '#F97316' },

  // ─── Edit Form ─────────────────────────────────────────────────────────────
  formCard: {
    backgroundColor: '#ffffff', marginHorizontal: 12, borderRadius: 16,
    padding: 16, marginBottom: 6, elevation: 2,
  },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, marginBottom: 16 },
  sectionHeading:   { fontSize: 17, fontWeight: '700', color: '#111111' },
  sectionSubtitle:  { marginTop: 3, fontSize: 12, lineHeight: 17, color: '#999999', maxWidth: 200 },
  successText:      { marginTop: 8, fontSize: 12, fontWeight: '600', color: '#F97316', backgroundColor: '#FFF7ED', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8 },
  uploadPill:       { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#FFF7ED', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 7, alignSelf: 'flex-start', flexShrink: 0 },
  uploadPillText:   { color: '#F97316', fontWeight: '700', fontSize: 12 },

  previewRow:       { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#F8F8F8', borderRadius: 12, padding: 10, marginBottom: 12 },
  formPreviewAvatar:{ width: 46, height: 46, borderRadius: 23, backgroundColor: '#FED7AA' },
  previewInfo:      { flex: 1 },
  previewTitle:     { fontSize: 13, fontWeight: '600', color: '#111111', marginBottom: 2 },
  helperText:       { fontSize: 11, color: '#999999', lineHeight: 15 },
  removeMiniButton: { width: 26, height: 26, borderRadius: 13, backgroundColor: '#FFF7ED', alignItems: 'center', justifyContent: 'center' },

  fieldGrid:      { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  inputGroup:     { width: '48.5%', marginBottom: 12 },
  fullWidthGroup: { width: '100%', marginBottom: 12 },
  inputLabel:     { fontSize: 11, fontWeight: '600', marginBottom: 6, color: '#666666' },
  inputWrap:      { flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 10, paddingHorizontal: 12, backgroundColor: '#F5F5F5', borderWidth: 1, borderColor: '#EEEEEE', minHeight: 44 },
  inputWrapDisabled:{ backgroundColor: '#F0F0F0', borderColor: '#EEEEEE' },
  input:            { flex: 1, color: '#111111', paddingVertical: 10, fontSize: 14 },
  inputDisabled:    { color: '#BBBBBB' },
  textAreaWrap:     { alignItems: 'flex-start', paddingTop: 10 },
  textAreaIcon:     { marginTop: 2 },
  textArea:         { minHeight: 72, textAlignVertical: 'top', paddingTop: 0 },

  // ─── Documents Section ─────────────────────────────────────────────────────
  documentSection:      { marginTop: 8, marginBottom: 4, backgroundColor: '#F8F8F8', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#EEEEEE' },
  documentSectionTitle: { fontSize: 11, fontWeight: '700', color: '#AAAAAA', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 },
  documentRow:          { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  documentInfo:         { flexDirection: 'row', alignItems: 'center', gap: 7, flex: 1 },
  documentLabel:        { fontSize: 13, fontWeight: '600', color: '#111111' },
  autoDocHint:          { fontSize: 10, fontWeight: '700', color: '#F97316' },
  documentSpacer:       { height: 10 },
  generatedDownloadBtn: { marginTop: 8, borderRadius: 10, paddingVertical: 11, paddingHorizontal: 14, backgroundColor: '#F97316', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 },
  generatedDownloadBtnAlt:{ backgroundColor: '#F97316' },
  generatedDownloadText:  { color: '#ffffff', fontSize: 13, fontWeight: '700' },

  // ─── Form Footer ───────────────────────────────────────────────────────────
  formFooterRow:    { flexDirection: 'row', gap: 8, marginTop: 14 },
  cancelButton:     { flex: 1, borderRadius: 10, paddingVertical: 12, alignItems: 'center', backgroundColor: '#F5F5F5', borderWidth: 1, borderColor: '#EEEEEE' },
  cancelButtonText: { color: '#666666', fontSize: 14, fontWeight: '600' },
  submitButton:     { flex: 1, borderRadius: 10, paddingVertical: 12, alignItems: 'center', backgroundColor: '#F97316' },
  submitButtonText: { color: '#ffffff', fontSize: 14, fontWeight: '700' },

  // ─── Misc ──────────────────────────────────────────────────────────────────
  stickyActionWrap: { paddingHorizontal: 12, paddingBottom: 6, paddingTop: 4 },
  stickyActionCard: { backgroundColor: '#ffffff', borderRadius: 14, paddingVertical: 12, paddingHorizontal: 14, borderWidth: 1, borderColor: '#EEEEEE', elevation: 2 },
  actionTitle: { fontSize: 10, fontWeight: '700', color: '#BBBBBB', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.6 },
  actionRow:   { flexDirection: 'row' },
  actionButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 9, paddingHorizontal: 18, borderRadius: 10, alignSelf: 'flex-start' },
  updateButton:     { backgroundColor: '#F97316' },
  actionButtonText: { color: '#ffffff', fontWeight: '700', fontSize: 13 },
  loadingText:      { textAlign: 'center', color: '#999999', fontSize: 12, marginTop: 12 },

  followModalOverlay: { flex: 1, backgroundColor: 'rgba(15,23,42,0.45)', justifyContent: 'flex-end' },
  followModalCard: { maxHeight: '72%', backgroundColor: '#ffffff', borderTopLeftRadius: 18, borderTopRightRadius: 18, paddingTop: 12 },
  followModalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  followModalTitle: { fontSize: 16, fontWeight: '800', color: '#111111' },
  followModalClose: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F5F5F5' },
  followModalList: { maxHeight: 420 },
  followModalListContent: { paddingVertical: 8, paddingBottom: 24 },
  followUserRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#F8F8F8' },
  followUserAvatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#FED7AA' },
  followUserInfo: { flex: 1 },
  followUserName: { fontSize: 14, fontWeight: '700', color: '#111111' },
  followUserEmail: { marginTop: 2, fontSize: 11, color: '#999999' },
  followEmptyText: { textAlign: 'center', color: '#999999', fontSize: 13, paddingVertical: 28 },

  bottomShell:     { backgroundColor: '#ffffff', borderTopWidth: 1, borderTopColor: '#EEEEEE' },
  bottomAppFooter: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 10, backgroundColor: '#ffffff' },
  postNewsBtn: {
    alignSelf: 'center', flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 7, paddingVertical: 11, paddingHorizontal: 28, borderRadius: 12, backgroundColor: '#F97316',
    shadowColor: '#F97316', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.35, shadowRadius: 8, elevation: 4,
  },
  postNewsBtnText: { color: '#ffffff', fontSize: 14, fontWeight: '700' },

  // Login prompt
  loginPromptWrap:     { alignItems: 'center', padding: 30, margin: 12, backgroundColor: '#ffffff', borderRadius: 16 },
  loginPromptIconWrap: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#FFF7ED', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  loginPromptHeading:  { fontSize: 18, fontWeight: '700', color: '#111111', marginBottom: 6 },
  loginPromptText:     { fontSize: 13, color: '#999999', textAlign: 'center', marginBottom: 16 },
  loginPromptBtn:      { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#F97316', borderRadius: 12, paddingVertical: 12, paddingHorizontal: 24 },
  loginPromptBtnText:  { color: '#ffffff', fontWeight: '700', fontSize: 14 },
});

export default ProfileStyles;

