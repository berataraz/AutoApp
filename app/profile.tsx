import { uploadImageToServer } from "@/services/userProfileService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import type { ImageSourcePropType } from "react-native";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import api from "../api";

const coverImage = require("../assets/images/21.jpg");
const avatarImage = require("../assets/images/3.jpg");
const garageOne = require("../assets/images/5.jpg");
const garageTwo = require("../assets/images/6.jpg");
const postImage = require("../assets/images/33.jpg");
const routeMapOne = require("../assets/images/9.png");
const routeMapTwo = require("../assets/images/10.png");

interface Vehicle {
  id: number;
  brand: string;
  model: string;
  year: number;
  licensePlate?: string;
  imageUrl?: string;
}

interface Post {
  id: number;
  content: string;
  postPhoto: string | null;
  likesCount: number;
  commentsCount: number;
  time: string;
}

interface Route {
  id: number;
  title: string;
  detail: string;
  duration: number;
  distance: number;
}

interface UserProfile {
  name: string;
  username: string;
  profilePhoto: string | null;
  coverPhoto: string | null;
  followerCount: number;
  followingCount: number;
  garage: Vehicle[];
  posts: Post[];
  routes: Route[];
}

// HTTP -> HTTPS dönüşümü için yardımcı fonksiyon
const getSecureImageUrl = (url: string | null | undefined) => {
  if (!url) return null;
  return url.replace("http://", "https://");
};

