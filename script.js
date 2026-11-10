/* ===================================================================
   WeatherNow — Professional Weather Forecast Application
   Vanilla JavaScript with Open-Meteo Public API
   =================================================================== */

/* ======================== CONFIGURATION ======================== */
const CONFIG = {
    weatherApi: 'https://api.open-meteo.com/v1/forecast',
    geocodingApi: 'https://geocoding-api.open-meteo.com/v1/search',
    searchDebounceMs: 350,
    minSearchLength: 2,
    searchResultCount: 10,
    hourlyHours: 24,
    forecastDays: 7,
    defaultCity: 'Jakarta',
    defaultCountry: 'Indonesia'
};

/* ======================== WMO WEATHER CODES ======================== */
const WEATHER_CODES = {
    0:  { label: 'Clear sky',                icon: 'clear' },
    1:  { label: 'Mainly clear',              icon: 'partly-cloudy' },
    2:  { label: 'Partly cloudy',             icon: 'partly-cloudy' },
    3:  { label: 'Overcast',                  icon: 'cloudy' },
    45: { label: 'Foggy',                     icon: 'fog' },
    48: { label: 'Depositing rime fog',        icon: 'fog' },
    51: { label: 'Light drizzle',             icon: 'drizzle' },
    53: { label: 'Moderate drizzle',          icon: 'drizzle' },
    55: { label: 'Dense drizzle',             icon: 'drizzle' },
    56: { label: 'Light freezing drizzle',    icon: 'drizzle' },
    57: { label: 'Dense freezing drizzle',   icon: 'drizzle' },
    61: { label: 'Slight rain',              icon: 'rain' },
    63: { label: 'Moderate rain',            icon: 'rain' },
    65: { label: 'Heavy rain',               icon: 'heavy-rain' },
    66: { label: 'Light freezing rain',      icon: 'rain' },
    67: { label: 'Heavy freezing rain',      icon: 'heavy-rain' },
    71: { label: 'Slight snowfall',          icon: 'snow' },
    73: { label: 'Moderate snowfall',        icon: 'snow' },
    75: { label: 'Heavy snowfall',            icon: 'heavy-snow' },
    77: { label: 'Snow grains',              icon: 'snow' },
    80: { label: 'Slight rain showers',      icon: 'rain' },
    81: { label: 'Moderate rain showers',    icon: 'rain' },
    82: { label: 'Violent rain showers',     icon: 'heavy-rain' },
    85: { label: 'Slight snow showers',      icon: 'snow' },
    86: { label: 'Heavy snow showers',       icon: 'heavy-snow' },
    95: { label: 'Thunderstorm',             icon: 'thunderstorm' },
    96: { label: 'Thunderstorm with slight hail', icon: 'thunderstorm' },
    99: { label: 'Thunderstorm with heavy hail',  icon: 'thunderstorm' }
};

/* ======================== WEATHER ICON SVG ======================== */
let _iconCounter = 0;

/**
 * Returns an SVG string for a weather icon type.
 * @param {string} type - Icon type key
 * @param {number} isDay - 1 for day, 0 for night
 * @returns {string} SVG markup
 */
