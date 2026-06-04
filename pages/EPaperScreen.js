import React, { useCallback, useRef, useState, useEffect } from 'react';
import {
  Alert, Image, Modal, Platform, ScrollView, Text, TextInput,
  TouchableOpacity, View, Share, KeyboardAvoidingView, SafeAreaView,
  useWindowDimensions,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { RichEditor, RichToolbar, actions } from 'react-native-pell-rich-editor';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useToast } from '../components/ui/ToastProvider';
import EPaperStyles from '../styles/EPaperStyles';
import { UserStore } from '../store/UserStore';

// ─── Amber/Orange tokens (web only) ──────────────────────────────────────────
const O = { 50:'#FEF6EC', 100:'#FDECD8', 200:'#FBCFA0', 400:'#F09A3E', 600:'#C8700F', 800:'#7A420A' };

const DEFAULT_STATE = 'Maharashtra';

// ─── Web-only styles ──────────────────────────────────────────────────────────
const w = {
  root: { flex:1, backgroundColor:'#F7F4F0', minHeight:'100vh' },
  topBar: { flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingHorizontal:32, paddingVertical:14, backgroundColor:'#ffffff', borderBottomWidth:1, borderBottomColor:'#EDE8E1' },
  topLeft: { flexDirection:'row', alignItems:'center', gap:6 },
  bcStep: { fontSize:13, color:'#888888' },
  bcSep:  { fontSize:15, color:'#CCCCCC', marginHorizontal:4 },
  bcCur:  { fontSize:13, fontWeight:'600', color:'#111111' },
  backBtn: { flexDirection:'row', alignItems:'center', gap:6, paddingHorizontal:16, paddingVertical:8, backgroundColor:O[50], borderWidth:1, borderColor:O[200], borderRadius:8 },
  backBtnText: { fontSize:13, fontWeight:'600', color:O[800] },
  scroll: { flex:1 },
  scrollContent: { paddingHorizontal:32, paddingTop:28, paddingBottom:60, alignItems:'center' },
  innerWrap: { width:'100%', maxWidth:1100, alignSelf:'center' },
  pageHeadRow: { flexDirection:'row', alignItems:'flex-end', justifyContent:'space-between', marginBottom:24 },
  pageTitle: { fontSize:24, fontWeight:'800', color:'#111111', marginBottom:3 },
  pageSub:   { fontSize:14, color:'#888888' },
  addBtn: { flexDirection:'row', alignItems:'center', gap:7, backgroundColor:O[400], paddingHorizontal:20, paddingVertical:10, borderRadius:10 },
  addBtnText: { fontSize:14, fontWeight:'700', color:'#ffffff' },
  metricsRow: { flexDirection:'row', gap:14, marginBottom:24 },
  mc: { flex:1, backgroundColor:'#ffffff', borderRadius:14, padding:20, borderWidth:1, borderColor:'#EDE8E1', overflow:'hidden' },
  mcBar: { position:'absolute', top:0, left:0, right:0, height:3 },
  mcBarArticles: { backgroundColor:O[400] },
  mcBarViews:    { backgroundColor:'#3B82F6' },
  mcBarPending:  { backgroundColor:'#F59E0B' },
  mcTop: { flexDirection:'row', alignItems:'center', justifyContent:'space-between', marginBottom:14 },
  mcIcon: { width:36, height:36, borderRadius:9, backgroundColor:O[50], borderWidth:1, borderColor:O[200], alignItems:'center', justifyContent:'center' },
  mcIconBlue:   { backgroundColor:'#EFF6FF', borderColor:'#BFDBFE' },
  mcIconYellow: { backgroundColor:'#FFFBEB', borderColor:'#FDE68A' },
  mcBadge: { fontSize:11, fontWeight:'600', color:O[800], backgroundColor:O[50], borderWidth:1, borderColor:O[200], paddingHorizontal:8, paddingVertical:3, borderRadius:20 },
  mcBadgeBlue:   { color:'#1E40AF', backgroundColor:'#EFF6FF', borderColor:'#BFDBFE' },
  mcBadgeYellow: { color:'#92400E', backgroundColor:'#FFFBEB', borderColor:'#FDE68A' },
  mcVal: { fontSize:28, fontWeight:'800', color:'#111111', marginBottom:3 },
  mcLbl: { fontSize:12, color:'#888888', fontWeight:'500' },
  sectionHead: { flexDirection:'row', alignItems:'center', justifyContent:'space-between', marginBottom:16 },
  sectionTitle: { fontSize:17, fontWeight:'800', color:'#111111' },
  sectionSub:   { fontSize:13, color:'#888888', marginTop:2 },
  pill: { flexDirection:'row', alignItems:'center', gap:5, backgroundColor:O[50], borderWidth:1, borderColor:O[100], borderRadius:20, paddingHorizontal:12, paddingVertical:5 },
  pillTxt: { fontSize:12, fontWeight:'700', color:O[800] },
  grid: { flexDirection:'row', flexWrap:'wrap', gap:16 },
  articleCard: { width:'calc(50% - 8px)', backgroundColor:'#ffffff', borderRadius:14, borderWidth:1, borderColor:'#EDE8E1', overflow:'hidden' },
  articleStripe: { height:4 },
  articleStripeApproved: { backgroundColor:'#22C55E' },
  articleStripePending:  { backgroundColor:O[400] },
  articleStripeRejected: { backgroundColor:'#EF4444' },
  articleBody: { padding:18 },
  articleMeta: { flexDirection:'row', alignItems:'center', justifyContent:'space-between', marginBottom:10 },
  statusBadge: { borderRadius:999, paddingHorizontal:10, paddingVertical:3, alignSelf:'flex-start' },
  statusBadgeText: { fontSize:10, fontWeight:'800' },
  articleDate: { fontSize:11, color:'#AAAAAA', fontWeight:'500' },
  stateChip: { flexDirection:'row', alignItems:'center', gap:4, backgroundColor:O[50], borderWidth:1, borderColor:O[200], borderRadius:20, paddingHorizontal:9, paddingVertical:3, alignSelf:'flex-start', marginBottom:10 },
  stateChipTxt: { fontSize:11, fontWeight:'700', color:O[800] },
  articleTitle: { fontSize:15, fontWeight:'700', color:'#111111', marginBottom:7, lineHeight:22 },
  articleDesc:  { fontSize:13, color:'#666666', lineHeight:20, marginBottom:12 },
  mediaBadge: { flexDirection:'row', alignItems:'center', gap:5, backgroundColor:O[50], borderWidth:1, borderColor:O[200], borderRadius:20, paddingHorizontal:10, paddingVertical:4, alignSelf:'flex-start', marginBottom:12 },
  mediaBadgeTxt: { fontSize:11, fontWeight:'700', color:O[800] },
  statsRow: { flexDirection:'row', gap:14, marginBottom:14 },
  statItem: { flexDirection:'row', alignItems:'center', gap:4 },
  statTxt:  { fontSize:12, color:'#888888', fontWeight:'500' },
  divider:  { height:1, backgroundColor:'#F5F2EE', marginBottom:14 },
  actionRow: { flexDirection:'row', gap:8, flexWrap:'wrap' },
  actionBtn: { flexDirection:'row', alignItems:'center', gap:5, paddingVertical:7, paddingHorizontal:14, borderRadius:8, backgroundColor:O[50], borderWidth:1, borderColor:O[200] },
  actionBtnTxt: { fontSize:12, fontWeight:'700', color:O[800] },
  actionBtnDanger: { flexDirection:'row', alignItems:'center', gap:5, paddingVertical:7, paddingHorizontal:14, borderRadius:8, backgroundColor:'#FEF2F2', borderWidth:1, borderColor:'#FECACA' },
  actionBtnDangerTxt: { fontSize:12, fontWeight:'700', color:'#DC2626' },
  adminRow: { flexDirection:'row', gap:8, marginTop:8 },
  approveBtn: { flex:1, flexDirection:'row', alignItems:'center', justifyContent:'center', gap:5, paddingVertical:8, borderRadius:8, backgroundColor:'#F0FDF4', borderWidth:1, borderColor:'#BBF7D0' },
  approveBtnTxt: { fontSize:12, fontWeight:'700', color:'#16A34A' },
  rejectBtn: { flex:1, flexDirection:'row', alignItems:'center', justifyContent:'center', gap:5, paddingVertical:8, borderRadius:8, backgroundColor:'#FEF2F2', borderWidth:1, borderColor:'#FECACA' },
  rejectBtnTxt: { fontSize:12, fontWeight:'700', color:'#DC2626' },
  successOverlay: { position:'absolute', top:70, left:0, right:0, alignItems:'center', zIndex:999, pointerEvents:'none' },
  successBox: { flexDirection:'row', alignItems:'center', gap:10, backgroundColor:'#F0FDF4', borderWidth:1, borderColor:'#BBF7D0', borderRadius:12, paddingVertical:10, paddingHorizontal:18 },
  successTxt: { fontSize:13, fontWeight:'700', color:'#15803D' },
  emptyWrap: { alignItems:'center', paddingVertical:60 },
  webModalRoot: { flex:1, backgroundColor:'#F7F4F0', minHeight:'100vh' },
  webModalHeader: { flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingHorizontal:24, paddingVertical:14, backgroundColor:O[400], borderBottomWidth:2, borderBottomColor:O[600] },
  webModalHeaderTitle: { fontSize:17, fontWeight:'800', color:'#ffffff', flex:1, textAlign:'center' },
  webModalCloseBtn: { width:36, height:36, borderRadius:8, backgroundColor:'rgba(255,255,255,0.2)', alignItems:'center', justifyContent:'center' },
  webModalSaveBtn: { backgroundColor:'#ffffff', borderRadius:10, paddingHorizontal:20, paddingVertical:9, borderWidth:1.5, borderColor:O[200] },
  webModalSaveBtnText: { fontSize:13, fontWeight:'800', color:O[800] },
  webFormScroll: { flex:1 },
  webFormContent: { paddingHorizontal:32, paddingTop:24, paddingBottom:60, alignItems:'center' },
  webFormInner: { width:'100%', maxWidth:820, alignSelf:'center' },
  webFieldLabel: { fontSize:12, fontWeight:'800', color:'#111111', letterSpacing:0.6, textTransform:'uppercase', marginBottom:6 },
  webFieldLabelSpaced: { fontSize:12, fontWeight:'800', color:'#111111', letterSpacing:0.6, textTransform:'uppercase', marginTop:20, marginBottom:4 },
  webFieldHint: { fontSize:12, color:'#888888', marginBottom:8 },
  webTextInput: { minHeight:80, borderWidth:1.5, borderColor:'#E5DDD5', borderRadius:12, padding:14, fontSize:14, color:'#111111', backgroundColor:'#ffffff', textAlignVertical:'top' },
  webTextInputDesc: { minHeight:140, borderWidth:1.5, borderColor:'#E5DDD5', borderRadius:12, padding:14, fontSize:14, color:'#111111', backgroundColor:'#ffffff', textAlignVertical:'top' },
  webDateInput: { borderWidth:1.5, borderColor:'#E5DDD5', borderRadius:12, paddingHorizontal:14, paddingVertical:13, backgroundColor:'#ffffff', flexDirection:'row', alignItems:'center', gap:10 },
  webDateInputText: { fontSize:13, fontWeight:'600', color:'#111111', flex:1 },
  webDateInputPlaceholder: { color:'#AAAAAA', fontWeight:'400' },
  webStateSelector: { flexDirection:'row', alignItems:'center', gap:10, borderWidth:1.5, borderColor:'#E5DDD5', borderRadius:12, paddingHorizontal:14, paddingVertical:13, backgroundColor:'#ffffff', marginTop:4 },
  webStateSelectorText: { flex:1, fontSize:13, fontWeight:'600', color:'#111111' },
  webStateSelectorPlaceholder: { color:'#AAAAAA', fontWeight:'400' },
  webStateChip: { marginTop:8, alignSelf:'flex-start', flexDirection:'row', alignItems:'center', gap:6, backgroundColor:O[50], borderWidth:1, borderColor:O[200], borderRadius:999, paddingHorizontal:12, paddingVertical:5 },
  webStateChipTxt: { fontSize:11, fontWeight:'800', color:O[800] },
  webMediaCard: { marginTop:20, marginBottom:8, borderRadius:20, padding:20, backgroundColor:'#ffffff', borderWidth:1.5, borderColor:O[200] },
  webMediaEyebrow: { fontSize:11, color:O[600], fontWeight:'800', textTransform:'uppercase', letterSpacing:1.5, marginBottom:4 },
  webMediaTitle: { fontSize:17, fontWeight:'800', color:'#111111', marginBottom:6 },
  webMediaSubtitle: { fontSize:12, color:'#666666', lineHeight:18, marginBottom:14 },
  webMediaBadgeRow: { flexDirection:'row', flexWrap:'wrap', gap:10, marginBottom:14 },
  webMediaPill: { flexDirection:'row', alignItems:'center', gap:6, paddingHorizontal:12, paddingVertical:7, borderRadius:999, backgroundColor:O[50], borderWidth:1, borderColor:O[200] },
  webMediaPillTxt: { fontSize:11, fontWeight:'800', color:O[800] },
  webMediaSection: { marginBottom:12, borderRadius:14, padding:16, backgroundColor:'#F7F4F0', borderWidth:1, borderColor:'#E5DDD5' },
  webMediaSectionCaption: { fontSize:11, color:'#AAAAAA', lineHeight:16, marginBottom:8 },
  webMediaSectionTitle: { fontSize:13, fontWeight:'800', color:'#111111', marginBottom:10 },
  webPickBtn: { flexDirection:'row', alignItems:'center', justifyContent:'center', gap:8, borderWidth:1.5, borderColor:O[400], borderStyle:'dashed', borderRadius:12, paddingVertical:14, backgroundColor:O[50] },
  webPickBtnTxt: { fontSize:13, fontWeight:'800', color:O[600] },
  webAdminNote: { flexDirection:'row', alignItems:'flex-start', gap:8, backgroundColor:'#fefce8', borderWidth:1, borderColor:'#fde68a', borderRadius:12, padding:14, marginTop:10 },
  webAdminNoteTxt: { flex:1, fontSize:12, color:'#854d0e', fontWeight:'600', lineHeight:18 },
  emptyIcon: { width:56, height:56, borderRadius:14, backgroundColor:O[50], borderWidth:1, borderColor:O[200], alignItems:'center', justifyContent:'center', marginBottom:14 },
  emptyTxt:  { fontSize:15, fontWeight:'600', color:'#888888', marginBottom:4 },
  emptySub:  { fontSize:13, color:'#AAAAAA' },
  loadingTxt:{ fontSize:14, color:'#888888', paddingVertical:40, textAlign:'center' },
};