export default function Profile() {
  const router = useRouter();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // --- AKILLI VE TEK (DRY) FOTOĞRAF SEÇİCİ FONKSİYON ---
  const handleImageSelection = async (
    isCover: boolean,
    fromCamera: boolean,
  ) => {
    // İzinleri kontrol et
    const permissionResult = fromCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert("Hata", "Gerekli izinler verilmedi.");
      return;
    }

    // Kamera/Galeri ayarlarını belirle (Kapak ise 16:9, Profil ise 1:1)
    const options: ImagePicker.ImagePickerOptions = {
      allowsEditing: true,
      aspect: isCover ? [16, 9] : [1, 1],
      quality: 0.5,
    };

    // İsteğe göre Kamera veya Galeriyi aç
    const result = fromCamera
      ? await ImagePicker.launchCameraAsync(options)
      : await ImagePicker.launchImageLibraryAsync(options);

    if (!result.canceled) {
      const uri = result.assets[0].uri;

      // Ekranı anında güncelle (Hızlı UX)
      setProfile((prev) => {
        if (!prev) return prev;
        return isCover
          ? { ...prev, coverPhoto: uri }
          : { ...prev, profilePhoto: uri };
      });

      // Arka planda sunucuya yükle
      const endpoint = isCover
        ? "/profile/uploadCoverPhoto"
        : "/profile/uploadProfilePhoto";
      const photoType = isCover ? "cover" : "profile";

      uploadImageToServer(uri, endpoint, photoType);
    }
  };

  // --- PROFİL VE KAPAK MENÜLERİ ---
  const handleProfilePhotoPress = () => {
    Alert.alert("Profil Fotoğrafı Seç", "Bir seçenek belirleyin.", [
      {
        text: "Fotoğraf Çek",
        onPress: () => handleImageSelection(false, true),
      },
      {
        text: "Galeriden Seç",
        onPress: () => handleImageSelection(false, false),
      },
      { text: "İptal", style: "cancel" },
    ]);
  };

  const handleCoverPhotoPress = () => {
    Alert.alert("Kapak Fotoğrafı Seç", "Bir seçenek belirleyin.", [
      { text: "Fotoğraf Çek", onPress: () => handleImageSelection(true, true) },
      {
        text: "Galeriden Seç",
        onPress: () => handleImageSelection(true, false),
      },
      { text: "İptal", style: "cancel" },
    ]);
  };

  // --- VERİ ÇEKME ---
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const token = await AsyncStorage.getItem("token");

        const response = await api().get("/profile/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setProfile(response.data);
      } catch (error) {
        console.log("Profil çekme hatası:", error);
        Alert.alert("Hata", "Profil bilgileri alınamadı.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  // --- YÜKLENİYOR VE BOŞ DURUM EKRANLARI ---
  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#17181a",
        }}
      >
        <ActivityIndicator size="large" color="#a8732b" />
      </View>
    );
  }

  if (!profile) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#17181a",
        }}
      >
        <Text style={{ color: "white" }}>Veri bulunamadı.</Text>
      </View>
    );
  }

  // --- ARAYÜZ (UI) ---
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.coverWrap}>
          <Pressable style={{ flex: 1 }} onPress={handleCoverPhotoPress}>
            <Image
              source={
                profile?.coverPhoto
                  ? { uri: getSecureImageUrl(profile.coverPhoto) }
                  : coverImage
              }
              style={styles.coverImage}
              contentFit="cover"
              transition={200}
            />
          </Pressable>
          <Pressable style={styles.settingsButton}>
            <Text style={styles.settingsText}>⚙</Text>
          </Pressable>
        </View>

        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Pressable
              onPress={handleProfilePhotoPress}
              style={{ width: "100%", height: "100%" }}
            >
              <Image
                source={
                  profile?.profilePhoto
                    ? { uri: getSecureImageUrl(profile.profilePhoto) }
                    : avatarImage
                }
                style={styles.avatarImage}
                contentFit="cover"
                transition={200}
              />
            </Pressable>
          </View>

          <View style={styles.identity}>
            <View style={styles.nameRow}>
              <Text style={styles.name}>{profile.name}</Text>
              <Pressable
                style={styles.editButton}
                onPress={() => router.push("/edit-profile")}
              >
                <Text style={styles.editText}>Profili Düzenle</Text>
              </Pressable>
            </View>

            <Text style={styles.username}>{profile.username}</Text>

            <View style={styles.followRow}>
              <Text style={styles.followNumber}>{profile.followerCount}</Text>
              <Text style={styles.followLabel}> Takipçi</Text>
              <Text style={styles.followNumber}> {profile.followingCount}</Text>
              <Text style={styles.followLabel}> Takip Edilen</Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Garajım</Text>
            <Text style={styles.chevron}>›</Text>
          </View>

          <View style={styles.garageRow}>
            {profile.garage && profile.garage.length > 0 ? (
              profile.garage.map((vehicle, index) => (
                <View style={styles.garageItem} key={vehicle.id}>
                  <Image
                    source={
                      vehicle.imageUrl
                        ? { uri: getSecureImageUrl(vehicle.imageUrl) }
                        : index % 2 === 0
                          ? garageOne
                          : garageTwo
                    }
                    style={styles.garageImage}
                    contentFit="cover"
                    transition={200}
                  />
                  <Text style={styles.imageLabel}>
                    {vehicle.brand} {vehicle.model} {vehicle.year}
                    {vehicle.licensePlate ? ` - ${vehicle.licensePlate}` : ""}
                  </Text>
                </View>
              ))
            ) : (
              <Text style={{ color: "#a9a9ae", marginLeft: 10 }}>
                Garajınızda henüz araç yok.
              </Text>
            )}
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Gönderiler</Text>
            <Text style={styles.chevron}>›</Text>
          </View>

          {profile.posts && profile.posts.length > 0 ? (
            profile.posts.map((post) => (
              <PostRow
                key={post.id}
                image={
                  post.postPhoto // Backend'den DTO ile "postPhoto" adıyla gelmeli
                    ? { uri: getSecureImageUrl(post.postPhoto) }
                    : postImage
                }
                title={post.content}
                time={post.time}
                likes={post.likesCount.toString()}
                comments={post.commentsCount.toString()}
              />
            ))
          ) : (
            <Text
              style={{ color: "#a9a9ae", marginLeft: 10, marginBottom: 10 }}
            >
              Henüz bir gönderi paylaşmadınız.
            </Text>
          )}
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Rotalar</Text>
            <Text style={styles.chevron}>›</Text>
          </View>

          {profile.routes && profile.routes.length > 0 ? (
            profile.routes.map((route) => (
              <RouteRow
                key={route.id}
                title={route.title}
                detail={route.detail}
                duration={route.duration}
                distance={route.distance}
              />
            ))
          ) : (
            <Text
              style={{ color: "#a9a9ae", marginLeft: 10, marginBottom: 10 }}
            >
              Henüz bir rota oluşturmadınız.
            </Text>
          )}
        </View>
        <Pressable
          style={styles.featureCard}
          onPress={() =>
            AsyncStorage.removeItem("token").then(() => router.push("/"))
          }
        >
          <Text style={styles.featureTitle}>Çıkış Yap</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function PostRow({
  image,
  title,
  time,
  likes,
  comments,
}: {
  image: ImageSourcePropType;
  title: string;
  time: string;
  likes: string;
  comments: string;
}) {
  return (
    <View style={styles.postRow}>
      <Image source={image} style={styles.postImage} />
      <View style={styles.postTextBox}>
        <Text style={styles.rowTitle}>{title}</Text>
        <Text style={styles.rowDetail}>{time}</Text>
      </View>
      <Text style={styles.metricText}>{likes} ♡</Text>
      <Text style={styles.metricText}>{comments} ▱</Text>
    </View>
  );
}

