/*
  Astra Tarot — тэнгэрийн мэдээлэл (нүүр хуудсанд).
  Сарны үе ба ордыг Meeus-ийн томьёогоор, хиртэлт ба гаригийн ухралтыг шалгасан эх сурвалжаас
  (timeanddate.com, Old Farmer's Almanac; 2026.11.23-нд шалгав). HTML-д бичсэн агуулга нь скриптгүй
  үед харагдах эцсийн байдал; скрипт зөвхөн өнөөдрийн огноогоор шинэчилнэ.
*/
const RAD = Math.PI / 180, DAY = 864e5, UB = 8 * 3600e3;
const norm = (x) => ((x % 360) + 360) % 360;
const jd = (d) => d.getTime() / DAY + 2440587.5;
const fromJd = (j) => new Date((j - 2440587.5) * DAY);
const sunLon = (d) => { const n = jd(d) - 2451545, g = (357.528 + 0.9856003 * n) * RAD; return norm(280.46 + 0.9856474 * n + 1.915 * Math.sin(g) + 0.02 * Math.sin(2 * g)); };
const moonLon = (d) => {
  const t = jd(d) - 2451545, Mp = (134.963 + 13.064993 * t) * RAD, M = (357.529 + 0.98560028 * t) * RAD, D = (297.85 + 12.190749 * t) * RAD, F = (93.272 + 13.22935 * t) * RAD;
  return norm(218.316 + 13.176396 * t + 6.289 * Math.sin(Mp) + 1.274 * Math.sin(2 * D - Mp) + 0.658 * Math.sin(2 * D) + 0.214 * Math.sin(2 * Mp) - 0.186 * Math.sin(M) - 0.114 * Math.sin(2 * F));
};
const sign = (lon) => Math.floor(norm(lon) / 30);
const phase = (k) => {
  const T = k / 1236.85, T2 = T * T, T3 = T2 * T, T4 = T3 * T, s = Math.sin;
  const E = 1 - 0.002516 * T - 0.0000074 * T2;
  const M = (2.5534 + 29.1053567 * k - 0.0000014 * T2 - 0.00000011 * T3) * RAD;
  const Mp = (201.5643 + 385.81693528 * k + 0.0107582 * T2 + 0.00001238 * T3 - 0.000000058 * T4) * RAD;
  const F = (160.7108 + 390.67050284 * k - 0.0016118 * T2 - 0.00000227 * T3 + 0.000000011 * T4) * RAD;
  const Om = (124.7746 - 1.56375588 * k + 0.0020672 * T2 + 0.00000215 * T3) * RAD;
  const c = Math.abs(k - Math.floor(k) - 0.5) < 1e-6 ? [-0.40614, 0.17302, 0.01614, 0.01043, 0.00734, -0.00515, 0.00209] : [-0.4072, 0.17241, 0.01608, 0.01039, 0.00739, -0.00514, 0.00208];
  let j = 2451550.09766 + 29.530588861 * k + 0.00015437 * T2 - 0.00000015 * T3 + 0.00000000073 * T4;
  j += c[0] * s(Mp) + c[1] * E * s(M) + c[2] * s(2 * Mp) + c[3] * s(2 * F) + c[4] * E * s(Mp - M) + c[5] * E * s(Mp + M) + c[6] * E * E * s(2 * M)
    - 0.00111 * s(Mp - 2 * F) - 0.00057 * s(Mp + 2 * F) + 0.00056 * E * s(2 * Mp + M) - 0.00042 * s(3 * Mp) + 0.00042 * E * s(M + 2 * F)
    + 0.00038 * E * s(M - 2 * F) - 0.00024 * E * s(2 * Mp - M) - 0.00017 * s(Om);
  return fromJd(j - 69 / 86400);
};
const phases = (a, b) => {
  let k = Math.floor(((a - Date.UTC(2000, 0, 6)) / (365.25 * DAY)) * 12.3685) - 2;
  const out = [];
  for (let i = 0; i < 200; i++, k++) for (const kk of [k, k + 0.5]) { const d = phase(kk); if (d > b) return out; if (d >= a) out.push({ kind: kk % 1 ? 'full' : 'new', date: d }); }
  return out;
};
const SIGNS = ['Хонь', 'Үхэр', 'Ихэр', 'Мэлхий', 'Арслан', 'Охин', 'Жинлүүр', 'Хилэнц', 'Нум', 'Матар', 'Хумх', 'Загас'];
const DOW = ['Ням', 'Даваа', 'Мягмар', 'Лхагва', 'Пүрэв', 'Баасан', 'Бямба'];
const ub = (d) => new Date(d.getTime() + UB);
const noon = (k) => new Date(Date.parse(`${k}T04:00:00Z`));
const keyOf = (d) => { const u = ub(d); return `${u.getUTCFullYear()}-${String(u.getUTCMonth() + 1).padStart(2, '0')}-${String(u.getUTCDate()).padStart(2, '0')}`; };
const short = (d) => { const u = ub(d); return `${u.getUTCMonth() + 1}.${u.getUTCDate()}`; };
const SKY = [
  { kind: 'mars', start: '2027-01-10', end: '2027-04-01', title: 'Ангараг гариг ухарна', note: 'Шинэ том эхлэл, маргаанаас зайлсхий' },
  { kind: 'solar', start: '2027-02-06', title: 'Нарны хиртэлт', note: 'Хүслээ бич, том шийдвэр бүү гарга' },
  { kind: 'mercury', start: '2027-02-09', end: '2027-03-03', title: 'Буд гариг ухарна', note: 'Гэрээгээ өмнө нь байгуул' },
  { kind: 'lunar', start: '2027-02-21', title: 'Сарны хиртэлт', note: 'Хуучирсан зүйлээ тавьж явуул' },
  { kind: 'mercury', start: '2027-06-10', end: '2027-07-04', title: 'Буд гариг ухарна', note: 'Гэрээгээ өмнө нь байгуул' },
  { kind: 'solar', start: '2027-08-02', title: 'Бүтэн нарны хиртэлт', note: 'Энэ зууны хамгийн урт хиртэлтүүдийн нэг' },
  { kind: 'lunar', start: '2027-08-17', title: 'Сарны хиртэлт', note: 'Хуучирсан зүйлээ тавьж явуул' },
  { kind: 'mercury', start: '2027-10-07', end: '2027-10-28', title: 'Буд гариг ухарна', note: 'Гэрээгээ өмнө нь байгуул' },
  { kind: 'lunar', start: '2028-01-12', title: 'Сарны хиртэлт', note: 'Хуучирсан зүйлээ тавьж явуул' },
  { kind: 'solar', start: '2028-01-26', title: 'Нарны хиртэлт', note: 'Хүслээ бич, том шийдвэр бүү гарга' }
];
const ICON = { new: '🌑', full: '🌕', solar: '🌘', lunar: '🌗', mercury: '☿', mars: '♂' };

