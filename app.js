/* DOGLOGG – weather logic and bilingual (English/Swedish) UI text.
   Sources: SMHI Open Data (Swedish locations, primary) and Open-Meteo (global, and fallback
   if SMHI doesn't respond). No API key required for either service. */

/* Ikonsystem: enkla, konsekventa SVG-linjeikoner som ersätter emoji rakt av.
   width/height="1em" gör att de ärver storlek från samma font-size-regler
   (.advice-icon, .log-btn-icon, .paw m.fl.) som redan finns i styles.css –
   ingen CSS behövde ändras för att byta ut glyferna. */
const ICONS = {
  paw: `<svg viewBox="0 0 24 24" width="1em" height="1em" aria-hidden="true"><ellipse cx="12" cy="16.5" rx="5.2" ry="4.2" fill="currentColor"/><ellipse cx="5.6" cy="9.4" rx="2.1" ry="2.6" fill="currentColor"/><ellipse cx="10.4" cy="6.3" rx="2" ry="2.5" fill="currentColor"/><ellipse cx="14.4" cy="6.3" rx="2" ry="2.5" fill="currentColor"/><ellipse cx="18.6" cy="9.4" rx="2.1" ry="2.6" fill="currentColor"/></svg>`,
  walk: `<svg viewBox="0 0 24 24" width="1em" height="1em" aria-hidden="true"><g transform="translate(-1,2) scale(.62)"><ellipse cx="12" cy="16.5" rx="5.2" ry="4.2" fill="currentColor" opacity=".55"/><ellipse cx="5.6" cy="9.4" rx="2.1" ry="2.6" fill="currentColor" opacity=".55"/><ellipse cx="10.4" cy="6.3" rx="2" ry="2.5" fill="currentColor" opacity=".55"/><ellipse cx="14.4" cy="6.3" rx="2" ry="2.5" fill="currentColor" opacity=".55"/><ellipse cx="18.6" cy="9.4" rx="2.1" ry="2.6" fill="currentColor" opacity=".55"/></g><g transform="translate(9,-3) scale(.62)"><ellipse cx="12" cy="16.5" rx="5.2" ry="4.2" fill="currentColor"/><ellipse cx="5.6" cy="9.4" rx="2.1" ry="2.6" fill="currentColor"/><ellipse cx="10.4" cy="6.3" rx="2" ry="2.5" fill="currentColor"/><ellipse cx="14.4" cy="6.3" rx="2" ry="2.5" fill="currentColor"/><ellipse cx="18.6" cy="9.4" rx="2.1" ry="2.6" fill="currentColor"/></g></svg>`,
  poop: `<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 19c-1.5 0-2.5-1-2.5-2.3 0-1 .6-1.8 1.6-2.1-.5-.4-.8-1-.8-1.7 0-1.1.9-2 2.1-2.1-.3-.4-.5-.9-.5-1.4 0-1.3 1.2-2.4 2.7-2.4.4 0 .8.1 1.1.2C12.1 6 13.2 5.3 14.5 5.3c1.9 0 3.5 1.4 3.5 3.1 0 .4-.1.8-.2 1.1 1.1.3 1.9 1.2 1.9 2.3 0 .7-.3 1.3-.9 1.7 1 .3 1.7 1.2 1.7 2.2 0 1.3-1.1 2.3-2.6 2.3H8z"/></svg>`,
  droplet: `<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3.5c3.2 4.1 5.5 7.4 5.5 10.2a5.5 5.5 0 1 1-11 0c0-2.8 2.3-6.1 5.5-10.2z"/></svg>`,
  nails: `<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 12c0-4 2.5-7 4.5-7S15 8 15 12s-2.5 7-4.5 7S6 16 6 12z"/><path d="M14 9l4.5-2.5M14 15l4.5 2.5"/></svg>`,
  bath: `<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12h16v2a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5v-2z"/><path d="M4 12V9.5A2.5 2.5 0 0 1 6.5 7c1 0 1.7.5 2.1 1.3M7 19v1.5M17 19v1.5M2.5 12h19"/></svg>`,
  scissors: `<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="6" cy="6.5" r="2.3"/><circle cx="6" cy="17.5" r="2.3"/><path d="M8 8l11 8.5M8 16l11-8.5"/></svg>`,
  note: `<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 4h9l4 4v12H6z"/><path d="M14.5 4v4.5H19M9 12.5h6M9 16h6"/></svg>`,
  road: `<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 19l4-14h10l4 14"/><path d="M9.5 8l-2.6 11M14.5 8l2.6 11"/><path d="M8.5 2.5c.6.9.6 1.7 0 2.6M12 2c.6.9.6 1.7 0 2.6M15.5 2.5c.6.9.6 1.7 0 2.6"/></svg>`,
  snowflake: `<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><path d="M12 3v18M4.5 7.5l15 9M19.5 7.5l-15 9"/><path d="M12 6.5l-2 1M12 6.5l2 1M12 17.5l-2-1M12 17.5l2-1M7 9l1.8 1.4M7 9l-.4 2.2M17 9l-1.8 1.4M17 9l.4 2.2M7 15l1.8-1.4M7 15l-.4-2.2M17 15l-1.8-1.4M17 15l.4-2.2"/></svg>`,
  wind: `<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" aria-hidden="true"><path d="M3 8h10.5a2.5 2.5 0 1 0-2.3-3.5"/><path d="M3 12.5h14.5a2.7 2.7 0 1 1-2.5 3.8"/><path d="M3 17h8.5a2.2 2.2 0 1 1-2 3"/></svg>`,
  flower: `<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="2.3" fill="currentColor" stroke="none"/><path d="M12 3.5a3 3 0 0 1 0 6 3 3 0 0 1 0-6zM12 14.5a3 3 0 0 1 0 6 3 3 0 0 1 0-6zM3.5 12a3 3 0 0 1 6 0 3 3 0 0 1-6 0zM14.5 12a3 3 0 0 1 6 0 3 3 0 0 1-6 0z"/></svg>`,
  tick: `<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><ellipse cx="12" cy="12" rx="4" ry="5" fill="currentColor" opacity=".15"/><ellipse cx="12" cy="12" rx="4" ry="5"/><path d="M8.5 9L4 6.5M8.5 12H3.5M8.5 15L4 17.5M15.5 9L20 6.5M15.5 12h5M15.5 15L20 17.5"/></svg>`,
  comb: `<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><path d="M4 6h16v3H4z"/><path d="M6 9v9M9.4 9v9M12.8 9v9M16.2 9v9M19.6 9v9"/></svg>`,
  sun: `<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2.5v2.5M12 19v2.5M21.5 12H19M5 12H2.5M18.4 5.6l-1.8 1.8M7.4 16.6l-1.8 1.8M18.4 18.4l-1.8-1.8M7.4 7.4L5.6 5.6"/></svg>`
};

/* Emoji set for the logging, streak, achievement and comfort-indicator UX.
   Deliberately separate from ICONS above: ICONS stays the clean line-icon system used for
   dense data (advisory cards, hour chips), while EMOJI adds warmth and personality to the
   parts of the app that are about feelings, habits and encouragement. */
const EMOJI = {
  walk: '🐾', poop: '💩', pee: '💧', nails: '💅', bath: '🛁', coat: '✂️', custom: '📝',
  streak: '🔥', achievement: '🏆', happy: '❤️', rest: '😴', paw: '🐾',
  sun: '☀️', rain: '🌧️', cold: '❄️', tip: '💡'
};
const COMFORT_EMOJI = { excellent: '✅', good: '✅', moderate: '⚠️', poor: '⚠️', 'very-poor': '🌧️' };

const $ = s => document.querySelector(s);
const statusEl = $('#searchStatus');
const dailyEl = $('#daily');
const bestWalkEl = $('#bestWalk');
const currentEl = $('#current');
const alertsEl = $('#alerts');
const walkAdviceEl = $('#walkAdvice');
const coatAdviceEl = $('#coatAdvice');
const placeResultsEl = $('#placeResults');
const updatedEl = $('#updated');
const heroImgEl = $('#heroImg');
const heroImgWebpEl = $('#heroImgWebp');
const heroPanelLogEl = $('#heroPanelLog');
const langBtnSvEl = $('#langBtnSv');
const langBtnEnEl = $('#langBtnEn');

const SMHI_BASE = 'https://opendata-download-metfcst.smhi.se/api/category/snow1g/version/1';

/* ==================================================================================
   Language / i18n
   ================================================================================== */

const LOCALE = { en: 'en-GB', sv: 'sv-SE' };

let lang = (() => {
  try {
    const saved = localStorage.getItem('dogWeatherLang');
    if (saved === 'en' || saved === 'sv') return saved;
  } catch { /* localStorage may be unavailable */ }
  return 'en';
})();

/* Static UI strings, applied to elements marked with data-i18n(-attr) in the HTML,
   and reused by the JS-rendered dynamic content below. */
