import { Colors } from "@/src/constant/colors";
import notifee from "@notifee/react-native";
import * as Notifications from "expo-notifications";
import { Stack } from "expo-router";
import { StatusBar, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

//Lib
import { useNotificationHandler } from "@/src/hooks/useNotification";

// ✅ WAJIB: di luar component
Notifications.setNotificationHandler({
  handleNotification:
    async (): Promise<Notifications.NotificationBehavior> => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
});

notifee.registerForegroundService(() => {
  return new Promise(() => {
    console.log("CALLED FOREGROUND SERVICE NOTIFEE");
  });
});

export default function RootLayout() {
  const insets = useSafeAreaInsets();
  useNotificationHandler();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
      </Stack>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
});
