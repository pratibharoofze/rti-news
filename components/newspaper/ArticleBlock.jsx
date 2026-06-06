import React from 'react';
import { View, Text, Image, StyleSheet, Platform } from 'react-native';

export default function ArticleBlock({ data = {}, isMain = false, isEditing = false }) {
  const {
    title = '',
    sub = '',
    body = '',
    reporter = '',
    location = '',
    date = '',
    image = '',
  } = data;

  return (
    <View style={[styles.article, isMain && styles.articleMain, isEditing && styles.editing]}>

      {/* Article title */}
      {!!title && (
        <Text style={[styles.title, isMain && styles.titleMain]}>
          {title}
        </Text>
      )}

      {/* Sub headline */}
      {!!sub && (
        <Text style={styles.sub}>{sub}</Text>
      )}

      {/* Thick divider under title */}
      <View style={styles.titleDivider} />

      {/* Image */}
      {!!image && (
        <View style={styles.imageWrap}>
          <Image
            source={{ uri: image }}
            style={styles.image}
            resizeMode="cover"
          />
        </View>
      )}

      {/* Body text */}
      {!!body && (
        <Text style={[styles.body, isMain && styles.bodyMain]}>
          {body}
        </Text>
      )}

      {/* Byline */}
      {(!!reporter || !!location || !!date) && (
        <View style={styles.byline}>
          {!!reporter && (
            <Text style={styles.bylineText}>✍ {reporter}</Text>
          )}
          {!!location && (
            <Text style={styles.bylineText}>● {location}</Text>
          )}
        </View>
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  article: {
    padding: 8,
    backgroundColor: '#fff',
    minHeight: 80,
  },
  articleMain: {
    backgroundColor: '#fffdf8',
    padding: 10,
  },
  editing: {
    borderWidth: 2,
    borderColor: '#ea580c',
  },

  // Title
  title: {
    fontSize: Platform.OS === 'web' ? 14 : 13,
    fontWeight: '900',
    color: '#111',
    lineHeight: Platform.OS === 'web' ? 20 : 18,
    marginBottom: 3,
  },
  titleMain: {
    fontSize: Platform.OS === 'web' ? 17 : 15,
    lineHeight: Platform.OS === 'web' ? 24 : 21,
    textAlign: 'center',
  },

  // Sub
  sub: {
    fontSize: 9,
    color: '#555',
    marginBottom: 4,
    fontStyle: 'italic',
  },

  // Divider
  titleDivider: {
    height: 1.5,
    backgroundColor: '#111',
    marginBottom: 6,
  },

  // Image
  imageWrap: {
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#999',
  },
  image: {
    width: '100%',
    height: Platform.OS === 'web' ? 140 : 100,
  },

  // Body
  body: {
    fontSize: Platform.OS === 'web' ? 11 : 10,
    lineHeight: Platform.OS === 'web' ? 19 : 17,
    color: '#222',
    textAlign: 'justify',
  },
  bodyMain: {
    fontSize: Platform.OS === 'web' ? 12 : 11,
    lineHeight: Platform.OS === 'web' ? 21 : 19,
  },

  // Byline
  byline: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
    paddingTop: 4,
    borderTopWidth: 0.5,
    borderTopColor: '#bbb',
    flexWrap: 'wrap',
    gap: 4,
  },
  bylineText: {
    fontSize: 8,
    color: '#666',
    fontStyle: 'italic',
  },
});