const STR = {
  en: {
    pageTitle: "DOGLOGG | The walk forecast for you and your dog",
    metaDescription: "Local weather forecast from your dog's perspective, using open forecast data from SMHI.",
    skipLink: "Skip to content",
    navAriaLabel: "Main menu",
    navForecast: "Today",
    navDogAdvice: "Health & coat",
    navKnowledge: "Knowledge",

    profileHeading: "Your dog's profile",
    profileIntro: "Add a few details and the comfort index and tips below will be nudged to fit your dog specifically — smarter dog walking decisions, made for your dog.",
    profileNameLabel: "Name (optional)",
    profileNamePlaceholder: "E.g. Bella",
    profileSizeLabel: "Size",
    profileSizeSmall: "Small",
    profileSizeMedium: "Medium",
    profileSizeLarge: "Large",
    profileCoatLabel: "Coat",
    profileCoatShort: "Short / smooth",
    profileCoatThick: "Thick or double coat",
    profileAgeLabel: "Age",
    profileAgePuppy: "Puppy (under 1)",
    profileAgeAdult: "Adult",
    profileAgeSenior: "Senior (8+)",
    profileSaveBtn: "Save profile",
    profileEditBtn: "Edit profile",
    profileClearBtn: "Remove profile",
    profileSavedConfirm: "Saved — the comfort index is now personalized.",
    profileClearedConfirm: "Profile removed — showing the general comfort index again.",
    profileSummaryPrefix: "Personalized for",
    heroEyebrow: "WEATHER FOR FOUR PAWS",
    heroTagline: "Know what your dog needs before every walk.",
    heroTitle: "{name} best day — every day!",
    heroTitleDefaultName: "Your dog's",
    heroSubtitle: "Weather guidance designed for dogs — check the conditions where you are and get gentle walk advice tailored to today.",
    searchLabel: "Search location",
    searchPlaceholder: "Search for a place, e.g. Umeå",
    searchButton: "Search weather",
    locateAriaLabel: "Use my location",
    searchStatusInitial: "Search for a place or use your location.",
    placeResultsAriaLabel: "Search results, choose the right place",
    heroWeatherKicker: "TODAY'S WEATHER",
    heroQuickLog: "🐾 Log a walk",
    emptyTitle: "Ready when you are",
    emptyText: "Choose a place to get temperature, precipitation, wind and dog-friendly advice — comfort-based forecasts for happier walks.",
    heroImgAlt: "Dog out on a walk",
    weatherPhotoCaption: "A little walk inspiration for today.",
    logPhotoCaption: "Every walk and little moment counts.",
    dogFactOfDayLabel: "Dog fact of the day",
    forecastKicker: "WALK CONDITIONS",
    forecastTitle: "Weather right now",
    updatedInitial: "Forecast data is fetched from SMHI when you search.",
    bestWalkHeading: "Best walk time right now",
    bestWalkFootnote: 'The ranking is based on the same Dog Comfort Index as above, calculated hour by hour for the coming hours from SMHI/Open-Meteo\'s hourly forecast (temperature, feels-like temperature, precipitation, wind and snowfall) — the hour with the highest score is highlighted. No AI model, just the same rule-based calculation. <a href="#komfortindex-forklaring">How the index is calculated *</a>',
    adviceHeading: "Weather interpretation for your dog",
    adviceDisclaimer: 'These assessments are calculated automatically from weather data (temperature, precipitation, wind) and time of year — no AI model and no connection to real pollen or tick measurements. See current pollen levels at the <a href="https://www.nrm.se/natur--och-miljoovervakning/pollenovervakning/pollenrapporten" target="_blank" rel="noopener">Pollen Report (Swedish Museum of Natural History)</a> and the current tick situation at <a href="https://www.sva.se/aktuellt/insamlingar/rapportera-faesting/karta-och-tabell-oever-faestingfynd/" target="_blank" rel="noopener">SVA\'s tick map</a> (Swedish-language sites). Read more about how the Dog Comfort Index is calculated <a href="#komfortindex-forklaring">here</a>.',
    dailyHeading: "Upcoming days",
    dayHoursCloseBtn: "Close",
    dailyFootnote: 'The Dog Comfort Index for each day is a daytime average (approx. 07:00–21:00), calculated the same way as above. Click or press Enter on a day to see the times of day and hour-by-hour index where available. <a href="#komfortindex-forklaring">How the index is calculated *</a>',
    hundradKicker: "ADAPT TO THE INDIVIDUAL",
    hundradTitle: "Gentle advice for all weather",
    hundradSubtitle: "Your dog's age, breed, coat, health and habits all affect what feels right.",
    story1ImgAlt: "Dog resting in the shade by a water bowl",
    story1Body: '<span>HOT DAYS</span><h3>Water, shade and a slower pace</h3><p>Bring fresh water, choose cooler times of day, and watch for signs of overheating such as heavy panting, restlessness or lethargy. Never leave your dog in a car: under Swedish Board of Agriculture (Jordbruksverket) regulations, an animal must not be left unattended in a car if the inside temperature risks rising above 25°C (77°F), and in as little as 20–50 minutes in a hot car the damage can become life-threatening.</p><a href="https://www.agria.se/hund/artiklar/skotsel-och-vard/sa-tar-du-hand-om-hunden-i-varmen/" target="_blank" rel="noopener">Vet-reviewed advice from Agria ↗</a><a href="https://jordbruksverket.se/djur/hundar-katter-och-smadjur/hundar/transportera-hundar" target="_blank" rel="noopener">Rules on animals in cars, Jordbruksverket ↗</a>',
    story2ImgAlt: "Dog in a yellow raincoat on a wet park path",
    story2Body: '<span>RAIN &amp; FOUL WEATHER</span><h3>Dry gently after the walk</h3><p>Towel-dry the coat, belly and paws. Check paw pads, claws and the fur between the toes, and let your dog rest somewhere warm and draught-free. In colder months, road salt draws moisture out of the paw pads, so rinse off the salt extra carefully then.</p><a href="https://evidensia.se/djurvardguiden/tips-tassar-vinter-hund/" target="_blank" rel="noopener">Paw tips from Evidensia veterinary care ↗</a>',
    tip1Body: '<h3>Rain gear?</h3><p>A light rain coat can be practical for some dogs, but it should fit comfortably and not restrict movement, vision or the ability to relieve themselves. Introduce it calmly and respect your dog\'s signals.</p>',
    tip2Body: '<h3>Cold, ice and salt</h3><p>Short-coated, young, senior or unwell dogs may need extra protection. Road salt dries out and can crack paw pads, so rinse and dry the paws thoroughly after the walk. Dog boots or paw balm can help but need careful, gradual introduction.</p><a href="https://www.agria.se/hund/artiklar/skotsel-och-vard/ta-hand-om-tassarna-vintertid/" target="_blank" rel="noopener">More on paws and road salt, Agria ↗</a>',
    tip3Body: '<h3>Thunder and anxiety</h3><p>Let your dog choose a safe spot indoors, dampen sound and light, and avoid forcing contact. Excessive comforting can reinforce stress in some dogs — stay calm and let your dog be. For severe fear, a vet can advise on sound training, calming aids or prescription medication.</p><a href="https://evidensia.se/djurvardguiden/skottradsla/" target="_blank" rel="noopener">Advice on noise and gunshot phobia, Evidensia ↗</a>',
    scienceKicker: "WHAT THE SCIENCE SAYS",
    scienceTitle: "Weather can change activity levels, but not all dogs react the same way",
    scienceText: 'Research based on owner surveys shows a link between weather and reported activity levels. It does not support the idea that weather affects every dog\'s "mood" the same way. So read your dog\'s body language and adapt the walk to the individual.',
    scienceStat: '<b>3,153</b><span>dog owners took part in an international survey study on seasonal weather and dogs\' activity levels.</span>',
    scienceLinks: '<a href="https://www.mdpi.com/2076-2615/11/11/3302" target="_blank" rel="noopener">The study in Animals ↗</a><a href="https://www.frontiersin.org/journals/veterinary-science/articles/10.3389/fvets.2022.973574/full" target="_blank" rel="noopener">Study on extreme weather events ↗</a><a href="https://www.sva.se/djurhaelsa/djurslag-a-oe/sport-och-saellskapsdjur/hund/" target="_blank" rel="noopener">SVA on dog health ↗</a>',
    noteKicker: "IMPORTANT",
    noteTitle: "Heatstroke is acute and life-threatening",
    noteText: "Heavy panting, lethargy, wobbliness, vomiting, collapse or loss of consciousness can be signs of heatstroke. Move your dog to a cool place, offer water and contact a vet immediately — the same applies if your dog becomes confused, shows clear breathing difficulty, or rapidly deteriorates for any other reason.",
    noteLink: "Read more about heatstroke at Evidensia ↗",
    indexTitle: "How the Dog Comfort Index is calculated",
    indexIntro: "The Dog Comfort Index (0–10) is our own, educational estimate calculated locally from current weather data — not a clinical or scientifically established method. The score starts at 10 and is reduced step by step depending on how conditions are judged to affect an average dog:",
    indexList: '<li><b>Perceived temperature</b> – the largest deduction for intense heat (≥ 26–30°C / 79–86°F) and severe cold (≤ −8 to −15°C / 18 to 5°F), a smaller deduction for milder heat or coolness.</li><li><b>Humidity</b> – high humidity combined with heat makes conditions more strenuous and lowers the score further.</li><li><b>Precipitation</b> – rain or wet snow leads to a deduction that increases with the amount.</li><li><b>Snowfall</b> – a smaller deduction, partly for the risk of snow and ice getting stuck between the paw pads.</li><li><b>Wind and gusts</b> – strong gusts cause the largest deduction, moderate wind a smaller one.</li>',
    indexOutro: 'The score maps to the levels Excellent, Good, Okay with some adjustments, Take it easy, and Unsuitable for longer activity, along with the conditions that contributed most and a short piece of advice. The same index is also used hour by hour in "Best walk time right now", where the coming hour with the highest score is highlighted, as well as a daytime average for each day in "Upcoming days" — click a day there to see the times of day behind the average. Your dog\'s breed, size, age, health, coat, fitness and individual tolerance always affect what\'s actually suitable, and the index never replaces a vet\'s judgement.',
    indexBackLink: "↑ Back to today's weather",
    sourcesTitle: "Sources and data transparency",
    sourcesGrid: '<a href="https://opendata.smhi.se/metfcst/snow1gv1" target="_blank" rel="noopener"><b>SMHI Open Data</b><span>Forecast data, SNOW1gv1</span></a><a href="https://www.smhi.se/data" target="_blank" rel="noopener"><b>SMHI</b><span>Open data and usage</span></a><a href="https://jordbruksverket.se/djur/hundar-katter-och-smadjur/hundar" target="_blank" rel="noopener"><b>Jordbruksverket</b><span>Care, transport and animal welfare</span></a><a href="https://www.sva.se/djurhaelsa/djurslag-a-oe/sport-och-saellskapsdjur/hund/" target="_blank" rel="noopener"><b>SVA</b><span>Swedish National Veterinary Institute</span></a><a href="https://www.agria.se/hund/artiklar/skotsel-och-vard/sa-tar-du-hand-om-hunden-i-varmen/" target="_blank" rel="noopener"><b>Agria</b><span>Vet-reviewed articles</span></a><a href="https://evidensia.se/djurvardguiden/" target="_blank" rel="noopener"><b>Evidensia</b><span>Animal Care Guide</span></a><a href="https://www.mdpi.com/2076-2615/11/11/3302" target="_blank" rel="noopener"><b>Animals, 2021</b><span>Seasonal weather and activity</span></a><a href="https://www.frontiersin.org/journals/veterinary-science/articles/10.3389/fvets.2022.973574/full" target="_blank" rel="noopener"><b>Frontiers in Vet. Science, 2022</b><span>Extreme weather events</span></a><a href="https://www.akc.org/expert-advice/lifestyle/dog-facts/" target="_blank" rel="noopener"><b>American Kennel Club</b><span>Dog Fact of the Day</span></a>',
    sourcesFine: "Place search uses OpenStreetMap's Nominatim service. Forecasts are weather models and can change — always check SMHI's official warnings separately on a live service before planning outdoor activities in extreme weather. The advice on this page is general and never replaces a vet's judgement.",
    footerTagline: "Made with care for wet noses and safe walks.",
    footerBrandLine: "Know what your dog needs before every walk.",
    footerSource: "Weather data: © SMHI, open data.",
    aboutKicker: "ABOUT DOGLOGG",
    aboutHeading: "Smarter dog walking decisions, one forecast at a time",
    aboutText: "DOGLOGG turns open SMHI weather data into comfort-based forecasts for happier walks — a Dog Comfort Index, a best walk window, coat-care tips and a simple log, all built around what your dog actually needs before you head out the door.",
    achievementMilestone: "{count}-day streak — nice work!",
    personalBestLine: "New personal best!",
    knowledgeHubKicker: "DOG KNOWLEDGE",
    knowledgeHubTitle: "Explore by topic",
    knowledgeHubSubtitle: "Short, practical reads on the things that matter most for your dog — more added over time.",

    metricWind: "Wind",
    metricGust: "Gusts",
    metricHumidity: "Humidity",
    feelsLike: "Feels like",
    comfortIndexLabel: "Dog Comfort Index",
    howIndexCalculated: "How the index is calculated *",
    heroAltPrefix: "Dog outside in weather",
    updatedPrefix: "Updated",
    localTimeSuffix: "(local time)",
    sourceLabel: "Source:",
    showingForecastFor: "Showing the forecast for {place}.",
    fetchingForecastFor: "Fetching the forecast for {place}…",
    theLocation: "the location",
    errFetchWeatherGeneric: "Couldn't fetch the weather forecast right now. Check your connection and try again.",
    errDisplayFailed: "Something went wrong while showing the forecast. Please try again shortly.",
    searchingPlace: "Searching for the place…",
    multipleMatches: 'Several places match "{query}". Choose the right one below.',
    errPlaceSearchGeneric: "Something went wrong with the place search. Please try again.",
    geoNotSupported: "Your browser doesn't support location sharing.",
    gettingLocation: "Getting your location…",
    errWeatherForYourLocation: "Couldn't fetch the weather for your location right now.",
    geoDenied: "Location access was denied. Search for a place instead.",
    placeListHint: "Several places match your search. Choose the right one:",
    bestWalkEvenComfort: "Comfort is fairly even for the rest of the day — most of it works well for a walk.",
    bestWalkBestWindow: "The best walking window for the rest of the day, compared with the other coming hours.",
    hourStripCaption: "Weather and Dog Comfort Index, hour by hour",
    outOf10: "out of 10",
    today: "Today",
    showHours: "Show times ▾",
    noHourlyYet: "No hourly forecast yet",
    hoursForTitle: "Hours",
    noHourlyDetail: "No hourly forecast available for this day yet. It usually becomes available closer to the day — check back soon.",
    yourLocation: "Your location",
    errGeocodeNetwork: "Couldn't reach the place search. Check your internet connection.",
    errGeocodeBadResponse: "The place search didn't respond as expected. Please try again shortly.",
    errNoPlaceFound: "I couldn't find a place with that name. Try entering a town, region or country.",
    errSmhiNetwork: "The SMHI request failed.",
    errSmhiBadResponse: "SMHI didn't respond as expected.",
    errNoTimeSeries: "The forecast is missing time series data.",
    errOpenMeteoNetwork: "Couldn't reach Open-Meteo right now.",
    errOpenMeteoBadResponse: "Open-Meteo didn't respond as expected.",
    errOpenMeteoNoData: "The forecast is missing data.",

    navLog: "Log",
    logKicker: "DAILY LOG",
    logTitle: "Log your dog's day",
    logSubtitle: "Walks, bathroom breaks and grooming — logged in one calm, tappable calendar.",
    logQuickHeading: "Log something",
    logDateLabel: "Date",
    logDateToday: "Today",
    logTypeWalk: "Walk",
    logTypePoop: "Poop",
    logTypePee: "Pee",
    logTypeNails: "Nails trimmed",
    logTypeBath: "Bath",
    logTypeCoat: "Coat trimmed",
    logTypeCustom: "Event",
    logWalkPrompt: "How long was the walk?",
    logWalkCustomPlaceholder: "Custom minutes",
    logWalkCustomBtn: "Log walk",
    logCustomLabel: "Or log any event",
    logCustomPlaceholder: "E.g. vet visit",
    logCustomBtn: "Log",
    logCancel: "Cancel",
    logConfirmLogged: "Logged: {type}.",
    logConfirmWalkLogged: "Logged a {min} min walk.",
    logConfirmDeleted: "Entry removed.",
    logConfirmInvalidMinutes: "Enter the walk length in minutes first.",
    logConfirmEmptyCustom: "Type what happened first.",
    logStreakLine: "{count}-day logging streak.",
    calPrevAria: "Previous month",
    calNextAria: "Next month",
    logDayDetailEmpty: "Nothing logged this day yet.",
    logDeleteAria: "Remove entry",
    minutesShort: "min",
    weekdaysShort: "Mo,Tu,We,Th,Fr,Sa,Su",
    monthNames: "January,February,March,April,May,June,July,August,September,October,November,December",

    coatCareHeading: "Coat care for today's weather",
    coatCareFootnote: "These grooming tips are calculated automatically from today's weather (temperature, precipitation, humidity and sun) and time of year. Each tip links to its source below it — no AI model, and it never replaces judgement from a vet or professional groomer.",
    coatBrushTitle: "Brushing today",
    coatBrushHot: "Warm out — brush out the undercoat thoroughly rather than clipping or shaving. A well-brushed, airy coat still insulates against heat and dries faster after a swim.",
    coatBrushRain: "Rainy — save the thorough brushing for after the walk, once the coat is towel-dried. Brushing a wet, tangled coat makes mats worse rather than better.",
    coatBrushShed: "Dry and calm — a good day for the usual brushing, and it's shedding season, so extra brushing now means less loose hair indoors.",
    coatBrushNormal: "Dry and calm weather — a good, ordinary day to brush through the coat.",
    coatBathTitle: "Bath today",
    coatBathVeryCold: "Very cold — skip an outdoor bath entirely right now. If your dog truly needs washing, do it indoors in lukewarm water and dry thoroughly before heading back out.",
    coatBathCold: "Cold — better to wait for a milder day if you can. A dry coat and the skin's natural layer of fat insulate better against the cold than a freshly washed one.",
    coatBathWarm: "Warm — a cooling bath or dip is perfect today. Dry your dog thoroughly afterwards, especially armpits, groin and under the ears.",
    coatBathNormal: "Mild weather — bathing is fine as usual. Dry the coat properly afterwards.",
    coatSnowTitle: "Snow and ice in the coat",
    coatSnowText: "Snow and ice can clump in the coat and get stuck between the paw pads. Gently work out any clumps after the walk — lukewarm water helps with stubborn ones.",
    coatMoistureTitle: "Damp coat & hot spots",
    coatMoistureText: "Humid or wet weather can lead to moist skin irritation (\"hot spots\") in thick-coated dogs, often around the ears, cheeks and neck. Dry your dog thoroughly after the walk or a swim, especially in skin folds and under the coat.",
    coatSunTitle: "Sun protection",
    coatSunText: "Sunny and warm. Dogs with thin, light-coloured or freshly clipped coats can get sunburned, especially on the nose, ear tips and belly. A dog-specific sunscreen can protect the most exposed spots.",
    sourceAgria: "Agria",
    sourceEvidensia: "Evidensia",
    sourceArkenZoo: "Arken Zoo",
    sourceVetPartner: "Veterinary Partner (VIN)",
    sourceAkc: "American Kennel Club"
  },
  sv: {
    pageTitle: "DOGLOGG | Promenadprognosen för dig och din hund",
    metaDescription: "Lokal väderprognos ur hundens perspektiv med öppna prognosdata från SMHI.",
    skipLink: "Hoppa till innehållet",
    navAriaLabel: "Huvudmeny",
    navForecast: "Idag",
    navDogAdvice: "Hälsa & päls",
    navKnowledge: "Kunskap",

    profileHeading: "Din hunds profil",
    profileIntro: "Fyll i några detaljer så justeras komfortindexet och råden nedan efter just din hund — smartare promenadbeslut, anpassade för din hund.",
    profileNameLabel: "Namn (valfritt)",
    profileNamePlaceholder: "T.ex. Bella",
    profileSizeLabel: "Storlek",
    profileSizeSmall: "Liten",
    profileSizeMedium: "Mellan",
    profileSizeLarge: "Stor",
    profileCoatLabel: "Päls",
    profileCoatShort: "Kort/slät päls",
    profileCoatThick: "Tjock päls eller dubbelpäls",
    profileAgeLabel: "Ålder",
    profileAgePuppy: "Valp (under 1 år)",
    profileAgeAdult: "Vuxen",
    profileAgeSenior: "Senior (8+ år)",
    profileSaveBtn: "Spara profil",
    profileEditBtn: "Ändra profil",
    profileClearBtn: "Ta bort profil",
    profileSavedConfirm: "Sparat — komfortindexet är nu anpassat.",
    profileClearedConfirm: "Profilen borttagen — visar det allmänna komfortindexet igen.",
    profileSummaryPrefix: "Anpassat för",
    heroEyebrow: "VÄDER FÖR FYRA TASSAR",
    heroTagline: "Veta vad din hund behöver inför varje promenad.",
    heroTitle: "{name} bästa dag — varje dag!",
    heroTitleDefaultName: "Din hunds",
    heroSubtitle: "Väderguidning gjord för hundar — se förhållandena där du är och få varsamma promenadråd anpassade för dagen.",
    searchLabel: "Sök ort",
    searchPlaceholder: "Sök ort, till exempel Umeå",
    searchButton: "Sök väder",
    locateAriaLabel: "Använd min position",
    searchStatusInitial: "Sök efter en plats eller använd din position.",
    placeResultsAriaLabel: "Sökresultat, välj rätt plats",
    heroWeatherKicker: "DAGENS VÄDER",
    heroQuickLog: "🐾 Logga en promenad",
    emptyTitle: "Redo när du är",
    emptyText: "Välj en plats för att få temperatur, nederbörd, vind och hundanpassade råd — komfortbaserade prognoser för gladare promenader.",
    heroImgAlt: "Hund ute på promenad",
    weatherPhotoCaption: "Lite promenadinspiration för dagen.",
    logPhotoCaption: "Varje promenad och liten stund räknas.",
    dogFactOfDayLabel: "Dagens hundfakta",
    forecastKicker: "PROMENADLÄGET",
    forecastTitle: "Vädret just nu",
    updatedInitial: "Prognosdata hämtas från SMHI när du söker.",
    bestWalkHeading: "Bästa promenadtiden just nu",
    bestWalkFootnote: 'Rangordningen bygger på samma Hundkomfortindex som ovan, uträknat timme för timme för de kommande timmarna utifrån SMHI/Open-Meteos timprognos (temperatur, känns-som-temperatur, nederbörd, vind och snöfall) — den timme med högst poäng lyfts fram. Ingen AI-modell, bara samma regelbaserade beräkning. <a href="#komfortindex-forklaring">Så räknas indexet ut *</a>',
    adviceHeading: "Vädertolkning för hunden",
    adviceDisclaimer: 'Bedömningarna räknas fram automatiskt utifrån väderdata (temperatur, nederbörd, vind) och årstid — ingen AI-modell och ingen koppling till riktiga pollen- eller fästingmätningar. Se aktuell pollennivå hos <a href="https://www.nrm.se/natur--och-miljoovervakning/pollenovervakning/pollenrapporten" target="_blank" rel="noopener">Pollenrapporten (Naturhistoriska riksmuseet)</a> och fästingläget hos <a href="https://www.sva.se/aktuellt/insamlingar/rapportera-faesting/karta-och-tabell-oever-faestingfynd/" target="_blank" rel="noopener">SVA:s fästingkarta</a>. Läs mer om hur Hundkomfortindex räknas ut <a href="#komfortindex-forklaring">här</a>.',
    dailyHeading: "Kommande dagar",
    dayHoursCloseBtn: "Stäng",
    dailyFootnote: 'Hundkomfortindex per dag är ett snitt för dagtid (ca 07–21), uträknat med samma metod som ovan. Klicka eller tryck Enter på en dag för att se klockslag och timme-för-timme-index där det finns tillgängligt. <a href="#komfortindex-forklaring">Så räknas indexet ut *</a>',
    hundradKicker: "ANPASSA EFTER INDIVIDEN",
    hundradTitle: "Snälla råd i alla väder",
    hundradSubtitle: "Hundens ålder, ras, päls, hälsa och vana påverkar vad som känns bra.",
    story1ImgAlt: "Hund vilar i skugga vid en vattenskål",
    story1Body: '<span>VARMA DAGAR</span><h3>Vatten, skugga och lugnare tempo</h3><p>Ta med färskt vatten, välj svalare tider och håll uppsikt efter tecken på överhettning som kraftig hässjning, orolighet eller slöhet. Lämna aldrig hunden i en bil: enligt Jordbruksverkets föreskrifter får ett djur inte lämnas utan tillsyn i en bil om innetemperaturen riskerar att stiga över 25 °C, och redan på 20–50 minuter i en het bil kan skadorna bli livshotande.</p><a href="https://www.agria.se/hund/artiklar/skotsel-och-vard/sa-tar-du-hand-om-hunden-i-varmen/" target="_blank" rel="noopener">Veterinärgranskade råd hos Agria ↗</a><a href="https://jordbruksverket.se/djur/hundar-katter-och-smadjur/hundar/transportera-hundar" target="_blank" rel="noopener">Reglerna om djur i bil, Jordbruksverket ↗</a>',
    story2ImgAlt: "Hund i gul regnjacka på våt parkväg",
    story2Body: '<span>REGN &amp; RUSK</span><h3>Torka varsamt efter promenaden</h3><p>Handdukstorka päls, mage och tassar. Gå igenom trampdynor, klor och pälsen mellan tårna, och låt hunden vila varmt och dragfritt. Under kallare delar av året drar vägsalt ut fukt ur trampdynorna, så skölj gärna bort saltet extra noga då.</p><a href="https://evidensia.se/djurvardguiden/tips-tassar-vinter-hund/" target="_blank" rel="noopener">Tasstips från Evidensia djursjukvård ↗</a>',
    tip1Body: '<h3>Regnkläder?</h3><p>Ett lätt regntäcke kan vara praktiskt för vissa hundar, men plagget ska sitta bekvämt och inte begränsa rörelse, syn eller möjlighet att kissa. Vänj in det lugnt och respektera hundens signaler.</p>',
    tip2Body: '<h3>Kyla, is och salt</h3><p>Korta, tunpälsade, unga, äldre eller sjuka hundar kan behöva extra skydd. Vägsalt torkar ut och kan spricka upp trampdynorna, så skölj och torka tassarna noga efter promenaden. Hundskor eller tassalva kan skydda men kräver försiktig tillvänjning.</p><a href="https://www.agria.se/hund/artiklar/skotsel-och-vard/ta-hand-om-tassarna-vintertid/" target="_blank" rel="noopener">Mer om tassar och vägsalt, Agria ↗</a>',
    tip3Body: '<h3>Åska och oro</h3><p>Låt hunden välja en trygg plats inomhus, dämpa ljud och ljus och undvik att tvinga fram kontakt. Överdriven tröst kan förstärka stressen hos vissa hundar – håll dig lugn och låt hunden vara. Vid stark rädsla kan veterinären ge råd om ljudträning, lugnande hjälpmedel eller receptbelagd medicinering.</p><a href="https://evidensia.se/djurvardguiden/skottradsla/" target="_blank" rel="noopener">Råd vid ljud- och skotträdsla, Evidensia ↗</a>',
    scienceKicker: "VAD VETENSKAPEN SÄGER",
    scienceTitle: "Vädret kan ändra aktiviteten, men inte alla hundar reagerar lika",
    scienceText: 'Forskning baserad på ägarenkäter visar samband mellan väder och rapporterad aktivitet. Den ger inte stöd för att vädret påverkar varje hunds ”humör” på samma sätt. Läs därför kroppsspråket och anpassa promenaden efter individen.',
    scienceStat: '<b>3 153</b><span>hundägare deltog i en internationell enkätstudie om säsongsväder och hundars aktivitet.</span>',
    scienceLinks: '<a href="https://www.mdpi.com/2076-2615/11/11/3302" target="_blank" rel="noopener">Studien i Animals ↗</a><a href="https://www.frontiersin.org/journals/veterinary-science/articles/10.3389/fvets.2022.973574/full" target="_blank" rel="noopener">Studie om extrema väderhändelser ↗</a><a href="https://www.sva.se/djurhaelsa/djurslag-a-oe/sport-och-saellskapsdjur/hund/" target="_blank" rel="noopener">SVA om hundhälsa ↗</a>',
    noteKicker: "VIKTIGT",
    noteTitle: "Värmeslag är akut och livshotande",
    noteText: "Kraftig hässjning, slöhet, vinglighet, kräkningar, kollaps eller medvetslöshet kan vara tecken på värmeslag. Flytta hunden till svalka, erbjud vatten och kontakta veterinär omedelbart – detsamma gäller om hunden blir förvirrad, får tydliga andningsproblem eller snabbt försämras av någon annan anledning.",
    noteLink: "Läs mer om värmeslag hos Evidensia ↗",
    indexTitle: "Så räknas Hundkomfortindex ut",
    indexIntro: "Hundkomfortindex (0–10) är en egen, pedagogisk uppskattning som räknas fram lokalt utifrån aktuell väderdata — ingen klinisk eller vetenskapligt fastställd metod. Poängen börjar på 10 och sänks stegvis beroende på hur förhållandena bedöms påverka en genomsnittlig hund:",
    indexList: '<li><b>Upplevd temperatur</b> – störst avdrag vid stark värme (≥ 26–30 °C) och sträng kyla (≤ −8 till −15 °C), mindre avdrag vid mildare värme eller svalka.</li><li><b>Luftfuktighet</b> – hög luftfuktighet i kombination med värme gör förhållandena tyngre och sänker poängen ytterligare.</li><li><b>Nederbörd</b> – regn eller blötsnö ger avdrag som ökar med mängden.</li><li><b>Snöfall</b> – ett mindre avdrag, bland annat för risken att snö och is fastnar mellan trampdynorna.</li><li><b>Vind och vindbyar</b> – kraftiga byvindar ger störst avdrag, måttlig blåst ett mindre.</li>',
    indexOutro: 'Poängen ger nivåerna Utmärkt, Bra, Okej med anpassning, Ta det försiktigt och Olämpligt för längre aktivitet, tillsammans med de förhållanden som bidragit mest och ett kort råd. Samma index används dessutom timme för timme i "Bästa promenadtiden just nu", där den kommande timmen med högst poäng lyfts fram, samt som ett dagtidssnitt för varje dag i "Kommande dagar" — klicka på en dag där för att se klockslagen bakom snittet. Hundens ras, storlek, ålder, hälsa, päls, kondition och individuella tolerans påverkar alltid vad som faktiskt är lämpligt, och indexet ersätter aldrig bedömning från veterinär.',
    indexBackLink: "↑ Tillbaka till dagens väder",
    sourcesTitle: "Källor och datatransparens",
    sourcesGrid: '<a href="https://opendata.smhi.se/metfcst/snow1gv1" target="_blank" rel="noopener"><b>SMHI Open Data</b><span>Prognosdata, SNOW1gv1</span></a><a href="https://www.smhi.se/data" target="_blank" rel="noopener"><b>SMHI</b><span>Öppna data och användning</span></a><a href="https://jordbruksverket.se/djur/hundar-katter-och-smadjur/hundar" target="_blank" rel="noopener"><b>Jordbruksverket</b><span>Skötsel, transport och djurskydd</span></a><a href="https://www.sva.se/djurhaelsa/djurslag-a-oe/sport-och-saellskapsdjur/hund/" target="_blank" rel="noopener"><b>SVA</b><span>Statens veterinärmedicinska anstalt</span></a><a href="https://www.agria.se/hund/artiklar/skotsel-och-vard/sa-tar-du-hand-om-hunden-i-varmen/" target="_blank" rel="noopener"><b>Agria</b><span>Veterinärgranskade artiklar</span></a><a href="https://evidensia.se/djurvardguiden/" target="_blank" rel="noopener"><b>Evidensia</b><span>Djurvårdsguiden</span></a><a href="https://www.mdpi.com/2076-2615/11/11/3302" target="_blank" rel="noopener"><b>Animals, 2021</b><span>Säsongsväder och aktivitet</span></a><a href="https://www.frontiersin.org/journals/veterinary-science/articles/10.3389/fvets.2022.973574/full" target="_blank" rel="noopener"><b>Frontiers in Vet. Science, 2022</b><span>Extrema väderhändelser</span></a><a href="https://www.akc.org/expert-advice/lifestyle/dog-facts/" target="_blank" rel="noopener"><b>American Kennel Club</b><span>Dagens hundfakta</span></a>',
    sourcesFine: "Platsökning använder OpenStreetMaps Nominatim-tjänst. Prognoser är väderleksmodeller och kan ändras — visa alltid SMHI:s officiella varningar separat i en skarp tjänst innan du planerar utomhusaktiviteter i extremväder. Råden på den här sidan är allmänna och ersätter aldrig bedömning från veterinär.",
    footerTagline: "Gjord med omtanke om blöta nosar och trygga promenader.",
    footerBrandLine: "Veta vad din hund behöver inför varje promenad.",
    footerSource: "Väderdata: © SMHI, öppna data.",
    aboutKicker: "OM DOGLOGG",
    aboutHeading: "Smartare promenadbeslut, en prognos i taget",
    aboutText: "DOGLOGG omvandlar öppna väderdata från SMHI till komfortbaserade prognoser för gladare promenader — ett hundkomfortindex, ett bästa promenadfönster, pälsvårdstips och en enkel logg, allt byggt kring vad din hund faktiskt behöver innan ni går ut.",
    achievementMilestone: "{count} dagar i rad — snyggt jobbat!",
    personalBestLine: "Nytt personbästa!",
    knowledgeHubKicker: "HUNDKUNSKAP",
    knowledgeHubTitle: "Utforska ämne för ämne",
    knowledgeHubSubtitle: "Korta, praktiska texter om det som betyder mest för din hund — fler tillkommer efter hand.",

    metricWind: "Vind",
    metricGust: "Byvind",
    metricHumidity: "Luftfuktighet",
    feelsLike: "Känns som",
    comfortIndexLabel: "Hundkomfortindex",
    howIndexCalculated: "Så räknas indexet ut *",
    heroAltPrefix: "Hund ute i väder",
    updatedPrefix: "Uppdaterad",
    localTimeSuffix: "(lokal tid)",
    sourceLabel: "Källa:",
    showingForecastFor: "Visar prognos för {place}.",
    fetchingForecastFor: "Hämtar prognosen för {place}…",
    theLocation: "platsen",
    errFetchWeatherGeneric: "Kunde inte hämta väderprognosen just nu. Kontrollera anslutningen och försök igen.",
    errDisplayFailed: "Något gick fel när prognosen skulle visas. Försök igen om en stund.",
    searchingPlace: "Söker plats…",
    multipleMatches: 'Flera platser matchar "{query}". Välj rätt plats nedan.',
    errPlaceSearchGeneric: "Något gick fel vid platssökningen. Försök igen.",
    geoNotSupported: "Din webbläsare stöder inte platsdelning.",
    gettingLocation: "Hämtar din position…",
    errWeatherForYourLocation: "Kunde inte hämta väder för din position just nu.",
    geoDenied: "Platsåtkomst nekades. Sök efter ort i stället.",
    placeListHint: "Flera platser matchar sökningen. Välj rätt plats:",
    bestWalkEvenComfort: "Jämn komfort den närmaste tiden — det mesta av dagen fungerar bra för en promenad.",
    bestWalkBestWindow: "Det bästa promenadfönstret den närmaste tiden, jämfört med övriga kommande timmar.",
    hourStripCaption: "Väder och Hundkomfortindex timme för timme",
    outOf10: "av 10",
    today: "Idag",
    showHours: "Visa klockslag ▾",
    noHourlyYet: "Ingen timprognos ännu",
    hoursForTitle: "Klockslag",
    noHourlyDetail: "Ingen timupplöst prognos tillgänglig för den här dagen ännu. Det brukar klarna när dagen kommer närmare — kika gärna tillbaka.",
    yourLocation: "Din position",
    errGeocodeNetwork: "Kunde inte nå platssökningen. Kontrollera din internetanslutning.",
    errGeocodeBadResponse: "Platssökningen svarade inte som väntat. Försök igen om en stund.",
    errNoPlaceFound: "Jag hittade ingen plats med det namnet. Prova att skriva ort, region eller land.",
    errSmhiNetwork: "SMHI-anropet misslyckades.",
    errSmhiBadResponse: "SMHI svarade inte som väntat.",
    errNoTimeSeries: "Prognosen saknar tidsserier.",
    errOpenMeteoNetwork: "Kunde inte nå Open-Meteo just nu.",
    errOpenMeteoBadResponse: "Open-Meteo svarade inte som väntat.",
    errOpenMeteoNoData: "Prognosen saknar data.",

    navLog: "Logga",
    logKicker: "DAGBOK",
    logTitle: "Logga hundens dag",
    logSubtitle: "Promenader, uteliv och pälsvård — loggat i en lugn, klickbar kalender.",
    logQuickHeading: "Logga något",
    logDateLabel: "Datum",
    logDateToday: "Idag",
    logTypeWalk: "Promenad",
    logTypePoop: "Bajs",
    logTypePee: "Kiss",
    logTypeNails: "Klippt klorna",
    logTypeBath: "Bad",
    logTypeCoat: "Klippt pälsen",
    logTypeCustom: "Händelse",
    logWalkPrompt: "Hur lång blev promenaden?",
    logWalkCustomPlaceholder: "Eget antal minuter",
    logWalkCustomBtn: "Logga promenad",
    logCustomLabel: "Eller logga en valfri händelse",
    logCustomPlaceholder: "T.ex. veterinärbesök",
    logCustomBtn: "Logga",
    logCancel: "Avbryt",
    logConfirmLogged: "Loggat: {type}.",
    logConfirmWalkLogged: "Loggade en {min} min promenad.",
    logConfirmDeleted: "Posten togs bort.",
    logConfirmInvalidMinutes: "Ange promenadens längd i minuter först.",
    logConfirmEmptyCustom: "Skriv vad som hände först.",
    logStreakLine: "{count} dagar i rad loggat.",
    calPrevAria: "Föregående månad",
    calNextAria: "Nästa månad",
    logDayDetailEmpty: "Inget loggat den här dagen än.",
    logDeleteAria: "Ta bort post",
    minutesShort: "min",
    weekdaysShort: "Må,Ti,On,To,Fr,Lö,Sö",
    monthNames: "januari,februari,mars,april,maj,juni,juli,augusti,september,oktober,november,december",

    coatCareHeading: "Pälsvård för dagens väder",
    coatCareFootnote: "Dessa pälsvårdsråd räknas fram automatiskt utifrån dagens väder (temperatur, nederbörd, luftfuktighet och sol) och årstid. Varje råd länkar till sin källa nedanför — ingen AI-modell, och det ersätter aldrig bedömning från veterinär eller professionell trimmare.",
    coatBrushTitle: "Borstning idag",
    coatBrushHot: "Varmt ute — borsta ur underullen ordentligt istället för att klippa eller raka pälsen. En välborstad, luftig päls isolerar ändå mot värmen och torkar snabbare efter ett dopp.",
    coatBrushRain: "Regnigt — spara den grundliga borstningen till efter promenaden, när pälsen handdukstorkats. Att borsta en blöt, tovig päls gör tovorna värre snarare än bättre.",
    coatBrushShed: "Torrt och lugnt väder — ett bra tillfälle för den vanliga borstningen, och det är fällningstid, så extra borstning nu ger mindre lössittande hår i hemmet.",
    coatBrushNormal: "Torrt och lugnt väder — en bra, vanlig dag att borsta igenom pälsen.",
    coatBathTitle: "Bad idag",
    coatBathVeryCold: "Mycket kallt — hoppa helt över bad utomhus just nu. Om hunden verkligen behöver tvättas, gör det inomhus i ljummet vatten och torka noggrant innan ni går ut igen.",
    coatBathCold: "Kallt — vänta gärna till en mildare dag om du kan. En torr päls och hudens naturliga fettlager isolerar bättre mot kylan än en nytvättad päls.",
    coatBathWarm: "Varmt — ett svalkande bad eller dopp passar perfekt idag. Torka hunden ordentligt efteråt, särskilt armhålor, ljumskar och under öronen.",
    coatBathNormal: "Milt väder — bad går bra som vanligt. Torka pälsen ordentligt efteråt.",
    coatSnowTitle: "Snö och is i pälsen",
    coatSnowText: "Snö och is kan bilda kokor i pälsen och fastna mellan trampdynorna. Plocka försiktigt bort klumparna efter promenaden — ljummet vatten hjälper mot de som sitter hårt.",
    coatMoistureTitle: "Fukt i pälsen & hot spots",
    coatMoistureText: "Fuktigt eller blött väder kan ge fukteksem (\"hot spots\") hos tjockpälsade hundar, ofta vid öron, kinder och hals. Torka hunden noggrant efter promenaden eller badet, särskilt i hudveck och under pälsen.",
    coatSunTitle: "Solskydd",
    coatSunText: "Soligt och varmt. Hundar med tunn, ljus eller nyklippt päls kan bli solbrända, särskilt på nosen, öronspetsarna och magen. Solskyddsmedel gjort för hundar kan skydda de mest utsatta ställena.",
    sourceAgria: "Agria",
    sourceEvidensia: "Evidensia",
    sourceArkenZoo: "Arken Zoo",
    sourceVetPartner: "Veterinary Partner (VIN)",
    sourceAkc: "American Kennel Club"
  }
};

