/** Title screen, pause menu, settings and controls help. Short plain copy. */
import type { QualityPref, Settings, WeatherPref } from '../core/SaveService';
import { LOGO_SVG } from './icons';

export interface MenuCallbacks {
  ride(): void;
  resume(): void;
  quitToTitle(): void;
  settingsChanged(s: Settings, needsReload: boolean): void;
  editControls(): void;
  resetProgress(): void;
}

function btn(label: string, primary = false, id = ''): string {
  return `<button class="btn${primary ? ' primary' : ''}" ${id ? `data-act="${id}"` : ''}><span>${label}</span></button>`;
}

export class Menus {
  readonly root = document.createElement('div');
  private readonly title = document.createElement('div');
  private readonly pause = document.createElement('div');
  private readonly settingsEl = document.createElement('div');
  private readonly help = document.createElement('div');
  private readonly rotate = document.createElement('div');
  private back: 'title' | 'pause' = 'title';

  constructor(
    private settings: Settings,
    private readonly cb: MenuCallbacks,
    private readonly touch: boolean,
  ) {
    this.title.className = 'screen on';
    this.title.innerHTML = `${LOGO_SVG}<div class="tagline label">RIDE · HUNT · EXECUTE · DISAPPEAR</div>
      <div class="menu">${btn('RIDE', true, 'ride')}${btn('SETTINGS', false, 'settings')}${btn('CONTROLS', false, 'help')}</div>`;
    this.pause.className = 'screen';
    this.pause.innerHTML = `<div class="panel" style="text-align:center"><h2>PAUSED</h2>
      <div class="menu" style="flex-direction:column;align-items:center">${btn('RESUME', true, 'resume')}${btn('SETTINGS', false, 'settings')}${btn('CONTROLS', false, 'help')}${btn('QUIT TO TITLE', false, 'quit')}</div></div>`;
    this.settingsEl.className = 'screen';
    this.help.className = 'screen';
    this.help.innerHTML = `<div class="panel"><h2>CONTROLS</h2>
      <div class="keys">
        <b>TOUCH</b><span>Left thumb: steer and throttle (push up), pull back to brake. On foot: move.</span>
        <b></b><span>FIRE hold to shoot with aim assist. SLASH for the katana. JUMP to leap off or remount. DRIFT hold to slide.</span>
        <b></b><span>Drag the right side to look around. Tap the phone to answer.</span>
        <b>W A S D</b><span>Ride and run</span>
        <b>SHIFT</b><span>Drift</span>
        <b>SPACE / CLICK</b><span>Fire (mouse aims)</span>
        <b>K / RIGHT CLICK</b><span>Katana</span>
        <b>E</b><span>Jump off at speed, step off, remount</span>
        <b>ENTER</b><span>Answer the phone</span>
        <b>ARROWS</b><span>Look left and right</span>
        <b>ESC</b><span>Pause</span>
        <b>F3</b><span>Debug overlay</span>
        <b>GAMEPAD</b><span>Left stick steer, RT throttle, LT brake, RB fire, A jump, B katana, Y answer, LB drift</span>
      </div>
      <div class="keys" style="margin-top:12px">
        <b>KILLS</b><span>Gunned down x1.0, Blade work x1.5, Crashed out x1.6, Roof strike x2.0. Each civilian car you destroy costs $2,000.</span>
        <b>WHEELS</b><span>Cut a wheel at speed and the car spins out. Crash it into something to finish it.</span>
        <b>ROOF</b><span>Leap off the bike above ${'170 km/h'.replace('170', '77')} onto the car, then strike before the ring runs out.</span>
      </div>
      <div class="menu">${btn('BACK', true, 'back')}</div></div>`;
    this.rotate.className = 'rotate';
    this.rotate.textContent = 'TURN YOUR PHONE SIDEWAYS';
    this.root.append(this.title, this.pause, this.settingsEl, this.help, this.rotate);
    this.renderSettings();
    this.root.addEventListener('click', (e) => this.click(e));
  }

