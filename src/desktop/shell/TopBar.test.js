import React, {act} from 'react';
import {createRoot} from 'react-dom/client';
import {MemoryRouter} from 'react-router-dom';
import TopBar from './TopBar';
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

const catalogs = [{id: 236, path: 'ps_tur_psplus', structurePageId: 20}];

let container;
let root;

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

const render = (path = '/main') => act(() => {
    root.unmount();
    root = createRoot(container);

    root.render(
        <MemoryRouter initialEntries={[path]}>
            <TopBar/>
        </MemoryRouter>
    );
});

test('в меню остались только найденные разделы, без каталога', () => {
    render();

    const labels = [...container.querySelectorAll('nav button')].map((node) => node.textContent);

    expect(labels).toEqual(['Каталог', 'Пополнение', 'Коды']);
});

test('выбор витрины показан в шапке, а корзина считается по странице', () => {
    render();

    expect(container.textContent).toContain('Все витрины');
    expect(container.textContent).toContain('Геймворд');

    const badge = [...container.querySelectorAll('button span')]
        .map((node) => node.textContent)
        .filter((text) => text === '2');

    expect(badge).toHaveLength(1);
});

test('на каталоге видны витрины и корзина, в пополнении и кодах они спрятаны', () => {
    const hiddenSlots = () => [...container.querySelectorAll('[data-slot]')]
        .filter((node) => node.getAttribute('aria-hidden') === 'true')
        .map((node) => node.dataset.slot);

    render();

    const trigger = [...container.querySelectorAll('button')]
        .find((node) => node.getAttribute('aria-haspopup') === 'listbox');

    expect(trigger.textContent.trim()).toBe('Все витрины');
    expect(hiddenSlots()).toEqual([]);

    render('/steam');
    expect(hiddenSlots()).toEqual(['region', 'cart']);

    render('/services');
    expect(hiddenSlots()).toEqual(['region', 'cart']);
});

test('витрины разворачиваются списком по клику, первым пунктом — все', () => {
    render();

    const trigger = [...container.querySelectorAll('button')]
        .find((node) => node.getAttribute('aria-haspopup') === 'listbox');

    expect(trigger).toBeTruthy();

    act(() => {
        trigger.dispatchEvent(new MouseEvent('click', {bubbles: true}));
    });

    const options = [...container.querySelectorAll('[role="option"]')]
        .map((node) => node.lastElementChild.firstElementChild.textContent);

    expect(options).toEqual(['Все витрины', 'PS Турция', 'PS Индия', 'Xbox']);

    const selected = container.querySelector('[role="option"][aria-selected="true"]');

    expect(selected.lastElementChild.firstElementChild.textContent).toBe('Все витрины');
});
