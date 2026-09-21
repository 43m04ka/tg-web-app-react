import React, {act} from 'react';
import {createRoot} from 'react-dom/client';
import {MemoryRouter, useLocation} from 'react-router-dom';
import TopBar from './TopBar';
import {StorefrontScopeContext} from './StorefrontScope';
import {MaintenanceContext} from './MaintenanceScope';
import {useStructureStore} from '../../store/useStructureStore';
import {useSessionStore} from '../../store/useSessionStore';
import {useCartStore} from '../../store/useCartStore';

const pages = [
    {id: 20, type: 'ps', name: 'PlayStation Турция'},
    {id: 35, type: 'ps_india', name: 'Playstation Индия'},
    {id: 28, type: 'xbox', name: 'Xbox'},
    {id: 36, type: 'steam', name: 'Steam'},
    {id: 37, type: 'services', name: 'Сервисы'}
];

const startPages = [
    {id: 1, platform: 'web', type: 'page', structurePageId: 20, serialNumber: 1, title: 'Турция'},
    {id: 2, platform: 'web', type: 'page', structurePageId: 35, serialNumber: 2, title: 'Индия'},
    {id: 3, platform: 'web', type: 'page', structurePageId: 28, serialNumber: 4, title: 'Xbox'},
    {id: 4, platform: 'web', type: 'page', structurePageId: 36, serialNumber: 6, title: 'Steam'}
];

const catalogs = [
    {id: 236, path: 'ps_tur_psplus', structurePageId: 20},
    {id: 900, path: 'steam_top', structurePageId: 36}
];

let container;
let root;
let seenPath = null;

function PathProbe() {
    seenPath = useLocation().pathname;
    return null;
}

beforeEach(() => {
    useStructureStore.setState({pages, startPages, catalogs});
    useSessionStore.setState({pageId: 20});
    useCartStore.setState({items: [{id: 1, catalogId: 236}, {id: 2, catalogId: 236}]});

    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
});

afterEach(() => {
    act(() => root.unmount());
    container.remove();
});

const render = (path = '/main', scopeId = null, closed = null) => act(() => {
    root.unmount();
    root = createRoot(container);

    root.render(
        <MemoryRouter initialEntries={[path]}>
            <MaintenanceContext.Provider value={closed}>
                <StorefrontScopeContext.Provider value={{scopeId, setScopeId: () => {}}}>
                    <TopBar/>
                    <PathProbe/>
                </StorefrontScopeContext.Provider>
            </MaintenanceContext.Provider>
        </MemoryRouter>
    );
});

const cartButton = () => [...container.querySelectorAll('button')]
    .find((node) => node.getAttribute('aria-label') === 'Корзина');

test('в баре сплошная навигация: главная, витрины и разделы', () => {
    render();

    const labels = [...container.querySelectorAll('nav button')].map((node) => node.textContent);

    expect(labels).toEqual(['Главная', 'PS Турция', 'PS Индия', 'Xbox', 'Пополнение Стим', 'Коды пополнения']);
});

test('корзина считается по витрине и выключена, пока витрина не выбрана', () => {
    render();

    expect(container.textContent).toContain('Меню');
    expect(container.textContent).toContain('Геймворд');
    expect(cartButton().disabled).toBe(true);
    expect(cartButton().textContent).toBe('');

    render('/main', 20);

    expect(cartButton().disabled).toBe(false);
    expect(cartButton().textContent).toBe('2');
});

test('на каталоге видна корзина, в пополнении и кодах она спрятана', () => {
    const hiddenSlots = () => [...container.querySelectorAll('[data-slot]')]
        .filter((node) => node.getAttribute('aria-hidden') === 'true')
        .map((node) => node.dataset.slot);

    render();
    expect(hiddenSlots()).toEqual([]);

    render('/steam');
    expect(hiddenSlots()).toEqual(['cart']);

    render('/services');
    expect(hiddenSlots()).toEqual(['cart']);
});

test('кнопка меню разворачивает выпадающий список', () => {
    render();

    const trigger = [...container.querySelectorAll('button')]
        .find((node) => node.getAttribute('aria-haspopup') === 'menu');

    expect(trigger.textContent.trim()).toBe('Меню');
    expect(container.querySelector('[role="menu"]')).toBe(null);

    act(() => {
        trigger.dispatchEvent(new MouseEvent('click', {bubbles: true}));
    });

    expect(container.querySelector('[role="menu"]')).toBeTruthy();
});

test('при уходе в раздел счётчик корзины держится до конца анимации', () => {
    render('/main', 20);

    expect(cartButton().textContent).toBe('2');

    act(() => {
        [...container.querySelectorAll('nav button')]
            .find((node) => node.textContent === 'Пополнение Стим')
            .dispatchEvent(new MouseEvent('click', {bubbles: true}));
    });

    const slot = container.querySelector('[data-slot="cart"]');

    expect(slot.getAttribute('aria-hidden')).toBe('true');
    expect(cartButton().textContent).toBe('2');
});

test('закрытый на обслуживание раздел пропадает из меню', () => {
    render('/main', null, {steam: {enabled: true}});

    const labels = [...container.querySelectorAll('nav button')].map((node) => node.textContent);

    expect(labels).toEqual(['Главная', 'PS Турция', 'PS Индия', 'Xbox', 'Коды пополнения']);
});

test('витрина и главная в баре уводят на главную с любой страницы', () => {
    const pickNav = (label) => {
        const link = [...container.querySelectorAll('nav button')]
            .find((node) => node.textContent === label);

        act(() => {
            link.dispatchEvent(new MouseEvent('click', {bubbles: true}));
        });
    };

    render('/card/251438');
    pickNav('PS Индия');
    expect(seenPath).toBe('/');

    render('/catalog/ps_tur_new');
    pickNav('PS Индия');
    expect(seenPath).toBe('/');

    render('/basket');
    pickNav('PS Индия');
    expect(seenPath).toBe('/');

    render('/search');
    pickNav('Главная');
    expect(seenPath).toBe('/');
});
