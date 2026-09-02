import overview from '../modules/overview/module';
import orders from '../modules/orders/module';
import products from '../modules/products/module';
import services from '../modules/services/module';
import settings from '../modules/settings/module';
import kit from '../modules/kit/module';

export const BASE = '/admin2';

export const GROUPS = [
    {id: 'money', title: 'Деньги'},
    {id: 'goods', title: 'Товар'},
    {id: 'storefront', title: 'Витрина'},
    {id: 'tools', title: 'Инструменты'},
];

const REGISTERED = [overview, orders, products, services, settings, kit];

export const modules = REGISTERED
    .slice()
    .sort((left, right) => (left.order || 0) - (right.order || 0));

export const moduleById = (id) => modules.find((item) => item.id === id) || null;

export const navigationGroups = () => GROUPS
    .map((group) => ({
        ...group,
        items: modules.filter((item) => item.group === group.id && item.routes?.length),
    }))
    .filter((group) => group.items.length);

export const moduleRoutes = () => modules.flatMap((item) => (item.routes || []).map((route) => ({
    ...route,
    moduleId: item.id,
})));

export const moduleCommands = () => modules.flatMap((item) => (item.commands || []).map((command) => ({
    ...command,
    moduleId: item.id,
    moduleTitle: item.title,
})));

export const overviewWidgets = () => modules.flatMap((item) => (item.overview || []).map((widget) => ({
    moduleId: item.id,
    widget,
})));

export const moduleSearchers = () => modules
    .filter((item) => typeof item.search === 'function')
    .map((item) => ({moduleId: item.id, moduleTitle: item.title, search: item.search}));

export const homePath = () => {
    const first = modules.find((item) => item.routes?.length);
    return first ? first.routes[0].path : '/';
};

export const moduleOfPath = (pathname) => {
    const local = pathname.startsWith(BASE) ? pathname.slice(BASE.length) || '/' : pathname;

    return modules.find((item) => (item.routes || []).some((route) => {
        const base = route.path.split('/:')[0];
        return local === base || local.startsWith(`${base}/`);
    })) || null;
};
