import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  Image, Platform, useWindowDimensions,
} from 'react-native';
import { Feather } from '@expo/vector-icons';

// ─── Hindi month names ────────────────────────────────────────────────────────
const HINDI_MONTHS = ['जनवरी','फरवरी','मार्च','अप्रैल','मई','जून','जुलाई','अगस्त','सितंबर','अक्टूबर','नवंबर','दिसंबर'];
const HINDI_DAYS   = ['रविवार','सोमवार','मंगलवार','बुधवार','गुरुवार','शुक्रवार','शनिवार'];

function formatHindiDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  return `${d.getDate()} ${HINDI_MONTHS[d.getMonth()]} ${d.getFullYear()}, ${HINDI_DAYS[d.getDay()]}`;
}

function stripHtml(html) {
  return String(html || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ').trim();
}

// ─── Web CSS ──────────────────────────────────────────────────────────────────
const NP_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+Devanagari:wght@400;700;900&family=Noto+Sans+Devanagari:wght@400;600;700&display=swap');
  .np-print-btn { display:inline-flex; align-items:center; gap:6px; padding:7px 16px; border-radius:8px; background:#f0fdf4; border:1px solid #bbf7d0; font-size:12px; font-weight:700; color:#16a34a; cursor:pointer; border:none; }
  .np-print-btn:hover { background:#dcfce7; }
  @media print {
    .np-no-print { display:none !important; }
    body { background:#fff !important; }
    .np-page { box-shadow:none !important; border:1px solid #ccc !important; margin-bottom:0 !important; page-break-after: always; }
  }
`;

if (Platform.OS === 'web' && typeof document !== 'undefined') {
  if (!document.getElementById('np-styles')) {
    const el = document.createElement('style');
    el.id = 'np-styles';
    el.textContent = NP_CSS;
    document.head.appendChild(el);
  }
}

// ─── Single article in newspaper format ──────────────────────────────────────
function ArticleNewspaper({ article }) {
  const title       = stripHtml(article.title);
  const description = stripHtml(article.description);
  const state       = article.state || '';
  const dateStr     = article.publishDate || article.createdAt?.slice(0, 10) || '';
  const hindiDate   = formatHindiDate(dateStr);
  const reporter    = article.createdBy?.split('@')[0] || 'News Desk';
  const image       = article.images?.[0] || null;

  // Split description into paragraphs for better reading
  const paragraphs = description.split(/[।\.]\s+/).filter(p => p.trim().length > 10);

  if (Platform.OS === 'web') {
    return (
      <div className="np-page" style={{
        width: '100%',
        maxWidth: 860,
        margin: '0 auto 48px',
        backgroundColor: '#ffffff',
        border: '1px solid #bbb',
        boxShadow: '0 6px 32px rgba(0,0,0,0.12)',
        fontFamily: "'Noto Serif Devanagari', serif",
        overflow: 'hidden',
      }}>

        {/* ── Row 1: Date (left) + State (right) ── */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '6px 20px',
          borderBottom: '1.5px solid #111',
          backgroundColor: '#fafafa',
          fontFamily: "'Noto Sans Devanagari', sans-serif",
          fontSize: 12,
          color: '#333',
        }}>
          <span style={{ fontWeight: 500 }}>{hindiDate}</span>
          <span style={{ fontWeight: 700, fontSize: 13 }}>{state}</span>
        </div>

        {/* ── Row 2: Article TITLE as masthead ── */}
        <div style={{
          textAlign: 'center',
          padding: '18px 28px 14px',
          borderBottom: '3px double #111',
        }}>
          <div style={{
            fontFamily: "'Noto Serif Devanagari', serif",
            fontSize: 30,
            fontWeight: 900,
            color: '#111',
            lineHeight: 1.3,
            letterSpacing: 0.5,
          }}>
            {title}
          </div>
        </div>

        {/* ── Row 3: Thin separator line ── */}
        <div style={{ height: 1, backgroundColor: '#ccc', margin: '0 20px' }} />

        {/* ── Row 4: Unified Body ── */}
        <div style={{ padding: '18px 20px 16px' }}>
          <div style={{ display: 'block' }}>
            {image && (
              <img
                src={image}
                alt="article"
                style={{
                  float: 'left',
                  width: 240,
                  height: 220,
                  objectFit: 'cover',
                  border: '1px solid #ccc',
                  display: 'block',
                  marginRight: 20,
                  marginBottom: 8,
                }}
              />
            )}
            <div style={{
              ...(image ? {} : { columnCount: 2, columnGap: 24 }),
            }}>
              {paragraphs.length > 0
                ? paragraphs.map((para, i) => (
                  <p key={i} style={{
                    fontFamily: "'Noto Sans Devanagari', sans-serif",
                    fontSize: 14,
                    lineHeight: 1.9,
                    color: '#222',
                    textAlign: 'justify',
                    margin: '0 0 10px 0',
                  }}>
                    {para.trim()}{para.trim().endsWith('।') ? '' : '।'}
                  </p>
                ))
                : (
                  <p style={{
                    fontFamily: "'Noto Sans Devanagari', sans-serif",
                    fontSize: 14,
                    lineHeight: 1.9,
                    color: '#222',
                    textAlign: 'justify',
                    margin: 0,
                  }}>
                    {description}
                  </p>
                )
              }
            </div>
            <div style={{ clear: 'both' }} />
          </div>
        </div>
        {/* ── If no image, full-width text ── */}
        {!image && description && (
          <div style={{ padding: '0 20px 16px' }}>
            <p style={{
              fontFamily: "'Noto Sans Devanagari', sans-serif",
              fontSize: 14,
              lineHeight: 1.9,
              color: '#222',
              textAlign: 'justify',
              columnCount: 2,
              columnGap: 24,
              margin: 0,
            }}>
              {description}
            </p>
          </div>
        )}

        {/* ── Row 5: Footer ── */}
        <div style={{
          borderTop: '1px solid #ccc',
          padding: '8px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#fafafa',
          fontFamily: "'Noto Sans Devanagari', sans-serif",
          fontSize: 11,
          color: '#555',
        }}>
          <span><strong>रिपोर्टर : </strong>{reporter}</span>
          <span><strong>प्रकाशित : </strong>{hindiDate}</span>
        </div>
      </div>
    );
  }

  // ── Mobile layout ──
  return (
    <View style={{
      backgroundColor: '#fff',
      borderWidth: 1,
      borderColor: '#bbb',
      borderRadius: 2,
      marginBottom: 28,
      overflow: 'hidden',
    }}>
      {/* Top bar */}
      <View style={{
        flexDirection: 'row', justifyContent: 'space-between',
        padding: 10, borderBottomWidth: 1.5, borderBottomColor: '#111',
        backgroundColor: '#fafafa',
      }}>
        <Text style={{ fontSize: 11, color: '#333', fontWeight: '500' }}>{hindiDate}</Text>
        <Text style={{ fontSize: 11, color: '#111', fontWeight: '700' }}>{state}</Text>
      </View>

      {/* Title as masthead */}
      <View style={{
        padding: 14,
        borderBottomWidth: 3,
        borderBottomColor: '#111',
        alignItems: 'center',
      }}>
        <Text style={{
          fontSize: 20, fontWeight: '900', color: '#111',
          textAlign: 'center', lineHeight: 28,
        }}>
          {title}
        </Text>
      </View>

      {/* Image */}
      {image && (
        <Image
          source={{ uri: image }}
          style={{ width: '100%', height: 200 }}
          resizeMode="cover"
        />
      )}

      {/* Description */}
      <View style={{ padding: 14 }}>
        {paragraphs.length > 0
          ? paragraphs.map((para, i) => (
            <Text key={i} style={{
              fontSize: 13, lineHeight: 22, color: '#222',
              textAlign: 'justify', marginBottom: 10,
            }}>
              {para.trim()}{para.trim().endsWith('।') ? '' : '।'}
            </Text>
          ))
          : (
            <Text style={{ fontSize: 13, lineHeight: 22, color: '#222', textAlign: 'justify' }}>
              {description}
            </Text>
          )
        }
      </View>

      {/* Footer */}
      <View style={{
        flexDirection: 'row', justifyContent: 'space-between',
        padding: 10, borderTopWidth: 1, borderTopColor: '#ccc',
        backgroundColor: '#fafafa',
      }}>
        <Text style={{ fontSize: 10, color: '#555' }}>रिपोर्टर : {reporter}</Text>
        <Text style={{ fontSize: 10, color: '#555' }}>प्रकाशित : {hindiDate}</Text>
      </View>
    </View>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────
export default function NewspaperPage({ route, navigation }) {
  const { dateKey = '', articles = [] } = route?.params || {};
  const isWeb = Platform.OS === 'web';

  const handlePrint = () => {
    if (typeof window !== 'undefined') window.print();
  };

  if (isWeb) {
    return (
      <div style={{ height: '100vh', overflowY: 'auto', backgroundColor: '#e8e4df' }}>

        {/* ── Sticky top bar ── */}
        <div className="np-no-print" style={{
          position: 'sticky', top: 0, zIndex: 10,
          backgroundColor: '#fff',
          borderBottom: '1px solid #e5e7eb',
          padding: '11px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              onClick={() => navigation.goBack()}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '7px 14px', borderRadius: 8,
                background: '#fef6ec', border: '1px solid #fbcfa0',
                fontSize: 12, fontWeight: 700, color: '#7a420a', cursor: 'pointer',
              }}
            >
              ← Back
            </button>
            <span style={{ fontSize: 13, color: '#888', fontWeight: 500 }}>
              {dateKey} — {articles.length} article{articles.length !== 1 ? 's' : ''}
            </span>
          </div>
          <button className="np-print-btn" onClick={handlePrint}
            style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '7px 16px', fontSize: 12, fontWeight: 700, color: '#16a34a', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
          >
            🖨️ Print / Save PDF
          </button>
        </div>

        {/* ── Articles ── */}
        <div style={{ padding: '32px 16px 60px' }}>
          {articles.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 80, color: '#888' }}>
              <div style={{ fontSize: 48, marginBottom: 14 }}>📰</div>
              <div style={{ fontSize: 16, fontWeight: 600 }}>
                Koi approved article nahi hai is date ke liye
              </div>
            </div>
          ) : (
            articles.map((article, idx) => (
              <ArticleNewspaper key={article.id || idx} article={article} />
            ))
          )}
        </div>
      </div>
    );
  }

  // ── Mobile ──
  return (
    <View style={{ flex: 1, backgroundColor: '#e8e4df' }}>
      <View style={{
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        padding: 14, backgroundColor: '#fff',
        borderBottomWidth: 1, borderBottomColor: '#e5e7eb',
      }}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{
            flexDirection: 'row', alignItems: 'center', gap: 6,
            padding: 8, borderRadius: 8,
            backgroundColor: '#fef6ec', borderWidth: 1, borderColor: '#fbcfa0',
          }}
        >
          <Feather name="arrow-left" size={14} color="#7a420a" />
          <Text style={{ fontSize: 12, fontWeight: '700', color: '#7a420a' }}>Back</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 12, color: '#888', fontWeight: '600' }}>{dateKey}</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 14, paddingBottom: 48 }}
        showsVerticalScrollIndicator={false}
      >
        {articles.length === 0 ? (
          <View style={{ alignItems: 'center', paddingVertical: 80 }}>
            <Text style={{ fontSize: 48 }}>📰</Text>
            <Text style={{ fontSize: 15, color: '#888', marginTop: 14, fontWeight: '600', textAlign: 'center' }}>
              Koi approved article nahi hai
            </Text>
          </View>
        ) : (
          articles.map((article, idx) => (
            <ArticleNewspaper key={article.id || idx} article={article} />
          ))
        )}
      </ScrollView>
    </View>
  );
}