const getWebStyles = (windowWidth) => {
  const isPhone = windowWidth <= 640;
  const isNarrow = windowWidth <= 820;
  const isTablet = windowWidth <= 1024;

  if (!isPhone && !isNarrow && !isTablet) return w;

  return {
    ...w,
    topBar: {
      ...w.topBar,
      alignItems: isPhone ? 'flex-start' : 'center',
      flexDirection: isPhone ? 'column' : 'row',
      gap: isPhone ? 10 : 12,
      paddingHorizontal: isPhone ? 16 : 24,
      paddingVertical: isPhone ? 12 : 14,
    },
    topLeft: { ...w.topLeft, flexWrap: 'wrap', maxWidth: '100%' },
    backBtn: { ...w.backBtn, alignSelf: isPhone ? 'flex-start' : 'auto', paddingHorizontal: isPhone ? 12 : 16 },
    scrollContent: { ...w.scrollContent, paddingHorizontal: isPhone ? 14 : 24, paddingTop: isPhone ? 22 : 28 },
    innerWrap: { ...w.innerWrap, maxWidth: isTablet ? 820 : 1100 },
    pageHeadRow: { ...w.pageHeadRow, alignItems: isPhone ? 'stretch' : 'flex-end', flexDirection: isPhone ? 'column' : 'row', gap: isPhone ? 14 : 18, marginBottom: isPhone ? 18 : 24 },
    pageTitle: { ...w.pageTitle, fontSize: isPhone ? 22 : 24 },
    pageSub: { ...w.pageSub, flexShrink: 1, lineHeight: 20 },
    addBtn: { ...w.addBtn, justifyContent: 'center', alignSelf: isPhone ? 'stretch' : 'auto', paddingVertical: isPhone ? 12 : 10 },
    metricsRow: { ...w.metricsRow, flexWrap: 'wrap', gap: isPhone ? 10 : 12, marginBottom: isPhone ? 20 : 24 },
    mc: { ...w.mc, flex: isPhone ? 0 : 1, width: isPhone ? '100%' : 'calc(33.333% - 8px)', minWidth: isPhone ? '100%' : 180, padding: isPhone ? 16 : 18 },
    mcTop: { ...w.mcTop, marginBottom: isPhone ? 10 : 14 },
    sectionHead: { ...w.sectionHead, alignItems: isPhone ? 'flex-start' : 'center', flexDirection: isPhone ? 'column' : 'row', gap: isPhone ? 10 : 12 },
    grid: { ...w.grid, gap: isPhone ? 12 : 14 },
    articleCard: { ...w.articleCard, width: isNarrow ? '100%' : 'calc(50% - 7px)' },
    articleBody: { ...w.articleBody, padding: isPhone ? 14 : 18 },
    articleMeta: { ...w.articleMeta, alignItems: 'flex-start', gap: 8 },
    statsRow: { ...w.statsRow, flexWrap: 'wrap', gap: isPhone ? 10 : 14 },
    actionBtn: { ...w.actionBtn, justifyContent: 'center', minWidth: isPhone ? 'calc(50% - 4px)' : 92, flexGrow: isPhone ? 1 : 0 },
    actionBtnDanger: { ...w.actionBtnDanger, justifyContent: 'center', minWidth: isPhone ? 'calc(50% - 4px)' : 92, flexGrow: isPhone ? 1 : 0 },
    successOverlay: { ...w.successOverlay, top: isPhone ? 84 : 70, paddingHorizontal: 14 },
    successBox: { ...w.successBox, maxWidth: '100%' },
    webModalHeader: { ...w.webModalHeader, paddingHorizontal: isPhone ? 14 : 24, gap: isPhone ? 8 : 12 },
    webModalHeaderTitle: { ...w.webModalHeaderTitle, fontSize: isPhone ? 15 : 17 },
    webModalSaveBtn: { ...w.webModalSaveBtn, paddingHorizontal: isPhone ? 14 : 20 },
    webFormContent: { ...w.webFormContent, paddingHorizontal: isPhone ? 14 : 24, paddingTop: isPhone ? 18 : 24 },
    webMediaCard: { ...w.webMediaCard, borderRadius: isPhone ? 16 : 20, padding: isPhone ? 14 : 20 },
    webMediaBadgeRow: { ...w.webMediaBadgeRow, gap: 8 },
    webMediaPill: { ...w.webMediaPill, flexGrow: isPhone ? 1 : 0, justifyContent: isPhone ? 'center' : 'flex-start' },
    webMediaSection: { ...w.webMediaSection, padding: isPhone ? 12 : 16 },
  };
};

