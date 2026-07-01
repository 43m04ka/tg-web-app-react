# Руководство по стилю UI Админки

## 📋 Обзор
Админ-панель использует темный минималистичный дизайн с синей темой. Все компоненты должны быть консистентны и соответствовать этому гайду.

---

## 🎨 Цветовая схема

### Основные цвета
- **Основной синий (тема)**: `$theme-color` = `#5B78E3` (RGB: 91, 120, 227)
- **Текст основной**: `$text-color` = `#D1D5E0`
- **Текст вторичный**: `#8e95a3`
- **Фон основной**: `#13151d`
- **Фон вторичный**: `rgba(19, 21, 29, 0.6)`
- **Фон элементов**: `#1a2234`
- **Бордер**: `#2c2c2e` или `rgba(79, 95, 130, 0.4)`
- **Hover фон**: `rgba(91, 120, 227, 0.12)`
- **Красный (опасные действия)**: `#ff6b6b`
- **Зелёный (успешные действия)**: `#22a54a`

---

## 📐 Размеры и отступы

### Контейнеры
```scss
.mainContainer {
  padding: 40px 40px 20px 40px;
  gap: между элементами: 16px или 12px
}
```

### Высоты элементов
- **Кнопки**: `height: 40px`
- **Инпуты**: `height: 40px` или `44px`
- **Color picker**: `height: 44px`
- **Превью картинок**: `height: 30px` (в таблицах)
- **Цветовой квадратик**: `24x24px`

### Отступы (padding)
- **Таблица**: `padding: 12px 14px` (в th/td)
- **Кнопки**: `padding: 0 16px` (большие), `4px 10px` (в таблице)
- **Инпуты**: `padding: 0 14px`
- **Контейнеры**: `gap: 16px` или `gap: 12px`

### Скругления (border-radius)
- **Основные элементы**: `8px` или `10px`
- **Таблицы**: `14px`
- **Картинки/квадратики**: `4px`
- **Кнопки в таблице**: `6px`

---

## 🎯 Компоненты

### Header/Заголовок
```scss
.header {
  padding: 0 0 24px 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
}

.headerTitle {
  font-size: 28px;
  font-weight: 700;
  color: $text-color;
}
```

### Кнопки

#### Основная кнопка (созданн, обновление)
```scss
.button {
  background: $theme-color;
  color: white;
  padding: 0 16px;
  height: 40px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba($theme-color, 0.3);
  }
  
  &:active {
    transform: translateY(0);
  }
}
```

#### Кнопка действия в таблице (Редактировать, Удалить)
```scss
.actionButton {
  background: $theme-color;
  color: white;
  border: 1px solid rgba($theme-color, 0.3);
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba($theme-color, 0.9);
    border-color: $theme-color;
    box-shadow: 0 2px 8px rgba($theme-color, 0.2);
  }

  &.deleteButton {
    color: #ff6b6b;
    border-color: rgba(255, 107, 107, 0.3);
    
    &:hover {
      background: rgba(255, 107, 107, 0.1);
      border-color: #ff6b6b;
    }
  }
}
```

#### Кнопка вставки (зелёная)
```scss
.pasteButton {
  background: #22a54a;
  color: white;
  padding: 0 16px;
  height: 40px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(34, 165, 74, 0.3);
  }
}
```

#### Кнопка очистки
```scss
.clearButton {
  background: transparent;
  color: #ff6b6b;
  border: 1px solid rgba(255, 107, 107, 0.3);
  padding: 8px 12px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 12px;
  cursor: pointer;

  &:hover {
    background: rgba(255, 107, 107, 0.1);
    border-color: #ff6b6b;
  }
}
```

### Инпуты и поля

#### Текстовый инпут
```scss
.inputFind {
  display: flex;
  flex: 1;
  height: 40px;
  padding: 0 14px;
  background-color: rgba(19, 21, 29, 0.6);
  border: 1px solid rgba(79, 95, 130, 0.4);
  border-radius: 10px;
  color: $text-color;
  font-size: 14px;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: $theme-color;
    background-color: rgba(19, 21, 29, 0.8);
    box-shadow: 0 0 0 3px rgba($theme-color, 0.1);
  }

  &:hover:not(:focus) {
    border-color: rgba(79, 95, 130, 0.6);
  }

  &::placeholder {
    color: #5d6577;
  }
}
```

