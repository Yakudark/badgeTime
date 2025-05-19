import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { Calendar } from "react-native-calendars";
import { useWorkEntries } from "../../src/context/WorkEntriesContext";
import { steampunkTheme } from "../../src/theme/steampunk";
import { getMonthlyTotal, initDB } from "../../src/utils/database";
import { calculateTimes } from "../../src/utils/timeCalculations";

const Annual = () => {
  const [currentDate] = useState(moment());
  const [markedDates, setMarkedDates] = useState({});
  const [yearlyTotal, setYearlyTotal] = useState("00:00");
  const [isLoading, setIsLoading] = useState(true);
  const { shouldRefresh } = useWorkEntries();

  const loadYearData = async () => {
    try {
      setIsLoading(true);
      // Add a small delay to ensure DB is ready
      await new Promise((resolve) => setTimeout(resolve, 100));
      await initDB(); // Initialiser la BD avant toute opération
      let totalMinutes = 0;
      const marked = {};

      // Chargement des données pour chaque mois de l'année
      for (let month = 0; month < 12; month++) {
        const date = moment(currentDate).month(month);
        const yearMonth = date.format("YYYY-MM");
        const entries = await getMonthlyTotal(yearMonth);

        entries.forEach((entry) => {
          if (!entry.start_time || !entry.end_time) return;

          const dayTimes = {
            start_time: moment(entry.start_time, "HH:mm"),
            pause_start: entry.pause_start
              ? moment(entry.pause_start, "HH:mm")
              : null,
            pause_end: entry.pause_end
              ? moment(entry.pause_end, "HH:mm")
              : null,
            end_time: moment(entry.end_time, "HH:mm"),
          };

          const { deltaTime } = calculateTimes(dayTimes);
          const [hourStr, minuteStr] = deltaTime.replace(/[+]/, "").split(":");
          const hours = parseInt(hourStr);
          const minutes = parseInt(minuteStr);

          const dayMinutes =
            (Math.abs(hours) * 60 + minutes) * (hours < 0 ? -1 : 1);
          totalMinutes += dayMinutes;

          // Marquer les jours dans le calendrier
          marked[entry.date] = {
            marked: true,
            dotColor: dayMinutes >= 0 ? "#FFC107" : "#DC2626",
          };
        });
      }

      // Calcul du total annuel
      const sign = totalMinutes >= 0 ? "+" : "-";
      const absMinutes = Math.abs(totalMinutes);
      const hours = Math.floor(absMinutes / 60);
      const minutes = absMinutes % 60;

      setYearlyTotal(
        `${sign}${hours.toString().padStart(2, "0")}:${minutes
          .toString()
          .padStart(2, "0")}`
      );
      setMarkedDates(marked);
    } catch (error) {
      console.error("Error loading year data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const initialize = async () => {
      try {
        await initDB();
        if (isMounted) {
          await loadYearData();
        }
      } catch (error) {
        console.error("Error initializing:", error);
        if (isMounted) {
          // Retry after a delay if initialization fails
          setTimeout(() => initialize(), 500);
        }
      }
    };
    initialize();
    return () => {
      isMounted = false;
    };
  }, [currentDate, shouldRefresh]);

  if (isLoading) {
    return (
      <LinearGradient
        colors={steampunkTheme.colors.background.gradient}
        className="flex-1 justify-center items-center"
      >
        <ActivityIndicator size="large" color="#CD8032" />
      </LinearGradient>
    );
  }

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
            <Text className="text-[#CD8032] text-xl font-bold">
              {currentDate.format("YYYY").toUpperCase()}
            </Text>
            <Text
              className={`text-2xl font-bold ${
                yearlyTotal.startsWith("-") ? "text-red-500" : "text-[#FFC107]"
              }`}
            >
              {yearlyTotal}
            </Text>
          </View>
        </BlurView>

        <BlurView
          intensity={steampunkTheme.components.card.blur}
          className={`${steampunkTheme.components.card.base}`}
        >
          <Calendar
            current={currentDate.format("YYYY-MM-DD")}
            markedDates={markedDates}
            enableSwipeMonths
            hideArrows={false}
            theme={{
              calendarBackground: "transparent",
              textSectionTitleColor: "#CD8032",
              selectedDayBackgroundColor: "#CD8032",
              selectedDayTextColor: "#ffffff",
              todayTextColor: "#FFC107",
              dayTextColor: "#B87333",
              textDisabledColor: "#614126",
              monthTextColor: "#CD8032",
              textMonthFontWeight: "bold",
              arrowColor: "#CD8032",
            }}
          />
        </BlurView>
      </ScrollView>
    </LinearGradient>
  );
};

export default Annual;
