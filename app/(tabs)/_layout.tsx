import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

// Constant
import { Colors } from "@/src/constant/colors";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primaryBlue,
        tabBarStyle: {
          backgroundColor: Colors.white, // warna tab bar hitam
          borderTopWidth: 1, // hilangkan border top
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="meeting"
        options={{
          title: "Meeting",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="list-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
