import { Feather, MaterialIcons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import moment from "moment";
import "moment/locale/fr";
import React, { useEffect, useState } from "react";
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useWorkEntries } from "../../src/context/WorkEntriesContext";
import { steampunkTheme } from "../../src/theme/steampunk";
import {
  deleteEntry,
  getEntryByDate,
  getMonthlyTotal,
  initDB,
  saveEntry,
} from "../../src/utils/database";
import {
  calculateTimes,
  formatTimeInput,
} from "../../src/utils/timeCalculations";

moment.locale("fr");

export default function Daily() {
  const { triggerRefresh } = useWorkEntries();
  const [currentDate] = useState(moment());
  const [isEditing, setIsEditing] = useState(false);
  const [isNewEntry, setIsNewEntry] = useState(true);
  const [times, setTimes] = useState({
    start_time: null,
    start_time_input: "",
    pause_start: null,
    pause_start_input: "",
    pause_end: null,
    pause_end_input: "",
    end_time: null,
    end_time_input: "",
  });

  const [calculations, setCalculations] = useState({
    pauseTime: "00:00",
    morningWork: "00:00",
    afternoonWork: "00:00",
    totalWork: "00:00",
    expectedEndTime: "--:--",
    deltaTime: "00:00",
  });

  const [monthlyOvertime, setMonthlyOvertime] = useState("00:00");

  useEffect(() => {
    setCalculations(calculateTimes(times));
  }, [times]);

  const calculateMonthlyTotal = async () => {
    try {
      const yearMonth = currentDate.format("YYYY-MM");
      const entries = await getMonthlyTotal(yearMonth);

      const totalMinutes = entries.reduce((acc, entry) => {
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

      setMonthlyOvertime(
        `${totalMinutes >= 0 ? "+" : ""}${Math.floor(
          Math.abs(totalMinutes) / 60
        )}:${String(Math.abs(totalMinutes) % 60).padStart(2, "0")}`
      );
    } catch (error) {
      console.error("Error calculating monthly total:", error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        await initDB();
        await calculateMonthlyTotal();
        const dateStr = currentDate.format("YYYY-MM-DD");
        const entry = await getEntryByDate(dateStr);

        if (entry) {
          setIsNewEntry(false);
          setTimes({
            start_time: entry.start_time
              ? moment(entry.start_time, "HH:mm")
              : null,
            start_time_input: entry.start_time || "",
            pause_start: entry.pause_start
              ? moment(entry.pause_start, "HH:mm")
              : null,
            pause_start_input: entry.pause_start || "",
            pause_end: entry.pause_end
              ? moment(entry.pause_end, "HH:mm")
              : null,
            pause_end_input: entry.pause_end || "",
            end_time: entry.end_time ? moment(entry.end_time, "HH:mm") : null,
            end_time_input: entry.end_time || "",
          });
        }
      } catch (error) {
        console.error("Error loading data:", error);
      }
    };

    loadData();
  }, []);

  const handleTimeInput = (type, value) => {
    const formattedTime = formatTimeInput(value);

    if (formattedTime.length === 5) {
      const [hours, minutes] = formattedTime.split(":");
      if (parseInt(hours) < 24 && parseInt(minutes) < 60) {
        const newTime = moment()
          .hours(parseInt(hours))
          .minutes(parseInt(minutes));
        setTimes((prev) => ({
          ...prev,
          [type]: newTime,
        }));
      }
    }

    setTimes((prev) => ({
      ...prev,
      [`${type}_input`]: formattedTime,
    }));
  };

  const handleValidate = async () => {
    try {
      const dateStr = currentDate.format("YYYY-MM-DD");
      await saveEntry(dateStr, times);
      setIsEditing(false);
      setIsNewEntry(false);
      await calculateMonthlyTotal();
      triggerRefresh(); // Déclencher la mise à jour
    } catch (error) {
      console.error("Error saving data:", error);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleDelete = async () => {
    try {
      const dateStr = currentDate.format("YYYY-MM-DD");
      await deleteEntry(dateStr);
      setIsNewEntry(true);
      setTimes({
        start_time: null,
        start_time_input: "",
        pause_start: null,
        pause_start_input: "",
        pause_end: null,
        pause_end_input: "",
        end_time: null,
        end_time_input: "",
      });
      await calculateMonthlyTotal();
      triggerRefresh(); // Déclencher la mise à jour
    } catch (error) {
      console.error("Error deleting entry:", error);
    }
  };

  const labels = {
    start_time: "Début",
    pause_start: "Début pause",
    pause_end: "Fin pause",
    end_time: "Départ",
  };

  return (
    <LinearGradient
      colors={steampunkTheme.colors.background.gradient}
      className="flex-1"
    >
      <ScrollView
        className="flex-1"
        contentContainerClassName="p-8 pb-12"
        showsVerticalScrollIndicator={false}
      >
        <BlurView
          intensity={steampunkTheme.components.card.blur}
          className={`${steampunkTheme.components.card.base} mb-10 p-6`}
        >
          <View>
            <View className="flex-row justify-between items-center mb-4">
              <View>
                <Text className="text-[#CD8032] text-sm uppercase tracking-widest">
                  Cumul mensuel du
                </Text>
                <Text className="text-[#B87333] text-base mt-1">
                  {currentDate.format("DD MMMM YYYY").toUpperCase()}
                </Text>
              </View>
              <Text
                className={`text-4xl font-bold ${
                  monthlyOvertime.startsWith("-")
                    ? "text-red-500"
                    : "text-[#FFC107]"
                }`}
              >
                {monthlyOvertime}
              </Text>
            </View>

            {!isEditing && !isNewEntry && (
              <View className="flex-row gap-4 mt-2">
                <TouchableOpacity
                  onPress={handleEdit}
                  className="flex-1 bg-[#3D2317] rounded-lg py-2 px-3 flex-row items-center justify-center border border-[#CD8032]/30"
                >
                  <MaterialIcons name="edit" size={16} color="#CD8032" />
                  <Text className="text-[#CD8032] font-bold ml-2 text-sm uppercase">
                    Modifier
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleDelete}
                  className="flex-1 bg-[#3D2317] rounded-lg py-2 px-3 flex-row items-center justify-center border border-red-500/30"
                >
                  <MaterialIcons
                    name="delete-outline"
                    size={16}
                    color="#DC2626"
                  />
                  <Text className="text-red-500 font-bold ml-2 text-sm uppercase">
                    Supprimer
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </BlurView>

        <BlurView
          intensity={steampunkTheme.components.card.blur}
          className={`${steampunkTheme.components.card.base} mb-10 p-6`}
        >
          <View className="flex-row flex-wrap justify-between gap-4">
            {Object.entries(times)
              .filter(([key]) => !key.endsWith("_input"))
              .map(([key], index) => (
                <View
                  key={key}
                  className="w-[46%] p-4 border border-[#CD8032]/30 rounded-xl"
                >
                  <Text className="text-base font-medium text-[#CD8032] mb-2 text-center">
                    {labels[key]}
                  </Text>
                  <LinearGradient
                    colors={["#3D2317", "#2C1810"]}
                    className="rounded-xl border border-[#CD8032]/30"
                  >
                    <TextInput
                      className="text-base font-bold text-[#FFC107] px-4 py-3 w-full text-center"
                      placeholder="--:--"
                      placeholderTextColor="#614126"
                      value={times[`${key}_input`] || ""}
                      onChangeText={(text) => handleTimeInput(key, text)}
                      keyboardType="numeric"
                      maxLength={5}
                      editable={isEditing || isNewEntry}
                    />
                  </LinearGradient>
                </View>
              ))}
          </View>
        </BlurView>

        <BlurView
          intensity={steampunkTheme.components.card.blur}
          className={`${steampunkTheme.components.card.base} p-6 mb-6`}
        >
          <Text className="text-[#FFC107] text-xl font-bold mb-8 uppercase tracking-wider">
            Calculs mécaniques
          </Text>
          <View className="space-y-6">
            <LinearGradient
              colors={["rgba(205,128,50,0.15)", "rgba(205,128,50,0.0)"]}
              className="rounded-xl p-3 border border-[#CD8032]/30"
            >
              <View className="flex-row justify-between items-center">
                <Text className="text-[#CD8032]/80">Temps de pause</Text>
                <Text className="text-[#FFC107] font-medium text-lg">
                  {calculations.pauseTime}
                </Text>
              </View>
            </LinearGradient>

            <LinearGradient
              colors={["rgba(205,128,50,0.15)", "rgba(205,128,50,0.0)"]}
              className="rounded-xl p-3 border border-[#CD8032]/30"
            >
              <View className="flex-row justify-between items-center">
                <Text className="text-[#CD8032]/80">Travail matin</Text>
                <Text className="text-[#FFC107] font-medium text-lg">
                  {calculations.morningWork}
                </Text>
              </View>
            </LinearGradient>

            <LinearGradient
              colors={["rgba(205,128,50,0.15)", "rgba(205,128,50,0.0)"]}
              className="rounded-xl p-3 border border-[#CD8032]/30"
            >
              <View className="flex-row justify-between items-center">
                <Text className="text-[#CD8032]/80">Travail après-midi</Text>
                <Text className="text-[#FFC107] font-medium text-lg">
                  {calculations.afternoonWork}
                </Text>
              </View>
            </LinearGradient>

            <View className="h-[1px] bg-[#CD8032]/30 my-2" />

            <LinearGradient
              colors={["rgba(205,128,50,0.15)", "rgba(205,128,50,0.0)"]}
              className="rounded-xl p-3 border border-[#CD8032]/30"
            >
              <View className="flex-row justify-between items-center">
                <Text className="text-[#CD8032]/80">Total travaillé</Text>
                <Text className="text-[#FFC107] font-bold text-xl">
                  {calculations.totalWork}
                </Text>
              </View>
            </LinearGradient>

            <LinearGradient
              colors={["rgba(205,128,50,0.15)", "rgba(205,128,50,0.0)"]}
              className="rounded-xl p-3 border border-[#CD8032]/30"
            >
              <View className="flex-row justify-between items-center">
                <Text className="text-[#CD8032]/80">Départ prévu</Text>
                <Text className="text-[#FFC107] font-bold text-xl">
                  {calculations.expectedEndTime}
                </Text>
              </View>
            </LinearGradient>

            <LinearGradient
              colors={[
                calculations.deltaTime.startsWith("-")
                  ? "rgba(220,38,38,0.2)"
                  : "rgba(205,128,50,0.2)",
                "rgba(44,24,16,0.0)",
              ]}
              className="rounded-xl p-4 mt-2 border border-[#CD8032]/30"
            >
              <View className="flex-row justify-between items-center">
                <Text className="text-[#CD8032] font-medium">DIFFÉRENCE</Text>
                <View className="flex-row items-center">
                  <Text
                    className={`font-bold text-xl ${
                      calculations.deltaTime.startsWith("-")
                        ? "text-red-500"
                        : "text-[#FFC107]"
                    }`}
                  >
                    {calculations.deltaTime}
                  </Text>
                  <Feather
                    name={
                      calculations.deltaTime.startsWith("-")
                        ? "minus-circle"
                        : "plus-circle"
                    }
                    size={24}
                    color={
                      calculations.deltaTime.startsWith("-")
                        ? "#DC2626"
                        : "#FFC107"
                    }
                    style={{ marginLeft: 8 }}
                  />
                </View>
              </View>
            </LinearGradient>
          </View>
        </BlurView>

        <View className="space-y-6">
          {(isEditing || isNewEntry) && (
            <TouchableOpacity
              onPress={handleValidate}
              className="bg-[#CD8032] rounded-xl p-5 items-center"
            >
              <Text className="text-white font-bold text-lg uppercase tracking-wider">
                {isNewEntry ? "Valider" : "Mettre à jour"}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </LinearGradient>
  );
}