/* Dagens hundfakta i loggpanelen — 7 verifierade, allmänt vedertagna fakta om hundar,
   ett per veckodag, så samma index alltid motsvarar samma fakta i båda språken. */
const DOG_FACTS = {
  en: [
    "A dog's nose print is unique — no two dogs have the same pattern, much like human fingerprints.",
    "Dogs' sense of smell is estimated to be tens of thousands of times more sensitive than ours.",
    "Dogs mainly cool down by panting — they only sweat through their paw pads and nose.",
    "Puppies are born deaf and blind; their eyes and ears open at around 10–14 days old.",
    "A healthy dog's body temperature runs higher than ours, typically around 38–39°C.",
    "Dogs have a third eyelid, called the nictitating membrane, that helps protect and moisten the eye.",
    "Adult dogs have 42 teeth — ten more than the 32 in an adult human's mouth.",
    "A dog's hearing reaches roughly 45,000 Hz, well beyond the upper range of human hearing.",
    "Dogs have around 1,700 taste buds, compared to a human's roughly 9,000 — smell matters far more to them than taste.",
    "A dog's paw pads act like natural shock absorbers and also help with grip, balance and sensing temperature.",
    "Newborn puppies can't regulate their own body temperature and depend on their mother or littermates for warmth in the first couple of weeks.",
    "Dogs often curl into a ball to sleep, an instinct thought to help conserve body heat and protect vital organs.",
    "Some breeds, such as the Basenji, don't bark in the usual way — they make more of a yodel-like sound instead.",
    "A dog's whiskers can pick up tiny changes in air currents, helping it sense nearby objects even in the dark.",
    "Most dogs have a faster resting heart rate than humans, and smaller dogs tend to have quicker heartbeats than larger ones."
  ],
  sv: [
    "En hunds nostryck är unikt — inga två hundar har samma mönster, ungefär som fingeravtryck hos oss.",
    "Hundars luktsinne uppskattas vara tiotusentals gånger känsligare än vårt.",
    "Hundar kyler främst av sig genom att flåsa — de svettas bara via trampdynorna och nosen.",
    "Valpar föds döva och blinda; ögon och öron öppnas efter ungefär 10–14 dagar.",
    "En frisk hund har högre normal kroppstemperatur än vi, oftast omkring 38–39°C.",
    "Hundar har ett tredje ögonlock, blinkhinnan, som skyddar och håller ögat fuktigt.",
    "Vuxna hundar har 42 tänder — tio fler än de 32 en vuxen människa har.",
    "En hunds hörsel sträcker sig upp till omkring 45 000 Hz, långt bortom vad det mänskliga örat kan uppfatta.",
    "Hundar har omkring 1 700 smaklökar, jämfört med människans cirka 9 000 — därför spelar luktsinnet en mycket större roll för dem än smaken.",
    "Trampdynorna fungerar som naturliga stötdämpare och hjälper hunden med grepp, balans och att känna av temperatur.",
    "Nyfödda valpar kan inte reglera sin egen kroppstemperatur och är beroende av tiken eller kullsyskonen för värme de första veckorna.",
    "Att hundar bollar ihop sig när de sover tros vara en instinkt för att bevara kroppsvärme och skydda inre organ.",
    "Vissa raser, som basenji, skäller inte på vanligt sätt — de ger istället ifrån sig ett mer jodlande läte.",
    "Hundens morrhår kan känna av små förändringar i luftströmmar och hjälper hunden att uppfatta föremål även i mörker.",
    "De flesta hundar har snabbare vilopuls än en människa, och mindre hundar har ofta snabbare hjärtslag än större."
  ]
};

