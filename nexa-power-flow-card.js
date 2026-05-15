// ╔══════════════════════════════════════════════════════════╗
// ║  NEXA-POWER-FLOW-CARD  v15.4                             ║
// ║  + Version Badge oben rechts                             ║
// ║  + Hintergrund = Theme-Farbe wenn nicht gesetzt          ║
// ╚══════════════════════════════════════════════════════════╝

const CARD_VERSION = 'v15.4';
const DONUT_SOLAR  = '#f1c40f'; // ☀️ Gelb – immer fix
const DONUT_GRID   = '#448aff'; // ⚡ Blau – immer fix

function toHex(val, fallback) {
  if (!val) return fallback;
  if (typeof val === 'string') return val;
  if (typeof val === 'object' && 'r' in val) {
    const h = v => v.toString(16).padStart(2, '0');
    return `#${h(val.r)}${h(val.g)}${h(val.b)}`;
  }
  return fallback;
}

function autarkyColor(pct) {
  const hue = Math.round((pct / 100) * 120);
  return `hsl(${hue}, 88%, 40%)`;
}

const PATHS = {
  curved:   { solar: "M 70,50 C -10,100 -10,200 70,250",       bat: "M 130,265 Q 200,295 270,265",  grid: "M 330,50 C 410,100 410,200 330,250" },
  straight: { solar: "M 70,50 L 70,250",                        bat: "M 130,265 L 270,265",           grid: "M 330,50 L 330,250" },
  diagonal: { solar: "M 70,50 L 130,265",                       bat: "M 130,265 L 270,265",           grid: "M 330,50 L 270,265" },
  rounded:  { solar: "M 70,50 Q 20,80 20,150 Q 20,220 70,250", bat: "M 130,265 Q 200,290 270,265",  grid: "M 330,50 Q 380,80 380,150 Q 380,220 330,250" },
  dashed:   { solar: "M 70,50 C -10,100 -10,200 70,250",       bat: "M 130,265 Q 200,295 270,265",  grid: "M 330,50 C 410,100 410,200 330,250" },
};

function flowGroup(id, pathD, colorClass) {
  return `
    <path id="base-${id}" class="base-line" stroke="#888" d="${pathD}"/>
    <path id="dot-${id}-L" class="dot dot-L ${colorClass}" d="${pathD}"/>
    <path id="dot-${id}-M" class="dot dot-M ${colorClass}" d="${pathD}"/>
    <path id="dot-${id}-S" class="dot dot-S ${colorClass}" d="${pathD}"/>`;
}

