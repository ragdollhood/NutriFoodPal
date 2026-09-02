/* Hundväder – väderlogik
   Källor: SMHI Open Data (svenska platser, i första hand) och Open-Meteo (globalt, samt reserv om SMHI inte svarar).
   Ingen API-nyckel krävs för någon av tjänsterna. */

const $ = s => document.querySelector(s);
const statusEl = $('#searchStatus');
const dailyEl = $('#daily');
const bestWalkEl = $('#bestWalk');
const currentEl = $('#current');
const alertsEl = $('#alerts');
const walkAdviceEl = $('#walkAdvice');
const placeResultsEl = $('#placeResults');
const updatedEl = $('#updated');
const heroImgEl = $('#heroImg');
const heroImgWebpEl = $('#heroImgWebp');

const SMHI_BASE = 'https://opendata-download-metfcst.smhi.se/api/category/snow1g/version/1';

/* ---------- Hjälpfunktioner ---------- */

function escapeHtml(str) {
  if (str == null) return '';
  return String(str).replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

function n(v, d = 0) {
  return (v == null || Number.isNaN(Number(v))) ? '–' : Number(v).toFixed(d);
}

function val(obj, name) {
  if (!obj || !obj.data) return null;
  if (Array.isArray(obj.data)) {
    const v = obj.data.find(x => x && x.name === name);
    return v?.value ?? v?.values?.[0] ?? null;
  }
  if (typeof obj.data === 'object') {
    const v = obj.data[name];
    if (v == null) return null;
    if (typeof v === 'object') return v.value ?? v.values?.[0] ?? null;
    return v;
  }
  return null;
}

/* ---------- Temperaturenhet ---------- */
/* Alla väderkällor hämtas och beräknas internt i Celsius (bland annat för att
   Hundkomfortindex-tröskelvärdena är satta i Celsius). Vid visning väljer vi
   automatiskt Fahrenheit för länder som normalt använder det i vardagen. */

const FAHRENHEIT_COUNTRIES = new Set(['US', 'BS', 'BZ', 'KY', 'PW', 'LR', 'FM', 'MH']);

function tempUnitFor(countryCode) {
  return FAHRENHEIT_COUNTRIES.has((countryCode || '').toUpperCase()) ? 'F' : 'C';
}

function formatTemp(celsius, unit, decimals = 0) {
  if (celsius == null || Number.isNaN(Number(celsius))) return '–';
  const value = unit === 'F' ? (Number(celsius) * 9 / 5 + 32) : Number(celsius);
  return value.toFixed(decimals);
}

/* ---------- Vädersymboler: en gemensam uppsättning oavsett datakälla ---------- */

const conditionInfo = {
  clear: ['☀️', 'Klart'],
  mostlyClear: ['🌤️', 'Nästan klart'],
  partlyCloudy: ['⛅', 'Växlande molnighet'],
  cloudy: ['☁️', 'Halvklart'],
  overcast: ['☁️', 'Mulet'],
  fog: ['🌫️', 'Dimma'],
  drizzle: ['🌦️', 'Lätt duggregn'],
  rainLight: ['🌦️', 'Lätta regnskurar'],
  rain: ['🌧️', 'Regn'],
  rainHeavy: ['🌧️', 'Kraftigt regn'],
  thunder: ['⛈️', 'Åska'],
  sleet: ['🌨️', 'Snöblandat regn'],
  snowLight: ['🌨️', 'Lätt snöfall'],
  snow: ['❄️', 'Snöfall'],
  snowHeavy: ['❄️', 'Kraftigt snöfall'],
  unknown: ['🌤️', 'Växlande väder']
};

/* ---------- Hero-bakgrund: väljer en av de fördefinierade foton beroende på väder ---------- */
/* "hero-fog" och "hero-windy" är reserverade som stillbilder för sektionerna "Vädertolkning
   för hunden" och "Kommande dagar" (se styles.css) och används därför inte i hjältebilden,
   så att den bakgrunden aldrig visar samma foto som just då syns i hero-sektionen. */

const HERO_SNOWY = new Set(['snow', 'snowLight', 'snowHeavy', 'sleet']);
const HERO_RAINY = new Set(['rain', 'rainLight', 'rainHeavy', 'drizzle', 'thunder']);

function chooseHeroImage(cur) {
  if (cur.isDay === false) return 'hero-evening';
  if (HERO_SNOWY.has(cur.condition)) return 'hero-snow';
  if (HERO_RAINY.has(cur.condition)) return 'hero-rain';
  const feelsLike = cur.apparentTemp != null ? cur.apparentTemp : cur.temp;
  if (feelsLike != null && feelsLike >= 24) return 'hero-hot';
  return 'hero-sun';
}

function updateHeroBackground(cur, altText) {
  if (!heroImgEl || !heroImgWebpEl) return;
  const base = chooseHeroImage(cur);
  heroImgWebpEl.srcset = `assets/${base}.webp`;
  heroImgEl.src = `assets/${base}.jpg`;
  if (altText) heroImgEl.alt = altText;
}

// SMHI:s kodtabell Wsymb2 (1–27). Källa: SMHI Öppna data, https://opendata.smhi.se/
function smhiCondition(code) {
  const map = {
    1: 'clear', 2: 'mostlyClear', 3: 'partlyCloudy', 4: 'partlyCloudy', 5: 'cloudy', 6: 'overcast',
    7: 'fog', 8: 'rainLight', 9: 'rain', 10: 'rainHeavy', 11: 'thunder', 12: 'sleet', 13: 'sleet',
    14: 'sleet', 15: 'snowLight', 16: 'snow', 17: 'snowHeavy', 18: 'rainLight', 19: 'rain',
    20: 'rainHeavy', 21: 'thunder', 22: 'sleet', 23: 'sleet', 24: 'sleet', 25: 'snowLight',
    26: 'snow', 27: 'snowHeavy'
  };
  return map[code] || 'unknown';
}

// WMO-vädertabell som Open-Meteo använder.
function wmoCondition(code) {
  const map = {
    0: 'clear', 1: 'mostlyClear', 2: 'partlyCloudy', 3: 'overcast', 45: 'fog', 48: 'fog',
    51: 'drizzle', 53: 'drizzle', 55: 'drizzle', 56: 'sleet', 57: 'sleet', 61: 'rainLight',
    63: 'rain', 65: 'rainHeavy', 66: 'sleet', 67: 'sleet', 71: 'snowLight', 73: 'snow',
    75: 'snowHeavy', 77: 'snowLight', 80: 'rainLight', 81: 'rain', 82: 'rainHeavy',
    85: 'snowLight', 86: 'snowHeavy', 95: 'thunder', 96: 'thunder', 99: 'thunder'
  };
  return map[code] || 'unknown';
}

/* ---------- Platssökning: Open-Meteo Geocoding (globalt, ingen landsbegränsning) ---------- */

async function geocodeOpenMeteo(query) {
  const u = new URL('https://geocoding-api.open-meteo.com/v1/search');
  u.searchParams.set('name', query);
  u.searchParams.set('count', '5');
  u.searchParams.set('language', 'sv');
  u.searchParams.set('format', 'json');

  let r;
  try {
    r = await fetch(u);
  } catch (err) {
    throw new Error('Kunde inte nå platssökningen. Kontrollera din internetanslutning.');
  }
  if (!r.ok) throw new Error('Platssökningen svarade inte som väntat. Försök igen om en stund.');

  const data = await r.json();
  const results = Array.isArray(data.results) ? data.results : [];
  if (!results.length) throw new Error('Jag hittade ingen plats med det namnet. Prova att skriva ort, region eller land.');

  return results.map(x => ({
    lat: x.latitude,
    lon: x.longitude,
    name: x.name || query,
    admin1: x.admin1 || '',
    country: x.country || '',
    countryCode: (x.country_code || '').toUpperCase(),
    timezone: x.timezone || null
  }));
}

// Nominatim används enbart för att slå upp ett platsnamn utifrån koordinater (positionsknappen).
async function reverseGeocode(lat, lon) {
  try {
    const u = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&zoom=10`;
    const r = await fetch(u, { headers: { 'Accept-Language': 'sv' } });
    if (!r.ok) throw new Error('no');
    const x = await r.json();
    const addr = x.address || {};
    const name = addr.city || addr.town || addr.village || addr.municipality || addr.county || 'Din position';
    const countryCode = (addr.country_code || '').toUpperCase();
    return { name, countryCode };
  } catch {
    return { name: 'Din position', countryCode: '' };
  }
}

/* ---------- Väderdata: hämtning och normalisering ---------- */

async function fetchSmhi(loc) {
  const u = `${SMHI_BASE}/geotype/point/lon/${loc.lon.toFixed(5)}/lat/${loc.lat.toFixed(5)}/data.json`;
  let r;
  try {
    r = await fetch(u);
  } catch (err) {
    throw new Error('SMHI-anropet misslyckades.');
  }
  if (!r.ok) throw new Error('SMHI svarade inte som väntat.');
  const data = await r.json();
  return normalizeSmhi(data);
}

function normalizeSmhi(data) {
  const ts = Array.isArray(data.timeSeries) ? data.timeSeries : [];
  if (!ts.length) throw new Error('Prognosen saknar tidsserier.');

  const now = Date.now();
  const cur = ts.find(x => new Date(x.time).getTime() >= now) || ts[0];

  const t = val(cur, 'air_temperature');
  const w = val(cur, 'wind_speed');
  const g = val(cur, 'wind_speed_of_gust');
  const h = val(cur, 'relative_humidity');
  const p = val(cur, 'precipitation_amount_mean') ?? val(cur, 'precipitation_amount_median') ?? val(cur, 'precipitation_amount_max');
  const sym = Number(val(cur, 'symbol_code') ?? 1);
  const conditionKey = smhiCondition(sym);

  // SMHI:s punktprognos (snow1g) exponerar ingen egen "snöfallsmängd"-parameter (till skillnad
  // från Open-Meteos "snowfall"). Vi uppskattar därför snöfall genom att använda den totala
  // nederbördsmängden när vädersymbolen anger snö eller snöblandat väder, annars 0.
  const isSnowCondition = ['snow', 'snowLight', 'snowHeavy', 'sleet'].includes(conditionKey);
  const snowfallEstimate = isSnowCondition ? (p ?? 0) : 0;

  const current = {
    temp: t, apparentTemp: null, humidity: h, wind: w, gust: g, precip: p, snowfall: snowfallEstimate,
    condition: conditionKey, isDay: true
  };

  const days = {};
  ts.forEach(x => {
    const d = new Date(x.time);
    const key = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Stockholm', year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
    (days[key] ??= []).push(x);
  });

  // Liten buffert (30 min) så att den pågående timmen inte försvinner ur dagens timlista
  // precis efter att den passerat.
  const hourCutoff = now - 30 * 60 * 1000;

  const daily = Object.values(days).slice(0, 7).map(arr => {
    const temps = arr.map(x => val(x, 'air_temperature')).filter(Number.isFinite);
    const rain = arr.map(x => val(x, 'precipitation_amount_mean') ?? val(x, 'precipitation_amount_median') ?? 0);
    const mid = arr[Math.floor(arr.length / 2)];
    const sc = Number(val(mid, 'symbol_code') ?? 1);
    const hours = arr.map(mapSmhiHour).filter(h => new Date(h.time).getTime() >= hourCutoff);
    return {
      date: mid.time,
      tempMax: temps.length ? Math.max(...temps) : null,
      tempMin: temps.length ? Math.min(...temps) : null,
      precipSum: rain.length ? Math.max(...rain) : null,
      condition: smhiCondition(sc),
      hours,
      comfort: summarizeDayComfort(hours)
    };
  });

  const hourly = ts.filter(x => new Date(x.time).getTime() >= now).slice(0, 12).map(mapSmhiHour);

  return { timezone: 'Europe/Stockholm', current, daily, hourly, updatedAt: new Date() };
}

function mapSmhiHour(x) {
  const hp = val(x, 'precipitation_amount_mean') ?? val(x, 'precipitation_amount_median') ?? val(x, 'precipitation_amount_max');
  const hSym = Number(val(x, 'symbol_code') ?? 1);
  const hCond = smhiCondition(hSym);
  const hSnow = ['snow', 'snowLight', 'snowHeavy', 'sleet'].includes(hCond) ? (hp ?? 0) : 0;
  return {
    time: x.time,
    temp: val(x, 'air_temperature'),
    apparentTemp: null,
    humidity: val(x, 'relative_humidity'),
    wind: val(x, 'wind_speed'),
    gust: val(x, 'wind_speed_of_gust'),
    precip: hp,
    snowfall: hSnow,
    condition: hCond
  };
}

async function fetchOpenMeteo(loc) {
  const params = new URLSearchParams({
    latitude: loc.lat,
    longitude: loc.lon,
    current: 'temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,showers,snowfall,weather_code,wind_speed_10m,wind_gusts_10m,is_day',
    hourly: 'temperature_2m,apparent_temperature,relative_humidity_2m,precipitation_probability,precipitation,rain,showers,snowfall,weather_code,wind_speed_10m,wind_gusts_10m',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max,wind_gusts_10m_max,sunrise,sunset',
    timezone: 'auto',
    forecast_days: '7',
    wind_speed_unit: 'ms'
  });

  let r;
  try {
    r = await fetch(`https://api.open-meteo.com/v1/forecast?${params.toString()}`);
  } catch (err) {
    throw new Error('Kunde inte nå Open-Meteo just nu.');
  }
  if (!r.ok) throw new Error('Open-Meteo svarade inte som väntat.');

  const data = await r.json();
  if (!data.current || !data.daily) throw new Error('Prognosen saknar data.');
  return normalizeOpenMeteo(data);
}

function normalizeOpenMeteo(data) {
  const c = data.current || {};
  const current = {
    temp: c.temperature_2m,
    apparentTemp: c.apparent_temperature,
    humidity: c.relative_humidity_2m,
    wind: c.wind_speed_10m,
    gust: c.wind_gusts_10m,
    precip: c.precipitation,
    snowfall: c.snowfall,
    condition: wmoCondition(c.weather_code),
    isDay: c.is_day !== 0
  };

  const h = data.hourly || {};
  const hLen = Array.isArray(h.time) ? h.time.length : 0;
  const now = Date.now();
  // Liten buffert (30 min) så att den pågående timmen inte försvinner ur dagens timlista
  // precis efter att den passerat.
  const hourCutoff = now - 30 * 60 * 1000;

  // Gruppera all timdata (Open-Meteo levererar redan lokal tid för hela 7-dagarsperioden)
  // per kalenderdag, så varje dag i "daily" kan visa sin egen timprognos vid klick.
  const hoursByDay = {};
  for (let i = 0; i < hLen; i++) {
    const dayKey = String(h.time[i]).slice(0, 10);
    (hoursByDay[dayKey] ??= []).push(mapOpenMeteoHour(h, i));
  }

  const d = data.daily || {};
  const len = Array.isArray(d.time) ? d.time.length : 0;
  const daily = [];
  for (let i = 0; i < len; i++) {
    const dayHours = (hoursByDay[d.time[i]] || []).filter(hh => new Date(hh.time).getTime() >= hourCutoff);
    daily.push({
      date: d.time[i],
      tempMax: d.temperature_2m_max ? d.temperature_2m_max[i] : null,
      tempMin: d.temperature_2m_min ? d.temperature_2m_min[i] : null,
      precipSum: d.precipitation_sum ? d.precipitation_sum[i] : null,
      condition: wmoCondition(d.weather_code ? d.weather_code[i] : null),
      hours: dayHours,
      comfort: summarizeDayComfort(dayHours)
    });
  }

  let startIdx = 0;
  for (let i = 0; i < hLen; i++) {
    if (new Date(h.time[i]).getTime() >= now) { startIdx = i; break; }
  }
  const hourly = [];
  for (let i = startIdx; i < Math.min(startIdx + 12, hLen); i++) {
    hourly.push(mapOpenMeteoHour(h, i));
  }

  return { timezone: data.timezone || null, current, daily, hourly, updatedAt: new Date() };
}

function mapOpenMeteoHour(h, i) {
  return {
    time: h.time[i],
    temp: h.temperature_2m ? h.temperature_2m[i] : null,
    apparentTemp: h.apparent_temperature ? h.apparent_temperature[i] : null,
    humidity: h.relative_humidity_2m ? h.relative_humidity_2m[i] : null,
    wind: h.wind_speed_10m ? h.wind_speed_10m[i] : null,
    gust: h.wind_gusts_10m ? h.wind_gusts_10m[i] : null,
    precip: h.precipitation ? h.precipitation[i] : null,
    snowfall: h.snowfall ? h.snowfall[i] : null,
    condition: wmoCondition(h.weather_code ? h.weather_code[i] : null)
  };
}

/* ---------- Hundkomfortindex (0,0–10,0) ---------- */
/* Egen pedagogisk uppskattning baserad på väderdata (upplevd och faktisk temperatur,
   luftfuktighet, nederbörd, vindhastighet, vindbyar och snöfall). Indexet är INGEN kliniskt
   validerad, vetenskapligt fastställd eller veterinärmedicinsk bedömning – det är en
   vägledning som alltid ska kombineras med hundens ras, storlek, ålder, hälsa, päls,
   kondition och individuella tolerans. */

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

// Delar upp en poäng (0–10) i samma nivåer/etiketter/färger som används genomgående i appen,
// så att både en enskild avläsning och ett dagssnitt (se summarizeDayComfort) blir konsekventa.
function comfortTier(score) {
  if (score >= 8.5) return { level: 'excellent', label: 'Utmärkt promenadväder', color: '#2f7d5c' };
  if (score >= 7) return { level: 'good', label: 'Bra promenadväder', color: '#659b4b' };
  if (score >= 5) return { level: 'moderate', label: 'Okej med anpassning', color: '#d5a33c' };
  if (score >= 3) return { level: 'poor', label: 'Ta det försiktigt', color: '#dc7835' };
  return { level: 'very-poor', label: 'Olämpligt för längre aktivitet', color: '#bd4747' };
}

function calculateDogComfortIndex(weather) {
  const temperature = Number(weather.temperature ?? 0);
  const apparentTemperature = Number(
    weather.apparentTemperature ?? temperature
  );
  const humidity = Number(weather.humidity ?? 0);
  const precipitation = Number(weather.precipitation ?? 0);
  const windSpeed = Number(weather.windSpeed ?? 0);
  const windGusts = Number(weather.windGusts ?? windSpeed);
  const snowfall = Number(weather.snowfall ?? 0);

  let score = 10;
  const reasons = [];
  const recommendations = [];

  if (apparentTemperature >= 30) {
    score -= 7;
    reasons.push("mycket hög upplevd temperatur");
    recommendations.push(
      "Undvik ansträngande promenader och välj endast mycket korta rastningar i skugga."
    );
  } else if (apparentTemperature >= 26) {
    score -= 5;
    reasons.push("hög upplevd temperatur");
    recommendations.push(
      "Välj en kortare promenad, håll lugnt tempo och ta med färskt vatten."
    );
  } else if (apparentTemperature >= 22) {
    score -= 2.5;
    reasons.push("varmt väder");
    recommendations.push(
      "Ta med vatten och välj gärna skugga eller en svalare tid på dagen."
    );
  } else if (apparentTemperature >= 18) {
    score -= 1;
    reasons.push("milt till varmt väder");
  }

  if (apparentTemperature <= -15) {
    score -= 6;
    reasons.push("extrem kyla");
    recommendations.push(
      "Begränsa tiden utomhus och anpassa skyddet efter hundens individuella behov."
    );
  } else if (apparentTemperature <= -8) {
    score -= 4;
    reasons.push("mycket kallt väder");
    recommendations.push(
      "Överväg kortare promenad och kontrollera tassar och kroppstemperatur."
    );
  } else if (apparentTemperature <= -2) {
    score -= 2;
    reasons.push("kallt väder");
    recommendations.push(
      "Håll uppsikt över tassarna och anpassa promenadens längd."
    );
  } else if (apparentTemperature <= 3) {
    score -= 0.5;
    reasons.push("svalt väder");
  }

  if (humidity >= 80 && apparentTemperature >= 22) {
    score -= 1.5;
    reasons.push("hög luftfuktighet i kombination med värme");
    recommendations.push(
      "Hög luftfuktighet kan göra varmt väder mer ansträngande. Sänk tempot och erbjud vatten."
    );
  }

  if (precipitation >= 5) {
    score -= 2.5;
    reasons.push("kraftig nederbörd");
    recommendations.push(
      "Planera en kortare runda och torka päls, mage och tassar noggrant efteråt."
    );
  } else if (precipitation >= 1) {
    score -= 1.5;
    reasons.push("regn eller blötsnö");
    recommendations.push(
      "Torka hundens päls, mage och tassar efter promenaden."
    );
  } else if (precipitation > 0) {
    score -= 0.5;
    reasons.push("lätt nederbörd");
  }

  if (snowfall >= 2) {
    score -= 1;
    reasons.push("snöfall");
    recommendations.push(
      "Kontrollera om snö eller is fastnar mellan trampdynorna."
    );
  }

  if (windGusts >= 20) {
    score -= 3.5;
    reasons.push("mycket kraftiga vindbyar");
    recommendations.push(
      "Undvik skog och platser där grenar eller lösa föremål kan falla."
    );
  } else if (windGusts >= 15) {
    score -= 2;
    reasons.push("kraftiga vindbyar");
    recommendations.push(
      "Välj en skyddad promenadväg och håll hunden nära."
    );
  } else if (windSpeed >= 10) {
    score -= 1;
    reasons.push("blåsigt väder");
  }

  score = clamp(score, 0, 10);
  const { level, label, color } = comfortTier(score);

  if (reasons.length === 0) {
    reasons.push("behagliga väderförhållanden");
  }

  if (recommendations.length === 0) {
    recommendations.push(
      "Vädret ser lämpligt ut för en vanlig promenad, men anpassa alltid efter hundens signaler."
    );
  }

  return {
    score: Number(score.toFixed(1)),
    level,
    label,
    color,
    reasons: [...new Set(reasons)],
    recommendations: [...new Set(recommendations)]
  };
}

/* ---------- Rendering ---------- */

function renderPlaceResults(results, query) {
  placeResultsEl.innerHTML = '';
  if (!results.length) {
    placeResultsEl.hidden = true;
    return;
  }

  const wrap = document.createElement('div');
  wrap.className = 'place-list';

  const hint = document.createElement('p');
  hint.className = 'place-list-hint';
  hint.textContent = 'Flera platser matchar sökningen. Välj rätt plats:';
  wrap.appendChild(hint);

  results.forEach(loc => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'place-item';

    const title = document.createElement('span');
    title.className = 'place-item-name';
    title.textContent = loc.name; // textContent – ingen HTML-tolkning, säkert mot injicering

    const meta = document.createElement('span');
    meta.className = 'place-item-meta';
    meta.textContent = [loc.admin1, loc.country, loc.countryCode].filter(Boolean).join(' · ');

    btn.appendChild(title);
    btn.appendChild(meta);
    btn.addEventListener('click', () => {
      placeResultsEl.hidden = true;
      placeResultsEl.innerHTML = '';
      forecast(loc);
    });
    wrap.appendChild(btn);
  });

  placeResultsEl.appendChild(wrap);
  placeResultsEl.hidden = false;
}

