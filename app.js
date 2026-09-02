/* Hundväder – väderlogik
   Källor: SMHI Open Data (svenska platser, i första hand) och Open-Meteo (globalt, samt reserv om SMHI inte svarar).
   Ingen API-nyckel krävs för någon av tjänsterna. */

const $ = s => document.querySelector(s);
const statusEl = $('#searchStatus');
const dailyEl = $('#daily');
const currentEl = $('#current');
const alertsEl = $('#alerts');
const placeResultsEl = $('#placeResults');
const updatedEl = $('#updated');

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

  const daily = Object.values(days).slice(0, 7).map(arr => {
    const temps = arr.map(x => val(x, 'air_temperature')).filter(Number.isFinite);
    const rain = arr.map(x => val(x, 'precipitation_amount_mean') ?? val(x, 'precipitation_amount_median') ?? 0);
    const mid = arr[Math.floor(arr.length / 2)];
    const sc = Number(val(mid, 'symbol_code') ?? 1);
    return {
      date: mid.time,
      tempMax: temps.length ? Math.max(...temps) : null,
      tempMin: temps.length ? Math.min(...temps) : null,
      precipSum: rain.length ? Math.max(...rain) : null,
      condition: smhiCondition(sc)
    };
  });

  return { timezone: 'Europe/Stockholm', current, daily, updatedAt: new Date() };
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

  const d = data.daily || {};
  const len = Array.isArray(d.time) ? d.time.length : 0;
  const daily = [];
  for (let i = 0; i < len; i++) {
    daily.push({
      date: d.time[i],
      tempMax: d.temperature_2m_max ? d.temperature_2m_max[i] : null,
      tempMin: d.temperature_2m_min ? d.temperature_2m_min[i] : null,
      precipSum: d.precipitation_sum ? d.precipitation_sum[i] : null,
      condition: wmoCondition(d.weather_code ? d.weather_code[i] : null)
    });
  }

  return { timezone: data.timezone || null, current, daily, updatedAt: new Date() };
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

  let level;
  let label;
  let color;

  if (score >= 8.5) {
    level = "excellent";
    label = "Utmärkt promenadväder";
    color = "#2f7d5c";
  } else if (score >= 7) {
    level = "good";
    label = "Bra promenadväder";
    color = "#659b4b";
  } else if (score >= 5) {
    level = "moderate";
    label = "Okej med anpassning";
    color = "#d5a33c";
  } else if (score >= 3) {
    level = "poor";
    label = "Ta det försiktigt";
    color = "#dc7835";
  } else {
    level = "very-poor";
    label = "Olämpligt för längre aktivitet";
    color = "#bd4747";
  }

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

function renderDaily(weatherData) {
  const tz = weatherData.timezone || 'Europe/Stockholm';
  const names = new Intl.DateTimeFormat('sv-SE', { weekday: 'short', day: 'numeric', month: 'short', timeZone: tz });

  dailyEl.innerHTML = weatherData.daily.map((d, i) => {
    const [icon, desc] = conditionInfo[d.condition] || conditionInfo.unknown;
    const label = i === 0 ? 'Idag' : names.format(new Date(d.date));
    const max = d.tempMax != null ? Math.round(d.tempMax) : '–';
    const min = d.tempMin != null ? Math.round(d.tempMin) : '–';
    const rain = d.precipSum != null ? n(d.precipSum, 1) : '–';
    return `<article class="day ${i === 0 ? 'today' : ''}"><b>${label}</b><div class="day-icon">${icon}</div><div class="range">${max}° / ${min}°</div><small>${desc} · nederbörd ${rain} mm</small></article>`;
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

  const feelsLine = (cur.apparentTemp != null && Math.round(cur.apparentTemp) !== Math.round(cur.temp))
    ? `${desc} · Känns som ${n(cur.apparentTemp)}°`
    : desc;

  const reasonsText = escapeHtml(comfort.reasons.join(', '));
  const recommendationsHtml = comfort.recommendations.map(r => `<li>${escapeHtml(r)}</li>`).join('');

  currentEl.className = 'current';
  currentEl.innerHTML = `
    <div class="current-main">
      <div class="weather-icon">${icon}</div>
      <div>
        <div class="place-name">${escapeHtml(loc.name)}</div>
        <div class="temp">${n(cur.temp)}°</div>
        <div>${feelsLine}</div>
      </div>
    </div>
    <div class="metrics">
      <div class="metric"><span>VIND</span><b>${n(cur.wind, 1)} m/s</b></div>
      <div class="metric"><span>BYVIND</span><b>${n(cur.gust, 1)} m/s</b></div>
      <div class="metric"><span>LUFTFUKTIGHET</span><b>${n(cur.humidity)} %</b></div>
    </div>
    <div class="comfort" role="group" aria-label="Hundkomfortindex">
      <div class="comfort-head"><span>HUNDKOMFORTINDEX</span><b style="color:${comfort.color}">${n(comfort.score, 1)} / 10</b></div>
      <div class="comfort-bar"><div class="comfort-fill" style="width:${comfort.score * 10}%;background:${comfort.color}"></div></div>
      <p class="comfort-label" style="color:${comfort.color}">${escapeHtml(comfort.label)}</p>
      <p class="comfort-reasons">Bidragande faktorer: ${reasonsText}.</p>
      <ul class="comfort-recommendations">${recommendationsHtml}</ul>
      <p class="comfort-disclaimer">Hundkomfortindex är en generell uppskattning baserad på väderdata. Hundens ras, storlek, ålder, hälsa, päls, kondition och individuella tolerans påverkar vad som är lämpligt. Indexet är ingen kliniskt validerad, vetenskapligt fastställd eller veterinärmedicinsk bedömning.</p>
    </div>
    <div class="dog-verdict">🐕 ${escapeHtml(comfort.recommendations[0])}</div>
  `;

  renderAlerts(cur);
  renderDaily(weatherData);

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