function buildStyle(C) {
  // ══════════════════════════════════════════════════════════
  // Hintergrund: wenn nichts konfiguriert → HA Theme Variable
  // var(--ha-card-background) = aktuelle Karten-Hintergrundfarbe
  // ══════════════════════════════════════════════════════════
  const bg = C.background_color
    ? toHex(C.background_color, 'var(--ha-card-background, var(--card-background-color, white))')
    : 'var(--ha-card-background, var(--card-background-color, white))';

  const textCol  = toHex(C.text_color,        'var(--primary-text-color, #111111)');
  const labelCol = toHex(C.label_color,        'var(--secondary-text-color, #888888)');
  const solarCol = toHex(C.color_solar,        '#f39c12');
  const batCol   = toHex(C.color_bat,          '#2ecc71');
  const gridImp  = toHex(C.color_grid_import,  '#448aff');

  const lw    = parseFloat(C.line_width) || 12;
  const lwL   = lw * 1.33;
  const lwM   = lw * 0.67;
  const lwS   = lw * 0.25;
  const speed = parseFloat(C.line_speed) || 2;
  const dur   = (6 / speed).toFixed(2);

  const isDashed = C.line_style === 'dashed';
  const gap      = isDashed ? 160 : 119;
  const cycle    = 1 + gap;

  return `
  :host {
    display: block;
    contain: layout style paint;
    border-radius: 24px;
    overflow: hidden;
  }
  ha-card {
    /* ── Hintergrund: Theme wenn nicht konfiguriert ── */
    background: ${bg};
    border-radius: 24px;
    padding: 20px;
    color: ${textCol};
    font-family: sans-serif;
    overflow: hidden;
    position: relative;
    contain: layout style paint;
  }

  /* ── Version Badge ── */
  .version-badge {
    position: absolute;
    top: 8px;
    right: 12px;
    font-size: 9px;
    font-weight: 600;
    letter-spacing: 0.05em;
    opacity: 0.20;
    z-index: 10;
    pointer-events: none;
    color: ${textCol};
  }

  .flow-wrap {
    position: relative;
    overflow: hidden;
  }
  .grid-container {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 110px 80px;
    position: relative;
    z-index: 2;
  }
  .node { text-align: center; display: flex; flex-direction: column; align-items: center; z-index: 3; }
  .icon { --mdc-icon-size: 54px; width: 54px; height: 54px; color: var(--p-color); }
  .label { font-size: 11px; text-transform: uppercase; margin-top: 4px; letter-spacing: 0.06em; color: ${labelCol}; }
  .val  { font-size: 32px; font-weight: 900; line-height: 1; margin-top: 6px; color: var(--p-color); }
  .unit { font-size: 15px; opacity: 0.85; font-weight: 600; color: var(--p-color); }
  .daily-total { font-size: 11px; margin-top: 6px; padding: 2px 10px; background: rgba(0,0,0,0.07); border-radius: 8px; font-weight: 600; color: ${labelCol}; }
  .sub-val { font-size: 13px; margin-top: 3px; font-weight: 700; }

  .flow-svg {
    position: absolute; top: 0; left: 0;
    width: 100%; height: 100%;
    z-index: 1; pointer-events: none;
    overflow: hidden;
  }
  .base-line { fill: none; stroke-width: 1.2; stroke-dasharray: 2, 10; opacity: 0.10; }

  .dot   { fill: none; stroke-linecap: round; stroke-dasharray: 1, ${gap}; animation: flow ${dur}s linear infinite; }
  .dot-L { stroke-width: ${lwL.toFixed(1)}; animation-delay: 0s; }
  .dot-M { stroke-width: ${lwM.toFixed(1)}; animation-delay: -${(parseFloat(dur) * (gap/3) / cycle).toFixed(2)}s; }
  .dot-S { stroke-width: ${lwS.toFixed(1)}; animation-delay: -${(parseFloat(dur) * (gap*2/3) / cycle).toFixed(2)}s; }

  .c-solar { stroke: ${solarCol}; filter: drop-shadow(0 0 2px ${solarCol}); }
  .c-bat   { stroke: ${batCol};   filter: drop-shadow(0 0 2px ${batCol}); }
  .c-grid  { stroke: ${gridImp};  filter: drop-shadow(0 0 2px ${gridImp}); }

  @keyframes flow {
    from { stroke-dashoffset: ${cycle}; }
    to   { stroke-dashoffset: 0; }
  }

  .center-wrap {
    position: absolute;
    top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    z-index: 4;
    pointer-events: none;
  }

  .monitor {
    margin-top: 16px;
    padding-top: 14px;
    border-top: 1px solid rgba(0,0,0,0.09);
    position: relative;
    z-index: 5;
  }
  .mon-header {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-bottom: 5px;
  }
  .mon-label      { font-size: 10px; text-transform: uppercase; letter-spacing: 0.07em; color: ${labelCol}; }
  .mon-total-val  { font-size: 18px; font-weight: 900; color: ${textCol}; }
  .mon-total-unit { font-size: 12px; font-weight: 600; opacity: 0.55; margin-left: 2px; }
  .mon-total-bar-wrap { height: 6px; background: rgba(0,0,0,0.08); border-radius: 3px; margin-bottom: 12px; overflow: hidden; }
  .mon-total-bar      { height: 100%; background: #4caf50; border-radius: 3px; transition: width 0.6s ease; width: 0%; }
  .mon-row {
    display: grid;
    grid-template-columns: 115px 1fr 58px;
    align-items: center;
    gap: 8px;
    margin-bottom: 7px;
  }
  .mon-name     { font-size: 12px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: ${textCol}; }
  .mon-bar-wrap { height: 9px; background: rgba(0,0,0,0.07); border-radius: 5px; overflow: hidden; }
  .mon-bar      { height: 100%; border-radius: 5px; transition: width 0.5s ease; width: 0%; }
  .mon-val      { font-size: 12px; font-weight: 800; text-align: right; }
  `;
}

class NexaPowerFlowCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._initialized = false;
  }

  static getConfigElement() { return document.createElement('nexa-power-flow-card-editor'); }
  setConfig(config) { this._config = config; this._initialized = false; }

  set hass(hass) {
    this._hass = hass;
    if (!this._initialized) { this._buildDOM(); this._initialized = true; }
    this._updateValues();
  }

  _num(id) {
    if (!id || !this._hass?.states[id]) return 0;
    const s = String(this._hass.states[id].state).replace(',', '.');
    return isNaN(s) ? 0 : parseFloat(s);
  }
  _numEnt(id, unit) {
    const v = this._num(id);
    return unit === 'kW' ? v * 1000 : v;
  }

  get _uid() {
    if (!this.__uid) this.__uid = Math.random().toString(36).slice(2, 7);
    return this.__uid;
  }

  _buildDOM() {
    const C   = this._config;
    const key = (C.line_style && C.line_style !== 'dashed') ? C.line_style : 'curved';
    const P   = PATHS[key] || PATHS.curved;

    const solarIconCol = toHex(C.color_solar, '#f39c12');
    const houseIconCol = toHex(C.color_house, '#e67e22');

    this.shadowRoot.innerHTML = `
<style>${buildStyle(C)}</style>
<ha-card>

  <!-- ── Version Badge ── -->
  <div class="version-badge">${CARD_VERSION}</div>

  <div class="flow-wrap">
    <svg class="flow-svg" viewBox="0 0 400 320" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <clipPath id="fc-${this._uid}">
          <rect x="0" y="0" width="400" height="320"/>
        </clipPath>
      </defs>
      <g clip-path="url(#fc-${this._uid})">
        ${flowGroup('solar', P.solar, 'c-solar')}
        ${flowGroup('bat',   P.bat,   'c-bat')}
        ${flowGroup('grid',  P.grid,  'c-grid')}
      </g>
    </svg>

    <div class="grid-container">
      <!-- Solar -->
      <div class="node" style="--p-color:${solarIconCol}">
        <ha-icon class="icon" icon="mdi:solar-power-variant"></ha-icon>
        <div class="label">Solar</div>
        <div class="val"><span id="v-solar">0</span><span class="unit">W</span></div>
        <div class="daily-total">Heute: <span id="v-solar-day">0.00</span> kWh</div>
      </div>
      <!-- Netz -->
      <div id="node-grid" class="node" style="--p-color:#448aff">
        <ha-icon class="icon" icon="mdi:transmission-tower"></ha-icon>
        <div class="label">Netz</div>
        <div class="val"><span id="v-grid">0</span><span class="unit">W</span></div>
        <div id="v-grid-dir" class="sub-val">Bezug</div>
      </div>
      <!-- Speicher -->
      <div id="node-bat" class="node" style="--p-color:#2ecc71">
        <ha-icon id="icon-bat" class="icon" icon="mdi:battery-50"></ha-icon>
        <div class="label">Speicher</div>
        <div class="val"><span id="v-soc">0</span><span class="unit">%</span></div>
        <div id="v-bat-pwr" class="sub-val">0 W</div>
      </div>
      <!-- Haus -->
      <div class="node" style="--p-color:${houseIconCol}">
        <ha-icon class="icon" icon="mdi:home-lightning-bolt"></ha-icon>
        <div class="label">Haus</div>
        <div class="val"><span id="v-house">0</span><span class="unit">W</span></div>
        <div class="daily-total">Heute: <span id="v-house-day">0.00</span> kWh</div>
      </div>
    </div>

    <!-- Autarkie Donut -->
    <div class="center-wrap">
      <svg width="120" height="120" viewBox="0 0 120 120">
        <!-- ⚡ Netz = IMMER BLAU -->
        <circle id="autarky-bg-ring"
          cx="60" cy="60" r="46" fill="none"
          stroke="${DONUT_GRID}" stroke-width="12" opacity="1"/>
        <!-- ☀️ Solar = IMMER GELB -->
        <circle id="autarky-ring"
          cx="60" cy="60" r="46" fill="none"
          stroke="${DONUT_SOLAR}" stroke-width="12"
          stroke-linecap="butt" stroke-dasharray="0 289"
          transform="rotate(-90 60 60)"
          style="transition: stroke-dasharray 1.2s ease;"/>
        <circle cx="60" cy="60" r="34" fill="white" opacity="0.12"/>
        <!-- Text: Rot→Gelb→Grün -->
        <text id="autarky-pct"
          x="60" y="56" text-anchor="middle" dominant-baseline="middle"
          font-size="22" font-weight="900"
          fill="hsl(0,88%,40%)"
          style="transition: fill 1.2s ease;">0%</text>
        <text x="60" y="74" text-anchor="middle"
          font-size="9" font-weight="700"
          fill="rgba(0,0,0,0.45)" letter-spacing="0.5">AUTARKIE</text>
      </svg>
    </div>
  </div>

  <!-- Power Monitor -->
  <div class="monitor">
    <div class="mon-header">
      <span class="mon-label">Gesamtverbrauch</span>
      <span><span id="mon-total" class="mon-total-val">0</span><span class="mon-total-unit">W</span></span>
    </div>
    <div class="mon-total-bar-wrap"><div id="mon-total-bar" class="mon-total-bar"></div></div>
    <div id="mon-rows"></div>
  </div>

</ha-card>`;

    const $ = id => this.shadowRoot.getElementById(id);
    this._el = {
      vSolar:    $('v-solar'),     vSolarDay: $('v-solar-day'),
      vGrid:     $('v-grid'),      vGridDir:  $('v-grid-dir'),
      vSoc:      $('v-soc'),       vBatPwr:   $('v-bat-pwr'),
      vHouse:    $('v-house'),     vHouseDay: $('v-house-day'),
      nodeBat:   $('node-bat'),    iconBat:   $('icon-bat'),
      nodeGrid:  $('node-grid'),
      baseSolar: $('base-solar'),
      solarL: $('dot-solar-L'), solarM: $('dot-solar-M'), solarS: $('dot-solar-S'),
      baseBat: $('base-bat'),
      batL: $('dot-bat-L'), batM: $('dot-bat-M'), batS: $('dot-bat-S'),
      baseGrid: $('base-grid'),
      gridL: $('dot-grid-L'), gridM: $('dot-grid-M'), gridS: $('dot-grid-S'),
      autarkyRing:   $('autarky-ring'),
      autarkyBgRing: $('autarky-bg-ring'),
      autarkyPct:    $('autarky-pct'),
      monTotal:    $('mon-total'),
      monTotalBar: $('mon-total-bar'),
      monRows:     $('mon-rows'),
    };
  }

  _setVisible(els, v) { els.forEach(el => { if (v) el.style.removeProperty('display'); else el.style.display = 'none'; }); }
  _setDir(els, dir)   { els.forEach(el => el.style.animationDirection = dir); }
  _setColor(els, col) { els.forEach(el => { el.style.stroke = col; el.style.filter = `drop-shadow(0 0 2px ${col})`; }); }

  _updateValues() {
    if (!this._el) return;
    const C  = this._config;
    const el = this._el;

    const solar     = Math.round(this._num(C.solar));
    const grid      = Math.round(this._num(C.grid));
    const bat_pwr   = Math.round(this._num(C.battery_discharge));
    const house     = Math.round(Math.abs(bat_pwr) + grid);
    const solar_day = this._num(C.solar_day);
    const house_day = this._num(C.house_day);
    const soc       = Math.round(this._num(C.battery_soc));

    // ── AUTARKIE ─────────────────────────────────────────────
    let autarky = 0;
    if (C.autarky_entity && this._hass?.states[C.autarky_entity]) {
      // Entity konfiguriert → NUR Entity, kein Fallback
      let raw = this._num(C.autarky_entity);
      if (raw > 0 && raw <= 1) raw *= 100;
      autarky = Math.min(100, Math.max(0, Math.round(raw)));
    } else {
      // Kein Entity → Echtzeit berechnen
      if (house > 0) {
        const gridImport  = Math.max(0, grid);
        const selfCovered = Math.max(0, house - gridImport);
        autarky = Math.min(100, Math.max(0, Math.round((selfCovered / house) * 100)));
      }
    }
    // ─────────────────────────────────────────────────────────

    const gridColor = grid >= 0
      ? toHex(C.color_grid_import, '#448aff')
      : toHex(C.color_grid_export, '#2ecc71');
    const gridDir  = grid >= 0 ? 'normal' : 'reverse';
    const batColor = soc > 70 ? '#2ecc71' : (soc > 30 ? '#f1c40f' : '#e74c3c');
    const batIcon  = soc > 90 ? 'mdi:battery' : (soc > 20 ? 'mdi:battery-50' : 'mdi:battery-outline');

    el.vSolar.textContent    = solar;
    el.vSolarDay.textContent = solar_day.toFixed(2);
    el.vGrid.textContent     = Math.abs(grid);
    el.vGridDir.textContent  = grid >= 0 ? 'Bezug' : 'Einspeisung';
    el.vGridDir.style.color  = gridColor;
    el.vSoc.textContent      = soc;
    el.vBatPwr.textContent   = `${Math.abs(bat_pwr)} W`;
    el.vHouse.textContent    = house;
    el.vHouseDay.textContent = house_day.toFixed(2);

    el.nodeBat.style.setProperty('--p-color', batColor);
    el.iconBat.setAttribute('icon', batIcon);
    el.nodeGrid.style.setProperty('--p-color', gridColor);

    // ── DONUT ──────────────────────────────────────────────────
    if (el.autarkyRing) {
      const circumference = 2 * Math.PI * 46;
      const solarArc = (autarky / 100) * circumference;
      const gridArc  = circumference - solarArc;

      el.autarkyRing.setAttribute('stroke-dasharray',
        `${solarArc.toFixed(1)} ${gridArc.toFixed(1)}`);

      // Farben IMMER FIX
      el.autarkyRing.setAttribute('stroke',   DONUT_SOLAR);
      el.autarkyBgRing.setAttribute('stroke', DONUT_GRID);

      // Nur Text ändert Farbe
      el.autarkyPct.textContent = `${autarky}%`;
      el.autarkyPct.style.fill  = autarkyColor(autarky);
    }

    const solarDots = [el.solarL, el.solarM, el.solarS];
    const batDots   = [el.batL,   el.batM,   el.batS];
    const gridDots  = [el.gridL,  el.gridM,  el.gridS];

    this._setVisible([el.baseSolar, ...solarDots], solar > 10);
    this._setVisible([el.baseBat,   ...batDots],   Math.abs(bat_pwr) > 5);
    this._setVisible([el.baseGrid,  ...gridDots],  grid !== 0);

    this._setDir(batDots,  bat_pwr < 0 ? 'normal' : 'reverse');
    this._setDir(gridDots, gridDir);
    this._setColor(gridDots, gridColor);
    el.baseGrid.style.stroke = gridColor;

    // ── Power Monitor ──────────────────────────────────────────
    const maxW   = C.max_watts || 3000;
    const totalW = C.meter_normal_power ? this._numEnt(C.meter_normal_power) : house;
    el.monTotal.textContent    = Math.round(totalW);
    el.monTotalBar.style.width = `${Math.min(100, (totalW / maxW) * 100).toFixed(1)}%`;

    const entities = C.entities || [];
    const items = entities
      .filter(e => e.group === 'normalstrom')
      .map(e => ({ name: e.name || e.entity, w: this._numEnt(e.entity, e.unit) }))
      .filter(e => e.w >= 2)
      .sort((a, b) => b.w - a.w);

    const palette = ['#f39c12','#448aff','#2ecc71','#e74c3c','#9b59b6','#1abc9c','#e67e22','#3498db'];
    const maxBar  = items.length ? items[0].w : 1;

    el.monRows.innerHTML = items.map((item, i) => {
      const pct   = Math.min(100, (item.w / maxBar) * 100).toFixed(1);
      const color = palette[i % palette.length];
      return `
        <div class="mon-row">
          <div class="mon-name">${item.name}</div>
          <div class="mon-bar-wrap">
            <div class="mon-bar" style="width:${pct}%;background:${color}"></div>
          </div>
          <div class="mon-val" style="color:${color}">${Math.round(item.w)} W</div>
        </div>`;
    }).join('');
  }
}

