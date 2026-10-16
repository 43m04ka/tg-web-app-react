import {durationTitle, isActive, nowLine, progress, statusOf, stepTarget} from './agentModel';

const plan = (patch = {}) => ({
    status: 'running',
    version: 1,
    current: 1,
    pausedReason: null,
    steps: [
        {title: 'Список процессов', kind: 'request', method: 'GET', path: '/processList', state: 'done'},
        {title: 'Запустить парс', kind: 'request', method: 'POST', path: '/start-parse-ps', state: 'running', startedAt: '2026-10-14T10:00:00Z'},
        {title: 'Дождаться', kind: 'wait', match: 'PS', state: 'pending'},
    ],
    ...patch,
});

describe('план агента', () => {
    it('считает прогресс по готовым шагам', () => {
        expect(progress(plan())).toEqual({done: 1, total: 3, percent: 33});
        expect(progress({steps: []})).toEqual({done: 0, total: 0, percent: 0});
    });

    it('описывает текущий момент по статусу', () => {
        const now = Date.parse('2026-10-14T10:01:05Z');

        expect(nowLine(plan(), now)).toBe('Шаг 2 из 3: Запустить парс — идёт 1 мин 5 с');
        expect(nowLine(plan({status: 'review'}), now)).toBe('Шаг 2 из 3 выполнен, агент проверяет результат');
        expect(nowLine(plan({status: 'paused', pausedReason: 'Шаг 2 не прошёл'}), now)).toBe('Шаг 2 не прошёл');
        expect(nowLine(plan({status: 'pending'}), now)).toBe('Ждёт кнопки в Telegram: 3 шагов, версия 1');
    });

    it('показывает цель шага', () => {
        expect(stepTarget(plan().steps[1])).toBe('POST /start-parse-ps');
        expect(stepTarget(plan().steps[2])).toBe('ждать процессы «PS»');
    });

    it('отличает активный план от завершённого', () => {
        expect(isActive(plan())).toBe(true);
        expect(isActive(plan({status: 'done'}))).toBe(false);
        expect(isActive(null)).toBe(false);
        expect(statusOf('paused').title).toBe('на паузе');
    });

    it('показывает шаг рассылки и ожидание кнопки', () => {
        const step = {title: 'Акция', kind: 'broadcast', stage: 'test-ok', state: 'waiting'};
        const waiting = plan({status: 'confirm', current: 0, steps: [step]});

        expect(isActive(waiting)).toBe(true);
        expect(statusOf('confirm').title).toBe('ждёт подтверждения рассылки');
        expect(stepTarget(step)).toBe('рассылка: проба принята, ждёт кнопки «Отправить всем»');
        expect(nowLine(waiting)).toBe('Шаг 1 из 1: проба принята, ждёт кнопки «Отправить всем»');
    });

    it('форматирует длительность', () => {
        expect(durationTitle(250)).toBe('250 мс');
        expect(durationTitle(42000)).toBe('42 с');
        expect(durationTitle(120000)).toBe('2 мин');
    });
});