#### Color picker
```scss
.colorInput {
  width: 100%;
  height: 44px;
  padding: 2px;
  background-color: rgba(19, 21, 29, 0.6);
  border: 1px solid rgba(79, 95, 130, 0.4);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: rgba(79, 95, 130, 0.6);
  }

  &:focus {
    outline: none;
    border-color: $theme-color;
    box-shadow: 0 0 0 3px rgba($theme-color, 0.1);
  }
}

.colorLabel {
  @extend %text;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #8e95a3;
  margin-bottom: 8px;
}
```

### Таблицы

#### Контейнер таблицы
```scss
.tableWrapMain {
  width: 100%;
  overflow: auto;
  max-height: calc(100vh - 280px);
  min-height: 320px;
  flex: 1 1 auto;
  border: 1px solid #2c2c2e;
  border-radius: 14px;
  background: #13151d;
}

.table {
  width: 100%;
  border-collapse: collapse;
  min-width: 900px;
  table-layout: auto;

  th, td {
    padding: 12px 14px;
    border-bottom: 1px solid #242730;
    text-align: left;
    white-space: normal;
    word-break: break-word;
  }

  thead th {
    color: #8e95a3;
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    background: #11131a;
    position: sticky;
    top: 0;
    z-index: 1;
  }

  tbody tr {
    cursor: pointer;
    transition: background-color 0.2s ease;

    &:nth-child(even) {
      background: rgba(79, 95, 130, 0.08);
    }

    &:hover {
      background: rgba(91, 120, 227, 0.12);
    }

    &:last-child td {
      border-bottom: none;
    }
  }
}
```

#### Строка при перетягивании
```scss
.dragging {
  opacity: 0.5;
  background: rgba(91, 120, 227, 0.2) !important;
  cursor: grabbing;
}
```

#### Пустая таблица
```scss
.emptyCell {
  color: #8e95a3 !important;
  text-align: center !important;
  padding: 20px !important;
}
```

### Вкладки (Tabs)

```scss
.tabsContainer {
  display: flex;
  gap: 0;
  border-bottom: 1px solid #2c2c2e;
  margin-bottom: 20px;
}

.tab {
  padding: 12px 20px;
  background: transparent;
  border: none;
  color: #8e95a3;
  font-weight: 500;
  font-size: 14px;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.2s ease;

  &:hover {
    color: $text-color;
  }

  &.activeTab {
    color: $theme-color;
    border-bottom-color: $theme-color;
  }
}
```

### Модальные окна (PopUpWindow)

**Использование:**
```jsx
<PopUpWindow title="Название" onClose={onClose}>
  {children}
  <div className={style['buttonPlace']}>
    <div className={style['buttonAccept']} onClick={handleSave}>
      <div/> {/* иконка */}
      <p>Сохранить</p>
    </div>
  </div>
</PopUpWindow>
```

**Особенности:**
- ✅ Встроенный крестик закрытия (не нужна кнопка отмены)
- ✅ Перетягиваемое окно за заголовок
- ✅ Полная функциональность уже в компоненте

### Предпросмотры картинок

#### В таблице (баннеры)
```scss
{item.url && (
  <div style={{
    maxWidth: '60px',
    height: '30px',
    backgroundColor: '#2a2f3a',
    borderRadius: '4px',
    backgroundImage: `url(${item.url})`,
    backgroundSize: 'contain',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
  }}></div>
)}
```

#### Цветовой квадратик
```scss
<div style={{
  width: '24px',
  height: '24px',
  backgroundColor: item.color || 'transparent',
  borderRadius: '4px',
  border: '1px solid #444'
}}></div>
```

---

## 🎭 Архитектурные паттерны

### Структура компонента
1. **Imports** → API, стили, хуки
2. **State** → все useState в начале
3. **Effects** → все useEffect вместе
4. **Handlers** → функции обработки событий
5. **Render** → JSX в конце

