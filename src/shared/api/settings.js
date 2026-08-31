import {request} from './client';

export const fetchMaintenanceMode = async (signal) => {
    try {
        const payload = await request('/api/admin/settings/public', {signal, retries: 1});
        const settings = payload?.settings;
        const enabled = settings?.maintenance_mode?.value;

        return {
            enabled: typeof enabled === 'boolean' ? enabled : null,
            until: settings?.maintenance_mode_until?.value || null
        };
    } catch (error) {
        console.error('[api] maintenance mode:', error.message);
        return null;
    }
};
