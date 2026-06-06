import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import HeaderBlock from './HeaderBlock';
import HeadlineBlock from './HeadlineBlock';
import ArticleBlock from './ArticleBlock';
import FooterBlock from './FooterBlock';

export default function LayoutOne({ sections = {}, activeSection, onSelectSection }) {
  const sel = (id) => activeSection === id;
  const press = (id) => () => onSelectSection && onSelectSection(id);

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

      {/* Row: Left 25% | Center 50% | Right 25% */}
      <View style={styles.row}>
        <TouchableOpacity style={[styles.col25, styles.borderRight]} activeOpacity={0.85} onPress={press('left')}>
          <ArticleBlock data={sections.left} isEditing={sel('left')} />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.col50, styles.borderRight]} activeOpacity={0.85} onPress={press('center')}>
          <ArticleBlock data={sections.center} isMain isEditing={sel('center')} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.col25} activeOpacity={0.85} onPress={press('right')}>
          <ArticleBlock data={sections.right} isEditing={sel('right')} />
        </TouchableOpacity>
      </View>

      {/* Bottom: Left 50% | Right 50% with image */}
      <View style={[styles.row, styles.borderTop]}>
        <TouchableOpacity style={[styles.col50, styles.borderRight]} activeOpacity={0.85} onPress={press('bottom_l')}>
          <ArticleBlock data={sections.bottom_l} isEditing={sel('bottom_l')} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.col50} activeOpacity={0.85} onPress={press('bottom_r')}>
          <ArticleBlock data={sections.bottom_r} isEditing={sel('bottom_r')} />
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
  row: {
    flexDirection: 'row',
  },
  borderTop: {
    borderTopWidth: 1,
    borderTopColor: '#ccc',
  },
  borderRight: {
    borderRightWidth: 1,
    borderRightColor: '#ccc',
  },
  col25: { flex: 1 },   // 25% — flex 1 in a 4-unit row
  col50: { flex: 2 },   // 50% — flex 2 in a 4-unit row
});