// Källa för samtliga hundfakta ovan: American Kennel Club, se källänken som visas
// tillsammans med fakta i loggpanelen samt i sidans källförteckning.
const DOG_FACTS_SOURCE_URL = 'https://www.akc.org/expert-advice/lifestyle/dog-facts/';

function todaysDogFact() {
  const start = new Date(new Date().getFullYear(), 0, 0);
  const diff = new Date() - start;
  const dayOfYear = Math.floor(diff / 86400000);
  const list = DOG_FACTS[lang] || DOG_FACTS.en;
  return list[dayOfYear % list.length];
}

function renderDailyDogFact() {
  const el = $('#logPanelFact');
  if (el) el.textContent = todaysDogFact();
  const srcEl = $('#logPanelFactSource');
  if (srcEl) {
    srcEl.innerHTML = `${escapeHtml(t('sourceLabel'))} <a href="${DOG_FACTS_SOURCE_URL}" target="_blank" rel="noopener">${escapeHtml(t('sourceAkc'))} ↗</a>`;
  }
}

function t(key, vars) {
  let s = (STR[lang] && STR[lang][key] != null) ? STR[lang][key] : key;
  if (vars) {
    for (const k in vars) s = s.replace(`{${k}}`, vars[k]);
  }
  return s;
}

function applyStaticTranslations() {
  document.documentElement.lang = lang;
  document.title = t('pageTitle');
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) metaDesc.setAttribute('content', t('metaDescription'));

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (STR[lang][key] != null) el.innerHTML = STR[lang][key];
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (STR[lang][key] != null) el.setAttribute('placeholder', STR[lang][key]);
  });
  document.querySelectorAll('[data-i18n-aria-label]').forEach(el => {
    const key = el.getAttribute('data-i18n-aria-label');
    if (STR[lang][key] != null) el.setAttribute('aria-label', STR[lang][key]);
  });
  document.querySelectorAll('[data-i18n-alt]').forEach(el => {
    const key = el.getAttribute('data-i18n-alt');
    if (STR[lang][key] != null) el.setAttribute('alt', STR[lang][key]);
  });

  if (langBtnSvEl) langBtnSvEl.hidden = lang !== 'en';
  if (langBtnEnEl) langBtnEnEl.hidden = lang !== 'sv';

  updateHeroTitle();
  renderDailyDogFact();
  renderKnowledgeHub();
}

function updateHeroTitle() {
  const heroTitleEl = document.querySelector('[data-i18n="heroTitle"]');
  if (!heroTitleEl) return;
  const dogName = dogProfile && dogProfile.name && dogProfile.name.trim();
  const namePart = dogName ? escapeHtml(dogName) : t('heroTitleDefaultName');
  heroTitleEl.innerHTML = t('heroTitle', { name: namePart });
}

function setLang(newLang) {
  if ((newLang !== 'en' && newLang !== 'sv') || newLang === lang) return;
  lang = newLang;
  try { localStorage.setItem('dogWeatherLang', lang); } catch { /* ignore */ }
  applyStaticTranslations();
  if (lastWeatherData && lastLoc) {
    render(lastWeatherData, lastLoc, lastSource);
  }
  if (typeof refreshLogUI === 'function') refreshLogUI();
}

/* ---------- Hjälpfunktioner / helpers ---------- */

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

/* ---------- Vädersymboler: en gemensam uppsättning oavsett datakälla, per språk ---------- */

// Väderikoner: färgglada "flat"-ikoner med fasta färger (inte currentColor), så de syns
// tydligt både på det mörka vädrkortet i hero-sektionen och på de ljusa korten i
// "Kommande dagar" och timremsan, utan att någon CSS-bakgrund behöver anpassas.
const WEATHER_ICONS = {
  sun: `<svg viewBox="0 0 24 24" width="1em" height="1em" aria-hidden="true"><circle cx="12" cy="12" r="5.4" fill="#FDB813"/><g stroke="#FDB813" stroke-width="1.8" stroke-linecap="round"><path d="M12 2.4v2.6M12 19v2.6M21.6 12h-2.6M5.4 12H2.4M18.5 5.5l-1.8 1.8M7.3 16.7l-1.8 1.8M18.5 18.5l-1.8-1.8M7.3 7.3L5.5 5.5"/></g></svg>`,
  sunCloud: `<svg viewBox="0 0 24 24" width="1em" height="1em" aria-hidden="true"><circle cx="12.5" cy="9" r="4.7" fill="#FDB813"/><g stroke="#FDB813" stroke-width="1.5" stroke-linecap="round"><path d="M12.5 1.8v1.9M4.9 9h-1.9M6.7 4.2 5.4 2.9M18.3 4.2l1.3-1.3"/></g><path d="M5 20.3a3.3 3.3 0 0 1 .4-6.6 4.7 4.7 0 0 1 8.9-1.5A3.6 3.6 0 0 1 15.9 20.3H5z" fill="#F1F5F9" stroke="#B9C4CE" stroke-width="1"/></svg>`,
  cloudSun: `<svg viewBox="0 0 24 24" width="1em" height="1em" aria-hidden="true"><circle cx="8.6" cy="7.6" r="4" fill="#FDB813"/><g stroke="#FDB813" stroke-width="1.4" stroke-linecap="round"><path d="M8.6 1.6v1.6M2.6 7.6h1.6M4.5 3.5l1.1 1.1"/></g><path d="M4.5 19a3.6 3.6 0 0 1 .4-7.2 5.1 5.1 0 0 1 9.7-1.7A3.9 3.9 0 0 1 15.7 19H4.5z" fill="#E4EAF0" stroke="#9AA7B4" stroke-width="1"/></svg>`,
  cloud: `<svg viewBox="0 0 24 24" width="1em" height="1em" aria-hidden="true"><path d="M5 18a3.8 3.8 0 0 1 .4-7.6A5.4 5.4 0 0 1 15.9 8.8 4.1 4.1 0 0 1 16.5 18H5z" fill="#CBD5E1" stroke="#8E9BA8" stroke-width="1"/></svg>`,
  fog: `<svg viewBox="0 0 24 24" width="1em" height="1em" aria-hidden="true"><path d="M6 11.3a3.3 3.3 0 0 1 .3-6.6A4.8 4.8 0 0 1 15.7 3.1 3.6 3.6 0 0 1 16.3 11.3H6z" fill="#CBD5E1" stroke="#8E9BA8" stroke-width="1"/><g stroke="#8E9BA8" stroke-width="1.8" stroke-linecap="round"><path d="M3.5 15.3h17M5 18.3h14M6.5 21.3h11"/></g></svg>`,
  drizzle: `<svg viewBox="0 0 24 24" width="1em" height="1em" aria-hidden="true"><path d="M5.5 12.8a3.5 3.5 0 0 1 .3-7 5 5 0 0 1 9.7-1.7A3.8 3.8 0 0 1 16 12.8H5.5z" fill="#9AA7B4" stroke="#6B7A88" stroke-width="1"/><g fill="#38BDF8"><circle cx="8.5" cy="17.6" r="1.15"/><circle cx="12" cy="17.6" r="1.15"/><circle cx="15.5" cy="17.6" r="1.15"/></g></svg>`,
  rain: `<svg viewBox="0 0 24 24" width="1em" height="1em" aria-hidden="true"><path d="M5.5 12.3a3.5 3.5 0 0 1 .3-7 5 5 0 0 1 9.7-1.7A3.8 3.8 0 0 1 16 12.3H5.5z" fill="#7C8B9A" stroke="#586573" stroke-width="1"/><g stroke="#2563EB" stroke-width="1.9" stroke-linecap="round"><path d="M8 15.8l-1.3 3M12.3 15.8l-1.3 3M16.6 15.8l-1.3 3"/></g></svg>`,
  thunder: `<svg viewBox="0 0 24 24" width="1em" height="1em" aria-hidden="true"><path d="M5.5 11.3a3.5 3.5 0 0 1 .3-7 5 5 0 0 1 9.7-1.7A3.8 3.8 0 0 1 16 11.3H5.5z" fill="#5B6B7A" stroke="#3F4C59" stroke-width="1"/><path d="M12.5 11.3l-3 5h3l-1.5 4.4 4.5-6.4h-3z" fill="#FBBF24"/></svg>`,
  sleet: `<svg viewBox="0 0 24 24" width="1em" height="1em" aria-hidden="true"><path d="M5.5 12.3a3.5 3.5 0 0 1 .3-7 5 5 0 0 1 9.7-1.7A3.8 3.8 0 0 1 16 12.3H5.5z" fill="#9AA7B4" stroke="#6B7A88" stroke-width="1"/><path d="M8 15.8l-1 3M15.5 15.8l-1 3" stroke="#2563EB" stroke-width="1.9" stroke-linecap="round"/><g fill="#E0F2FE" stroke="#7DD3FC" stroke-width="1"><circle cx="12" cy="16.9" r="1.3"/><circle cx="12" cy="19.9" r="1.3"/></g></svg>`,
  snow: `<svg viewBox="0 0 24 24" width="1em" height="1em" aria-hidden="true"><path d="M5.5 11.3a3.5 3.5 0 0 1 .3-7 5 5 0 0 1 9.7-1.7A3.8 3.8 0 0 1 16 11.3H5.5z" fill="#CBD5E1" stroke="#8E9BA8" stroke-width="1"/><g fill="#7DD3FC"><circle cx="8" cy="17.4" r="1.25"/><circle cx="12" cy="19.4" r="1.25"/><circle cx="16" cy="17.4" r="1.25"/></g></svg>`
};

const CONDITION_INFO = {
  en: {
    clear: [WEATHER_ICONS.sun, 'Clear'],
    mostlyClear: [WEATHER_ICONS.sunCloud, 'Mostly clear'],
    partlyCloudy: [WEATHER_ICONS.cloudSun, 'Partly cloudy'],
    cloudy: [WEATHER_ICONS.cloud, 'Mostly cloudy'],
    overcast: [WEATHER_ICONS.cloud, 'Overcast'],
    fog: [WEATHER_ICONS.fog, 'Fog'],
    drizzle: [WEATHER_ICONS.drizzle, 'Light drizzle'],
    rainLight: [WEATHER_ICONS.drizzle, 'Light rain showers'],
    rain: [WEATHER_ICONS.rain, 'Rain'],
    rainHeavy: [WEATHER_ICONS.rain, 'Heavy rain'],
    thunder: [WEATHER_ICONS.thunder, 'Thunder'],
    sleet: [WEATHER_ICONS.sleet, 'Sleet'],
    snowLight: [WEATHER_ICONS.sleet, 'Light snow'],
    snow: [WEATHER_ICONS.snow, 'Snow'],
    snowHeavy: [WEATHER_ICONS.snow, 'Heavy snow'],
    unknown: [WEATHER_ICONS.sunCloud, 'Changeable weather']
  },
  sv: {
    clear: [WEATHER_ICONS.sun, 'Klart'],
    mostlyClear: [WEATHER_ICONS.sunCloud, 'Nästan klart'],
    partlyCloudy: [WEATHER_ICONS.cloudSun, 'Växlande molnighet'],
    cloudy: [WEATHER_ICONS.cloud, 'Halvklart'],
    overcast: [WEATHER_ICONS.cloud, 'Mulet'],
    fog: [WEATHER_ICONS.fog, 'Dimma'],
    drizzle: [WEATHER_ICONS.drizzle, 'Lätt duggregn'],
    rainLight: [WEATHER_ICONS.drizzle, 'Lätta regnskurar'],
    rain: [WEATHER_ICONS.rain, 'Regn'],
    rainHeavy: [WEATHER_ICONS.rain, 'Kraftigt regn'],
    thunder: [WEATHER_ICONS.thunder, 'Åska'],
    sleet: [WEATHER_ICONS.sleet, 'Snöblandat regn'],
    snowLight: [WEATHER_ICONS.sleet, 'Lätt snöfall'],
    snow: [WEATHER_ICONS.snow, 'Snöfall'],
    snowHeavy: [WEATHER_ICONS.snow, 'Kraftigt snöfall'],
    unknown: [WEATHER_ICONS.sunCloud, 'Växlande väder']
  }
};

function conditionInfo(key) {
  return CONDITION_INFO[lang][key] || CONDITION_INFO[lang].unknown;
}

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

/* ---------- Slumpade hero-foton: bakgrundsbild bakom "Vädret idag" och bakom
   "Logga hundens dag", på samma sätt som fog/windy-bilderna bakom övriga paneler ---------- */

// hero-fog och hero-windy används redan som fasta bakgrunder för de andra panelerna
// på sidan, så de utesluts här för att undvika att samma foto dyker upp två gånger.
const RANDOM_HERO_BASENAMES = ['hero-sun', 'hero-rain', 'hero-snow', 'hero-hot', 'hero-evening'];
const RANDOM_HERO_CLASSES = RANDOM_HERO_BASENAMES.map(base => `panel--${base}`);

function setRandomHeroPanel(panelEl) {
  if (!panelEl) return;
  panelEl.classList.remove(...RANDOM_HERO_CLASSES);
  const base = RANDOM_HERO_BASENAMES[Math.floor(Math.random() * RANDOM_HERO_BASENAMES.length)];
  panelEl.classList.add(`panel--${base}`);
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
  u.searchParams.set('language', lang === 'sv' ? 'sv' : 'en');
  u.searchParams.set('format', 'json');

  let r;
  try {
    r = await fetch(u);
  } catch (err) {
    throw new Error(t('errGeocodeNetwork'));
  }
  if (!r.ok) throw new Error(t('errGeocodeBadResponse'));

  const data = await r.json();
  const results = Array.isArray(data.results) ? data.results : [];
  if (!results.length) throw new Error(t('errNoPlaceFound'));

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
    const r = await fetch(u, { headers: { 'Accept-Language': lang === 'sv' ? 'sv' : 'en' } });
    if (!r.ok) throw new Error('no');
    const x = await r.json();
    const addr = x.address || {};
    const name = addr.city || addr.town || addr.village || addr.municipality || addr.county || t('yourLocation');
    const countryCode = (addr.country_code || '').toUpperCase();
    return { name, countryCode };
  } catch {
    return { name: t('yourLocation'), countryCode: '' };
  }
}

// Slår upp besökarens land via IP, enbart för att kunna välja svenska automatiskt
// åt besökare i Sverige. Används inte för att visa väderdata eller fästingdata.
async function detectVisitorCountryCode() {
  try {
    const r = await fetch('https://ipwho.is/');
    if (!r.ok) return null;
    const data = await r.json();
    if (data && data.success !== false && data.country_code) {
      return String(data.country_code).toUpperCase();
    }
  } catch { /* nätverk/tjänst otillgänglig – ignorera tyst, behåll förvalt språk */ }
  return null;
}

/* ---------- Väderdata: hämtning och normalisering ---------- */

async function fetchSmhi(loc) {
  const u = `${SMHI_BASE}/geotype/point/lon/${loc.lon.toFixed(5)}/lat/${loc.lat.toFixed(5)}/data.json`;
  let r;
  try {
    r = await fetch(u);
  } catch (err) {
    throw new Error(t('errSmhiNetwork'));
  }
  if (!r.ok) throw new Error(t('errSmhiBadResponse'));
  const data = await r.json();
  return normalizeSmhi(data);
}

function normalizeSmhi(data) {
  const ts = Array.isArray(data.timeSeries) ? data.timeSeries : [];
  if (!ts.length) throw new Error(t('errNoTimeSeries'));

  const now = Date.now();
  const cur = ts.find(x => new Date(x.time).getTime() >= now) || ts[0];

  const tVal = val(cur, 'air_temperature');
  const w = val(cur, 'wind_speed');
  const g = val(cur, 'wind_speed_of_gust');
  const hum = val(cur, 'relative_humidity');
  const p = val(cur, 'precipitation_amount_mean') ?? val(cur, 'precipitation_amount_median') ?? val(cur, 'precipitation_amount_max');
  const sym = Number(val(cur, 'symbol_code') ?? 1);
  const conditionKey = smhiCondition(sym);

  // SMHI:s punktprognos (snow1g) exponerar ingen egen "snöfallsmängd"-parameter (till skillnad
  // från Open-Meteos "snowfall"). Vi uppskattar därför snöfall genom att använda den totala
  // nederbördsmängden när vädersymbolen anger snö eller snöblandat väder, annars 0.
  const isSnowCondition = ['snow', 'snowLight', 'snowHeavy', 'sleet'].includes(conditionKey);
  const snowfallEstimate = isSnowCondition ? (p ?? 0) : 0;

  const current = {
    temp: tVal, apparentTemp: null, humidity: hum, wind: w, gust: g, precip: p, snowfall: snowfallEstimate,
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
    const hoursAll = arr.map(mapSmhiHour);
    const hours = hoursAll.filter(hh => new Date(hh.time).getTime() >= hourCutoff);
    return {
      date: mid.time,
      tempMax: temps.length ? Math.max(...temps) : null,
      tempMin: temps.length ? Math.min(...temps) : null,
      precipSum: rain.length ? Math.max(...rain) : null,
      condition: smhiCondition(sc),
      hours,
      hoursAll,
      comfort: summarizeDayComfort(hours)
    };
  });

  // "Bästa promenadtiden" ska visa alla av dagens timmar (00–23), inte bara de som
  // återstår framåt, så hela dagen syns i timremsan.
  const hourly = daily[0]?.hoursAll ?? [];

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
    throw new Error(t('errOpenMeteoNetwork'));
  }
  if (!r.ok) throw new Error(t('errOpenMeteoBadResponse'));

  const data = await r.json();
  if (!data.current || !data.daily) throw new Error(t('errOpenMeteoNoData'));
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
    const dayHoursAll = hoursByDay[d.time[i]] || [];
    const dayHours = dayHoursAll.filter(hh => new Date(hh.time).getTime() >= hourCutoff);
    daily.push({
      date: d.time[i],
      tempMax: d.temperature_2m_max ? d.temperature_2m_max[i] : null,
      tempMin: d.temperature_2m_min ? d.temperature_2m_min[i] : null,
      precipSum: d.precipitation_sum ? d.precipitation_sum[i] : null,
      condition: wmoCondition(d.weather_code ? d.weather_code[i] : null),
      hours: dayHours,
      hoursAll: dayHoursAll,
      comfort: summarizeDayComfort(dayHours)
    });
  }

  // "Bästa promenadtiden" ska visa alla av dagens timmar (00–23), inte bara de som
  // återstår framåt, så hela dagen syns i timremsan.
  const hourly = daily[0]?.hoursAll ?? [];

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

