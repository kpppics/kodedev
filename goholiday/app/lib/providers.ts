// Provider definitions and deep-link builders.
// Each provider receives the search params and returns a URL that
// opens a pre-filled search on that provider's real site — turning
// GoHoliday into a true "go compare" aggregator.

export type StayCategory = 'all' | 'hotels' | 'apartments' | 'villas' | 'houses'

export interface SearchParams {
  destination: string
  origin?: string
  checkIn: string  // YYYY-MM-DD
  checkOut: string // YYYY-MM-DD
  adults: number
  children?: number
  rooms?: number
  category?: StayCategory
}

export interface Provider {
  id: string
  name: string
  tagline: string
  color: string // hex, used for chip background
  build: (p: SearchParams) => string
}

const enc = encodeURIComponent

/* -----------------------------  STAYS  ----------------------------- */

export const STAY_PROVIDERS: Provider[] = [
  {
    id: 'booking',
    name: 'Booking.com',
    tagline: '28M+ listings worldwide',
    color: '#003580',
    build: (p) =>
      `https://www.booking.com/searchresults.html?ss=${enc(p.destination)}` +
      `&checkin=${p.checkIn}&checkout=${p.checkOut}` +
      `&group_adults=${p.adults}&group_children=${p.children ?? 0}` +
      `&no_rooms=${p.rooms ?? 1}`,
  },
  {
    id: 'airbnb',
    name: 'Airbnb',
    tagline: 'Unique stays & homes',
    color: '#FF385C',
    build: (p) =>
      `https://www.airbnb.com/s/${enc(p.destination)}/homes` +
      `?adults=${p.adults}&children=${p.children ?? 0}` +
      `&checkin=${p.checkIn}&checkout=${p.checkOut}`,
  },
  {
    id: 'vrbo',
    name: 'Vrbo',
    tagline: 'Whole vacation homes',
    color: '#245ABC',
    build: (p) =>
      `https://www.vrbo.com/search?destination=${enc(p.destination)}` +
      `&startDate=${p.checkIn}&endDate=${p.checkOut}` +
      `&adults=${p.adults}`,
  },
  {
    id: 'expedia',
    name: 'Expedia',
    tagline: 'Hotels + bundle deals',
    color: '#FFC72C',
    build: (p) =>
      `https://www.expedia.com/Hotel-Search?destination=${enc(p.destination)}` +
      `&startDate=${p.checkIn}&endDate=${p.checkOut}` +
      `&adults=${p.adults}`,
  },
  {
    id: 'hotels',
    name: 'Hotels.com',
    tagline: 'Collect 10 nights, get 1 free',
    color: '#D32F2F',
    build: (p) =>
      `https://www.hotels.com/Hotel-Search?destination=${enc(p.destination)}` +
      `&startDate=${p.checkIn}&endDate=${p.checkOut}` +
      `&adults=${p.adults}`,
  },
  {
    id: 'agoda',
    name: 'Agoda',
    tagline: 'Top deals in Asia',
    color: '#F85032',
    build: (p) =>
      `https://www.agoda.com/search?city=&q=${enc(p.destination)}` +
      `&checkIn=${p.checkIn}&checkOut=${p.checkOut}` +
      `&adults=${p.adults}&children=${p.children ?? 0}&rooms=${p.rooms ?? 1}`,
  },
  {
    id: 'trivago',
    name: 'Trivago',
    tagline: 'Compare 400+ sites',
    color: '#E32851',
    build: (p) =>
      `https://www.trivago.com/?sem_keyword=${enc(p.destination)}`,
  },
  {
    id: 'tripadvisor',
    name: 'Tripadvisor',
    tagline: 'Reviews + price compare',
    color: '#00AF87',
    build: (p) =>
      `https://www.tripadvisor.com/Search?q=${enc(p.destination)}` +
      `&searchSessionId=&searchNearby=false&sid=&blockRedirect=true&ssrc=h`,
  },
  {
    id: 'kayak',
    name: 'Kayak',
    tagline: 'Meta-search powerhouse',
    color: '#FF690F',
    build: (p) =>
      `https://www.kayak.com/hotels/${enc(p.destination)}/${p.checkIn}/${p.checkOut}/${p.adults}adults`,
  },
  {
    id: 'hostelworld',
    name: 'Hostelworld',
    tagline: 'Budget hostels worldwide',
    color: '#F57C00',
    build: (p) =>
      `https://www.hostelworld.com/pwa/wds/s?q=${enc(p.destination)}` +
      `&country=&city=&type=&from=${p.checkIn}&to=${p.checkOut}&guests=${p.adults}`,
  },
  {
    id: 'homeaway',
    name: 'HomeToGo',
    tagline: '15M vacation rentals',
    color: '#FFB800',
    build: (p) =>
      `https://www.hometogo.com/search/?q=${enc(p.destination)}` +
      `&arrival=${p.checkIn}&departure=${p.checkOut}&adults=${p.adults}`,
  },
  {
    id: 'plumguide',
    name: 'Plum Guide',
    tagline: 'Curated luxury homes',
    color: '#262626',
    build: (p) =>
      `https://www.plumguide.com/search?location=${enc(p.destination)}` +
      `&checkIn=${p.checkIn}&checkOut=${p.checkOut}&adults=${p.adults}`,
  },
]

