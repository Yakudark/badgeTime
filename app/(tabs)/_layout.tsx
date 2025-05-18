import { AntDesign, Feather, MaterialIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";
import { steampunkTheme } from "../../src/theme/steampunk";

const _layout = () => {
  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor: steampunkTheme.colors.background.gradient[0],
          borderTopWidth: steampunkTheme.components.tabBar.borderWidth,
          borderTopColor: steampunkTheme.colors.border.primary,
          height: steampunkTheme.components.tabBar.height,
          paddingBottom: 10,
          paddingTop: 10,
        },
        tabBarActiveTintColor: steampunkTheme.colors.text.primary,
        tabBarInactiveTintColor: steampunkTheme.colors.text.secondary,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
          letterSpacing: 1,
        },
        headerStyle: {
          backgroundColor: "#2C1810",
          borderBottomWidth: 2,
          borderBottomColor: "rgba(205,128,50,0.3)",
          height: 100,
        },
        headerTitleStyle: {
          color: "#FFC107",
          fontSize: 20,
          fontWeight: "600",
          letterSpacing: 1,
          textTransform: "uppercase",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <AntDesign name="home" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="daily"
        options={{
          title: "Journalier",
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="calendar-today" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="monthly"
        options={{
          title: "Mensuel",
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <Feather name="calendar" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="annual"
        options={{
          title: "Annuel",
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <AntDesign name="areachart" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
};

export default _layout;
