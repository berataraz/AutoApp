import { Ionicons } from "@expo/vector-icons";
import { getActiveVehicle } from "@/services/vehicleService";
import type { Vehicle } from "@/types/domain";
import { useFocusEffect, useRouter } from "expo-router";
import type { ComponentProps } from "react";
import { useCallback, useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const carImage = require("../../assets/images/5.jpg");
const eventImage = require("../../assets/images/33.jpg");

type IconName = ComponentProps<typeof Ionicons>["name"];

const formatTryAmount = (amount?: number | null) => {
  const numericAmount = Number(amount ?? 0);
  const safeAmount = Number.isFinite(numericAmount) ? numericAmount : 0;

  return `\u20ba${safeAmount.toLocaleString("tr-TR", {
    maximumFractionDigits: 2,
  })}`;
};

const formatDisplayDate = (date?: string | null) => {
  if (!date) return "-";

  const [year, month, day] = date.slice(0, 10).split("-");
  if (!year || !month || !day) return date;

  return `${day}/${month}/${year}`;
};

export default function Home() {
  const router = useRouter();
  const [activeVehicle, setActiveVehicle] = useState<Vehicle | null>(null);

  useFocusEffect(
    useCallback(() => {
      const fetchCarData = async () => {
        try {
          const vehicle = await getActiveVehicle();
          console.log("Active Vehicle Data:", vehicle);
          setActiveVehicle(vehicle);
        } catch (error) {
          console.log("Active Vehicle Data error:", error);
        }
      };

      fetchCarData();
    }, []),
  );

  const vehicleTitle = activeVehicle
    ? `${activeVehicle.brand} ${activeVehicle.model}`
    : "Ara\u00e7 se\u00e7ilmedi";

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.headerTextBlock}>
            <Text style={styles.headerKicker}>{"Garaj\u0131n"}</Text>
            <Text style={styles.logo}>AutoTrack</Text>
          </View>

          <View style={styles.headerActions}>
            <IconButton
              icon="person-circle-outline"
              onPress={() => router.push("/profile")}
            />
            <IconButton
              icon="add"
              onPress={() => router.push("/add-vehicle")}
            />
          </View>
        </View>

        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color="#a8abb3" />
          <TextInput
            placeholder={"Kullan\u0131c\u0131, ara\u00e7 veya rota ara"}
            placeholderTextColor="#8f929b"
            style={styles.searchInput}
          />
        </View>

        <View style={styles.sectionBlock}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionLabel}>{"H\u0131zl\u0131 Eri\u015fim"}</Text>
          </View>

          <View style={styles.quickGrid}>
            <QuickAction
              icon="compass-outline"
              title="Ke\u015ffet"
              text="Ara\u00e7lar\u0131 ve rotalar\u0131 bul"
              onPress={() => router.push("/explore")}
            />
            <QuickAction
              icon="newspaper-outline"
              title="G\u00f6nderiler"
              text="Son payla\u015f\u0131mlar\u0131 g\u00f6r"
              onPress={() => router.push("/feed")}
            />
          </View>

          <QuickAction
            icon="people-outline"
            title="Kul\u00fcpler"
            text="Topluluklara ve garajlara bak"
            onPress={() => router.push("/clubs")}
            wide
          />
        </View>

        <Pressable
          style={styles.vehicleCard}
          onPress={() => {
            if (activeVehicle) {
              router.push("/vehicle-detail");
              return;
            }

            router.push("/add-vehicle");
          }}
        >
          <View style={styles.vehicleImageFrame}>
            {activeVehicle?.imageUrl ? (
              <Image
                source={{ uri: activeVehicle.imageUrl }}
                style={styles.vehicleImage}
              />
            ) : (
              <Image source={carImage} style={styles.vehicleImage} />
            )}
          </View>

          <View style={styles.vehicleInfo}>
            <View style={styles.vehicleHeaderRow}>
              <View style={styles.vehicleTitleBlock}>
                <Text style={styles.vehicleEyebrow}>{"Aktif Ara\u00e7"}</Text>
                <Text style={styles.vehicleName} numberOfLines={1}>
                  {vehicleTitle}
                </Text>
              </View>
              <View style={styles.editPill}>
                <Ionicons name="create-outline" size={14} color="#111213" />
                <Text style={styles.editPillText}>
                  {activeVehicle ? "D\u00fczenle" : "Ekle"}
                </Text>
              </View>
            </View>

            <View style={styles.vehicleStatsRow}>
              <VehicleStat
                icon="wallet-outline"
                label="Bu Ay"
                value={formatTryAmount(activeVehicle?.monthlyExpenseTotal)}
              />
              <View style={styles.vehicleDivider} />
              <VehicleStat
                icon="calendar-outline"
                label="Muayene"
                value={formatDisplayDate(
                  activeVehicle?.inspectionAppointmentDate,
                )}
              />
            </View>
          </View>
        </Pressable>

        <Pressable style={styles.activityCard} onPress={() => router.push("/feed")}>
          <View style={styles.activityTextBox}>
            <View style={styles.activityIcon}>
              <Ionicons name="flag-outline" size={18} color="#c47a2d" />
            </View>
            <View style={styles.activityCopy}>
              <Text style={styles.activityTitle}>{"Etkinlikler"}</Text>
              <Text style={styles.activityText} numberOfLines={2}>
                {"Bulu\u015fmalara kat\u0131l, yeni dostluklar kur"}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#8f929b" />
          </View>
          <Image source={eventImage} style={styles.activityImage} />
        </Pressable>

        <View style={styles.reminderCard}>
          <View style={styles.reminderHeader}>
            <Ionicons name="notifications-outline" size={18} color="#c47a2d" />
            <Text style={styles.reminderTitle}>{"Hat\u0131rlatma"}</Text>
          </View>
          <ReminderRow text="Bak\u0131ma 3 g\u00fcn kald\u0131" />
          <ReminderRow text="Track Day etkinli\u011fine 1 hafta kald\u0131" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function IconButton({ icon, onPress }: { icon: IconName; onPress: () => void }) {
  return (
    <Pressable style={styles.iconButton} onPress={onPress}>
      <Ionicons name={icon} size={22} color="#f4f4f6" />
    </Pressable>
  );
}