function StatusBadge({ status, web }) {
  const cfg = {
    approved:{ bg:'#DCFCE7', color:'#16A34A', label:'Approved' },
    pending: { bg:'#FFF7ED', color:'#EA580C', label:'Pending'  },
    rejected:{ bg:'#FEE2E2', color:'#DC2626', label:'Rejected' },
  }[status] || { bg:'#F1F5F9', color:'#64748B', label:status||'—' };
  const s = web ? w : EPaperStyles;
  return (
    <View style={[s.statusBadge,{backgroundColor:cfg.bg}]}>
      <Text style={[s.statusBadgeText,{color:cfg.color}]}>{cfg.label}</Text>
    </View>
  );
}

const INDIA_STATES=['Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal','Andaman and Nicobar Islands','Chandigarh','Dadra and Nagar Haveli','Daman and Diu','Delhi','Jammu and Kashmir','Ladakh','Lakshadweep','Puducherry'];

const IMAGE_PICKER_MEDIA_TYPE=ImagePicker.MediaType;
const IMAGE_PICKER_MEDIA_TYPE_OPTIONS=ImagePicker.MediaTypeOptions;
const normalizeEPaperMediaType=(typeValue)=>{if(!typeValue)return undefined;const n=String(typeValue).toLowerCase();if(n.includes('images'))return ImagePicker.MediaType?.Images||'images';if(n.includes('videos'))return ImagePicker.MediaType?.Videos||'videos';if(n.includes('all'))return ImagePicker.MediaType?.All||'all';return typeValue;};

// ─── Helper: today's date as YYYY-MM-DD ──────────────────────────────────────
const todayStr = () => new Date().toISOString().slice(0, 10);