function getWeatherIconSVG(type, isDay) {
    const id = `wico${++_iconCounter}`;

    // Night variant for clear/partly-cloudy
    if (!isDay) {
        if (type === 'clear') type = 'moon';
        if (type === 'partly-cloudy') type = 'partly-cloudy-night';
    }

    const icons = {
        /* ---- Sun (clear day) ---- */
        'clear': `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <defs><radialGradient id="${id}" cx="50%" cy="40%"><stop offset="0%" stop-color="#FFE066"/><stop offset="70%" stop-color="#FFC107"/><stop offset="100%" stop-color="#FF9800"/></radialGradient></defs>
            <circle cx="50" cy="50" r="20" fill="url(#${id})"/>
            <g stroke="#FFB300" stroke-width="5" stroke-linecap="round">
                <line x1="50" y1="6" x2="50" y2="18"/><line x1="50" y1="82" x2="50" y2="94"/>
                <line x1="6" y1="50" x2="18" y2="50"/><line x1="82" y1="50" x2="94" y2="50"/>
                <line x1="18" y1="18" x2="27" y2="27"/><line x1="73" y1="73" x2="82" y2="82"/>
                <line x1="18" y1="82" x2="27" y2="73"/><line x1="73" y1="27" x2="82" y2="18"/>
            </g>
        </svg>`,

        /* ---- Moon (clear night) ---- */
        'moon': `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <defs><linearGradient id="${id}" x1="20%" y1="10%" x2="80%" y2="90%"><stop offset="0%" stop-color="#E8EAF6"/><stop offset="100%" stop-color="#9FA8DA"/></linearGradient></defs>
            <path d="M58 8 A42 42 0 1 0 58 92 A34 34 0 1 1 58 8 Z" fill="url(#${id})"/>
            <circle cx="72" cy="30" r="3" fill="rgba(255,255,255,0.4)"/>
            <circle cx="64" cy="50" r="2" fill="rgba(255,255,255,0.3)"/>
            <circle cx="76" cy="52" r="2.5" fill="rgba(255,255,255,0.35)"/>
        </svg>`,

        /* ---- Partly cloudy (day) ---- */
        'partly-cloudy': `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <radialGradient id="sun${id}" cx="50%" cy="40%"><stop offset="0%" stop-color="#FFE066"/><stop offset="100%" stop-color="#FFB300"/></radialGradient>
                <linearGradient id="cloud${id}" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#E2E8F0"/><stop offset="100%" stop-color="#94A3B8"/></linearGradient>
            </defs>
            <circle cx="36" cy="34" r="16" fill="url(#sun${id})"/>
            <g stroke="#FFB300" stroke-width="4" stroke-linecap="round">
                <line x1="36" y1="6" x2="36" y2="14"/><line x1="14" y1="34" x2="6" y2="34"/>
                <line x1="20" y1="18" x2="14" y2="12"/><line x1="52" y1="18" x2="58" y2="12"/>
            </g>
            <path d="M30 72 Q18 72 18 58 Q18 46 32 46 Q35 34 50 34 Q66 34 68 48 Q82 48 82 60 Q82 72 70 72 Z" fill="url(#cloud${id})"/>
        </svg>`,

        /* ---- Partly cloudy (night) ---- */
        'partly-cloudy-night': `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="moon${id}" x1="20%" y1="10%" x2="80%" y2="90%"><stop offset="0%" stop-color="#E8EAF6"/><stop offset="100%" stop-color="#9FA8DA"/></linearGradient>
                <linearGradient id="cloud${id}" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#CBD5E1"/><stop offset="100%" stop-color="#64748B"/></linearGradient>
            </defs>
            <path d="M50 10 A28 28 0 1 0 50 66 A22 22 0 1 1 50 10 Z" fill="url(#moon${id})"/>
            <path d="M32 74 Q20 74 20 60 Q20 48 34 48 Q37 38 52 38 Q68 38 70 52 Q84 52 84 64 Q84 74 72 74 Z" fill="url(#cloud${id})"/>
        </svg>`,

        /* ---- Cloudy ---- */
        'cloudy': `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <defs><linearGradient id="${id}" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#D1DBE7"/><stop offset="100%" stop-color="#7891A8"/></linearGradient></defs>
            <path d="M28 70 Q14 70 14 54 Q14 40 30 40 Q33 26 50 26 Q67 26 70 42 Q86 40 86 56 Q86 70 72 70 Z" fill="url(#${id})"/>
        </svg>`,

        /* ---- Fog ---- */
        'fog': `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <defs><linearGradient id="${id}" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#CBD5E1"/><stop offset="100%" stop-color="#94A3B8"/></linearGradient></defs>
            <path d="M28 50 Q14 50 14 36 Q14 24 30 24 Q33 14 50 14 Q67 14 70 28 Q86 26 86 42 Q86 50 72 50 Z" fill="url(#${id})"/>
            <g stroke="#94A3B8" stroke-width="4" stroke-linecap="round">
                <line x1="16" y1="64" x2="78" y2="64"/><line x1="22" y1="76" x2="84" y2="76"/><line x1="16" y1="88" x2="72" y2="88"/>
            </g>
        </svg>`,

        /* ---- Drizzle ---- */
        'drizzle': `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <defs><linearGradient id="${id}" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#CBD5E1"/><stop offset="100%" stop-color="#7891A8"/></linearGradient></defs>
            <path d="M28 52 Q14 52 14 38 Q14 26 30 26 Q33 14 50 14 Q67 14 70 30 Q86 28 86 44 Q86 52 72 52 Z" fill="url(#${id})"/>
            <g fill="#4facfe">
                <circle cx="34" cy="66" r="3"/><circle cx="50" cy="70" r="3"/><circle cx="66" cy="66" r="3"/>
                <circle cx="40" cy="80" r="3"/><circle cx="60" cy="80" r="3"/>
            </g>
        </svg>`,

        /* ---- Rain ---- */
        'rain': `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <defs><linearGradient id="${id}" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#B8C5D6"/><stop offset="100%" stop-color="#6B7F99"/></linearGradient></defs>
            <path d="M28 48 Q14 48 14 34 Q14 22 30 22 Q33 10 50 10 Q67 10 70 26 Q86 24 86 40 Q86 48 72 48 Z" fill="url(#${id})"/>
            <g stroke="#4facfe" stroke-width="3.5" stroke-linecap="round">
                <line x1="32" y1="58" x2="28" y2="72"/><line x1="44" y1="58" x2="40" y2="72"/>
                <line x1="56" y1="58" x2="52" y2="72"/><line x1="68" y1="58" x2="64" y2="72"/>
                <line x1="38" y1="78" x2="34" y2="92"/><line x1="62" y1="78" x2="58" y2="92"/>
            </g>
        </svg>`,

        /* ---- Heavy rain ---- */
        'heavy-rain': `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <defs><linearGradient id="${id}" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#94A3B8"/><stop offset="100%" stop-color="#475569"/></linearGradient></defs>
            <path d="M28 46 Q14 46 14 32 Q14 20 30 20 Q33 8 50 8 Q67 8 70 24 Q86 22 86 38 Q86 46 72 46 Z" fill="url(#${id})"/>
            <g stroke="#3b82f6" stroke-width="4" stroke-linecap="round">
                <line x1="28" y1="56" x2="22" y2="74"/><line x1="38" y1="56" x2="32" y2="74"/>
                <line x1="48" y1="56" x2="42" y2="74"/><line x1="58" y1="56" x2="52" y2="74"/>
                <line x1="68" y1="56" x2="62" y2="74"/><line x1="78" y1="56" x2="72" y2="74"/>
                <line x1="33" y1="80" x2="27" y2="96"/><line x1="53" y1="80" x2="47" y2="96"/>
                <line x1="73" y1="80" x2="67" y2="96"/>
            </g>
        </svg>`,

        /* ---- Snow ---- */
        'snow': `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <defs><linearGradient id="${id}" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#E2E8F0"/><stop offset="100%" stop-color="#94A3B8"/></linearGradient></defs>
            <path d="M28 50 Q14 50 14 36 Q14 24 30 24 Q33 12 50 12 Q67 12 70 28 Q86 26 86 42 Q86 50 72 50 Z" fill="url(#${id})"/>
            <g fill="#E0F2FE" stroke="#BFDBFE" stroke-width="1">
                <circle cx="34" cy="68" r="4"/><circle cx="54" cy="72" r="4"/><circle cx="72" cy="66" r="4"/>
                <circle cx="42" cy="86" r="4"/><circle cx="64" cy="88" r="4"/>
            </g>
        </svg>`,

        /* ---- Heavy snow ---- */
        'heavy-snow': `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <defs><linearGradient id="${id}" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#CBD5E1"/><stop offset="100%" stop-color="#64748B"/></linearGradient></defs>
            <path d="M28 46 Q14 46 14 32 Q14 20 30 20 Q33 8 50 8 Q67 8 70 24 Q86 22 86 38 Q86 46 72 46 Z" fill="url(#${id})"/>
            <g fill="#E0F2FE" stroke="#BFDBFE" stroke-width="1">
                <circle cx="28" cy="62" r="4"/><circle cx="44" cy="58" r="4"/><circle cx="60" cy="62" r="4"/>
                <circle cx="76" cy="58" r="4"/><circle cx="36" cy="78" r="4"/><circle cx="52" cy="74" r="4"/>
                <circle cx="68" cy="78" r="4"/><circle cx="44" cy="92" r="4"/><circle cx="64" cy="92" r="4"/>
            </g>
        </svg>`,

        /* ---- Thunderstorm ---- */
        'thunderstorm': `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="cloud${id}" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#64748B"/><stop offset="100%" stop-color="#334155"/></linearGradient>
                <linearGradient id="bolt${id}" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#FBBF24"/><stop offset="100%" stop-color="#F59E0B"/></linearGradient>
            </defs>
            <path d="M28 48 Q14 48 14 34 Q14 22 30 22 Q33 10 50 10 Q67 10 70 26 Q86 24 86 40 Q86 48 72 48 Z" fill="url(#cloud${id})"/>
            <path d="M52 50 L40 74 L50 74 L44 92 L64 66 L52 66 L58 50 Z" fill="url(#bolt${id})"/>
        </svg>`
    };

    return icons[type] || icons['cloudy'];
}

