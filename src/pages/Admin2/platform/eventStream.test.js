import {parseChunk} from './eventStream';

const block = (event, data) => `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;

describe('parseChunk', () => {
    it('разбирает одно событие', () => {
        const {events, tail} = parseChunk(block('state', {processes: []}));

        expect(events).toHaveLength(1);
        expect(events[0].event).toBe('state');
        expect(events[0].data).toEqual({processes: []});
        expect(tail).toBe('');
    });

    it('разбирает несколько событий из одного куска', () => {
        const {events} = parseChunk(block('state', {a: 1}) + block('beat', {at: 2}));

        expect(events.map((item) => item.event)).toEqual(['state', 'beat']);
    });

    it('недочитанное событие оставляет в хвосте, а не теряет', () => {
        const partial = 'event: state\ndata: {"a"';
        const {events, tail} = parseChunk(block('beat', {at: 1}) + partial);

        expect(events).toHaveLength(1);
        expect(tail).toBe(partial);
    });

    it('склеивает событие, дочитанное следующим куском', () => {
        const first = parseChunk('event: state\ndata: {"a":');
        expect(first.events).toHaveLength(0);

        const second = parseChunk(`${first.tail}1}\n\n`);
        expect(second.events[0].data).toEqual({a: 1});
    });

    it('битый JSON пропускается, а не роняет разбор', () => {
        const {events} = parseChunk('event: state\ndata: {не json}\n\n' + block('beat', {at: 1}));

        expect(events).toHaveLength(1);
        expect(events[0].event).toBe('beat');
    });

    it('блок без имени события пропускается', () => {
        const {events} = parseChunk('data: {"a":1}\n\n');

        expect(events).toHaveLength(0);
    });

    it('пустой буфер не даёт событий', () => {
        expect(parseChunk('').events).toEqual([]);
    });
});