function hidePlaceResults() {
  placeResultsEl.hidden = true;
  placeResultsEl.innerHTML = '';
}

function renderAlerts(cur) {
  const t = cur.apparentTemp != null ? cur.apparentTemp : cur.temp;
  const alerts = [];

  if (t != null && t >= 25) {
    alerts.push('<div class="alert"><b>Värme att ta på allvar.</b> Ta med vatten och korta ned eller flytta ansträngande aktivitet till svalare timmar. Lämna aldrig hunden i bilen: djur får inte lämnas utan tillsyn i en bil om innetemperaturen riskerar att överstiga 25 °C.</div>');
  }
  if (cur.precip != null && cur.precip > 2) {
    alerts.push('<div class="alert"><b>Rejält blött.</b> Planera för torkning och kontroll av tassar och mellan trampdynorna efter rundan.</div>');
  }
  if (t != null && t <= -10) {
    alerts.push('<div class="alert"><b>Sträng kyla.</b> Korta ned promenaden och håll extra koll på tassar, öron och svans.</div>');
  }

  alertsEl.innerHTML = alerts.join('');
}

/* ---------- Kommande dagar: håller reda på vilken dag som är expanderad och med vilka data ---------- */

const dayHoursEl = $('#dayHours');
const dayHoursTitleEl = $('#dayHoursTitle');
const dayHoursBodyEl = $('#dayHoursBody');
const dayHoursCloseEl = $('#dayHoursClose');