/* ======================== STAT CARD ICONS ======================== */
const STAT_ICONS = {
    humidity: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C12 2 5 10 5 15C5 18.866 8.134 22 12 22C15.866 22 19 18.866 19 15C19 10 12 2 12 2Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M9 15C9 16.5 10 18 12 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`,
    wind: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 8H14C15.657 8 17 6.657 17 5C17 3.343 15.657 2 14 2C12.343 2 11 3.343 11 5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M3 12H19C20.657 12 22 13.343 22 15C22 16.657 20.657 18 19 18C17.343 18 16 16.657 16 15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M3 16H11C12.657 16 14 17.343 14 19C14 20.657 12.657 22 11 22C9.343 22 8 20.657 8 19" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`,
    direction: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/><path d="M12 4L15 12L12 10L9 12L12 4Z" fill="currentColor"/><path d="M12 20L9 12L12 14L15 12L12 20Z" fill="currentColor" opacity="0.4"/></svg>`,
    uv: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="2"/><g stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="12" y1="2" x2="12" y2="5"/><line x1="12" y1="19" x2="12" y2="22"/><line x1="2" y1="12" x2="5" y2="12"/><line x1="19" y1="12" x2="22" y2="12"/><line x1="4.93" y1="4.93" x2="7.05" y2="7.05"/><line x1="16.95" y1="16.95" x2="19.07" y2="19.07"/><line x1="4.93" y1="19.07" x2="7.05" y2="16.95"/><line x1="16.95" y1="7.05" x2="19.07" y2="4.93"/></g></svg>`,
    visibility: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2 12C2 12 5 5 12 5C19 5 22 12 22 12C22 12 19 19 12 19C5 19 2 12 2 12Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/></svg>`,
    pressure: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.477 2 2 6.477 2 12C2 17.523 6.477 22 12 22C17.523 22 22 17.523 22 12C22 6.477 17.523 2 12 2Z" stroke="currentColor" stroke-width="2"/><path d="M12 12L16 8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/></svg>`,
    precip: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C12 2 6 8 6 13C6 16.314 8.686 19 12 19C15.314 19 18 16.314 18 13C18 8 12 2 12 2Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><line x1="9" y1="13" x2="11" y2="15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`,
    rain: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7 14C4.79 14 3 12.21 3 10C3 8.14 4.28 6.56 6 6.14C6.63 3.75 8.78 2 11.5 2C14.5 2 17 4.5 17 7.5C17 7.67 16.99 7.83 16.97 8C18.89 8.24 20.4 9.86 20.4 11.8C20.4 13.8 18.8 15.4 16.8 15.4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><line x1="8" y1="18" x2="6" y2="22" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="14" y1="18" x2="12" y2="22" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`
};

/* ======================== DOM ELEMENTS ======================== */
const el = {
    searchInput:     document.getElementById('searchInput'),
    searchClear:     document.getElementById('searchClear'),
    searchSpinner:   document.getElementById('searchSpinner'),
    searchResults:   document.getElementById('searchResults'),
    locationBtn:     document.getElementById('locationBtn'),
    loadingState:    document.getElementById('loadingState'),
    errorState:      document.getElementById('errorState'),
    errorMessage:    document.getElementById('errorMessage'),
    retryBtn:        document.getElementById('retryBtn'),
    weatherContent:  document.getElementById('weatherContent'),
    cityName:        document.getElementById('cityName'),
    countryName:     document.getElementById('countryName'),
    localTime:       document.getElementById('localTime'),
    localDate:       document.getElementById('localDate'),
    currentWeatherIcon: document.getElementById('currentWeatherIcon'),
    currentTemp:     document.getElementById('currentTemp'),
    weatherDescription: document.getElementById('weatherDescription'),
    feelsLike:       document.getElementById('feelsLike'),
    lastUpdated:     document.getElementById('lastUpdated'),
    statsGrid:       document.getElementById('statsGrid'),
    hourlyContainer: document.getElementById('hourlyContainer'),
    dailyContainer:  document.getElementById('dailyContainer'),
    brandIcon:       document.getElementById('brandIcon')
};

/* ======================== STATE ======================== */
let state = {
    currentLocation: null,
    searchTimeout: null,
    lastAction: null,   // For retry button
    selectedResultIndex: -1
};

/* ======================== UTILITY FUNCTIONS ======================== */

/** Format hour from ISO time string: "2024-01-15T14:00" → "14:00" */
function formatHour(isoTime) {
    const timePart = isoTime.split('T')[1] || '';
    const [h, m] = timePart.split(':').map(Number);
    return `${String(h).padStart(2, '0')}:${String(m || 0).padStart(2, '0')}`;
}

/** Format hour with AM/PM: "2024-01-15T14:00" → "2 PM" */
function formatHourShort(isoTime) {
    const timePart = isoTime.split('T')[1] || '';
    const h = parseInt(timePart.split(':')[0], 10);
    const period = h >= 12 ? 'PM' : 'AM';
    const displayH = h % 12 || 12;
    return `${displayH} ${period}`;
}

/** Get day name from date string: "2024-01-15" → "Monday" */
function getDayName(dateStr, short = false) {
    const [y, m, d] = dateStr.split('-').map(Number);
    const date = new Date(Date.UTC(y, m - 1, d));
    const options = short
        ? { weekday: 'short', timeZone: 'UTC' }
        : { weekday: 'long', timeZone: 'UTC' };
    return date.toLocaleDateString('en-US', options);
}

/** Format full date: "2024-01-15" → "Monday, January 15" */
function formatFullDate(isoString) {
    const datePart = isoString.split('T')[0];
    const [y, m, d] = datePart.split('-').map(Number);
    const date = new Date(Date.UTC(y, m - 1, d));
    return date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        timeZone: 'UTC'
    });
}

/** Convert wind direction degrees to compass direction */
function getWindDirection(deg) {
    const dirs = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const idx = Math.round(deg / 22.5) % 16;
    return dirs[idx];
}

/** Get UV index level descriptor and color */
function getUVLevel(uv) {
    if (uv == null) return { label: '—', color: '#6b87a8' };
    if (uv <= 2)   return { label: 'Low', color: '#4ade80' };
    if (uv <= 5)   return { label: 'Moderate', color: '#fbbf24' };
    if (uv <= 7)   return { label: 'High', color: '#fb923c' };
    if (uv <= 10)  return { label: 'Very High', color: '#f87171' };
    return { label: 'Extreme', color: '#c084fc' };
}

/** Get humidity comfort level */
function getHumidityLevel(h) {
    if (h == null) return '—';
    if (h < 30) return 'Dry';
    if (h <= 60) return 'Comfortable';
    return 'Humid';
}

/** Get visibility description from meters */
function getVisibilityDesc(meters) {
    if (meters == null) return '—';
    const km = meters / 1000;
    if (km >= 10) return 'Excellent';
    if (km >= 5)  return 'Good';
    if (km >= 2)  return 'Moderate';
    return 'Poor';
}

/** Get pressure description from hPa */
function getPressureDesc(hpa) {
    if (hpa == null) return '—';
    if (hpa < 1000) return 'Low';
    if (hpa < 1020) return 'Normal';
    return 'High';
}

/** Round number safely */
function round(n) {
    if (n == null || isNaN(n)) return null;
    return Math.round(n);
}

/** Build weather API URL */
function buildWeatherUrl(lat, lon) {
    const params = new URLSearchParams({
        latitude: lat,
        longitude: lon,
        current: [
            'temperature_2m',
            'relative_humidity_2m',
            'apparent_temperature',
            'is_day',
            'precipitation',
            'weather_code',
            'wind_speed_10m',
            'wind_direction_10m',
            'surface_pressure'
        ].join(','),
        hourly: [
            'temperature_2m',
            'weather_code',
            'precipitation_probability',
            'visibility',
            'uv_index'
        ].join(','),
        daily: [
            'weather_code',
            'temperature_2m_max',
            'temperature_2m_min',
            'precipitation_sum',
            'uv_index_max'
        ].join(','),
        timezone: 'auto',
        forecast_days: CONFIG.forecastDays
    });
    return `${CONFIG.weatherApi}?${params.toString()}`;
}

/* ======================== API FUNCTIONS ======================== */

/** Search cities via Geocoding API */
async function searchCities(query) {
    const params = new URLSearchParams({
        name: query,
        count: CONFIG.searchResultCount,
        language: 'en',
        format: 'json'
    });
    const url = `${CONFIG.geocodingApi}?${params.toString()}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Geocoding API error: ${res.status}`);
    return res.json();
}

/** Fetch weather data from Weather API */
async function fetchWeather(lat, lon) {
    const url = buildWeatherUrl(lat, lon);
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Weather API error: ${res.status}`);
    return res.json();
}

