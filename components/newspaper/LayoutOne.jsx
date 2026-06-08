import React from 'react';
import { View, TouchableOpacity, StyleSheet, Dimensions, ScrollView } from 'react-native';
import HeaderBlock from './HeaderBlock';
import HeadlineBlock from './HeadlineBlock';
import ArticleBlock from './ArticleBlock';
import FooterBlock from './FooterBlock';

// Get screen dimensions for responsive scaling
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Real newspaper dimensions (Broadsheet size)
// Standard broadsheet newspaper size: 11" x 22" (279mm x 559mm)
// Converting to pixels at 96 DPI: 1056px x 2112px
const NEWSPAPER_WIDTH = 1056;
const NEWSPAPER_HEIGHT = 2112;

// Calculate scale factor for different screen sizes
const scaleFactor = Math.min(screenWidth / NEWSPAPER_WIDTH, 1);

export default function LayoutOne({ sections = {}, activeSection, onSelectSection, onSectionChange }) {
  const sel = (id) => activeSection === id;
  const press = (id) => () => onSelectSection && onSelectSection(id);

  return (
    <View style={styles.pageWrapper}>
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={true}
        horizontal={false}
      >
        <View style={styles.page}>

          {/* Header */}
          <TouchableOpacity activeOpacity={0.85} onPress={press('header')}>
            <HeaderBlock
              data={sections.header}
              isEditing={sel('header')}
              onDataChange={(updated) => onSectionChange && onSectionChange('header', updated)}
            />
          </TouchableOpacity>

          {/* Main Headline */}
          <TouchableOpacity activeOpacity={0.85} onPress={press('headline')}>
            <HeadlineBlock 
              data={sections.headline} 
              isEditing={sel('headline')}
              onDataChange={(updated) => onSectionChange && onSectionChange('headline', updated)}
            />
          </TouchableOpacity>

          {/* Row: Left 25% | Center 50% | Right 25% */}
          <View style={styles.row}>
            <TouchableOpacity style={[styles.col25, styles.borderRight]} activeOpacity={0.85} onPress={press('left')}>
              <ArticleBlock 
                data={sections.left} 
                isEditing={sel('left')}
                onDataChange={(updated) => onSectionChange && onSectionChange('left', updated)}
              />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.col50, styles.borderRight]} activeOpacity={0.85} onPress={press('center')}>
              <ArticleBlock 
                data={sections.center} 
                isMain 
                isEditing={sel('center')}
                onDataChange={(updated) => onSectionChange && onSectionChange('center', updated)}
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.col25} activeOpacity={0.85} onPress={press('right')}>
              <ArticleBlock 
                data={sections.right} 
                isEditing={sel('right')}
                onDataChange={(updated) => onSectionChange && onSectionChange('right', updated)}
              />
            </TouchableOpacity>
          </View>

          {/* Bottom: Left 50% | Right 50% */}
          <View style={[styles.row, styles.borderTop]}>
            <TouchableOpacity style={[styles.col50, styles.borderRight]} activeOpacity={0.85} onPress={press('bottom_l')}>
              <ArticleBlock 
                data={sections.bottom_l} 
                isEditing={sel('bottom_l')}
                onDataChange={(updated) => onSectionChange && onSectionChange('bottom_l', updated)}
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.col50} activeOpacity={0.85} onPress={press('bottom_r')}>
              <ArticleBlock 
                data={sections.bottom_r} 
                isEditing={sel('bottom_r')}
                onDataChange={(updated) => onSectionChange && onSectionChange('bottom_r', updated)}
              />
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <TouchableOpacity activeOpacity={0.85} onPress={press('footer')}>
            <FooterBlock 
              data={sections.footer} 
              isEditing={sel('footer')}
              onDataChange={(updated) => onSectionChange && onSectionChange('footer', updated)}
            />
          </TouchableOpacity>

        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  // Outer wrapper — left & right margin + background
  pageWrapper: {
    flex: 1,
    backgroundColor: '#e8e4df',
    paddingVertical: 20,
  },
  scrollContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  page: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#888',
    width: NEWSPAPER_WIDTH,
    minHeight: NEWSPAPER_HEIGHT,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  row: { 
    flexDirection: 'row',
    flex: 1,
  },
  borderTop: { 
    borderTopWidth: 2, 
    borderTopColor: '#333',
    marginTop: 2,
  },
  borderRight: { 
    borderRightWidth: 1, 
    borderRightColor: '#ccc',
  },
  col25: { 
    flex: 1,
    padding: 12,
  },
  col50: { 
    flex: 2,
    padding: 12,
  },
});