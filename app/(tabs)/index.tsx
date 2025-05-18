import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import moment from "moment";
import { useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { useWorkEntries } from "../../src/context/WorkEntriesContext";
import { steampunkTheme } from "../../src/theme/steampunk";
import { getMonthEntries } from "../../src/utils/database";
import { calculateTimes } from "../../src/utils/timeCalculations";

export default function Index() {
  const [currentDate] = useState(moment());
  const [calendarData, setCalendarData] = useState([]);
  const { shouldRefresh } = useWorkEntries();

  const getEntryColor = (entry) => {
    if (!entry) return ["#1a0f0a", "#150b07"];
    const times = {
      start_time: entry.start_time ? moment(entry.start_time, "HH:mm") : null,
      pause_start: entry.pause_start
        ? moment(entry.pause_start, "HH:mm")
        : null,
      pause_end: entry.pause_end ? moment(entry.pause_end, "HH:mm") : null,
      end_time: entry.end_time ? moment(entry.end_time, "HH:mm") : null,
    };
    const { deltaTime } = calculateTimes(times);

    if (deltaTime.startsWith("-")) return ["#3D1717", "#2C1010"]; // Rouge pour heures manquantes
    if (deltaTime.startsWith("+")) return ["#173D17", "#102C10"]; // Vert pour heures sup
    return ["#3D2317", "#2C1810"]; // Normal pour journée standard
  };

  const loadCalendarData = async () => {
    try {
      const yearMonth = currentDate.format("YYYY-MM");
      const entries = await getMonthEntries(yearMonth);

      const daysInMonth = currentDate.daysInMonth();
      const firstDay = moment(currentDate).startOf("month");
      const startPadding = firstDay.day();

      const calendar = [];
      let week = new Array(7).fill(null);

      for (let i = 0; i < startPadding; i++) {
        week[i] = null;
      }

      for (let day = 1; day <= daysInMonth; day++) {
        const currentDay = moment(currentDate).date(day);
        const dayOfWeek = currentDay.day();
        const entry = entries.find((e) => moment(e.date).date() === day);

        week[dayOfWeek] = {
          date: currentDay,
          hasData: !!entry,
          isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
          entry: entry,
        };

        if (dayOfWeek === 6 || day === daysInMonth) {
          calendar.push([...week]);
          week = new Array(7).fill(null);
        }
      }

      setCalendarData(calendar);
    } catch (error) {
      console.error("Error loading calendar data:", error);
    }
  };

  useEffect(() => {
    loadCalendarData();
  }, [currentDate, shouldRefresh]);

  const weekDays = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];

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
          <Text className="text-[#CD8032] text-xl font-bold mb-6">
            {currentDate.format("MMMM YYYY").toUpperCase()}
          </Text>

          <View className="flex-row mb-4">
            {weekDays.map((day, index) => (
              <View key={day} className="flex-1">
                <Text
                  className={`text-center text-sm ${
                    index === 0 || index === 6
                      ? "text-red-500/80"
                      : "text-[#CD8032]/60"
                  }`}
                >
                  {day}
                </Text>
              </View>
            ))}
          </View>

          <View className="space-y-2">
            {calendarData.map((week, weekIndex) => (
              <View key={weekIndex} className="flex-row space-x-2">
                {week.map((day, dayIndex) => (
                  <View key={dayIndex} className="flex-1 aspect-square">
                    {day && (
                      <LinearGradient
                        colors={getEntryColor(day.entry)}
                        className={`w-full h-full rounded-lg justify-center items-center border ${
                          day.hasData
                            ? "border-[#CD8032]/30"
                            : "border-[#CD8032]/10"
                        }`}
                      >
                        <Text
                          className={`${
                            day.isWeekend
                              ? "text-red-500/80"
                              : day.hasData
                              ? "text-[#CD8032]"
                              : "text-[#CD8032]/40"
                          }`}
                        >
                          {day.date.date()}
                        </Text>
                      </LinearGradient>
                    )}
                  </View>
                ))}
              </View>
            ))}
          </View>
        </BlurView>
      </ScrollView>
    </LinearGradient>
  );
}
