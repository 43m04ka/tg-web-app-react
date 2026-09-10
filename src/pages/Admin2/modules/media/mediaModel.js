export const MAX_FILES = 10;

export const MAX_SIZE_MB = 50;

export const ALLOWED = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];

export const crumbsOf = (path) => {
    const parts = String(path || '').split('/').filter(Boolean);

    return [
        {title: 'Хостинг', path: ''},
        ...parts.map((part, index) => ({title: part, path: parts.slice(0, index + 1).join('/')})),
    ];
};

export const parentOf = (path) => {
    const parts = String(path || '').split('/').filter(Boolean);
    parts.pop();

    return parts.join('/');
};

export const splitEntries = (entries, search) => {
    const list = Array.isArray(entries) ? entries : [];
    const needle = search.trim().toLowerCase();
    const match = (item) => !needle || item.name.toLowerCase().includes(needle);

    return {
        folders: list.filter((item) => item.type === 'folder' && match(item)),
        files: list.filter((item) => item.type === 'file' && match(item)),
        total: list.length,
    };
};

export const checkFiles = (files) => {
    const list = Array.from(files || []);
    const tooMany = list.length > MAX_FILES;
    const wrongType = list.filter((file) => file.type && !ALLOWED.includes(file.type));
    const tooBig = list.filter((file) => file.size > MAX_SIZE_MB * 1024 * 1024);

    return {
        list: list.slice(0, MAX_FILES).filter((file) => (!file.type || ALLOWED.includes(file.type)) && file.size <= MAX_SIZE_MB * 1024 * 1024),
        tooMany,
        wrongType,
        tooBig,
    };
};
