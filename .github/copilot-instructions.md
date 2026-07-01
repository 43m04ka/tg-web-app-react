# Copilot Instructions

## Project Guidelines
- Пользователь предпочитает архитектуру без дублирования состояния и хочет избегать запутанной реализации. Он также хочет сохранять и придерживаться текущего визуального дизайна из предоставленных скриншотов как эталона для дальнейшей верстки.

## API Parsing Endpoints Specification
- **Base prefix**: `/api/parsing`
- **GET** `/api/parsing/processList` — list active parsing processes `[{id, name, progress, text, notification}]`
- **POST** `/api/parsing/setNotificationProcess/:id` — toggle Telegram notification `{notification: true/false}`
- **GET** `/api/parsing/price-rules/:platform` — get price rules for "ps" or "xbox" `[{id, min, max, value, type, commission}]`
- **POST** `/api/parsing/price-rules/:platform` — overwrite price rules `{rules: [{min, max, value, type, commission}]}`
- **POST** `/api/parsing/start-parse-ps` — start PS Store parsing `{catalogId, bdPath, countPages, isShallow, endDataPromotion}`
- **POST** `/api/parsing/start-parse-xbdeals` — start XBDeals parsing `{catalogId, bdPath, countPages, isShallow, endDataPromotion}`
- **POST** `/api/parsing/parse-links-ps` — parse PS Store by direct links `{links: [...], bdPath}`
- **POST** `/api/parsing/parse-links-xbdeals` — parse Xbox Store by direct links `{links: [...], bdPath}`

## API Products Export/Import Specification

### ЭКСПОРТ ТОВАРОВ
- **POST** `/api/product/export` — export catalog as Excel file
  - **Content-Type**: `application/json`
  - **Body**: `{ "catalogId": 1 }`
  - **Response**: Excel file (products_timestamp.xlsx) with flat format (profile.name, profile.age, etc.)

### ИМПОРТ ТОВАРОВ
- **POST** `/api/product/import` — import products from Excel file
  - **Content-Type**: `multipart/form-data`
  - **Form data**: `file: <Excel file>`
  - **Response**: `{ "message": "Импорт завершен", "successCount": 150, "errorCount": 2, "errors": [{ "row": 5, "error": "Ошибка валидации" }] }`

### Features:
- Flat Excel automatically converts to nested objects (profile.name → profile: {name})
- Data types preserved (numbers, dates, boolean)
- Arrays in Excel stored as JSON strings
- If ID exists — updates, otherwise creates
- Max file size: 50 МБ
- Allowed formats: .xlsx, .xls only

### JavaScript Examples:

**Export:**
```javascript
fetch('/api/product/export', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({catalogId: 1})
})
.then(r => r.blob())
.then(blob => {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'products.xlsx';
  a.click();
});
```

**Import:**
```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);
fetch('/api/product/import', {
  method: 'POST',
  body: formData
})
.then(r => r.json())
.then(data => console.log(data.successCount + ' товаров импортировано'));
```