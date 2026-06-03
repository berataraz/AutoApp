import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

export default function AddCar() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}>
        <Pressable style={styles.homeButton} onPress={() => router.replace("/home")}>
          <Ionicons name="home-outline" size={20} color="#202124" />
        </Pressable>

        <Text style={styles.title}>Araç Ekle</Text>
        <Field label="Marka seç" placeholder="Marka Seç" />
        <Field label="Model seç" placeholder="Model Seç" />
        <Field label="Yıl seç" placeholder="Yıl Seç" />
        <Field label="Plaka Numarası (Opsiyonel)" placeholder="Plaka Yaz" />
        <Field label="Araç Rengi Seçiniz" placeholder="Renk Seç" />

        <View style={styles.field}>
          <Text style={styles.label}>Araç Resmi Ekleyiniz</Text>
          <Pressable style={styles.selectButton}>
            <Text style={styles.selectButtonText}>Resim Seç</Text>
          </Pressable>
        </View>

        <Pressable style={styles.saveButton} onPress={() => router.push("/vehicle-detail")}>
          <Text style={styles.saveButtonText}>Araç Kaydet</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function Field({ label, placeholder }: { label: string; placeholder: string }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        placeholder={placeholder}
        placeholderTextColor="#6f7075"
        style={styles.input}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#242426" },
  content: { flex: 1, paddingHorizontal: 32, paddingTop: 46 },
  homeButton: {
    alignItems: "center",
    alignSelf: "flex-end",
    backgroundColor: "#f4f4f4",
    borderRadius: 18,
    height: 36,
    justifyContent: "center",
    marginBottom: 6,
    width: 36,
  },
  title: { color: "#f2f2f4", fontSize: 36, fontWeight: "800", marginBottom: 26 },
  field: { marginBottom: 14 },
  label: { color: "#e7e7e9", fontSize: 18, fontWeight: "800", marginBottom: 8, paddingLeft: 14 },
  input: {
    backgroundColor: "#0c0c0e",
    borderRadius: 8,
    color: "#f5f5f5",
    fontSize: 16,
    height: 46,
    paddingHorizontal: 18,
  },
  selectButton: {
    alignItems: "center",
    backgroundColor: "#c77d2b",
    borderRadius: 8,
    height: 44,
    justifyContent: "center",
    width: 116,
  },
  selectButtonText: { color: "#f7f7f7", fontSize: 14, fontWeight: "700" },
  saveButton: {
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: "#c77d2b",
    borderRadius: 8,
    height: 46,
    justifyContent: "center",
    marginTop: 42,
    width: 180,
  },
  saveButtonText: { color: "#f7f7f7", fontSize: 16, fontWeight: "700" },
});
