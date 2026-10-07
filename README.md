# Drummer Cat

Кликер от первого лица: кот идёт вдоль стола и сбивает лапой всё, что на нём стоит. Шесть котов со своими стилями удара, шесть наборов предметов (кухня, рабочий стол, гостиная, космобаза, школа магии, кабинет детектива). Браузер + Telegram Mini App, вся графика — SVG. Техническое задание: [SPEC.md](SPEC.md).

## Запуск

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # vitest: TPS-метр и движок
npm run build      # dist/ — статический бандл
npm run preview    # локальный просмотр dist/
```

Требуется Node 20+.

## Деплой на GitHub Pages

Деплой автоматический: workflow `.github/workflows/deploy.yml` на каждый push в `main` ставит зависимости, гоняет тесты, собирает `dist/` и публикует его на GitHub Pages. Сайт: `https://isoer.github.io/drummer-cat/`.

Что нужно один раз:

1. В репозитории открыть **Settings → Pages**, в блоке **Build and deployment** выбрать **Source: GitHub Actions**.
2. Запушить `main`. Прогресс виден во вкладке **Actions**, ссылка на сайт появится в job `deploy`.

Запустить вручную можно из вкладки Actions кнопкой **Run workflow**. `base: './'` в `vite.config.ts` делает все пути относительными, поэтому сборка работает и в подкаталоге `/drummer-cat/`, и на любом другом статическом хостинге.

## Подключение к Telegram

1. В [@BotFather](https://t.me/BotFather) создать бота (`/newbot`).
2. `/newapp` → выбрать бота → указать URL сайта `https://isoer.github.io/drummer-cat/`. Либо `/setmenubutton` → URL — кнопка меню в чате с ботом.
3. На шаге с фото загрузить `promo/miniapp-cover-640x360.png` (BotFather требует ровно 640×360). Там же лежат версия 1280×720 и исходник `miniapp-cover.svg`.
4. Открыть Mini App в Telegram. Код бота не нужен: прогресс хранится в `CloudStorage` и `localStorage`.

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

1. Палитра, имя, стиль удара (`strike`) и головной убор (`accessory`, опционально) — в `src/content/cats.ts`. Шапки рисуются в `accessory()` в `src/render/portrait.ts`.
2. Лапа — `<symbol id="paw-<id>" viewBox="0 0 240 320" overflow="visible">` в `src/content/svg/paws.svg`.
3. Портрет рисуется параметрически в `src/render/portrait.ts` по палитре; особые отметины — в функции `markings`.

## Как добавить стиль удара

Стили лежат в `src/content/strikes.ts`. Стиль задаёт позу замаха `raised(power)`, кадры удара `swing(power, from)` и возврата `back(power, to)`, траекторию сноса `knock(power)`, точку удара, угол линий скорости и когтей, множитель тряски. `power` от 0 до 1 растёт с уровнем ярости (`powerOf(level)`). Удар должен начинаться с кадра `from`, а возврат заканчиваться кадром `to` — это проверяют тесты в `tests/strikes.test.ts`.
