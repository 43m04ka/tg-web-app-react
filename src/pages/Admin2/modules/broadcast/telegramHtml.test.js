import {serializeEditor} from './telegramHtml';

const serialize = (html) => {
    const holder = document.createElement('div');
    holder.innerHTML = html;
    return serializeEditor(holder);
};

describe('serializeEditor', () => {
    it('переносит строку перед каждым новым абзацем редактора', () => {
        expect(serialize('Первая<div>Вторая</div><div>Третья</div>')).toBe('Первая\nВторая\nТретья');
    });

    it('оставляет пустую строку между абзацами', () => {
        expect(serialize('<div>А</div><div><br></div><div>Б</div>')).toBe('А\n\nБ');
    });

    it('сохраняет форматирование и экранирует спецсимволы', () => {
        expect(serialize('<b>жирный</b> & <i>курсив</i>')).toBe('<b>жирный</b> &amp; <i>курсив</i>');
    });

    it('пропускает только http-ссылки', () => {
        expect(serialize('<a href="https://x.ru">тут</a> <a href="javascript:1">нет</a>'))
            .toBe('<a href="https://x.ru">тут</a> нет');
    });
});