/* ======================== RENDER FUNCTIONS ======================== */

/** Find the index in hourly arrays closest to current time */
function findCurrentHourIndex(data) {
    const currentTime = data.current?.time;
    if (!currentTime) return 0;
    const hourlyTimes = data.hourly?.time || [];
    const idx = hourlyTimes.findIndex(t => t === currentTime);
    return idx >= 0 ? idx : 0;
}

/** Render the current weather section */
function renderCurrentWeather(data, locationName) {
    const c = data.current;
    if (!c) return;

    const wc = WEATHER_CODES[c.weather_code] || { label: 'Unknown', icon: 'cloudy' };
    const isDay = c.is_day;

    // Location
    el.cityName.textContent = locationName.name;
    el.countryName.textContent = locationName.country;

    // Time and date from current.time (already in local timezone via timezone=auto)
    const timeStr = c.time || '';
    el.localTime.textContent = formatHour(timeStr);
    el.localDate.textContent = formatFullDate(timeStr);

    // Weather icon
    el.currentWeatherIcon.innerHTML = getWeatherIconSVG(wc.icon, isDay);

    // Temperature
    el.currentTemp.textContent = round(c.temperature_2m) ?? '—';

    // Description and feels like
    el.weatherDescription.textContent = wc.label;
    const feels = round(c.apparent_temperature);
    el.feelsLike.textContent = `Feels like ${feels ?? '—'}°C`;

    // Last updated
    el.lastUpdated.textContent = `Last updated: ${formatHour(timeStr)}`;
}

