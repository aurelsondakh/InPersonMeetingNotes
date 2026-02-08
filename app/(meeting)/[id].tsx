import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Linking,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

// services
import { fetchMeetingDetail } from "@/src/services/meetingService";

// types
import { Meeting } from "@/src/types";

//constant
import { Colors } from "@/src/constant/colors";

//lib
import { registerForPushNotificationsAsync } from "@/src/lib/helper/pushNotificationService";

const MeetingDetailPage = () => {
  const params = useLocalSearchParams();
  const meetingId = params.id as string;
  const router = useRouter();

  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [expoPushToken, setExpoPushToken] = useState<string>("");

  const loadMeetingDetail = async () => {
    setError(null);
    try {
      setLoading(true);
      const data = await fetchMeetingDetail(meetingId, expoPushToken);
      setMeeting(data);
    } catch (err: any) {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    registerForPushNotificationsAsync().then((token) => {
      console.log("token");
      console.log(meetingId, "meetingId");
      if (token) setExpoPushToken(token);
    });
  }, [meetingId]);

  useEffect(() => {
    if (!expoPushToken) return;
    loadMeetingDetail();
  }, [expoPushToken]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primaryBlue} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={loadMeetingDetail}
        >
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!meeting) {
    return (
      <View style={styles.center}>
        <Text>Meeting not found</Text>
      </View>
    );
  }

  const statusColor = meeting.status === "ready" ? Colors.green : Colors.orange;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={20} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Meeting Detail</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.title}>{meeting.id}</Text>
            <View
              style={[styles.statusBadge, { backgroundColor: statusColor }]}
            >
              <Text style={styles.statusText}>{meeting.status}</Text>
            </View>
          </View>

          <Text style={styles.time}>
            Created At: {new Date(meeting.created_at).toLocaleString()}
          </Text>

          {meeting.audio_url && (
            <TouchableOpacity
              style={styles.audioButton}
              onPress={() => Linking.openURL(meeting.audio_url)}
            >
              <Text style={styles.audioButtonText}>▶ Download Audio</Text>
            </TouchableOpacity>
          )}

          {meeting.transcript && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Transcript:</Text>
              <Text style={styles.sectionContent}>{meeting.transcript}</Text>
            </View>
          )}

          {meeting.summary && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Summary:</Text>
              <Text style={styles.sectionContent}>{meeting.summary}</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default MeetingDetailPage;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F5F5" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  errorText: { color: Colors.red, fontSize: 16, marginBottom: 12 },
  retryButton: {
    backgroundColor: Colors.primaryBlue,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryText: { color: Colors.white, fontWeight: "600" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: Colors.white,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  backButton: { paddingRight: 16 },
  headerTitle: { fontSize: 18, fontWeight: "700", flex: 1 },

  card: {
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 12,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
    gap: 20,
  },
  title: {
    fontWeight: "700",
    fontSize: 16,
    color: Colors.textPrimary,
    flex: 1,
  },
  statusBadge: { paddingVertical: 2, paddingHorizontal: 10, borderRadius: 12 },
  statusText: {
    color: Colors.white,
    fontWeight: "500",
    fontSize: 12,
    textTransform: "capitalize",
  },
  time: { fontSize: 12, color: Colors.secondaryText, marginBottom: 12 },
  audioButton: {
    backgroundColor: Colors.primaryBlue,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: "center",
  },
  audioButtonText: { color: Colors.white, fontWeight: "600" },
  section: { marginBottom: 12 },
  sectionTitle: { fontWeight: "600", fontSize: 14, marginBottom: 4 },
  sectionContent: { fontSize: 14, color: "#424242" },
});
