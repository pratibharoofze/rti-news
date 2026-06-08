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
import { exportToPdf, printDirectly } from '../components/newspaper/PDFExporter';

// ─── Section definitions ───────────────────────────────────────────────────────
const T1_SECTIONS = [
  { id: 'header',   label: 'Header',                type: 'header' },
  { id: 'headline', label: 'Main Headline',          type: 'headline' },
  { id: 'left',     label: 'Left Story (25%)',        type: 'article' },
  { id: 'center',   label: 'Center Story (50%)',      type: 'article', isMain: true },
  { id: 'right',    label: 'Right Story (25%)',       type: 'article' },
  { id: 'bottom_l', label: 'Bottom Left (50%)',       type: 'article' },
  { id: 'bottom_r', label: 'Bottom Right + Img (50%)', type: 'article' },
  { id: 'footer',   label: 'Footer',                type: 'footer' },
];

const T2_SECTIONS = [
  { id: 'header',   label: 'Header',                type: 'header' },
  { id: 'headline', label: 'Main Headline',          type: 'headline' },
  { id: 'left',     label: 'Left Article (35%)',      type: 'article' },
  { id: 'center',   label: 'Center Article (40%)',    type: 'article', isMain: true },
  { id: 'right',    label: 'Right Sidebar (25%)',     type: 'article' },
  { id: 'lawyer',   label: 'Lawyer Section',          type: 'lawyer' },
  { id: 'bot_l',    label: 'Bottom Left (33%)',       type: 'article' },
  { id: 'bot_c',    label: 'Bottom Center (33%)',     type: 'article' },
  { id: 'bot_r',    label: 'Bottom Right (34%)',      type: 'article' },
  { id: 'footer',   label: 'Footer',                type: 'footer' },
];

// ─── EditPanel ─────────────────────────────────────────────────────────────────
function EditPanel({ sectionId, sectionDef }) {
  const { sections, updateSection } = useEditorStore();
  const data = sections[sectionId] || {};
  const update = (key, val) => updateSection(sectionId, key, val);

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
        <Text style={ep.emptyText}>Koi section{'\n'}select karein</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={ep.scroll}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <Text style={ep.panelTitle}>{sectionDef.label}</Text>

      {sectionDef.type === 'header' && (
        <>
          <Field label="अखबार का नाम"      fieldKey="newspaperName" />
          <Field label="टैगलाइन"            fieldKey="tagline" />
          <Field label="दिनांक"             fieldKey="date" />
          <Field label="संपर्क"             fieldKey="contact" />
          <Field label="अतिरिक्त जानकारी"  fieldKey="extra" />
        </>
      )}

      {sectionDef.type === 'headline' && (
        <>
          <Field label="मुख्य शीर्षक" fieldKey="title" multiline />
          <Field label="उप शीर्षक"    fieldKey="sub" />
        </>
      )}

      {sectionDef.type === 'footer' && (
        <>
          <Field label="बायाँ पाद" fieldKey="left" />
          <Field label="दायाँ पाद" fieldKey="right" />
        </>
      )}

      {sectionDef.type === 'lawyer' && (
        <Field label="विधिक नोटिस" fieldKey="text" multiline />
      )}

      {sectionDef.type === 'article' && (
        <>
          <Field label="शीर्षक"   fieldKey="title" />
          <Field label="उप शीर्षक" fieldKey="sub" />
          <Field label="लेख"       fieldKey="body" multiline />
          <Field label="रिपोर्टर" fieldKey="reporter" />
          <Field label="स्थान"    fieldKey="location" />
          <Field label="दिनांक"   fieldKey="date" />
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
  const { templateId } = useTemplateStore();
  const { sections, activeSection, setActiveSection, resetAll } = useEditorStore();
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

  const handleReset = () => {
    Alert.alert('Reset', 'Sab data reset ho jaayega. Sure hain?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reset', style: 'destructive', onPress: resetAll },
    ]);
  };

  // ── WEB layout ──────────────────────────────────────────────────────────────
  if (IS_WEB) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#111' }}>

        {/* Top bar */}
        <div style={{
          background: '#111', borderBottom: '2px solid #ea580c',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '10px 16px', flexWrap: 'wrap', gap: 8,
        }}>
          <span style={{ color: '#ffd700', fontSize: 16, fontWeight: 900, letterSpacing: 1 }}>
            📰 समाचारपत्र डिज़ाइनर
          </span>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button onClick={() => navigation.goBack()} style={webBtn('#444','#ccc')}>← Back</button>
            <button onClick={() => setShowTemplateSelector(v => !v)} style={webBtn('#444','#ffd700')}>Template</button>
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
          <div style={{ width: 150, background: '#1a1a1a', borderRight: '1px solid #333', overflowY: 'auto', padding: '10px 0' }}>
            <div style={{ color: '#555', fontSize: 9, fontWeight: 700, letterSpacing: 1, padding: '0 12px 8px', textTransform: 'uppercase' }}>Sections</div>
            {sectionList.map(sec => (
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
            <div style={{ maxWidth: 1050, margin: '0 auto', boxShadow: '0 8px 40px rgba(0,0,0,0.3)' }}>
              <Layout
  sections={sections}
  activeSection={activeSection}
  onSelectSection={setActiveSection}
  onSectionChange={(key, val) => useEditorStore.getState().updateSection(key, val)}
/>
            </div>
          </div>

          {/* Edit panel */}
          <div style={{ width: 240, background: '#1a1a1a', borderLeft: '1px solid #333', overflowY: 'auto' }}>
            <EditPanel sectionId={activeSection} sectionDef={activeDef} />
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
        <Text style={styles.topBarTitle}>📰 समाचारपत्र</Text>
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
          {sectionList.map((sec) => (
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