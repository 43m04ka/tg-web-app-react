import React, {act} from 'react';
import {createRoot} from 'react-dom/client';
import {MemoryRouter, useLocation} from 'react-router-dom';
import TopBar from './TopBar';
import PlayStationNav from './PlayStationNav';
import {PLAYSTATION_SESSION_KEY} from '../model/playstationSession';
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
    sessionStorage.setItem(PLAYSTATION_SESSION_KEY, '');
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
    jest.useRealTimers();
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

    const labels = [...container.querySelectorAll('nav a')].map((node) => node.getAttribute('aria-label') || node.textContent);

    expect(labels).toEqual(['Главная', 'Xbox', 'Сервисы', 'Steam']);
    expect(container.querySelector('[aria-haspopup="dialog"]').textContent).toBe('PlayStation');
});

test('корзина доступна с главной без выбора витрины и показывает все позиции', () => {
    render();

    expect(container.querySelector('button[aria-label="Меню"]')).not.toBeNull();
    expect(container.querySelector('[aria-label="Геймворд"]')).not.toBeNull();
    expect(cartButton().disabled).toBe(false);
    expect(cartButton().textContent).toBe('2');
    act(() => cartButton().dispatchEvent(new MouseEvent('click', {bubbles: true})));
    expect(seenPath).toBe('/basket');

    render('/main', 20);

    expect(cartButton().disabled).toBe(false);
    expect(cartButton().textContent).toBe('2');
});

test('корзина доступна также в Steam и сервисах', () => {
    const hiddenSlots = () => [...container.querySelectorAll('[data-slot]')]
        .filter((node) => node.getAttribute('aria-hidden') === 'true')
        .map((node) => node.dataset.slot);

    render();
    expect(hiddenSlots()).toEqual([]);

    render('/steam');
    expect(hiddenSlots()).toEqual([]);

    render('/services');
    expect(hiddenSlots()).toEqual([]);
});

test('кнопка меню разворачивает выпадающий список', () => {
    render();

    const trigger = [...container.querySelectorAll('button')]
        .find((node) => node.getAttribute('aria-haspopup') === 'menu');

    expect(trigger.getAttribute('aria-label')).toBe('Меню');
    expect(container.querySelector('[role="menu"]')).toBe(null);

    act(() => {
        trigger.dispatchEvent(new MouseEvent('click', {bubbles: true}));
    });

    expect(container.querySelector('[role="menu"]')).toBeTruthy();
});

test('при переходе в Steam счётчик корзины сохраняется', () => {
    render('/main', 20);

    expect(cartButton().textContent).toBe('2');

    act(() => {
        [...container.querySelectorAll('nav a')]
            .find((node) => node.textContent === 'Steam')
            .dispatchEvent(new MouseEvent('click', {bubbles: true}));
    });

    const slot = container.querySelector('[data-slot="cart"]');

    expect(slot.getAttribute('aria-hidden')).toBe(null);
    expect(cartButton().textContent).toBe('2');
});

test('закрытый на обслуживание раздел пропадает из меню', () => {
    render('/main', null, {steam: {enabled: true}});

    const labels = [...container.querySelectorAll('nav a')].map((node) => node.getAttribute('aria-label') || node.textContent);

    expect(labels).toEqual(['Главная', 'Xbox', 'Сервисы']);
});

test('витрина и главная в баре уводят на главную с любой страницы', () => {
    jest.useFakeTimers();
    const pickNav = (label) => {
        if (label === 'PlayStation Индия') {
            act(() => container.querySelector('[aria-haspopup="dialog"]').dispatchEvent(new MouseEvent('click', {bubbles: true})));
            const button = [...document.querySelectorAll('[role="dialog"] button[aria-pressed]')].find((node) => node.textContent.includes('Индия'));
            act(() => button.dispatchEvent(new MouseEvent('click', {bubbles: true})));
            act(() => jest.advanceTimersByTime(180));
            return;
        }
        const link = [...container.querySelectorAll('nav a')]
            .find((node) => (node.getAttribute('aria-label') || node.textContent) === label);

        act(() => {
            link.dispatchEvent(new MouseEvent('click', {bubbles: true}));
        });
    };

    render('/card/251438');
    pickNav('PlayStation Индия');
    expect(seenPath).toBe('/');

    render('/catalog/ps_tur_new');
    pickNav('PlayStation Индия');
    expect(seenPath).toBe('/');

    render('/basket');
    pickNav('PlayStation Индия');
    expect(seenPath).toBe('/');

    render('/search');
    pickNav('Главная');
    expect(seenPath).toBe('/');
});

