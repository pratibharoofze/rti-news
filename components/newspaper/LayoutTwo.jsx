import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import HeaderBlock from './HeaderBlock';
import HeadlineBlock from './HeadlineBlock';
import ArticleBlock from './ArticleBlock';
import FooterBlock from './FooterBlock';

export default function LayoutTwo({ sections = {}, activeSection, onSelectSection }) {
  const sel = (id) => activeSection === id;
  const press = (id) => () => onSelectSection && onSelectSection(id);
  const lw = sections.lawyer || {};

  return (
    <View style={styles.page}>
      {/* Header */}
      <TouchableOpacity activeOpacity={0.85} onPress={press('header')}>
        <HeaderBlock data={sections.header} isEditing={sel('header')} />
      </TouchableOpacity>

      {/* Main Headline */}
      <TouchableOpacity activeOpacity={0.85} onPress={press('headline')}>
        <HeadlineBlock data={sections.headline} isEditing={sel('headline')} />
      </TouchableOpacity>

      {/* Row: Left 35% | Center 40% | Right 25% */}
      <View style={styles.row}>
        {/* Left 35% — flex 7 in 20-unit */}
        <TouchableOpacity style={[styles.col35, styles.borderRight]} activeOpacity={0.85} onPress={press('left')}>
          <ArticleBlock data={sections.left} isEditing={sel('left')} />
        </TouchableOpacity>
        {/* Center 40% — flex 8 in 20-unit */}
        <TouchableOpacity style={[styles.col40, styles.borderRight]} activeOpacity={0.85} onPress={press('center')}>
          <ArticleBlock data={sections.center} isMain isEditing={sel('center')} />
        </TouchableOpacity>
        {/* Right 25% — flex 5 in 20-unit */}
        <TouchableOpacity style={styles.col25} activeOpacity={0.85} onPress={press('right')}>
          <ArticleBlock data={sections.right} isEditing={sel('right')} />
        </TouchableOpacity>
      </View>

      {/* Lawyer Strip */}
      <TouchableOpacity
        style={[styles.lawyerStrip, sel('lawyer') && styles.lawyerEditing]}
        activeOpacity={0.85}
        onPress={press('lawyer')}
      >
        <Text style={styles.lawyerText}>{lw.text || 'विधिक नोटिस...'}</Text>
      </TouchableOpacity>

      {/* Bottom: 33% | 33% | 34% */}
      <View style={[styles.row, styles.borderTop]}>
        <TouchableOpacity style={[styles.col33, styles.borderRight]} activeOpacity={0.85} onPress={press('bot_l')}>
          <ArticleBlock data={sections.bot_l} isEditing={sel('bot_l')} />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.col33, styles.borderRight]} activeOpacity={0.85} onPress={press('bot_c')}>
          <ArticleBlock data={sections.bot_c} isEditing={sel('bot_c')} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.col34} activeOpacity={0.85} onPress={press('bot_r')}>
          <ArticleBlock data={sections.bot_r} isEditing={sel('bot_r')} />
        </TouchableOpacity>
      </View>

      {/* Footer */}
      <TouchableOpacity activeOpacity={0.85} onPress={press('footer')}>
        <FooterBlock data={sections.footer} isEditing={sel('footer')} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#888',
    width: 794,   // A3 width at 96dpi approx
    minHeight: 1123,
  },
  row: { flexDirection: 'row' },
  borderTop: { borderTopWidth: 1, borderTopColor: '#ccc' },
  borderRight: { borderRightWidth: 1, borderRightColor: '#ccc' },
  // 35 | 40 | 25  →  flex 7 | 8 | 5  (sum 20)
  col35: { flex: 7 },
  col40: { flex: 8 },
  col25: { flex: 5 },
  // 33 | 33 | 34  →  flex 1 | 1 | 1  (roughly equal)
  col33: { flex: 1 },
  col34: { flex: 1 },
  lawyerStrip: {
    borderTopWidth: 2,
    borderBottomWidth: 2,
    borderColor: '#111',
    backgroundColor: '#f5f0e8',
    paddingHorizontal: 14,
    paddingVertical: 7,
    alignItems: 'center',
  },
  lawyerEditing: {
    borderColor: '#ea580c',
    borderWidth: 2,
  },
  lawyerText: {
    fontSize: 10,
    color: '#333',
    textAlign: 'center',
  },
});
