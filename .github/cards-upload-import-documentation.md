# Документация: Загрузка и Импорт Карт в Админ-панели

## Обзор архитектуры

Система загрузки/импорта карт состоит из следующих компонентов:
1. **UI компоненты** - интерфейс для выбора файла и конфигурации
2. **Excel Reader** - парсер Excel файлов
3. **Upload Logic** - логика обработки и отправки данных
4. **API endpoints** - backend endpoints для обработки

---

## 1. Главная страница админ-панели

### Файл: `src/pages/AdminPanel/AdminPanel.jsx`
**Назначение:** Основная навигация и маршрутизация админ-панели

```javascript
// Маршруты админ-панели включают:
const routeData = [
    {name: 'Редактировать каталоги', path: 'edit-directories', element: <EditDirectories/>},
    {name: 'Редактировать карты', path: 'edit-cards', element: <AP_EditCards/>}, // ← ГЛАВНЫЙ МАРШРУТ
    {name: 'Структура', path: 'structure', element: <EditCatalogs/>},
    // ... другие маршруты
];
```

---

## 2. Главный компонент редактирования карт

### Файл: `src/pages/AdminPanel/Tabs/EditCards/EditCards.jsx`
**Назначение:** Основной компонент для управления карточками

**Основные функции:**
- Отображение таблицы карт
- Поиск по названию карт
- Кнопка "Загрузить" для открытия модального окна загрузки
- Редактирование отдельных карт
- Изменение статуса (в продаже/не в продаже)

```javascript
// Основная структура:
const [cardList, setCardList] = useState([])
const [uploadCard, setUploadCard] = useState(false); // управление видимостью модалки
const [editTabOpen, setEditTabOpen] = useState(false);
const [cardId, setCardId] = React.useState(-1);

// При клике на "Загрузить":
onClick={() => {
    setUploadCard(true); // открывает модальное окно UploadData
}}

// Отображение компонента загрузки:
{uploadCard ? <UploadData 
    onClose={() => {setUploadCard(false);}} 
    onReload={() => searchForName(setCardList, searchInputValue).then()} // перезагрузка списка
/> : ''}
```

---

## 3. Модальное окно загрузки

### Файл: `src/pages/AdminPanel/Tabs/EditCards/UploadData/UploadData.jsx`
**Назначение:** Модальное окно с опциями загрузки и парсингом Excel

**Основные параметры:**
```javascript
const UploadData = ({onClose, onReload}) => {
    const [gameType, setGameType] = useState('OTHER') // тип карты по умолчанию
    const [selectedCatalogId, setSelectedCatalogId] = useState(catalogList[0].id);
    const [onLoad, setOnLoad] = useState(false) // статус загрузки
    const [left, setLeft] = useState(0) // счетчик оставшихся карт
    const [table, setTable] = useState(null) // распарсенные данные из Excel
}
```

**Типы карт (по умолчанию):**
```javascript
const typeList = [
    {name: 'Не выбрано (без пометки)', type: 'OTHER'},
    {name: 'Игра', type: 'GAME'},
    {name: 'Подписка', type: 'SUBSCRIPTION'},
    {name: 'Аддон', type: 'ADD_ON'},
    {name: 'Кoд', type: 'CODE'},
    {name: 'Донат', type: 'DONATION'},
]
```

**Основной процесс загрузки:**
```javascript
const setButtonTableClassic = async (cardList) => {
    // 1. Обработка каждой карты:
    cardList.map(card => {
        card.serialNumber = lastSerialNumber + 1
        
        // Округление цен
        card.price = Math.round(card.price);
        card.oldPrice = Math.round(card.oldPrice);
        card.priceInOtherCurrency = Math.round(card.priceInOtherCurrency);
        
        // Назначение каталога и типа
        card.catalogId = selectedCatalogId
        card.type = card.type || gameType
        
        // Обработка bubbles (разделенные запятыми)
        card.bubbles = card.bubbles ? card.bubbles.split(',') : null
        
        // Обработка языка и озвучки
        if (typeof card.language !== 'undefined' && typeof card.voice !== 'undefined') {
            // ... логика определения языка
        }
    })
    
    // 2. Разделение на батчи по 20 карт:
    let size = 20;
    let subarray = [];
    for (let i = 0; i < Math.ceil(cardList.length / size); i++) {
        subarray[i] = cardList.slice((i * size), (i * size) + size);
    }
    
    // 3. Отправка батчей на сервер:
    setOnLoad(true)
    for (let i = 0; i < subarray.length; i++) {
        await setLeft((subarray.length - i) * 20)
        await uploadCards(authenticationData, subarray[i])
    }
    setOnLoad(false)
}
```