/* -----------------------------  FLIGHTS  ----------------------------- */

export const FLIGHT_PROVIDERS: Provider[] = [
  {
    id: 'skyscanner',
    name: 'Skyscanner',
    tagline: 'The original flight meta-search',
    color: '#0770E3',
    build: (p) => {
      const from = (p.origin || 'LON').replace(/\s/g, '').toLowerCase()
      const to = p.destination.replace(/\s/g, '').toLowerCase()
      const d = p.checkIn.replace(/-/g, '').slice(2)
      const r = p.checkOut.replace(/-/g, '').slice(2)
      return `https://www.skyscanner.net/transport/flights/${from}/${to}/${d}/${r}/?adults=${p.adults}`
    },
  },
  {
    id: 'google-flights',
    name: 'Google Flights',
    tagline: 'Clean UI, flexible dates',
    color: '#4285F4',
    build: (p) =>
      `https://www.google.com/travel/flights?q=${enc(
        `Flights to ${p.destination} from ${p.origin || 'London'} on ${p.checkIn} returning ${p.checkOut} for ${p.adults} adults`,
      )}`,
  },
  {
    id: 'kayak-flights',
    name: 'Kayak',
    tagline: 'Hacker fares + price alerts',
    color: '#FF690F',
    build: (p) => {
      const from = (p.origin || 'LON').toUpperCase()
      const to = p.destination.toUpperCase().slice(0, 20)
      return `https://www.kayak.com/flights/${from}-${to}/${p.checkIn}/${p.checkOut}/${p.adults}adults`
    },
  },
  {
    id: 'momondo',
    name: 'Momondo',
    tagline: 'Aggregator with great filters',
    color: '#E9105B',
    build: (p) => {
      const from = (p.origin || 'LON').toUpperCase()
      const to = p.destination.toUpperCase().slice(0, 20)
      return `https://www.momondo.com/flight-search/${from}-${to}/${p.checkIn}/${p.checkOut}?sort=price_a`
    },
  },
  {
    id: 'expedia-flights',
    name: 'Expedia',
    tagline: 'Bundle flights + hotels',
    color: '#FFC72C',
    build: (p) =>
      `https://www.expedia.com/Flights-Search?trip=roundtrip&leg1=from:${enc(
        p.origin || 'London',
      )},to:${enc(p.destination)},departure:${p.checkIn}` +
      `&leg2=from:${enc(p.destination)},to:${enc(p.origin || 'London')},departure:${p.checkOut}` +
      `&passengers=adults:${p.adults},children:0,seniors:0,infantinlap:Y`,
  },
  {
    id: 'cheapflights',
    name: 'Cheapflights',
    tagline: 'Bargain hunting since 1996',
    color: '#FF5B00',
    build: (p) => {
      const from = (p.origin || 'LON').toUpperCase()
      const to = p.destination.toUpperCase().slice(0, 20)
      return `https://www.cheapflights.com/flight-search/${from}-${to}/${p.checkIn}/${p.checkOut}`
    },
  },
  {
    id: 'ryanair',
    name: 'Ryanair',
    tagline: 'Europe low-cost king',
    color: '#073590',
    build: (p) =>
      `https://www.ryanair.com/gb/en/trip/flights/select?adults=${p.adults}&teens=0&children=0&infants=0` +
      `&dateOut=${p.checkIn}&dateIn=${p.checkOut}&isConnectedFlight=false&discount=0&promoCode=` +
      `&originIata=${(p.origin || 'STN').toUpperCase()}&destinationIata=${p.destination.toUpperCase().slice(0, 3)}`,
  },
  {
    id: 'easyjet',
    name: 'easyJet',
    tagline: 'Europe short-haul',
    color: '#FF6600',
    build: (p) =>
      `https://www.easyjet.com/en/buy/flights?dep=${(p.origin || 'LGW').toUpperCase()}` +
      `&dest=${p.destination.toUpperCase().slice(0, 3)}&isOneWay=false` +
      `&departureDate=${p.checkIn}&returnDate=${p.checkOut}&adult=${p.adults}`,
  },
  {
    id: 'wizzair',
    name: 'Wizz Air',
    tagline: 'Central + Eastern Europe',
    color: '#C6007E',
    build: (p) =>
      `https://wizzair.com/en-gb/flights/timetable?departureIATA=${(p.origin || 'LTN').toUpperCase()}` +
      `&arrivalIATA=${p.destination.toUpperCase().slice(0, 3)}&from=${p.checkIn}&to=${p.checkOut}`,
  },
]