/** Render the statistics cards */
function renderStats(data) {
    const c = data.current;
    if (!c) return;

    // Get UV index and visibility from hourly data at current hour
    const hourIdx = findCurrentHourIndex(data);
    const uvIndex = data.hourly?.uv_index?.[hourIdx];
    const visibility = data.hourly?.visibility?.[hourIdx];

    const uvLevel = getUVLevel(uvIndex);
    const windDir = getWindDirection(c.wind_direction_10m);
    const visKm = visibility != null ? (visibility / 1000).toFixed(1) : null;

    const stats = [
        {
            iconClass: 'humidity',
            label: 'Humidity',
            value: c.relative_humidity_2m != null ? c.relative_humidity_2m : '—',
            unit: '%',
            desc: getHumidityLevel(c.relative_humidity_2m)
        },
        {
            iconClass: 'wind',
            label: 'Wind Speed',
            value: round(c.wind_speed_10m) ?? '—',
            unit: ' km/h',
            desc: null
        },
        {
            iconClass: 'direction',
            label: 'Wind Direction',
            value: windDir,
            unit: '',
            desc: `${Math.round(c.wind_direction_10m ?? 0)}°`
        },
        {
            iconClass: 'uv',
            label: 'UV Index',
            value: uvIndex != null ? uvIndex.toFixed(1) : '—',
            unit: '',
            desc: uvLevel.label
        },
        {
            iconClass: 'visibility',
            label: 'Visibility',
            value: visKm ?? '—',
            unit: ' km',
            desc: getVisibilityDesc(visibility)
        },
        {
            iconClass: 'pressure',
            label: 'Pressure',
            value: round(c.surface_pressure) ?? '—',
            unit: ' hPa',
            desc: getPressureDesc(c.surface_pressure)
        },
        {
            iconClass: 'precip',
            label: 'Precipitation',
            value: c.precipitation != null ? c.precipitation.toFixed(1) : '—',
            unit: ' mm',
            desc: null
        }
    ];

    el.statsGrid.innerHTML = stats.map(s => `
        <div class="stat-card">
            <div class="stat-card-header">
                <div class="stat-card-icon stat-icon-${s.iconClass}">
                    ${STAT_ICONS[s.iconClass]}
                </div>
                <span class="stat-card-label">${s.label}</span>
            </div>
            <div class="stat-card-value">
                ${s.value}<span class="stat-card-unit">${s.unit}</span>
            </div>
            ${s.desc ? `<div class="stat-card-desc">${s.desc}</div>` : ''}
        </div>
    `).join('');
}

