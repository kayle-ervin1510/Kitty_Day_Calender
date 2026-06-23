import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import KittyClock from '../components/KittyClock'
import imgNewYears      from '../assets/federal-holidays/new-years-day.png'
import imgMlkDay        from '../assets/federal-holidays/mlk-day.png'
import imgPresidentsDay from '../assets/federal-holidays/presidents-day.png'
import imgMemorialDay   from '../assets/federal-holidays/memorial-day.png'
import imgJuneteenth    from '../assets/federal-holidays/juneteenth.png'
import imgIndependence  from '../assets/federal-holidays/independence-day.png'
import imgLaborDay      from '../assets/federal-holidays/labor-day.png'
import imgColumbusDay   from '../assets/federal-holidays/columbus-day.png'
import imgVeteransDay   from '../assets/federal-holidays/veterans-day.png'
import imgThanksgiving  from '../assets/federal-holidays/thanksgiving.png'
import imgChristmas     from '../assets/federal-holidays/christmas.png'
import oopsCat        from '../assets/oops-cat.png'

function ScratchIcon({ className }) {
  return (
    <svg
      viewBox="0 0 32 32"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <g stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" fill="none">
        <path d="M7,3 Q5,10 6,20 Q6.5,25 8,29" />
        <path d="M13,2 Q11,9 12,19 Q12.5,24 14,28" />
        <path d="M19,2 Q17,9 18,19 Q18.5,24 20,28" />
        <path d="M25,3 Q23,10 24,20 Q24.5,25 26,29" />
      </g>
    </svg>
  )
}


// ── Holiday data ─────────────────────────────────────────────────────────────

// nth weekday (0=Sun…6=Sat) in a month, 1-based n
function nthWeekday(year, month, n, wd) {
  const first = new Date(year, month, 1).getDay()
  return ((wd - first + 7) % 7) + 1 + (n - 1) * 7
}
// last occurrence of weekday in month
function lastWeekday(year, month, wd) {
  const last = new Date(year, month + 1, 0)
  return last.getDate() - ((last.getDay() - wd + 7) % 7)
}

function getFederalHolidays(year) {
  return [
    { month: 0,  day: 1,                              name: "New Year's Day" },
    { month: 0,  day: nthWeekday(year, 0, 3, 1),      name: "MLK Jr. Day" },
    { month: 1,  day: nthWeekday(year, 1, 3, 1),      name: "Presidents' Day" },
    { month: 4,  day: lastWeekday(year, 4, 1),         name: "Memorial Day" },
    { month: 5,  day: 19,                              name: "Juneteenth" },
    { month: 6,  day: 4,                               name: "Independence Day" },
    { month: 8,  day: nthWeekday(year, 8, 1, 1),      name: "Labor Day" },
    { month: 9,  day: nthWeekday(year, 9, 2, 1),      name: "Columbus Day" },
    { month: 10, day: 11,                              name: "Veterans Day" },
    { month: 10, day: nthWeekday(year, 10, 4, 4),     name: "Thanksgiving" },
    { month: 11, day: 25,                              name: "Christmas Day" },
  ]
}

// Maps federal holiday name → imported image asset
const FEDERAL_HOLIDAY_IMAGES = {
  "New Year's Day":   imgNewYears,
  "MLK Jr. Day":      imgMlkDay,
  "Presidents' Day":  imgPresidentsDay,
  "Memorial Day":     imgMemorialDay,
  "Juneteenth":       imgJuneteenth,
  "Independence Day": imgIndependence,
  "Labor Day":        imgLaborDay,
  "Columbus Day":     imgColumbusDay,
  "Veterans Day":     imgVeteransDay,
  "Thanksgiving":     imgThanksgiving,
  "Christmas Day":    imgChristmas,
}