function RouteRow({
  title,
  detail,
  duration,
  distance,
}: {
  title: string;
  detail: string;
  duration: number;
  distance: number;
}) {
  return (
    <View style={styles.routeRow}>
      <View style={styles.routeTextBox}>
        <Text style={styles.rowTitle}>{title}</Text>
        <Text style={styles.metricText}>
          {duration} saat · {distance} km
        </Text>
        <Text style={styles.metricText}>{}</Text>
        <Text style={styles.rowDetail}>{detail}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#17181a",
  },
  scrollContent: {
    backgroundColor: "#17181a",
    paddingBottom: 18,
  },
  coverWrap: {
    height: 170,
  },
  coverImage: {
    height: "100%",
    width: "100%",
  },
  settingsButton: {
    alignItems: "center",
    borderRadius: 8,
    height: 34,
    justifyContent: "center",
    position: "absolute",
    right: 12,
    top: 10,
    width: 34,
  },
  settingsText: {
    color: "#202124",
    fontSize: 25,
    fontWeight: "800",
  },
  profileHeader: {
    alignItems: "center",
    flexDirection: "row",
    marginTop: -44,
    paddingHorizontal: 30,
    paddingBottom: 14,
  },
  avatar: {
    alignItems: "center",
    backgroundColor: "#eeeeee",
    borderColor: "#111213",
    borderRadius: 8,
    borderWidth: 2,
    height: 84,
    justifyContent: "center",
    overflow: "hidden",
    width: 84,
  },
  avatarImage: {
    height: "100%",
    width: "100%",
  },
  identity: {
    flex: 1,
    marginLeft: 10,
    marginTop: 28,
  },
  nameRow: {
    alignItems: "center",
    flexDirection: "row",
  },
  name: {
    color: "#f0f0f1",
    fontSize: 20,
    fontWeight: "800",
    marginRight: 10,
  },
  editButton: {
    backgroundColor: "#56565c",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  editText: {
    color: "#f5f5f5",
    fontSize: 11,
    fontWeight: "800",
  },
  username: {
    color: "#a9a9ae",
    fontSize: 12,
    marginBottom: 2,
  },
  followRow: {
    alignItems: "center",
    flexDirection: "row",
  },
  followNumber: {
    color: "#f3f3f3",
    fontSize: 19,
    fontWeight: "800",
  },
  followLabel: {
    color: "#d5d5d8",
    fontSize: 17,
  },
  card: {
    backgroundColor: "#34353c",
    borderRadius: 8,
    marginHorizontal: 20,
    marginBottom: 12,
    paddingBottom: 14,
    paddingHorizontal: 14,
    paddingTop: 10,
  },
  cardHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  cardTitle: {
    color: "#f2f2f2",
    fontSize: 17,
    fontWeight: "800",
  },
  chevron: {
    color: "#17181a",
    fontSize: 30,
    fontWeight: "800",
    lineHeight: 30,
  },
  garageRow: {
    flexDirection: "row",
    gap: 12,
  },
  garageItem: {
    flex: 1,
  },
  garageImage: {
    borderRadius: 8,
    height: 78,
    width: "100%",
  },
  imageLabel: {
    color: "#eeeeee",
    fontSize: 12,
    fontWeight: "800",
    marginTop: -18,
    paddingLeft: 10,
  },
  postRow: {
    alignItems: "center",
    flexDirection: "row",
    marginBottom: 14,
  },
  postImage: {
    borderRadius: 8,
    height: 44,
    width: 72,
  },
  postTextBox: {
    flex: 1,
    marginLeft: 10,
  },
  rowTitle: {
    color: "#f0f0f1",
    fontSize: 13,
    fontWeight: "800",
    marginBottom: 4,
  },
  rowDetail: {
    color: "#c3c3c8",
    fontSize: 12,
    fontWeight: "700",
  },
  metricText: {
    color: "#d1d1d5",
    fontSize: 12,
    fontWeight: "800",
    marginLeft: 12,
  },
  routeRow: {
    alignItems: "center",
    flexDirection: "row",
    marginBottom: 12,
  },
  routeImage: {
    borderRadius: 8,
    height: 50,
    width: 76,
  },
  routeTextBox: {
    flex: 1,
    marginLeft: 12,
  },
  featureCard: {
    backgroundColor: "#ff0000",
    borderRadius: 8,
    marginHorizontal: 150,
    marginVertical: 12,
    padding: 14,
  },
  featureTitle: {
    color: "#f2f2f2",
    fontSize: 14,
    fontWeight: "800",
    alignSelf: "center",
  },
});
