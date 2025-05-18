import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useWorkEntries } from "../../src/context/WorkEntriesContext";
import { steampunkTheme } from "../../src/theme/steampunk";
import { getMonthEntries, resetDB } from "../../src/utils/database";
import { calculateTimes } from "../../src/utils/timeCalculations";

const Monthly = () => {
  const { shouldRefresh, triggerRefresh } = useWorkEntries();
  const [currentDate] = useState(moment());
  const [entries, setEntries] = useState([]);
  const [monthlyTotal, setMonthlyTotal] = useState("00:00");

  const loadMonthData = async () => {
    try {
      const yearMonth = currentDate.format("YYYY-MM");
      const monthData = await getMonthEntries(yearMonth);
      setEntries(monthData);

      const totalMinutes = monthData.reduce((acc, entry) => {
        const times = {
          start_time: entry.start_time
            ? moment(entry.start_time, "HH:mm")
            : null,
          pause_start: entry.pause_start
            ? moment(entry.pause_start, "HH:mm")
            : null,
          pause_end: entry.pause_end ? moment(entry.pause_end, "HH:mm") : null,
          end_time: entry.end_time ? moment(entry.end_time, "HH:mm") : null,
        };
        const dayCalculations = calculateTimes(times);
        const deltaStr = dayCalculations.deltaTime.replace(/[+]/g, "");
        const [hours, minutes] = deltaStr
          .split(":")
          .map((num) => parseInt(num));
        const deltaMinutes = hours * 60 + minutes;

        return (
          acc +
          (dayCalculations.deltaTime.startsWith("-")
            ? -deltaMinutes
            : deltaMinutes)
        );
      }, 0);

      setMonthlyTotal(
        `${totalMinutes >= 0 ? "+" : ""}${Math.floor(
          Math.abs(totalMinutes) / 60
        )}:${String(Math.abs(totalMinutes) % 60).padStart(2, "0")}`
      );
    } catch (error) {
      console.error("Error loading month data:", error);
    }
  };

  const handleReset = () => {
    Alert.alert(
      "Réinitialiser la base de données",
      "Êtes-vous sûr de vouloir effacer toutes les données ? Cette action est irréversible.",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Effacer",
          style: "destructive",
          onPress: async () => {
            try {
              await resetDB();
              await loadMonthData();
              triggerRefresh();
            } catch (error) {
              console.error("Error resetting database:", error);
            }
          },
        },
      ]
    );
  };

  useEffect(() => {
    loadMonthData();
  }, [currentDate, shouldRefresh]);

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
          <View className="flex-row justify-between items-center">
            <View>
              <Text className="text-[#CD8032] text-xl font-bold">
                {currentDate.format("MMMM YYYY").toUpperCase()}
              </Text>
              <TouchableOpacity onPress={handleReset} className="mt-2">
                <Text className="text-red-500 text-sm">
                  Réinitialiser la base de données
                </Text>
              </TouchableOpacity>
            </View>
            <Text className="text-[#FFC107] text-2xl font-bold">
              {monthlyTotal}
            </Text>
          </View>
        </BlurView>

        {entries.map((entry) => (
          <BlurView
            key={entry.date}
            intensity={steampunkTheme.components.card.blur}
            className={`${steampunkTheme.components.card.base} mb-4 p-4`}
          >
            <View className="flex-row justify-between items-center">
              <View>
                <Text className="text-[#CD8032] font-medium">
                  {moment(entry.date).format("dddd D").toUpperCase()}
                </Text>
                <View className="flex-row space-x-4 mt-2">
                  <Text className="text-[#B87333]">
                    {entry.start_time || "--:--"}
                  </Text>
                  <Text className="text-[#B87333]">
                    {entry.end_time || "--:--"}
                  </Text>
                </View>
              </View>
              <Text
                className={`text-xl font-bold ${
                  calculateTimes({
                    start_time: entry.start_time
                      ? moment(entry.start_time, "HH:mm")
                      : null,
                    pause_start: entry.pause_start
                      ? moment(entry.pause_start, "HH:mm")
                      : null,
                    pause_end: entry.pause_end
                      ? moment(entry.pause_end, "HH:mm")
                      : null,
                    end_time: entry.end_time
                      ? moment(entry.end_time, "HH:mm")
                      : null,
                  }).deltaTime.startsWith("-")
                    ? "text-red-500"
                    : "text-[#FFC107]"
                }`}
              >
                {
                  calculateTimes({
                    start_time: entry.start_time
                      ? moment(entry.start_time, "HH:mm")
                      : null,
                    pause_start: entry.pause_start
                      ? moment(entry.pause_start, "HH:mm")
                      : null,
                    pause_end: entry.pause_end
                      ? moment(entry.pause_end, "HH:mm")
                      : null,
                    end_time: entry.end_time
                      ? moment(entry.end_time, "HH:mm")
                      : null,
                  }).deltaTime
                }
              </Text>
            </View>
          </BlurView>
        ))}
      </ScrollView>
    </LinearGradient>
  );
};

export default Monthly;
