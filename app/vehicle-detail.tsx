import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  Image,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";

const carImage = require("../assets/images/16.jpeg");

export default function VehicleDetail() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}>
        <Pressable style={styles.homeButton} onPress={() => router.replace("/home")}>
          <Ionicons name="home-outline" size={20} color="#202124" />
        </Pressable>
        <Text style={styles.title}>Aracım</Text>
        <Text style={styles.carName}>Skoda Fabia 1.2 TSI (2016)</Text>

        <View style={styles.summaryCard}>
          <View style={styles.summaryText}>
            <Text style={styles.cardTitle}>ÖZET</Text>
            <Text style={styles.infoText}>Toplam Harcama: ₺6.450</Text>
            <Text style={styles.infoText}>Mevcut Lastik: Kış</Text>
            <Text style={styles.infoText}>Son Bakım: 18/05/2025</Text>
          </View>
          <Image source={carImage} style={styles.carImage} />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Hızlı Aksiyonlar</Text>
          <Action label="Bakım Ekle:" value="Tarih Seç" />
          <Action label="Harcama Ekle:" value="Harcama" />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Lastik Bilgileri</Text>
          <Action label="Son Değişim:" value="12.11.2025" />
          <Action label="Sonraki Değişim:" value="04.06.2026" />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Son İşlemler</Text>
          <Text style={styles.infoText}>Yakıt eklendi - ₺950</Text>
          <Text style={styles.infoText}>Bakım yapıldı - ₺2.300</Text>
          <Text style={styles.infoText}>Lastik değişimi - ₺500</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

function Action({ label, value }: { label: string; value: string }) {
  const router = useRouter();

  return (
    <View style={styles.actionRow}>
      <Text style={styles.actionLabel}>{label}</Text>
      <Pressable style={styles.actionValue} onPress={() => router.push("/add-car")}>
        <Text style={styles.actionValueText}>{value}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#242528" },
  content: { flex: 1, paddingHorizontal: 30, paddingTop: 54 },
  homeButton: {
    alignItems: "center",
    alignSelf: "flex-end",
    backgroundColor: "#f4f4f4",
    borderRadius: 18,
    height: 36,
    justifyContent: "center",
    marginBottom: 8,
    width: 36,
  },
  title: { color: "#f2f2f4", fontSize: 36, fontWeight: "800", marginBottom: 16 },
  carName: { color: "#f2f2f4", fontSize: 21, fontWeight: "800", marginBottom: 10 },
  summaryCard: {
    backgroundColor: "#37383f",
    borderRadius: 8,
    flexDirection: "row",
    minHeight: 116,
    padding: 12,
    marginBottom: 28,
  },
  summaryText: { flex: 1 },
  carImage: {
    alignSelf: "center",
    borderRadius: 8,
    height: 70,
    resizeMode: "contain",
    width: 114,
  },
  card: { backgroundColor: "#37383f", borderRadius: 8, marginBottom: 28, padding: 14 },
  cardTitle: { color: "#f0f0f2", fontSize: 14, fontWeight: "800", marginBottom: 12 },
  infoText: { color: "#e1e1e5", fontSize: 15, lineHeight: 24 },
  actionRow: { alignItems: "center", flexDirection: "row", marginBottom: 12 },
  actionLabel: { color: "#e1e1e5", flex: 1, fontSize: 15 },
  actionValue: {
    alignItems: "center",
    backgroundColor: "#202027",
    borderRadius: 8,
    height: 36,
    justifyContent: "center",
    overflow: "hidden",
    width: 154,
  },
  actionValueText: {
    color: "#f3f3f5",
    fontSize: 16,
    fontWeight: "800",
  },
});