### State Management
- ❌ **Избегать**: дублирования состояния
- ✅ **Использовать**: копировать данные явно (не через spread)
- ✅ **Использовать**: callback функции для обновления через API

### API Запросы
```javascript
// Общий паттерн в useServer.js
const functionName = async (param1, param2, setResult) => {
  await fetch(URL + '/endpoint', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({authenticationData, ...params})
  }).then(async response => {
    let answer = response.json()
    answer.then((data) => {
      setResult(data.result || [])
    })
  })
}
```

### Копирование элементов
**Запрос должен содержать только необходимые поля:**
```javascript
const newItem = {
  field1: copiedItem.field1,
  field2: copiedItem.field2,
  // ... только нужные поля
  id: undefined,  // исключить
  updatedAt: undefined,  // исключить
  createdAt: undefined,  // исключить
  structurePageId: page  // новая страница
}
```

---

## 📱 Компоненты специально для админки

### Выбор первой страницы по умолчанию
```javascript
const [page, setPage] = useState(null);

useEffect(() => {
  if (pageList && pageList.length > 0 && page === null) {
    setPage(pageList[0].id);
  }
}, [pageList, page]);
```

### Drag & Drop для переупорядочения
```javascript
const handleDragStart = (e, item) => {
  setDraggedItem(item);
  e.dataTransfer.effectAllowed = 'move';
};

const handleDrop = async (e, targetItem) => {
  // Переассайнить serialNumber элементов
  // Отправить обновления на сервер
  // Вызвать onReload()
};
```

### Копирование на другую страницу
```javascript
// В глобальном компоненте
const [copiedItem, setCopiedItem] = useState(null);

// При копировании:
setCopiedItem({
  ...item,
  group: 'head', // или 'body'
  sourcePage: page
});

// При вставке:
const newItem = {
  field1: copiedItem.field1,
  structurePageId: page, // ДРУГАЯ страница
  group: 'head'
};
```

---

## 🔤 Типография

### Шрифт
- **Основной**: inherit или система по умолчанию
- **Font-weight**: 
  - `400` - текст
  - `500` - акцент
  - `600` - button/label
  - `700` - заголовок

### Размеры текста
- **Заголовок**: `28px / 700`
- **Title/Label**: `14px / 600`
- **Button**: `13px / 600` (большие), `12px / 600` (в таблице)
- **Вторичный текст**: `12px / 400`
- **Label**: `12px / 600 uppercase`

---

## ✅ Чек-лист для новых компонентов

- [ ] Используется темный фон (`#13151d`)
- [ ] Кнопки синие (`$theme-color`) и белые текстом
- [ ] Инпуты имеют фокус с синей подсветкой
- [ ] Таблицы отформатированы с правильными отступами
- [ ] Hover эффекты добавлены
- [ ] Модальные окна используют PopUpWindow с onClose
- [ ] Кнопка удаления красная (`#ff6b6b`)
- [ ] Нет дублирования состояния
- [ ] API запросы только необходимые поля передают
- [ ] Используются SCSS модули со своими стилями
- [ ] Color picker используется для цветов
- [ ] Drag & Drop работает корректно (если нужно)

---

## 🚀 Быстрая справка

### Импорты для компонента
```javascript
import style from './Component.module.scss';
import {useServer} from "../useServer";
import useData from "../../../../useData";
import PopUpWindow from "../../../../Elements/PopUpWindow/PopUpWindow";
```

### Основная структура стиля SCSS
```scss
@import "../../AdminPanel.module";

.mainContainer {
  padding: 40px 40px 20px 40px;
}

.header {
  padding: 0 0 24px 0;
  display: flex;
  justify-content: space-between;
}

.button {
  background: $theme-color;
  color: white;
  // ... остальные стили
}
```

### Цвета быстрого доступа
```scss
$theme-color: #5B78E3;        // синий
$text-color: #D1D5E0;         // основной текст
#8e95a3                        // вторичный текст
#13151d                        // тёмный фон
rgba(91, 120, 227, 0.12)      // hover таблицы
#ff6b6b                        // красный (удаление)
#22a54a                        // зелёный (успех)
```

---

**Дата обновления**: 2025  
**Версия**: 1.0
