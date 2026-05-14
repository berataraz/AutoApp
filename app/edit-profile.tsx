import api from "@/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

export default function EditProfile() {
  interface Vehicle {
    id: number;
    brand: string;
    model: string;
    year: number;
    licensePlate?: string;
    imageUrl?: string;
  }

  interface UpdateProfileRequest {
    name: string;
    lastName: string;
    email: string;
    phoneNumber: string;
  }

  interface Post {
    id: number;
    content: string;
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
    lastName: string;
    username: string;
    phoneNumber: string;
    email: string;
    profilePhoto: string | null;
    coverPhoto: string | null;
    followerCount: number;
    followingCount: number;
    garage: Vehicle[];
    posts: Post[];
    routes: Route[];
  }
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [UpdateProfile, setUpdateProfile] =
    useState<UpdateProfileRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  const handleUpdate = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("token");

      const response = await api().post(
        "/profile/updateProfile",
        {
          name: name,
          lastName: lastName,
          phoneNumber: phoneNumber,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      Alert.alert("Başarılı", "Profil güncellendi.");
    } catch (error) {
      console.error(error);
      Alert.alert("Hata", "Profil güncellenirken bir sorun oluştu.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        const response = await api().get("/profile/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Veriyi al
        const data = response.data;
        setProfile(data);

        // State'leri güncelle ki kutucuklar dolsun!
        setName(data.name || "");
        setLastName(data.lastName || "");
        setEmail(data.email || "");
        setPhoneNumber(data.phoneNumber || "");
      } catch (error) {
        Alert.alert("Hata", "Profil bilgileri alınamadı.");
      } finally {
        setLoading(false);
      }
    };
    fetchProfileData();
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}>
        <Text style={styles.title}>Profil Düzenle</Text>
        <Text style={styles.sectionTitle}>Kişisel Bilgiler</Text>

        <Field label="Ad" value={name} onChangeText={setName} />
        <Field label="Soyad" value={lastName} onChangeText={setLastName} />
        <Field label="E-posta" value={email} onChangeText={setEmail} />
        <Field
          label="Telefon"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
        />
        <Pressable
          style={styles.wideButton}
          onPress={() => {
            router.push("/add-vehicle");
          }}
        >
          <Text style={styles.buttonText}>Araç Ekle</Text>
        </Pressable>

        <Pressable
          style={styles.saveButton}
          onPress={handleUpdate}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? "Bekleyin..." : "Kaydet"}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function Field({
  label,
  value,
  onChangeText,
  placeholder,
}: {
  label: string;
  value?: string;
  onChangeText: (text: string) => void; 
  placeholder?: string;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#6f7075"
        style={styles.input}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#242528" },
  content: { flex: 1, paddingHorizontal: 34, paddingTop: 54 },
  title: {
    color: "#f3f3f4",
    fontSize: 34,
    fontWeight: "800",
    marginBottom: 30,
  },
  sectionTitle: {
    color: "#f3f3f4",
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 16,
  },
  field: { marginBottom: 16 },
  label: {
    color: "#e7e7e9",
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 8,
    paddingLeft: 14,
  },
  input: {
    backgroundColor: "#0c0c0e",
    borderRadius: 8,
    color: "#f5f5f5",
    fontSize: 16,
    height: 46,
    paddingHorizontal: 18,
  },
  wideButton: {
    alignItems: "center",
    backgroundColor: "#c77d2b",
    borderRadius: 8,
    height: 48,
    justifyContent: "center",
    marginTop: 18,
  },
  saveButton: {
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: "#c77d2b",
    borderRadius: 8,
    height: 44,
    justifyContent: "center",
    marginTop: 84,
    width: 178,
  },
  buttonText: { color: "#f7f7f7", fontSize: 16, fontWeight: "700" },
});
