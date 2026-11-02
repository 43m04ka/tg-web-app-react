import React, {act} from 'react';
import {createRoot} from 'react-dom/client';
import {MemoryRouter} from 'react-router-dom';
import {fetchReviews} from '../../shared/api/reviews';
import external from '../../pages/Reviews/externalReviews.json';
import summary from '../../pages/Reviews/externalReviewSummary.json';
import ReviewRating from './ReviewRating';

jest.mock('../../shared/api/reviews', () => ({fetchReviews: jest.fn()}));

let container;
let root;

beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
});

afterEach(() => {
    act(() => root.unmount());
    container.remove();
    jest.clearAllMocks();
});

const render = async () => act(async () => root.render(<MemoryRouter><ReviewRating/></MemoryRouter>));

test('сводка не расходится с опубликованным списком внешних отзывов', () => {
    expect(summary.count).toBe(external.reviews.length);
    expect(summary.average).toBe(5);
});

test('общий рейтинг учитывает число и оценку отзывов на сайте', async () => {
    fetchReviews.mockResolvedValue({count: 50, average: 1});
    await render();
    const rating = container.querySelector('a');
    expect(rating.getAttribute('href')).toBe('/reviews');
    expect(rating.getAttribute('aria-label')).toBe('Рейтинг 4.9 из 5, 2 600 отзывов');
    expect(rating.querySelector('strong').textContent).toBe('4.9');
});

test('при ошибке остаётся подтверждённое число внешних отзывов с плюсом', async () => {
    fetchReviews.mockRejectedValue(new Error('Недоступно'));
    await render();
    expect(container.querySelector('a').getAttribute('aria-label')).toBe('Рейтинг 5.0 из 5, 2 550+ отзывов');
});

test('уход со страницы отменяет незавершённый запрос рейтинга', async () => {
    fetchReviews.mockImplementation(() => new Promise(() => {}));
    await render();
    const signal = fetchReviews.mock.calls[0][1];
    expect(signal.aborted).toBe(false);
    act(() => root.unmount());
    expect(signal.aborted).toBe(true);
    root = createRoot(container);
});
