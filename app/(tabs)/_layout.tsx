import Entypo from "@expo/vector-icons/Entypo";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { Tabs } from "expo-router";
import React from "react";

const TabsLayout = () => {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#6200ee",
        headerStyle: { backgroundColor: "#f5f5f5" },
        headerShadowVisible: false,
        tabBarStyle: {
          backgroundColor: "#f5f5f5",
          elevation: 0,
          shadowOpacity: 0,
          borderTopWidth: 0,
        },
        tabBarInactiveTintColor: "#666666",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Today's Habits",
          tabBarIcon: ({ color, size }: { color: string; size: number }) => {
            return <FontAwesome5 name="tasks" size={size} color={color} />;
          },
        }}
      />
      <Tabs.Screen
        name="streaks"
        options={{
          title: "Streaks",
          tabBarIcon: ({ color, size }: { color: string; size: number }) => {
            return <FontAwesome name="tasks" size={size} color={color} />;
          },
        }}
      />
      <Tabs.Screen
        name="add-habit"
        options={{
          title: "Add Habit",
          tabBarIcon: ({ size, color }: { size: number; color: string }) => {
            return <Entypo name="add-to-list" size={size} color={color} />;
          },
        }}
      />
    </Tabs>
  );
};

export default TabsLayout;