function StatePickerModal({visible,selected,onSelect,onClose}){
  const[search,setSearch]=useState('');
  const isWeb=Platform.OS==='web';
  useEffect(()=>{if(!visible)setSearch('');},[visible]);
  const filtered=INDIA_STATES.filter(s=>s.toLowerCase().includes(search.toLowerCase()));
  if(!visible)return null;

  if(isWeb){
    return(
      <View style={{position:'absolute',top:0,left:0,right:0,bottom:0,justifyContent:'center',alignItems:'center',zIndex:1000,padding:20}}>
        <TouchableOpacity style={{position:'absolute',top:0,left:0,right:0,bottom:0,backgroundColor:'rgba(0,0,0,0.45)'}} activeOpacity={1} onPress={onClose}/>
        <View style={{width:'100%',maxWidth:480,maxHeight:520,backgroundColor:'#ffffff',borderRadius:20,overflow:'hidden',elevation:20}}>
          <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',paddingHorizontal:20,paddingVertical:16,borderBottomWidth:1,borderBottomColor:'#F0EBE4'}}>
            <Text style={{fontSize:16,fontWeight:'800',color:'#111111'}}>Select State</Text>
            <TouchableOpacity onPress={onClose} style={{width:30,height:30,borderRadius:8,backgroundColor:'#F5F5F5',alignItems:'center',justifyContent:'center'}}>
              <Feather name="x" size={16} color="#555555"/>
            </TouchableOpacity>
          </View>
          <View style={{flexDirection:'row',alignItems:'center',gap:8,margin:14,paddingHorizontal:12,paddingVertical:10,backgroundColor:'#F7F4F0',borderRadius:10,borderWidth:1,borderColor:'#E5DDD5'}}>
            <Feather name="search" size={14} color="#AAAAAA"/>
            <TextInput style={{flex:1,fontSize:13,color:'#111111',padding:0}} placeholder="Search state..." placeholderTextColor="#AAAAAA" value={search} onChangeText={setSearch}/>
          </View>
          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" style={{maxHeight:360}}>
            {filtered.map((state)=>(
              <TouchableOpacity key={state} onPress={()=>{onSelect(state);onClose();}}
                style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',paddingVertical:12,paddingHorizontal:20,backgroundColor:selected===state?'#FEF6EC':'#ffffff',borderBottomWidth:1,borderBottomColor:'#F5F2EE'}}>
                <Text style={{fontSize:13,fontWeight:selected===state?'800':'500',color:selected===state?'#C8700F':'#333333'}}>{state}</Text>
                {selected===state?<Feather name="check" size={14} color="#C8700F"/>:null}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    );
  }

  return(
    <View style={EPaperStyles.stateModalOverlay}>
      <TouchableOpacity style={EPaperStyles.stateModalBackdrop} activeOpacity={1} onPress={onClose}/>
      <View style={EPaperStyles.stateModalBox}>
        <View style={EPaperStyles.stateModalHeader}>
          <Text style={EPaperStyles.stateModalTitle}>Select State</Text>
          <TouchableOpacity onPress={onClose}><Feather name="x" size={20} color="#0f172a"/></TouchableOpacity>
        </View>
        <View style={EPaperStyles.stateSearchWrap}>
          <Feather name="search" size={15} color="#64748b"/>
          <TextInput style={EPaperStyles.stateSearchInput} placeholder="Search state..." placeholderTextColor="#94a3b8" value={search} onChangeText={setSearch}/>
        </View>
        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {filtered.map((state)=>(
            <TouchableOpacity key={state} style={[EPaperStyles.stateItem,selected===state&&EPaperStyles.stateItemActive]} onPress={()=>{onSelect(state);onClose();}}>
              <Text style={[EPaperStyles.stateItemText,selected===state&&EPaperStyles.stateItemTextActive]}>{state}</Text>
              {selected===state?<Feather name="check" size={15} color="#F97316"/>:null}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

export default function EPaperScreen({navigation}){
  const{showToast}=useToast();
  const isWeb=Platform.OS==='web';
  const { width: windowWidth } = useWindowDimensions();
  const ws = React.useMemo(() => getWebStyles(windowWidth), [windowWidth]);
  const htmlToPlain=(html)=>String(html||'').replace(/<[^>]*>/g,' ').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&nbsp;/g,' ').replace(/\s+/g,' ').trim();
  const escapeHtml=(text)=>String(text||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
  const plainToHtml=(text)=>`<div>${escapeHtml(text).replace(/\n/g,'<br/>')}</div>`;

  const[loading,setLoading]=useState(true);
  const[currentUser,setCurrentUser]=useState(null);
  const[isAdmin,setIsAdmin]=useState(false);
  const[items,setItems]=useState([]);
  const[totalViews,setTotalViews]=useState(0);
  const[formVisible,setFormVisible]=useState(false);
  const[editItem,setEditItem]=useState(null);
  const[fImages,setFImages]=useState([]);
  const[fSaving,setFSaving]=useState(false);
  const[selectedState,setSelectedState]=useState(DEFAULT_STATE);
  const[statePickerVisible,setStatePickerVisible]=useState(false);
  const[fDate,setFDate]=useState(todayStr());
  const fTitleRef=useRef('');
  const fDescRef=useRef('');
  const[viewItem,setViewItem]=useState(null);
  const[manageDateKey,setManageDateKey]=useState(null);
const[manageDateFilter,setManageDateFilter]=useState('all');
  const[successMsg,setSuccessMsg]=useState('');
  const showSuccess=(msg)=>{setSuccessMsg(msg);setTimeout(()=>setSuccessMsg(''),3000);};

  const loadData=useCallback(async()=>{
    setLoading(true);
    const user=await UserStore.getCurrentUser();
    if(!user){navigation.replace('Login');return;}
    setCurrentUser(user);setIsAdmin(user.role==='admin');
    const data=await UserStore.getEPaperSummary();
    if(data){
      const filtered=user.role==='admin'?data.items:data.items.filter(i=>i.status==='approved'||i.createdBy===user.email);
      setItems(filtered);setTotalViews(data.totalViews);
    }
    setLoading(false);
  },[navigation]);
  useFocusEffect(useCallback(()=>{loadData();},[loadData]));

  const openAddForm=()=>{
    setEditItem(null);
    fTitleRef.current='';
    fDescRef.current='';
    setFImages([]);
    setSelectedState(DEFAULT_STATE);
    setFDate(todayStr());
    setStatePickerVisible(false);
    setFormVisible(true);
  };

  const openEditForm=(item)=>{
    setEditItem(item);
    fTitleRef.current=item.title||'';
    fDescRef.current=item.description||'';
    setFImages(item.images||[]);
    setSelectedState(item.state||DEFAULT_STATE);
    setFDate(item.publishDate||item.createdAt?.slice(0,10)||todayStr());
    setStatePickerVisible(false);
    setFormVisible(true);
  };

  const closeForm=()=>{setStatePickerVisible(false);setFormVisible(false);setEditItem(null);};

  const pickImages=async()=>{
    const{status}=await ImagePicker.requestMediaLibraryPermissionsAsync();
    if(status!=='granted'){showToast('Gallery permission needed.','error');return;}
    const imageType=normalizeEPaperMediaType(IMAGE_PICKER_MEDIA_TYPE?.Images??IMAGE_PICKER_MEDIA_TYPE_OPTIONS?.Images);
    const result=await ImagePicker.launchImageLibraryAsync({mediaTypes:imageType||undefined,allowsMultipleSelection:true,base64:true,quality:0.5,maxWidth:1280,maxHeight:1280,exif:false});
    if(!result.canceled&&result.assets?.length){
      const processed=[];
      for(let i=0;i<Math.min(result.assets.length,10);i++){
        const asset=result.assets[i];
        if(asset.fileSize&&asset.fileSize>10*1024*1024){showToast(`Image ${i+1} too large. Skipping.`,'warning');continue;}
        if(asset.base64){
          const mime=asset.mimeType||'image/jpeg';
          processed.push(`data:${mime};base64,${asset.base64}`);
        } else {
          processed.push(asset.uri);
        }
      }
      if(processed.length>0)setFImages(prev=>[...prev,...processed]);
      if(result.assets.length>10)showToast('Only first 10 images added.','info');
    }
  };
  const removeImage=(idx)=>setFImages(prev=>prev.filter((_,i)=>i!==idx));

  const handleSave=async()=>{
    const titleHtml=fTitleRef.current||'';
    const descHtml=fDescRef.current||'';
    const titlePlain=htmlToPlain(titleHtml);
    const descPlain=htmlToPlain(descHtml);
    if(!titlePlain){showToast('Title required.','error');return;}
    if(!descPlain){showToast('Description required.','error');return;}
    setFSaving(true);
    const user=await UserStore.getCurrentUser();
    if(!user){showToast('Login again.','error');setFSaving(false);return;}
    const all=[...(user.epapers||[])];
    if(editItem){
      const idx=all.findIndex(e=>e.id===editItem.id);
      if(idx!==-1)all[idx]={
        ...all[idx],
        title:titleHtml,
        description:descHtml,
        images:fImages,
        updatedAt:new Date().toISOString(),
        state:selectedState,
        publishDate:fDate,
      };
    } else {
      all.push({
        id:`ep-${Date.now()}`,
        title:titleHtml,
        description:descHtml,
        images:fImages,
        mediaType: fImages.length > 0 ? 'Images' : 'None',
        status:user.role==='admin'?'approved':'pending',
        state:selectedState,
        publishDate:fDate,
        createdBy:user.email,
        createdAt:new Date().toISOString(),
        views:0,
        downloads:0,
      });
    }
    const updated=await UserStore.updateUser(user.email,{epapers:all});
    setFSaving(false);
    if(!updated){showToast('Save failed.','error');return;}
    closeForm();
    showSuccess(editItem?'E-Paper updated!':user.role==='admin'?'E-Paper added!':'Submitted! Waiting for admin approval.');
    loadData();
  };

  const handleDelete=(item)=>{Alert.alert('Delete',`"${(item.title||'').replace(/<[^>]*>/g,'')||'This item'}" delete karein?`,[{text:'Cancel',style:'cancel'},{text:'Delete',style:'destructive',onPress:async()=>{const user=await UserStore.getCurrentUser();if(!user)return;await UserStore.updateUser(user.email,{epapers:(user.epapers||[]).filter(e=>e.id!==item.id)});showSuccess('Deleted.');loadData();}}]);};
  const handleApprove=async(item)=>{const user=await UserStore.getCurrentUser();if(!user)return;await UserStore.updateUser(user.email,{epapers:(user.epapers||[]).map(e=>e.id===item.id?{...e,status:'approved'}:e)});showSuccess('Approved!');loadData();};
  const handleReject=async(item)=>{const user=await UserStore.getCurrentUser();if(!user)return;await UserStore.updateUser(user.email,{epapers:(user.epapers||[]).map(e=>e.id===item.id?{...e,status:'rejected'}:e)});showSuccess('Rejected.');loadData();};
  const handleView=async(item)=>{const result=await UserStore.updateEPaperItem(item.id,'view');if(!result?.ok){showToast(result?.message||'Error.','error');return;}setViewItem({...item,views:(item.views||0)+1});loadData();};
  const handleShare=async(item)=>{try{await Share.share({title:(item.title||'').replace(/<[^>]*>/g,''),message:(item.description||'').replace(/<[^>]*>/g,'')});showSuccess('Shared!');}catch{showToast('Share failed.','error');}};

  const FormModal = ({
    visible, editItemValue, isWeb, isAdmin,
    fTitleRef, fDescRef, fImages, fSaving,
    selectedState, statePickerVisible, setStatePickerVisible,
    setSelectedState, setFImages,
    fDate, setFDate,
    closeForm, handleSave, pickImages, removeImage,
    ws, windowWidth, htmlToPlain, plainToHtml, O,
  }) => {
    const titleEditorRef = useRef(null);
    const descEditorRef = useRef(null);
    const [ready, setReady] = useState(false);
    const [webTitleText, setWebTitleText] = useState('');
    const [webDescText, setWebDescText] = useState('');
    const [showDatePicker, setShowDatePicker] = useState(false);

    useEffect(() => {
      const t = setTimeout(() => setReady(true), 350);
      return () => clearTimeout(t);
    }, []);

    useEffect(() => {
      if (!visible || !isWeb) return;
      setWebTitleText(htmlToPlain(fTitleRef.current));
      setWebDescText(htmlToPlain(fDescRef.current));
    }, [visible, editItemValue]);

    if (isWeb) {
      return (
        <Modal visible={visible} animationType="fade" onRequestClose={closeForm}>
          <View style={ws.webModalRoot}>
            <View style={ws.webModalHeader}>
              <TouchableOpacity style={ws.webModalCloseBtn} onPress={closeForm}>
                <Feather name="x" size={18} color="#ffffff" />
              </TouchableOpacity>
              <Text style={ws.webModalHeaderTitle}>{editItemValue ? 'Edit E-Paper' : 'Add E-Paper'}</Text>
              <TouchableOpacity style={ws.webModalSaveBtn} onPress={handleSave} disabled={fSaving}>
                <Text style={ws.webModalSaveBtnText}>{fSaving ? 'Saving…' : 'Save'}</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={ws.webFormScroll} contentContainerStyle={ws.webFormContent} showsVerticalScrollIndicator={false}>
              <View style={ws.webFormInner}>

                {/* Title */}
                <Text style={ws.webFieldLabel}>Title *</Text>
                <TextInput
                  style={ws.webTextInput}
                  placeholder="Title yahan likhein..."
                  placeholderTextColor="#BBBBBB"
                  value={webTitleText}
                  onChangeText={(text) => { setWebTitleText(text); fTitleRef.current = plainToHtml(text); }}
                  multiline
                />

                {/* Description */}
                <Text style={ws.webFieldLabelSpaced}>Description *</Text>
                <Text style={ws.webFieldHint}>Article ka content yahan likhein</Text>
                <TextInput
                  style={ws.webTextInputDesc}
                  placeholder="Description yahan likhein..."
                  placeholderTextColor="#BBBBBB"
                  value={webDescText}
                  onChangeText={(text) => { setWebDescText(text); fDescRef.current = plainToHtml(text); }}
                  multiline
                />

                {/* Publish Date */}
                <Text style={ws.webFieldLabelSpaced}>Publish Date</Text>
                <Text style={ws.webFieldHint}>Article ki publish date select karein</Text>
                <View style={ws.webDateInput}>
                  <Feather name="calendar" size={16} color={O[400]} />
                  <input
                    type="date"
                    value={fDate || todayStr()}
                    onChange={(e) => setFDate(e.target.value)}
                    style={{
                      flex: 1,
                      border: 'none',
                      outline: 'none',
                      fontSize: 13,
                      fontWeight: '600',
                      color: '#111111',
                      backgroundColor: 'transparent',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                    }}
                  />
                </View>
                {/* State */}
                <Text style={ws.webFieldLabelSpaced}>State</Text>
                <Text style={ws.webFieldHint}>Is e-paper ka state choose karein</Text>
                <TouchableOpacity style={ws.webStateSelector} onPress={() => setStatePickerVisible(true)}>
                  <Feather name="map-pin" size={16} color={O[400]} />
                  <Text style={[ws.webStateSelectorText, !selectedState && ws.webStateSelectorPlaceholder]}>
                    {selectedState || 'Select a state...'}
                  </Text>
                  <Feather name="chevron-down" size={16} color="#AAAAAA" />
                </TouchableOpacity>
                {selectedState ? (
                  <View style={ws.webStateChip}>
                    <Feather name="map-pin" size={12} color={O[600]} />
                    <Text style={ws.webStateChipTxt}>{selectedState}</Text>
                  </View>
                ) : null}

                {/* Images */}
                <View style={ws.webMediaCard}>
                  <Text style={ws.webMediaEyebrow}>Creative Assets</Text>
                  <Text style={ws.webMediaTitle}>Image Gallery</Text>
                  <Text style={ws.webMediaSubtitle}>E-paper ke saath images upload karein (max 10)</Text>
                  <View style={ws.webMediaBadgeRow}>
                    <View style={ws.webMediaPill}>
                      <Feather name="layers" size={13} color={O[600]} />
                      <Text style={ws.webMediaPillTxt}>{fImages.length > 0 ? `${fImages.length} image selected` : 'Gallery ready'}</Text>
                    </View>
                  </View>
                  <View style={ws.webMediaSection}>
                    <Text style={ws.webMediaSectionCaption}>Multiple images add kar sakte hain apne e-paper ke liye.</Text>
                    <TouchableOpacity style={ws.webPickBtn} onPress={pickImages}>
                      <Feather name="image" size={16} color={O[600]} />
                      <Text style={ws.webPickBtnTxt}>{fImages.length > 0 ? 'Add More Images' : 'Pick Images (multiple)'}</Text>
                    </TouchableOpacity>
                    {fImages.length > 0 && (
                      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={EPaperStyles.thumbRow}>
                        {fImages.map((img, idx) => (
                          <View key={idx} style={EPaperStyles.imageThumbContainer}>
                            <Image source={{uri: img}} style={EPaperStyles.imageThumb} />
                            <TouchableOpacity style={EPaperStyles.imageRemoveBtn} onPress={() => removeImage(idx)}>
                              <Feather name="x" size={10} color="#fff" />
                            </TouchableOpacity>
                          </View>
                        ))}
                      </ScrollView>
                    )}
                  </View>
                </View>

                {!isAdmin && (
                  <View style={ws.webAdminNote}>
                    <Feather name="info" size={14} color="#ca8a04" />
                    <Text style={ws.webAdminNoteTxt}>Your entry will appear in the news feed after it is approved by the admin.</Text>
                  </View>
                )}
              </View>
            </ScrollView>
            <StatePickerModal visible={statePickerVisible} selected={selectedState} onSelect={setSelectedState} onClose={() => setStatePickerVisible(false)} />
          </View>
        </Modal>
      );
    }

    // ── Mobile form ──
    return (
      <Modal visible={visible} animationType="slide" onRequestClose={closeForm}>
        <SafeAreaView style={EPaperStyles.modalSafeArea}>
          <KeyboardAvoidingView style={EPaperStyles.modalKeyboardView} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
            <View style={EPaperStyles.modalHeader}>
              <TouchableOpacity onPress={closeForm} style={EPaperStyles.modalCloseBtn}><Feather name="x" size={20} color="#ffffff" /></TouchableOpacity>
              <Text style={EPaperStyles.modalHeaderTitle}>{editItemValue ? 'Edit E-Paper' : 'Add E-Paper'}</Text>
              <TouchableOpacity style={EPaperStyles.modalSaveBtn} onPress={handleSave} disabled={fSaving}><Text style={EPaperStyles.modalSaveBtnText}>{fSaving ? 'Saving…' : 'Save'}</Text></TouchableOpacity>
            </View>
            <ScrollView style={EPaperStyles.modalScrollView} contentContainerStyle={EPaperStyles.modalContent} keyboardShouldPersistTaps="handled" nestedScrollEnabled>
              {Boolean(ready) && (
                <>
                  <Text style={EPaperStyles.fieldLabel}>Title *</Text>
                  <RichToolbar editor={titleEditorRef} actions={[actions.setBold, actions.setItalic, actions.setUnderline, actions.undo, actions.redo]} style={EPaperStyles.richToolbar} iconTint="#475569" selectedIconTint="#FF2D78" />
                  <RichEditor ref={titleEditorRef} style={EPaperStyles.richEditorTitle} placeholder="Title yahan likhein…" initialContentHTML={fTitleRef.current} onChange={(html) => { fTitleRef.current = html; }} editorStyle={EPaperStyles.richEditorInner} useContainer={false} />
                  <Text style={EPaperStyles.fieldLabelSpaced}>Description *</Text>
                  <Text style={EPaperStyles.fieldHint}>Bold, italic, lists — sab supported</Text>
                  <RichToolbar editor={descEditorRef} actions={[actions.setBold, actions.setItalic, actions.setUnderline, actions.insertBulletsList, actions.insertOrderedList, actions.undo, actions.redo]} style={EPaperStyles.richToolbar} iconTint="#475569" selectedIconTint="#FF2D78" />
                  <RichEditor ref={descEditorRef} style={EPaperStyles.richEditorDesc} placeholder="Description yahan likhein…" initialContentHTML={fDescRef.current} onChange={(html) => { fDescRef.current = html; }} editorStyle={EPaperStyles.richEditorInner} useContainer={false} />
                </>
              )}

              {/* Publish Date — mobile */}
              <Text style={EPaperStyles.fieldLabelSpaced}>Publish Date</Text>
              <Text style={EPaperStyles.fieldHint}>Calendar se date choose karein</Text>
              <TouchableOpacity
                style={[EPaperStyles.stateSelector, {gap:10}]}
                onPress={() => setShowDatePicker(true)}
                activeOpacity={0.7}
              >
                <Feather name="calendar" size={16} color="#F97316" />
                <Text style={[EPaperStyles.stateSelectorText, !fDate && EPaperStyles.stateSelectorPlaceholder]}>
                  {fDate || todayStr()}
                </Text>
                <Feather name="chevron-down" size={16} color="#94a3b8" />
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={fDate ? new Date(fDate) : new Date()}
                  mode="date"
                  display="default"
                  onChange={(event, selectedDate) => {
                    setShowDatePicker(Platform.OS === 'ios');
                    if (selectedDate) {
                      setFDate(selectedDate.toISOString().slice(0, 10));
                    }
                  }}
                />
              )}

              {/* State — mobile */}
              <Text style={EPaperStyles.fieldLabelSpaced}>State</Text>
              <Text style={EPaperStyles.fieldHint}>Choose the state this e-paper belongs to.</Text>
              <TouchableOpacity style={EPaperStyles.stateSelector} onPress={() => setStatePickerVisible(true)}>
                <Feather name="map-pin" size={16} color="#F97316" />
                <Text style={[EPaperStyles.stateSelectorText, !selectedState && EPaperStyles.stateSelectorPlaceholder]}>{selectedState || 'Select a state...'}</Text>
                <Feather name="chevron-down" size={16} color="#64748b" />
              </TouchableOpacity>
              {selectedState ? (<View style={EPaperStyles.stateChip}><Feather name="map-pin" size={12} color="#FF2D78" /><Text style={EPaperStyles.stateChipText}>{selectedState}</Text></View>) : null}

              {/* Images — mobile */}
              <View style={EPaperStyles.mediaShowcaseCard}>
                <Text style={EPaperStyles.mediaShowcaseEyebrow}>Creative Assets</Text>
                <Text style={EPaperStyles.mediaShowcaseTitle}>Image Gallery</Text>
                <Text style={EPaperStyles.mediaShowcaseSubtitle}>E-paper ke saath images upload karein.</Text>
                <View style={EPaperStyles.mediaBadgeRow}>
                  <View style={EPaperStyles.mediaInfoPill}><Feather name="layers" size={13} color="#FF2D78" /><Text style={EPaperStyles.mediaInfoPillText}>{fImages.length > 0 ? `${fImages.length} image selected` : 'Gallery ready'}</Text></View>
                </View>
                <View style={EPaperStyles.mediaSection}>
                  <Text style={EPaperStyles.mediaSectionCaption}>Showcase multiple visuals for your e-paper story.</Text>
                  <Text style={EPaperStyles.mediaSectionTitle}>Images</Text>
                  <TouchableOpacity style={EPaperStyles.mediaPickBtn} onPress={pickImages}><Feather name="image" size={16} color="#FF2D78" /><Text style={EPaperStyles.mediaPickBtnText}>{fImages.length > 0 ? 'Change Images' : 'Pick Images (multiple)'}</Text></TouchableOpacity>
                  {fImages.length > 0 && (<ScrollView horizontal showsHorizontalScrollIndicator={false} style={EPaperStyles.thumbRow}>{fImages.map((img, idx) => (<View key={idx} style={EPaperStyles.imageThumbContainer}><Image source={{uri: img}} style={EPaperStyles.imageThumb} /><TouchableOpacity style={EPaperStyles.imageRemoveBtn} onPress={() => removeImage(idx)}><Feather name="x" size={10} color="#fff" /></TouchableOpacity></View>))}</ScrollView>)}
                </View>
              </View>

              {!isAdmin && (<View style={EPaperStyles.adminNoteBox}><Feather name="info" size={14} color="#ca8a04" /><Text style={EPaperStyles.adminNoteText}>Your entry will appear in the news feed after it is approved by the admin.</Text></View>)}
            </ScrollView>
            <StatePickerModal visible={statePickerVisible} selected={selectedState} onSelect={setSelectedState} onClose={() => setStatePickerVisible(false)} />
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
    );
  };

  const ViewModal=()=>{
    if(!viewItem)return null;
    const plainTitle=(viewItem.title||'').replace(/<[^>]*>/g,' ').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&nbsp;/g,' ').trim();
    const plainDescription=(viewItem.description||'').replace(/<[^>]*>/g,' ').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&nbsp;/g,' ').trim();

    if(isWeb){
      return(
        <Modal visible={!!viewItem} animationType="fade" onRequestClose={()=>setViewItem(null)}>
          <View style={ws.webModalRoot}>
            <View style={ws.webModalHeader}>
              <TouchableOpacity onPress={()=>setViewItem(null)} style={ws.webModalCloseBtn}>
                <Feather name="arrow-left" size={18} color="#ffffff"/>
              </TouchableOpacity>
              <Text style={[ws.webModalHeaderTitle,{marginHorizontal:8}]} numberOfLines={1}>View E-Paper</Text>
              <View style={{width:36}}/>
            </View>
            <ScrollView contentContainerStyle={ws.webFormContent} showsVerticalScrollIndicator={false}>
              <View style={ws.webFormInner}>
                <View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between',marginBottom:16}}>
                  <StatusBadge status={viewItem.status} web/>
                  <Text style={{fontSize:12,color:'#AAAAAA',fontWeight:'500'}}>{viewItem.publishDate||viewItem.createdAt?.slice(0,10)||''}</Text>
                </View>
                {viewItem.state?(
                  <View style={{alignSelf:'flex-start',flexDirection:'row',alignItems:'center',gap:6,backgroundColor:O[50],borderWidth:1,borderColor:O[200],borderRadius:999,paddingHorizontal:12,paddingVertical:5,marginBottom:16}}>
                    <Feather name="map-pin" size={12} color={O[600]}/>
                    <Text style={{fontSize:11,fontWeight:'800',color:O[800]}}>{viewItem.state}</Text>
                  </View>
                ):null}
                <View style={{backgroundColor:'#ffffff',borderWidth:1.5,borderColor:'#E5DDD5',borderRadius:16,padding:windowWidth<=640?16:24,marginBottom:20}}>
                  <Text style={{fontSize:windowWidth<=640?19:22,fontWeight:'800',color:'#111111',lineHeight:windowWidth<=640?27:30,marginBottom:12}}>{plainTitle||'Untitled E-Paper'}</Text>
                  <View style={{height:1,backgroundColor:'#F0EBE4',marginBottom:14}}/>
                  <Text style={{fontSize:14,color:'#555555',lineHeight:24}}>{plainDescription||'No description available.'}</Text>
                </View>
                {viewItem.images?.length>0&&(
                  <View style={{backgroundColor:'#ffffff',borderWidth:1.5,borderColor:'#E5DDD5',borderRadius:16,padding:windowWidth<=640?14:20,marginBottom:20}}>
                    <View style={{flexDirection:'row',alignItems:'center',gap:8,marginBottom:14}}>
                      <Feather name="image" size={15} color={O[600]}/>
                      <Text style={{fontSize:13,fontWeight:'800',color:'#111111'}}>Images ({viewItem.images.length})</Text>
                    </View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      {viewItem.images.map((img,idx)=>(
                        <Image key={idx} source={{uri:img}} style={{width:200,height:140,borderRadius:12,marginRight:12,borderWidth:1,borderColor:'#E5DDD5'}}/>
                      ))}
                    </ScrollView>
                  </View>
                )}
                <View style={{flexDirection:'row',flexWrap:'wrap',gap:windowWidth<=640?12:20,backgroundColor:'#ffffff',borderWidth:1.5,borderColor:'#E5DDD5',borderRadius:14,padding:16}}>
                  <View style={{flexDirection:'row',alignItems:'center',gap:6}}>
                    <Feather name="eye" size={14} color={O[400]}/>
                    <Text style={{fontSize:13,fontWeight:'700',color:'#555555'}}>{viewItem.views??0} Views</Text>
                  </View>
                  <View style={{flexDirection:'row',alignItems:'center',gap:6}}>
                    <Feather name="user" size={14} color={O[400]}/>
                    <Text style={{fontSize:13,fontWeight:'700',color:'#555555'}}>{viewItem.createdBy?.split('@')[0]||'user'}</Text>
                  </View>
                  <View style={{flexDirection:'row',alignItems:'center',gap:6}}>
                    <Feather name="calendar" size={14} color={O[400]}/>
                    <Text style={{fontSize:13,fontWeight:'700',color:'#555555'}}>{viewItem.publishDate||viewItem.createdAt?.slice(0,10)||''}</Text>
                  </View>
                </View>
              </View>
            </ScrollView>
          </View>
        </Modal>
      );
    }

    return(
      <Modal visible={!!viewItem} animationType="slide" onRequestClose={()=>setViewItem(null)}>
        <SafeAreaView style={EPaperStyles.viewModalSafeArea}>
          <View style={EPaperStyles.modalHeader}>
            <TouchableOpacity onPress={()=>setViewItem(null)} style={EPaperStyles.modalCloseBtn}><Feather name="arrow-left" size={20} color="#ffffff"/></TouchableOpacity>
            <Text style={EPaperStyles.modalHeaderTitle} numberOfLines={1}>View E-Paper</Text>
            <View style={EPaperStyles.modalHeaderRight}/>
          </View>
          <ScrollView contentContainerStyle={EPaperStyles.viewModalContent} nestedScrollEnabled>
            <StatusBadge status={viewItem.status}/>
            <View style={EPaperStyles.viewTextCard}><Text style={EPaperStyles.viewTitleText}>{plainTitle||'Untitled E-Paper'}</Text><Text style={EPaperStyles.viewDescriptionText}>{plainDescription||'No description available.'}</Text></View>
            {viewItem.state?(<View style={EPaperStyles.stateChip}><Feather name="map-pin" size={12} color="#FF2D78"/><Text style={EPaperStyles.stateChipText}>{viewItem.state}</Text></View>):null}
            {viewItem.images?.length>0&&(<View style={EPaperStyles.viewImagesSection}><Text style={EPaperStyles.fieldLabel}>Images</Text><ScrollView horizontal showsHorizontalScrollIndicator={false} style={EPaperStyles.thumbRow}>{viewItem.images.map((img,idx)=>(<Image key={idx} source={{uri:img}} style={EPaperStyles.viewImage}/>))}</ScrollView></View>)}
            <View style={EPaperStyles.statsRow}>
              <View style={EPaperStyles.statItem}><Feather name="eye" size={12} color="#64748b"/><Text style={EPaperStyles.statText}>{viewItem.views??0} Views</Text></View>
              <View style={EPaperStyles.statItem}><Feather name="calendar" size={12} color="#64748b"/><Text style={EPaperStyles.statText}>{viewItem.publishDate||viewItem.createdAt?.slice(0,10)||''}</Text></View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    );
  };

  // ══════════════════════════════════════════════════════════════════════════
  // WEB LAYOUT
  // ══════════════════════════════════════════════════════════════════════════
  if(isWeb){
    const grouped_manage = manageDateKey ? items.filter(i=>{
  const dateMatch=(i.publishDate||i.createdAt?.slice(0,10)||'Unknown')===manageDateKey;
  if(!dateMatch)return false;
  if(manageDateFilter==='published')return i.status==='approved';
  if(manageDateFilter==='unpublished')return i.status!=='approved';
  return true;
}) : [];
    const stripeStyle=(status)=>{
      const base=ws.articleStripe;
      if(status==='approved')return[base,ws.articleStripeApproved];
      if(status==='rejected')return[base,ws.articleStripeRejected];
      return[base,ws.articleStripePending];
    };
    return(
      <View style={ws.root}>
        <View style={ws.topBar}>
          <View style={ws.topLeft}>
            <Feather name="home" size={14} color="#888888"/>
            <Text style={ws.bcSep}>›</Text><Text style={ws.bcStep}>Dashboard</Text>
            <Text style={ws.bcSep}>›</Text><Text style={ws.bcCur}>E-Paper</Text>
          </View>
          <TouchableOpacity style={ws.backBtn} onPress={()=>navigation.navigate('QuickMenu')} activeOpacity={0.8}>
            <Feather name="arrow-left" size={13} color={O[800]}/><Text style={ws.backBtnText}>Back to menu</Text>
          </TouchableOpacity>
        </View>

        {successMsg?(<View style={ws.successOverlay}><View style={ws.successBox}><Feather name="check-circle" size={16} color="#16A34A"/><Text style={ws.successTxt}>{successMsg}</Text></View></View>):null}

        <ScrollView style={ws.scroll} contentContainerStyle={ws.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={ws.innerWrap}>
            <View style={ws.pageHeadRow}>
              <View>
                <Text style={ws.pageTitle}>E-Paper</Text>
                <Text style={ws.pageSub}>Digital newspaper — rich-text articles with images.</Text>
              </View>
              <TouchableOpacity style={ws.addBtn} onPress={openAddForm} activeOpacity={0.85}>
                <Feather name="plus" size={15} color="#ffffff"/><Text style={ws.addBtnText}>Add E-Paper</Text>
              </TouchableOpacity>
            </View>

            <View style={ws.metricsRow}>
              <View style={ws.mc}>
                <View style={[ws.mcBar,ws.mcBarArticles]}/>
                <View style={ws.mcTop}><View style={ws.mcIcon}><Feather name="file-text" size={16} color={O[600]}/></View><Text style={ws.mcBadge}>Total</Text></View>
                <Text style={ws.mcVal}>{items.length}</Text><Text style={ws.mcLbl}>Articles</Text>
              </View>
              <View style={ws.mc}>
                <View style={[ws.mcBar,ws.mcBarViews]}/>
                <View style={ws.mcTop}><View style={[ws.mcIcon,ws.mcIconBlue]}><Feather name="eye" size={16} color="#3B82F6"/></View><Text style={[ws.mcBadge,ws.mcBadgeBlue]}>All time</Text></View>
                <Text style={ws.mcVal}>{totalViews}</Text><Text style={ws.mcLbl}>Total views</Text>
              </View>
              <View style={ws.mc}>
                <View style={[ws.mcBar,ws.mcBarPending]}/>
                <View style={ws.mcTop}><View style={[ws.mcIcon,ws.mcIconYellow]}><Feather name="clock" size={16} color="#F59E0B"/></View><Text style={[ws.mcBadge,ws.mcBadgeYellow]}>Review</Text></View>
                <Text style={ws.mcVal}>{items.filter(i=>i.status==='pending').length}</Text><Text style={ws.mcLbl}>Pending</Text>
              </View>
            </View>

            <View style={ws.sectionHead}>
              <View><Text style={ws.sectionTitle}>E-Paper Articles</Text><Text style={ws.sectionSub}>All published and pending articles</Text></View>
              <View style={ws.pill}><Feather name="layers" size={12} color={O[600]}/><Text style={ws.pillTxt}>{items.length} article{items.length!==1?'s':''}</Text></View>
            </View>

            {loading?(<Text style={ws.loadingTxt}>Loading articles…</Text>
            ):items.length===0?(
              <View style={ws.emptyWrap}>
                <View style={ws.emptyIcon}><Feather name="file-text" size={24} color={O[400]}/></View>
                <Text style={ws.emptyTxt}>No articles yet</Text>
                <Text style={ws.emptySub}>Click "Add E-Paper" to create your first article.</Text>
              </View>
           ):(()=>{
              // Date ke hisaab se group karo
              const grouped = {};
              items.forEach(item=>{
                const dateKey = item.publishDate||item.createdAt?.slice(0,10)||'Unknown';
                if(!grouped[dateKey]) grouped[dateKey]=[];
                grouped[dateKey].push(item);
              });
              const sortedDates = Object.keys(grouped).sort((a,b)=>b.localeCompare(a));

              return(
                <View style={{width:'100%'}}>
                  {sortedDates.map(dateKey=>(
                    <View key={dateKey} style={{backgroundColor:'#ffffff',borderWidth:1,borderColor:'#EDE8E1',borderRadius:14,marginBottom:12,overflow:'hidden'}}>

                      {/* Date header */}
                      <View style={{flexDirection:'row',alignItems:'center',gap:8,paddingHorizontal:windowWidth<=640?14:18,paddingVertical:12,backgroundColor:O[50],borderBottomWidth:1,borderBottomColor:O[100]}}>
                        <Feather name="calendar" size={13} color={O[600]}/>
                        <Text style={{fontSize:13,fontWeight:'800',color:O[800]}}>{dateKey}</Text>
                       <View style={{marginLeft:'auto',flexDirection:'row',alignItems:'center',gap:6}}>
  <TouchableOpacity
    onPress={()=>{setManageDateFilter('published');setManageDateKey(dateKey);}}
    style={{flexDirection:'row',alignItems:'center',gap:4,backgroundColor:'#F0FDF4',borderWidth:1,borderColor:'#BBF7D0',borderRadius:999,paddingHorizontal:10,paddingVertical:3}}
  >
    <View style={{width:6,height:6,borderRadius:3,backgroundColor:'#22C55E'}}/>
    <Text style={{fontSize:11,fontWeight:'700',color:'#16A34A'}}>
      {grouped[dateKey].filter(i=>i.status==='approved').length} Published
    </Text>
  </TouchableOpacity>
  <TouchableOpacity
    onPress={()=>{setManageDateFilter('unpublished');setManageDateKey(dateKey);}}
    style={{flexDirection:'row',alignItems:'center',gap:4,backgroundColor:'#FFF7ED',borderWidth:1,borderColor:O[200],borderRadius:999,paddingHorizontal:10,paddingVertical:3}}
  >
    <View style={{width:6,height:6,borderRadius:3,backgroundColor:O[400]}}/>
    <Text style={{fontSize:11,fontWeight:'700',color:O[800]}}>
      {grouped[dateKey].filter(i=>i.status!=='approved').length} Unpublished
    </Text>
  </TouchableOpacity>
</View>
                      </View>

                      {/* Articles titles only — card mein, no action buttons */}
                      {grouped[dateKey].map((item, idx)=>{
                        const plainTitle=(item.title||'').replace(/<[^>]*>/g,'').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&nbsp;/g,' ').trim();
                        const isLast = idx===grouped[dateKey].length-1;
                        return(
                          <View key={item.id} style={{paddingHorizontal:windowWidth<=640?14:18,paddingVertical:10,borderBottomWidth:isLast?0:1,borderBottomColor:'#F5F2EE',flexDirection:'row',alignItems:'center',gap:8}}>
                            <Feather name="file-text" size={13} color={O[400]}/>
                            <Text style={{flex:1,fontSize:windowWidth<=640?13:14,fontWeight:'600',color:'#333333',lineHeight:20}} numberOfLines={1}>{plainTitle||'Untitled'}</Text>
                          </View>
                        );
                      })}
                      {/* Card ke neeche ek "Manage" button */}
                      <View style={{paddingHorizontal:windowWidth<=640?14:18,paddingVertical:12,borderTopWidth:1,borderTopColor:'#F5F2EE',flexDirection:'row',gap:8}}>
  <TouchableOpacity
    style={{flexDirection:'row',alignItems:'center',gap:5,paddingVertical:7,paddingHorizontal:14,borderRadius:8,backgroundColor:O[50],borderWidth:1,borderColor:O[200]}}
    onPress={()=>setManageDateKey(dateKey)}
  >
    <Feather name="settings" size={13} color={O[600]}/>
    <Text style={{fontSize:12,fontWeight:'700',color:O[800]}}>Manage Articles</Text>
  </TouchableOpacity>

  {/* ── NEW BUTTON ── */}
  <TouchableOpacity
    style={{flexDirection:'row',alignItems:'center',gap:5,paddingVertical:7,paddingHorizontal:14,borderRadius:8,backgroundColor:'#F0FDF4',borderWidth:1,borderColor:'#BBF7D0'}}
    onPress={()=>navigation.navigate('NewspaperPage',{
      dateKey,
      articles: grouped[dateKey]
    })}
  >
    <Feather name="file-text" size={13} color="#16A34A"/>
    <Text style={{fontSize:12,fontWeight:'700',color:'#16A34A'}}>View Newspaper</Text>
  </TouchableOpacity>
</View>
                    </View>
                  ))}
                </View>
              );
            })()}
          </View>
        </ScrollView>

        <FormModal
          visible={formVisible}
          editItemValue={editItem}
          isWeb={isWeb}
          isAdmin={isAdmin}
          fTitleRef={fTitleRef}
          fDescRef={fDescRef}
          fImages={fImages}
          fSaving={fSaving}
          selectedState={selectedState}
          statePickerVisible={statePickerVisible}
          setStatePickerVisible={setStatePickerVisible}
          setSelectedState={setSelectedState}
          setFImages={setFImages}
          fDate={fDate}
          setFDate={setFDate}
          closeForm={closeForm}
          handleSave={handleSave}
          pickImages={pickImages}
          removeImage={removeImage}
          ws={ws}
          windowWidth={windowWidth}
          htmlToPlain={htmlToPlain}
          plainToHtml={plainToHtml}
          O={O}
        />
        <ViewModal/>

        {/* Manage Articles Modal */}
        {manageDateKey&&(
          <Modal visible={!!manageDateKey} animationType="slide" onRequestClose={()=>setManageDateKey(null)}>
            <View style={{flex:1,backgroundColor:'#F7F4F0'}}>
              {/* Header */}
              <View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between',paddingHorizontal:20,paddingVertical:14,backgroundColor:O[400],borderBottomWidth:2,borderBottomColor:O[600]}}>
                <TouchableOpacity onPress={()=>{setManageDateKey(null);setManageDateFilter('all');}} style={{width:36,height:36,borderRadius:8,backgroundColor:'rgba(255,255,255,0.2)',alignItems:'center',justifyContent:'center'}}>
                  <Feather name="x" size={18} color="#ffffff"/>
                </TouchableOpacity>
                <View style={{flex:1,alignItems:'center'}}>
                  <Text style={{fontSize:16,fontWeight:'800',color:'#ffffff'}}>Manage Articles</Text>
                  <Text style={{fontSize:11,color:'rgba(255,255,255,0.8)',marginTop:1}}>{manageDateKey}</Text>
                </View>
                <View style={{width:36}}/>
              </View>             

              {/* Articles list with actions */}
              <ScrollView contentContainerStyle={{padding:16}} showsVerticalScrollIndicator={false}>
                {(grouped_manage||[]).map((item,idx)=>{
                  const plainTitle=(item.title||'').replace(/<[^>]*>/g,'').replace(/&amp;/g,'&').replace(/&#39;/g,"'").replace(/&nbsp;/g,' ').trim();
                  const plainDesc=(item.description||'').replace(/<[^>]*>/g,'').replace(/&amp;/g,'&').replace(/&#39;/g,"'").replace(/&nbsp;/g,' ').trim();
                  return(
                    <View key={item.id} style={{backgroundColor:'#ffffff',borderRadius:12,padding:16,marginBottom:10,borderWidth:1,borderColor:'#EDE8E1'}}>
                      {/* Title only */}
                      <Text style={{fontSize:15,fontWeight:'800',color:'#111111',lineHeight:21,marginBottom:6}}>{plainTitle||'Untitled'}</Text>
                      {!!plainDesc&&<Text style={{fontSize:13,color:'#666666',lineHeight:19,marginBottom:8}} numberOfLines={2}>{plainDesc}</Text>}
                      {item.state&&(
                        <View style={{flexDirection:'row',alignItems:'center',gap:5,alignSelf:'flex-start',backgroundColor:O[50],borderWidth:1,borderColor:O[200],borderRadius:999,paddingHorizontal:10,paddingVertical:3,marginBottom:8}}>
                          <Feather name="map-pin" size={11} color={O[600]}/>
                          <Text style={{fontSize:11,fontWeight:'700',color:O[800]}}>{item.state}</Text>
                        </View>
                      )}
                      {/* Actions */}
                      <View style={{flexDirection:'row',gap:7,flexWrap:'wrap',marginTop:4}}>
                        <TouchableOpacity style={ws.actionBtn} onPress={()=>{setManageDateKey(null);handleView(item);}}><Feather name="eye" size={13} color={O[600]}/><Text style={ws.actionBtnTxt}>View</Text></TouchableOpacity>
                        {(isAdmin||item.createdBy===currentUser?.email)&&(<TouchableOpacity style={ws.actionBtn} onPress={()=>{setManageDateKey(null);openEditForm(item);}}><Feather name="edit-2" size={13} color={O[600]}/><Text style={ws.actionBtnTxt}>Edit</Text></TouchableOpacity>)}
                        {(isAdmin||item.createdBy===currentUser?.email)&&(<TouchableOpacity style={ws.actionBtnDanger} onPress={()=>{setManageDateKey(null);handleDelete(item);}}><Feather name="trash-2" size={13} color="#DC2626"/><Text style={ws.actionBtnDangerTxt}>Delete</Text></TouchableOpacity>)}
                      </View>
                    </View>
                  );
                })}
              </ScrollView>
            </View>
          </Modal>
        )}
      </View>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // MOBILE LAYOUT
  // ══════════════════════════════════════════════════════════════════════════
  return(
    <SafeAreaView style={EPaperStyles.safeArea}>
      <View style={EPaperStyles.root}>
        {Platform.OS==='web'&&<View style={EPaperStyles.statusBarSpacer}/>}
        <TouchableOpacity style={EPaperStyles.backRow} onPress={()=>navigation.navigate('QuickMenu')}>
          <Feather name="arrow-left" size={20} color="#FF2D78"/><Text style={EPaperStyles.backText}>Back</Text>
        </TouchableOpacity>
        {successMsg?(<View style={EPaperStyles.successOverlay}><View style={EPaperStyles.successBox}><Feather name="check-circle" size={18} color="#16a34a"/><Text style={EPaperStyles.successBoxText}>{successMsg}</Text></View></View>):null}
        <ScrollView style={EPaperStyles.scrollView} contentContainerStyle={EPaperStyles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={EPaperStyles.heroCard}>
            <Text style={EPaperStyles.heroEyebrow}>Digital Newspaper</Text>
            <Text style={EPaperStyles.heroTitle}>E-Paper</Text>
            <Text style={EPaperStyles.heroSubtitle}>Rich-text articles with images.</Text>
          </View>
          <View style={EPaperStyles.metricsRow}>
            <View style={[EPaperStyles.metricCard,EPaperStyles.metricPrimary]}><Text style={EPaperStyles.metricValue}>{items.length}</Text><Text style={EPaperStyles.metricLabel}>Articles</Text></View>
            <View style={[EPaperStyles.metricCard,EPaperStyles.metricSecondary]}><Text style={EPaperStyles.metricValue}>{totalViews}</Text><Text style={EPaperStyles.metricLabel}>Views</Text></View>
            <View style={[EPaperStyles.metricCard,EPaperStyles.metricAccent]}><Text style={EPaperStyles.metricValue}>{items.filter(i=>i.status==='pending').length}</Text><Text style={EPaperStyles.metricLabel}>Pending</Text></View>
          </View>
          <TouchableOpacity style={EPaperStyles.addBtn} onPress={openAddForm}><Feather name="plus" size={16} color="#fff"/><Text style={EPaperStyles.addBtnText}>Add E-Paper</Text></TouchableOpacity>
          <View style={EPaperStyles.card}>
            <Text style={EPaperStyles.sectionTitle}>E-Paper Articles</Text>
            {loading?(<Text style={EPaperStyles.loadingText}>Loading…</Text>):items.length===0?(<Text style={EPaperStyles.emptyText}>No e-paper records found.</Text>):(
              items.map(item=>(
                <View key={item.id} style={EPaperStyles.paperCard}>
                  <View style={EPaperStyles.paperTopRow}>
                    <StatusBadge status={item.status}/>
                    <Text style={EPaperStyles.publishDate}>{item.publishDate||item.createdAt?.slice(0,10)||''}</Text>
                  </View>
                  {item.state?(<View style={EPaperStyles.stateChip}><Feather name="map-pin" size={12} color="#FF2D78"/><Text style={EPaperStyles.stateChipText}>{item.state}</Text></View>):null}
                  <Text style={EPaperStyles.paperTitle} numberOfLines={2}>{(item.title||'').replace(/<[^>]*>/g,'').replace(/&amp;/g,'&').replace(/&#39;/g,"'").replace(/&nbsp;/g,' ')}</Text>
                  <Text style={EPaperStyles.paperDesc} numberOfLines={2}>{(item.description||'').replace(/<[^>]*>/g,'').replace(/&amp;/g,'&').replace(/&#39;/g,"'").replace(/&nbsp;/g,' ')}</Text>
                  {false&&item.images?.length>0&&(<View style={EPaperStyles.mediaBadge}><Feather name="image" size={11} color="#FF2D78"/><Text style={EPaperStyles.mediaBadgeText}>{item.images.length} Image(s)</Text></View>)}
                  <View style={EPaperStyles.statsRow}><View style={EPaperStyles.statItem}><Feather name="eye" size={12} color="#64748b"/><Text style={EPaperStyles.statText}>{item.views??0} Views</Text></View><View style={EPaperStyles.statItem}><Feather name="user" size={12} color="#64748b"/><Text style={EPaperStyles.statText}>{item.createdBy?.split('@')[0]||'user'}</Text></View></View>
                  <View style={EPaperStyles.actionRow}>
                    <TouchableOpacity style={EPaperStyles.actionBtn} onPress={()=>handleView(item)}><Feather name="eye" size={13} color="#FF2D78"/><Text style={EPaperStyles.actionBtnText}>View</Text></TouchableOpacity>
                    {(isAdmin||item.createdBy===currentUser?.email)&&(<TouchableOpacity style={EPaperStyles.actionBtn} onPress={()=>openEditForm(item)}><Feather name="edit-2" size={13} color="#FF2D78"/><Text style={EPaperStyles.actionBtnText}>Edit</Text></TouchableOpacity>)}
                    {(isAdmin||item.createdBy===currentUser?.email)&&(<TouchableOpacity style={EPaperStyles.actionBtnDanger} onPress={()=>handleDelete(item)}><Feather name="trash-2" size={13} color="#dc2626"/><Text style={EPaperStyles.actionBtnDangerText}>Delete</Text></TouchableOpacity>)}
                    <TouchableOpacity style={EPaperStyles.actionBtn} onPress={()=>handleShare(item)}><Feather name="share-2" size={13} color="#FF2D78"/><Text style={EPaperStyles.actionBtnText}>Share</Text></TouchableOpacity>
                  </View>
                  {isAdmin&&item.status==='pending'&&(<View style={EPaperStyles.adminActionRow}><TouchableOpacity style={EPaperStyles.approveBtn} onPress={()=>handleApprove(item)}><Feather name="check" size={13} color="#16a34a"/><Text style={EPaperStyles.approveBtnText}>Approve</Text></TouchableOpacity><TouchableOpacity style={EPaperStyles.rejectBtn} onPress={()=>handleReject(item)}><Feather name="x" size={13} color="#dc2626"/><Text style={EPaperStyles.rejectBtnText}>Reject</Text></TouchableOpacity></View>)}
                </View>
              ))
            )}
          </View>
        </ScrollView>
        <FormModal
          visible={formVisible}
          editItemValue={editItem}
          isWeb={isWeb}
          isAdmin={isAdmin}
          fTitleRef={fTitleRef}
          fDescRef={fDescRef}
          fImages={fImages}
          fSaving={fSaving}
          selectedState={selectedState}
          statePickerVisible={statePickerVisible}
          setStatePickerVisible={setStatePickerVisible}
          setSelectedState={setSelectedState}
          setFImages={setFImages}
          fDate={fDate}
          setFDate={setFDate}
          closeForm={closeForm}
          handleSave={handleSave}
          pickImages={pickImages}
          removeImage={removeImage}
          ws={ws}
          windowWidth={windowWidth}
          htmlToPlain={htmlToPlain}
          plainToHtml={plainToHtml}
          O={O}
        />
        <ViewModal/>
      </View>
    </SafeAreaView>
  );
}