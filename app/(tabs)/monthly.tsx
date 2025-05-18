import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { DayEditModal } from "../../src/components/DayEditModal";
import { useWorkEntries } from "../../src/context/WorkEntriesContext";
import { steampunkTheme } from "../../src/theme/steampunk";
import { getMonthEntries, resetDB } from "../../src/utils/database";
import { calculateTimes } from "../../src/utils/timeCalculations";

const Monthly = () => {
  const { shouldRefresh, triggerRefresh } = useWorkEntries();
  const [currentDate] = useState(moment());
  const [entries, setEntries] = useState([]);
  const [monthlyTotal, setMonthlyTotal] = useState("00:00");
  const [allDays, setAllDays] = useState([]);
  const [selectedDay, setSelectedDay] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const loadMonthData = async () => {
    try {
      const yearMonth = currentDate.format("YYYY-MM");
      const monthData = await getMonthEntries(yearMonth);
      setEntries(monthData);

      // Calcul du total mensuel
      let totalMinutes = 0;

      monthData.forEach((entry) => {
        if (!entry.start_time || !entry.end_time) return;

        const dayTimes = {
          start_time: moment(entry.start_time, "HH:mm"),
          pause_start: entry.pause_start
            ? moment(entry.pause_start, "HH:mm")
            : null,
          pause_end: entry.pause_end ? moment(entry.pause_end, "HH:mm") : null,
          end_time: moment(entry.end_time, "HH:mm"),
        };

        const { deltaTime } = calculateTimes(dayTimes);
        const [hourStr, minuteStr] = deltaTime.replace(/[+]/, "").split(":");
        const hours = parseInt(hourStr);
        const minutes = parseInt(minuteStr);

        const dayMinutes =
          (Math.abs(hours) * 60 + minutes) * (hours < 0 ? -1 : 1);
        totalMinutes += dayMinutes;
      });

      // Formatage du résultat
      const sign = totalMinutes >= 0 ? "+" : "-";
      const absMinutes = Math.abs(totalMinutes);
      const hours = Math.floor(absMinutes / 60);
      const minutes = absMinutes % 60;

      setMonthlyTotal(
        `${sign}${hours.toString().padStart(2, "0")}:${minutes
          .toString()
          .padStart(2, "0")}`
      );

      // Créer un tableau de tous les jours du mois
      const daysInMonth = currentDate.daysInMonth();
      const allMonthDays = Array.from({ length: daysInMonth }, (_, i) => {
        const day = moment(currentDate).date(i + 1);
        const existingEntry = monthData.find(
          (entry) => moment(entry.date).date() === day.date()
        );
        return {
          date: day.format("YYYY-MM-DD"),
          ...existingEntry,
        };
      });
      setAllDays(allMonthDays);
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

  const handleDayPress = (entry) => {
    setSelectedDay(entry);
    setModalVisible(true);
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
            <Text
              className={`text-2xl font-bold ${
                monthlyTotal.startsWith("-") ? "text-red-500" : "text-[#FFC107]"
              }`}
            >
              {monthlyTotal}
            </Text>
          </View>
        </BlurView>

        {allDays.map((entry) => {
          const isWeekend =
            moment(entry.date).day() === 0 || moment(entry.date).day() === 6;
          return (
            <TouchableOpacity
              key={entry.date}
              onPress={() => handleDayPress(entry)}
            >
              <BlurView
                intensity={steampunkTheme.components.card.blur}
                className={`${steampunkTheme.components.card.base} mb-4 p-4`}
              >
                <View className="flex-row justify-between items-center">
                  <View>
                    <Text
                      className={`font-medium ${
                        isWeekend ? "text-red-500" : "text-[#CD8032]"
                      }`}
                    >
                      {moment(entry.date).format("dddd D").toUpperCase()}
                    </Text>
                    <View className="flex-row space-x-4 mt-2">
                      <Text
                        className={
                          entry.start_time ? "text-[#B87333]" : "text-[#614126]"
                        }
                      >
                        {entry.start_time || "--:--"}
                      </Text>
                      <Text
                        className={
                          entry.end_time ? "text-[#B87333]" : "text-[#614126]"
                        }
                      >
                        {entry.end_time || "--:--"}
                      </Text>
                    </View>
                  </View>
                  <Text
                    className={`text-xl font-bold ${
                      entry.start_time
                        ? calculateTimes({
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
                        : "text-[#614126]"
                    }`}
                  >
                    {entry.start_time
                      ? calculateTimes({
                          start_time: moment(entry.start_time, "HH:mm"),
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
                      : "--:--"}
                  </Text>
                </View>
              </BlurView>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <DayEditModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        date={selectedDay?.date}
        entry={selectedDay}
        onSave={loadMonthData}
      />
    </LinearGradient>
  );
};

export default Monthly;
