// ╔══════════════════════════════════════════════════════════╗
// ║  NEXA-POWER-FLOW-CARD  v9.8  —  COLOR SETTINGS UPDATE    ║
// ╚══════════════════════════════════════════════════════════╝

class NexaPowerFlowCard extends HTMLElement {
  constructor() { 
    super(); 
    this.attachShadow({ mode: 'open' }); 
  }
  
  static getConfigElement() { return document.createElement('nexa-power-flow-card-editor'); }

  setConfig(config) { this._config = config; }
  set hass(hass) { this._hass = hass; this._render(); }

  _num(id) { 
    if (!id || !this._hass || !this._hass.states[id]) return 0;
    const s = this._hass.states[id].state;
    return (s === undefined || s === null || isNaN(s)) ? 0 : parseFloat(s); 
  }
  
  _render() {
    if (!this._hass || !this._config) return; 
    const C = this._config; 
    
    // Hintergrundfarbe aus Config oder Standardwert
    const bgColor = C.background_color || '#f4f4f4';

    const solar = Math.round(this._num(C.solar));
    const grid = Math.round(this._num(C.grid));
    const bat_pwr = Math.abs(Math.round(this._num(C.battery_discharge))); 
    const house = Math.round(bat_pwr + grid);
    const solar_day = this._num(C.solar_day);
    const house_day = this._num(C.house_day);
    const soc = Math.round(this._num(C.battery_soc));

    const gridColor = grid >= 0 ? '#448aff' : '#2ecc71'; 
    const gridDir = grid >= 0 ? 'normal' : 'reverse';

    this.shadowRoot.innerHTML = `
<style>
  ha-card { background: ${bgColor}; border-radius: 24px; padding: 20px; color: #333; font-family: sans-serif; overflow: hidden; transition: background 0.5s ease; }
  .grid-container { display: grid; grid-template-columns: 1fr 1fr; gap: 80px 100px; position: relative; z-index: 2; }
  .node { text-align: center; display: flex; flex-direction: column; align-items: center; z-index: 3; }
  .icon { --mdc-icon-size: 54px; width: 54px; height: 54px; color: var(--p-color); }
  .label { font-size: 10px; opacity: 0.6; text-transform: uppercase; margin-top: 2px; }
  .val { font-size: 24px; font-weight: 800; line-height: 1; margin-top: 4px; color: #111; }
  .unit { font-size: 13px; opacity: 0.7; }
  .daily-total { font-size: 10px; margin-top: 5px; padding: 2px 8px; background: rgba(0,0,0,0.06); border-radius: 8px; font-weight: 600; }
  .sub-val { font-size: 12px; margin-top: 2px; font-weight: 600; }
  .flow-svg { position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 1; pointer-events: none; }
  .line { fill: none; stroke-width: 4; stroke-dasharray: 10 14; animation: flow 3s linear infinite; opacity: 0.5; stroke-linecap: round; }
  @keyframes flow { to { stroke-dashoffset: -48; } }
</style>
<ha-card>
  <svg class="flow-svg" viewBox="0 0 400 320">
    <path d="M 70,50 C -10,100 -10,200 70,250" class="line" stroke="#f1c40f" style="${solar > 10 ? '' : 'display:none'}"/>
    <path d="M 130,265 Q 200,295 270,265" class="line" stroke="#2ecc71" style="${bat_pwr > 5 ? '' : 'display:none'}"/>
    <path d="M 330,50 C 410,100 410,200 330,250" class="line" stroke="${gridColor}" style="${grid != 0 ? '' : 'display:none'}; animation-direction: ${gridDir}"/>
  </svg>
  <div class="grid-container">
    <div class="node" style="--p-color: #f39c12"><ha-icon class="icon" icon="mdi:solar-power-variant"></ha-icon><div class="label">Solar</div><div class="val">${solar}<span class="unit">W</span></div><div class="daily-total">Heute: ${solar_day.toFixed(2)} kWh</div></div>
    <div class="node" style="--p-color: #2980b9"><ha-icon class="icon" icon="mdi:transmission-tower"></ha-icon><div class="label">Netz</div><div class="val">${Math.abs(grid)}<span class="unit">W</span></div><div class="sub-val" style="color:${gridColor}">${grid >= 0 ? 'Bezug' : 'Einspeisung'}</div></div>
    <div class="node" style="--p-color: #27ae60"><ha-icon class="icon" icon="mdi:battery-charging-100"></ha-icon><div class="label">Speicher</div><div class="val">${soc}<span class="unit">%</span></div><div class="sub-val">${bat_pwr} W</div></div>
    <div class="node" style="--p-color: #e67e22"><ha-icon class="icon" icon="mdi:home-lightning-bolt"></ha-icon><div class="label">Haus</div><div class="val">${house}<span class="unit">W</span></div><div class="daily-total">Heute: ${house_day.toFixed(2)} kWh</div></div>
  </div>
</ha-card>`;
  }
}

class NexaPowerFlowCardEditor extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  setConfig(config) {
    this._config = { ...config };
    this._render();
  }

  set hass(hass) {
    this._hass = hass;
    if (this._form) this._form.hass = hass;
  }

  _render() {
    if (!this._hass) return;

    const form = document.createElement('ha-form');
    form.hass = this._hass;
    form.data = this._config || {};
    form.computeLabel = s => s.label;
    
    form.schema = [
      { name: 'solar', label: '☀️ Solar Power (W)', selector: { entity: {} } },
      { name: 'solar_day', label: '☀️ Solar Heute (kWh)', selector: { entity: {} } },
      { name: 'grid', label: '⚡ Netz Power (W)', selector: { entity: {} } },
      { name: 'house_day', label: '🏠 Haus Heute (kWh)', selector: { entity: {} } },
      { name: 'battery_soc', label: '🔋 Speicher SoC (%)', selector: { entity: {} } },
      { name: 'battery_discharge', label: '🔋 Speicher Power (W)', selector: { entity: {} } },
      { name: 'background_color', label: '🎨 Hintergrundfarbe (Hex oder Name)', selector: { text: {} } },
    ];

    form.addEventListener('value-changed', ev => {
      ev.stopPropagation();
      this._config = { ...ev.detail.value };
      this.dispatchEvent(new CustomEvent('config-changed', {
        detail: { config: this._config },
        bubbles: true,
        composed: true,
      }));
    });

    this.shadowRoot.innerHTML = '';
    this.shadowRoot.appendChild(form);
    this._form = form;
  }
}

customElements.define('nexa-power-flow-card', NexaPowerFlowCard);
customElements.define('nexa-power-flow-card-editor', NexaPowerFlowCardEditor);

window.customCards = window.customCards || [];
window.customCards.push({
  type: 'nexa-power-flow-card',
  name: 'Nexa Power Flow TOTAL',
  preview: true
});