// UN International Days + widely-known cultural observances.
// month is 0-indexed (0=Jan … 11=Dec), matching JS Date.getMonth().
const INTL_HOLIDAYS = [
  // ── January ──
  { month: 0,  day: 4,  name: "World Braille Day" },
  { month: 0,  day: 24, name: "International Day of Education" },
  { month: 0,  day: 26, name: "International Day of Clean Energy" },
  { month: 0,  day: 27, name: "Holocaust Remembrance Day" },
  { month: 0,  day: 28, name: "International Day of Peaceful Coexistence" },
  // ── February ──
  { month: 1,  day: 2,  name: "World Wetlands Day" },
  { month: 1,  day: 4,  name: "World Interfaith Harmony Week" },
  { month: 1,  day: 6,  name: "International Day of Human Fraternity" },
  { month: 1,  day: 11, name: "International Day of Women in Science" },
  { month: 1,  day: 13, name: "World Radio Day" },
  { month: 1,  day: 14, name: "Valentine's Day 💝" },
  { month: 1,  day: 20, name: "World Day of Social Justice" },
  { month: 1,  day: 21, name: "International Mother Language Day" },
  // ── March ──
  { month: 2,  day: 1,  name: "Zero Discrimination Day" },
  { month: 2,  day: 3,  name: "World Wildlife Day" },
  { month: 2,  day: 8,  name: "International Women's Day" },
  { month: 2,  day: 17, name: "St. Patrick's Day ☘️" },
  { month: 2,  day: 20, name: "International Day of Happiness" },
  { month: 2,  day: 21, name: "International Day of Forests" },
  { month: 2,  day: 21, name: "World Poetry Day" },
  { month: 2,  day: 21, name: "World Down Syndrome Day" },
  { month: 2,  day: 21, name: "International Day of Nowruz" },
  { month: 2,  day: 21, name: "Int'l Day to Eliminate Racial Discrimination" },
  { month: 2,  day: 22, name: "World Water Day" },
  { month: 2,  day: 23, name: "World Meteorological Day" },
  { month: 2,  day: 24, name: "World Tuberculosis Day" },
  { month: 2,  day: 25, name: "Int'l Day for Victims of Slavery" },
  { month: 2,  day: 30, name: "International Day of Zero Waste" },
  // ── April ──
  { month: 3,  day: 2,  name: "World Autism Awareness Day" },
  { month: 3,  day: 4,  name: "Int'l Day for Mine Awareness" },
  { month: 3,  day: 6,  name: "International Day of Sport for Development" },
  { month: 3,  day: 7,  name: "World Health Day" },
  { month: 3,  day: 12, name: "Int'l Day of Human Space Flight" },
  { month: 3,  day: 20, name: "Chinese Language Day" },
  { month: 3,  day: 21, name: "World Creativity and Innovation Day" },
  { month: 3,  day: 22, name: "Earth Day 🌍" },
  { month: 3,  day: 23, name: "World Book and Copyright Day" },
  { month: 3,  day: 23, name: "English Language Day" },
  { month: 3,  day: 23, name: "Spanish Language Day" },
  { month: 3,  day: 25, name: "World Malaria Day" },
  { month: 3,  day: 26, name: "World Intellectual Property Day" },
  { month: 3,  day: 28, name: "World Day for Safety and Health at Work" },
  { month: 3,  day: 30, name: "International Jazz Day 🎷" },
  // ── May ──
  { month: 4,  day: 3,  name: "World Press Freedom Day" },
  { month: 4,  day: 9,  name: "World Migratory Bird Day" },
  { month: 4,  day: 15, name: "International Day of Families" },
  { month: 4,  day: 16, name: "International Day of Light" },
  { month: 4,  day: 17, name: "World Telecommunication Day" },
  { month: 4,  day: 20, name: "World Bee Day 🐝" },
  { month: 4,  day: 21, name: "International Tea Day 🍵" },
  { month: 4,  day: 21, name: "World Day for Cultural Diversity" },
  { month: 4,  day: 22, name: "International Day for Biological Diversity" },
  { month: 4,  day: 25, name: "World Football Day ⚽" },
  { month: 4,  day: 29, name: "International Day of UN Peacekeepers" },
  { month: 4,  day: 31, name: "World No-Tobacco Day" },
  // ── June ──
  { month: 5,  day: 1,  name: "Global Day of Parents" },
  { month: 5,  day: 3,  name: "World Bicycle Day 🚲" },
  { month: 5,  day: 5,  name: "World Environment Day 🌿" },
  { month: 5,  day: 8,  name: "World Oceans Day 🌊" },
  { month: 5,  day: 12, name: "World Day Against Child Labour" },
  { month: 5,  day: 14, name: "World Blood Donor Day" },
  { month: 5,  day: 15, name: "World Elder Abuse Awareness Day" },
  { month: 5,  day: 17, name: "World Day to Combat Desertification" },
  { month: 5,  day: 20, name: "World Refugee Day" },
  { month: 5,  day: 21, name: "International Day of Yoga 🧘" },
  { month: 5,  day: 21, name: "Int'l Day of the Solstice" },
  { month: 5,  day: 23, name: "UN Public Service Day" },
  { month: 5,  day: 23, name: "International Widows' Day" },
  { month: 5,  day: 26, name: "Int'l Day against Drug Abuse" },
  { month: 5,  day: 29, name: "International Day of the Tropics" },
  { month: 5,  day: 30, name: "International Asteroid Day ☄️" },
  // ── July ──
  { month: 6,  day: 7,  name: "World Kiswahili Language Day" },
  { month: 6,  day: 11, name: "World Population Day" },
  { month: 6,  day: 15, name: "World Youth Skills Day" },
  { month: 6,  day: 18, name: "Nelson Mandela International Day" },
  { month: 6,  day: 20, name: "International Moon Day 🌕" },
  { month: 6,  day: 25, name: "World Drowning Prevention Day" },
  { month: 6,  day: 28, name: "World Hepatitis Day" },
  { month: 6,  day: 30, name: "International Day of Friendship" },
  { month: 6,  day: 30, name: "World Day against Trafficking in Persons" },
  // ── August ──
  { month: 7,  day: 8,  name: "World Cat Day 🐱" },
  { month: 7,  day: 9,  name: "Int'l Day of the World's Indigenous Peoples" },
  { month: 7,  day: 12, name: "International Youth Day" },
  { month: 7,  day: 19, name: "World Humanitarian Day" },
  { month: 7,  day: 23, name: "Int'l Day for Remembrance of the Slave Trade" },
  { month: 7,  day: 29, name: "Int'l Day against Nuclear Tests" },
  { month: 7,  day: 30, name: "Int'l Day of the Victims of Enforced Disappearances" },
  // ── September ──
  { month: 8,  day: 5,  name: "International Day of Charity" },
  { month: 8,  day: 7,  name: "International Day of Clean Air" },
  { month: 8,  day: 8,  name: "International Literacy Day 📚" },
  { month: 8,  day: 15, name: "International Day of Democracy" },
  { month: 8,  day: 16, name: "Int'l Day for Preservation of the Ozone Layer" },
  { month: 8,  day: 18, name: "International Equal Pay Day" },
  { month: 8,  day: 21, name: "International Day of Peace ✌️" },
  { month: 8,  day: 23, name: "International Day of Sign Languages" },
  { month: 8,  day: 26, name: "Int'l Day for the Elimination of Nuclear Weapons" },
  { month: 8,  day: 27, name: "World Tourism Day" },
  { month: 8,  day: 29, name: "Int'l Day of Awareness of Food Loss and Waste" },
  { month: 8,  day: 30, name: "International Translation Day" },
  // ── October ──
  { month: 9,  day: 1,  name: "International Coffee Day ☕" },
  { month: 9,  day: 1,  name: "International Day of Older Persons" },
  { month: 9,  day: 2,  name: "International Day of Non-Violence" },
  { month: 9,  day: 5,  name: "World Teachers' Day 🍎" },
  { month: 9,  day: 9,  name: "World Post Day" },
  { month: 9,  day: 9,  name: "World Migratory Bird Day" },
  { month: 9,  day: 10, name: "World Mental Health Day 🧠" },
  { month: 9,  day: 11, name: "International Day of the Girl Child" },
  { month: 9,  day: 13, name: "Int'l Day for Disaster Risk Reduction" },
  { month: 9,  day: 15, name: "International Day of Rural Women" },
  { month: 9,  day: 16, name: "World Food Day 🌾" },
  { month: 9,  day: 17, name: "Int'l Day for Eradication of Poverty" },
  { month: 9,  day: 24, name: "United Nations Day" },
  { month: 9,  day: 24, name: "World Development Information Day" },
  { month: 9,  day: 27, name: "World Day for Audiovisual Heritage" },
  { month: 9,  day: 29, name: "International Day of Care and Support" },
  { month: 9,  day: 31, name: "Halloween 🎃" },
  { month: 9,  day: 31, name: "World Cities Day" },
  // ── November ──
  { month: 10, day: 2,  name: "Int'l Day to End Impunity for Crimes vs. Journalists" },
  { month: 10, day: 5,  name: "World Tsunami Awareness Day" },
  { month: 10, day: 10, name: "World Science Day for Peace and Development" },
  { month: 10, day: 14, name: "World Diabetes Day" },
  { month: 10, day: 16, name: "International Day for Tolerance" },
  { month: 10, day: 19, name: "World Toilet Day" },
  { month: 10, day: 20, name: "World Children's Day 👧🧒" },
  { month: 10, day: 21, name: "World Philosophy Day" },
  { month: 10, day: 21, name: "World Television Day" },
  { month: 10, day: 25, name: "Int'l Day to Eliminate Violence against Women" },
  { month: 10, day: 26, name: "World Sustainable Transport Day" },
  // ── December ──
  { month: 11, day: 1,  name: "World AIDS Day" },
  { month: 11, day: 2,  name: "Int'l Day for Abolition of Slavery" },
  { month: 11, day: 3,  name: "Int'l Day of Persons with Disabilities" },
  { month: 11, day: 5,  name: "International Volunteer Day" },
  { month: 11, day: 5,  name: "World Soil Day" },
  { month: 11, day: 9,  name: "International Anti-Corruption Day" },
  { month: 11, day: 10, name: "Human Rights Day" },
  { month: 11, day: 11, name: "International Mountain Day ⛰️" },
  { month: 11, day: 12, name: "Universal Health Coverage Day" },
  { month: 11, day: 18, name: "International Migrants Day" },
  { month: 11, day: 18, name: "Arabic Language Day" },
  { month: 11, day: 20, name: "International Human Solidarity Day" },
  { month: 11, day: 21, name: "World Meditation Day 🧘" },
  { month: 11, day: 24, name: "International Anti-Cybercrime Day" },
  { month: 11, day: 25, name: "Christmas Day 🎄" },
  { month: 11, day: 26, name: "Boxing Day" },
  { month: 11, day: 27, name: "Int'l Day of Epidemic Preparedness" },
]