let dailyState = { days: [], tz: 'Europe/Stockholm', unit: 'C', openIndex: null };

function renderDaily(weatherData, unit) {
  const tz = weatherData.timezone || 'Europe/Stockholm';
  const names = new Intl.DateTimeFormat('sv-SE', { weekday: 'short', day: 'numeric', month: 'short', timeZone: tz });

  dailyState = { days: weatherData.daily, tz, unit, openIndex: null };
  if (dayHoursEl) { dayHoursEl.hidden = true; dayHoursBodyEl.innerHTML = ''; }

  dailyEl.innerHTML = weatherData.daily.map((d, i) => {
    const [icon, desc] = conditionInfo[d.condition] || conditionInfo.unknown;
    const label = i === 0 ? 'Idag' : names.format(new Date(d.date));
    const max = formatTemp(d.tempMax, unit);
    const min = formatTemp(d.tempMin, unit);
    const rain = d.precipSum != null ? n(d.precipSum, 1) : '–';
    const comfortPill = d.comfort
      ? `<span class="day-comfort" style="color:${d.comfort.color};background:${d.comfort.color}1a">${n(d.comfort.score, 1)}/10 · ${escapeHtml(d.comfort.label)}</span>`
      : '';
    const hint = (d.hours && d.hours.length)
      ? `<p class="day-hint">Visa klockslag ▾</p>`
      : `<p class="day-hint">Ingen timprognos ännu</p>`;
    return `<article class="day ${i === 0 ? 'today' : ''}" role="button" tabindex="0" aria-expanded="false" aria-controls="dayHours" data-day-index="${i}">
      <b>${label}</b>
      <div class="day-icon">${icon}</div>
      <div class="range">${max}° / ${min}°${unit}</div>
      <small>${desc} · nederbörd ${rain} mm</small>
      ${comfortPill}
      ${hint}
    </article>`;
  }).join('');
}

