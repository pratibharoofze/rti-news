import { UserStore } from '../store/UserStore';
import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, Platform, Alert, ActivityIndicator,
  KeyboardAvoidingView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';

import { useTemplateStore, useEditorStore, usePdfStore } from '../store/newspaperStore';
import LayoutOne from '../components/newspaper/LayoutOne';
import LayoutTwo from '../components/newspaper/LayoutTwo';
import TemplateSelector from '../components/newspaper/TemplateSelector';
import ImageBlock from '../components/newspaper/ImageBlock';
import RichField from '../components/newspaper/RichField';
import { exportToPdf, printDirectly } from '../components/newspaper/PDFExporter';

// ─── Section definitions ───────────────────────────────────────────────────────
const T1_SECTIONS = [
  { id: 'header',        label: 'Header',               type: 'header' },
  { id: 'headline',      label: 'Main Headline',         type: 'headline', hidden: true },
  { id: 'left_big',      label: 'Left Story (25%)',       type: 'article' },
  { id: 'left_small',    label: 'Left Story (25%)',       type: 'article' },
  { id: 'center_top',    label: 'Center Story (50%)',     type: 'article', isMain: true },
  { id: 'center_mid',    label: 'Center Mid',             type: 'article' },
  { id: 'center_bottom', label: 'Center Bottom',          type: 'article' },
  { id: 'right',         label: 'Right Story (25%)',      type: 'article' },
  { id: 'footer',        label: 'Footer',               type: 'footer' },
];

const T2_SECTIONS = [
  { id: 'masthead',  label: 'Masthead Strip',         type: 'masthead' },
  { id: 'top_left',  label: 'Top Left Article',       type: 'article', isMain: true },
  { id: 'top_right', label: 'Top Right Article',      type: 'article', isMain: true },
  { id: 'mid_left',  label: 'Middle Left Article',    type: 'article' },
  { id: 'mid_right', label: 'Middle Right Article',   type: 'article' },
  { id: 'bot_main',  label: 'Bottom Main Article',    type: 'article', isMain: true },
  { id: 'bot_side',  label: 'Bottom Side Article',    type: 'article' },
  { id: 'footer',    label: 'Footer',                 type: 'footer' },
  { id: 'slogan',    label: 'Slogan Bar',             type: 'slogan' },
];