**Функция отправки на сервер:**
```javascript
const uploadCards = async (authenticationData, cardList) => {
    await fetch(URL + '/uploadCards', {
        method: 'POST', 
        headers: {
            'Content-Type': 'application/json',
        }, 
        body: JSON.stringify({
            authenticationData: authenticationData, 
            cardList: cardList
        })
    })
}
```

**URL для текущей загрузки:**
```javascript
const URL = 'https://2ae04a56-b56e-4cc1-b14a-e7bf1761ebd5.selcdn.net'
// Endpoint: /uploadCards
```

---

## 4. Excel Reader (парсер файлов)

### Файл: `src/pages/AdminPanel/Blocks/ExcelReader.jsx`
**Назначение:** Компонент для выбора и парсинга Excel файлов

**Поддерживаемые форматы:**
```javascript
const SheetJSFT = [
    "xlsx", "xlsb", "xlsm", "xls", "xml", "csv", "txt", 
    "ods", "fods", "uos", "sylk", "dif", "dbf", "prn", 
    "qpw", "123", "wb*", "wq*", "html", "htm"
].map(x => "." + x).join(",");
```

**Основной процесс парсинга:**
```javascript
const handleChange = (e) => {
    const files = e.target.files;
    setText(e.target.value.replace('C:\\fakepath\\', ''));

    try {
        const reader = new FileReader();

        reader.onload = async (e) => {
            const b_str = e.target.result;
            // 1. Чтение файла с помощью XLSX
            const wb = await XLSX.read(b_str, {type: 'array', bookVBA: true});
            const ws_name = wb.SheetNames[0];

            const ws = wb.Sheets[ws_name];
            // 2. Преобразование в JSON объекты
            const data = XLSX.utils.sheet_to_json(ws);

            // 3. Передача данных в родительский компонент
            await setButtonTable(data)
        };

        if (files && files[0]) reader.readAsArrayBuffer(files[0]);
    } catch (e) {
        console.log(e)
    }
};
```

**Библиотека:** `xlsx` (SheetJS)

---

## 5. Интеграция с API (useServer)

### Файл: `src/pages/AdminPanel/useServer.js`
**Назначение:** Хук для работы с API эндпоинтами админ-панели

**Основные методы:**
```javascript
// Получение списка карт из каталога
const getCardList = async (setResult, catalogId, listNumber)

// Получение одной карты по ID
const getCard = async (setResult, id)

// Получение списка каталогов
const getCatalogList = async (setResult)

// Удаление карты
const deleteCard = async (setResult, authenticationData, cardId)

// Обновление данных карты
const updateCardData = async (setResult, authenticationData, cardId, updateData)

// Поиск по названию
const searchForName = async (setResult, searchString)

// ... другие методы
```

---

## 6. Глобальное состояние (Zustand)

### Файл: `src/hooks/useGlobalData.js`
**Назначение:** Глобальное состояние приложения с Zustand

**Важные состояния для карт:**
```javascript
const useGlobalData = create(devtools((set, get) => ({
    catalogList: null, // список каталогов
    updateCatalogList: (data, options) => {...},
    
    catalogStructureList: null, // структурированные каталоги
    updateCatalogStructureList: (data) => {...},
    
    mainPageCards: null, // карты на главной странице
    updateMainPageCards: (data) => {...},
    
    pageId: -1, // текущая страница
    setPageId: (pageId) => {...},
})))
```

---

## 7. API Endpoints

### Backend URL
```
Base: https://2ae04a56-b56e-4cc1-b14a-e7bf1761ebd5.selcdn.net
Admin API: https://gwstorebot.ru/api/admin
```

### Эндпоинты для загрузки

