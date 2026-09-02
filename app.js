const $=s=>document.querySelector(s);const statusEl=$('#searchStatus'),dailyEl=$('#daily'),currentEl=$('#current'),alertsEl=$('#alerts');
const BASE='https://opendata-download-metfcst.smhi.se/api/category/snow1g/version/1';
// Vädersymboler enligt SMHI:s officiella kodtabell Wsymb2 (koderna 1–27 är oförändrade
// mellan SMHI:s gamla och nya prognos-API). Källa: SMHI Öppna data, https://opendata.smhi.se/
const symbols={1:['☀️','Klart'],2:['🌤️','Nästan klart'],3:['⛅','Växlande molnighet'],4:['☁️','Halvklart'],5:['☁️','Molnigt'],6:['☁️','Mulet'],7:['🌫️','Dimma'],8:['🌦️','Lätta regnskurar'],9:['🌧️','Regnskurar'],10:['🌧️','Kraftiga regnskurar'],11:['⛈️','Åska'],12:['🌨️','Lätta snöblandade skurar'],13:['🌨️','Snöblandade skurar'],14:['🌨️','Kraftiga snöblandade skurar'],15:['🌨️','Lätta snöbyar'],16:['🌨️','Snöbyar'],17:['❄️','Kraftiga snöbyar'],18:['🌦️','Lätt regn'],19:['🌧️','Regn'],20:['🌧️','Kraftigt regn'],21:['⛈️','Åska'],22:['🌨️','Lätt snöblandat regn'],23:['🌨️','Snöblandat regn'],24:['🌨️','Kraftigt snöblandat regn'],25:['🌨️','Lätt snöfall'],26:['❄️','Snöfall'],27:['❄️','Kraftigt snöfall']};
function val(obj, name) {

  if (!obj || !obj.data) return null;

  if (Array.isArray(obj.data)) {
    const v = obj.data.find(x => x.name === name);
    return v?.value ?? v?.values?.[0] ?? null;
  }

  if (typeof obj.data === "object") {
    const v = obj.data[name];

    if (v == null) return null;

    if (typeof v === "object") {
      return v.value ?? v.values?.[0] ?? null;
    }

    return v;
  }

  return null;
}function n(v,d=0){return v==null?'–':Number(v).toFixed(d)}
async function geocode(q){const u=new URL('https://nominatim.openstreetmap.org/search');u.searchParams.set('format','jsonv2');u.searchParams.set('limit','5');u.searchParams.set('countrycodes','se');u.searchParams.set('q',q);const r=await fetch(u,{headers:{'Accept-Language':'sv'}});if(!r.ok)throw Error('Platssökningen svarade inte.');const a=await r.json();if(!a.length)throw Error('Jag hittade inte platsen. Prova ort och kommun.');return {lat:+a[0].lat,lon:+a[0].lon,name:a[0].display_name.split(',').slice(0,2).join(',')}}
async function reverse(lat,lon){try{const u=`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&zoom=10`;const r=await fetch(u,{headers:{'Accept-Language':'sv'}});const x=await r.json();return x.address.city||x.address.town||x.address.village||x.address.municipality||'Din position'}catch{return'Din position'}}
async function forecast(loc){
  statusEl.textContent='Hämtar prognosen…';

  const u=`${BASE}/geotype/point/lon/${loc.lon.toFixed(5)}/lat/${loc.lat.toFixed(5)}/data.json`;

  const r=await fetch(u);

  if(!r.ok)
    throw Error('SMHI-prognosen kunde inte hämtas för platsen.');

  const data=await r.json();

  render(data,loc);

  localStorage.setItem('dogWeatherLocation',JSON.stringify(loc));
}
function advice(t,p,w){if(t>=25)return'Varmt promenadläge: välj skugga och lugnt tempo, ta med vatten och undvik heta underlag.';if(t>=20)return'Ta med vatten och planera gärna den längre rundan till en svalare del av dagen.';if((p||0)>1)return'Blöt runda: överväg regntäcke om hunden trivs i det och torka päls, mage och tassar efteråt.';if(w>=10)return'Blåsigt: välj en skyddad runda och var uppmärksam på grenar och lösa föremål.';if(t<=0)return'Kallt promenadläge: håll koll på tassar, is och vägsalt. Anpassa längden efter din hund.';return'Fint vardagsläge för promenad. Anpassa tempo och längd efter hundens signaler.'}
function render(data,loc){const ts=data.timeSeries||[];const now=Date.now();const cur=ts.find(x=>new Date(x.time).getTime()>=now)||ts[0];if(!cur)throw Error('Prognosen saknar tidsserier.');const t=val(cur,'air_temperature'),w=val(cur,'wind_speed'),g=val(cur,'wind_speed_of_gust'),h=val(cur,'relative_humidity'),p=val(cur,'precipitation_amount_mean')??val(cur,'precipitation_amount_median')??val(cur,'precipitation_amount_max');const sym=Number(val(cur,'symbol_code')??1),[icon,desc]=symbols[sym]||['🌤️','Växlande väder'];currentEl.className='current';currentEl.innerHTML=`<div class="current-main"><div class="weather-icon">${icon}</div><div><div class="place-name">${loc.name}</div><div class="temp">${n(t)}°</div><div>${desc}</div></div></div><div class="metrics"><div class="metric"><span>VIND</span><b>${n(w,1)} m/s</b></div><div class="metric"><span>BYVIND</span><b>${n(g,1)} m/s</b></div><div class="metric"><span>LUFTFUKTIGHET</span><b>${n(h)} %</b></div></div><div class="dog-verdict">🐕 ${advice(t,p,w)}</div>`;alertsEl.innerHTML=t>=25?'<div class="alert"><b>Värme att ta på allvar.</b> Ta med vatten och korta ned eller flytta ansträngande aktivitet till svalare timmar. Lämna aldrig hunden i bilen: Jordbruksverkets föreskrifter tillåter inte att ett djur lämnas utan tillsyn i bil om innetemperaturen riskerar överstiga 25°C.</div>':((p||0)>2?'<div class="alert"><b>Rejält blött.</b> Planera för torkning och kontroll av tassar och mellan trampdynorna efter rundan.</div>':'');
 const days={};ts.forEach(x=>{const d=new Date(x.time),key=new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Stockholm',year:'numeric',month:'2-digit',day:'2-digit'}).format(d);(days[key]??=[]).push(x)});const names=new Intl.DateTimeFormat('sv-SE',{weekday:'short',day:'numeric',month:'short',timeZone:'Europe/Stockholm'});dailyEl.innerHTML=Object.values(days).slice(0,5).map((arr,i)=>{const temps=arr.map(x=>val(x,'air_temperature')).filter(Number.isFinite),rain=arr.map(x=>val(x,'precipitation_amount_mean')??val(x,'precipitation_amount_median')??0),mid=arr[Math.floor(arr.length/2)],s=Number(val(mid,'symbol_code')??1),si=symbols[s]||['🌤️','Väder'];return`<article class="day ${i===0?'today':''}"><b>${i===0?'Idag':names.format(new Date(mid.time))}</b><div class="day-icon">${si[0]}</div><div class="range">${Math.round(Math.max(...temps))}° / ${Math.round(Math.min(...temps))}°</div><small>${si[1]} · regn ${n(Math.max(...rain),1)} mm/h</small></article>`}).join('');$('#updated').textContent=`Uppdaterad ${new Intl.DateTimeFormat('sv-SE',{dateStyle:'medium',timeStyle:'short'}).format(new Date())}. Källa: SMHI.`;statusEl.textContent=`Visar prognos för ${loc.name}.`}
$('#searchForm').addEventListener('submit',async e=>{e.preventDefault();try{const loc=await geocode($('#place').value.trim());await forecast(loc)}catch(e){statusEl.textContent=e.message}});$('#locate').addEventListener('click',()=>{if(!navigator.geolocation){statusEl.textContent='Din webbläsare stöder inte platsdelning.';return}statusEl.textContent='Hämtar din position…';navigator.geolocation.getCurrentPosition(async p=>{try{const lat=p.coords.latitude,lon=p.coords.longitude,name=await reverse(lat,lon);await forecast({lat,lon,name})}catch(e){statusEl.textContent=e.message}},()=>statusEl.textContent='Platsåtkomst nekades. Sök efter ort i stället.',{enableHighAccuracy:false,timeout:10000})});
(async()=>{try{const s=JSON.parse(localStorage.getItem('dogWeatherLocation'));if(s)await forecast(s)}catch{}})();