export function events(now = new Date(), days = 90) {
  const a = noon(keyOf(now)), b = new Date(a.getTime() + days * DAY), list = [];
  phases(new Date(a.getTime() - DAY / 2), b).forEach((p) => {
    const s = sign(sunLon(p.date));
    list.push({ kind: p.kind, date: p.date, title: p.kind === 'new' ? `Шинэ сар · ${SIGNS[s]}` : `Тэргэл сар · ${SIGNS[(s + 6) % 12]}`, note: p.kind === 'new' ? 'Шинэ зүйл эхлүүлэх өдөр' : 'Дүгнэх, талархах өдөр' });
  });
  SKY.forEach((e) => {
    const s = noon(e.start), t = e.end ? noon(e.end) : s;
    if (t < a || s > b) return;
    const lon = sunLon(s), sg = e.kind === 'solar' ? sign(lon) : e.kind === 'lunar' ? (sign(lon) + 6) % 12 : null;
    list.push({ ...e, date: s, endDate: e.end ? t : null, title: sg == null ? e.title : `${e.title} · ${SIGNS[sg]}`, hot: e.kind !== 'mercury' && e.kind !== 'mars' ? true : !!e.end });
  });
  return list.sort((x, y) => x.date - y.date).map((e) => ({ ...e, icon: ICON[e.kind], when: e.endDate ? `${short(e.date)}–${short(e.endDate)}` : short(e.date) }));
}

export function today(now = new Date()) {
  const ph = phases(new Date(now - 32 * DAY), new Date(+now + 32 * DAY)).filter((p) => p.kind === 'new');
  const prev = [...ph].reverse().find((p) => p.date <= now), next = ph.find((p) => p.date > now);
  const age = (now - prev.date) / (next.date - prev.date), illum = (1 - Math.cos(2 * Math.PI * age)) / 2;
  const names = ['Шинэ сар', 'Өсөх хавирган сар', 'Сарны эхний хагас', 'Өсөх сар', 'Тэргэл сар', 'Хорогдох сар', 'Сарны сүүлийн хагас', 'Хорогдох хавирган сар'];
  const idx = [0.03, 0.22, 0.28, 0.47, 0.53, 0.72, 0.78, 0.97].findIndex((x) => age < x);
  const u = ub(now);
  return { illum, waxing: age < 0.5, name: names[idx < 0 ? 0 : idx], moonSign: SIGNS[sign(moonLon(now))], dow: DOW[u.getUTCDay()], md: `${u.getUTCMonth() + 1}-р сарын ${u.getUTCDate()}` };
}

export function moonPath(illum, waxing, r = 22) {
  if (illum < 0.015) return '';
  const w = (r * Math.abs(1 - 2 * illum)).toFixed(2), o = waxing ? 1 : 0, t = waxing ? (illum < 0.5 ? 0 : 1) : (illum < 0.5 ? 1 : 0);
  return `M0,${-r} A${r},${r} 0 0 ${o} 0,${r} A${w},${r} 0 0 ${t} 0,${-r}Z`;
}

// Нүүр хуудсыг шинэчлэх: [data-sky-today], [data-sky-list]
const t = today();
document.querySelectorAll('[data-sky-today]').forEach((el) => {
  const set = (k, v) => { const n = el.querySelector(`[data-sky="${k}"]`); if (n) n.textContent = v; };
  set('meta', `${t.dow} · ${t.md} · ${t.name} ${Math.round(t.illum * 100)}%`);
  set('sign', `Сар өнөөдөр ${t.moonSign} ордод`);
  const path = el.querySelector('[data-sky="moon"]');
  if (path) path.setAttribute('d', moonPath(t.illum, t.waxing));
});
document.querySelectorAll('[data-sky-list]').forEach((ul) => {
  const n = +ul.dataset.skyList || 7;
  ul.innerHTML = events().slice(0, n).map((e) => `<li class="sky-row${e.hot ? ' is-hot' : ''}"><span class="sky-row__when">${e.when}</span><span class="sky-row__icon" aria-hidden="true">${e.icon}</span><span class="sky-row__what"><b>${e.title}</b><span>${e.note}</span></span></li>`).join('');
});
