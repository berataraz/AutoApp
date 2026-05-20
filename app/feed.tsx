import AsyncStorage from "@react-native-async-storage/async-storage";
import { Image } from "expo-image";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import api from "../api";

// --- YARDIMCI FONKSİYONLAR VE DEĞİŞKENLER ---

// HTTP -> HTTPS düzeltici
const getSecureImageUrl = (
  url: string | null | undefined,
): string | undefined => {
  if (!url) return undefined;
  return url.replace("http://", "https://");
};

// Varsayılan resim
const defaultAvatar = require("../assets/images/3.jpg");

// Hikayeler (Şimdilik statik)
const users = [
  { name: "Semih İlkay", image: require("../assets/images/3.jpg") },
  { name: "jade", image: require("../assets/images/19.jpeg") },
  { name: "madeline", image: require("../assets/images/23.jpg") },
  { name: "katrina", image: require("../assets/images/18.jpeg") },
];

// Backend'den gelecek Feed verisinin tipi
interface FeedPost {
  id: number;
  content: string;
  postPhoto: string | null;
  likesCount: number;
  commentsCount: number;
  time: string;
  authorName: string;
  authorUsername: string;
  authorProfilePhoto: string | null;
  likedByMe: boolean;
}

// Java Backend'den gelen DTO'ya uygun Yorum tipi
interface PostCommentContent {
  content: string;
  authorUsername: string; 
  authorProfilePhoto: string | null;
}

