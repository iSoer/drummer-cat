import { hideBack, showBack } from '../platform/telegram';

/** Сдвиг (px), после которого свайп по заголовку начинает тянуть шторку. */
const DRAG_THRESHOLD = 8;
/** Сдвиг (px), после которого отпускание закрывает шторку. */
const CLOSE_DISTANCE = 80;

/** Нижняя шторка. Одна на приложение; содержимое подменяется. */
export class Sheet {
  private readonly root: HTMLElement;
  private readonly panel: HTMLElement;
  private readonly body: HTMLElement;
  private readonly title: HTMLElement;
  private onCloseCb: (() => void) | null = null;
  private dragStartY: number | null = null;
  private dragPointerId: number | null = null;

  constructor(root: HTMLElement) {
    this.root = root;
    root.innerHTML = `
      <div class="sheet__backdrop"></div>
      <div class="sheet__panel" role="dialog" aria-modal="true">
        <div class="sheet__handle"></div>
        <div class="sheet__head">
          <h2 class="sheet__title"></h2>
          <button class="sheet__close" type="button" aria-label="Закрыть">✕</button>
        </div>
        <div class="sheet__body"></div>
      </div>`;
    this.panel = root.querySelector('.sheet__panel') as HTMLElement;
    this.body = root.querySelector('.sheet__body') as HTMLElement;
    this.title = root.querySelector('.sheet__title') as HTMLElement;
    (root.querySelector('.sheet__backdrop') as HTMLElement).addEventListener('click', () => this.close());
    (root.querySelector('.sheet__close') as HTMLElement).addEventListener('click', () => this.close());
    const handle = root.querySelector('.sheet__handle') as HTMLElement;
    const head = root.querySelector('.sheet__head') as HTMLElement;
    for (const el of [handle, head]) {
      el.addEventListener('pointerdown', (e) => {
        // Кнопки внутри заголовка — не начало свайпа, иначе захват указателя съест их click.
        if ((e.target as Element).closest('button')) return;
        this.dragStartY = e.clientY;
        this.dragPointerId = e.pointerId;
      });
      el.addEventListener('pointermove', (e) => {
        if (this.dragStartY === null || e.pointerId !== this.dragPointerId) return;
        const dy = Math.max(0, e.clientY - this.dragStartY);
        if (dy > DRAG_THRESHOLD && !el.hasPointerCapture(e.pointerId)) el.setPointerCapture(e.pointerId);
        this.panel.style.transform = `translateY(${dy}px)`;
      });
      const end = (e: PointerEvent) => {
        if (this.dragStartY === null || e.pointerId !== this.dragPointerId) return;
        const dy = e.clientY - this.dragStartY;
        this.dragStartY = null;
        this.dragPointerId = null;
        this.panel.style.transform = '';
        if (dy > CLOSE_DISTANCE) this.close();
      };
      el.addEventListener('pointerup', end);
      el.addEventListener('pointercancel', end);
    }
  }

  get isOpen(): boolean {
    return this.root.classList.contains('sheet--open');
  }

  open(title: string, content: HTMLElement, onClose?: () => void): void {
    this.title.textContent = title;
    this.body.replaceChildren(content);
    this.onCloseCb = onClose ?? null;
    this.root.classList.add('sheet--open');
    showBack(() => this.close());
  }

  close(): void {
    if (!this.isOpen) return;
    this.root.classList.remove('sheet--open');
    hideBack();
    const cb = this.onCloseCb;
    this.onCloseCb = null;
    cb?.();
  }
}