/** Render the hourly forecast section */
function renderHourlyForecast(data) {
    const hourly = data.hourly;
    if (!hourly || !hourly.time) return;

    const startIdx = findCurrentHourIndex(data);
    const hours = [];

    for (let i = startIdx; i < startIdx + CONFIG.hourlyHours && i < hourly.time.length; i++) {
        hours.push({
            time: hourly.time[i],
            temp: hourly.temperature_2m?.[i],
            code: hourly.weather_code?.[i],
            rainProb: hourly.precipitation_probability?.[i],
            isDay: isHourDaytime(hourly.time[i])
        });
    }

    el.hourlyContainer.innerHTML = hours.map((h, idx) => {
        const wc = WEATHER_CODES[h.code] || { label: 'Unknown', icon: 'cloudy' };
        const timeLabel = idx === 0 ? 'Now' : formatHourShort(h.time);
        const rainPct = h.rainProb != null ? h.rainProb : null;

        return `
            <div class="hourly-item ${idx === 0 ? 'now' : ''}">
                <span class="hourly-time">${timeLabel}</span>
                <div class="hourly-icon">${getWeatherIconSVG(wc.icon, h.isDay)}</div>
                <span class="hourly-temp">${round(h.temp) ?? '—'}°</span>
                ${rainPct != null && rainPct > 0 ? `
                    <span class="hourly-rain">
                        ${STAT_ICONS.rain}
                        ${rainPct}%
                    </span>
                ` : ''}
            </div>
        `;
    }).join('');
}

/** Determine if an hour is daytime (rough estimate 6am–6pm) */
function isHourDaytime(isoTime) {
    const timePart = isoTime.split('T')[1] || '';
    const h = parseInt(timePart.split(':')[0], 10);
    return h >= 6 && h < 19 ? 1 : 0;
}

/** Render the 7-day forecast section */
function renderDailyForecast(data) {
    const daily = data.daily;
    if (!daily || !daily.time) return;

    // Find global min and max for the temperature bar
    const allMins = daily.temperature_2m_min.filter(v => v != null);
    const allMaxs = daily.temperature_2m_max.filter(v => v != null);
    const globalMin = allMins.length ? Math.min(...allMins) : 0;
    const globalMax = allMaxs.length ? Math.max(...allMaxs) : 100;
    const range = globalMax - globalMin || 1;

    // Use the date from current.time (already in local timezone via timezone=auto)
    const today = (data.current?.time || '').split('T')[0] || new Date().toISOString().split('T')[0];

    el.dailyContainer.innerHTML = daily.time.map((dateStr, i) => {
        const wc = WEATHER_CODES[daily.weather_code?.[i]] || { label: 'Unknown', icon: 'cloudy' };
        const dayName = getDayName(dateStr, true);
        const isToday = dateStr === today;
        const displayDay = isToday ? 'Today' : dayName;

        const tMin = round(daily.temperature_2m_min?.[i]);
        const tMax = round(daily.temperature_2m_max?.[i]);
        const precip = daily.precipitation_sum?.[i];

        // Temperature bar positioning
        const leftPct = ((tMin - globalMin) / range) * 100;
        const widthPct = ((tMax - tMin) / range) * 100;
        const isDay = 1;

        const precipStr = precip != null && precip > 0
            ? `${precip.toFixed(1)} mm`
            : 'Dry';

        return `
            <div class="daily-item">
                <span class="daily-day ${isToday ? 'daily-day-today' : ''}">${displayDay}</span>
                <div class="daily-icon">${getWeatherIconSVG(wc.icon, isDay)}</div>
                <div class="daily-temp-bar">
                    <span class="daily-temp-min">${tMin ?? '—'}°</span>
                    <div class="daily-bar-wrap">
                        <div class="daily-bar-fill" style="left:${leftPct}%; width:${Math.max(widthPct, 5)}%;"></div>
                    </div>
                    <span class="daily-temp-max">${tMax ?? '—'}°</span>
                </div>
                <span class="daily-precip ${precip == null || precip === 0 ? 'dry' : ''}">
                    ${STAT_ICONS.rain}
                    ${precipStr}
                </span>
            </div>
        `;
    }).join('');
}

