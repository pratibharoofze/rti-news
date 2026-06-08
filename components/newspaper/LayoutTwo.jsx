import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, ScrollView } from 'react-native';
import HeaderBlock from './HeaderBlock';
import HeadlineBlock from './HeadlineBlock';
import ArticleBlock from './ArticleBlock';
import FooterBlock from './FooterBlock';

// Get screen dimensions
const { width: screenWidth } = Dimensions.get('window');

// Responsive newspaper width
const NEWSPAPER_WIDTH = Math.min(1200, screenWidth - 40);
const NEWSPAPER_HEIGHT = NEWSPAPER_WIDTH * 1.6;

export default function LayoutTwo({ sections = {}, activeSection, onSelectSection, onSectionChange }) {
  const sel = (id) => activeSection === id;
  const press = (id) => () => onSelectSection && onSelectSection(id);
  const lw = sections.lawyer || {};

  return (
    <View style={styles.pageWrapper}>
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={true}
        showsHorizontalScrollIndicator={false}
        horizontal={false}
        style={{ flex: 1 }}
      >
        <View style={[styles.page, { width: NEWSPAPER_WIDTH, minHeight: NEWSPAPER_HEIGHT }]}>

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

          {/* Row: Left 35% | Center 40% | Right 25% */}
          <View style={styles.row}>
            <TouchableOpacity style={[styles.col35, styles.borderRight]} activeOpacity={0.85} onPress={press('left')}>
              <ArticleBlock 
                data={sections.left} 
                isEditing={sel('left')}
                onDataChange={(updated) => onSectionChange && onSectionChange('left', updated)}
              />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.col40, styles.borderRight]} activeOpacity={0.85} onPress={press('center')}>
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
              <ArticleBlock 
                data={sections.bot_l} 
                isEditing={sel('bot_l')}
                onDataChange={(updated) => onSectionChange && onSectionChange('bot_l', updated)}
              />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.col33, styles.borderRight]} activeOpacity={0.85} onPress={press('bot_c')}>
              <ArticleBlock 
                data={sections.bot_c} 
                isEditing={sel('bot_c')}
                onDataChange={(updated) => onSectionChange && onSectionChange('bot_c', updated)}
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.col34} activeOpacity={0.85} onPress={press('bot_r')}>
              <ArticleBlock 
                data={sections.bot_r} 
                isEditing={sel('bot_r')}
                onDataChange={(updated) => onSectionChange && onSectionChange('bot_r', updated)}
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
  pageWrapper: {
    flex: 1,
    backgroundColor: '#e8e4df',
    paddingVertical: 20,
  },
  scrollContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  page: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#888',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    overflow: 'hidden',
  },
  row: { 
    flexDirection: 'row',
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
  col35: { 
    flex: 7,
    padding: 12,
  },
  col40: { 
    flex: 8,
    padding: 12,
  },
  col25: { 
    flex: 5,
    padding: 12,
  },
  col33: { 
    flex: 1,
    padding: 12,
  },
  col34: { 
    flex: 1,
    padding: 12,
  },
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
    fontSize: 11,
    color: '#333',
    textAlign: 'center',
    fontWeight: '500',
  },
});