class NexaPowerFlowCardEditor extends HTMLElement {
  constructor() { super(); this.attachShadow({ mode: 'open' }); }
  setConfig(config) { this._config = { ...config }; this._render(); }
  set hass(hass) { this._hass = hass; if (this._form) this._form.hass = hass; }

  _render() {
    if (!this._hass) return;
    const form = document.createElement('ha-form');
    form.hass = this._hass;
    form.data = this._config || {};
    form.computeLabel = s => s.label;
    form.schema = [
      { name: 'solar',             label: '☀️  Solar Power (W)',           selector: { entity: {} } },
      { name: 'solar_day',         label: '☀️  Solar Heute (kWh)',          selector: { entity: {} } },
      { name: 'grid',              label: '⚡  Netz Power (W)',              selector: { entity: {} } },
      { name: 'house_day',         label: '🏠  Haus Heute (kWh)',            selector: { entity: {} } },
      { name: 'battery_soc',       label: '🔋  Speicher SoC (%)',            selector: { entity: {} } },
      { name: 'battery_discharge', label: '🔋  Speicher Power (W)',          selector: { entity: {} } },
      { name: 'autarky_entity',    label: '🌀  Autarkiegrad (%)',            selector: { entity: {} } },
      { name: 'line_style', label: '〰️  Linienstil', selector: { select: { options: [
        { value: 'curved',   label: '🌀  Kurven' },
        { value: 'straight', label: '📏  Gerade' },
        { value: 'diagonal', label: '↗️  Diagonal' },
        { value: 'rounded',  label: '🔲  Gebogen' },
        { value: 'dashed',   label: '- -  Gestrichelt' },
      ]}}},
      { name: 'line_width', label: '📐  Linienstärke (Standard: 12)',            selector: { number: { min: 4,   max: 24,    step: 1,   mode: 'slider' } } },
      { name: 'line_speed', label: '💨  Geschwindigkeit (1=langsam, 5=schnell)', selector: { number: { min: 0.5, max: 5,     step: 0.5, mode: 'slider' } } },
      { name: 'background_color',  label: '🎨  Hintergrundfarbe (leer = Theme)', selector: { color_rgb: {} } },
      { name: 'text_color',        label: '✏️  Schriftfarbe (leer = Theme)',     selector: { color_rgb: {} } },
      { name: 'label_color',       label: '🏷️  Label-Farbe (leer = Theme)',     selector: { color_rgb: {} } },
      { name: 'color_solar',       label: '☀️  Farbe Solar (Fluss)',             selector: { color_rgb: {} } },
      { name: 'color_house',       label: '🏠  Farbe Haus',                      selector: { color_rgb: {} } },
      { name: 'color_bat',         label: '🔋  Farbe Batterie',                  selector: { color_rgb: {} } },
      { name: 'color_grid_import', label: '⚡  Farbe Netz (Bezug)',              selector: { color_rgb: {} } },
      { name: 'color_grid_export', label: '⚡  Farbe Netz (Einsp.)',             selector: { color_rgb: {} } },
      { name: 'meter_normal_power',label: '📊  Gesamtverbrauch Entity',          selector: { entity: {} } },
      { name: 'max_watts',         label: '📊  Max. Watt (Gesamtbalken)',        selector: { number: { min: 100, max: 20000, step: 100, mode: 'box' } } },
    ];

    form.addEventListener('value-changed', ev => {
      ev.stopPropagation();
      this._config = { ...ev.detail.value };
      this.dispatchEvent(new CustomEvent('config-changed', { detail: { config: this._config }, bubbles: true, composed: true }));
    });

    this.shadowRoot.innerHTML = '';
    this.shadowRoot.appendChild(form);
    this._form = form;
  }
}

customElements.define('nexa-power-flow-card', NexaPowerFlowCard);
customElements.define('nexa-power-flow-card-editor', NexaPowerFlowCardEditor);
window.customCards = window.customCards || [];
window.customCards.push({ type: 'nexa-power-flow-card', name: 'Nexa Power Flow TOTAL', preview: true });