**POST `/uploadCards`**
- **Body:** 
```json
{
    "authenticationData": {...},
    "cardList": [{
        "serialNumber": 1,
        "name": "Game Name",
        "price": 999,
        "oldPrice": 1999,
        "priceInOtherCurrency": 50,
        "catalogId": 1,
        "type": "GAME",
        "bubbles": ["tag1", "tag2"],
        "language": "На русском языке",
        "onSale": true
    }, ...]
}
```

**POST `/updateCardData`** (для обновления отдельной карты)
- **Body:**
```json
{
    "authenticationData": {...},
    "cardId": 123,
    "updateData": {
        "onSale": true,
        "price": 999,
        "name": "New Name"
    }
}
```

**GET `/productList`**
- **Query:** `?catalogId={id}&listNumber={number}&time={timestamp}`

**GET `/searchForName`**
- **Query:** `?searchString={query}&time={timestamp}`

---

## 8. Обработка данных из Excel

### Автоматические преобразования:

1. **Numeric Fields** - Округление цен:
```javascript
card.price = Math.round(card.price);
card.oldPrice = Math.round(card.oldPrice);
card.priceInOtherCurrency = Math.round(card.priceInOtherCurrency);
```

2. **Tags/Bubbles** - Преобразование из строки в массив:
```javascript
card.bubbles = card.bubbles ? card.bubbles.split(',') : null
```

3. **Language Processing** - Определение языка:
```javascript
if (lang && voice) {
    card.language = 'На русском языке'
} else if (lang) {
    card.language = 'Русские субтитры (текст)'
} else {
    card.language = 'Без перевода'
}
```

4. **Catalog Assignment** - Автоматическое назначение:
```javascript
card.catalogId = selectedCatalogId
card.type = card.type || gameType // если тип не указан - используется выбранный
```

---

## 9. Процесс загрузки (User Flow)

```
1. Пользователь кликает "Загрузить" на странице EditCards
   ↓
2. Открывается модальное окно UploadData
   ↓
3. Выбирается каталог из DropBox
   ↓
4. Выбирается тип карты (по умолчанию для всех в этом батче)
   ↓
5. Через ExcelReader выбирается Excel файл
   ↓
6. XLSX парсит файл в JSON массив объектов
   ↓
7. Данные хранятся в состоянии table: useState(null)
   ↓
8. При клике "Загрузить":
   - Запускается setButtonTableClassic()
   - Обрабатываются все карты (нормализация данных)
   - Данные разбиваются на батчи по 20 карт
   - Каждый батч отправляется на сервер в /uploadCards
   - Показывается прогресс "Осталось X карт"
   ↓
9. После завершения:
   - Закрывается модалка
   - Обновляется список карт (onReload)
   - Пользователь видит новые карты в таблице
```

---

## 10. Стили и UI

### ExcelReader стили: `src/pages/AdminPanel/Blocks/ExcelReader.module.scss`
### UploadData стили: `src/pages/AdminPanel/Tabs/EditCards/UploadData/UploadData.module.scss`
### EditCards стили: `src/pages/AdminPanel/Tabs/EditCards/EditCards.module.scss`

---

## 11. Компоненты, которые использует UploadData

- **PopUpWindow** - модальное окно
- **DropBox** - выпадающий список для выбора каталога и типа
- **ExcelReader** - компонент выбора файла

---

## 12. Зависимости

```javascript
import React, {useState} from 'react';
import * as XLSX from "xlsx"; // Парсинг Excel
import {create} from 'zustand'; // Состояние
import {devtools} from "zustand/middleware"; // Dev tools для Zustand
import useGlobalData from "../../hooks/useGlobalData"; // Глобальное состояние
import useData from "./useData"; // Данные аутентификации
import PopUpWindow from "../../Elements/PopUpWindow/PopUpWindow";
import DropBox from "../../Elements/DropBox/DropBox";
```

---

## Резюме

**Поток данных:**
```
Excel файл → ExcelReader (XLSX) → JSON объекты → setButtonTableClassic() 
→ Нормализация + обработка → Батчирование (20 карт) 
→ Fetch POST /uploadCards → Сервер
```

**Ключевые точки интеграции:**
1. `UploadData.jsx` - логика и UI управления загрузкой
2. `ExcelReader.jsx` - парсинг Excel файлов
3. `EditCards.jsx` - главный компонент управления карт с кнопкой "Загрузить"
4. Backend endpoint `/uploadCards` - обработка данных на сервере