export const SCENARIO_TITLES = {
    catalog: 'Каталог',
    steam: 'Steam',
    services: 'Сервисы',
};

export const PLATFORM_TITLES = {
    tg: 'Telegram',
    web: 'Сайт',
    vk: 'ВКонтакте',
    max: 'MAX',
};

export const FLOW_TITLES = {
    auto: 'Счёт выставляет касса',
    manual: 'Заявка менеджеру',
};

export const PROVIDER_TITLES = {
    paykeeper: 'Paykeeper',
    aurapay: 'AuraPay',
};

export const ruleKey = (methodCode, platform, scenario, pageType) =>
    `${methodCode}|${platform}|${scenario}|${pageType || ''}`;

export const indexRules = (rules) => {
    const map = new Map();
    (rules || []).forEach((rule) => {
        map.set(ruleKey(rule.methodCode, rule.platform, rule.scenario, rule.pageType), rule);
    });
    return map;
};

export const emptyMethod = () => ({
    code: '',
    title: '',
    note: '',
    icon: '',
    tone: '',
    termsLabel: '',
    termsUrl: '',
    flow: 'manual',
    provider: '',
    schedule: false,
    requiresEmail: false,
    isEnabled: true,
    serialNumber: 0,
});

export const toForm = (method) => ({
    code: method.code || '',
    title: method.title || '',
    note: method.note || '',
    icon: method.icon || '',
    tone: method.tone || '',
    termsLabel: method.termsLabel || '',
    termsUrl: method.termsUrl || '',
    flow: method.flow || 'manual',
    provider: method.provider || '',
    schedule: !!method.schedule,
    requiresEmail: !!method.requiresEmail,
    isEnabled: method.isEnabled !== false,
    serialNumber: Number(method.serialNumber) || 0,
});

export const methodProblem = (form) => {
    if (!form.code.trim()) return 'Без кода метод не сохранить';
    if (!/^[a-z0-9_-]+$/.test(form.code.trim())) return 'Код: латиница в нижнем регистре, цифры, дефис, подчёркивание';
    if (!form.title.trim()) return 'Нужно название — его видит покупатель';
    if (form.flow === 'auto' && !form.provider) return 'Автоматическому счёту нужна касса';
    return '';
};

export const numberOrNull = (raw) => {
    if (raw === '' || raw === null || raw === undefined) return null;
    const parsed = Number.parseInt(raw, 10);
    return Number.isFinite(parsed) ? parsed : null;
};

export const pageTypesOf = (rules, scenario) => {
    const found = new Set();
    (rules || [])
        .filter((rule) => rule.scenario === scenario && rule.pageType)
        .forEach((rule) => found.add(rule.pageType));
    return [...found].sort();
};

export const describeRule = (rule) => {
    if (!rule || !rule.isEnabled) return '';

    const parts = [];
    if (rule.flowOverride) parts.push(FLOW_TITLES[rule.flowOverride] || rule.flowOverride);
    if (rule.minTotal) parts.push(`от ${rule.minTotal} ₽`);
    if (rule.maxTotal) parts.push(`до ${rule.maxTotal} ₽`);
    if (rule.providerOverride) parts.push(PROVIDER_TITLES[rule.providerOverride] || rule.providerOverride);

    return parts.join(' · ');
};