const CAT_HOLIDAYS = [
  // ── January ──
  { month: 0,  day: 2,  name: "Happy Mew Year for Cats Day 🎊" },
  { month: 0,  day: 14, name: "National Dress Up Your Pet Day 👗" },
  { month: 0,  day: 22, name: "Answer Your Cat's Questions Day 🐱❓" },
  // ── February ──
  { month: 1,  day: 23, name: "World Spay Day ✂️" },
  // ── March ──
  { month: 2,  day: 2,  name: "International Rescue Cat Day 🐾" },
  { month: 2,  day: 3,  name: "What If Cats Had Opposable Thumbs? Day 👍🐱" },
  { month: 2,  day: 17, name: "Saint Gertrude of Nivelles Day (Patron of Cats) 😇" },
  { month: 2,  day: 23, name: "Cuddly Kitten Day 🐱💕" },
  // ── April ──
  { month: 3,  day: 6,  name: "National Siamese Cat Day 🐈" },
  { month: 3,  day: 11, name: "National Pet Day 🐾" },
  { month: 3,  day: 19, name: "National Cat Lady Day 👩🐱" },
  { month: 3,  day: 27, name: "Free Feral Cat Spay Day ✂️" },
  { month: 3,  day: 30, name: "National Hairball Awareness Day 🤢🐱" },
  { month: 3,  day: 30, name: "National Tabby Day 🐈" },
  // ── May ──
  { month: 4,  day: 30, name: "International Hug Your Cat Day 🤗🐱" },
  // ── June ──
  { month: 5,  day: 4,  name: "National Hug Your Cat Day 🤗🐱" },
  { month: 5,  day: 15, name: "Take Your Cat to Work Day 💼🐱" },
  { month: 5,  day: 19, name: "International Box Day 📦🐱" },
  { month: 5,  day: 19, name: "National Garfield the Cat Day 🍕🐱" },
  // ── July ──
  { month: 6,  day: 10, name: "National Kitten Day 🐱✨" },
  // ── August ──
  { month: 7,  day: 8,  name: "International Cat Day 😺" },
  { month: 7,  day: 15, name: "Check the Chip Day 📡🐾" },
  { month: 7,  day: 22, name: "National Take Your Cat to the Vet Day 🏥🐱" },
  // ── September ──
  { month: 8,  day: 1,  name: "Ginger Cat Appreciation Day 🧡🐱" },
  // ── October ──
  { month: 9,  day: 16, name: "Global Cat Day 🌍🐱" },
  { month: 9,  day: 27, name: "National Black Cat Day 🖤🐱" },
  { month: 9,  day: 29, name: "National Cat Day 🐱🎉" },
  // ── December ──
  { month: 11, day: 15, name: "Cat Herders Day 🐾🐾🐾" },
]

