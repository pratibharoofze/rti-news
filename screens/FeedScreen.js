import React, { useState, useRef, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  FlatList, Image, Dimensions, Modal, TextInput,
  KeyboardAvoidingView, Platform, ScrollView, Alert,
  Animated,
} from 'react-native';
import { useWindowDimensions } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import AppHeader from '../components/AppHeader';
import AppNavbar from '../components/AppNavbar';
import AppFooter from '../components/AppFooter';
import WebLayout from '../components/WebLayout';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// ── News-style Reels Dummy Data — Real Video URLs ───────────────────────────
// Free public domain / creative commons short news-style videos
const DUMMY_POSTS = [
  {
    id: '1',
    user: 'Rahul Sharma',
    avatar: 'https://i.pravatar.cc/100?img=11',
    verified: true,
    role: 'RTI Activist',
    location: 'Lucknow, Uttar Pradesh',
    time: '2 min ago',
    type: 'video',
    // Public domain news/nature video — water supply topic
   
    thumbnail: 'https://images.shiksha.com/mediadata/images/articles/1733209282phpDQvZRu.png',
    headline: 'RTI se pani supply ka sach aaya samne!',
    caption: 'Lucknow ke Ward 14 mein 3 mahine se pani nahi aa raha tha. RTI daali, 30 din mein collector ne jawab diya — pipeline repair ka budget release ho gaya. Jan Shakti Zindabad! 🎉 #RTI #JanAdhikar #Water',
    likes: 1240, views: 8900, shares: 312,
    comments: [
      { id: 'c1', user: 'Priya Verma', text: 'Bahut acha kaam kiya bhai! 👏' },
      { id: 'c2', user: 'Mohan Lal', text: 'RTI ek powerful tool hai, use it!' },
    ],
    liked: false, bookmarked: false,
    tag: 'Success Story', tagColor: '#16a34a',
  },
  {
    id: '2',
    user: 'Anjali Singh',
    avatar: 'https://i.pravatar.cc/100?img=47',
    verified: false,
    role: 'Teacher',
    location: 'Bhopal, Madhya Pradesh',
    time: '15 min ago',
    type: 'video',
    media: 'https://www.youtube.com/watch?v=BL8h5fTWOZ4',
    
    headline: 'Sarkari school ke funds kahan gaye? RTI se poochha!',
    caption: 'Bhopal ke Government Primary School No. 7 mein mid-day meal funds ka hisaab nahi tha. RTI application file ki — 20 din mein documents maange hain. #RTI #Education #Accountability',
    likes: 890, views: 5400, shares: 145,
    comments: [
      { id: 'c3', user: 'Admin RTI', text: 'Best of luck! Hum sath hain.' },
      { id: 'c4', user: 'Ravi Kumar', text: 'Aisi RTI aur daalo!' },
    ],
    liked: false, bookmarked: false,
    tag: 'Application Filed', tagColor: '#2563eb',
  },
  {
    id: '3',
    user: 'Vikram Patel',
    avatar: 'https://i.pravatar.cc/100?img=33',
    verified: true,
    role: 'Journalist',
    location: 'Ahmedabad, Gujarat',
    time: '1 hr ago',
    type: 'video',
    media: 'https://www.youtube.com/watch?v=BL8h5fTWOZ4',
    thumbnail: 'https://images.shiksha.com/mediadata/images/articles/1733209282phpDQvZRu.png',
    headline: 'Sadak RTI ke baad bani — yahi hai Jan Shakti!',
    caption: 'Ahmedabad ke Narol area mein 2 saal se sadak nahi bani thi. RTI daaline ke baad PWD ne 15 din mein kaam shuru kar diya. 🛣️ #RTI #Infrastructure #Gujarat',
    likes: 3120, views: 21000, shares: 890,
    comments: [
      { id: 'c5', user: 'Neha Shah', text: 'Wah! Ekdam inspiring hai yeh!' },
      { id: 'c6', user: 'Suresh Bhai', text: 'Kaise daali RTI? Steps share karo please.' },
      { id: 'c7', user: 'RTI Portal', text: 'Great work Vikram ji! 🙌' },
    ],
    liked: true, bookmarked: false,
    tag: 'Victory', tagColor: '#d97706',
  },
  {
    id: '4',
    user: 'Dr. Meera Devi',
    avatar: 'https://i.pravatar.cc/100?img=25',
    verified: true,
    role: 'Doctor & Activist',
    location: 'Patna, Bihar',
    time: '3 hrs ago',
    type: 'video',
    media: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    thumbnail: 'https://picsum.photos/seed/news4/600/900',
    headline: 'Sarkari hospital mein dawai ka stock kahan hai?',
    caption: 'Patna Civil Hospital mein zaruri dawaiyan stock mein nahi thi. RTI ke through medicine purchase records maange. Sarkar ko jawab dena hi padega! 💊 #RTI #Health #Bihar',
    likes: 2050, views: 14300, shares: 567,
    comments: [
      { id: 'c8', user: 'Asha Devi', text: 'Yahan bhi same problem hai!' },
      { id: 'c9', user: 'Health Watch', text: 'Important RTI hai yeh. Share karo.' },
    ],
    liked: false, bookmarked: true,
    tag: 'Health RTI', tagColor: '#dc2626',
  },
  {
    id: '5',
    user: 'RTI Portal Official',
    avatar: 'https://i.pravatar.cc/100?img=60',
    verified: true,
    role: 'Official Account',
    location: 'New Delhi',
    time: '5 hrs ago',
    type: 'video',
    media: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4',
    thumbnail: 'https://picsum.photos/seed/news5/600/900',
    headline: 'Ab ghar baithe file karo RTI — sirf 5 minute mein!',
    caption: '📢 Ab aap RTI online bhi file kar sakte ho! rtionline.gov.in pe jaake registration karo. Koi fee nahi, koi agent nahi — seedha sarkar se sawaal poochho! #RTIOnline #DigitalIndia',
    likes: 8910, views: 65000, shares: 4200,
    comments: [
      { id: 'c10', user: 'Raj Mishra', text: 'Thank you! Bahut kaam ka update hai.' },
      { id: 'c11', user: 'Pooja Gupta', text: 'Share kiya sab ko! 🙏' },
    ],
    liked: false, bookmarked: false,
    tag: 'Official Update', tagColor: '#7c3aed',
  },
  {
    id: '6',
    user: 'Suresh Kumar',
    avatar: 'https://i.pravatar.cc/100?img=15',
    verified: false,
    role: 'Student',
    location: 'Jaipur, Rajasthan',
    time: '6 hrs ago',
    type: 'video',
    media: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
    thumbnail: 'https://picsum.photos/seed/news6/600/900',
    headline: 'Teachers ki attendance RTI mein maangi — school shocked!',
    caption: 'Jaipur ke ek sarkari school mein teachers regularly absent rehte the. RTI daali — attendance register ki copy maangi. School administration ab seedha ho gayi! 📚 #RTI #Education',
    likes: 670, views: 4100, shares: 198,
    comments: [
      { id: 'c13', user: 'Parent Group', text: 'Bahut sahi kiya! Hum sab sath hain.' },
    ],
    liked: false, bookmarked: false,
    tag: 'Education RTI', tagColor: '#0891b2',
  },
  {
    id: '7',
    user: 'Kavita Rao',
    avatar: 'https://i.pravatar.cc/100?img=44',
    verified: false,
    role: 'Social Worker',
    location: 'Hyderabad, Telangana',
    time: '8 hrs ago',
    type: 'video',
    media: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4',
    thumbnail: 'https://picsum.photos/seed/news7/600/900',
    headline: 'MGNREGA funds ki RTI — 2 crore ka khel pakda!',
    caption: 'Hyderabad ke ek block mein MGNREGA ke naam pe 2 crore ka fund aaya lekin majdooron ko ek paisa nahi mila. RTI daali — ab CBI jaanch shuru! ⚖️ #RTI #MGNREGA #Corruption',
    likes: 5430, views: 38000, shares: 2100,
    comments: [
      { id: 'c14', user: 'Ramesh', text: 'Yeh toh bahut bada expose hai!' },
      { id: 'c15', user: 'Media Watch', text: 'Hum cover karenge yeh story.' },
    ],
    liked: false, bookmarked: true,
    tag: 'Corruption Exposed', tagColor: '#be123c',
  },
];

