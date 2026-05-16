import { StyleSheet } from 'react-native';

// Colour Palette
// Primary Green  : #1a9a72
// Primary Orange : #e8284a
// White          : #ffffff
// Black (text)   : #111111  (soft black for readability)
// Light BG       : #f5f5f2  (off-white page background)
// Card BG        : #ffffff
// Muted text     : #555555
// Border/divider : #e2e2e2

const ProfileStyles = StyleSheet.create({
  root: { flex:1, backgroundColor:'#f5f5f2' },
  bgOrbPrimary:   { position:'absolute', top:-70, left:-110, width:320, height:320, borderRadius:160, backgroundColor:'rgba(26,154,114,0.12)' },
  bgOrbSecondary: { position:'absolute', top:62, right:24, width:88, height:88, borderRadius:44, backgroundColor:'rgba(255,92,1,0.15)' },
  bgOrbTertiary:  { position:'absolute', bottom:118, right:-70, width:240, height:240, borderRadius:120, backgroundColor:'rgba(255,255,255,0.62)' },

  // Top bar (Back + action icons)
  topBar: { paddingHorizontal:16, paddingTop:12, paddingBottom:8, flexDirection:'row', alignItems:'center', justifyContent:'space-between' },
  topBarBackBtn: { width:42, height:42, borderRadius:21, alignItems:'center', justifyContent:'center', backgroundColor:'rgba(255,255,255,0.92)', borderWidth:1, borderColor:'rgba(226,232,240,0.9)', elevation:6 },
  topBarActions: { flexDirection:'row', alignItems:'center', gap:8 },
  topBarIconBtn: { width:40, height:40, borderRadius:20, alignItems:'center', justifyContent:'center', backgroundColor:'rgba(255,255,255,0.92)', borderWidth:1, borderColor:'rgba(226,232,240,0.9)', elevation:6 },

  scrollView:    { flex:1 },
  scrollContent: { paddingHorizontal:16, paddingTop:12, paddingBottom:200 },
  profileShell:  { gap:14 },

  // Summary card
  summaryCard:    { backgroundColor:'#ffffff', borderRadius:28, padding:18, elevation:8 },
  summaryTopRow:  { flexDirection:'row', alignItems:'center', gap:14 },
  avatarRing:     { width:88, height:88, borderRadius:44, padding:4, backgroundColor:'#1a9a72', alignItems:'center', justifyContent:'center', position:'relative' },
  avatar:         { width:80, height:80, borderRadius:40, backgroundColor:'#c8eed9' },
  onlineDot:      { position:'absolute', bottom:4, left:8, width:14, height:14, borderRadius:7, backgroundColor:'#1a9a72', borderWidth:2, borderColor:'#ffffff' },
  summaryContent: { flex:1 },
  profileName:    { fontSize:22, fontWeight:'800', color:'#111111' },
  profileRole:    { marginTop:2, fontSize:13, color:'#555555', fontWeight:'500' },
  summaryRankRow: { flexDirection:'row', alignItems:'center', gap:4, marginTop:6, flexWrap:'wrap' },
  summaryRankEmoji:{ fontSize:14 },
  summaryRankText: { fontSize:13, fontWeight:'700', color:'#111111' },
  summaryDot:     { fontSize:13, color:'#cccccc' },
  locationRow:    { flexDirection:'row', alignItems:'center', gap:4, marginTop:6 },
  locationText:   { fontSize:13, color:'#111111', fontWeight:'500' },
  metricRow:      { marginTop:16, flexDirection:'row', justifyContent:'space-between', alignItems:'center' },
  metricLabel:    { fontSize:11, color:'#555555', marginBottom:3 },
  metricValuePrimary: { fontSize:22, fontWeight:'800', color:'#1a9a72' },
  metricRightBlock:   { alignItems:'flex-end' },
  metricValueAccent:  { fontSize:22, fontWeight:'800', color:'#e8284a' },

  uploadBarCard:  { marginTop:16, borderRadius:18, backgroundColor:'#ffffff', overflow:'hidden', borderWidth:1, borderColor:'#e2e2e2' },
  uploadBarTrack: { height:90, backgroundColor:'#f5f5f2', position:'relative', overflow:'hidden' },
  uploadWaveOne:  { position:'absolute', left:-20, right:90, bottom:-12, height:56, borderTopLeftRadius:48, borderTopRightRadius:52, backgroundColor:'rgba(255,92,1,0.18)' },
  uploadWaveTwo:  { position:'absolute', left:80, right:-20, bottom:-8, height:70, borderTopLeftRadius:60, borderTopRightRadius:60, backgroundColor:'rgba(26,154,114,0.18)' },
  uploadDotOne:   { position:'absolute', left:'20%', top:30, width:12, height:12, borderRadius:6, backgroundColor:'#1a9a72', borderWidth:3, borderColor:'#ffffff' },
  uploadDotTwo:   { position:'absolute', left:'52%', top:14, width:12, height:12, borderRadius:6, backgroundColor:'#e8284a', borderWidth:3, borderColor:'#ffffff' },
  uploadDotThree: { position:'absolute', right:'14%', top:34, width:12, height:12, borderRadius:6, backgroundColor:'#1a9a72', borderWidth:3, borderColor:'#ffffff' },
  quickIconRow:   { paddingVertical:10, paddingHorizontal:14, flexDirection:'row', justifyContent:'center', alignItems:'center', backgroundColor:'rgba(255,255,255,0.95)' },
  quickIconButton:{ width:36, height:36, borderRadius:18, alignItems:'center', justifyContent:'center', backgroundColor:'#f5f5f2', borderWidth:1, borderColor:'#e2e2e2' },

  // Rank card
  rankCard:       { flexDirection:'row', alignItems:'center', gap:12, backgroundColor:'#ffffff', borderRadius:20, padding:14, borderWidth:1.5, borderColor:'#e2e2e2', elevation:4 },
  rankIconWrap:   { width:52, height:52, borderRadius:16, alignItems:'center', justifyContent:'center', backgroundColor:'#c8eed9' },
  rankEmoji:      { fontSize:26 },
  rankLabel:      { fontSize:10, fontWeight:'700', color:'#555555', textTransform:'uppercase', letterSpacing:0.5 },
  rankName:       { fontSize:18, fontWeight:'800', color:'#111111', marginTop:2 },
  rankNext:       { fontSize:11, color:'#555555', marginTop:3 },
  rankCountBadge: { borderRadius:14, paddingHorizontal:12, paddingVertical:8, alignItems:'center', minWidth:60, backgroundColor:'#1a9a72' },
  rankCountText:  { fontSize:20, fontWeight:'900', color:'#ffffff' },
  rankCountSub:   { fontSize:9, fontWeight:'700', color:'rgba(255,255,255,0.8)', textTransform:'uppercase' },

  // Referral card
  referralCard:   { flexDirection:'row', alignItems:'center', justifyContent:'space-between', backgroundColor:'#FF5C01', borderRadius:20, padding:14, borderWidth:1.5, borderColor:'#e8284a', elevation:3 },
  referralLeft:   { flexDirection:'row', alignItems:'center', gap:10, flex:1 },
  referralLabel:  { fontSize:10, fontWeight:'700', color:'rgba(255,255,255,0.8)', textTransform:'uppercase', letterSpacing:0.5 },
  referralCode:   { fontSize:18, fontWeight:'900', color:'#ffffff', letterSpacing:1.5, marginTop:2 },
  referralCopyBtn:{ flexDirection:'row', alignItems:'center', gap:5, backgroundColor:'#ffffff', borderRadius:999, paddingHorizontal:14, paddingVertical:8, borderWidth:1, borderColor:'rgba(255,255,255,0.5)' },
  referralCopyText:{ fontSize:12, fontWeight:'700', color:'#e8284a' },

  // Dropdown
  dropdownTrigger:      { flexDirection:'row', alignItems:'center', justifyContent:'space-between', borderRadius:12, paddingHorizontal:12, paddingVertical:13, backgroundColor:'#f5f5f2', borderWidth:1, borderColor:'#e2e2e2', minHeight:46 },
  dropdownValue:        { flex:1, color:'#111111', fontSize:14, fontWeight:'500' },
  dropdownPlaceholder:  { flex:1, color:'#999999', fontSize:14 },
  dropdownList:         { position:'absolute', top:50, left:0, right:0, backgroundColor:'#ffffff', borderRadius:12, elevation:12, borderWidth:1, borderColor:'#e2e2e2', zIndex:9999, overflow:'hidden' },
  dropdownItem:         { flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingHorizontal:14, paddingVertical:11, borderBottomWidth:1, borderBottomColor:'#f0f0f0' },
  dropdownItemActive:   { backgroundColor:'#c8eed9' },
  dropdownItemText:     { fontSize:14, color:'#111111', fontWeight:'500' },
  dropdownItemTextActive:{ color:'#1a9a72', fontWeight:'700' },

  idCardTemplate: { width:'100%', aspectRatio: 54 / 85 },
  idCardImage: { resizeMode:'cover' },
  idCardOverlay: { ...StyleSheet.absoluteFillObject },
  idCardPhotoFrame: { position:'absolute', top:'30%', left:'30%', width:'40%', aspectRatio:1, borderRadius:6, overflow:'hidden' },
  idCardNameValue: { position:'absolute', top:'60%', left:'24%', right:'8%', fontSize:11, fontWeight:'700', color:'#111111' },
  idCardDesigValue:{ position:'absolute', top:'65%', left:'24%', right:'8%', fontSize:10, fontWeight:'600', color:'#333333' },
  idCardAreaValue: { position:'absolute', top:'70%', left:'24%', right:'8%', fontSize:9.5, color:'#333333' },
  idCardMoValue:   { position:'absolute', top:'74.5%', left:'24%', right:'8%', fontSize:9.5, color:'#333333' },
  idCardIdValue:   { position:'absolute', top:'79%', left:'24%', fontSize:10, fontWeight:'800', color:'#FF5C01' },
  idCardValidValue:{ position:'absolute', top:'79%', right:'8%', fontSize:9, fontWeight:'700', color:'#333333' },

  apptTemplate: { width:'100%', aspectRatio: 210 / 297 },
  apptImage: { resizeMode:'cover' },
  apptOverlay: { ...StyleSheet.absoluteFillObject },
  apptNameValue: { position:'absolute', top:'55%', left:'24%', right:'10%', fontSize:12, fontWeight:'700', color:'#1a9a72' },
  apptDesigValue:{ position:'absolute', top:'59%', left:'28%', right:'10%', fontSize:11, fontWeight:'600', color:'#1a9a72' },
  apptLocationValue:{ position:'absolute', top:'63%', left:'36%', right:'10%', fontSize:10.5, fontWeight:'600', color:'#1a9a72' },
  apptDateFromValue:{ position:'absolute', top:'67%', left:'24%', fontSize:10.5, fontWeight:'600', color:'#1a9a72' },
  apptDateToValue:{ position:'absolute', top:'67%', left:'40%', fontSize:10.5, fontWeight:'600', color:'#1a9a72' },
  apptPhotoFrame: { position:'absolute', top:'61%', right:'14%', width:'18%', aspectRatio: 3 / 4, borderWidth:1, borderColor:'#e2e2e2', backgroundColor:'#f5f5f2', overflow:'hidden' },

  // Saved Profile Card
  infoCard:       { backgroundColor:'#ffffff', borderRadius:24, overflow:'hidden', elevation:10, marginBottom:2 },
  headerStrip:    { flexDirection:'row', alignItems:'center', justifyContent:'space-between', backgroundColor:'#1a9a72', paddingHorizontal:16, paddingVertical:14 },
  headerLeft:     { flexDirection:'row', alignItems:'center', gap:10 },
  headerIconWrap: { width:32, height:32, borderRadius:10, backgroundColor:'rgba(255,255,255,0.22)', alignItems:'center', justifyContent:'center' },
  cardTitle:      { fontSize:15, fontWeight:'800', color:'#ffffff', letterSpacing:0.2 },
  cardSubtitle:   { fontSize:11, color:'rgba(255,255,255,0.75)', marginTop:1 },
  memberBadge:    { backgroundColor:'rgba(255,255,255,0.18)', borderRadius:999, paddingHorizontal:10, paddingVertical:5, borderWidth:1, borderColor:'rgba(255,255,255,0.35)' },
  memberBadgeText:{ fontSize:12, fontWeight:'800', color:'#ffffff', letterSpacing:0.5 },
  divider:        { height:1, backgroundColor:'#e2e2e2', marginHorizontal:16 },
  fieldList:      { paddingHorizontal:16, paddingTop:4, paddingBottom:4 },
  fieldRow:       { flexDirection:'row', alignItems:'center', paddingVertical:12, gap:10 },
  fieldRowFull:   { alignItems:'flex-start' },
  fieldRowBorder: { borderBottomWidth:1, borderBottomColor:'#f0f0f0' },
  accentBar:      { width:3, height:34, borderRadius:3, backgroundColor:'#1a9a72' },
  fieldIconWrap:  { width:32, height:32, borderRadius:10, alignItems:'center', justifyContent:'center', backgroundColor:'#c8eed9' },
  fieldContent:   { flex:1 },
  fieldLabel:     { fontSize:10, fontWeight:'700', color:'#555555', textTransform:'uppercase', letterSpacing:0.6, marginBottom:3 },
  fieldValue:     { fontSize:13, fontWeight:'600', color:'#111111', lineHeight:19 },
  fieldValueEmpty:{ color:'#bbbbbb', fontStyle:'italic', fontWeight:'400' },
  statusDot:      { width:8, height:8, borderRadius:4, flexShrink:0 },
  hintRow:        { flexDirection:'row', alignItems:'center', gap:6, backgroundColor:'#f5f5f2', paddingHorizontal:16, paddingVertical:11, marginTop:2 },
  hintText:       { fontSize:11, color:'#555555', lineHeight:16, flex:1 },
  hintBold:       { fontWeight:'700', color:'#1a9a72' },

  // Edit Form
  formCard:         { backgroundColor:'rgba(255,255,255,0.96)', borderRadius:24, padding:16, elevation:7 },
  sectionHeaderRow: { flexDirection:'row', justifyContent:'space-between', alignItems:'flex-start', gap:12, marginBottom:14 },
  sectionHeading:   { fontSize:18, fontWeight:'800', color:'#111111' },
  sectionSubtitle:  { marginTop:4, fontSize:12, lineHeight:17, color:'#555555', maxWidth:220 },
  successText:      { marginTop:8, fontSize:13, fontWeight:'700', color:'#1a9a72', backgroundColor:'#e8f8f2', borderColor:'#1a9a72', borderWidth:1, paddingVertical:7, paddingHorizontal:10, borderRadius:10 },
  uploadPill:       { flexDirection:'row', alignItems:'center', gap:6, backgroundColor:'#c8eed9', borderRadius:999, paddingHorizontal:12, paddingVertical:8, alignSelf:'flex-start', flexShrink:0 },
  uploadPillText:   { color:'#1a9a72', fontWeight:'700', fontSize:12 },
  previewRow:       { flexDirection:'row', alignItems:'center', gap:12, backgroundColor:'#f5f5f2', borderRadius:16, padding:12, marginBottom:14 },
  formPreviewAvatar:{ width:52, height:52, borderRadius:26, backgroundColor:'#c8eed9' },
  previewInfo:      { flex:1 },
  previewTitle:     { fontSize:13, fontWeight:'700', color:'#111111', marginBottom:2 },
  helperText:       { fontSize:11, color:'#555555', lineHeight:15 },
  removeMiniButton: { width:30, height:30, borderRadius:15, backgroundColor:'#fff0eb', alignItems:'center', justifyContent:'center' },
  fieldGrid:        { flexDirection:'row', flexWrap:'wrap', justifyContent:'space-between' },
  inputGroup:       { width:'48.6%', marginBottom:12 },
  fullWidthGroup:   { width:'100%', marginBottom:12 },
  inputLabel:       { fontSize:11, fontWeight:'700', marginBottom:6, color:'#333333', textTransform:'uppercase', letterSpacing:0.3 },
  inputWrap:        { flexDirection:'row', alignItems:'center', gap:8, borderRadius:12, paddingHorizontal:12, backgroundColor:'#f5f5f2', borderWidth:1, borderColor:'#e2e2e2', minHeight:46 },
  inputWrapDisabled:{ backgroundColor:'#ececec', borderColor:'#e2e2e2' },
  input:            { flex:1, color:'#111111', paddingVertical:10, fontSize:14 },
  inputDisabled:    { color:'#999999' },
  textAreaWrap:     { alignItems:'flex-start', paddingTop:10 },
  textAreaIcon:     { marginTop:2 },
  textArea:         { minHeight:80, textAlignVertical:'top', paddingTop:0 },

  // Documents section
  documentSection:      { marginTop:14, marginBottom:8, backgroundColor:'#f5f5f2', borderRadius:16, padding:14, borderWidth:1, borderColor:'#e2e2e2' },
  documentSectionTitle: { fontSize:13, fontWeight:'800', color:'#111111', marginBottom:14, textTransform:'uppercase', letterSpacing:0.4 },
  documentRow:          { flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:10 },
  documentInfo:         { flexDirection:'row', alignItems:'center', gap:8, flex:1 },
  documentLabel:        { fontSize:13, fontWeight:'600', color:'#111111' },
  autoDocHint:          { fontSize:11, fontWeight:'700', color:'#1a9a72' },
  documentSpacer:       { height:14 },
  generatedDownloadBtn: { marginTop:10, borderRadius:14, paddingVertical:12, paddingHorizontal:14, backgroundColor:'#e8284a', flexDirection:'row', alignItems:'center', justifyContent:'center', gap:8 },
  generatedDownloadBtnAlt:{ backgroundColor:'#e8284a' },
  generatedDownloadText:{ color:'#ffffff', fontSize:13, fontWeight:'800' },

  // Form footer
  formFooterRow:    { flexDirection:'row', gap:10, marginTop:14 },
  cancelButton:     { flex:1, borderRadius:14, paddingVertical:13, alignItems:'center', backgroundColor:'#f5f5f2', borderWidth:1, borderColor:'#e2e2e2' },
  cancelButtonText: { color:'#555555', fontSize:14, fontWeight:'700' },
  submitButton:     { flex:1, borderRadius:14, paddingVertical:13, alignItems:'center', backgroundColor:'#1a9a72', elevation:4 },
  submitButtonText: { color:'#ffffff', fontSize:14, fontWeight:'800' },

  // Sticky action
  stickyActionWrap: { paddingHorizontal:16, paddingBottom:8, paddingTop:4, backgroundColor:'transparent' },
  stickyActionCard: { backgroundColor:'rgba(255,255,255,0.97)', borderRadius:20, padding:14, elevation:8, borderWidth:1, borderColor:'rgba(26,154,114,0.2)' },
  actionTitle:      { fontSize:12, fontWeight:'800', color:'#111111', marginBottom:10, textTransform:'uppercase', letterSpacing:0.5 },
  actionRow:        { flexDirection:'row' },
  actionButton:     { flex:1, flexDirection:'row', alignItems:'center', justifyContent:'center', gap:8, paddingVertical:13, borderRadius:14, elevation:3 },
  updateButton:     { backgroundColor:'#e8284a' },
  actionButtonText: { color:'#fff', fontWeight:'800', fontSize:14 },
  loadingText:      { textAlign:'center', color:'#555555', fontSize:12, marginTop:10 },

  // Bottom app footer (Post News)
  bottomShell: { backgroundColor:'transparent' },
  bottomAppFooter: { paddingHorizontal:16, paddingTop:6, paddingBottom:12, backgroundColor:'rgba(245,245,242,0.98)' },
  postNewsBtn: { borderRadius:16, paddingVertical:14, paddingHorizontal:16, backgroundColor:'#111111', flexDirection:'row', alignItems:'center', justifyContent:'center', gap:10, elevation:10 },
  postNewsBtnText: { color:'#ffffff', fontSize:15, fontWeight:'900', letterSpacing:0.2 },
});

export default ProfileStyles;