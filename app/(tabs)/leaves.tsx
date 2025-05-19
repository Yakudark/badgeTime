import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { ScrollView, Text } from "react-native";
import { steampunkTheme } from "../../src/theme/steampunk";

export default function Leaves() {
  return (
    <LinearGradient
      colors={steampunkTheme.colors.background.gradient}
      className="flex-1"
    >
      <ScrollView className="flex-1 p-4">
        <BlurView
          intensity={steampunkTheme.components.card.blur}
          className={`${steampunkTheme.components.card.base} mb-6 p-4`}
        >
          <Text className="text-[#CD8032] text-xl font-bold">
            GESTION DES CONGÉS
          </Text>
        </BlurView>
      </ScrollView>
    </LinearGradient>
  );
}