// --- ANA BİLEŞEN (FEED) ---
export default function Feed() {
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeed = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        const response = await api().get("/posts/feed", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPosts(response.data);
      } catch (error) {
        console.error("Feed çekilirken hata:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeed();
  }, []);

  if (loading) {
    return (
      <View
        style={[
          styles.safeArea,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <ActivityIndicator size="large" color="#c47a2d" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.logo}>AutoTrack</Text>

        {/* Hikayeler Alanı */}
        <View style={styles.storyRow}>
          {users.map((user) => (
            <View style={styles.story} key={user.name}>
              <Image
                source={user.image}
                style={styles.storyImage}
                contentFit="cover"
              />
              <Text style={styles.storyName} numberOfLines={1}>
                {user.name}
              </Text>
            </View>
          ))}
        </View>

        {/* Dinamik Gönderiler (Feed) */}
        {posts.length > 0 ? (
          posts.map((post) => <Post key={post.id} post={post} />)
        ) : (
          <Text
            style={{ color: "#a9a9ae", textAlign: "center", marginTop: 40 }}
          >
            Henüz kimse bir şey paylaşmamış.
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );

  // --- ALT BİLEŞEN: TEKİL GÖNDERİ (POST) ---
  function Post({ post }: { post: FeedPost }) {
    // Beğeni State'leri
    const [liked, setLiked] = useState(post.likedByMe || false);
    const [likeCount, setLikeCount] = useState(post.likesCount);

    // Yorum Kutusu State'leri
    const [showCommentInput, setShowCommentInput] = useState(false);
    const [commentText, setCommentText] = useState("");
    const [commentCount, setCommentCount] = useState(post.commentsCount);

    // Yorum Verisi State'leri (Lazy Loading İçin)
    const [comments, setComments] = useState<PostCommentContent[]>([]);
    const [commentsLoading, setCommentsLoading] = useState(false);
    const [commentsLoaded, setCommentsLoaded] = useState(false);

    // --- BEĞENİ (LIKE) İŞLEMİ ---
    const handleLike = async () => {
      setLiked(!liked);
      setLikeCount((prev) => (liked ? prev - 1 : prev + 1));

      try {
        const token = await AsyncStorage.getItem("token");
        await api().post(`/posts/${post.id}/like`, null, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (error) {
        setLiked(!liked);
        setLikeCount((prev) => (liked ? prev + 1 : prev - 1));
        console.log("Beğeni hatası:", error);
      }
    };

    // --- YORUMLARI ÇEKME İŞLEMİ (Sadece butona basınca çalışır) ---
    const handleCommentPress = async () => {
      setShowCommentInput(!showCommentInput);
      
      // Eğer yorumlar daha önce çekilmediyse ve kutuyu açıyorsak veriyi getir
      if (!showCommentInput && !commentsLoaded) {
        setCommentsLoading(true);
        try {
          const token = await AsyncStorage.getItem("token");
          const response = await api().get(`/posts/${post.id}/comments`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setComments(response.data);
          setCommentsLoaded(true);
        } catch (error) {
          console.log("Yorumlar çekilemedi:", error);
        } finally {
          setCommentsLoading(false);
        }
      }
    };

    // --- YORUM GÖNDERME (COMMENT) İŞLEMİ ---
    const handleCommentSubmit = async () => {
      if (!commentText.trim()) return;

      try {
        const token = await AsyncStorage.getItem("token");
        const formData = new FormData();
        formData.append("content", commentText.trim());

        await api().post(`/posts/${post.id}/comment`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });

        // Başarılı olursa ekrandaki yorum sayısını 1 artır, listeye anında ekle ve kutuyu temizle
        setCommentCount((prev) => prev + 1);
        
        // Optimistic UI: Yorum listesini Backend'i beklemeden ekranda güncelle (İsteğe bağlı)
        setComments((prev) => [
          ...prev, 
          { content: commentText.trim(), authorUsername: "Sen", authorProfilePhoto: null }
        ]);
        
        setCommentText("");
      } catch (error) {
        console.log("Yorum hatası:", error);
        Alert.alert("Hata", "Yorum gönderilemedi.");
      }
    };

    return (
      <View style={styles.post}>
        {/* Yazar Bilgisi */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 10,
          }}
        >
          <Image
            source={
              post.authorProfilePhoto
                ? { uri: getSecureImageUrl(post.authorProfilePhoto) }
                : defaultAvatar
            }
            style={styles.authorAvatar}
            contentFit="cover"
          />
          <Text style={styles.author}>{post.authorName}</Text>
        </View>

        {/* Gönderi Fotoğrafı (Varsa) */}
        {post.postPhoto && (
          <Image
            source={{ uri: getSecureImageUrl(post.postPhoto) }}
            style={styles.postImage}
            contentFit="cover"
            transition={200}
          />
        )}

        {/* Etkileşim Butonları (Like & Comment) */}
        <View style={styles.actionRow}>
          <Pressable onPress={handleLike} style={styles.actionButton}>
            <Text style={[styles.actionIcon, liked && { color: "#e74c3c" }]}>
              {liked ? "❤️" : "♡"}
            </Text>
            <Text style={styles.actionText}>{likeCount}</Text>
          </Pressable>

          <Pressable
            onPress={handleCommentPress} // DİKKAT: Artık handleCommentPress çalışıyor!
            style={styles.actionButton}
          >
            <Text style={styles.actionIcon}>💬</Text>
            <Text style={styles.actionText}>{commentCount}</Text>
          </Pressable>
        </View>

        {/* Metin ve Zaman */}
        <Text style={styles.caption}>
          <Text style={styles.username}>{post.authorUsername}</Text>{" "}
          {post.content}
        </Text>
        <Text style={styles.time}>{post.time}</Text>

        {/* Yorum Yapma Kutusu ve Yorum Listesi (Sadece yoruma tıklandığında açılır) */}
        {showCommentInput && (
          <View style={styles.commentSection}>
            {/* YORUMLARI LİSTELEME ALANI */}
            {commentsLoading ? (
              <ActivityIndicator size="small" color="#c47a2d" style={{ marginVertical: 10 }} />
            ) : (
              comments.map((item, index) => (
                <View key={index} style={styles.commentRow}>
                  <Image
                    source={
                      item.authorProfilePhoto 
                        ? { uri: getSecureImageUrl(item.authorProfilePhoto) } 
                        : defaultAvatar
                    }
                    style={styles.commentAvatar}
                    contentFit="cover"
                  />
                  <View style={styles.commentTextBubble}>
                    <Text style={styles.commentUsername}>{item.authorUsername}</Text>
                    <Text style={styles.commentContentText}>{item.content}</Text>
                  </View>
                </View>
              ))
            )}

            {/* Yeni Yorum Yazma Alanı */}
            <View style={styles.commentInputRow}>
              <TextInput
                style={styles.commentInput}
                placeholder="Yorum ekle..."
                placeholderTextColor="#a9a9ae"
                value={commentText}
                onChangeText={setCommentText}
                autoFocus
              />
              <Pressable
                onPress={handleCommentSubmit}
                style={styles.commentSubmitBtn}
              >
                <Text style={styles.commentSubmitText}>Paylaş</Text>
              </Pressable>
            </View>
          </View>
        )}
      </View>
    );
  }
}

// --- TASARIMLAR (STYLES) ---
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#202124" },
  content: { paddingHorizontal: 24, paddingTop: 22, paddingBottom: 34 },
  logo: {
    color: "#c47a2d",
    fontSize: 20,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 10,
  },
  storyRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  story: { alignItems: "center", width: 72 },
  storyImage: {
    borderColor: "#c457a5",
    borderRadius: 8,
    borderWidth: 2,
    height: 58,
    width: 58,
  },
  storyName: {
    color: "#f2f2f4",
    fontSize: 11,
    fontWeight: "800",
    marginTop: 6,
  },
  post: {
    borderTopColor: "#34353a",
    borderTopWidth: 1,
    paddingTop: 14,
    marginBottom: 26,
  },

  authorAvatar: { width: 30, height: 30, borderRadius: 15, marginRight: 10 },
  author: { color: "#f2f2f4", fontSize: 16, fontWeight: "800" },

  postImage: { borderRadius: 8, height: 220, width: "100%", marginTop: 8 },

  // Etkileşim Butonları Stilleri
  actionRow: { flexDirection: "row", marginTop: 12, marginBottom: 8, gap: 16 },
  actionButton: { flexDirection: "row", alignItems: "center", gap: 6 },
  actionIcon: { fontSize: 22, color: "#f2f2f4" },
  actionText: { color: "#f2f2f4", fontSize: 14, fontWeight: "700" },

  caption: { color: "#f0f0f2", fontSize: 14, marginTop: 4 },
  username: { fontWeight: "800" },
  time: { color: "#c7c7cc", fontSize: 12, marginTop: 4 },

  // --- YENİ EKLENEN YORUM STİLLERİ ---
  commentSection: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#34353a",
    paddingTop: 10,
  },
  commentRow: {
    flexDirection: "row",
    marginBottom: 12,
    alignItems: "flex-start",
  },
  commentAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: 10,
  },
  commentTextBubble: {
    flex: 1,
    backgroundColor: "#2a2b30",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  commentUsername: {
    color: "#f2f2f4",
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 2,
  },
  commentContentText: {
    color: "#d1d1d5",
    fontSize: 13,
  },
  // ------------------------------------

  commentInputRow: {
    flexDirection: "row",
    marginTop: 12,
    alignItems: "center",
  },
  commentInput: {
    flex: 1,
    backgroundColor: "#34353a",
    color: "#fff",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 10,
  },
  commentSubmitBtn: { padding: 8 },
  commentSubmitText: { color: "#c47a2d", fontWeight: "800", fontSize: 14 },
});