const TIER_TEXT = {
  en: {
    excellent: 'Excellent walking weather',
    good: 'Good walking weather',
    moderate: 'Okay with some adjustments',
    poor: 'Take it easy',
    veryPoor: 'Unsuitable for longer activity'
  },
  sv: {
    excellent: 'Utmärkt promenadväder',
    good: 'Bra promenadväder',
    moderate: 'Okej med anpassning',
    poor: 'Ta det försiktigt',
    veryPoor: 'Olämpligt för längre aktivitet'
  }
};

// Delar upp en poäng (0–10) i samma nivåer/etiketter/färger som används genomgående i appen,
// så att både en enskild avläsning och ett dagssnitt (se summarizeDayComfort) blir konsekventa.
// Bygger en cirkulär "gauge" för Hundkomfortindex istället för en platt stapel/siffra.
// Använder samma score/color som redan beräknas av calculateDogComfortIndex/comfortTier,
// så ingen ändring av själva indexlogiken krävs – bara hur den visas.
function comfortGaugeHtml(score, color, size) {
  const px = size || 84;
  const deg = (Math.max(0, Math.min(10, score)) / 10 * 360).toFixed(1);
  return `<div class="comfort-gauge" style="--gauge-color:${color};--gauge-pct:${deg}deg;--gauge-size:${px}px" aria-hidden="true">
    <span class="comfort-gauge-value">${n(score, 1)}</span>
    <span class="comfort-gauge-unit">/10</span>
  </div>`;
}

function comfortTier(score) {
  const tt = TIER_TEXT[lang];
  if (score >= 8.5) return { level: 'excellent', label: tt.excellent, color: '#2f7d5c' };
  if (score >= 7) return { level: 'good', label: tt.good, color: '#659b4b' };
  if (score >= 5) return { level: 'moderate', label: tt.moderate, color: '#d5a33c' };
  if (score >= 3) return { level: 'poor', label: tt.poor, color: '#dc7835' };
  return { level: 'very-poor', label: tt.veryPoor, color: '#bd4747' };
}

const COMFORT_TEXT = {
  en: {
    veryHighApparent: 'very high perceived temperature',
    recVeryHighApparent: 'Avoid strenuous walks and stick to only very short breaks in the shade.',
    highApparent: 'high perceived temperature',
    recHighApparent: 'Choose a shorter walk, keep an easy pace, and bring fresh water.',
    warmApparent: 'warm weather',
    recWarmApparent: 'Bring water and look for shade or a cooler time of day.',
    mildWarmApparent: 'mild to warm weather',
    extremeCold: 'extreme cold',
    recExtremeCold: 'Limit time outdoors and adjust protection to your dog\u2019s individual needs.',
    veryCold: 'very cold weather',
    recVeryCold: 'Consider a shorter walk and check paws and body temperature.',
    cold: 'cold weather',
    recCold: 'Keep an eye on the paws and adjust the length of the walk.',
    cool: 'cool weather',
    humidHeat: 'high humidity combined with heat',
    recHumidHeat: 'High humidity can make warm weather more strenuous. Slow the pace and offer water.',
    heavyRain: 'heavy precipitation',
    recHeavyRain: 'Plan a shorter route and dry the coat, belly and paws thoroughly afterwards.',
    rainOrWetSnow: 'rain or wet snow',
    recRain: 'Dry your dog\u2019s coat, belly and paws after the walk.',
    lightRain: 'light precipitation',
    snowfall: 'snowfall',
    recSnowfall: 'Check whether snow or ice is getting stuck between the paw pads.',
    veryStrongGusts: 'very strong gusts',
    recVeryStrongGusts: 'Avoid forests and places where branches or loose objects could fall.',
    strongGusts: 'strong gusts',
    recStrongGusts: 'Choose a sheltered route and keep your dog close.',
    windy: 'windy conditions',
    comfortable: 'comfortable weather conditions',
    recDefault: 'The weather looks suitable for a normal walk, but always adapt to your dog\u2019s signals.',
    profileColdSensitive: 'extra cold-sensitive for {dog}',
    recProfileCold: '{dog} may feel the cold more than average \u2014 consider a shorter walk or extra protection.',
    profileHeatSensitive: 'extra heat-sensitive for {dog}',
    recProfileHeat: '{dog} may feel the heat more than average \u2014 keep the pace easy and offer shade and water often.'
  },
  sv: {
    veryHighApparent: 'mycket hög upplevd temperatur',
    recVeryHighApparent: 'Undvik ansträngande promenader och välj endast mycket korta rastningar i skugga.',
    highApparent: 'hög upplevd temperatur',
    recHighApparent: 'Välj en kortare promenad, håll lugnt tempo och ta med färskt vatten.',
    warmApparent: 'varmt väder',
    recWarmApparent: 'Ta med vatten och välj gärna skugga eller en svalare tid på dagen.',
    mildWarmApparent: 'milt till varmt väder',
    extremeCold: 'extrem kyla',
    recExtremeCold: 'Begränsa tiden utomhus och anpassa skyddet efter hundens individuella behov.',
    veryCold: 'mycket kallt väder',
    recVeryCold: 'Överväg kortare promenad och kontrollera tassar och kroppstemperatur.',
    cold: 'kallt väder',
    recCold: 'Håll uppsikt över tassarna och anpassa promenadens längd.',
    cool: 'svalt väder',
    humidHeat: 'hög luftfuktighet i kombination med värme',
    recHumidHeat: 'Hög luftfuktighet kan göra varmt väder mer ansträngande. Sänk tempot och erbjud vatten.',
    heavyRain: 'kraftig nederbörd',
    recHeavyRain: 'Planera en kortare runda och torka päls, mage och tassar noggrant efteråt.',
    rainOrWetSnow: 'regn eller blötsnö',
    recRain: 'Torka hundens päls, mage och tassar efter promenaden.',
    lightRain: 'lätt nederbörd',
    snowfall: 'snöfall',
    recSnowfall: 'Kontrollera om snö eller is fastnar mellan trampdynorna.',
    veryStrongGusts: 'mycket kraftiga vindbyar',
    recVeryStrongGusts: 'Undvik skog och platser där grenar eller lösa föremål kan falla.',
    strongGusts: 'kraftiga vindbyar',
    recStrongGusts: 'Välj en skyddad promenadväg och håll hunden nära.',
    windy: 'blåsigt väder',
    comfortable: 'behagliga väderförhållanden',
    recDefault: 'Vädret ser lämpligt ut för en vanlig promenad, men anpassa alltid efter hundens signaler.',
    profileColdSensitive: 'extra köldkänsligt för {dog}',
    recProfileCold: '{dog} kan uppleva kylan starkare än genomsnittet \u2014 överväg en kortare promenad eller extra skydd.',
    profileHeatSensitive: 'extra värmekänsligt för {dog}',
    recProfileHeat: '{dog} kan uppleva värmen starkare än genomsnittet \u2014 håll ett lugnt tempo och erbjud skugga och vatten ofta.'
  }
};

/* ==================================================================================
   Hundprofil (personalisering av Hundkomfortindex)
   ================================================================================== */
const DOG_PROFILE_KEY = 'dogWeatherProfile';

function loadDogProfile() {
  try {
    const raw = localStorage.getItem(DOG_PROFILE_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw);
    if (p && typeof p === 'object') return p;
  } catch { /* saknad eller ogiltig profil i localStorage – ignorera tyst */ }
  return null;
}

let dogProfile = loadDogProfile();

function saveDogProfile(profile) {
  dogProfile = profile;
  try { localStorage.setItem(DOG_PROFILE_KEY, JSON.stringify(profile)); } catch { /* localStorage kan vara otillgängligt */ }
}

function clearDogProfile() {
  dogProfile = null;
  try { localStorage.removeItem(DOG_PROFILE_KEY); } catch { /* ignore */ }
}

