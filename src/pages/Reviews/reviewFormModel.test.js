import {addReviewPhotos, reviewRatingFromSearch, reviewStartRoute} from './reviewFormModel';

test.each([1, 2, 3, 4, 5])('opens a review with rating %s', (rating) => {
    expect(reviewStartRoute(`review_${rating}`)).toBe(`/reviews/write?rating=${rating}`);
    expect(reviewRatingFromSearch(`?rating=${rating}`)).toBe(rating);
});

test.each(['', '?rating=0', '?rating=6', '?rating=4.5', '?rating=4oops', '?rating=-1'])('invalid rating falls back to five: %s', (search) => {
    expect(reviewRatingFromSearch(search)).toBe(5);
});

test('review links are distinct from product and catalog links', () => {
    expect(reviewStartRoute('reviews')).toBe('/reviews');
    expect(reviewStartRoute('review')).toBe('/reviews/write');
    expect(reviewStartRoute('review_6')).toBe('/reviews/write');
    expect(reviewStartRoute('catalog_ps_tur_deals')).toBeNull();
    expect(reviewStartRoute('12345')).toBeNull();
});

const photo = (name, size = 1024, type = 'image/png') => ({name, size, type, lastModified: 123});

test('photos can be added in separate selections without duplicates', () => {
    const first = photo('one.png');
    const second = photo('two.png');
    expect(addReviewPhotos([first], [first, second])).toEqual({files: [first, second], error: ''});
});

test('too many photos preserves the existing selection', () => {
    const current = [photo('1.png'), photo('2.png'), photo('3.png')];
    const result = addReviewPhotos(current, [photo('4.png'), photo('5.png')]);
    expect(result.files).toBe(current);
    expect(result.error).toMatch(/четырёх/);
});

test('oversized or unsupported files preserve the existing selection', () => {
    const current = [photo('one.png')];
    expect(addReviewPhotos(current, [photo('large.png', 5 * 1024 * 1024 + 1)]).files).toBe(current);
    expect(addReviewPhotos(current, [photo('document.pdf', 1024, 'application/pdf')]).error).toMatch(/JPG/);
    expect(addReviewPhotos(current, [photo('limit.webp', 5 * 1024 * 1024, 'image/webp')]).error).toBe('');
});