// ── Upload Post Modal ────────────────────────────────────────────────────────
function UploadModal({ visible, onClose, onPost }) {
  const [caption, setCaption] = useState('');
  const [headline, setHeadline] = useState('');
  const [tag, setTag] = useState('Success Story');
  const tags = ['Success Story', 'Application Filed', 'Victory', 'Question', 'Official Update', 'Corruption Exposed'];

  const handlePost = () => {
    if (!caption.trim()) {
      Alert.alert('Caption required', 'Please write something before posting.');
      return;
    }
    onPost({ caption, headline, tag });
    setCaption(''); setHeadline(''); onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalOverlay}
      >
        <View style={styles.uploadSheet}>
          <View style={styles.sheetHandle} />
          <Text style={styles.sheetTitle}>📰 News Post</Text>

          <TouchableOpacity style={styles.mediaBox} activeOpacity={0.7}>
            <Text style={styles.mediaBoxIcon}>🎥</Text>
            <Text style={styles.mediaBoxText}>Video / Photo add karo</Text>
            <Text style={styles.mediaBoxSub}>(gallery se choose karo)</Text>
          </TouchableOpacity>

          <TextInput
            style={[styles.captionInput, { minHeight: 44, marginBottom: 10 }]}
            placeholder="Headline (e.g. RTI se sadak bani!)"
            placeholderTextColor="#94a3b8"
            value={headline}
            onChangeText={setHeadline}
            maxLength={100}
          />
          <TextInput
            style={styles.captionInput}
            placeholder="Apni RTI story detail mein likhein..."
            placeholderTextColor="#94a3b8"
            multiline
            value={caption}
            onChangeText={setCaption}
            maxLength={300}
          />
          <Text style={styles.charCount}>{caption.length}/300</Text>

          <Text style={styles.tagLabel}>Category:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tagRow}>
            {tags.map((t) => (
              <TouchableOpacity
                key={t}
                style={[styles.tagChip, tag === t && styles.tagChipActive]}
                onPress={() => setTag(t)}
              >
                <Text style={[styles.tagChipText, tag === t && styles.tagChipTextActive]}>{t}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.modalBtns}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.postBtn} onPress={handlePost}>
              <Text style={styles.postBtnText}>Post 🚀</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ── Comments Sheet ───────────────────────────────────────────────────────────
function CommentsModal({ visible, onClose, comments, onAddComment }) {
  const [text, setText] = useState('');

  const handleSend = () => {
    if (!text.trim()) return;
    onAddComment(text.trim());
    setText('');
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={onClose} />
        <View style={styles.commentsSheet}>
          <View style={styles.sheetHandle} />
          <Text style={styles.sheetTitle}>💬 Comments</Text>
          <ScrollView style={styles.commentsList} showsVerticalScrollIndicator={false}>
            {comments.length === 0 && <Text style={styles.noComments}>Pehle comment karo! 👇</Text>}
            {comments.map((c) => (
              <View key={c.id} style={styles.commentRow}>
                <View style={styles.commentAvatar}>
                  <Text style={styles.commentAvatarText}>{c.user[0]}</Text>
                </View>
                <View style={styles.commentBubble}>
                  <Text style={styles.commentUser}>{c.user}</Text>
                  <Text style={styles.commentText}>{c.text}</Text>
                </View>
              </View>
            ))}
          </ScrollView>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <View style={styles.commentInputRow}>
              <TextInput
                style={styles.commentInput}
                placeholder="Comment karo..."
                placeholderTextColor="#94a3b8"
                value={text}
                onChangeText={setText}
              />
              <TouchableOpacity style={styles.sendBtn} onPress={handleSend}>
                <Text style={styles.sendBtnText}>➤</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeBtnText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// ── Single Reel Card — Video Player ──────────────────────────────────────────
function ReelCard({ post, onLike, onBookmark, onComment, isActive }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const [captionExpanded, setCaptionExpanded] = useState(false);
  const [muted, setMuted] = useState(false);
  const [paused, setPaused] = useState(false);
  const videoRef = useRef(null);

  const handleLikePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 1.4, duration: 120, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 120, useNativeDriver: true }),
    ]).start();
    onLike(post.id);
  };

  const formatCount = (n) => {
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
    return String(n);
  };

  const togglePause = () => setPaused((v) => !v);

  return (
    <View style={styles.reel}>

      {/* ── Full screen VIDEO ── */}
      <TouchableOpacity
        style={StyleSheet.absoluteFill}
        activeOpacity={1}
        onPress={togglePause}
      >
        {post.type === 'video' && post.media ? (
          <Video
            ref={videoRef}
            source={{ uri: post.media }}
            style={StyleSheet.absoluteFill}
            resizeMode={ResizeMode.COVER}
            shouldPlay={isActive && !paused}
            isLooping
            isMuted={muted}
            posterSource={{ uri: post.thumbnail }}
            usePoster
          />
        ) : (
          <Image
            source={{ uri: post.thumbnail || post.media }}
            style={StyleSheet.absoluteFill}
            resizeMode="cover"
          />
        )}
      </TouchableOpacity>

      {/* Dark overlays */}
      <View style={styles.reelOverlayTop} pointerEvents="none" />
      <View style={styles.reelOverlayBottom} pointerEvents="none" />

      {/* Pause indicator */}
      {paused && (
        <View style={styles.pausedOverlay} pointerEvents="none">
          <Text style={styles.pausedIcon}>⏸</Text>
        </View>
      )}

      {/* ── TOP: Tag + Views + Mute button ── */}
      <View style={styles.reelTopBar}>
        <View style={[styles.reelTagBadge, { backgroundColor: post.tagColor }]}>
          <Text style={styles.reelTagText}>{post.tag}</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
          <View style={styles.viewsRow}>
            <Text style={styles.viewsIcon}>👁</Text>
            <Text style={styles.viewsText}>{formatCount(post.views)}</Text>
          </View>
          {/* Mute toggle */}
          <TouchableOpacity
            style={styles.muteBtn}
            onPress={() => setMuted((v) => !v)}
          >
            <Text style={{ fontSize: 16 }}>{muted ? '🔇' : '🔊'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── RIGHT: Actions ── */}
      <View style={styles.reelActions}>
        {/* Avatar */}
        <View style={styles.reelAvatarWrap}>
          <Image source={{ uri: post.avatar }} style={styles.reelAvatar} />
          {post.verified && (
            <View style={styles.verifiedBadge}>
              <Text style={{ fontSize: 8, color: '#fff' }}>✓</Text>
            </View>
          )}
        </View>

        {/* Like */}
        <TouchableOpacity style={styles.reelActionBtn} onPress={handleLikePress} activeOpacity={0.7}>
          <Animated.Text style={[styles.reelActionIcon, { transform: [{ scale: scaleAnim }] }]}>
            {post.liked ? '❤️' : '🤍'}
          </Animated.Text>
          <Text style={styles.reelActionCount}>{formatCount(post.liked ? post.likes + 1 : post.likes)}</Text>
        </TouchableOpacity>

        {/* Comment */}
        <TouchableOpacity style={styles.reelActionBtn} onPress={() => onComment(post.id)} activeOpacity={0.7}>
          <Text style={styles.reelActionIcon}>💬</Text>
          <Text style={styles.reelActionCount}>{post.comments.length}</Text>
        </TouchableOpacity>

        {/* Share */}
        <TouchableOpacity style={styles.reelActionBtn} activeOpacity={0.7}>
          <Text style={styles.reelActionIcon}>📤</Text>
          <Text style={styles.reelActionCount}>{formatCount(post.shares)}</Text>
        </TouchableOpacity>

        {/* Bookmark */}
        <TouchableOpacity style={styles.reelActionBtn} onPress={() => onBookmark(post.id)} activeOpacity={0.7}>
          <Text style={styles.reelActionIcon}>{post.bookmarked ? '🔖' : '🏷️'}</Text>
        </TouchableOpacity>
      </View>

      {/* ── BOTTOM: User info + headline + caption ── */}
      <View style={styles.reelBottom}>
        <View style={styles.reelUserRow}>
          <Image source={{ uri: post.avatar }} style={styles.reelUserAvatar} />
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Text style={styles.reelUserName}>{post.user}</Text>
              {post.verified && <Text style={{ color: '#60a5fa', fontSize: 12 }}>✓</Text>}
            </View>
            <Text style={styles.reelUserRole}>{post.role} · {post.time}</Text>
          </View>
        </View>

        <View style={styles.reelLocationRow}>
          <Text style={styles.reelLocationIcon}>📍</Text>
          <Text style={styles.reelLocationText}>{post.location}</Text>
        </View>

        {post.headline ? (
          <Text style={styles.reelHeadline}>{post.headline}</Text>
        ) : null}

        <Text style={styles.reelCaption} numberOfLines={captionExpanded ? undefined : 2}>
          {post.caption}
        </Text>
        {post.caption.length > 80 && (
          <TouchableOpacity onPress={() => setCaptionExpanded((v) => !v)}>
            <Text style={styles.reelCaptionMore}>
              {captionExpanded ? '▲ less' : '▼ more'}
            </Text>
          </TouchableOpacity>
        )}

        {post.comments.length > 0 && (
          <TouchableOpacity onPress={() => onComment(post.id)}>
            <Text style={styles.reelViewComments}>
              💬 View all {post.comments.length} comments
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

// ── Main Feed Screen ─────────────────────────────────────────────────────────
export default function FeedScreen({ navigation }) {
  const [posts, setPosts] = useState(DUMMY_POSTS);
  const [uploadVisible, setUploadVisible] = useState(false);
  const [commentPost, setCommentPost] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const { width } = useWindowDimensions();
  const isWeb = width >= 768;

  const handleLike     = useCallback((id) => setPosts((prev) => prev.map((p) => p.id === id ? { ...p, liked: !p.liked } : p)), []);
  const handleBookmark = useCallback((id) => setPosts((prev) => prev.map((p) => p.id === id ? { ...p, bookmarked: !p.bookmarked } : p)), []);
  const handleComment  = useCallback((id) => setCommentPost(id), []);

  const handleAddComment = useCallback((text) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === commentPost
          ? { ...p, comments: [...p.comments, { id: Date.now().toString(), user: 'Aap', text }] }
          : p
      )
    );
  }, [commentPost]);

  const handleNewPost = useCallback(({ caption, headline, tag }) => {
    const newPost = {
      id: Date.now().toString(),
      user: 'Aap', avatar: 'https://i.pravatar.cc/100?img=5',
      verified: false, role: 'Citizen', location: 'India', time: 'Just now',
      type: 'image',
      media: `https://picsum.photos/seed/${Date.now()}/600/900`,
      thumbnail: `https://picsum.photos/seed/${Date.now()}/600/900`,
      headline: headline || 'Meri RTI Story',
      caption, likes: 0, views: 1, shares: 0, comments: [],
      liked: false, bookmarked: false, tag, tagColor: '#16a34a',
    };
    setPosts((prev) => [newPost, ...prev]);
  }, []);

  const onViewableItemsChanged = useCallback(({ viewableItems }) => {
    if (viewableItems.length > 0) setActiveIndex(viewableItems[0].index ?? 0);
  }, []);

  const viewabilityConfig = useRef({ itemVisibilityPercentThreshold: 60 }).current;
  const activeCommentData = posts.find((p) => p.id === commentPost);

  const page = (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      {isWeb && <AppNavbar navigation={navigation} activeScreen="Feed" />}

      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <ReelCard
            post={item}
            onLike={handleLike}
            onBookmark={handleBookmark}
            onComment={handleComment}
            isActive={index === activeIndex}
          />
        )}
        pagingEnabled
        snapToInterval={SCREEN_HEIGHT}
        snapToAlignment="start"
        decelerationRate="fast"
        showsVerticalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        getItemLayout={(_, index) => ({
          length: SCREEN_HEIGHT,
          offset: SCREEN_HEIGHT * index,
          index,
        })}
        style={{ flex: 1 }}
      />

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setUploadVisible(true)}
        activeOpacity={0.85}
      >
        <Text style={styles.fabText}>+ Post</Text>
      </TouchableOpacity>

      <UploadModal
        visible={uploadVisible}
        onClose={() => setUploadVisible(false)}
        onPost={handleNewPost}
      />

      {activeCommentData && (
        <CommentsModal
          visible={!!commentPost}
          onClose={() => setCommentPost(null)}
          comments={activeCommentData.comments}
          onAddComment={handleAddComment}
        />
      )}

      {!isWeb && <AppNavbar navigation={navigation} activeScreen="Feed" />}
    </View>
  );

  return isWeb ? <WebLayout>{page}</WebLayout> : page;
}

// ── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  reel: {
    width: SCREEN_WIDTH, height: SCREEN_HEIGHT,
    backgroundColor: '#000', position: 'relative', overflow: 'hidden',
  },
  reelOverlayTop: {
    position: 'absolute', top: 0, left: 0, right: 0, height: 140,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  reelOverlayBottom: {
    position: 'absolute', bottom: 0, left: 0, right: 0, height: 320,
    backgroundColor: 'rgba(0,0,0,0.65)',
  },
  pausedOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  pausedIcon: { fontSize: 64, opacity: 0.8 },

  // Top bar
  reelTopBar: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 54 : 16,
    left: 14, right: 14,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  reelTagBadge: {
    paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20,
  },
  reelTagText: { color: '#fff', fontSize: 11, fontWeight: '800' },
  viewsRow: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20,
  },
  viewsIcon: { fontSize: 12 },
  viewsText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  muteBtn: {
    backgroundColor: 'rgba(0,0,0,0.4)',
    padding: 6, borderRadius: 20,
  },

  // Right actions
  reelActions: {
    position: 'absolute', right: 12, bottom: 120,
    alignItems: 'center', gap: 18,
  },
  reelAvatarWrap: {
    width: 46, height: 46, borderRadius: 23,
    borderWidth: 2, borderColor: '#fff',
    overflow: 'visible', marginBottom: 4, position: 'relative',
  },
  reelAvatar: { width: 42, height: 42, borderRadius: 21 },
  verifiedBadge: {
    position: 'absolute', bottom: -2, right: -2,
    width: 16, height: 16, borderRadius: 8,
    backgroundColor: '#3b82f6', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: '#fff',
  },
  reelActionBtn: { alignItems: 'center', gap: 3 },
  reelActionIcon: { fontSize: 26 },
  reelActionCount: {
    color: '#fff', fontSize: 11, fontWeight: '700',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 3,
  },

  // Bottom info
  reelBottom: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 44 : 24,
    left: 14, right: 72,
  },
  reelUserRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4,
  },
  reelUserAvatar: {
    width: 32, height: 32, borderRadius: 16,
    borderWidth: 1.5, borderColor: '#fff',
  },
  reelUserName: { color: '#fff', fontWeight: '800', fontSize: 13 },
  reelUserRole: { color: 'rgba(255,255,255,0.65)', fontSize: 11 },
  reelLocationRow: {
    flexDirection: 'row', alignItems: 'center', gap: 3, marginBottom: 6,
  },
  reelLocationIcon: { fontSize: 11 },
  reelLocationText: { color: 'rgba(255,255,255,0.75)', fontSize: 11, fontWeight: '600' },
  reelHeadline: {
    color: '#fff', fontSize: 16, fontWeight: '900',
    lineHeight: 22, marginBottom: 4,
    textShadowColor: 'rgba(0,0,0,0.9)',
    textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4,
  },
  reelCaption: { color: 'rgba(255,255,255,0.88)', fontSize: 13, lineHeight: 18 },
  reelCaptionMore: { color: 'rgba(255,255,255,0.5)', fontSize: 12, marginTop: 3 },
  reelViewComments: {
    marginTop: 6, fontSize: 12,
    color: 'rgba(255,255,255,0.6)', fontWeight: '600',
  },

  // FAB
  fab: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 54 : 16,
    right: 16,
    backgroundColor: '#f97316',
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 20, elevation: 6, zIndex: 99,
  },
  fabText: { color: '#fff', fontWeight: '700', fontSize: 13 },

  // Modals
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end',
  },
  uploadSheet: {
    backgroundColor: '#fff', borderTopLeftRadius: 22, borderTopRightRadius: 22,
    padding: 20, paddingBottom: Platform.OS === 'ios' ? 36 : 20,
    maxHeight: SCREEN_HEIGHT * 0.88,
  },
  commentsSheet: {
    backgroundColor: '#fff', borderTopLeftRadius: 22, borderTopRightRadius: 22,
    padding: 16, maxHeight: SCREEN_HEIGHT * 0.75,
    paddingBottom: Platform.OS === 'ios' ? 36 : 16,
  },
  sheetHandle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: '#e2e8f0', alignSelf: 'center', marginBottom: 12,
  },
  sheetTitle: {
    fontSize: 18, fontWeight: '800', color: '#1e293b',
    marginBottom: 14, textAlign: 'center',
  },
  mediaBox: {
    borderWidth: 2, borderColor: '#e2e8f0', borderStyle: 'dashed',
    borderRadius: 12, height: 100, alignItems: 'center',
    justifyContent: 'center', marginBottom: 12, backgroundColor: '#f8fafc',
  },
  mediaBoxIcon: { fontSize: 28, marginBottom: 4 },
  mediaBoxText: { fontSize: 13, fontWeight: '600', color: '#475569' },
  mediaBoxSub: { fontSize: 11, color: '#94a3b8', marginTop: 2 },
  captionInput: {
    borderWidth: 1.5, borderColor: '#e2e8f0', borderRadius: 12,
    padding: 12, fontSize: 13, color: '#1e293b',
    minHeight: 80, textAlignVertical: 'top', backgroundColor: '#f8fafc',
  },
  charCount: { textAlign: 'right', fontSize: 11, color: '#94a3b8', marginTop: 4, marginBottom: 10 },
  tagLabel: { fontSize: 13, fontWeight: '700', color: '#475569', marginBottom: 8 },
  tagRow: { marginBottom: 14 },
  tagChip: {
    borderWidth: 1.5, borderColor: '#e2e8f0', borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 6, marginRight: 8, backgroundColor: '#f8fafc',
  },
  tagChipActive: { borderColor: '#f97316', backgroundColor: '#fff7ed' },
  tagChipText: { fontSize: 12, fontWeight: '600', color: '#64748b' },
  tagChipTextActive: { color: '#f97316', fontWeight: '800' },
  modalBtns: { flexDirection: 'row', gap: 10 },
  cancelBtn: {
    flex: 1, borderWidth: 1.5, borderColor: '#e2e8f0',
    borderRadius: 12, paddingVertical: 13, alignItems: 'center',
  },
  cancelBtnText: { fontSize: 14, fontWeight: '700', color: '#64748b' },
  postBtn: {
    flex: 2, backgroundColor: '#f97316', borderRadius: 12,
    paddingVertical: 13, alignItems: 'center', elevation: 3,
  },
  postBtnText: { fontSize: 14, fontWeight: '800', color: '#fff' },
  commentsList: { maxHeight: SCREEN_HEIGHT * 0.42, marginBottom: 10 },
  noComments: { textAlign: 'center', color: '#94a3b8', fontSize: 14, marginVertical: 24 },
  commentRow: { flexDirection: 'row', gap: 10, marginBottom: 12, alignItems: 'flex-start' },
  commentAvatar: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: '#f97316', alignItems: 'center', justifyContent: 'center',
  },
  commentAvatarText: { color: '#fff', fontWeight: '800', fontSize: 14 },
  commentBubble: { flex: 1, backgroundColor: '#f8fafc', borderRadius: 12, padding: 10 },
  commentUser: { fontSize: 12, fontWeight: '800', color: '#1e293b', marginBottom: 2 },
  commentText: { fontSize: 13, color: '#475569', lineHeight: 17 },
  commentInputRow: { flexDirection: 'row', gap: 8, alignItems: 'center', marginBottom: 8 },
  commentInput: {
    flex: 1, borderWidth: 1.5, borderColor: '#e2e8f0', borderRadius: 24,
    paddingHorizontal: 14, paddingVertical: 10, fontSize: 13,
    color: '#1e293b', backgroundColor: '#f8fafc',
  },
  sendBtn: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: '#f97316', alignItems: 'center', justifyContent: 'center',
  },
  sendBtnText: { fontSize: 16, color: '#fff' },
  closeBtn: { alignItems: 'center', paddingVertical: 10 },
  closeBtnText: { fontSize: 14, color: '#94a3b8', fontWeight: '600' },
});