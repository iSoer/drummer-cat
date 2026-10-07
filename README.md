# Drummer Cat

Кликер от первого лица: кот идёт вдоль стола и сбивает лапой всё, что на нём стоит. Браузер + Telegram Mini App, вся графика — SVG. Техническое задание: [SPEC.md](SPEC.md).

## Запуск

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # vitest: TPS-метр и движок
npm run build      # dist/ — статический бандл
npm run preview    # локальный просмотр dist/
```

Требуется Node 20+.

## Деплой

Собранный `dist/` — обычная статика, работает с любого HTTPS-хостинга (GitHub Pages, Vercel, Cloudflare Pages). `base: './'` в `vite.config.ts` позволяет класть сборку в подкаталог.

## Подключение к Telegram

1. В [@BotFather](https://t.me/BotFather) создать бота (`/newbot`).
2. `/newapp` → выбрать бота → указать URL сборки. Либо `/setmenubutton` → URL — кнопка меню в чате с ботом.
3. Открыть Mini App в Telegram. Код бота не нужен: прогресс хранится в `CloudStorage` и `localStorage`.

## Структура

```
src/
  core/       логика: TPS-метр, движок, стор (без DOM)
  render/     SVG-сцена, лапа, предмет, портрет, эффекты, HUD
  content/    коты, наборы предметов, SVG-спрайты
  ui/         шторка, выбор скинов, настройки
  platform/   Telegram, хранилище, хаптика, звук
  styles/     CSS
tests/        юнит-тесты логики
```

## Как добавить предмет

1. Нарисовать `<symbol id="obj-<id>" viewBox="0 0 200 200">` в `src/content/svg/<набор>.svg`: предмет стоит на линии y=180, обводка 4px `#1F1A17`. Слои повреждений — группы со `style="display:var(--dmgN,none)"`, N от 1 до `hp-1`.
2. Добавить запись в `src/content/sets/<набор>.ts`: `hp`, `weight`, `size`, `hitText`, `sfx`, `color` (цвет осколков), `breakable`.

## Как добавить кота

1. Палитра и имя — в `src/content/cats.ts`.
2. Лапа — `<symbol id="paw-<id>" viewBox="0 0 240 320" overflow="visible">` в `src/content/svg/paws.svg`.
3. Портрет рисуется параметрически в `src/render/portrait.ts` по палитре; особые отметины — в функции `markings`.
