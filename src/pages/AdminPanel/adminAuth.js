import {API_BASE_URL} from '../../hooks/useServerRoutes/baseUrl';
import useData from './useData';

export const ADMIN_API_URL = `${API_BASE_URL}/api/admin`;

export const adminBearerHeaders = () => {
    const token = useData.getState().adminAuthToken;
    return token ? {Authorization: `Bearer ${token}`} : {};
};

export const hasAdminBearer = () => !!useData.getState().adminAuthToken;

export const adminAuthHeadersJson = () => ({
    'Content-Type': 'application/json',
    ...adminBearerHeaders(),
});

export const withJsonAuth = (bodyObject) => {
    if (!bodyObject || typeof bodyObject !== 'object') return bodyObject;
    if (!useData.getState().adminAuthToken) return bodyObject;
    const next = {...bodyObject};
    delete next.authenticationData;
    return next;
};
