export const STATUS = {
    pending: {title: 'ждёт подтверждения', tone: 'warning'},
    running: {title: 'выполняется', tone: 'accent'},
    review: {title: 'проверка шага', tone: 'accent'},
    paused: {title: 'на паузе', tone: 'warning'},
    confirm: {title: 'ждёт подтверждения рассылки', tone: 'warning'},
    done: {title: 'завершён', tone: 'positive'},
    rejected: {title: 'отклонён', tone: 'neutral'},
    cancelled: {title: 'отменён', tone: 'neutral'},
    failed: {title: 'ошибка', tone: 'danger'},
};

export const STEP_STATE = {
    pending: {title: 'впереди', tone: 'neutral'},
    running: {title: 'идёт', tone: 'accent'},
    waiting: {title: 'ждёт кнопки', tone: 'warning'},
    done: {title: 'готово', tone: 'positive'},
    failed: {title: 'ошибка', tone: 'danger'},
};

export const ACTIVE = ['pending', 'running', 'review', 'paused', 'confirm'];

const BROADCAST_STAGE = {
    test: 'проба админам',
    'test-sent': 'проба ушла, ждёт кнопки «Проба в порядке»',
    'test-ok': 'проба принята, ждёт кнопки «Отправить всем»',
    production: 'отправка всем',
};

export const statusOf = (status) => STATUS[status] || {title: status || '—', tone: 'neutral'};

export const stepStateOf = (state) => STEP_STATE[state] || {title: state || '—', tone: 'neutral'};

export const isActive = (plan) => Boolean(plan) && ACTIVE.includes(plan.status);

export const stepTarget = (step) => {
    if (!step) return '';
    if (step.kind === 'wait') return step.match ? `ждать процессы «${step.match}»` : 'ждать завершения процессов';
    if (step.kind === 'broadcast') return `рассылка: ${BROADCAST_STAGE[step.stage] || step.stage}`;

    return `${step.method} ${step.path}`;
};

export const progress = (plan) => {
    const steps = plan?.steps || [];
    if (!steps.length) return {done: 0, total: 0, percent: 0};

    const done = steps.filter((step) => step.state === 'done').length;

    return {done, total: steps.length, percent: Math.round((done / steps.length) * 100)};
};

export const durationTitle = (ms) => {
    const value = Number(ms);
    if (!Number.isFinite(value) || value < 0) return '';
    if (value < 1000) return `${Math.round(value)} мс`;
    if (value < 60000) return `${Math.round(value / 1000)} с`;

    const minutes = Math.floor(value / 60000);
    const seconds = Math.round((value % 60000) / 1000);

    return seconds ? `${minutes} мин ${seconds} с` : `${minutes} мин`;
};

export const nowLine = (plan, now = Date.now()) => {
    if (!plan) return '';

    const step = plan.steps?.[plan.current];
    const number = plan.current + 1;
    const total = plan.steps?.length || 0;

    if (plan.status === 'pending') return `Ждёт кнопки в Telegram: ${total} шагов, версия ${plan.version}`;
    if (plan.status === 'running' && step) {
        const since = step.startedAt ? durationTitle(now - Date.parse(step.startedAt)) : '';
        return `Шаг ${number} из ${total}: ${step.title}${since ? ` — идёт ${since}` : ''}`;
    }
    if (plan.status === 'review' && step) return `Шаг ${number} из ${total} выполнен, агент проверяет результат`;
    if (plan.status === 'paused') return plan.pausedReason || 'План на паузе';
    if (plan.status === 'confirm' && step) return `Шаг ${number} из ${total}: ${BROADCAST_STAGE[step.stage] || 'ждёт подтверждения в Telegram'}`;

    return statusOf(plan.status).title;
};

export const dateTitle = (value) => {
    const time = Date.parse(value);
    if (!Number.isFinite(time)) return '—';

    return new Date(time).toLocaleString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Europe/Moscow',
    });
};