  private click(e: Event): void {
    const t = (e.target as HTMLElement).closest('[data-act]') as HTMLElement | null;
    if (!t) return;
    const act = t.dataset.act;
    switch (act) {
      case 'ride':
        this.showOnly(null);
        this.cb.ride();
        break;
      case 'resume':
        this.showOnly(null);
        this.cb.resume();
        break;
      case 'settings':
        this.back = this.pause.classList.contains('on') ? 'pause' : 'title';
        this.showOnly(this.settingsEl);
        break;
      case 'help':
        this.back = this.pause.classList.contains('on') ? 'pause' : 'title';
        this.showOnly(this.help);
        break;
      case 'back':
        this.showOnly(this.back === 'pause' ? this.pause : this.title);
        break;
      case 'quit':
        this.showOnly(this.title);
        this.cb.quitToTitle();
        break;
      case 'edit':
        this.showOnly(null);
        this.cb.editControls();
        break;
      case 'reset':
        this.cb.resetProgress();
        break;
      default:
        break;
    }
  }

  private showOnly(s: HTMLElement | null): void {
    for (const e of [this.title, this.pause, this.settingsEl, this.help]) e.classList.toggle('on', e === s);
  }

  get open(): boolean {
    return [this.title, this.pause, this.settingsEl, this.help].some((e) => e.classList.contains('on'));
  }

  showPause(): void {
    this.showOnly(this.pause);
  }

  showTitle(): void {
    this.showOnly(this.title);
  }

  hide(): void {
    this.showOnly(null);
  }

  private renderSettings(): void {
    const s = this.settings;
    const sel = (id: string, opts: [string, string][], v: string): string =>
      `<select data-set="${id}">${opts.map(([k, l]) => `<option value="${k}"${k === v ? ' selected' : ''}>${l}</option>`).join('')}</select>`;
    const range = (id: string, v: number): string => `<input type="range" min="0" max="1" step="0.05" value="${v}" data-set="${id}">`;
    const check = (id: string, v: boolean): string => `<input type="checkbox" data-set="${id}"${v ? ' checked' : ''}>`;
    this.settingsEl.innerHTML = `<div class="panel"><h2>SETTINGS</h2>
      <div class="row"><span>Graphics</span>${sel('quality', [['auto', 'Auto'], ['low', 'Low'], ['medium', 'Medium'], ['high', 'High']], s.quality)}</div>
      <div class="row"><span>Weather</span>${sel('weather', [['auto', 'Random'], ['clear', 'Always clear'], ['rain', 'Always rain']], s.weather)}</div>
      <div class="row"><span>Pause the clock</span>${check('pauseClock', s.pauseClock)}</div>
      <div class="row"><span>Master volume</span>${range('master', s.master)}</div>
      <div class="row"><span>Music</span>${range('music', s.music)}</div>
      <div class="row"><span>Effects</span>${range('sfx', s.sfx)}</div>
      <div class="row"><span>Haptics</span>${check('haptics', s.haptics)}</div>
      ${this.touch ? '' : `<div class="row"><span>Ambient occlusion (high only)</span>${check('ao', s.ao)}</div>`}
      <div class="row"><span>Debug overlay</span>${check('showDebug', s.showDebug)}</div>
      ${this.touch ? `<div class="row"><span>Touch buttons</span>${btn('MOVE BUTTONS', false, 'edit')}</div>` : ''}
      <div class="row"><span>Progress</span>${btn('RESET SAVE', false, 'reset')}</div>
      <div class="menu">${btn('BACK', true, 'back')}</div></div>`;
    this.settingsEl.querySelectorAll('[data-set]').forEach((node) => {
      node.addEventListener('change', () => this.readSettings());
      node.addEventListener('input', () => this.readSettings());
    });
  }

  private readSettings(): void {
    const s = { ...this.settings };
    let reload = false;
    this.settingsEl.querySelectorAll<HTMLInputElement | HTMLSelectElement>('[data-set]').forEach((n) => {
      const k = n.dataset.set as keyof Settings;
      if (n instanceof HTMLInputElement && n.type === 'checkbox') {
        if (k === 'ao' && s.ao !== n.checked) reload = true;
        (s[k] as boolean) = n.checked;
      }
      else if (n instanceof HTMLInputElement && n.type === 'range') (s[k] as number) = parseFloat(n.value);
      else if (k === 'quality') {
        if (s.quality !== n.value) reload = true;
        s.quality = n.value as QualityPref;
      } else if (k === 'weather') s.weather = n.value as WeatherPref;
    });
    this.settings = s;
    this.cb.settingsChanged(s, reload);
  }
}
