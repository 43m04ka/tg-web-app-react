export const reviewRatingFromSearch = (search) => {
    const value = new URLSearchParams(search).get('rating');
    return /^[1-5]$/.test(value || '') ? Number(value) : 5;
};

export const reviewStartRoute = (param) => {
    if (param === 'reviews') return '/reviews';
    if (param === 'review') return '/reviews/write';
    const match = /^review_([1-5])$/.exec(param);
    if (match) return `/reviews/write?rating=${match[1]}`;
    return param.startsWith('review_') ? '/reviews/write' : null;
};

export const addReviewPhotos = (current, incoming) => {
    const accepted = new Set(['image/jpeg', 'image/png', 'image/webp']);
    const added = Array.from(incoming || []);
    if (added.some((file) => !accepted.has(file.type))) {
        return {files: current, error: 'Можно добавить только фотографии JPG, PNG или WebP'};
    }
    if (added.some((file) => file.size > 5 * 1024 * 1024)) {
        return {files: current, error: 'Каждая фотография должна быть не больше 5 МБ'};
    }
    const seen = new Set();
    const files = [...current, ...added].filter((file) => {
        const key = JSON.stringify([file.name, file.size, file.lastModified]);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
    return files.length > 4
        ? {files: current, error: 'Можно добавить не больше четырёх фотографий'}
        : {files, error: ''};
};
