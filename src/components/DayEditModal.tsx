import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import moment from "moment";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useWorkEntries } from "../context/WorkEntriesContext";
import { steampunkTheme } from "../theme/steampunk";
import { deleteEntry, saveEntry } from "../utils/database";
import { formatTimeInput } from "../utils/timeCalculations";

export const DayEditModal = ({ visible, onClose, date, entry, onSave }) => {
  const { triggerRefresh } = useWorkEntries();
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

  useEffect(() => {
    if (visible && entry) {
      setTimes({
        start_time: entry.start_time ? moment(entry.start_time, "HH:mm") : null,
        start_time_input: entry.start_time || "",
        pause_start: entry.pause_start
          ? moment(entry.pause_start, "HH:mm")
          : null,
        pause_start_input: entry.pause_start || "",
        pause_end: entry.pause_end ? moment(entry.pause_end, "HH:mm") : null,
        pause_end_input: entry.pause_end || "",
        end_time: entry.end_time ? moment(entry.end_time, "HH:mm") : null,
        end_time_input: entry.end_time || "",
      });
    }
  }, [visible, entry]);

  const handleTimeInput = (type, value) => {
    const formattedTime = formatTimeInput(value);
    if (formattedTime.length === 5) {
      const [hours, minutes] = formattedTime.split(":");
      if (parseInt(hours) < 24 && parseInt(minutes) < 60) {
        const newTime = moment()
          .hours(parseInt(hours))
          .minutes(parseInt(minutes));
        setTimes((prev) => ({ ...prev, [type]: newTime }));
      }
    }
    setTimes((prev) => ({ ...prev, [`${type}_input`]: formattedTime }));
  };

  const handleSave = async () => {
    try {
      await saveEntry(date, times);
      triggerRefresh();
      onSave?.();
      onClose();
    } catch (error) {
      console.error("Error saving entry:", error);
    }
  };

  const handleDelete = async () => {
    Alert.alert(
      "Supprimer les données",
      "Êtes-vous sûr de vouloir supprimer les données de cette journée ?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteEntry(date);
              triggerRefresh();
              onSave?.();
              onClose();
            } catch (error) {
              console.error("Error deleting entry:", error);
            }
          },
        },
      ]
    );
  };

  const labels = {
    start_time: "Début",
    pause_start: "Début pause",
    pause_end: "Fin pause",
    end_time: "Départ",
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={{ flex: 1, backgroundColor: "rgba(0, 0, 0, 0.85)" }}>
        <View className="flex-1 px-4 justify-center items-center">
          <View className="w-full px-4">
            <View
              className={`${steampunkTheme.components.card.base} rounded-2xl overflow-hidden bg-[#1a0f0a]`}
            >
              <ScrollView className="px-6 py-8">
                <View className="flex-row justify-between items-center mb-8">
                  <Text className="text-[#CD8032] text-xl font-bold">
                    {moment(date).format("dddd D MMMM").toUpperCase()}
                  </Text>
                  {entry && (
                    <TouchableOpacity onPress={handleDelete} className="p-2">
                      <MaterialIcons
                        name="delete-outline"
                        size={24}
                        color="#DC2626"
                      />
                    </TouchableOpacity>
                  )}
                </View>

                <View className="space-y-6 mb-8">
                  {Object.entries(times)
                    .filter(([key]) => !key.endsWith("_input"))
                    .map(([key]) => (
                      <View key={key} className="w-full">
                        <Text className="text-[#CD8032] mb-3 text-base">
                          {labels[key]}
                        </Text>
                        <LinearGradient
                          colors={["#3D2317", "#2C1810"]}
                          className="rounded-xl border border-[#CD8032]/30"
                        >
                          <TextInput
                            className="text-[#FFC107] text-lg px-4 py-4 text-center"
                            value={times[`${key}_input`]}
                            onChangeText={(text) => handleTimeInput(key, text)}
                            placeholder="--:--"
                            placeholderTextColor="#614126"
                            keyboardType="numeric"
                            maxLength={5}
                          />
                        </LinearGradient>
                      </View>
                    ))}
                </View>

                <View className="space-y-6 mt-8 pt-4 border-t border-[#CD8032]/20">
                  <View className="items-center">
                    <TouchableOpacity
                      onPress={handleSave}
                      className="bg-[#CD8032] w-48 py-4 rounded-xl items-center mb-4"
                    >
                      <Text className="text-white font-medium text-base">
                        Enregistrer
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={onClose}
                      className="bg-[#3D2317] w-48 py-4 rounded-xl items-center border border-[#CD8032]/30"
                    >
                      <Text className="text-[#CD8032] font-medium text-base">
                        Annuler
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </ScrollView>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};
