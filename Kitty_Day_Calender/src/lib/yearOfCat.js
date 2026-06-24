// Vietnamese zodiac Year of the Cat dates.
// Ranges are YYYYMMDD integers for timezone-safe comparison.
// Source: https://www.catster.com/lifestyle/vietnam-year-of-the-cat/
const YEAR_OF_CAT_RANGES = [
  { startNum: 20230122, endNum: 20240209, calYear: 2023, month: 0, day: 22 }, // Jan 22 2023
  { startNum: 20350208, endNum: 20360127, calYear: 2035, month: 1, day: 8  }, // Feb 8  2035
  { startNum: 20470126, endNum: 20480213, calYear: 2047, month: 0, day: 26 }, // Jan 26 2047
  { startNum: 20590211, endNum: 20600201, calYear: 2059, month: 1, day: 11 }, // Feb 11 2059
  { startNum: 20710131, endNum: 20720218, calYear: 2071, month: 0, day: 31 }, // Jan 31 2071
  { startNum: 20830217, endNum: 20840205, calYear: 2083, month: 1, day: 17 }, // Feb 17 2083
  { startNum: 20950205, endNum: 20960124, calYear: 2095, month: 1, day: 5  }, // Feb 5  2095
]

function todayNum() {
  const t = new Date()
  return t.getFullYear() * 10000 + (t.getMonth() + 1) * 100 + t.getDate()
}

export function isCurrentlyYearOfCat() {
  const n = todayNum()
  return YEAR_OF_CAT_RANGES.some(r => n >= r.startNum && n <= r.endNum)
}

// Returns { month, day, name, kind } if the given calendar year contains
// the start of a Vietnamese Year of the Cat (for CalendarPage holiday display).
export function getYearOfCatHoliday(calYear) {
  const range = YEAR_OF_CAT_RANGES.find(r => r.calYear === calYear)
  if (!range) return null
  return { month: range.month, day: range.day, name: 'Vietnam: Year of the Cat 🐱🎊', kind: 'year-of-cat' }
}