/** Render all weather sections */
function renderWeather(data, locationName) {
    renderCurrentWeather(data, locationName);
    renderStats(data);
    renderHourlyForecast(data);
    renderDailyForecast(data);
}

/* ======================== STATE MANAGEMENT ======================== */

function showLoading() {
    el.loadingState.style.display = 'flex';
    el.errorState.style.display = 'none';
    el.weatherContent.style.display = 'none';
}

function showError(message, action) {
    el.loadingState.style.display = 'none';
    el.weatherContent.style.display = 'none';
    el.errorState.style.display = 'flex';
    el.errorMessage.textContent = message;
    state.lastAction = action;
}

function showWeather() {
    el.loadingState.style.display = 'none';
    el.errorState.style.display = 'none';
    el.weatherContent.style.display = 'flex';
}

/* ======================== MAIN FLOW ======================== */

/** Load weather for a location (either city or coordinates) */
async function loadWeather(lat, lon, name, country) {
    showLoading();

    try {
        const data = await fetchWeather(lat, lon);
        state.currentLocation = { lat, lon, name, country };
        renderWeather(data, { name, country });
        showWeather();
    } catch (err) {
        console.error('Weather fetch error:', err);

        if (!navigator.onLine) {
            showError(
                'No internet connection. Please check your network and try again.',
                () => loadWeather(lat, lon, name, country)
            );
        } else {
            showError(
                'Unable to fetch weather data. The service may be temporarily unavailable.',
                () => loadWeather(lat, lon, name, country)
            );
        }
    }
}

/** Load weather for a city by searching the Geocoding API first */
async function loadWeatherByCity(cityName) {
    showLoading();

    try {
        const result = await searchCities(cityName);

        if (!result.results || result.results.length === 0) {
            showError(
                `No city found for "${cityName}". Please check the spelling and try again.`,
                () => loadWeatherByCity(cityName)
            );
            return;
        }

        const city = result.results[0];
        await loadWeather(city.latitude, city.longitude, city.name, city.country);
    } catch (err) {
        console.error('Geocoding error:', err);
        showError(
            'Unable to search for cities. Please check your internet connection.',
            () => loadWeatherByCity(cityName)
        );
    }
}

/** Load weather using browser Geolocation API */
function loadWeatherByGeolocation() {
    if (!navigator.geolocation) {
        showError(
            'Geolocation is not supported by your browser. Please search for a city manually.',
            null
        );
        return;
    }

    el.locationBtn.disabled = true;
    showLoading();

    navigator.geolocation.getCurrentPosition(
        async (position) => {
            const { latitude, longitude } = position.coords;
            const latStr = Math.abs(latitude).toFixed(2) + (latitude >= 0 ? '°N' : '°S');
            const lonStr = Math.abs(longitude).toFixed(2) + (longitude >= 0 ? '°E' : '°W');

            try {
                const data = await fetchWeather(latitude, longitude);
                state.currentLocation = { lat: latitude, lon: longitude, name: 'Current Location', country: `${latStr}, ${lonStr}` };
                renderWeather(data, { name: 'Current Location', country: `${latStr}, ${lonStr}` });
                showWeather();
            } catch (err) {
                console.error('Weather fetch error (geolocation):', err);
                showError(
                    'Unable to fetch weather for your location. Please try again or search for a city manually.',
                    () => loadWeatherByGeolocation()
                );
            } finally {
                el.locationBtn.disabled = false;
            }
        },
        (error) => {
            el.locationBtn.disabled = false;
            let msg;
            switch (error.code) {
                case error.PERMISSION_DENIED:
                    msg = 'Location access denied. Please search for a city manually using the search bar above.';
                    break;
                case error.POSITION_UNAVAILABLE:
                    msg = 'Location information is unavailable. Please search for a city manually.';
                    break;
                case error.TIMEOUT:
                    msg = 'Location request timed out. Please try again or search for a city manually.';
                    break;
                default:
                    msg = 'An unknown error occurred while getting your location. Please search for a city manually.';
            }
            showError(msg, null);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    );
}

/* ======================== SEARCH FUNCTIONALITY ======================== */

/** Handle search input with debouncing */
function handleSearchInput(e) {
    const query = e.target.value.trim();

    // Show/hide clear button
    el.searchClear.classList.toggle('visible', query.length > 0);

    if (query.length < CONFIG.minSearchLength) {
        hideSearchDropdown();
        return;
    }

    clearTimeout(state.searchTimeout);

    state.searchTimeout = setTimeout(async () => {
        await performSearch(query);
    }, CONFIG.searchDebounceMs);
}

/** Perform the actual city search */
async function performSearch(query) {
    el.searchSpinner.classList.add('active');
    state.selectedResultIndex = -1;

    try {
        const result = await searchCities(query);

        if (!result.results || result.results.length === 0) {
            el.searchResults.innerHTML = `
                <div class="search-no-results">No cities found for "${query}"</div>
            `;
            showSearchDropdown();
            return;
        }

        el.searchResults.innerHTML = result.results.map((city, idx) => {
            const region = [city.admin1, city.country].filter(Boolean).join(', ');
            return `
                <div class="search-item" data-lat="${city.latitude}" data-lon="${city.longitude}" data-name="${escapeHtml(city.name)}" data-country="${escapeHtml(city.country)}" data-idx="${idx}">
                    <div class="search-item-icon">
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2C8.13 2 5 5.13 5 9C5 13.5 12 22 12 22S19 13.5 19 9C19 5.13 15.87 2 12 2Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
                            <circle cx="12" cy="9" r="2.5" stroke="currentColor" stroke-width="2"/>
                        </svg>
                    </div>
                    <div class="search-item-info">
                        <div class="search-item-name">${escapeHtml(city.name)}</div>
                        <div class="search-item-region">${escapeHtml(region)}</div>
                    </div>
                </div>
            `;
        }).join('');

        showSearchDropdown();

        // Attach click handlers
        el.searchResults.querySelectorAll('.search-item').forEach(item => {
            item.addEventListener('click', () => {
                const lat = parseFloat(item.dataset.lat);
                const lon = parseFloat(item.dataset.lon);
                const name = item.dataset.name;
                const country = item.dataset.country;

                hideSearchDropdown();
                el.searchInput.value = '';
                el.searchClear.classList.remove('visible');
                loadWeather(lat, lon, name, country);
            });
        });
    } catch (err) {
        console.error('Search error:', err);
        el.searchResults.innerHTML = `
            <div class="search-no-results">Search failed. Please check your connection.</div>
        `;
        showSearchDropdown();
    } finally {
        el.searchSpinner.classList.remove('active');
    }
}

function showSearchDropdown() {
    el.searchResults.classList.add('visible');
}

function hideSearchDropdown() {
    el.searchResults.classList.remove('visible');
    state.selectedResultIndex = -1;
}

/** Handle keyboard navigation in search results */
function handleSearchKeydown(e) {
    const items = el.searchResults.querySelectorAll('.search-item');
    if (items.length === 0) return;

    if (e.key === 'ArrowDown') {
        e.preventDefault();
        state.selectedResultIndex = Math.min(state.selectedResultIndex + 1, items.length - 1);
        updateSelectedResult(items);
    } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        state.selectedResultIndex = Math.max(state.selectedResultIndex - 1, 0);
        updateSelectedResult(items);
    } else if (e.key === 'Enter') {
        e.preventDefault();
        if (state.selectedResultIndex >= 0 && items[state.selectedResultIndex]) {
            items[state.selectedResultIndex].click();
        }
    } else if (e.key === 'Escape') {
        hideSearchDropdown();
    }
}

