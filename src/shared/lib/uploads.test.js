jest.mock('../config/env', () => ({API_BASE_URL: 'https://gwstore.ru'}));

const {rewriteUploads, uploadUrl} = require('./uploads');

describe('uploadUrl', () => {
    it('переводит загрузки с gwstorebot.ru на текущий адрес API', () => {
        expect(uploadUrl('https://gwstorebot.ru/api/uploads/data/a.png')).toBe('https://gwstore.ru/api/uploads/data/a.png');
        expect(uploadUrl('https://www.gwstorebot.ru/api/uploads/data/a.png')).toBe('https://gwstore.ru/api/uploads/data/a.png');
    });

    it('не трогает чужие адреса и обычные ссылки', () => {
        expect(uploadUrl('https://t.me/review_gameworld')).toBe('https://t.me/review_gameworld');
        expect(uploadUrl('https://gwstorebot.ru/card/1')).toBe('https://gwstorebot.ru/card/1');
        expect(uploadUrl('https://cdn.example.com/api/uploads/a.png')).toBe('https://cdn.example.com/api/uploads/a.png');
    });
});

describe('rewriteUploads', () => {
    it('проходит вложенные объекты, массивы и html', () => {
        const data = {
            images: ['https://gwstorebot.ru/api/uploads/data/1.png'],
            blocks: [{html: '<img src="https://gwstorebot.ru/api/uploads/data/2.png">'}],
            count: 2,
            empty: null
        };

        expect(rewriteUploads(data)).toEqual({
            images: ['https://gwstore.ru/api/uploads/data/1.png'],
            blocks: [{html: '<img src="https://gwstore.ru/api/uploads/data/2.png">'}],
            count: 2,
            empty: null
        });
    });
});
