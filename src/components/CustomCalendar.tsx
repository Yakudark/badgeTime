import moment from "moment";
import { Calendar } from "react-native-calendars";

export const CustomCalendar = ({ markedDates }) => {
  return (
    <Calendar
      current={moment().format("YYYY-MM-DD")}
      markedDates={markedDates}
      enableSwipeMonths
      hideArrows={false}
      firstDay={1}
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
      monthNames={moment.months()}
      dayNames={moment.weekdays()}
      dayNamesShort={moment.weekdaysShort()}
    />
  );
};
