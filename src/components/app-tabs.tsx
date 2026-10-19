import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function AppTabs() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#32AF6A",
        tabBarInactiveTintColor: "#999999",

        tabBarStyle: {
          backgroundColor: "#272727",
          borderTopColor: "#444444",
          height: 65,
          paddingTop: 8,
          paddingBottom: 8,
        },

        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Início",
          tabBarIcon: ({ size }) => (
            <Ionicons
              name="home-outline"
              size={size}
              color="#32AF6A"
            />
          ),
        }}
      />

      <Tabs.Screen
        name="vehicles"
        options={{
          title: "Veículos",
          tabBarIcon: ({ size }) => (
            <Ionicons
              name="car-outline"
              size={size}
              color="#32AF6A"
            />
          ),
        }}
      />

      <Tabs.Screen
        name="maintenance"
        options={{
          title: "Manutenções",
          tabBarIcon: ({ size }) => (
            <Ionicons
              name="construct-outline"
              size={size}
              color="#32AF6A"
            />
          ),
        }}
      />
    </Tabs>
  );
}