function calculateDogComfortIndex(weather) {
  const C = COMFORT_TEXT[lang];
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
    reasons.push(C.veryHighApparent);
    recommendations.push(C.recVeryHighApparent);
  } else if (apparentTemperature >= 26) {
    score -= 5;
    reasons.push(C.highApparent);
    recommendations.push(C.recHighApparent);
  } else if (apparentTemperature >= 22) {
    score -= 2.5;
    reasons.push(C.warmApparent);
    recommendations.push(C.recWarmApparent);
  } else if (apparentTemperature >= 18) {
    score -= 1;
    reasons.push(C.mildWarmApparent);
  }

  if (apparentTemperature <= -15) {
    score -= 6;
    reasons.push(C.extremeCold);
    recommendations.push(C.recExtremeCold);
  } else if (apparentTemperature <= -8) {
    score -= 4;
    reasons.push(C.veryCold);
    recommendations.push(C.recVeryCold);
  } else if (apparentTemperature <= -2) {
    score -= 2;
    reasons.push(C.cold);
    recommendations.push(C.recCold);
  } else if (apparentTemperature <= 3) {
    score -= 0.5;
    reasons.push(C.cool);
  }

  if (humidity >= 80 && apparentTemperature >= 22) {
    score -= 1.5;
    reasons.push(C.humidHeat);
    recommendations.push(C.recHumidHeat);
  }

  if (precipitation >= 5) {
    score -= 2.5;
    reasons.push(C.heavyRain);
    recommendations.push(C.recHeavyRain);
  } else if (precipitation >= 1) {
    score -= 1.5;
    reasons.push(C.rainOrWetSnow);
    recommendations.push(C.recRain);
  } else if (precipitation > 0) {
    score -= 0.5;
    reasons.push(C.lightRain);
  }

  if (snowfall >= 2) {
    score -= 1;
    reasons.push(C.snowfall);
    recommendations.push(C.recSnowfall);
  }

  if (windGusts >= 20) {
    score -= 3.5;
    reasons.push(C.veryStrongGusts);
    recommendations.push(C.recVeryStrongGusts);
  } else if (windGusts >= 15) {
    score -= 2;
    reasons.push(C.strongGusts);
    recommendations.push(C.recStrongGusts);
  } else if (windSpeed >= 10) {
    score -= 1;
    reasons.push(C.windy);
  }

  // Personalisering: om användaren har sparat en hundprofil, nudgas indexet något
  // för egenskaper som gör en hund mer köld- eller värmekänslig än genomsnittet.
  // Basalgoritmen ovan är opåverkad – det här är ett tillägg, inte en ersättning.
  if (dogProfile) {
    const dogName = (dogProfile.name || '').trim() || (lang === 'sv' ? 'din hund' : 'your dog');
    const coldSensitive = dogProfile.coat === 'short' || dogProfile.size === 'small' ||
      dogProfile.age === 'puppy' || dogProfile.age === 'senior';
    const heatSensitive = dogProfile.coat === 'thick_double' ||
      dogProfile.age === 'puppy' || dogProfile.age === 'senior';

    if (coldSensitive && apparentTemperature <= 3) {
      score -= apparentTemperature <= -8 ? 1.5 : 1;
      reasons.push(C.profileColdSensitive.replace('{dog}', dogName));
      recommendations.unshift(C.recProfileCold.replace('{dog}', dogName));
    }
    if (heatSensitive && apparentTemperature >= 18) {
      score -= apparentTemperature >= 26 ? 1.5 : 1;
      reasons.push(C.profileHeatSensitive.replace('{dog}', dogName));
      recommendations.unshift(C.recProfileHeat.replace('{dog}', dogName));
    }
  }

  score = clamp(score, 0, 10);
  const { level, label, color } = comfortTier(score);

  if (reasons.length === 0) {
    reasons.push(C.comfortable);
  }

  if (recommendations.length === 0) {
    recommendations.push(C.recDefault);
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
  hint.textContent = t('placeListHint');
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

const ALERT_TEXT = {
  en: {
    heat: '<div class="alert"><b>Heat worth taking seriously.</b> Bring water and shorten or move strenuous activity to cooler hours. Never leave your dog in the car: animals must not be left unattended in a car if the inside temperature risks exceeding 25°C (77°F).</div>',
    wet: '<div class="alert"><b>Really wet out there.</b> Plan for drying and checking paws and between the paw pads after the walk.</div>',
    cold: '<div class="alert"><b>Severe cold.</b> Shorten the walk and keep extra watch on paws, ears and tail.</div>'
  },
  sv: {
    heat: '<div class="alert"><b>Värme att ta på allvar.</b> Ta med vatten och korta ned eller flytta ansträngande aktivitet till svalare timmar. Lämna aldrig hunden i bilen: djur får inte lämnas utan tillsyn i en bil om innetemperaturen riskerar att överstiga 25 °C.</div>',
    wet: '<div class="alert"><b>Rejält blött.</b> Planera för torkning och kontroll av tassar och mellan trampdynorna efter rundan.</div>',
    cold: '<div class="alert"><b>Sträng kyla.</b> Korta ned promenaden och håll extra koll på tassar, öron och svans.</div>'
  }
};

function renderAlerts(cur) {
  const A = ALERT_TEXT[lang];
  const temp = cur.apparentTemp != null ? cur.apparentTemp : cur.temp;
  const alerts = [];

  if (temp != null && temp >= 25) alerts.push(A.heat);
  if (cur.precip != null && cur.precip > 2) alerts.push(A.wet);
  if (temp != null && temp <= -10) alerts.push(A.cold);

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
  const names = new Intl.DateTimeFormat(LOCALE[lang], { weekday: 'short', day: 'numeric', month: 'short', timeZone: tz });

  dailyState = { days: weatherData.daily, tz, unit, openIndex: null };
  if (dayHoursEl) { dayHoursEl.hidden = true; dayHoursBodyEl.innerHTML = ''; }

  dailyEl.innerHTML = weatherData.daily.map((d, i) => {
    const [icon, desc] = conditionInfo(d.condition);
    const label = i === 0 ? t('today') : names.format(new Date(d.date));
    const max = formatTemp(d.tempMax, unit);
    const min = formatTemp(d.tempMin, unit);
    const rain = d.precipSum != null ? n(d.precipSum, 1) : '–';
    const comfortPill = d.comfort
      ? `<span class="day-comfort" style="color:${d.comfort.color};background:${d.comfort.color}1a">${n(d.comfort.score, 1)}/10 · ${escapeHtml(d.comfort.label)}</span>`
      : '';
    const hint = (d.hours && d.hours.length)
      ? `<p class="day-hint">${escapeHtml(t('showHours'))}</p>`
      : `<p class="day-hint">${escapeHtml(t('noHourlyYet'))}</p>`;
    return `<article class="day ${i === 0 ? 'today' : ''}" role="button" tabindex="0" aria-expanded="false" aria-controls="dayHours" data-day-index="${i}">
      <b>${escapeHtml(label)}</b>
      <div class="day-icon">${icon}</div>
      <div class="range">${max}° / ${min}°${unit}</div>
      <small>${escapeHtml(desc)} · ${escapeHtml(n(rain === '–' ? null : rain))}${rain !== '–' ? ' mm' : ''}</small>
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

  const dayNameFmt = new Intl.DateTimeFormat(LOCALE[lang], { weekday: 'long', day: 'numeric', month: 'long', timeZone: dailyState.tz });
  const dayLabel = index === 0 ? t('today').toLowerCase() : dayNameFmt.format(new Date(d.date));
  dayHoursTitleEl.textContent = `${t('hoursForTitle')} ${dayLabel}`;

  const hours = d.hours || [];
  if (!hours.length) {
    dayHoursBodyEl.innerHTML = `<p class="day-hours-empty">${escapeHtml(t('noHourlyDetail'))}</p>`;
  } else {
    const withComfort = computeHourlyComfort(hours);
    const best = withComfort.reduce((a, b) => (b.comfort.score > a.comfort.score ? b : a), withComfort[0]);
    const timeFmt = new Intl.DateTimeFormat(LOCALE[lang], { hour: '2-digit', minute: '2-digit', timeZone: dailyState.tz });

    const chips = withComfort.map(h => {
      const [icon, desc] = conditionInfo(h.condition);
      const isBest = h.time === best.time;
      const timeStr = timeFmt.format(new Date(h.time));
      const tempStr = `${formatTemp(h.temp, dailyState.unit)}°${dailyState.unit}`;
      const chipLabel = `${timeStr}, ${desc}, ${tempStr}, ${t('comfortIndexLabel')} ${n(h.comfort.score, 1)} ${t('outOf10')}, ${h.comfort.label}`;
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

/* ---------- Hundprofil: UI-koppling ---------- */
const dogProfileForm = $('#dogProfileForm');
const dogProfileSummary = $('#dogProfileSummary');
const dogProfileSummaryText = $('#dogProfileSummaryText');
const dogProfileEditBtn = $('#dogProfileEditBtn');
const dogProfileClearBtn = $('#dogProfileClearBtn');
const dogProfileNameEl = $('#dogProfileName');
const dogProfileSizeEl = $('#dogProfileSize');
const dogProfileCoatEl = $('#dogProfileCoat');
const dogProfileAgeEl = $('#dogProfileAge');

function dogProfileSummaryLabel(profile) {
  const sizeKey = { small: 'profileSizeSmall', medium: 'profileSizeMedium', large: 'profileSizeLarge' }[profile.size];
  const coatKey = { short: 'profileCoatShort', thick_double: 'profileCoatThick' }[profile.coat];
  const ageKey = { puppy: 'profileAgePuppy', adult: 'profileAgeAdult', senior: 'profileAgeSenior' }[profile.age];
  const bits = [sizeKey, coatKey, ageKey].filter(Boolean).map(k => t(k).toLowerCase());
  const who = profile.name || (lang === 'sv' ? 'din hund' : 'your dog');
  return `${escapeHtml(t('profileSummaryPrefix'))} <b>${escapeHtml(who)}</b> — ${escapeHtml(bits.join(', '))}`;
}

function renderDogProfileUI() {
  if (dogProfile) {
    dogProfileSummaryText.innerHTML = dogProfileSummaryLabel(dogProfile);
    dogProfileSummary.hidden = false;
    dogProfileForm.hidden = true;
  } else {
    dogProfileSummary.hidden = true;
    dogProfileForm.hidden = false;
  }
}

if (dogProfile) {
  dogProfileNameEl.value = dogProfile.name || '';
  dogProfileSizeEl.value = dogProfile.size || 'medium';
  dogProfileCoatEl.value = dogProfile.coat || 'short';
  dogProfileAgeEl.value = dogProfile.age || 'adult';
}
renderDogProfileUI();

dogProfileForm?.addEventListener('submit', e => {
  e.preventDefault();
  saveDogProfile({
    name: dogProfileNameEl.value.trim().slice(0, 30),
    size: dogProfileSizeEl.value,
    coat: dogProfileCoatEl.value,
    age: dogProfileAgeEl.value
  });
  renderDogProfileUI();
  updateHeroTitle();
  statusEl.textContent = t('profileSavedConfirm');
  if (lastWeatherData && lastLoc) render(lastWeatherData, lastLoc, lastSource);
});

dogProfileEditBtn?.addEventListener('click', () => {
  dogProfileSummary.hidden = true;
  dogProfileForm.hidden = false;
});

dogProfileClearBtn?.addEventListener('click', () => {
  clearDogProfile();
  dogProfileForm.reset();
  renderDogProfileUI();
  updateHeroTitle();
  statusEl.textContent = t('profileClearedConfirm');
  if (lastWeatherData && lastLoc) render(lastWeatherData, lastLoc, lastSource);
});

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

  // Timremsan visar alla av dagens timmar, men "bästa timmen" ska bara utses bland de
  // timmar som återstår framåt (annars kan en redan passerad timme lyftas fram som bäst).
  const now = Date.now();
  const hourCutoff = now - 30 * 60 * 1000;
  const upcoming = withComfort.filter(h => new Date(h.time).getTime() >= hourCutoff);
  const bestPool = upcoming.length ? upcoming : withComfort;
  const best = bestPool.reduce((a, b) => (b.comfort.score > a.comfort.score ? b : a));
  const timeFmt = new Intl.DateTimeFormat(LOCALE[lang], { hour: '2-digit', minute: '2-digit', timeZone: tz });

  const chips = withComfort.map(h => {
    const [icon, desc] = conditionInfo(h.condition);
    const best_ = h.time === best.time;
    const isPast = new Date(h.time).getTime() < hourCutoff;
    const timeStr = timeFmt.format(new Date(h.time));
    const tempStr = `${formatTemp(h.temp, unit)}°${unit}`;
    const label = `${timeStr}, ${desc}, ${tempStr}, ${t('comfortIndexLabel')} ${n(h.comfort.score, 1)} ${t('outOf10')}, ${h.comfort.label}`;
    const classes = ['hour-chip', best_ ? 'hour-chip--best' : '', isPast ? 'hour-chip--past' : ''].filter(Boolean).join(' ');
    return `<div class="${classes}" style="--dot:${h.comfort.color}" role="group" aria-label="${escapeHtml(label)}">
      <span class="hour-chip-time" aria-hidden="true">${timeStr}</span>
      <span class="hour-chip-icon" aria-hidden="true">${icon}</span>
      <span class="hour-chip-temp" aria-hidden="true">${tempStr}</span>
      <span class="hour-chip-score" aria-hidden="true">${n(h.comfort.score, 1)}/10</span>
    </div>`;
  }).join('');

  const allSimilar = bestPool.every(h => h.comfort.score >= best.comfort.score - 0.5);
  const introText = allSimilar ? t('bestWalkEvenComfort') : t('bestWalkBestWindow');

  bestWalkEl.innerHTML = `
    <p class="hour-strip-caption">${escapeHtml(t('hourStripCaption'))}</p>
    <div class="hour-strip">${chips}</div>
    <h3 class="subheading" data-i18n="bestWalkHeading">${escapeHtml(t('bestWalkHeading'))}</h3>
    <div class="best-walk-highlight" style="--dot:${best.comfort.color}">
      <div class="best-walk-time">${EMOJI.paw} ${timeFmt.format(new Date(best.time))}</div>
      <div class="best-walk-body">
        <p class="best-walk-label" style="color:${best.comfort.color}">${escapeHtml(best.comfort.label)} · ${n(best.comfort.score, 1)}/10</p>
        <p class="best-walk-desc">${escapeHtml(introText)}</p>
      </div>
    </div>
  `;
}

/* ---------- Vädertolkning: sju konkreta hundråd baserat på aktuellt väder ---------- */
/* Regelbaserad tolkning av väderdata – inte en AI-modell och inte kopplad till några
   pollen- eller fästingsensorer. Pollen- och fästingbedömningen är särskilt förenklad
   (baserad på årstid och grundläggande väderfaktorer) eftersom det inte finns någon öppen,
   avgiftsfri realtidsdata för detta i appen. Se den riktiga prognosen via länkarna i
   panelens fotnot. */

const LEVELS = {
  en: {
    ok: { label: 'Good', color: '#2f7d5c' },
    caution: { label: 'Watch out', color: '#d5a33c' },
    risk: { label: 'High risk', color: '#bd4747' }
  },
  sv: {
    ok: { label: 'Bra', color: '#2f7d5c' },
    caution: { label: 'Var uppmärksam', color: '#d5a33c' },
    risk: { label: 'Hög risk', color: '#bd4747' }
  }
};

const ADVISORY_TEXT = {
  en: {
    hotAsphalt: {
      title: 'Hot asphalt',
      risk: 'Sun-warmed asphalt can become scorching hot. Press the back of your hand to the ground for 5 seconds — if it\u2019s uncomfortable for you, it\u2019s too hot for paw pads. Choose grass or shade.',
      caution: 'Asphalt can get warm in the sun. Test with your hand before a longer walk on hard surfaces.',
      ok: 'The surface isn\u2019t judged to be hot enough to harm paw pads right now.'
    },
    coldPaws: {
      title: 'Cold on the paws',
      risk: 'Severe cold. Keep the walk short and check paws, ears and tail often.',
      caution: 'Cold for paw pads, especially on short-coated or small dogs. Consider paw wax or dog boots.',
      ok: 'The temperature isn\u2019t judged to be a problem for the paws right now.'
    },
    wetCoat: {
      title: 'Wet coat',
      risk: 'Heavy rain. Coat and paws get thoroughly wet — plan for a proper dry-off afterwards.',
      caution: 'Raining right now. Expect to dry the coat, belly and paws after the walk.',
      ok: 'Dry or nearly dry right now.'
    },
    windySmall: {
      title: 'Windy for small dogs',
      risk: 'Very strong gusts. Can be scary or tough for small, light dogs — keep the leash short and avoid forests.',
      caution: 'Windy. Can feel tough for small or short-legged dogs — choose a sheltered route if you can.',
      ok: 'Wind levels are judged to be fine even for smaller dogs.'
    },
    pollen: {
      title: 'Pollen',
      offSeason: 'Outside the intense pollen season — levels are usually lower.',
      rainy: 'The rain binds the pollen, so levels are usually lower right now.',
      dryWindy: 'Pollen season, dry with a light breeze — levels can be high. Wipe down the coat if your dog reacts.',
      inSeason: 'Pollen season is under way. Levels vary a lot locally and through the day.'
    },
    ticks: {
      title: 'Tick risk',
      inactive: 'Ticks are usually inactive at this temperature or time of year.',
      highSeason: 'Peak tick season. Check your dog thoroughly after the walk, especially in grass and woodland.',
      active: 'Ticks can be active. Check through the coat after the walk.'
    },
    goodWalkWeather: { title: 'Good walking weather' }
  },
  sv: {
    hotAsphalt: {
      title: 'Varm asfalt',
      risk: 'Solvärmd asfalt kan bli brännhet. Håll handryggen mot marken i 5 sekunder — obehagligt för dig betyder för hett för trampdynorna. Välj gräs eller skugga.',
      caution: 'Asfalten kan hinna bli varm i solen. Testa gärna med handen innan en längre runda på hårt underlag.',
      ok: 'Underlaget bedöms inte vara hett nog för att skada trampdynorna just nu.'
    },
    coldPaws: {
      title: 'Kyla mot tassar',
      risk: 'Sträng kyla. Håll promenaden kort och kontrollera tassar, öron och svans ofta.',
      caution: 'Kallt för trampdynorna, särskilt på kortpälsade eller små hundar. Överväg tassvax eller hundskor.',
      ok: 'Temperaturen bedöms inte vara ett problem för tassarna just nu.'
    },
    wetCoat: {
      title: 'Blöt päls',
      risk: 'Kraftigt regn. Päls och tassar blir rejält blöta — planera för ordentlig torkning efteråt.',
      caution: 'Regn just nu. Räkna med att torka päls, mage och tassar efter promenaden.',
      ok: 'Torrt eller nästan torrt just nu.'
    },
    windySmall: {
      title: 'Blåsigt för små hundar',
      risk: 'Mycket kraftiga vindbyar. Kan skrämma eller vara jobbigt för små och lätta hundar — håll koppel och undvik skog.',
      caution: 'Blåsigt. Kan kännas jobbigt för små eller kortbenta hundar — välj gärna en skyddad väg.',
      ok: 'Vindnivån bedöms vara okej även för mindre hundar.'
    },
    pollen: {
      title: 'Pollen',
      offSeason: 'Utanför den intensiva pollensäsongen — halterna är oftast lägre.',
      rainy: 'Regnet binder pollenet, så halterna är oftast lägre just nu.',
      dryWindy: 'Pollensäsong, torrt och lite bris — halterna kan vara höga. Torka gärna av pälsen om hunden reagerar.',
      inSeason: 'Pollensäsong pågår. Halterna varierar mycket lokalt och under dagen.'
    },
    ticks: {
      title: 'Fästingrisk',
      inactive: 'Fästingar är oftast inaktiva vid den här temperaturen eller årstiden.',
      highSeason: 'Högsäsong för fästingar. Kontrollera hunden noga efter promenaden, särskilt i gräs och skog.',
      active: 'Fästingar kan vara aktiva. Kolla igenom pälsen efter promenaden.'
    },
    goodWalkWeather: { title: 'Bra promenadväder' }
  }
};

function computeWalkAdvisories(cur, comfort, showTicks) {
  const A = ADVISORY_TEXT[lang];
  const temp = cur.temp;
  const apparent = cur.apparentTemp != null ? cur.apparentTemp : temp;
  const gust = cur.gust != null ? cur.gust : cur.wind;
  const precip = cur.precip || 0;
  const isSunnyish = ['clear', 'mostlyClear', 'partlyCloudy'].includes(cur.condition);
  const month = new Date().getMonth() + 1; // 1–12, baserat på enhetens lokala datum

  const items = [];

  // 1. Varm asfalt
  if (temp != null && (temp >= 28 || (temp >= 24 && isSunnyish))) {
    items.push({ icon: ICONS.road, title: A.hotAsphalt.title, level: 'risk', text: A.hotAsphalt.risk, learnMore: KNOWLEDGE_ARTICLES.hotPaws });
  } else if (temp != null && temp >= 20 && isSunnyish) {
    items.push({ icon: ICONS.road, title: A.hotAsphalt.title, level: 'caution', text: A.hotAsphalt.caution, learnMore: KNOWLEDGE_ARTICLES.hotPaws });
  } else {
    items.push({ icon: ICONS.road, title: A.hotAsphalt.title, level: 'ok', text: A.hotAsphalt.ok });
  }

  // 2. Kyla mot tassar
  const coldTemp = apparent;
  if (coldTemp != null && coldTemp <= -15) {
    items.push({ icon: ICONS.snowflake, title: A.coldPaws.title, level: 'risk', text: A.coldPaws.risk, learnMore: KNOWLEDGE_ARTICLES.winterWalks });
  } else if (coldTemp != null && coldTemp <= -5) {
    items.push({ icon: ICONS.snowflake, title: A.coldPaws.title, level: 'caution', text: A.coldPaws.caution, learnMore: KNOWLEDGE_ARTICLES.winterWalks });
  } else {
    items.push({ icon: ICONS.snowflake, title: A.coldPaws.title, level: 'ok', text: A.coldPaws.ok });
  }

  // 3. Blöt päls
  if (precip >= 3) {
    items.push({ icon: ICONS.droplet, title: A.wetCoat.title, level: 'risk', text: A.wetCoat.risk, learnMore: KNOWLEDGE_ARTICLES.heavyRain });
  } else if (precip >= 0.5) {
    items.push({ icon: ICONS.droplet, title: A.wetCoat.title, level: 'caution', text: A.wetCoat.caution, learnMore: KNOWLEDGE_ARTICLES.heavyRain });
  } else {
    items.push({ icon: ICONS.droplet, title: A.wetCoat.title, level: 'ok', text: A.wetCoat.ok });
  }

  // 4. Blåsigt för små hundar
  if (gust != null && gust >= 20) {
    items.push({ icon: ICONS.wind, title: A.windySmall.title, level: 'risk', text: A.windySmall.risk, learnMore: KNOWLEDGE_ARTICLES.windSensitive });
  } else if (gust != null && gust >= 12) {
    items.push({ icon: ICONS.wind, title: A.windySmall.title, level: 'caution', text: A.windySmall.caution, learnMore: KNOWLEDGE_ARTICLES.windSensitive });
  } else {
    items.push({ icon: ICONS.wind, title: A.windySmall.title, level: 'ok', text: A.windySmall.ok });
  }

  // 5. Pollen (grov uppskattning – se fotnot för riktig mätdata)
  const pollenSeason = month >= 3 && month <= 8;
  if (!pollenSeason) {
    items.push({ icon: ICONS.flower, title: A.pollen.title, level: 'ok', text: A.pollen.offSeason });
  } else if (precip >= 1) {
    items.push({ icon: ICONS.flower, title: A.pollen.title, level: 'ok', text: A.pollen.rainy });
  } else if ((cur.wind || 0) >= 3 && isSunnyish) {
    items.push({ icon: ICONS.flower, title: A.pollen.title, level: 'risk', text: A.pollen.dryWindy });
  } else {
    items.push({ icon: ICONS.flower, title: A.pollen.title, level: 'caution', text: A.pollen.inSeason });
  }

  // 6. Fästingrisk (grov uppskattning – se fotnot för riktig mätdata).
  // Visas bara när platsen har tillförlitlig fästingdata (för närvarande: Sverige/SVA).
  // Utanför Sverige saknas underlag, så kortet utelämnas helt istället för att visa missvisande data.
  if (showTicks) {
    const tickActive = coldTemp != null && coldTemp >= 5 && month >= 3 && month <= 11;
    if (!tickActive) {
      items.push({ icon: ICONS.tick, title: A.ticks.title, level: 'ok', text: A.ticks.inactive });
    } else if ([5, 6, 8, 9].includes(month)) {
      items.push({ icon: ICONS.tick, title: A.ticks.title, level: 'risk', text: A.ticks.highSeason });
    } else {
      items.push({ icon: ICONS.tick, title: A.ticks.title, level: 'caution', text: A.ticks.active });
    }
  }

  // 7. Helhetsbedömning (bygger på samma Hundkomfortindex som visas ovan)
  const overallLevel = comfort.score >= 7 ? 'ok' : comfort.score >= 5 ? 'caution' : 'risk';
  items.push({ icon: ICONS.walk, title: A.goodWalkWeather.title, level: overallLevel,
    text: `${comfort.label} · ${t('comfortIndexLabel')} ${n(comfort.score, 1)}/10.` });

  return items;
}

function renderWalkAdvisories(cur, comfort, showTicks) {
  const items = computeWalkAdvisories(cur, comfort, showTicks);
  walkAdviceEl.innerHTML = items.map(item => {
    const lvl = LEVELS[lang][item.level];
    return `<article class="advice-card">
      <div class="advice-card-head">
        <span class="advice-icon">${item.icon}</span>
        <span class="advice-pill" style="color:${lvl.color};background:${lvl.color}1a">${lvl.label}</span>
      </div>
      <h4>${escapeHtml(item.title)}</h4>
      <p>${escapeHtml(item.text)}</p>
      ${item.learnMore ? knowledgeCardHtml(item.learnMore) : ''}
    </article>`;
  }).join('');
}

/* ---------- Pälsvårdsråd baserat på dagens väder ---------- */
/* Rådtexter bygger på artiklar från Agria (veterinärgranskade), Evidensia (djurvårdsguiden),
   Arken Zoo:s hundråd samt Veterinary Partner (VIN) / American Kennel Club för solskydd.
   Se källänken under varje kort. Ingen AI-modell — samma regelbaserade uppskattning som
   övriga kort på sidan, och ersätter aldrig bedömning från veterinär eller trimmare. */

const COAT_SOURCES = {
  agriaPalsvard: { key: 'sourceAgria', url: 'https://www.agria.se/hund/artiklar/skotsel-och-vard/palsvard-av-hund/' },
  agriaKoldkramp: { key: 'sourceAgria', url: 'https://www.agria.se/hund/artiklar/sjukdomar-och-skador/koldkramp-och-forfrysning/' },
  agriaVinter: { key: 'sourceAgria', url: 'https://www.agria.se/hund/artiklar/skotsel-och-vard/forenkla-vintern-for-hunden/' },
  evidensiaHudPals: { key: 'sourceEvidensia', url: 'https://evidensia.se/djurvardguiden/hudens-och-palsens-viktiga-uppgifter/' },
  arkenZooKlippa: { key: 'sourceArkenZoo', url: 'https://www.arkenzoo.se/goda-rad/ska-jag-klippa-eller-raka-min-hund' },
  arkenZooSommar: { key: 'sourceArkenZoo', url: 'https://www.arkenzoo.se/goda-rad/sommarens-faror-for-hunden' },
  vetPartnerSun: { key: 'sourceVetPartner', url: 'https://veterinarypartner.vin.com/default.aspx?pid=19239&id=4952515' },
  akcSun: { key: 'sourceAkc', url: 'https://www.akc.org/expert-advice/health/do-dogs-need-sunscreen/' }
};

function computeCoatAdvisories(cur) {
  const temp = cur.temp;
  const apparent = cur.apparentTemp != null ? cur.apparentTemp : temp;
  const precip = cur.precip || 0;
  const humidity = cur.humidity;
  const isSunnyish = ['clear', 'mostlyClear', 'partlyCloudy'].includes(cur.condition);
  const isSnowyCondition = ['snow', 'snowLight', 'snowHeavy', 'sleet'].includes(cur.condition);
  const month = new Date().getMonth() + 1; // 1–12
  const sheddingSeason = [3, 4, 5, 9, 10, 11].includes(month);

  const items = [];

  // 1. Borstning – alltid med
  if (apparent != null && apparent >= 24) {
    items.push({ icon: ICONS.comb, title: t('coatBrushTitle'), level: 'ok', text: t('coatBrushHot'), sources: [COAT_SOURCES.arkenZooKlippa] });
  } else if (precip >= 1) {
    items.push({ icon: ICONS.comb, title: t('coatBrushTitle'), level: 'caution', text: t('coatBrushRain'), sources: [COAT_SOURCES.evidensiaHudPals] });
  } else if (sheddingSeason) {
    items.push({ icon: ICONS.comb, title: t('coatBrushTitle'), level: 'ok', text: t('coatBrushShed'), sources: [COAT_SOURCES.evidensiaHudPals] });
  } else {
    items.push({ icon: ICONS.comb, title: t('coatBrushTitle'), level: 'ok', text: t('coatBrushNormal'), sources: [COAT_SOURCES.agriaPalsvard] });
  }

  // 2. Bad – alltid med
  if (apparent != null && apparent <= -15) {
    items.push({ icon: ICONS.bath, title: t('coatBathTitle'), level: 'risk', text: t('coatBathVeryCold'), sources: [COAT_SOURCES.agriaKoldkramp] });
  } else if (apparent != null && apparent <= -5) {
    items.push({ icon: ICONS.bath, title: t('coatBathTitle'), level: 'caution', text: t('coatBathCold'), sources: [COAT_SOURCES.agriaKoldkramp] });
  } else if (apparent != null && apparent >= 20) {
    items.push({ icon: ICONS.bath, title: t('coatBathTitle'), level: 'ok', text: t('coatBathWarm'), sources: [COAT_SOURCES.arkenZooSommar] });
  } else {
    items.push({ icon: ICONS.bath, title: t('coatBathTitle'), level: 'ok', text: t('coatBathNormal'), sources: [COAT_SOURCES.agriaPalsvard] });
  }

  // 3. Snö och is i pälsen – bara vid kyla/snöförhållanden
  if ((cur.snowfall || 0) > 0 || (isSnowyCondition && apparent != null && apparent <= 2)) {
    items.push({ icon: ICONS.snowflake, title: t('coatSnowTitle'), level: 'caution', text: t('coatSnowText'), sources: [COAT_SOURCES.agriaVinter] });
  }

  // 4. Fukt och hot spots – bara vid regn/hög luftfuktighet i milt-varmt väder
  if (((precip >= 0.5) || (humidity != null && humidity >= 70)) && apparent != null && apparent >= 12) {
    items.push({ icon: ICONS.droplet, title: t('coatMoistureTitle'), level: 'caution', text: t('coatMoistureText'), sources: [COAT_SOURCES.arkenZooSommar] });
  }

  // 5. Solskydd – bara vid soligt och varmt väder
  if (isSunnyish && apparent != null && apparent >= 16) {
    items.push({ icon: ICONS.sun, title: t('coatSunTitle'), level: 'caution', text: t('coatSunText'), sources: [COAT_SOURCES.vetPartnerSun, COAT_SOURCES.akcSun] });
  }

  return items;
}

/* ==================================================================================
   Today's Tip — lightweight, backend-free retention feature.
   Shows a short, weather-relevant tip when conditions call for one. Dog Fact of the Day
   lives only in the log panel (see renderDailyDogFact below) — this box stays hidden on
   days when no weather-specific tip applies, rather than falling back to a fact too.
   ================================================================================== */

const DAILY_TIP_TEXT = {
  en: {
    kicker: "TODAY'S TIP",
    hot: 'Dogs can suffer paw burns even when the air feels comfortable to you — hot pavement is often the real risk.',
    rain: 'Dry your dog\u2019s paws and the skin between the pads thoroughly after wet walks to help prevent soreness and infection.',
    cold: 'Road salt and grit can irritate paw pads in winter — rinse and dry paws after walks on treated pavements.',
    windy: 'Strong wind carries scent further and can make walks more distracting (or more exciting) for a dog\u2019s nose.'
  },
  sv: {
    kicker: 'DAGENS TIPS',
    hot: 'Hundar kan få brännskador på trampdynorna även när luften känns behaglig för dig — det är ofta den varma marken som är den verkliga risken.',
    rain: 'Torka hundens tassar och huden mellan trampdynorna noga efter blöta promenader för att minska risken för sårighet och infektion.',
    cold: 'Vägsalt och grus kan irritera trampdynorna på vintern — skölj och torka tassarna efter promenader på saltade gator.',
    windy: 'Kraftig vind bär doft längre och kan göra promenaden mer distraherande (eller mer spännande) för hundens nos.'
  }
};

function computeDailyTip(cur) {
  const T = DAILY_TIP_TEXT[lang];
  const temp = cur.apparentTemp != null ? cur.apparentTemp : cur.temp;
  const gust = cur.gust != null ? cur.gust : cur.wind;

  if (temp != null && temp >= 22) return { icon: EMOJI.sun, kicker: T.kicker, text: T.hot };
  if ((cur.precip || 0) >= 0.5) return { icon: EMOJI.rain, kicker: T.kicker, text: T.rain };
  if (temp != null && temp <= -2) return { icon: EMOJI.cold, kicker: T.kicker, text: T.cold };
  if (gust != null && gust >= 12) return { icon: EMOJI.tip, kicker: T.kicker, text: T.windy };

  return null;
}

function renderDailyTip(cur) {
  const el = $('#dailyTip');
  if (!el) return;
  const tip = computeDailyTip(cur);
  if (!tip) {
    el.hidden = true;
    el.innerHTML = '';
    return;
  }
  el.hidden = false;
  el.innerHTML = `
    <span class="daily-tip-icon" aria-hidden="true">${tip.icon}</span>
    <div>
      <span class="daily-tip-kicker">${escapeHtml(tip.kicker)}</span>
      <p class="daily-tip-text">${escapeHtml(tip.text)}</p>
    </div>
  `;
}

/* ==================================================================================
   Dog Knowledge content system — categorised placeholder cards linked from relevant
   weather conditions, built so real articles can slot in later without changing markup.
   ================================================================================== */

const KNOWLEDGE_CATEGORIES = {
  health: { en: 'Health', sv: 'Hälsa' },
  safety: { en: 'Safety', sv: 'Säkerhet' },
  walking: { en: 'Walking', sv: 'Promenad' },
  weather: { en: 'Weather', sv: 'Väder' },
  training: { en: 'Training', sv: 'Träning' },
  puppies: { en: 'Puppies', sv: 'Valpar' },
  seniors: { en: 'Senior dogs', sv: 'Äldre hundar' }
};

const KNOWLEDGE_ARTICLES = {
  hotPaws: { category: 'health', slug: 'hot-asphalt-paw-safety',
    en: 'How hot is too hot for dog paws?', sv: 'Hur varmt är för varmt för hundtassar?' },
  heavyRain: { category: 'safety', slug: 'walking-dogs-in-heavy-rain',
    en: 'Should dogs walk in heavy rain?', sv: 'Ska hundar gå ut i kraftigt regn?' },
  windSensitive: { category: 'walking', slug: 'wind-and-sensitive-dogs',
    en: 'How wind affects sensitive dogs', sv: 'Så påverkar blåst känsliga hundar' },
  winterWalks: { category: 'weather', slug: 'safe-winter-walks',
    en: 'Safe winter walks', sv: 'Säkra vinterpromenader' }
};

// Placeholder link builder — points to a future /knowledge/{category}/{slug} article
// architecture. Safe to leave as-is until real articles exist; nothing else depends on
// the URL resolving today.
function knowledgeUrl(article) {
  return `/knowledge/${article.category}/${article.slug}`;
}

function knowledgeCardHtml(article) {
  const catLabel = KNOWLEDGE_CATEGORIES[article.category][lang];
  const title = article[lang];
  return `<a class="knowledge-card" href="${knowledgeUrl(article)}">
    <span class="knowledge-card-cat">${escapeHtml(catLabel)}</span>
    <span class="knowledge-card-title">${escapeHtml(title)} →</span>
  </a>`;
}

// Renders the 7 top-level category tiles in the Knowledge hub. Each links to a
// placeholder /knowledge/{category} index page — ready for real articles to slot in
// later without any markup changes here.
function renderKnowledgeHub() {
  const el = $('#knowledgeHubGrid');
  if (!el) return;
  el.innerHTML = Object.entries(KNOWLEDGE_CATEGORIES).map(([key, names]) => `
    <a class="knowledge-hub-tile" href="/knowledge/${key}">
      <span class="knowledge-hub-tile-name">${escapeHtml(names[lang])}</span>
    </a>
  `).join('');
}

function renderCoatAdvice(cur) {
  if (!coatAdviceEl) return;
  const items = computeCoatAdvisories(cur);
  coatAdviceEl.innerHTML = items.map(item => {
    const lvl = LEVELS[lang][item.level];
    const sourcesHtml = item.sources.map((src, i) =>
      `${i > 0 ? '<span class="src-sep">·</span>' : ''}<a href="${src.url}" target="_blank" rel="noopener">${escapeHtml(t(src.key))} ↗</a>`
    ).join('');
    return `<article class="advice-card">
      <div class="advice-card-head">
        <span class="advice-icon">${item.icon}</span>
        <span class="advice-pill" style="color:${lvl.color};background:${lvl.color}1a">${lvl.label}</span>
      </div>
      <h4>${escapeHtml(item.title)}</h4>
      <p>${escapeHtml(item.text)}</p>
      <p class="advice-source">${escapeHtml(t('sourceLabel'))} ${sourcesHtml}</p>
    </article>`;
  }).join('');
}

function render(weatherData, loc, source) {
  const cur = weatherData.current;
  const [icon, desc] = conditionInfo(cur.condition);

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
    ? `${desc} · ${t('feelsLike')} ${formatTemp(cur.apparentTemp, unit)}°${unit}`
    : desc;

  updateHeroBackground(cur, `${t('heroAltPrefix')}: ${desc.toLowerCase()}, ${escapeHtml(loc.name)}`);

  const reasonsText = escapeHtml(comfort.reasons.join(', '));

  currentEl.className = 'current';
  currentEl.innerHTML = `
    <div class="current-main">
      <div class="weather-icon">${icon}</div>
      <div>
        <div class="place-name">${escapeHtml(loc.name)}</div>
        <div class="temp">${formatTemp(cur.temp, unit)}°${unit}</div>
        <div>${escapeHtml(feelsLine)}</div>
      </div>
    </div>
    <div class="metrics">
      <div class="metric"><span>${escapeHtml(t('metricWind'))}</span><b>${n(cur.wind, 1)} m/s</b></div>
      <div class="metric"><span>${escapeHtml(t('metricGust'))}</span><b>${n(cur.gust, 1)} m/s</b></div>
      <div class="metric"><span>${escapeHtml(t('metricHumidity'))}</span><b>${n(cur.humidity)} %</b></div>
    </div>
    <div class="comfort" role="group" aria-label="${escapeHtml(t('comfortIndexLabel'))}">
      <div class="comfort-row">
        ${comfortGaugeHtml(comfort.score, comfort.color, 76)}
        <div class="comfort-copy">
          <span class="comfort-kicker">${EMOJI.paw} ${escapeHtml(t('comfortIndexLabel'))}</span>
          <p class="comfort-label" style="color:${comfort.color}">${COMFORT_EMOJI[comfort.level] || ''} ${escapeHtml(comfort.label)}</p>
          <p class="comfort-reasons">${reasonsText}.</p>
        </div>
      </div>
    </div>
    <div class="dog-verdict">${EMOJI.paw} ${escapeHtml(comfort.recommendations[0])}</div>
    <p class="comfort-footnote"><a href="#komfortindex-forklaring">${escapeHtml(t('howIndexCalculated'))}</a></p>
  `;

  // Fästingdata (SVA) finns bara tillförlitlig för Sverige, så kortet visas bara då.
  // Lägg till fler landskoder här den dagen det finns en tillförlitlig källa för ett annat land.
  const RELIABLE_TICK_DATA_COUNTRIES = new Set(['SE']);
  const hasReliableTickData = RELIABLE_TICK_DATA_COUNTRIES.has((loc.countryCode || '').toUpperCase());

  renderAlerts(cur);
  renderDailyTip(cur);
  renderCoatAdvice(cur);
  renderBestWalk(weatherData, unit);
  renderWalkAdvisories(cur, comfort, hasReliableTickData);
  renderDaily(weatherData, unit);

  const tz = weatherData.timezone || 'Europe/Stockholm';
  const sourceName = source === 'smhi' ? 'SMHI' : 'Open-Meteo';
  const dateStr = new Intl.DateTimeFormat(LOCALE[lang], { dateStyle: 'medium', timeStyle: 'short', timeZone: tz }).format(weatherData.updatedAt);
  updatedEl.textContent = `${t('updatedPrefix')} ${dateStr} ${t('localTimeSuffix')}. ${t('sourceLabel')} ${sourceName}.`;
  statusEl.textContent = t('showingForecastFor', { place: loc.name });
}

/* ---------- Huvudflöde ---------- */

let lastWeatherData = null;
let lastLoc = null;
let lastSource = null;

async function forecast(loc) {
  hidePlaceResults();
  statusEl.textContent = t('fetchingForecastFor', { place: loc.name || t('theLocation') });

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
      statusEl.textContent = t('errFetchWeatherGeneric');
      return;
    }
  }

  try {
    render(weatherData, loc, source);
  } catch (err) {
    statusEl.textContent = t('errDisplayFailed');
    return;
  }

  lastWeatherData = weatherData;
  lastLoc = loc;
  lastSource = source;

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
  statusEl.textContent = t('searchingPlace');

  try {
    const results = await geocodeOpenMeteo(query);
    if (results.length === 1) {
      await forecast(results[0]);
    } else {
      renderPlaceResults(results, query);
      statusEl.textContent = t('multipleMatches', { query });
    }
  } catch (err) {
    statusEl.textContent = err.message || t('errPlaceSearchGeneric');
  }
});

$('#locate').addEventListener('click', () => {
  if (!navigator.geolocation) {
    statusEl.textContent = t('geoNotSupported');
    return;
  }
  statusEl.textContent = t('gettingLocation');
  navigator.geolocation.getCurrentPosition(
    async pos => {
      try {
        const lat = pos.coords.latitude, lon = pos.coords.longitude;
        const { name, countryCode } = await reverseGeocode(lat, lon);
        await forecast({ lat, lon, name, countryCode });
      } catch (err) {
        statusEl.textContent = t('errWeatherForYourLocation');
      }
    },
    () => { statusEl.textContent = t('geoDenied'); },
    { enableHighAccuracy: false, timeout: 10000 }
  );
});

langBtnSvEl?.addEventListener('click', () => setLang('sv'));
langBtnEnEl?.addEventListener('click', () => setLang('en'));

/* Mobil bottom tab-bar: markerar vilken sektion man befinner sig i medan man
   scrollar, ungefär som flikar i en app. Faller tyst tillbaka om webbläsaren
   saknar IntersectionObserver – länkarna fungerar ändå som vanliga ankare. */
if ('IntersectionObserver' in window) {
  const tabItems = document.querySelectorAll('.tabbar-item');
  const tabSections = ['prognos', 'logg', 'hundrad', 'kunskap']
    .map(id => document.getElementById(id))
    .filter(Boolean);

  if (tabItems.length && tabSections.length) {
    const setActive = id => {
      tabItems.forEach(a => a.classList.toggle('is-active', a.dataset.tab === id));
    };
    const spy = new IntersectionObserver(entries => {
      const visible = entries.filter(e => e.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible) setActive(visible.target.id);
    }, { rootMargin: '-40% 0px -50% 0px', threshold: [0, 0.25, 0.5, 0.75, 1] });
    tabSections.forEach(section => spy.observe(section));
  }
}

/* ---------- Init ---------- */

applyStaticTranslations();

// Slumpar fram ett hero-foto bakom "Vädret idag" och ett bakom "Logga hundens dag"
// (samma bildbank som används för de väderberoende bakgrunderna på sidan).
// Slumpad väderbild är avstängd för dessa rutor (för att undvika att en saknad
// bildfil ger en tom ruta) — de använder istället den fasta, garanterat
// fungerande bakgrunden som redan sätts i CSS via .panel--random::before.
// setRandomHeroPanel(heroPanelLogEl);

/* Automatiskt språkval: besökare i Sverige får svenska automatiskt om de inte
   redan valt språk manuellt (då respekteras alltid det sparade valet). */
(async () => {
  let hasSavedLang = false;
  try { hasSavedLang = !!localStorage.getItem('dogWeatherLang'); } catch { /* ignore */ }
  if (hasSavedLang) return;

  const countryCode = await detectVisitorCountryCode();
  if (countryCode === 'SE' && lang !== 'sv') {
    lang = 'sv';
    applyStaticTranslations();
    if (lastWeatherData && lastLoc) render(lastWeatherData, lastLoc, lastSource);
  }
})();

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

/* ==================================================================================
   Daily log & calendar
   ================================================================================== */

const LOG_STORAGE_KEY = 'dogWeatherLog';
const LOG_TYPES = [
  { id: 'walk',  icon: EMOJI.walk, labelKey: 'logTypeWalk' },
  { id: 'poop',  icon: EMOJI.poop, labelKey: 'logTypePoop' },
  { id: 'pee',   icon: EMOJI.pee, labelKey: 'logTypePee' },
  { id: 'nails', icon: EMOJI.nails, labelKey: 'logTypeNails' },
  { id: 'bath',  icon: EMOJI.bath, labelKey: 'logTypeBath' },
  { id: 'coat',  icon: EMOJI.coat, labelKey: 'logTypeCoat' }
];
const LOG_TYPE_BY_ID = Object.fromEntries(LOG_TYPES.map(x => [x.id, x]));
// Fritextloggade händelser ("valfri händelse") har ingen fast typ i LOG_TYPES ovan,
// men behöver ändå en ikon i kalendern och dagvyn.
LOG_TYPE_BY_ID.custom = { id: 'custom', icon: EMOJI.custom, labelKey: 'logTypeCustom' };

function loadLogEntries() {
  try {
    const raw = localStorage.getItem(LOG_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch { return []; }
}

function saveLogEntries(entries) {
  try { localStorage.setItem(LOG_STORAGE_KEY, JSON.stringify(entries)); } catch { /* localStorage kan vara otillgängligt */ }
}

let logEntries = loadLogEntries();

function addLogEntry(typeId, extra) {
  // Loggade händelser visar inget klockslag, men vi behåller ett fullständigt
  // tidsstämpel internt (vald dag + aktuell tid på dygnet) så poster kan sorteras
  // och hamna på rätt dag i kalendern — även för dagar bakåt eller framåt i tiden.
  const now = new Date();
  const picked = getSelectedLogDate();
  const ts = new Date(picked.getFullYear(), picked.getMonth(), picked.getDate(), now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds());
  const entry = Object.assign(
    { id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, type: typeId, ts: ts.toISOString() },
    extra || {}
  );
  logEntries.push(entry);
  saveLogEntries(logEntries);
  return entry;
}

function removeLogEntry(id) {
  logEntries = logEntries.filter(e => e.id !== id);
  saveLogEntries(logEntries);
}

function dateKey(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function entryDateKey(entry) {
  return dateKey(new Date(entry.ts));
}

/* ---------- Kalender-UI ---------- */

const calMonthLabelEl = $('#calMonthLabel');
const calWeekdaysEl = $('#calWeekdays');
const calGridEl = $('#calGrid');
const calPrevEl = $('#calPrev');
const calNextEl = $('#calNext');
const logDayDetailEl = $('#logDayDetail');
const logConfirmEl = $('#logConfirm');
const walkDurationPickerEl = $('#walkDurationPicker');
const walkCustomMinutesEl = $('#walkCustomMinutes');
const logDateEl = $('#logDate');
const logDateTodayEl = $('#logDateToday');
const logCustomTextEl = $('#logCustomText');
const logCustomConfirmEl = $('#logCustomConfirm');

const logToday = new Date();
let calViewYear = logToday.getFullYear();
let calViewMonth = logToday.getMonth();
let selectedDateKey = dateKey(logToday);

// Datumet man loggar mot (kan vara en annan dag än idag, både bakåt och framåt).
if (logDateEl) logDateEl.value = dateKey(logToday);

function getSelectedLogDate() {
  const raw = logDateEl?.value;
  if (raw) {
    const [y, m, d] = raw.split('-').map(Number);
    if (y && m && d) return new Date(y, m - 1, d);
  }
  return new Date(logToday.getFullYear(), logToday.getMonth(), logToday.getDate());
}

function monthNames() { return t('monthNames').split(','); }
function weekdayNames() { return t('weekdaysShort').split(','); }

function formatEntryTime(entry) {
  return new Date(entry.ts).toLocaleTimeString(LOCALE[lang], { hour: '2-digit', minute: '2-digit' });
}

function entryLabel(entry) {
  if (entry.type === 'custom') {
    return entry.label ? entry.label : t('logTypeCustom');
  }
  const typeLabel = t((LOG_TYPE_BY_ID[entry.type] && LOG_TYPE_BY_ID[entry.type].labelKey) || entry.type);
  if (entry.type === 'walk' && entry.duration) {
    return `${typeLabel} · ${entry.duration} ${t('minutesShort')}`;
  }
  return typeLabel;
}

// Räknar antal sammanhängande dagar (bakåt från idag) med minst en loggad post.
// Om dagens datum saknar poster ännu räknas streaken ändå från igår, så att den
// inte "nollställs" bara för att dagen inte är slut — först vid ett helt missat
// dygn bryts den. Detta är avsiktligt lugnt och textbaserat, inget spelmärke.
function calculateLogStreak(entries) {
  const daysWithEntries = new Set(entries.map(entryDateKey));
  const cursor = new Date(logToday.getFullYear(), logToday.getMonth(), logToday.getDate());
  if (!daysWithEntries.has(dateKey(cursor))) cursor.setDate(cursor.getDate() - 1);
  let streak = 0;
  while (daysWithEntries.has(dateKey(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

// Milestone streak lengths that trigger a small celebratory 🏆 moment. Purely a UI touch —
// no backend, nothing stored beyond the existing log entries plus one small "best streak"
// number so we can recognise a genuine personal best.
const STREAK_MILESTONES = [3, 7, 14, 30, 60, 100];
const STREAK_BEST_KEY = 'dogWeatherStreakBest';

function getBestStreak() {
  try { return Number(localStorage.getItem(STREAK_BEST_KEY)) || 0; } catch { return 0; }
}

// Returns true the first time a given streak length beats the previously stored best.
function checkAndStoreBestStreak(streak) {
  const best = getBestStreak();
  if (streak > best) {
    try { localStorage.setItem(STREAK_BEST_KEY, String(streak)); } catch { /* ignore */ }
    return true;
  }
  return false;
}

function renderLogStreak() {
  const el = $('#logStreakLine');
  const heroEl = $('#heroStreakLine');
  const streak = calculateLogStreak(logEntries);
  const isNewBest = streak >= 2 && checkAndStoreBestStreak(streak);
  const line = streak >= 2
    ? `${EMOJI.streak} ${t('logStreakLine', { count: streak })}${isNewBest ? ` ${EMOJI.achievement} ${t('personalBestLine')}` : ''}`
    : '';
  if (el) {
    el.hidden = !line;
    el.textContent = line;
  }
  if (heroEl) {
    heroEl.hidden = !line;
    heroEl.textContent = line;
  }
}

function renderCalendar() {
  if (!calGridEl || !calMonthLabelEl || !calWeekdaysEl) return;

  calMonthLabelEl.textContent = `${monthNames()[calViewMonth]} ${calViewYear}`;
  calWeekdaysEl.innerHTML = weekdayNames().map(w => `<span>${escapeHtml(w)}</span>`).join('');

  const firstOfMonth = new Date(calViewYear, calViewMonth, 1);
  const startOffset = (firstOfMonth.getDay() + 6) % 7; // veckan börjar på måndag
  const daysInMonth = new Date(calViewYear, calViewMonth + 1, 0).getDate();

  const entriesByDay = {};
  for (const e of logEntries) {
    const k = entryDateKey(e);
    (entriesByDay[k] = entriesByDay[k] || []).push(e);
  }

  const todayKey = dateKey(logToday);
  let html = '';

  for (let i = 0; i < startOffset; i++) {
    html += `<div class="cal-cell is-empty" aria-hidden="true"></div>`;
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const cellDate = new Date(calViewYear, calViewMonth, day);
    const k = dateKey(cellDate);
    const dayEntries = entriesByDay[k] || [];
    const classes = ['cal-cell'];
    if (k === todayKey) classes.push('is-today');
    if (k === selectedDateKey) classes.push('is-selected');

    const iconTypes = [...new Set(dayEntries.map(e => e.type))].slice(0, 4);
    const iconsHtml = iconTypes.map(tid => {
      const info = LOG_TYPE_BY_ID[tid];
      return `<span title="${escapeHtml(t(info ? info.labelKey : tid))}">${info ? info.icon : ''}</span>`;
    }).join('');
    const moreCount = dayEntries.length > 4 ? dayEntries.length - 4 : 0;

    html += `<button type="button" class="${classes.join(' ')}" data-date="${k}" aria-pressed="${k === selectedDateKey}">
      <span class="cal-daynum">${day}</span>
      <span class="cal-icons">${iconsHtml}${moreCount ? `<span class="cal-more">+${moreCount}</span>` : ''}</span>
    </button>`;
  }

  calGridEl.innerHTML = html;

  calGridEl.querySelectorAll('.cal-cell[data-date]').forEach(btn => {
    btn.addEventListener('click', () => {
      selectedDateKey = btn.getAttribute('data-date');
      // Dagen man klickar på i kalendern blir samtidigt dagen man loggar mot.
      if (logDateEl) logDateEl.value = selectedDateKey;
      renderCalendar();
    });
  });

  renderDayDetail();
  renderLogStreak();
}

function renderDayDetail() {
  if (!logDayDetailEl) return;
  const dayEntries = logEntries
    .filter(e => entryDateKey(e) === selectedDateKey)
    .sort((a, b) => new Date(a.ts) - new Date(b.ts));

  const [y, m, d] = selectedDateKey.split('-').map(Number);
  const dateObj = new Date(y, m - 1, d);
  const titleText = dateObj.toLocaleDateString(LOCALE[lang], { weekday: 'long', day: 'numeric', month: 'long' });

  if (!dayEntries.length) {
    logDayDetailEl.innerHTML = `<h3 class="log-day-detail-title">${escapeHtml(titleText)}</h3><p class="log-day-detail-empty">${escapeHtml(t('logDayDetailEmpty'))}</p>`;
    return;
  }

  const itemsHtml = dayEntries.map(e => {
    const info = LOG_TYPE_BY_ID[e.type];
    return `<li class="log-entry" data-id="${e.id}">
      <span class="log-entry-icon" aria-hidden="true">${info ? info.icon : ICONS.paw}</span>
      <span class="log-entry-label">${escapeHtml(entryLabel(e))}</span>
      <button type="button" class="log-entry-del" data-id="${e.id}" aria-label="${escapeHtml(t('logDeleteAria'))}">✕</button>
    </li>`;
  }).join('');

  logDayDetailEl.innerHTML = `<h3 class="log-day-detail-title">${escapeHtml(titleText)}</h3><ul class="log-entry-list">${itemsHtml}</ul>`;

  logDayDetailEl.querySelectorAll('.log-entry-del').forEach(btn => {
    btn.addEventListener('click', () => {
      removeLogEntry(btn.getAttribute('data-id'));
      showLogConfirm(t('logConfirmDeleted'));
      renderCalendar();
    });
  });
}

let logConfirmTimer = null;
function showLogConfirm(msg) {
  if (!logConfirmEl) return;
  logConfirmEl.textContent = msg;
  clearTimeout(logConfirmTimer);
  logConfirmTimer = setTimeout(() => { logConfirmEl.textContent = ''; }, 4000);
}

function flashLoggedButton(typeId) {
  const btn = document.querySelector(`.log-btn[data-type="${typeId}"]`);
  if (!btn) return;
  btn.classList.add('just-logged');
  setTimeout(() => btn.classList.remove('just-logged'), 900);
}

function jumpToEntryDate(entry) {
  const d = new Date(entry.ts);
  calViewYear = d.getFullYear();
  calViewMonth = d.getMonth();
  selectedDateKey = entryDateKey(entry);
  renderCalendar();
}

function jumpCalendarToDateKey(k) {
  const [y, m, d] = k.split('-').map(Number);
  if (!y || !m || !d) return;
  calViewYear = y;
  calViewMonth = m - 1;
  selectedDateKey = k;
  renderCalendar();
}

// Appends a 🏆 milestone note to a log confirmation if the just-logged entry pushed the
// streak to one of the celebratory lengths. Called AFTER addLogEntry, so the streak
// calculation already reflects today's new entry.
function withMilestoneSuffix(msg) {
  const streak = calculateLogStreak(logEntries);
  if (STREAK_MILESTONES.includes(streak)) {
    return `${msg} ${EMOJI.achievement} ${t('achievementMilestone', { count: streak })}`;
  }
  return msg;
}

function logSimpleType(typeId) {
  const entry = addLogEntry(typeId);
  flashLoggedButton(typeId);
  const icon = LOG_TYPE_BY_ID[typeId].icon;
  showLogConfirm(withMilestoneSuffix(`${icon} ${t('logConfirmLogged', { type: t(LOG_TYPE_BY_ID[typeId].labelKey) })}`));
  jumpToEntryDate(entry);
  renderLogStreak();
}

function logWalk(minutes) {
  const mins = Number(minutes);
  if (!mins || mins <= 0) {
    showLogConfirm(t('logConfirmInvalidMinutes'));
    return;
  }
  const entry = addLogEntry('walk', { duration: mins });
  flashLoggedButton('walk');
  showLogConfirm(withMilestoneSuffix(`${EMOJI.walk} ${t('logConfirmWalkLogged', { min: mins })}`));
  hideWalkDurationPicker();
  jumpToEntryDate(entry);
  renderLogStreak();
}

function logCustomEvent(text) {
  const label = (text || '').trim();
  if (!label) {
    showLogConfirm(t('logConfirmEmptyCustom'));
    return;
  }
  const entry = addLogEntry('custom', { label });
  showLogConfirm(withMilestoneSuffix(`${EMOJI.custom} ${t('logConfirmLogged', { type: label })}`));
  if (logCustomTextEl) logCustomTextEl.value = '';
  jumpToEntryDate(entry);
  renderLogStreak();
}

function showWalkDurationPicker() {
  if (!walkDurationPickerEl) return;
  walkDurationPickerEl.hidden = false;
  document.querySelector('.log-btn[data-type="walk"]')?.classList.add('is-active');
}

function hideWalkDurationPicker() {
  if (!walkDurationPickerEl) return;
  walkDurationPickerEl.hidden = true;
  if (walkCustomMinutesEl) walkCustomMinutesEl.value = '';
  document.querySelector('.log-btn[data-type="walk"]')?.classList.remove('is-active');
}

document.querySelectorAll('.log-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const typeId = btn.getAttribute('data-type');
    if (typeId === 'walk') {
      if (walkDurationPickerEl && !walkDurationPickerEl.hidden) {
        hideWalkDurationPicker();
      } else {
        showWalkDurationPicker();
      }
      return;
    }
    logSimpleType(typeId);
  });
});

$('#durationChips')?.querySelectorAll('button[data-min]').forEach(btn => {
  btn.addEventListener('click', () => logWalk(btn.getAttribute('data-min')));
});

$('#walkCustomConfirm')?.addEventListener('click', () => {
  logWalk(walkCustomMinutesEl?.value);
});

walkCustomMinutesEl?.addEventListener('keydown', e => {
  if (e.key === 'Enter') { e.preventDefault(); logWalk(walkCustomMinutesEl.value); }
});

$('#walkDurationCancel')?.addEventListener('click', hideWalkDurationPicker);

logDateTodayEl?.addEventListener('click', () => {
  if (logDateEl) logDateEl.value = dateKey(logToday);
  jumpCalendarToDateKey(dateKey(logToday));
});

logDateEl?.addEventListener('change', () => {
  // Om man byter datum manuellt i fältet ska kalendern hoppa till och markera
  // samma dag, så det alltid är tydligt vilken dag man loggar mot.
  const k = logDateEl.value;
  if (k) jumpCalendarToDateKey(k);
});

logCustomConfirmEl?.addEventListener('click', () => {
  logCustomEvent(logCustomTextEl?.value);
});

logCustomTextEl?.addEventListener('keydown', e => {
  if (e.key === 'Enter') { e.preventDefault(); logCustomEvent(logCustomTextEl.value); }
});

calPrevEl?.addEventListener('click', () => {
  calViewMonth -= 1;
  if (calViewMonth < 0) { calViewMonth = 11; calViewYear -= 1; }
  renderCalendar();
});

calNextEl?.addEventListener('click', () => {
  calViewMonth += 1;
  if (calViewMonth > 11) { calViewMonth = 0; calViewYear += 1; }
  renderCalendar();
});

function refreshLogUI() {
  renderCalendar();
}

renderCalendar();