// ─── EditPanel ─────────────────────────────────────────────────────────────────
function EditPanel({ sectionId, sectionDef }) {
  const { sections, updateSection } = useEditorStore();
  const data = sections[sectionId] || {};
  const update = (key, val) => updateSection(sectionId, key, val);
  const headlineData = sections['headline'] || {};
  const updateHeadline = (key, val) => updateSection('headline', key, val);

  const Field = ({ label, fieldKey, multiline = false }) => (
    <View style={ep.fieldGroup}>
      <Text style={ep.label}>{label}</Text>
      <TextInput
        style={[ep.input, multiline && ep.textarea]}
        value={String(data[fieldKey] || '')}
        onChangeText={(v) => update(fieldKey, v)}
        multiline={multiline}
        numberOfLines={multiline ? 4 : 1}
        placeholderTextColor="#666"
      />
    </View>
  );

  if (!sectionDef) {
    return (
      <View style={ep.empty}>
        <Text style={ep.emptyText}>No section selected</Text>
      </View>
    );
  }

  const isHeader = sectionDef.type === 'header';
  return (
    <View style={{flex:1}}>
      {isHeader && (
        <View style={{backgroundColor:'#1a1a1a'}}>
          {/* Banner Color */}
          <View style={{padding:14, borderBottomWidth:1, borderBottomColor:'#333'}}>
            <Text style={[ep.label, {color:'#ffd700', fontSize:11, marginBottom:8}]}>🎨 Banner Colors</Text>
            <View style={{flexDirection:'row', gap:16, flexWrap:'wrap'}}>
              <View>
                <Text style={ep.label}>Header BG</Text>
                {Platform.OS === 'web' ? (
                  <input type="color" defaultValue={data.bannerBgColor || '#111111'} onInput={e => update('bannerBgColor', e.target.value)} onChange={e => update('bannerBgColor', e.target.value)} style={{width:44, height:32, border:'none', borderRadius:4, cursor:'pointer'}} />
                ) : (
                  <TextInput style={[ep.input,{width:80}]} value={data.bannerBgColor || '#111111'} onChangeText={v => update('bannerBgColor', v)} placeholderTextColor="#666" />
                )}
              </View>
              <View>
                <Text style={ep.label}>Header Text</Text>
                {Platform.OS === 'web' ? (
                  <input type="color" defaultValue={data.bannerTextColor || '#ffffff'} onInput={e => update('bannerTextColor', e.target.value)} onChange={e => update('bannerTextColor', e.target.value)} style={{width:44, height:32, border:'none', borderRadius:4, cursor:'pointer'}} />
                ) : (
                  <TextInput style={[ep.input,{width:80}]} value={data.bannerTextColor || '#ffffff'} onChangeText={v => update('bannerTextColor', v)} placeholderTextColor="#666" />
                )}
              </View>
              <View>
                <Text style={ep.label}>Headline BG</Text>
                {Platform.OS === 'web' ? (
                  <input type="color" defaultValue={(sections['headline'] || {}).headlineBgColor || '#111111'} onInput={e => updateHeadline('headlineBgColor', e.target.value)} onChange={e => updateHeadline('headlineBgColor', e.target.value)} style={{width:44, height:32, border:'none', borderRadius:4, cursor:'pointer'}} />
                ) : (
                  <TextInput style={[ep.input,{width:80}]} value={(sections['headline'] || {}).headlineBgColor || '#111111'} onChangeText={v => updateHeadline('headlineBgColor', v)} placeholderTextColor="#666" />
                )}
              </View>
              <View>
                <Text style={ep.label}>Date Strip BG</Text>
                {Platform.OS === 'web' ? (
                  <input type="color" defaultValue={data.dateBgColor || '#111111'} onInput={e => update('dateBgColor', e.target.value)} onChange={e => update('dateBgColor', e.target.value)} style={{width:44, height:32, border:'none', borderRadius:4, cursor:'pointer'}} />
                ) : (
                  <TextInput style={[ep.input,{width:80}]} value={data.dateBgColor || '#111111'} onChangeText={v => update('dateBgColor', v)} placeholderTextColor="#666" />
                )}
              </View>
              <View>
                <Text style={ep.label}>Date Text</Text>
                {Platform.OS === 'web' ? (
                  <input type="color" defaultValue={data.dateTextColor || '#ffffff'} onInput={e => update('dateTextColor', e.target.value)} onChange={e => update('dateTextColor', e.target.value)} style={{width:44, height:32, border:'none', borderRadius:4, cursor:'pointer'}} />
                ) : (
                  <TextInput style={[ep.input,{width:80}]} value={data.dateTextColor || '#ffffff'} onChangeText={v => update('dateTextColor', v)} placeholderTextColor="#666" />
                )}
              </View>
            </View>
            
          </View>
          {/* Headline fields */}
          <View style={{padding:14, borderBottomWidth:1, borderBottomColor:'#333'}}>
            <Text style={[ep.label, {color:'#ffd700', fontSize:11, marginBottom:8}]}>✏️ Main Headline</Text>
            <RichField
              label="Title"
              value={headlineData.title || ''}
              onChange={(html) => updateHeadline('title', html)}
            />
            <View style={ep.fieldGroup}>
              <Text style={ep.label}>Subtitle</Text>
              <TextInput style={ep.input} value={String(headlineData.sub || '')} onChangeText={(v) => updateHeadline('sub', v)} placeholderTextColor="#666" />
            </View>
            <View style={ep.fieldGroup}>
              <Text style={ep.label}>Sub Subtitle</Text>
              <TextInput style={ep.input} value={String(headlineData.subsub || '')} onChangeText={(v) => updateHeadline('subsub', v)} placeholderTextColor="#666" />
            </View>
          </View>
        </View>
      )}
    <ScrollView
      style={ep.scroll}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <Text style={ep.panelTitle}>{sectionDef.label}</Text>

      {sectionDef.type === 'header' && (
        <>
          <Field label="Newspaper Name"      fieldKey="newspaperName" />
          <Field label="Tagline"            fieldKey="tagline" multiline />
          <Field label="Date / Subscription"    fieldKey="date" multiline />
          <Field label="Contact 1"           fieldKey="contact1" />
          <Field label="Contact 2"           fieldKey="contact2" />
          <Field label="Website"            fieldKey="website" />
          <Field label="Email"              fieldKey="extra" />
          <Field label="Reg Number"           fieldKey="regNo" />
          <Field label="Government Info 1"   fieldKey="govtText1" />
          <Field label="Government Info 2"   fieldKey="govtText2" />
          <Field label="RTI - All / India"   fieldKey="rtiAll" />
          <Field label="RTI - INDIA"         fieldKey="rtiIndia" />
          <Field label="RTI - RTi"           fieldKey="rtiRti" />
          <Field label="RTI - NEWS NETWORK"  fieldKey="rtiNetwork" />
          <Field label="Editor Name"         fieldKey="editorName" />
          <Field label="Editor Title"          fieldKey="editorTitle" />
          <Field label="Office Info"           fieldKey="officeInfo" />
          <View style={ep.fieldGroup}>
            <Text style={ep.label}>Logo</Text>
            <ImageBlock
              uri={data.logoUri || ''}
              onPick={(uri) => update('logoUri', uri)}
              onRemove={() => update('logoUri', '')}
            />
          </View>
        </>
      )}
      {sectionDef.type === 'footer' && (
        <>
          <View style={[ep.fieldGroup, {flexDirection:'row', alignItems:'center', gap:12, flexWrap:'wrap'}]}>
            <View>
              <Text style={ep.label}>Footer BG Color</Text>
              {Platform.OS === 'web' ? (
                <input type="color"
                  defaultValue={data.bgColor || '#111111'}
                  onInput={e => update('bgColor', e.target.value)}
                  onChange={e => update('bgColor', e.target.value)}
                  style={{width:44, height:32, border:'none', borderRadius:4, cursor:'pointer'}}
                />
              ) : (
                <TextInput style={[ep.input,{width:80}]} value={data.bgColor || '#111111'} onChangeText={v => update('bgColor', v)} placeholderTextColor="#666"/>
              )}
            </View>
            <View>
              <Text style={ep.label}>Footer Text Color</Text>
              {Platform.OS === 'web' ? (
                <input type="color"
                  defaultValue={data.textColor || '#ffffff'}
                  onInput={e => update('textColor', e.target.value)}
                  onChange={e => update('textColor', e.target.value)}
                  style={{width:44, height:32, border:'none', borderRadius:4, cursor:'pointer'}}
                />
              ) : (
                <TextInput style={[ep.input,{width:80}]} value={data.textColor || '#ffffff'} onChangeText={v => update('textColor', v)} placeholderTextColor="#666"/>
              )}
            </View>
          </View>
          <RichField
            label="Footer Content"
            value={data.content || ''}
            onChange={(html) => update('content', html)}
          />
        </>
      )}
      {sectionDef.type === 'lawyer' && (
        <Field label="Legal Notice" fieldKey="text" multiline />
      )}

      {sectionDef.type === 'masthead' && (
        <>
          <Field label="Date"  fieldKey="date" />
          <Field label="Title"  fieldKey="title" />
          <Field label="Website" fieldKey="website" />
        </>
      )}

      {sectionDef.type === 'slogan' && (
        <Field label="Slogan" fieldKey="text" multiline />
      )}
      {sectionDef.type === 'article' && (
        <>
          <Field label="Title"   fieldKey="title" />
          <Field label="Subtitle" fieldKey="sub" />
          <RichField
            label="Article Content"
            value={data.body || ''}
            onChange={(html) => update('body', html)}
          />
          <Field label="Reporter" fieldKey="reporter" />
          <Field label="Location"    fieldKey="location" />
          <Field label="Date"   fieldKey="date" />
          <View style={ep.fieldGroup}>
            <Text style={ep.label}>Image</Text>
            <ImageBlock
              uri={data.image || ''}
              onPick={(uri) => update('image', uri)}
              onRemove={() => update('image', '')}
            />
          </View>
        </>
      )}
    </ScrollView>
    </View>
  );
}

