import moment from 'moment';

export const FIXED_WORK_MINUTES = 468; // 7h48 en minutes

export function minToHHMM(mins: number): string {
  const sign = mins < 0 ? "-" : "";
  mins = Math.abs(mins);
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${sign}${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

export function calculateTimes(times: any) {
  let pause = 0,
    morning = 0,
    afternoon = 0,
    total = 0,
    expectedEnd = "--:--",
    delta = 0;

  if (times.start_time && times.pause_start) {
    morning = moment(times.pause_start).diff(moment(times.start_time), "minutes");
  }
  if (times.pause_start && times.pause_end) {
    pause = moment(times.pause_end).diff(moment(times.pause_start), "minutes");
  }
  if (times.pause_end && times.end_time) {
    afternoon = moment(times.end_time).diff(moment(times.pause_end), "minutes");
  }
  
  total = morning + afternoon;
  
  if (times.start_time && pause) {
    expectedEnd = moment(times.start_time)
      .add(FIXED_WORK_MINUTES + pause, "minutes")
      .format("HH:mm");
  }
  
  delta = total - FIXED_WORK_MINUTES;

  return {
    pauseTime: minToHHMM(pause),
    morningWork: minToHHMM(morning),
    afternoonWork: minToHHMM(afternoon),
    totalWork: minToHHMM(total),
    expectedEndTime: expectedEnd,
    deltaTime: (delta >= 0 ? "+" : "") + minToHHMM(delta),
  };
}

export function formatTimeInput(value: string): string {
  const numbers = value.replace(/[^\d]/g, "");
  
  if (numbers.length <= 2) {
    return numbers;
  } else if (numbers.length <= 4) {
    return `${numbers.slice(0, 2)}:${numbers.slice(2)}`;
  }
  return value;
}
