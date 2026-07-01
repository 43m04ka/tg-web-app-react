/** Утилиты пути для десктопного поиска (маршрут страницы результатов). */

export function pathnameEndsWithSearch(pathname) {
    const parts = pathname.split('/').filter(Boolean);
    return parts.length > 0 && parts[parts.length - 1] === 'search';
}

export function firstSegmentBasePath(pathname) {
    const parts = pathname.split('/').filter(Boolean);
    return parts.length ? `/${parts[0]}` : '/';
}