function hideDayHours() {
  if (!dayHoursEl) return;
  dayHoursEl.hidden = true;
  dayHoursBodyEl.innerHTML = '';
  dailyEl.querySelectorAll('.day.active').forEach(el => {
    el.classList.remove('active');
    el.setAttribute('aria-expanded', 'false');
  });
  dailyState.openIndex = null;
}

function showDayHours(index) {
  const d = dailyState.days[index];
  if (!d || !dayHoursEl) return;

  dailyEl.querySelectorAll('.day').forEach(el => {
    const active = Number(el.dataset.dayIndex) === index;
    el.classList.toggle('active', active);
    el.setAttribute('aria-expanded', String(active));
  });

  const dayNameFmt = new Intl.DateTimeFormat('sv-SE', { weekday: 'long', day: 'numeric', month: 'long', timeZone: dailyState.tz });
  dayHoursTitleEl.textContent = `Klockslag ${index === 0 ? 'idag' : dayNameFmt.format(new Date(d.date))}`;

  const hours = d.hours || [];
  if (!hours.length) {
    dayHoursBodyEl.innerHTML = `<p class="day-hours-empty">Ingen timupplöst prognos tillgänglig för den här dagen ännu. Det brukar klarna när dagen kommer närmare — kika gärna tillbaka.</p>`;
  } else {
    const withComfort = computeHourlyComfort(hours);
    const best = withComfort.reduce((a, b) => (b.comfort.score > a.comfort.score ? b : a), withComfort[0]);
    const timeFmt = new Intl.DateTimeFormat('sv-SE', { hour: '2-digit', minute: '2-digit', timeZone: dailyState.tz });

    const chips = withComfort.map(h => {
      const [icon, desc] = conditionInfo[h.condition] || conditionInfo.unknown;
      const isBest = h.time === best.time;
      const timeStr = timeFmt.format(new Date(h.time));
      const tempStr = `${formatTemp(h.temp, dailyState.unit)}°${dailyState.unit}`;
      const chipLabel = `${timeStr}, ${desc}, ${tempStr}, Hundkomfortindex ${n(h.comfort.score, 1)} av 10, ${h.comfort.label}`;
      return `<div class="hour-chip${isBest ? ' hour-chip--best' : ''}" style="--dot:${h.comfort.color}" role="group" aria-label="${escapeHtml(chipLabel)}">
        <span class="hour-chip-time" aria-hidden="true">${timeStr}</span>
        <span class="hour-chip-icon" aria-hidden="true">${icon}</span>
        <span class="hour-chip-temp" aria-hidden="true">${tempStr}</span>
        <span class="hour-chip-score" aria-hidden="true">${n(h.comfort.score, 1)}/10</span>
      </div>`;
    }).join('');

    dayHoursBodyEl.innerHTML = `<div class="hour-strip">${chips}</div>`;
  }

  dayHoursEl.hidden = false;
  dailyState.openIndex = index;
  dayHoursEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function toggleDayHours(index) {
  if (dailyState.openIndex === index) {
    hideDayHours();
  } else {
    showDayHours(index);
  }
}

dailyEl.addEventListener('click', e => {
  const card = e.target.closest('.day');
  if (!card) return;
  toggleDayHours(Number(card.dataset.dayIndex));
});

dailyEl.addEventListener('keydown', e => {
  if (e.key !== 'Enter' && e.key !== ' ') return;
  const card = e.target.closest('.day');
  if (!card) return;
  e.preventDefault();
  toggleDayHours(Number(card.dataset.dayIndex));
});

dayHoursCloseEl?.addEventListener('click', hideDayHours);

/* ---------- Bästa promenadtiden: rankar de kommande timmarna efter Hundkomfortindex ---------- */

function computeHourlyComfort(hourly) {
  return (hourly || [])
    .filter(h => h && h.temp != null)
    .map(h => ({
      ...h,
      comfort: calculateDogComfortIndex({
        temperature: h.temp,
        apparentTemperature: h.apparentTemp,
        humidity: h.humidity,
        precipitation: h.precip,
        windSpeed: h.wind,
        windGusts: h.gust,
        snowfall: h.snowfall
      })
    }));
}

// Räknar ut ett Hundkomfortindex-snitt för en hel dag, baserat på dagtidstimmarna (ca 07–21)
// om sådana finns tillgängliga, annars på de timmar som faktiskt finns. Används i "Kommande
// dagar" så att varje dag får samma index som visas för nuläget och för "Bästa promenadtiden".
function summarizeDayComfort(hours) {
  const withComfort = computeHourlyComfort(hours);
  if (!withComfort.length) return null;

  const daytime = withComfort.filter(h => {
    const hh = new Date(h.time).getHours();
    return hh >= 7 && hh <= 21;
  });
  const pool = daytime.length ? daytime : withComfort;
  const avg = pool.reduce((sum, h) => sum + h.comfort.score, 0) / pool.length;
  const score = Number(avg.toFixed(1));

  return { score, ...comfortTier(score) };
}

function renderBestWalk(weatherData, unit) {
  if (!bestWalkEl) return;
  const tz = weatherData.timezone || 'Europe/Stockholm';
  const withComfort = computeHourlyComfort(weatherData.hourly);

  if (!withComfort.length) {
    bestWalkEl.innerHTML = '';
    return;
  }

  const best = withComfort.reduce((a, b) => (b.comfort.score > a.comfort.score ? b : a));
  const timeFmt = new Intl.DateTimeFormat('sv-SE', { hour: '2-digit', minute: '2-digit', timeZone: tz });

  const chips = withComfort.map(h => {
    const [icon, desc] = conditionInfo[h.condition] || conditionInfo.unknown;
    const best_ = h.time === best.time;
    const timeStr = timeFmt.format(new Date(h.time));
    const tempStr = `${formatTemp(h.temp, unit)}°${unit}`;
    const label = `${timeStr}, ${desc}, ${tempStr}, Hundkomfortindex ${n(h.comfort.score, 1)} av 10, ${h.comfort.label}`;
    return `<div class="hour-chip${best_ ? ' hour-chip--best' : ''}" style="--dot:${h.comfort.color}" role="group" aria-label="${escapeHtml(label)}">
      <span class="hour-chip-time" aria-hidden="true">${timeStr}</span>
      <span class="hour-chip-icon" aria-hidden="true">${icon}</span>
      <span class="hour-chip-temp" aria-hidden="true">${tempStr}</span>
      <span class="hour-chip-score" aria-hidden="true">${n(h.comfort.score, 1)}/10</span>
    </div>`;
  }).join('');

  const allSimilar = withComfort.every(h => h.comfort.score >= best.comfort.score - 0.5);
  const introText = allSimilar
    ? `Jämn komfort den närmaste tiden — det mesta av dagen fungerar bra för en promenad.`
    : `Det bästa promenadfönstret den närmaste tiden, jämfört med övriga kommande timmar.`;

  bestWalkEl.innerHTML = `
    <div class="best-walk-highlight" style="--dot:${best.comfort.color}">
      <div class="best-walk-time">🐾 ${timeFmt.format(new Date(best.time))}</div>
      <div class="best-walk-body">
        <p class="best-walk-label" style="color:${best.comfort.color}">${escapeHtml(best.comfort.label)} · ${n(best.comfort.score, 1)}/10</p>
        <p class="best-walk-desc">${introText}</p>
      </div>
    </div>
    <p class="hour-strip-caption">Väder och Hundkomfortindex timme för timme</p>
    <div class="hour-strip">${chips}</div>
  `;
}

/* ---------- Vädertolkning: sju konkreta hundråd baserat på aktuellt väder ---------- */
/* Regelbaserad tolkning av väderdata – inte en AI-modell och inte kopplad till några
   pollen- eller fästingsensorer. Pollen- och fästingbedömningen är särskilt förenklad
   (baserad på årstid och grundläggande väderfaktorer) eftersom det inte finns någon öppen,
   avgiftsfri realtidsdata för detta i appen. Se den riktiga prognosen via länkarna i
   panelens fotnot. */

const LEVELS = {
  ok: { label: 'Bra', color: '#2f7d5c' },
  caution: { label: 'Var uppmärksam', color: '#d5a33c' },
  risk: { label: 'Hög risk', color: '#bd4747' }
};

function computeWalkAdvisories(cur, comfort) {
  const temp = cur.temp;
  const apparent = cur.apparentTemp != null ? cur.apparentTemp : temp;
  const gust = cur.gust != null ? cur.gust : cur.wind;
  const precip = cur.precip || 0;
  const isSunnyish = ['clear', 'mostlyClear', 'partlyCloudy'].includes(cur.condition);
  const month = new Date().getMonth() + 1; // 1–12, baserat på enhetens lokala datum

  const items = [];

  // 1. Varm asfalt
  if (temp != null && (temp >= 28 || (temp >= 24 && isSunnyish))) {
    items.push({ icon: '🛣️', title: 'Varm asfalt', level: 'risk',
      text: 'Solvärmd asfalt kan bli brännhet. Håll handryggen mot marken i 5 sekunder — obehagligt för dig betyder för hett för trampdynorna. Välj gräs eller skugga.' });
  } else if (temp != null && temp >= 20 && isSunnyish) {
    items.push({ icon: '🛣️', title: 'Varm asfalt', level: 'caution',
      text: 'Asfalten kan hinna bli varm i solen. Testa gärna med handen innan en längre runda på hårt underlag.' });
  } else {
    items.push({ icon: '🛣️', title: 'Varm asfalt', level: 'ok',
      text: 'Underlaget bedöms inte vara hett nog för att skada trampdynorna just nu.' });
  }

  // 2. Kyla mot tassar
  const coldTemp = apparent;
  if (coldTemp != null && coldTemp <= -15) {
    items.push({ icon: '❄️', title: 'Kyla mot tassar', level: 'risk',
      text: 'Sträng kyla. Håll promenaden kort och kontrollera tassar, öron och svans ofta.' });
  } else if (coldTemp != null && coldTemp <= -5) {
    items.push({ icon: '❄️', title: 'Kyla mot tassar', level: 'caution',
      text: 'Kallt för trampdynorna, särskilt på kortpälsade eller små hundar. Överväg tassvax eller hundskor.' });
  } else {
    items.push({ icon: '❄️', title: 'Kyla mot tassar', level: 'ok',
      text: 'Temperaturen bedöms inte vara ett problem för tassarna just nu.' });
  }

  // 3. Blöt päls
  if (precip >= 3) {
    items.push({ icon: '💧', title: 'Blöt päls', level: 'risk',
      text: 'Kraftigt regn. Päls och tassar blir rejält blöta — planera för ordentlig torkning efteråt.' });
  } else if (precip >= 0.5) {
    items.push({ icon: '💧', title: 'Blöt päls', level: 'caution',
      text: 'Regn just nu. Räkna med att torka päls, mage och tassar efter promenaden.' });
  } else {
    items.push({ icon: '💧', title: 'Blöt päls', level: 'ok',
      text: 'Torrt eller nästan torrt just nu.' });
  }

  // 4. Blåsigt för små hundar
  if (gust != null && gust >= 20) {
    items.push({ icon: '💨', title: 'Blåsigt för små hundar', level: 'risk',
      text: 'Mycket kraftiga vindbyar. Kan skrämma eller vara jobbigt för små och lätta hundar — håll koppel och undvik skog.' });
  } else if (gust != null && gust >= 12) {
    items.push({ icon: '💨', title: 'Blåsigt för små hundar', level: 'caution',
      text: 'Blåsigt. Kan kännas jobbigt för små eller kortbenta hundar — välj gärna en skyddad väg.' });
  } else {
    items.push({ icon: '💨', title: 'Blåsigt för små hundar', level: 'ok',
      text: 'Vindnivån bedöms vara okej även för mindre hundar.' });
  }

  // 5. Pollen (grov uppskattning – se fotnot för riktig mätdata)
  const pollenSeason = month >= 3 && month <= 8;
  if (!pollenSeason) {
    items.push({ icon: '🌼', title: 'Pollen', level: 'ok',
      text: 'Utanför den intensiva pollensäsongen — halterna är oftast lägre.' });
  } else if (precip >= 1) {
    items.push({ icon: '🌼', title: 'Pollen', level: 'ok',
      text: 'Regnet binder pollenet, så halterna är oftast lägre just nu.' });
  } else if ((cur.wind || 0) >= 3 && isSunnyish) {
    items.push({ icon: '🌼', title: 'Pollen', level: 'risk',
      text: 'Pollensäsong, torrt och lite bris — halterna kan vara höga. Torka gärna av pälsen om hunden reagerar.' });
  } else {
    items.push({ icon: '🌼', title: 'Pollen', level: 'caution',
      text: 'Pollensäsong pågår. Halterna varierar mycket lokalt och under dagen.' });
  }

  // 6. Fästingrisk (grov uppskattning – se fotnot för riktig mätdata)
  const tickActive = coldTemp != null && coldTemp >= 5 && month >= 3 && month <= 11;
  if (!tickActive) {
    items.push({ icon: '🕷️', title: 'Fästingrisk', level: 'ok',
      text: 'Fästingar är oftast inaktiva vid den här temperaturen eller årstiden.' });
  } else if ([5, 6, 8, 9].includes(month)) {
    items.push({ icon: '🕷️', title: 'Fästingrisk', level: 'risk',
      text: 'Högsäsong för fästingar. Kontrollera hunden noga efter promenaden, särskilt i gräs och skog.' });
  } else {
    items.push({ icon: '🕷️', title: 'Fästingrisk', level: 'caution',
      text: 'Fästingar kan vara aktiva. Kolla igenom pälsen efter promenaden.' });
  }

  // 7. Helhetsbedömning (bygger på samma Hundkomfortindex som visas ovan)
  const overallLevel = comfort.score >= 7 ? 'ok' : comfort.score >= 5 ? 'caution' : 'risk';
  items.push({ icon: '🚶', title: 'Bra promenadväder', level: overallLevel,
    text: `${comfort.label} · Hundkomfortindex ${n(comfort.score, 1)}/10.` });

  return items;
}

function renderWalkAdvisories(cur, comfort) {
  const items = computeWalkAdvisories(cur, comfort);
  walkAdviceEl.innerHTML = items.map(item => {
    const lvl = LEVELS[item.level];
    return `<article class="advice-card">
      <div class="advice-card-head">
        <span class="advice-icon">${item.icon}</span>
        <span class="advice-pill" style="color:${lvl.color};background:${lvl.color}1a">${lvl.label}</span>
      </div>
      <h4>${escapeHtml(item.title)}</h4>
      <p>${escapeHtml(item.text)}</p>
    </article>`;
  }).join('');
}

function render(weatherData, loc, source) {
  const cur = weatherData.current;
  const [icon, desc] = conditionInfo[cur.condition] || conditionInfo.unknown;

  const comfort = calculateDogComfortIndex({
    temperature: cur.temp,
    apparentTemperature: cur.apparentTemp,
    humidity: cur.humidity,
    precipitation: cur.precip,
    windSpeed: cur.wind,
    windGusts: cur.gust,
    snowfall: cur.snowfall
  });

  const unit = tempUnitFor(loc.countryCode);

  const feelsLine = (cur.apparentTemp != null && Math.round(cur.apparentTemp) !== Math.round(cur.temp))
    ? `${desc} · Känns som ${formatTemp(cur.apparentTemp, unit)}°${unit}`
    : desc;

  updateHeroBackground(cur, `Hund ute i väder: ${desc.toLowerCase()}, ${escapeHtml(loc.name)}`);

  const reasonsText = escapeHtml(comfort.reasons.join(', '));

  currentEl.className = 'current';
  currentEl.innerHTML = `
    <div class="current-main">
      <div class="weather-icon">${icon}</div>
      <div>
        <div class="place-name">${escapeHtml(loc.name)}</div>
        <div class="temp">${formatTemp(cur.temp, unit)}°${unit}</div>
        <div>${feelsLine}</div>
      </div>
    </div>
    <div class="metrics">
      <div class="metric"><span>Vind</span><b>${n(cur.wind, 1)} m/s</b></div>
      <div class="metric"><span>Byvind</span><b>${n(cur.gust, 1)} m/s</b></div>
      <div class="metric"><span>Luftfuktighet</span><b>${n(cur.humidity)} %</b></div>
    </div>
    <div class="comfort" role="group" aria-label="Hundkomfortindex">
      <div class="comfort-head"><span>Hundkomfortindex</span><b style="color:${comfort.color}">${n(comfort.score, 1)} / 10</b></div>
      <div class="comfort-bar"><div class="comfort-fill" style="width:${comfort.score * 10}%;background:${comfort.color}"></div></div>
      <p class="comfort-label" style="color:${comfort.color}">${escapeHtml(comfort.label)}</p>
      <p class="comfort-reasons">${reasonsText}.</p>
    </div>
    <div class="dog-verdict">🐕 ${escapeHtml(comfort.recommendations[0])}</div>
    <p class="comfort-footnote"><a href="#komfortindex-forklaring">Så räknas indexet ut *</a></p>
  `;

  renderAlerts(cur);
  renderBestWalk(weatherData, unit);
  renderWalkAdvisories(cur, comfort);
  renderDaily(weatherData, unit);

  const tz = weatherData.timezone || 'Europe/Stockholm';
  const sourceName = source === 'smhi' ? 'SMHI' : 'Open-Meteo';
  updatedEl.textContent = `Uppdaterad ${new Intl.DateTimeFormat('sv-SE', { dateStyle: 'medium', timeStyle: 'short', timeZone: tz }).format(weatherData.updatedAt)} (lokal tid). Källa: ${sourceName}.`;
  statusEl.textContent = `Visar prognos för ${loc.name}.`;
}

/* ---------- Huvudflöde ---------- */

async function forecast(loc) {
  hidePlaceResults();
  statusEl.textContent = `Hämtar prognosen för ${loc.name || 'platsen'}…`;

  const isSweden = (loc.countryCode || '').toUpperCase() === 'SE';
  let weatherData = null;
  let source = 'openmeteo';

  if (isSweden) {
    try {
      weatherData = await fetchSmhi(loc);
      source = 'smhi';
    } catch (err) {
      weatherData = null; // faller tillbaka på Open-Meteo nedan
    }
  }

  if (!weatherData) {
    try {
      weatherData = await fetchOpenMeteo(loc);
      source = 'openmeteo';
    } catch (err) {
      statusEl.textContent = 'Kunde inte hämta väderprognosen just nu. Kontrollera anslutningen och försök igen.';
      return;
    }
  }

  try {
    render(weatherData, loc, source);
  } catch (err) {
    statusEl.textContent = 'Något gick fel när prognosen skulle visas. Försök igen om en stund.';
    return;
  }

  try {
    localStorage.setItem('dogWeatherLocation', JSON.stringify({
      lat: loc.lat, lon: loc.lon, name: loc.name, countryCode: loc.countryCode || ''
    }));
  } catch { /* localStorage kan vara otillgängligt, det är okej att ignorera */ }
}

/* ---------- Händelser ---------- */

$('#searchForm').addEventListener('submit', async e => {
  e.preventDefault();
  const query = $('#place').value.trim();
  if (!query) return;

  hidePlaceResults();
  statusEl.textContent = 'Söker plats…';

  try {
    const results = await geocodeOpenMeteo(query);
    if (results.length === 1) {
      await forecast(results[0]);
    } else {
      renderPlaceResults(results, query);
      statusEl.textContent = `Flera platser matchar "${query}". Välj rätt plats nedan.`;
    }
  } catch (err) {
    statusEl.textContent = err.message || 'Något gick fel vid platssökningen. Försök igen.';
  }
});

$('#locate').addEventListener('click', () => {
  if (!navigator.geolocation) {
    statusEl.textContent = 'Din webbläsare stöder inte platsdelning.';
    return;
  }
  statusEl.textContent = 'Hämtar din position…';
  navigator.geolocation.getCurrentPosition(
    async pos => {
      try {
        const lat = pos.coords.latitude, lon = pos.coords.longitude;
        const { name, countryCode } = await reverseGeocode(lat, lon);
        await forecast({ lat, lon, name, countryCode });
      } catch (err) {
        statusEl.textContent = 'Kunde inte hämta väder för din position just nu.';
      }
    },
    () => { statusEl.textContent = 'Platsåtkomst nekades. Sök efter ort i stället.'; },
    { enableHighAccuracy: false, timeout: 10000 }
  );
});

/* Återställ senaste sökta plats vid sidladdning */
(async () => {
  try {
    const raw = localStorage.getItem('dogWeatherLocation');
    if (!raw) return;
    const loc = JSON.parse(raw);
    if (loc && typeof loc.lat === 'number' && typeof loc.lon === 'number') {
      await forecast(loc);
    }
  } catch { /* ogiltig eller saknad sparad plats – ignorera tyst */ }
})();
