import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import moment from "moment";
import { useEffect, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useWorkEntries } from "../../src/context/WorkEntriesContext";
import { steampunkTheme } from "../../src/theme/steampunk";
import { getMonthEntries } from "../../src/utils/database";
import { calculateTimes } from "../../src/utils/timeCalculations";

export default function Index() {
  const navigation = useNavigation();
  const [currentDate] = useState(moment());
  const [calendarData, setCalendarData] = useState([]);
  const [monthStats, setMonthStats] = useState({
    totalDays: 0,
    completedDays: 0,
    positiveBalance: 0,
    negativeBalance: 0,
    monthlyBalance: "00:00",
  });
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

  const isCurrentDay = (date) => {
    return date && date.format("YYYY-MM-DD") === moment().format("YYYY-MM-DD");
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

  const loadMonthStats = async () => {
    try {
      const yearMonth = currentDate.format("YYYY-MM");
      const entries = await getMonthEntries(yearMonth);

      const stats = entries.reduce(
        (acc, entry) => {
          if (!entry.start_time || !entry.end_time) return acc;

          const { deltaTime } = calculateTimes({
            start_time: moment(entry.start_time, "HH:mm"),
            pause_start: entry.pause_start
              ? moment(entry.pause_start, "HH:mm")
              : null,
            pause_end: entry.pause_end
              ? moment(entry.pause_end, "HH:mm")
              : null,
            end_time: moment(entry.end_time, "HH:mm"),
          });

          acc.completedDays++;
          if (deltaTime.startsWith("-")) acc.negativeBalance++;
          else acc.positiveBalance++;

          return acc;
        },
        { completedDays: 0, positiveBalance: 0, negativeBalance: 0 }
      );

      setMonthStats(stats);
    } catch (error) {
      console.error("Error loading month stats:", error);
    }
  };

  useEffect(() => {
    loadCalendarData();
    loadMonthStats();
  }, [currentDate, shouldRefresh]);

  const weekDays = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];

  return (
    <LinearGradient
      colors={steampunkTheme.colors.background.gradient}
      className="flex-1"
    >
      <ScrollView className="flex-1 p-4">
        {/* App Title */}
        <BlurView
          intensity={steampunkTheme.components.card.blur}
          className={`${steampunkTheme.components.card.base} mb-6 py-8`}
        >
          <Text className="text-[#CD8032] text-4xl font-bold text-center font-steampunk tracking-widest">
            BADGETIME
          </Text>
        </BlurView>

        {/* Stats Cards */}
        <View className="flex-row gap-4 mb-6">
          <BlurView
            intensity={steampunkTheme.components.card.blur}
            className={`${steampunkTheme.components.card.base} flex-1 p-4`}
          >
            <View className="items-center">
              <Feather name="calendar" size={24} color="#CD8032" />
              <Text className="text-[#CD8032] text-sm mt-2">
                Jours travaillés
              </Text>
              <Text className="text-[#FFC107] text-2xl font-bold mt-1">
                {monthStats.completedDays}
              </Text>
            </View>
          </BlurView>

          <BlurView
            intensity={steampunkTheme.components.card.blur}
            className={`${steampunkTheme.components.card.base} flex-1 p-4`}
          >
            <View className="items-center">
              <Feather name="clock" size={24} color="#CD8032" />
              <Text className="text-[#CD8032] text-sm mt-2">Heures +/-</Text>
              <View className="flex-row items-center gap-2 mt-1">
                <Text className="text-green-500 text-lg">
                  {monthStats.positiveBalance}
                </Text>
                <Text className="text-[#CD8032]">/</Text>
                <Text className="text-red-500 text-lg">
                  {monthStats.negativeBalance}
                </Text>
              </View>
            </View>
          </BlurView>
        </View>

        {/* Today's Badge Time */}
        <BlurView
          intensity={steampunkTheme.components.card.blur}
          className={`${steampunkTheme.components.card.base} mb-6 p-4`}
        >
          <View className="flex-row justify-between items-center">
            <View>
              <Text className="text-[#CD8032] text-sm">Aujourd'hui</Text>
              <Text className="text-[#FFC107] text-lg font-bold mt-1">
                {moment().format("dddd D MMMM").toUpperCase()}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => navigation.navigate("daily")}
              className="bg-[#CD8032] px-4 py-2 rounded-lg"
            >
              <Text className="text-white">Voir détails</Text>
            </TouchableOpacity>
          </View>
        </BlurView>

        {/* Garder uniquement le calendrier manuel et supprimer le CustomCalendar */}
        <BlurView
          intensity={steampunkTheme.components.card.blur}
          className={`${steampunkTheme.components.card.base} mb-6 p-4`}
        >
          <Text className="text-[#CD8032] text-xl font-bold mb-6 font-steampunk">
            {currentDate.format("MMMM YYYY").toUpperCase()}
          </Text>

          <View className="flex-row mb-4">
            {weekDays.map((day, index) => (
              <View key={day} className="flex-1">
                <Text
                  className={`text-center text-sm font-steampunk ${
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
                          isCurrentDay(day.date)
                            ? "border-2 border-red-500"
                            : day.hasData
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
