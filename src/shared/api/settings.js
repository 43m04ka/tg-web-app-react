import {request} from './client';

export const fetchMaintenanceMode = async (signal) => {
    try {
        const payload = await request('/api/admin/settings/public', {signal, retries: 1});
        const settings = payload?.settings;

        return {
            enabled: typeof settings?.maintenance_mode?.value === 'boolean' ? settings.maintenance_mode.value : null,
            until: settings?.maintenance_mode_until?.value || null,
            sections: settings?.maintenance_sections?.value || {},
            domains: settings?.maintenance_domains?.value || {},
            turkeyFulfillment: settings?.ps_turkey_fulfillment?.value === 'codes' ? 'codes' : 'manager'
        };
    } catch (error) {
        console.error('[api] maintenance mode:', error.message);
        return null;
    }
};