function QuickAction({
  icon,
  onPress,
  text,
  title,
  wide = false,
}: {
  icon: IconName;
  onPress: () => void;
  text: string;
  title: string;
  wide?: boolean;
}) {
  return (
    <Pressable
      style={[styles.quickAction, wide ? styles.quickActionWide : null]}
      onPress={onPress}
    >
      <View style={styles.quickIconBox}>
        <Ionicons name={icon} size={20} color="#c47a2d" />
      </View>
      <View style={styles.quickTextBlock}>
        <Text style={styles.quickTitle}>{title}</Text>
        <Text style={styles.quickText} numberOfLines={2}>
          {text}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#7f838d" />
    </Pressable>
  );
}

function VehicleStat({
  icon,
  label,
  value,
}: {
  icon: IconName;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.vehicleStat}>
      <View style={styles.vehicleStatLabelRow}>
        <Ionicons name={icon} size={14} color="#8f929b" />
        <Text style={styles.vehicleStatLabel}>{label}</Text>
      </View>
      <Text style={styles.vehicleStatValue} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

function ReminderRow({ text }: { text: string }) {
  return (
    <View style={styles.reminderRow}>
      <View style={styles.reminderDot} />
      <Text style={styles.reminderText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  activityCard: {
    backgroundColor: "#1f2227",
    borderColor: "#2f333b",
    borderRadius: 8,
    borderWidth: 1,
    marginHorizontal: 20,
    marginTop: 16,
    overflow: "hidden",
  },
  activityCopy: {
    flex: 1,
    gap: 3,
  },
  activityIcon: {
    alignItems: "center",
    backgroundColor: "#2b2d32",
    borderRadius: 8,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  activityImage: {
    height: 104,
    width: "100%",
  },
  activityText: {
    color: "#b9bbc2",
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 18,
  },
  activityTextBox: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    padding: 14,
  },
  activityTitle: {
    color: "#f3f4f6",
    fontSize: 17,
    fontWeight: "900",
  },
  editPill: {
    alignItems: "center",
    backgroundColor: "#c47a2d",
    borderRadius: 8,
    flexDirection: "row",
    gap: 5,
    height: 30,
    paddingHorizontal: 9,
  },
  editPillText: {
    color: "#111213",
    fontSize: 12,
    fontWeight: "900",
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: 16,
    paddingHorizontal: 20,
    paddingTop: 18,
  },
  headerActions: {
    flexDirection: "row",
    gap: 10,
  },
  headerKicker: {
    color: "#9da0a8",
    fontSize: 12,
    fontWeight: "800",
    marginBottom: 1,
  },
  headerTextBlock: {
    flex: 1,
  },
  iconButton: {
    alignItems: "center",
    backgroundColor: "#24272e",
    borderColor: "#343842",
    borderRadius: 8,
    borderWidth: 1,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  logo: {
    color: "#f4f4f6",
    fontSize: 28,
    fontWeight: "900",
  },
  quickAction: {
    alignItems: "center",
    backgroundColor: "#1f2227",
    borderColor: "#2f333b",
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    flexDirection: "row",
    gap: 10,
    minHeight: 90,
    padding: 12,
  },
  quickActionWide: {
    marginTop: 10,
  },
  quickGrid: {
    flexDirection: "row",
    gap: 10,
  },
  quickIconBox: {
    alignItems: "center",
    backgroundColor: "#2b2d32",
    borderRadius: 8,
    height: 38,
    justifyContent: "center",
    width: 38,
  },
  quickText: {
    color: "#aeb1ba",
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 16,
  },
  quickTextBlock: {
    flex: 1,
    gap: 3,
    minWidth: 0,
  },
  quickTitle: {
    color: "#f3f4f6",
    fontSize: 15,
    fontWeight: "900",
  },
  reminderCard: {
    backgroundColor: "#111213",
    borderColor: "#24262c",
    borderRadius: 8,
    borderWidth: 1,
    marginHorizontal: 20,
    marginTop: 16,
    padding: 16,
  },
  reminderDot: {
    backgroundColor: "#c47a2d",
    borderRadius: 3,
    height: 6,
    marginTop: 8,
    width: 6,
  },
  reminderHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  reminderRow: {
    flexDirection: "row",
    gap: 9,
    marginTop: 7,
  },
  reminderText: {
    color: "#cfd0d3",
    flex: 1,
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 21,
  },
  reminderTitle: {
    color: "#f4f4f6",
    fontSize: 17,
    fontWeight: "900",
  },
  safeArea: {
    backgroundColor: "#191a1c",
    flex: 1,
  },
  scrollContent: {
    backgroundColor: "#191a1c",
    paddingBottom: 92,
  },
  searchBar: {
    alignItems: "center",
    backgroundColor: "#111213",
    borderColor: "#272a31",
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    gap: 10,
    height: 46,
    marginHorizontal: 20,
    paddingHorizontal: 14,
  },
  searchInput: {
    color: "#ffffff",
    flex: 1,
    fontSize: 14,
    fontWeight: "700",
    height: "100%",
  },
  sectionBlock: {
    marginHorizontal: 20,
    marginTop: 18,
  },
  sectionHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  sectionLabel: {
    color: "#dfe0e4",
    fontSize: 16,
    fontWeight: "900",
  },
  vehicleCard: {
    alignItems: "center",
    backgroundColor: "#111213",
    borderColor: "#2b2e35",
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    gap: 13,
    marginHorizontal: 20,
    marginTop: 18,
    minHeight: 126,
    padding: 12,
  },
  vehicleDivider: {
    backgroundColor: "#30333a",
    height: 42,
    width: 1,
  },
  vehicleEyebrow: {
    color: "#c47a2d",
    fontSize: 11,
    fontWeight: "900",
    marginBottom: 2,
  },
  vehicleHeaderRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 10,
    justifyContent: "space-between",
  },
  vehicleImage: {
    height: "100%",
    width: "100%",
  },
  vehicleImageFrame: {
    backgroundColor: "#24262c",
    borderRadius: 8,
    height: 92,
    overflow: "hidden",
    width: 92,
  },
  vehicleInfo: {
    flex: 1,
    gap: 15,
    minWidth: 0,
  },
  vehicleName: {
    color: "#f0f0f1",
    fontSize: 17,
    fontWeight: "900",
    lineHeight: 21,
  },
  vehicleStat: {
    flex: 1,
    gap: 5,
    minWidth: 0,
  },
  vehicleStatLabel: {
    color: "#8f929b",
    fontSize: 11,
    fontWeight: "900",
  },
  vehicleStatLabelRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 4,
  },
  vehicleStatValue: {
    color: "#e2e4e9",
    fontSize: 14,
    fontWeight: "900",
  },
  vehicleStatsRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 11,
  },
  vehicleTitleBlock: {
    flex: 1,
    minWidth: 0,
  },
});
