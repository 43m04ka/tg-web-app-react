# Обновление API импорта/экспорта товаров

## Краткое описание изменений

Переведены компоненты загрузки и импорта карт на новые API endpoints согласно спецификации:
- **Импорт**: `POST /api/product/import` (multipart/form-data)
- **Экспорт**: `POST /api/product/export` (application/json)

---

## Измененные файлы

### 1. `src/pages/AdminPanel/Blocks/ExcelReader.jsx`
**Что изменилось:**
- ✅ Убран парсинг Excel на клиенте (XLSX библиотека)
- ✅ Файл теперь передается напрямую на сервер
- ✅ Добавлена валидация:
  - Проверка расширения файла (.xlsx, .xls только)
  - Проверка размера файла (макс 50 МБ)
- ✅ Компонент передает только File объект, не JSON

**Было:**
```javascript
// Парсил Excel локально с помощью XLSX
const wb = await XLSX.read(b_str, {type: 'array', bookVBA: true});
const data = XLSX.utils.sheet_to_json(ws);
await setButtonTable(data) // JSON data
```

**Стало:**
```javascript
// Передает файл как-есть
setButtonTable({file: files[0]}); // File object
```

---

### 2. `src/pages/AdminPanel/Tabs/EditCards/UploadData/UploadData.jsx`
**Что изменилось:**
- ✅ Переход на новый API endpoint: `/api/product/import`
- ✅ Использование `multipart/form-data` вместо `application/json`
- ✅ Добавлена обработка response с результатами импорта:
  - `successCount` - количество успешно импортированных товаров
  - `errorCount` - количество ошибок
  - `errors` - массив ошибок с номерами строк
- ✅ Удалена логика пакетной обработки (батчирование)
- ✅ Удалены неиспользуемые параметры (catalogId, gameType и т.д.)
- ✅ Добавлено отображение результатов импорта с ошибками

**Старый поток:**
```
Excel → XLSX парсинг (клиент)
→ Обработка (округление, теги, языки)
→ Батчирование по 20 карт
→ POST /uploadCards (старый endpoint)
→ authenticationData в body
```

**Новый поток:**
```
Excel → Валидация (расширение, размер)
→ POST /api/product/import (FormData)
→ Сервер парсит и обрабатывает
→ Response: {message, successCount, errorCount, errors}
→ Отображение результатов
```

**Новый код:**
```javascript
const importProductsFromExcel = async (excelFile) => {
    const formData = new FormData();
    formData.append('file', excelFile);

    const response = await fetch(`${API_BASE_URL}/api/product/import`, {
        method: 'POST',
        body: formData  // No headers needed - browser sets multipart/form-data
    })

    const result = await response.json()
    // {message, successCount, errorCount, errors: [{row, error}]}
}
```

---

### 3. `src/pages/AdminPanel/Tabs/EditCards/ExportData/ExportData.jsx` (новый файл)
**Назначение:** Компонент экспорта товаров в Excel

**Функционал:**
- Выбор каталога для экспорта
- Вызов API: `POST /api/product/export`
- Автоматическое скачивание файла `products_timestamp.xlsx`

**Код:**
```javascript
const response = await fetch(`${API_BASE_URL}/api/product/export`, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({ catalogId: catalogId })
})

const blob = await response.blob();
const url = window.URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = `products_${Date.now()}.xlsx`;
a.click();
```

---

### 4. `src/pages/AdminPanel/Tabs/EditCards/EditCards.jsx`
**Что изменилось:**
- ✅ Импорт нового компонента `ExportData`
- ✅ Добавлено состояние `exportCard` для управления модалкой
- ✅ Добавлена вторая кнопка "Экспортировать" рядом с "Импортировать"
- ✅ Текст кнопки "Загрузить" переименован на "Импортировать" для ясности

**Изменения в UI:**
```javascript
<div className={style['buttonUpload']} onClick={() => setExportCard(true)}>
    <p>Экспортировать</p>
</div>
<div className={style['buttonUpload']} onClick={() => setUploadCard(true)}>
    <p>Импортировать</p>
</div>
```

---

## API Endpoints (используются в коде)

### Импорт товаров
**Endpoint:** `POST /api/product/import`

**Request:**
```
Content-Type: multipart/form-data
file: <Excel файл>
```

**Response:**
```json
{
    "message": "Импорт завершен",
    "successCount": 150,
    "errorCount": 2,
    "errors": [
        { "row": 5, "error": "Ошибка валидации" },
        { "row": 10, "error": "Некорректный формат" }
    ]
}
```

### Экспорт товаров
**Endpoint:** `POST /api/product/export`

**Request:**
```json
{
    "catalogId": 1
}
```

**Response:**
- Binary: Excel файл (products_timestamp.xlsx)
- Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet

---

## Особенности новой реализации

### ✅ Плюсы
1. **Сервер-сайдная обработка** - надежнее, точнее, безопаснее
2. **Автоматическое преобразование** - плоский Excel → вложенные объекты
3. **Детальная обработка ошибок** - каждая ошибка с номером строки
4. **Меньше кода на клиенте** - убрана вся логика обработки
5. **Меньше трафика** - парсинг не на клиенте
6. **Масштабируемость** - легко добавить фильтры, валидацию на сервере

### 🔧 Удаленные функции
- ❌ Батчирование по 20 карт (делается на сервере)
- ❌ Обработка данных (округление, языки, теги) - теперь на сервере
- ❌ Локальный парсинг XLSX - используется встроенная валидация FormData
- ❌ Выбор типа карты и каталога в модалке импорта
- ❌ Использование authenticationData в API

---

## Миграция завершена! ✨

Все компоненты обновлены и готовы к использованию новых API endpoints.

**URL Base:** `https://gwstorebot.ru` (из `API_BASE_URL`)

**Использующиеся endpoints:**
- `/api/product/import` - импорт товаров
- `/api/product/export` - экспорт товаров
