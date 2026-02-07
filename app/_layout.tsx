import { Stack } from "expo-router";
import { ActivityIndicator, StatusBar, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../hooks/useAuth";

export default function RootLayout() {
  const { loading, user } = useAuth();

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" />
        </View>
      </SafeAreaView>
    );
  }

  console.log(user, "INI USER");

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#ffffff"
        hidden={false}
        translucent={false}
      />
      <Stack screenOptions={{ headerShown: false }}>
        {user ? <Stack.Screen name="(auth)" /> : <Stack.Screen name="(auth)" />}
      </Stack>
    </SafeAreaView>
  );
}
