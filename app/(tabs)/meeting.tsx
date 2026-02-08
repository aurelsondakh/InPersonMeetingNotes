import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  SectionList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

//services
import { fetchMeetings } from "@/src/services/meetingService";

//types
import { Meeting } from "@/src/types";

//Lib
import { formatDate } from "@/src/lib/helper/formatDate";
import { registerForPushNotificationsAsync } from "@/src/lib/helper/pushNotificationService";

//Constant
import { Colors } from "@/src/constant/colors";

const groupMeetingsByDate = (meetings: Meeting[]) => {
  const grouped: Record<string, Meeting[]> = {};
  meetings.forEach((m) => {
    const date = formatDate(m.created_at);
    if (!grouped[date]) grouped[date] = [];
    grouped[date].push(m);
  });
  return Object.keys(grouped)
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
    .map((date) => ({ title: date, data: grouped[date] }));
};

const MeetingPage = () => {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [expoPushToken, setExpoPushToken] = useState<string>("");
  const router = useRouter();

  const loadMeetings = async () => {
    setError(null);
    try {
      setLoading(true);
      const data = await fetchMeetings(expoPushToken);
      setMeetings(data || []);
    } catch (err: any) {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    registerForPushNotificationsAsync().then((token) => {
      console.log("token");
      if (token) setExpoPushToken(token);
    });
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (!expoPushToken) return;

      loadMeetings();

      // optional cleanup
      return () => {};
    }, [expoPushToken]),
  );

  const goToDetail = (id: string) => {
    router.push(`/(meeting)/${id}`);
  };

  const renderMeetingItem = ({ item }: { item: Meeting }) => {
    const statusColor = item.status === "ready" ? Colors.green : Colors.orange;

    return (
      <TouchableOpacity style={styles.card} onPress={() => goToDetail(item.id)}>
        <View style={styles.cardHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>{item.id}</Text>
            <Text style={styles.timeText}>
              {new Date(item.created_at).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderSectionHeader = ({ section }: any) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionHeaderText}>{section.title}</Text>
    </View>
  );

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
        <TouchableOpacity style={styles.retryButton} onPress={loadMeetings}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const sections = groupMeetingsByDate(meetings);

  return (
    <View style={styles.container}>
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderItem={renderMeetingItem}
        renderSectionHeader={renderSectionHeader}
        ListEmptyComponent={
          <View style={styles.center}>
            <Text>No meetings found.</Text>
          </View>
        }
        contentContainerStyle={
          meetings.length === 0 ? styles.flatListEmpty : { paddingBottom: 20 }
        }
      />
    </View>
  );
};

export default MeetingPage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.lightWhite,
    paddingHorizontal: 12,
  },
  center: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: Colors.red,
    fontSize: 16,
    marginBottom: 12,
  },
  retryButton: {
    backgroundColor: Colors.primaryBlue,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryText: {
    color: Colors.white,
    fontWeight: "600",
  },
  flatListEmpty: {
    flexGrow: 1,
    justifyContent: "center",
  },
  sectionHeader: {
    backgroundColor: Colors.lightBlue,
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 12,
  },
  sectionHeaderText: {
    fontWeight: "700",
    fontSize: 14,
    color: Colors.primaryBlue,
  },
  card: {
    backgroundColor: Colors.white,
    padding: 16,
    marginVertical: 6,
    borderRadius: 12,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 20,
  },
  title: {
    fontWeight: "600",
    fontSize: 16,
    color: Colors.textPrimary,
  },
  statusBadge: {
    paddingVertical: 2,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  statusText: {
    color: Colors.white,
    fontWeight: "500",
    fontSize: 12,
    textTransform: "capitalize",
  },
  timeText: {
    marginTop: 4,
    fontSize: 12,
    color: Colors.secondaryText,
  },
});
