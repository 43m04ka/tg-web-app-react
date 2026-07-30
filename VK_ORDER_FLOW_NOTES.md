# VK-флоу заказа — заметки перед редизайном

Статус: **логика ВК временно не подключена к новому потоку экранов оплаты**
(см. `FRONTEND_CHANGES.md` / этапы 1–2 из истории изменений заказов). Ничего не удалено,
компоненты оставлены в репозитории как заготовка — они просто больше никем не рендерятся.
Этот файл — шпаргалка по тому, что было и что нужно решить, когда дойдут руки до VK.

---

## Что стало недостижимым и почему

Компоненты:
- `src/pages/Basket/Elements/OrderPage.jsx` (мобильная версия)
- `src/pages/Basket/DesktopBasket/DesktopOrderPage.jsx` (десктоп)

Раньше рендерились как общий fallback-экран «заказ оформлен»:
```jsx
// Basket.jsx (было)
{orderData !== null ? <OrderPage orderData={orderData} /> : ''}

// DesktopBasket.jsx (было)
{orderData !== null && <DesktopOrderPage orderData={orderData} />}
```

После перехода на новый контракт `POST /api/order/create` (см. `FRONTEND_CHANGES.md`) экран,
который показывается пользователю, всегда выбирается явно и сразу вместе с `setOrderData(...)`:
`paymentScreen` принимает одно из значений `waiting` / `accepted` / `success` / `fail`, и один
из этих early-return блоков в начале компонента всегда успевает отработать раньше, чем дошло бы
до старого `{orderData !== null ? <OrderPage .../> : ''}` в самом низу дерева. Поэтому этот блок
теперь мёртв и не выполняется ни при каком сценарии.

---

## Ключевая логика, которую стоит забрать при редизайне VK-флоу

Оба компонента (`OrderPage.jsx` и `DesktopOrderPage.jsx`) почти идентичны:

- **`copyToClipboard(text)`** — копирование текста в буфер с фолбэком через
  `document.execCommand('copy')` для окружений без `navigator.clipboard`.
- **Автокопирование при показе экрана**: `useEffect` на `[stage, isVk, message]` —
  как только доигралась 2-стадийная анимация (`stage === 1`, наступает через 1350мс,
  хаптик-фидбек через 750мс), при `isVk && message` текст заказа сразу копируется в буфер.
- **`handleOpenVkChat()`** — повторно копирует `message`, затем с задержкой 100мс
  открывает `https://vk.com/im?sel=-${vkGroupId}` (`vkGroupId` из `useTelegram()`).
- Экран для VK показывал текст «Данные заказа скопированы» + кнопку «Перейти в чат
  сообщества»; для остальных платформ — текст «свяжется менеджер @gwstore_admin» +
  кнопка поддержки.

Ожидаемая старая форма `orderData`, на которой всё это работало:
```js
{ number, list, summa, message }
```
— `message` был готовым текстом заказа для отправки в VK-чат (собирался на бэкенде).

---

## Что изменилось в контракте и блокирует прямой перенос

Новый ответ `POST /api/order/create` — `{orderId, status, paymentMethod, itemsTotal, discount,
total, paymentUrl}`. Полей `number`, `list`, `message` в нём больше нет вообще — старый механизм
«скопировать текст заказа и отправить в чат сообщества» на бэкенде сейчас ничем не обеспечен.

`sourceData`/`vkGroupId` в остальном по-прежнему прокидываются в заказ:
- `sourceData = { source: 'vk', vkGroupId }` — используется в `Basket.jsx`/`DesktopBasket.jsx`
  для формирования `platform`/`vkGroupId` в теле запроса.
- `orderUsername` для VK строится как
  `` `https://vk.com/im/convo/${user.id} \n${user.first_name} ${user.last_name}` `` — сейчас
  уходит на бэк как `contact`.
- Бэкенд уже валидирует `vkGroupId` через `vkService.resolveCommunityByGroupId` при
  `platform === 'vk'` (см. `orderService.js` в `tg-web-app-server`), то есть транспорт данных
  жив — не хватает только шага «собрать и отдать текст сообщения для копирования».

---

## Вопрос на будущее (не решать сейчас)

Когда будете возвращаться к VK:
1. Либо реанимировать copy-to-clipboard-флоу — тогда бэкенду нужно снова строить и отдавать
   `message` (или аналог) в ответе `/api/order/create` специально для VK-заказов.
2. Либо унифицировать VK с остальными платформами — просто показывать `OrderAccepted`
   (для `split`/`dolyami`) или `PaymentWaiting`/`PaymentSuccessDetails` (для `sbp`) как всем
   остальным, без шага «скопируйте и отправьте в чат сообщества».

Оба компонента (`OrderPage.jsx`, `DesktopOrderPage.jsx`) и их стили не удалены — можно
использовать как основу для варианта 1.