// ── Calendar helpers ─────────────────────────────────────────────────────────

const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
]
const DAY_ABBR = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

function daysInMonth(y, m)  { return new Date(y, m + 1, 0).getDate() }
function firstDayOf(y, m)   { return new Date(y, m, 1).getDay() }

function addDays(y, m, d, n) {
  const dt = new Date(y, m, d + n)
  return { y: dt.getFullYear(), m: dt.getMonth(), d: dt.getDate() }
}

// ── Component ────────────────────────────────────────────────────────────────

export default function CalendarPage() {
  const { user, userEvents, familyMembers, prefs, updatePrefs, getDailyCatFact, deleteEvent } = useApp()
  const navigate = useNavigate()

  const today = new Date()

  // Which month is the calendar showing (month view)
  const [viewYear,  setViewYear]  = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())
  // Selected / focused day (week + day views pivot around this)
  const [selYear,  setSelYear]  = useState(today.getFullYear())
  const [selMonth, setSelMonth] = useState(today.getMonth())
  const [selDay,   setSelDay]   = useState(today.getDate())

  const [calView,      setCalView]      = useState('month') // 'month'|'week'|'day'
  const [showCatFact,   setShowCatFact]   = useState(false)
  const [catFactText,   setCatFactText]   = useState('')
  const [showFamilyMsg, setShowFamilyMsg] = useState(false)
  const [clockTime,     setClockTime]     = useState(new Date())
  const [clockExpanded, setClockExpanded] = useState(false)
  const [scratchedName, setScratchedName] = useState(null) // event name just scratched

  useEffect(() => {
    const id = setInterval(() => setClockTime(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  const name = user?.preferredName || user?.name || 'Friend'

  // ── Helpers ───────────────────────────────────────────────────────────────

  function isToday(y, m, d) {
    return y === today.getFullYear() && m === today.getMonth() && d === today.getDate()
  }
  function isPast(y, m, d) {
    return new Date(y, m, d) < new Date(today.getFullYear(), today.getMonth(), today.getDate())
  }
  function getEventsForDate(y, m, d) {
    return userEvents.filter(e => {
      if (!e.date) return false
      const dt = new Date(e.date + 'T00:00:00')
      return dt.getFullYear() === y && dt.getMonth() === m && dt.getDate() === d
    })
  }
  function getHolidaysForDate(y, m, d) {
    const out = []
    if (prefs.showFederalHolidays) {
      getFederalHolidays(y)
        .filter(h => h.month === m && h.day === d)
        .forEach(h => out.push({ ...h, kind: 'federal' }))
    }
    if (prefs.showInternationalHolidays) {
      INTL_HOLIDAYS
        .filter(h => h.month === m && h.day === d)
        .forEach(h => out.push({ ...h, kind: 'intl' }))
    }
    if (prefs.showCatHolidays) {
      CAT_HOLIDAYS
        .filter(h => h.month === m && h.day === d)
        .forEach(h => out.push({ ...h, kind: 'cat' }))
    }
    return out
  }

  // ── Actions ───────────────────────────────────────────────────────────────

  function handleCatFact() {
    setCatFactText(getDailyCatFact())
    setShowCatFact(true)
  }

  function handleFamilyEvents() {
    const hasFamily = user?.isFamilyAccount && familyMembers.length > 0
    if (!hasFamily) {
      setShowFamilyMsg(true)
      return
    }
    updatePrefs({ showFamilyEvents: !prefs.showFamilyEvents })
  }

  function selectDate(y, m, d) {
    setSelYear(y); setSelMonth(m); setSelDay(d)
  }

  function prevPeriod() {
    if (calView === 'month') {
      if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11) }
      else setViewMonth(m => m - 1)
    } else if (calView === 'week') {
      const n = addDays(selYear, selMonth, selDay, -7)
      setSelYear(n.y); setSelMonth(n.m); setSelDay(n.d)
    } else {
      const n = addDays(selYear, selMonth, selDay, -1)
      setSelYear(n.y); setSelMonth(n.m); setSelDay(n.d)
    }
  }

  function nextPeriod() {
    if (calView === 'month') {
      if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0) }
      else setViewMonth(m => m + 1)
    } else if (calView === 'week') {
      const n = addDays(selYear, selMonth, selDay, 7)
      setSelYear(n.y); setSelMonth(n.m); setSelDay(n.d)
    } else {
      const n = addDays(selYear, selMonth, selDay, 1)
      setSelYear(n.y); setSelMonth(n.m); setSelDay(n.d)
    }
  }

  function goToToday() {
    setViewYear(today.getFullYear())
    setViewMonth(today.getMonth())
    setSelYear(today.getFullYear())
    setSelMonth(today.getMonth())
    setSelDay(today.getDate())
  }

  function getPeriodLabel() {
    if (calView === 'month') return `${MONTH_NAMES[viewMonth]} ${viewYear}`
    if (calView === 'week') {
      const base = new Date(selYear, selMonth, selDay)
      const sun = new Date(base); sun.setDate(sun.getDate() - sun.getDay())
      const sat = new Date(sun);  sat.setDate(sat.getDate() + 6)
      const start = `${MONTH_NAMES[sun.getMonth()].slice(0,3)} ${sun.getDate()}`
      const end   = `${MONTH_NAMES[sat.getMonth()].slice(0,3)} ${sat.getDate()}, ${sat.getFullYear()}`
      return `${start} – ${end}`
    }
    return `${DAY_ABBR[new Date(selYear, selMonth, selDay).getDay()]}, ${MONTH_NAMES[selMonth]} ${selDay}, ${selYear}`
  }

  // ── Month view ────────────────────────────────────────────────────────────

  function renderMonthView() {
    const start = firstDayOf(viewYear, viewMonth)
    const total = daysInMonth(viewYear, viewMonth)
    const cells = []

    // Day-name headers
    DAY_ABBR.forEach(abbr => (
      cells.push(<div key={`h-${abbr}`} className="cal-hdr-cell">{abbr}</div>)
    ))

    // Leading empty cells
    for (let i = 0; i < start; i++) {
      cells.push(<div key={`e-${i}`} className="cal-cell cal-cell-empty" />)
    }

    for (let d = 1; d <= total; d++) {
      const events   = getEventsForDate(viewYear, viewMonth, d)
      const holidays = getHolidaysForDate(viewYear, viewMonth, d)
      const isTd  = isToday(viewYear, viewMonth, d)
      const isPst = isPast(viewYear, viewMonth, d)
      const isSel = selYear === viewYear && selMonth === viewMonth && selDay === d

      cells.push(
        <div
          key={d}
          className={[
            'cal-cell',
            isTd  ? 'cal-cell-today'    : '',
            isPst ? 'cal-cell-past'     : '',
            isSel ? 'cal-cell-selected' : '',
          ].filter(Boolean).join(' ')}
          onClick={() => { selectDate(viewYear, viewMonth, d); setCalView('day') }}
        >
          <span className="cal-daynum">{d}</span>

          {holidays.map((h, i) => (
            <span key={`h${i}`} className={`cal-pill cal-pill-${h.kind}`} title={h.name}>
              {h.name.length > 11 ? h.name.slice(0, 10) + '…' : h.name}
            </span>
          ))}

          {events.slice(0, 2).map(e => (
            <span
              key={e.id}
              className={`cal-pill cal-pill-${e.eventType || 'event'}`}
              title={e.name}
            >
              {e.name.length > 11 ? e.name.slice(0, 10) + '…' : e.name}
            </span>
          ))}

          {events.length > 2 && (
            <span className="cal-pill cal-pill-more">+{events.length - 2}</span>
          )}
        </div>
      )
    }

    return <div className="cal-month-grid">{cells}</div>
  }

  // ── Week view ─────────────────────────────────────────────────────────────

  function renderWeekView() {
    const base = new Date(selYear, selMonth, selDay)
    const offset = base.getDay() // days since Sunday
    const cols = Array.from({ length: 7 }, (_, i) => {
      const dt = new Date(selYear, selMonth, selDay - offset + i)
      return { y: dt.getFullYear(), m: dt.getMonth(), d: dt.getDate(), wd: i }
    })

    return (
      <div className="cal-week-grid">
        {cols.map(({ y, m, d, wd }) => {
          const events   = getEventsForDate(y, m, d)
          const holidays = getHolidaysForDate(y, m, d)
          const isTd  = isToday(y, m, d)
          const isPst = isPast(y, m, d)
          return (
            <div
              key={wd}
              className={[
                'cal-week-col',
                isTd  ? 'cal-cell-today' : '',
                isPst ? 'cal-cell-past'  : '',
              ].filter(Boolean).join(' ')}
              onClick={() => { selectDate(y, m, d); setCalView('day') }}
            >
              <div className="cal-week-col-hdr">
                <span className="cal-week-wd">{DAY_ABBR[wd]}</span>
                <span className="cal-week-dd">{d}</span>
                <span className="cal-week-mo">{MONTH_NAMES[m].slice(0, 3)}</span>
              </div>
              <div className="cal-week-col-body">
                {holidays.map((h, i) => (
                  <span key={`h${i}`} className={`cal-pill cal-pill-${h.kind}`}>{h.name}</span>
                ))}
                {events.map(e => (
                  <span key={e.id} className={`cal-pill cal-pill-${e.eventType || 'event'}`}>{e.name}</span>
                ))}
                {events.length === 0 && holidays.length === 0 && (
                  <span className="cal-week-empty">No events</span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  // ── Day view ──────────────────────────────────────────────────────────────

  function renderDayView() {
    const events   = getEventsForDate(selYear, selMonth, selDay)
    const holidays = getHolidaysForDate(selYear, selMonth, selDay)
    const isTd  = isToday(selYear, selMonth, selDay)
    const isPst = isPast(selYear, selMonth, selDay)

    return (
      <div className={`cal-day-view ${isTd ? 'cal-day-today' : ''} ${isPst ? 'cal-day-past' : ''}`}>
        <div className="cal-day-title-row">
          <span className="cal-day-title">
            {DAY_ABBR[new Date(selYear, selMonth, selDay).getDay()]},{' '}
            {MONTH_NAMES[selMonth]} {selDay}, {selYear}
          </span>
          {isTd && <span className="badge badge-event">Today</span>}
          {isPst && !isTd && <span className="cal-day-past-tag">Past</span>}
        </div>

        {holidays.length > 0 && (
          <div className="cal-day-section">
            <p className="cal-day-section-label">Holidays</p>
            {holidays.map((h, i) => {
              const holidayImg = h.kind === 'federal' ? FEDERAL_HOLIDAY_IMAGES[h.name] : null
              return (
                <div key={i}>
                  <div className={`cal-day-row cal-day-row-${h.kind}`}>
                    <span>{h.kind === 'federal' ? '🇺🇸' : h.kind === 'cat' ? '🐱' : '🌍'}</span>
                    <span>{h.name}</span>
                  </div>
                  {holidayImg && (
                    <div className="cal-holiday-img-card">
                      <img src={holidayImg} alt={h.name} className="cal-holiday-img" />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {events.length > 0 ? (
          <div className="cal-day-section">
            <p className="cal-day-section-label">Your Events</p>
            {events.map(e => (
              <div key={e.id} className={`cal-day-row cal-day-event-row${isPst ? ' cal-day-event-past' : ''}`}>
                <div className="cal-day-event-info">
                  <span className="cal-day-event-name">{e.name}</span>
                  {(e.startTime || e.endTime) && (
                    <span className="cal-day-event-time">
                      {e.startTime}{e.endTime ? ` – ${e.endTime}` : ''}
                    </span>
                  )}
                  {e.eventType && e.eventType !== 'other' && (
                    <span className={`badge badge-${e.eventType}`}>{e.eventType}</span>
                  )}
                </div>
                <div className="cal-event-btns">
                  <button
                    className="btn btn-sm btn-secondary"
                    onClick={ev => { ev.stopPropagation(); navigate(`/events/${e.id}/edit`) }}
                  >
                    Edit Event
                  </button>
                  <button
                    className="scratch-it-btn"
                    title="Scratch It — send to Litter Box"
                    onClick={ev => {
                      ev.stopPropagation()
                      const name = e.name
                      deleteEvent(e.id)
                      setScratchedName(name)
                      setTimeout(() => setScratchedName(null), 2500)
                    }}
                    aria-label="Scratch It — send to Litter Box"
                  >
                    <ScratchIcon className="scratch-it-icon" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="cal-day-empty">
            <p>No events on this day.</p>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => navigate(`/events/new?date=${selYear}-${String(selMonth + 1).padStart(2,'0')}-${String(selDay).padStart(2,'0')}`)}
            >
              Add Event 🗓️
            </button>
          </div>
        )}
      </div>
    )
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <>
    <div className="calendar-page">

      {/* Family account nudge */}
      {showFamilyMsg && (
        <div className="family-nudge-banner">
          <span className="family-nudge-icon">🐱</span>
          <p>
            Sorry, it looks like you&apos;re the only one here. You can make this a family account in your{' '}
            <button className="link-btn link-btn-light" onClick={() => navigate('/profile')}>
              profile
            </button>
            .
          </p>
          <button className="btn btn-sm btn-ghost" onClick={() => setShowFamilyMsg(false)}>✕</button>
        </div>
      )}

      {/* Cat Fact Banner */}
      {showCatFact && (
        <div className="cat-fact-banner">
          <div className="fact-emoji">🐱</div>
          <p>{catFactText}</p>
          <button className="btn btn-sm btn-secondary" onClick={() => setShowCatFact(false)}>
            Got it! 🐾
          </button>
        </div>
      )}

      {/* ── Page header ──────────────────────────────────────────────────── */}
      <div className="cal-header">
        <div className="cal-header-left">
          <h1>Welcome to {name}&apos;s Calendar!</h1>
          <p>What&apos;s on the agenda for today?</p>
        </div>

        <div className="cal-header-right">
          <div className="cal-header-cards">
            <div className="cal-cat-card">
              <span className="cal-cat-emoji">🐱</span>
              <span className="cal-cat-date">
                {MONTH_NAMES[today.getMonth()]} {today.getDate()}, {today.getFullYear()}
              </span>
            </div>
            <KittyClock
              clockTime={clockTime}
              expanded={clockExpanded}
              onToggle={() => setClockExpanded(v => !v)}
            />
          </div>
        </div>
      </div>

      {/* ── Action buttons ───────────────────────────────────────────────── */}
      <div className="cal-actions">
        <button className="btn btn-primary" onClick={() => navigate('/events/new')}>
          Add Event 🗓️
        </button>
        <button
          className={`btn${prefs.showFamilyEvents ? ' btn-toggle-on' : ' btn-secondary'}`}
          onClick={handleFamilyEvents}
        >
          {prefs.showFamilyEvents ? '✓ Hiding' : 'View All'} Family Events 🐱🐱
        </button>
        <button className="btn btn-secondary" onClick={handleCatFact}>
          Give me a Cat Fact! 😺
        </button>
      </div>

      {/* ── Holiday toggles ──────────────────────────────────────────────── */}
      <div className="cal-toggles">
        <button
          className={`btn btn-sm${prefs.showFederalHolidays ? ' btn-toggle-on' : ' btn-secondary'}`}
          onClick={() => updatePrefs({ showFederalHolidays: !prefs.showFederalHolidays })}
        >
          {prefs.showFederalHolidays ? '✓' : '+'} Federal Holidays 🇺🇸
        </button>
        <button
          className={`btn btn-sm${prefs.showInternationalHolidays ? ' btn-toggle-on' : ' btn-secondary'}`}
          onClick={() => updatePrefs({ showInternationalHolidays: !prefs.showInternationalHolidays })}
        >
          {prefs.showInternationalHolidays ? '✓' : '+'} International Holidays 🌍
        </button>
        <button
          className={`btn btn-sm${prefs.showCatHolidays ? ' btn-toggle-on' : ' btn-secondary'}`}
          onClick={() => updatePrefs({ showCatHolidays: !prefs.showCatHolidays })}
        >
          {prefs.showCatHolidays ? '✓' : '+'} Cat Holidays 🐱
        </button>
      </div>

      {/* ── View controls ────────────────────────────────────────────────── */}
      <div className="cal-controls">
        <div className="cal-view-btns">
          {['month','week','day'].map(v => (
            <button
              key={v}
              className={`btn btn-sm${calView === v ? ' btn-primary' : ' btn-secondary'}`}
              onClick={() => setCalView(v)}
            >
              {v[0].toUpperCase() + v.slice(1)}
            </button>
          ))}
        </div>
        <div className="cal-nav">
          <button className="btn btn-sm btn-secondary cal-nav-arrow" onClick={prevPeriod}>‹</button>
          <span className="cal-period-label">{getPeriodLabel()}</span>
          <button className="btn btn-sm btn-secondary cal-nav-arrow" onClick={nextPeriod}>›</button>
          <button className="btn btn-sm btn-secondary" onClick={goToToday}>Today</button>
        </div>
      </div>

      {/* ── Calendar body ────────────────────────────────────────────────── */}
      <div className="cal-body">
        {calView === 'month' && renderMonthView()}
        {calView === 'week'  && renderWeekView()}
        {calView === 'day'   && renderDayView()}
      </div>

    </div>

    {/* ── Scratch It confirmation overlay ──────────────────────────────── */}
    {scratchedName && (
      <div className="scratch-confirm-overlay">
        <div className="scratch-confirm-card">
          <img src={oopsCat} alt="Cat knocking something off" className="scratch-confirm-img" />
          <p className="scratch-confirm-msg">Whelp, there goess that event.</p>
          <p className="scratch-confirm-sub">&ldquo;{scratchedName}&rdquo; sent to the Litter Box.</p>
        </div>
      </div>
    )}
    </>
  )
}
