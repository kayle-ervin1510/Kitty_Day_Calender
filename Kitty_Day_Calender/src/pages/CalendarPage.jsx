import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { getYearOfCatHoliday } from '../lib/yearOfCat'
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
import imgValentines    from '../assets/us-popular-holidays/valentines-day.png'
import imgEaster        from '../assets/us-popular-holidays/easter-sunday.png'
import imgStPatricks    from '../assets/us-popular-holidays/st-patricks-day.png'
import imgHalloween     from '../assets/us-popular-holidays/halloween.png'
import imgChristmasEve  from '../assets/us-popular-holidays/christmas-eve.png'
import imgEarthDay      from '../assets/us-popular-holidays/earth-day.png'
import imgFathersDay    from '../assets/us-popular-holidays/fathers-day.png'
import imgMothersDay    from '../assets/us-popular-holidays/mothers-day.png'
import imgGrandparents  from '../assets/us-popular-holidays/grandparents-day.png'
import imgNewYearsEve   from '../assets/us-popular-holidays/new-years-eve.png'
import imgCincoDeMayo   from '../assets/us-popular-holidays/cinco-de-mayo.png'
import imgAprilFools    from '../assets/us-popular-holidays/april-fools.png'
import imgGroundhogDay  from '../assets/us-popular-holidays/groundhog-day.png'
import imgBlackFriday   from '../assets/us-popular-holidays/black-friday.png'
import imgCyberMonday   from '../assets/us-popular-holidays/cyber-monday.png'
import imgDiaDeMuertos  from '../assets/us-popular-holidays/dia-de-los-muertos.png'
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

function dateToMonthDay(d) { return { month: d.getMonth(), day: d.getDate() } }

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

function getUsPopularHolidays(year) {
  // Easter — Anonymous Gregorian algorithm
  const a = year % 19, b = Math.floor(year / 100), c = year % 100
  const dv = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25)
  const g = Math.floor((b - f + 1) / 3)
  const h = (19 * a + b - dv - g + 15) % 30
  const ii = Math.floor(c / 4), k = c % 4
  const l = (32 + 2 * e + 2 * ii - h - k) % 7
  const mv = Math.floor((a + 11 * h + 22 * l) / 451)
  const easterMonth = Math.floor((h + l - 7 * mv + 114) / 31) - 1
  const easterDay   = ((h + l - 7 * mv + 114) % 31) + 1

  // Floating Sundays
  const mothersDayDay      = nthWeekday(year, 4, 2, 0) // 2nd Sunday of May
  const fathersDayDay      = nthWeekday(year, 5, 3, 0) // 3rd Sunday of June
  const laborDayDay        = nthWeekday(year, 8, 1, 1) // 1st Monday of September
  const grandparentsDayDay = laborDayDay + 6            // 1st Sunday after Labor Day

  // Shopping holidays (relative to Thanksgiving; Cyber Monday can fall in December)
  const thanksgivingDay = nthWeekday(year, 10, 4, 4)
  const blackFriday  = dateToMonthDay(new Date(year, 10, thanksgivingDay + 1))
  const cyberMonday  = dateToMonthDay(new Date(year, 10, thanksgivingDay + 4))

  return [
    { month: 1,  day: 2,               name: "Groundhog Day 🦫" },
    { month: 1,  day: 14,              name: "Valentine's Day 💝" },
    { month: 2,  day: 17,              name: "St. Patrick's Day ☘️" },
    { month: 3,  day: 1,               name: "April Fools' Day 🃏" },
    { month: 3,  day: 22,              name: "Earth Day 🌍" },
    { month: 4,  day: 5,               name: "Cinco de Mayo 🎉" },
    { month: 9,  day: 31,              name: "Halloween 🎃" },
    { month: 10, day: 1,               name: "Día de los Muertos 💀🌼" },
    { month: 11, day: 24,              name: "Christmas Eve 🎄" },
    { month: 11, day: 31,              name: "New Year's Eve 🎆" },
    { month: easterMonth, day: easterDay,    name: "Easter Sunday 🐣" },
    { month: 4,  day: mothersDayDay,         name: "Mother's Day 💐" },
    { month: 5,  day: fathersDayDay,         name: "Father's Day 👔" },
    { month: 8,  day: grandparentsDayDay,    name: "Grandparents Day 👴👵" },
    { ...blackFriday,                        name: "Black Friday 🛍️" },
    { ...cyberMonday,                        name: "Cyber Monday 💻" },
  ]
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