function updateSelectedResult(items) {
    items.forEach((item, idx) => {
        item.classList.toggle('highlighted', idx === state.selectedResultIndex);
    });
}

/** Escape HTML to prevent XSS in search results */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/* ======================== BRAND ICON ======================== */
function setBrandIcon() {
    el.brandIcon.innerHTML = `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="brandGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#00897b"/>
                <stop offset="100%" stop-color="#26a69a"/>
            </linearGradient>
        </defs>
        <circle cx="50" cy="38" r="16" fill="url(#brandGrad)"/>
        <g stroke="url(#brandGrad)" stroke-width="4" stroke-linecap="round">
            <line x1="50" y1="6" x2="50" y2="14"/>
            <line x1="22" y1="38" x2="14" y2="38"/>
            <line x1="78" y1="38" x2="86" y2="38"/>
            <line x1="28" y1="16" x2="22" y2="10"/>
            <line x1="72" y1="16" x2="78" y2="10"/>
        </g>
        <path d="M28 72 Q16 72 16 60 Q16 48 30 48 Q32 38 46 38 Q62 38 64 50 Q78 48 78 60 Q78 72 66 72 Z" fill="url(#brandGrad)" opacity="0.85"/>
    </svg>`;
}

/* ======================== EVENT LISTENERS ======================== */

function setupEventListeners() {
    // Search input
    el.searchInput.addEventListener('input', handleSearchInput);
    el.searchInput.addEventListener('keydown', handleSearchKeydown);

    // Clear search
    el.searchClear.addEventListener('click', () => {
        el.searchInput.value = '';
        el.searchClear.classList.remove('visible');
        hideSearchDropdown();
        el.searchInput.focus();
    });

    // Click outside search to close dropdown
    document.addEventListener('click', (e) => {
        if (!el.searchInput.contains(e.target) && !el.searchResults.contains(e.target)) {
            hideSearchDropdown();
        }
    });

    // Location button
    el.locationBtn.addEventListener('click', loadWeatherByGeolocation);

    // Retry button
    el.retryBtn.addEventListener('click', () => {
        if (state.lastAction) {
            state.lastAction();
        } else {
            init();
        }
    });
}

/* ======================== INITIALIZATION ======================== */

async function init() {
    setBrandIcon();
    setupEventListeners();
    showLoading();

    // Try to load default city (Jakarta)
    await loadWeatherByCity(CONFIG.defaultCity);
}

// Start the application
init();
