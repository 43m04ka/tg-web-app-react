import {API_BASE_URL} from '../config/env';

const UPLOAD_HOST = /https?:\/\/(?:www\.)?(?:gwstorebot|gwstore)\.ru(?=\/api\/uploads\/)/g;

export const uploadUrl = (value) => (
    typeof value === 'string' && value.includes('/api/uploads/')
        ? value.replace(UPLOAD_HOST, API_BASE_URL)
        : value
);

export const rewriteUploads = (value) => {
    if (typeof value === 'string') return uploadUrl(value);

    if (Array.isArray(value)) {
        for (let index = 0; index < value.length; index++) value[index] = rewriteUploads(value[index]);
        return value;
    }

    if (value && typeof value === 'object') {
        Object.keys(value).forEach((key) => {
            value[key] = rewriteUploads(value[key]);
        });
    }

    return value;
};
