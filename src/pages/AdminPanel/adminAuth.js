import {API_BASE_URL} from '../../hooks/useServerRoutes/baseUrl';
import useData from './useData';

/** Базовый URL админ-API (совпадает с хуками приложения). */
export const ADMIN_API_URL = `${API_BASE_URL}/api/admin`;

/** Заголовок Authorization, если в store есть JWT после /authentication. */
export const adminBearerHeaders = () => {
    const token = useData.getState().adminAuthToken;
    return token ? {Authorization: `Bearer ${token}`} : {};
};

export const hasAdminBearer = () => !!useData.getState().adminAuthToken;

/** JSON-заголовки + Bearer при наличии токена. */
export const adminAuthHeadersJson = () => ({
    'Content-Type': 'application/json',
    ...adminBearerHeaders(),
});

/**
 * Если есть JWT — убрать authenticationData из тела (достаточно Bearer).
 * Иначе тело без изменений.
 */
export const withJsonAuth = (bodyObject) => {
    if (!bodyObject || typeof bodyObject !== 'object') return bodyObject;
    if (!useData.getState().adminAuthToken) return bodyObject;
    const next = {...bodyObject};
    delete next.authenticationData;
    return next;
};