const US_POPULAR_HOLIDAY_IMAGES = {
  "Valentine's Day 💝":       imgValentines,
  "Easter Sunday 🐣":         imgEaster,
  "St. Patrick's Day ☘️":     imgStPatricks,
  "Halloween 🎃":              imgHalloween,
  "Christmas Eve 🎄":          imgChristmasEve,
  "Earth Day 🌍":              imgEarthDay,
  "Father's Day 👔":           imgFathersDay,
  "Mother's Day 💐":           imgMothersDay,
  "Grandparents Day 👴👵":     imgGrandparents,
  "New Year's Eve 🎆":         imgNewYearsEve,
  "Cinco de Mayo 🎉":          imgCincoDeMayo,
  "April Fools' Day 🃏":       imgAprilFools,
  "Groundhog Day 🦫":          imgGroundhogDay,
  "Black Friday 🛍️":           imgBlackFriday,
  "Cyber Monday 💻":           imgCyberMonday,
  "Día de los Muertos 💀🌼":   imgDiaDeMuertos,
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
  const { user, userEvents, sharedEvents, familyMembers, prefs, updatePrefs, getDailyCatFact, deleteEvent, saveDailyCatFact, refreshProfile } = useApp()
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
  const [catDayImage,   setCatDayImage]   = useState(null)
  const [catDayImgDate, setCatDayImgDate] = useState(null)
  const [showFamilyMsg, setShowFamilyMsg] = useState(false)
  const [clockTime,     setClockTime]     = useState(new Date())
  const [clockExpanded, setClockExpanded] = useState(false)
  const [scratchedName, setScratchedName] = useState(null) // event name just scratched

  // On login, do a one-time profile refresh so we always have the latest dailyCatFact,
  // even if it was saved in another browser window after this session loaded.
  useEffect(() => {
    if (user?.id) refreshProfile()
  }, [user?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  // Restore today's cat fact + image — Supabase is authoritative, localStorage is fast-load cache.
  // Runs whenever dailyCatFact changes (including after the refresh above).
  useEffect(() => {
    if (!user) return
    const todayStr = new Date().toDateString()

    // Try Supabase first (cross-browser)
    const remote = user?.dailyCatFact
    if (remote?.date === todayStr && remote?.fact) {
      setCatFactText(remote.fact)
      setCatDayImage(remote.img || null)
      setCatDayImgDate(todayStr)
      setShowCatFact(true)
      localStorage.setItem('kdc_cat_fact', JSON.stringify(remote))
      return
    }

    // Fall back to localStorage (same-browser fast path)
    try {
      const stored = localStorage.getItem('kdc_cat_fact')
      if (stored) {
        const { date, fact, img } = JSON.parse(stored)
        if (date === todayStr && fact) {
          setCatFactText(fact)
          setCatDayImage(img || null)
          setCatDayImgDate(todayStr)
          setShowCatFact(true)
        }
      }
    } catch { /* ignore malformed data */ }
  }, [user?.dailyCatFact]) // eslint-disable-line react-hooks/exhaustive-deps

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
    const own = userEvents.filter(e => {
      if (!e.date) return false
      const dt = new Date(e.date + 'T00:00:00')
      return dt.getFullYear() === y && dt.getMonth() === m && dt.getDate() === d
    })
    if (!prefs.showFamilyEvents) return own
    const shared = sharedEvents.filter(e => {
      if (!e.date) return false
      const dt = new Date(e.date + 'T00:00:00')
      return dt.getFullYear() === y && dt.getMonth() === m && dt.getDate() === d
    })
    return [...own, ...shared]
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
      const yoc = getYearOfCatHoliday(y)
      if (yoc && yoc.month === m && yoc.day === d) out.push(yoc)
    }
    if (prefs.showCatHolidays) {
      CAT_HOLIDAYS
        .filter(h => h.month === m && h.day === d)
        .forEach(h => out.push({ ...h, kind: 'cat' }))
    }
    if (prefs.showUsPopularHolidays) {
      getUsPopularHolidays(y)
        .filter(h => h.month === m && h.day === d)
        .forEach(h => out.push({ ...h, kind: 'us-popular' }))
    }
    return out
  }

  // ── Actions ───────────────────────────────────────────────────────────────

  async function handleCatFact() {
    const todayStr = new Date().toDateString()

    // If today's fact is already cached (in state or localStorage), just show it — no re-fetch
    if (catFactText && catDayImgDate === todayStr) {
      setShowCatFact(true)
      return
    }
    try {
      const stored = JSON.parse(localStorage.getItem('kdc_cat_fact') || 'null')
      if (stored?.date === todayStr && stored?.fact) {
        setCatFactText(stored.fact)
        setCatDayImage(stored.img || null)
        setCatDayImgDate(todayStr)
        setShowCatFact(true)
        return
      }
    } catch { /* ignore malformed cache */ }

    const todayEvents = getEventsForDate(today.getFullYear(), today.getMonth(), today.getDate())
    const isWildDay   = todayEvents.some(e => e.eventType === 'holiday' || e.eventType === 'birthday')

    const WILD_CATS = ['cheetah','tiger','leopard','lion','jaguar','cougar','snow leopard','sand cat','lynx','ocelot']
    const wildCat   = WILD_CATS[Math.floor(Math.random() * WILD_CATS.length)]

    let fetchedImg = catDayImgDate === todayStr ? catDayImage : null

    const [fact] = await Promise.all([
      // ── Fact ────────────────────────────────────────────────────────────────
      isWildDay
        ? fetch(`https://api.api-ninjas.com/v1/animals?name=${encodeURIComponent(wildCat)}`, {
            headers: { 'X-Api-Key': import.meta.env.VITE_API_NINJAS_KEY },
          })
            .then(r => r.json())
            .then(data => {
              const animal = data?.[0]
              if (!animal) return `${wildCat}s are magnificent wild cats.`
              const c    = animal.characteristics || {}
              const name = animal.name || wildCat
              if (c.slogan)                   return `${name}: "${c.slogan}"`
              if (c.top_speed)                return `${name}s can reach speeds of ${c.top_speed}!`
              if (c.most_distinctive_feature) return `${name}s are known for: ${c.most_distinctive_feature}.`
              if (c.biggest_threat)           return `The biggest threat to the ${name}: ${c.biggest_threat}.`
              return `${name}s are magnificent wild cats.`
            })
            .catch(() => `${wildCat}s are magnificent wild cats.`)
        : getDailyCatFact(),

      // ── Image ────────────────────────────────────────────────────────────────
      (async () => {
        if (fetchedImg) return
        try {
          if (isWildDay) {
            const res  = await fetch(
              `https://api.unsplash.com/photos/random?query=${encodeURIComponent(wildCat + ' wild cat')}&orientation=landscape`,
              { headers: { Authorization: `Client-ID ${import.meta.env.VITE_UNSPLASH_ACCESS_KEY}` } }
            )
            const data = await res.json()
            const url  = data?.urls?.regular
            if (url) { fetchedImg = url; setCatDayImage(url); setCatDayImgDate(todayStr) }
          } else {
            const res  = await fetch('https://api.thecatapi.com/v1/images/search', {
              headers: { 'x-api-key': import.meta.env.VITE_CAT_API_KEY },
            })
            const data = await res.json()
            const url  = data[0]?.url
            if (url) { fetchedImg = url; setCatDayImage(url); setCatDayImgDate(todayStr) }
          }
        } catch { /* keep emoji fallback */ }
      })(),
    ])

    setCatFactText(fact)
    setShowCatFact(true)

    // Persist across all browsers via Supabase, and cache locally
    const payload = { date: todayStr, fact, img: fetchedImg }
    localStorage.setItem('kdc_cat_fact', JSON.stringify(payload))
    saveDailyCatFact(todayStr, fact, fetchedImg)
  }

  function handleFamilyEvents() {
    const hasFamily = (user?.isFamilyAccount && familyMembers.length > 0) || sharedEvents.length > 0
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
              const holidayImg = h.kind === 'federal'
                ? FEDERAL_HOLIDAY_IMAGES[h.name]
                : h.kind === 'us-popular'
                  ? US_POPULAR_HOLIDAY_IMAGES[h.name]
                  : null
              const kindEmoji = h.kind === 'federal' ? '🇺🇸'
                : h.kind === 'cat' ? '🐱'
                : h.kind === 'us-popular' ? '🧶'
                : '🌍'
              return (
                <div key={i}>
                  <div className={`cal-day-row cal-day-row-${h.kind}`}>
                    <span>{kindEmoji}</span>
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
                  {e.imageUrl && (
                    <img
                      src={e.imageUrl}
                      alt={e.name}
                      className="cal-day-event-img"
                    />
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


      {/* ── Page header ──────────────────────────────────────────────────── */}
      <div className="cal-header">
        <div className="cal-header-left">
          <h1>Welcome to {name}&apos;s Calendar!</h1>
          <p>What&apos;s on the agenda for today?</p>
        </div>

        <div className="cal-header-right">
          <div className="cal-header-cards">
            <div className={`cal-cat-card${showCatFact ? ' cal-cat-card-expanded' : ''}`}>
              {showCatFact && catDayImage
                ? <img src={catDayImage} alt="Daily cat" className="cal-cat-img" />
                : <span className="cal-cat-emoji">🐱</span>
              }
              <span className="cal-cat-date">
                {MONTH_NAMES[today.getMonth()]} {today.getDate()}, {today.getFullYear()}
              </span>
              {showCatFact && catFactText && (
                <p className="cal-cat-fact">{catFactText}</p>
              )}
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
          {prefs.showFamilyEvents ? '✓ Showing' : 'View'} Family Events
          <svg viewBox="0 0 32 32" width="1em" height="1em" aria-hidden="true"
            style={{ display: 'inline-block', verticalAlign: 'middle', marginLeft: '0.35em', flexShrink: 0 }}>
            <ellipse cx="16" cy="22.5" rx="7" ry="5.5" fill="currentColor" />
            <ellipse cx="7"  cy="14.5" rx="2.8" ry="3.5" fill="currentColor" />
            <ellipse cx="12" cy="10.5" rx="2.8" ry="3.5" fill="currentColor" />
            <ellipse cx="20" cy="10.5" rx="2.8" ry="3.5" fill="currentColor" />
            <ellipse cx="25" cy="14.5" rx="2.8" ry="3.5" fill="currentColor" />
          </svg>
        </button>
        <button className="btn btn-secondary" onClick={handleCatFact}>
          Give me a Cat Fact! 🐈
        </button>
      </div>

      {/* ── Holiday toggles ──────────────────────────────────────────────── */}
      <div className="cal-toggles">
        <button
          className={`btn btn-sm cal-holiday-btn${prefs.showFederalHolidays ? ' btn-toggle-on' : ' btn-secondary'}`}
          onClick={() => updatePrefs({ showFederalHolidays: !prefs.showFederalHolidays })}
          aria-label="Toggle Federal Holidays"
        >
          <span className="cal-holiday-icon">🇺🇸</span>
          <span className="cal-holiday-tooltip">
            {prefs.showFederalHolidays ? 'Hide' : 'Apply'} Federal Holidays
          </span>
        </button>
        <button
          className={`btn btn-sm cal-holiday-btn${prefs.showInternationalHolidays ? ' btn-toggle-on' : ' btn-secondary'}`}
          onClick={() => updatePrefs({ showInternationalHolidays: !prefs.showInternationalHolidays })}
          aria-label="Toggle International Holidays"
        >
          <span className="cal-holiday-icon">🌍</span>
          <span className="cal-holiday-tooltip">
            {prefs.showInternationalHolidays ? 'Hide' : 'Apply'} International Holidays
          </span>
        </button>
        <button
          className={`btn btn-sm cal-holiday-btn${prefs.showCatHolidays ? ' btn-toggle-on' : ' btn-secondary'}`}
          onClick={() => updatePrefs({ showCatHolidays: !prefs.showCatHolidays })}
          aria-label="Toggle Cat Holidays"
        >
          <span className="cal-holiday-icon">😻</span>
          <span className="cal-holiday-tooltip">
            {prefs.showCatHolidays ? 'Hide' : 'Apply'} Cat Holidays
          </span>
        </button>
        <button
          className={`btn btn-sm cal-holiday-btn${prefs.showUsPopularHolidays ? ' btn-toggle-on' : ' btn-secondary'}`}
          onClick={() => updatePrefs({ showUsPopularHolidays: !prefs.showUsPopularHolidays })}
          aria-label="Toggle US Popular Holidays"
        >
          <span className="cal-holiday-icon">🧶</span>
          <span className="cal-holiday-tooltip">
            {prefs.showUsPopularHolidays ? 'Hide' : 'Apply'} US Popular Holidays
          </span>
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