const ep = StyleSheet.create({
  scroll:         { flex: 1, padding: 14 },
  empty:          { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  emptyText:      { color: '#666', fontSize: 12, textAlign: 'center', lineHeight: 20 },
  panelTitle:     { color: '#ffd700', fontSize: 13, fontWeight: '700', marginBottom: 14, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#333' },
  fieldGroup:     { marginBottom: 14 },
  label:          { color: '#888', fontSize: 11, fontWeight: '600', marginBottom: 5, letterSpacing: 0.5 },
  input:          { backgroundColor: '#2a2a2a', borderWidth: 1, borderColor: '#444', borderRadius: 6, color: '#fff', padding: 9, fontSize: 12 },
  textarea:       { minHeight: 88, textAlignVertical: 'top' },
});

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function NewspaperPage({ route, navigation }) {
  const { reporterName, reporterLocation, publishDate } = route?.params || {};
  const { templateId } = useTemplateStore();
  const { sections, activeSection, setActiveSection: _setActiveSection, resetAll, updateSection } = useEditorStore();
  const [isSaving, setIsSaving] = useState(false);

  // Reporter params auto-fill
  React.useEffect(() => {
    if (reporterName || reporterLocation || publishDate) {
      const sectionList = templateId === 'layout1' ? T1_SECTIONS : T2_SECTIONS;
      sectionList.filter(s => s.type === 'article').forEach(sec => {
        if (reporterName)    updateSection(sec.id, 'reporter', reporterName);
        if (reporterLocation) updateSection(sec.id, 'location', reporterLocation);
        if (publishDate)     updateSection(sec.id, 'date',     publishDate);
      });
      if (publishDate) updateSection('header', 'date', publishDate);
    }
  }, [reporterName, reporterLocation, publishDate, templateId]);
  
  const setActiveSection = (id) => _setActiveSection(id === 'headline' ? 'header' : id);
  const { generating } = usePdfStore();
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);

  const IS_WEB = Platform.OS === 'web';
  const sectionList = templateId === 'layout1' ? T1_SECTIONS : T2_SECTIONS;
  const activeDef   = sectionList.find((s) => s.id === activeSection) || null;
  const Layout      = templateId === 'layout1' ? LayoutOne : LayoutTwo;

  const handleExport = async () => {
    try {
      if (IS_WEB) {
        window.print();
      } else {
        await exportToPdf(sections, templateId);
      }
    } catch (e) {
      Alert.alert('Error', 'Export failed: ' + e.message);
    }
  };

  const handleSavePublish = async () => {
    if (isSaving) {
      console.log('Already saving, please wait...');
      return;
    }
    
    setIsSaving(true);
    console.log('Save button clicked - starting save process');
    
    try {
      if (!UserStore) {
        console.error('UserStore is not available');
        Alert.alert('Error', 'UserStore not available. Please restart the app.');
        setIsSaving(false);
        return;
      }

      const user = await UserStore.getCurrentUser();
      console.log('Current user:', user?.email);
      
      if (!user) {
        Alert.alert('Error', 'Please login again to save articles.');
        setIsSaving(false);
        return;
      }

      const sectionList = templateId === 'layout1' ? T1_SECTIONS : T2_SECTIONS;
      const articleSections = sectionList.filter(s => s.type === 'article');

      const today = new Date().toISOString().slice(0, 10);
      const newItems = [];
      
      for (const sec of articleSections) {
        const data = sections[sec.id] || {};
        const title = String(data.title || '').replace(/<[^>]*>/g, '').trim();
        const body = String(data.body || '').replace(/<[^>]*>/g, '').trim();
        
        if (!title) {
          console.log(`Skipping ${sec.id} - no title`);
          continue;
        }
        
        if (!body || body.length < 10) {
          console.log(`Skipping ${sec.id} - body too short (${body?.length || 0} chars)`);
          continue;
        }
        
        const newItem = {
          id: `epaper-${Date.now()}-${Math.random().toString(36).slice(2, 6)}-${sec.id}`,
          title: title,
          description: String(data.body || data.sub || '').replace(/<[^>]*>/g, '').trim(),
          status: 'pending',
          state: String(data.location || '').trim(),
          publishDate: String(data.date || today),
          createdAt: new Date().toISOString(),
          createdBy: user.email,
          images: data.image ? [data.image] : [],
          views: 0,
          downloads: 0,
          reporter: String(data.reporter || '').trim(),
        };
        
        newItems.push(newItem);
        console.log(`Added article from ${sec.id}: ${title.substring(0, 30)}`);
      }

      if (newItems.length === 0) {
        Alert.alert('Error', 'No articles found. Please fill in article title and body first.');
        setIsSaving(false);
        return;
      }

      const existing = Array.isArray(user.epapers) ? user.epapers : [];
      const publishDay = newItems[0]?.publishDate || today;
      
      const filtered = existing.filter(e => 
        !(e.publishDate === publishDay && e.createdBy === user.email)
      );
      
      const updatedEpapers = [...newItems, ...filtered];
      console.log(`Saving ${newItems.length} articles, total epapers: ${updatedEpapers.length}`);

      const updatedUser = await UserStore.updateUser(user.email, {
        epapers: updatedEpapers,
      });
      
      if (!updatedUser) {
        throw new Error('Failed to update user - updateUser returned null');
      }
      
      console.log('Save successful!');
      
      Alert.alert(
        'Success', 
        `${newItems.length} article(s) saved successfully! They will appear in the EPaper screen.`,
        [
          { 
            text: 'OK', 
            onPress: () => {
              setIsSaving(false);
              navigation.goBack();
            } 
          }
        ]
      );
      
    } catch (e) {
      console.error('Save error details:', e);
      Alert.alert('Error', 'Save failed: ' + (e.message || 'Unknown error'));
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    Alert.alert('Reset', 'All data will be reset. Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reset', style: 'destructive', onPress: resetAll },
    ]);
  };

  // ── WEB layout ──────────────────────────────────────────────────────────────
  if (IS_WEB) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#111' }}>

        <style>{`
          @media print {
            .no-print { display:none !important; }
            * { -webkit-print-color-adjust:exact !important; print-color-adjust:exact !important; }
            body { margin:0 !important; padding:0 !important; }
            .newspaper-preview-wrap { box-shadow:none !important; }
            @page { size:A4 landscape; margin:5mm; }
          }
        `}</style>

        {/* Top bar */}
        <div className="no-print" style={{
          background: '#111', borderBottom: '2px solid #ea580c',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '10px 16px', flexWrap: 'wrap', gap: 8,
        }}>
          <span style={{ color: '#ffd700', fontSize: 16, fontWeight: 900, letterSpacing: 1 }}>
            📰 Newspaper Designer
          </span>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button onClick={() => navigation.goBack()} style={webBtn('#444','#ccc')}>← Back</button>
            <button 
              onClick={handleSavePublish} 
              style={webBtn('#ea580c','#fff')}
              disabled={isSaving}
            >
              {isSaving ? '⏳ Saving...' : '💾 Save & Publish'}
            </button>
            <button onClick={() => setShowTemplateSelector(v => !v)} style={webBtn('#444','#ffd700')}>Add Pages</button>
            <button onClick={() => navigation.navigate('NewspaperPreview')} style={webBtn('#444','#ccc')}>👁 Preview</button>
            <button onClick={handleExport} style={webBtn('#16a34a','#fff')}>🖨️ Print</button>
            <button onClick={handleReset} style={webBtn('#444','#f87171')}>Reset</button>
          </div>
        </div>

        {/* Template selector */}
        {showTemplateSelector && <TemplateSelector onSelect={() => setShowTemplateSelector(false)} />}

        {/* 3-col body */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

          {/* Sidebar */}
          <div className="no-print" style={{ width: 150, background: '#1a1a1a', borderRight: '1px solid #333', overflowY: 'auto', padding: '10px 0' }}>
            <div style={{ color: '#555', fontSize: 9, fontWeight: 700, letterSpacing: 1, padding: '0 12px 8px', textTransform: 'uppercase' }}>Sections</div>
            {sectionList.filter(sec => !sec.hidden).map(sec => (
              <div
                key={sec.id}
                onClick={() => setActiveSection(sec.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '9px 12px', cursor: 'pointer',
                  borderLeft: `3px solid ${activeSection === sec.id ? '#ffd700' : 'transparent'}`,
                  background: activeSection === sec.id ? '#1c1000' : 'transparent',
                  color: activeSection === sec.id ? '#ffd700' : '#888',
                  fontSize: 11,
                }}
              >
                <div style={{ width: 7, height: 7, borderRadius: 4, background: activeSection === sec.id ? '#ffd700' : '#444', flexShrink: 0 }} />
                {sec.label}
              </div>
            ))}
          </div>

          {/* Preview */}
          <div style={{ flex: 1, background: '#e8e4df', overflowY: 'auto', padding: 20 }}>
            <div className="newspaper-preview-wrap" style={{ maxWidth: 1050, margin: '0 auto', boxShadow: '0 8px 40px rgba(0,0,0,0.3)' }}>
              <Layout
                sections={sections}
                activeSection={activeSection}
                onSelectSection={setActiveSection}
                onSectionChange={(key, val) => useEditorStore.getState().updateSection(key, val)}
              />
            </div>
          </div>

          {/* Edit panel */}
          <div className="no-print" style={{ width: 280, background: '#1a1a1a', borderLeft: '1px solid #333', display:'flex', flexDirection:'column', overflow:'hidden' }}>
            <div style={{ flex:1, overflowY:'auto' }}>
              <EditPanel sectionId={activeSection} sectionDef={activeDef} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── MOBILE layout ────────────────────────────────────────────────────────────
  return (
    <KeyboardAvoidingView style={styles.root} behavior="padding">

      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={14} color="#7a420a" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>📰 Newspaper</Text>
        <View style={styles.topActions}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => setShowTemplateSelector(v => !v)}>
            <Feather name="layout" size={16} color="#ffd700" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('NewspaperPreview')}>
            <Feather name="eye" size={16} color="#ccc" />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.iconBtn, { backgroundColor: '#16a34a', borderColor: '#16a34a' }]} onPress={handleExport} disabled={generating}>
            {generating
              ? <ActivityIndicator size="small" color="#fff" />
              : <Feather name="file-text" size={16} color="#fff" />
            }
          </TouchableOpacity>
          <TouchableOpacity 
            style={[
              styles.iconBtn, 
              { backgroundColor: '#ea580c', borderColor: '#ea580c' },
              isSaving && { opacity: 0.5 }
            ]} 
            onPress={handleSavePublish}
            disabled={isSaving}
            activeOpacity={0.7}
          >
            {isSaving 
              ? <ActivityIndicator size="small" color="#fff" />
              : <Feather name="save" size={16} color="#fff" />
            }
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} onPress={handleReset}>
            <Feather name="refresh-cw" size={14} color="#f87171" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Template selector */}
      {showTemplateSelector && (
        <TemplateSelector onSelect={() => setShowTemplateSelector(false)} />
      )}

      {/* Body: sidebar + preview (horizontal scroll for preview) */}
      <View style={styles.body}>

        {/* Left sidebar — section list */}
        <View style={styles.sidebar}>
          {sectionList.filter(sec => !sec.hidden).map((sec) => (
            <TouchableOpacity
              key={sec.id}
              style={[styles.sideItem, activeSection === sec.id && styles.sideItemActive]}
              onPress={() => setActiveSection(sec.id)}
            >
              <View style={[styles.dot, activeSection === sec.id && styles.dotActive]} />
              <Text style={[styles.sideLabel, activeSection === sec.id && styles.sideLabelActive]} numberOfLines={2}>
                {sec.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Right: preview + edit panel stacked vertically */}
        <View style={styles.rightCol}>

          {/* Newspaper preview */}
          <ScrollView
            style={styles.previewScroll}
            contentContainerStyle={styles.previewContent}
            showsVerticalScrollIndicator={false}
            horizontal={false}
          >
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={{ minWidth: 600 }}>
                <Layout
                  sections={sections}
                  activeSection={activeSection}
                  onSelectSection={setActiveSection}
                />
              </View>
            </ScrollView>
          </ScrollView>

          {/* Edit panel (bottom half) */}
          {activeSection && (
            <View style={styles.editPanel}>
              <EditPanel sectionId={activeSection} sectionDef={activeDef} />
            </View>
          )}

        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

function webBtn(bg, color) {
  return {
    background: bg, color, border: '1.5px solid ' + bg,
    padding: '6px 14px', borderRadius: 6,
    fontSize: 11, fontWeight: 700, cursor: 'pointer',
  };
}

const styles = StyleSheet.create({
  root:    { flex: 1, backgroundColor: '#111' },

  // Top bar
  topBar: {
    backgroundColor: '#111',
    borderBottomWidth: 2,
    borderBottomColor: '#ea580c',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  backBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, paddingVertical: 6,
    borderRadius: 7, backgroundColor: '#fef6ec',
    borderWidth: 1, borderColor: '#fbcfa0',
  },
  backText:     { fontSize: 11, fontWeight: '700', color: '#7a420a' },
  topBarTitle:  { color: '#ffd700', fontSize: 14, fontWeight: '900', letterSpacing: 0.5 },
  topActions:   { flexDirection: 'row', gap: 6 },
  iconBtn: {
    width: 34, height: 34, borderRadius: 7,
    borderWidth: 1.5, borderColor: '#444',
    alignItems: 'center', justifyContent: 'center',
  },

  // Body
  body: { flex: 1, flexDirection: 'row' },

  // Sidebar
  sidebar: {
    width: 90,
    backgroundColor: '#1a1a1a',
    borderRightWidth: 1,
    borderRightColor: '#333',
    paddingTop: 8,
  },
  sideItem: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 6,
    paddingHorizontal: 8, paddingVertical: 8,
    borderLeftWidth: 3, borderLeftColor: 'transparent',
  },
  sideItemActive: { backgroundColor: '#1c1000', borderLeftColor: '#ffd700' },
  dot:            { width: 6, height: 6, borderRadius: 3, backgroundColor: '#444', marginTop: 3, flexShrink: 0 },
  dotActive:      { backgroundColor: '#ffd700' },
  sideLabel:      { fontSize: 9, color: '#777', flex: 1, lineHeight: 13 },
  sideLabelActive:{ color: '#ffd700', fontWeight: '700' },

  // Right column
  rightCol:      { flex: 1, flexDirection: 'column' },
  previewScroll: { flex: 1, backgroundColor: '#e8e4df' },
  previewContent:{ padding: 10, paddingBottom: 20 },

  // Edit panel
  editPanel: {
    height: 280,
    backgroundColor: '#1a1a1a',
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
});