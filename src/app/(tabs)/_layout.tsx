import { Tabs } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { ComponentProps } from "react"

import { useAppTheme } from "@/theme/context"

type TabIconName = ComponentProps<typeof Ionicons>["name"]

function getTabIcon(routeName: string, focused: boolean): TabIconName {
  switch (routeName) {
    case "dashboard":
      return focused ? "grid" : "grid-outline"
    case "cards":
      return focused ? "card" : "card-outline"
    case "payments":
      return focused ? "swap-horizontal" : "swap-horizontal-outline"
    case "profile":
      return focused ? "person-circle" : "person-circle-outline"
    default:
      return "ellipse"
  }
}

export default function TabsLayout() {
  const { theme } = useAppTheme()

  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.colors.tint,
        tabBarInactiveTintColor: theme.colors.textDim,
        tabBarStyle: {
          backgroundColor: theme.colors.palette.neutral100,
          borderTopColor: theme.colors.separator,
        },
        tabBarIcon: ({ color, focused, size }) => (
          <Ionicons name={getTabIcon(route.name, focused)} color={color} size={size} />
        ),
      })}
    >
      <Tabs.Screen name="dashboard" options={{ title: "Dashboard" }} />
      <Tabs.Screen name="cards" options={{ title: "Cards" }} />
      <Tabs.Screen name="payments" options={{ title: "Payments" }} />
      <Tabs.Screen name="profile" options={{ title: "Profile" }} />
    </Tabs>
  )
}
