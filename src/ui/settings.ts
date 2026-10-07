export interface SettingsState {
  sound: boolean;
  haptics: boolean;
  bestTps: number;
  hits: number;
  userName?: string;
}

export interface SettingsCallbacks {
  onSound(v: boolean): void;
  onHaptics(v: boolean): void;
  onReset(): void;
}

function toggle(id: string, label: string, checked: boolean): string {
  return `
    <label class="toggle">
      <span class="toggle__label">${label}</span>
      <input class="toggle__input" type="checkbox" id="${id}" ${checked ? 'checked' : ''}/>
      <span class="toggle__switch"></span>
    </label>`;
}

/** Содержимое шторки «Настройки». */
export function buildSettingsPanel(state: SettingsState, cb: SettingsCallbacks): HTMLElement {
  const el = document.createElement('div');
  el.className = 'settings';
  const greet = state.userName ? `<p class="settings__greet">Привет, ${state.userName}!</p>` : '';
  el.innerHTML = `
    ${greet}
    ${toggle('opt-sound', 'Звук', state.sound)}
    ${toggle('opt-haptics', 'Вибрация', state.haptics)}
    <dl class="stats">
      <div class="stats__row"><dt>Всего ударов</dt><dd>${new Intl.NumberFormat('ru-RU').format(state.hits)}</dd></div>
      <div class="stats__row"><dt>Рекорд темпа</dt><dd>${state.bestTps.toFixed(1)} уд/с</dd></div>
    </dl>
    <button class="btn btn--danger" type="button" id="btn-reset">Сбросить прогресс</button>
    <p class="settings__version">Drummer Cat v${__APP_VERSION__}</p>`;

  (el.querySelector('#opt-sound') as HTMLInputElement).addEventListener('change', (e) => cb.onSound((e.target as HTMLInputElement).checked));
  (el.querySelector('#opt-haptics') as HTMLInputElement).addEventListener('change', (e) => cb.onHaptics((e.target as HTMLInputElement).checked));

  const reset = el.querySelector('#btn-reset') as HTMLButtonElement;
  let armed = false;
  let timer: ReturnType<typeof setTimeout> | null = null;
  reset.addEventListener('click', () => {
    if (!armed) {
      armed = true;
      reset.textContent = 'Точно? Нажми ещё раз';
      reset.classList.add('btn--armed');
      timer = setTimeout(() => {
        armed = false;
        reset.textContent = 'Сбросить прогресс';
        reset.classList.remove('btn--armed');
      }, 3000);
      return;
    }
    if (timer) clearTimeout(timer);
    armed = false;
    reset.textContent = 'Сброшено';
    reset.classList.remove('btn--armed');
    reset.disabled = true;
    cb.onReset();
  });
  return el;
}