test('заголовок PlayStation открывает окно, Escape возвращает фокус', () => {
    jest.useFakeTimers();
    render();
    const trigger = container.querySelector('[aria-haspopup="dialog"]');
    trigger.focus();
    act(() => trigger.dispatchEvent(new MouseEvent('click', {bubbles: true})));
    expect(document.querySelector('[role="dialog"]')).not.toBeNull();
    expect(document.querySelector('[role="dialog"]').textContent).toContain('Выберите регион');
    act(() => document.dispatchEvent(new KeyboardEvent('keydown', {key: 'Escape', bubbles: true})));
    expect(document.querySelector('[role="dialog"]')).not.toBeNull();
    act(() => jest.advanceTimersByTime(180));
    expect(document.querySelector('[role="dialog"]')).toBeNull();
    expect(document.activeElement).toBe(trigger);
});

test('выбор региона выполняется один раз после закрытия окна', () => {
    jest.useFakeTimers();
    const onSelect = jest.fn();
    act(() => root.render(<MemoryRouter><PlayStationNav items={[{id: 20, type: 'ps'}, {id: 35, type: 'ps_india'}]}
        scopeId={20} onSelect={onSelect}/></MemoryRouter>));
    act(() => container.querySelector('[aria-haspopup="dialog"]').dispatchEvent(new MouseEvent('click', {bubbles: true})));
    const region = [...document.querySelectorAll('[role="dialog"] button[aria-pressed]')].find((node) => node.textContent.includes('Индия'));
    act(() => {
        region.dispatchEvent(new MouseEvent('click', {bubbles: true}));
        region.dispatchEvent(new MouseEvent('click', {bubbles: true}));
    });
    expect(onSelect).not.toHaveBeenCalled();
    expect(region.getAttribute('aria-pressed')).toBe('true');
    act(() => jest.advanceTimersByTime(180));
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith({id: 35, type: 'ps_india'});
    expect(sessionStorage.getItem(PLAYSTATION_SESSION_KEY)).toBe('ps_india');
    expect(document.querySelector('[role="dialog"]')).toBeNull();
});

test('в новой сессии нет флага и стрелки до выбора региона', () => {
    render('/', null);
    const trigger = container.querySelector('[aria-haspopup="dialog"]');
    expect(trigger.querySelector('svg')).toBeNull();
    expect(trigger.textContent).toBe('PlayStation');
});

test('регион сессии сохраняется на главной и в Xbox, а карточка показывает свой регион', () => {
    sessionStorage.setItem(PLAYSTATION_SESSION_KEY, 'ps_india');
    render('/', null);
    expect(container.querySelector('[aria-haspopup="dialog"]').title).toBe('PlayStation — Индия');
    render('/card/999', 28);
    expect(container.querySelector('[aria-haspopup="dialog"]').title).toBe('PlayStation — Индия');
    render('/card/123', 20);
    expect(container.querySelector('[aria-haspopup="dialog"]').title).toBe('PlayStation — Турция');
    expect(sessionStorage.getItem(PLAYSTATION_SESSION_KEY)).toBe('ps_india');
    render('/', null);
    expect(container.querySelector('[aria-haspopup="dialog"]').title).toBe('PlayStation — Индия');
});

test('некорректное значение сессии не выбирает произвольный регион', () => {
    sessionStorage.setItem(PLAYSTATION_SESSION_KEY, 'unknown');
    render('/', null);
    expect(container.querySelector('[aria-haspopup="dialog"]').querySelector('svg')).toBeNull();
});

test('при открытии корзины с пустой текущей витрины выбирается витрина с товарами', () => {
    useSessionStore.setState({pageId: 35});
    render('/', null);
    act(() => cartButton().dispatchEvent(new MouseEvent('click', {bubbles: true})));
    expect(useSessionStore.getState().pageId).toBe(20);
    expect(seenPath).toBe('/basket');
});
