import React, { useCallback, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  Platform, SafeAreaView, Image,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { UserStore } from '../store/UserStore';

export default function NewspaperList({ navigation }) {
  const [grouped, setGrouped] = useState({});
  const [loading, setLoading] = useState(true);
  const isWeb = Platform.OS === 'web';

  useFocusEffect(
    useCallback(() => {
      let alive = true;
      (async () => {
        setLoading(true);
        try {
          const data = await UserStore.getEPaperSummary();
          if (!alive) return;
          const allPapers = (data?.items || [])
            .filter(p => p.status === 'approved')
            .map(p => ({
              id: p.id || '',
              title: p.title || '',
              description: p.description || '',
              status: p.status || 'approved',
              state: p.state || '',
              publishDate: p.publishDate || p.createdAt?.slice(0,10) || '',
              createdAt: p.createdAt || '',
              createdBy: p.createdBy || '',
              images: p.images || [],
            }));
          const g = {};
          allPapers.forEach(item => {
            const dk = item.publishDate || item.createdAt?.slice(0,10) || 'Unknown';
            if (!g[dk]) g[dk] = [];
            g[dk].push(item);
          });
          setGrouped(g);
        } catch(e) {
          console.log('NewspaperList error:', e);
        }
        if (alive) setLoading(false);
      })();
      return () => { alive = false; };
    }, [])
  );
  const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  const stripHtml = (html) =>
    String(html || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

  if (isWeb) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#F7F4F0' }}>
        {/* Top bar */}
        <div style={{
          position: 'sticky', top: 0, zIndex: 10,
          backgroundColor: '#fff',
          borderBottom: '1px solid #e5e7eb',
          padding: '12px 24px',
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
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
          <span style={{ fontSize: 18, fontWeight: 800, color: '#111', fontFamily: 'serif' }}>
            📰 Newspaper
          </span>
        </div>

        <div style={{ padding: 'clamp(14px, 3vw, 32px) clamp(10px, 2vw, 24px) 80px', maxWidth: 1100, margin: '0 auto' }}>
          {loading ? (
            <p style={{ color: '#888', textAlign: 'center', paddingTop: 60 }}>Loading…</p>
          ) : (
            <div style={{ textAlign: 'center', paddingTop: 80, color: '#888' }}>
              <div style={{ fontSize: 48, marginBottom: 14 }}>📰</div>
              <div style={{ fontSize: 15, fontWeight: 600 }}>There is no published article available at the moment.</div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Mobile ──
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F7F4F0' }}>
      <View style={{
        flexDirection: 'row', alignItems: 'center', gap: 10,
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
        <Text style={{ fontSize: 16, fontWeight: '800', color: '#111' }}>📰 Newspaper</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 14, paddingBottom: 100 }}>
        {loading ? (
          <Text style={{ color: '#888', textAlign: 'center', paddingTop: 60 }}>Loading…</Text>
        ) : (
          <View style={{ alignItems: 'center', paddingTop: 80 }}>
            <Text style={{ fontSize: 40 }}>📰</Text>
            <Text style={{ fontSize: 14, color: '#888', marginTop: 12, fontWeight: '600' }}>
              Koi published article nahi hai
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}