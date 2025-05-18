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

  const baseDate = moment().startOf('day');
  
  if (times.start_time && times.pause_start) {
    const start = baseDate.clone().hours(times.start_time.hours()).minutes(times.start_time.minutes());
    const pauseStart = baseDate.clone().hours(times.pause_start.hours()).minutes(times.pause_start.minutes());
    morning = pauseStart.diff(start, "minutes");
  }
  
  if (times.pause_start && times.pause_end) {
    const pauseStart = baseDate.clone().hours(times.pause_start.hours()).minutes(times.pause_start.minutes());
    const pauseEnd = baseDate.clone().hours(times.pause_end.hours()).minutes(times.pause_end.minutes());
    pause = pauseEnd.diff(pauseStart, "minutes");
  }
  
  if (times.pause_end && times.end_time) {
    const pauseEnd = baseDate.clone().hours(times.pause_end.hours()).minutes(times.pause_end.minutes());
    const end = baseDate.clone().hours(times.end_time.hours()).minutes(times.end_time.minutes());
    afternoon = end.diff(pauseEnd, "minutes");
  }

  // Convertir chaque période en valeur signée si nécessaire
  if (times.start_time && times.pause_start && times.pause_start < times.start_time) {
    morning = -Math.abs(morning);
  }
  if (times.pause_end && times.end_time && times.end_time < times.pause_end) {
    afternoon = -Math.abs(afternoon);
  }

  // Calculer le total en préservant les signes
  total = morning + afternoon;
  
  // Calculer la différence avec les 7h48 réglementaires
  delta = total - FIXED_WORK_MINUTES;

  if (times.start_time && pause) {
    expectedEnd = baseDate
      .clone()
      .hours(times.start_time.hours())
      .minutes(times.start_time.minutes())
      .add(FIXED_WORK_MINUTES + pause, "minutes")
      .format("HH:mm");
  }

  return {
    pauseTime: minToHHMM(pause),
    morningWork: minToHHMM(morning),
    afternoonWork: minToHHMM(afternoon),
    totalWork: minToHHMM(total),
    expectedEndTime: expectedEnd,
    deltaTime: delta >= 0 ? "+" + minToHHMM(delta) : minToHHMM(delta),
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
