import {useEffect, useState} from 'react';
import {fetchMaintenanceMode} from '../shared/api/settings';
import {INITIAL_DATA} from '../shared/lib/initialData';

const BYPASS_STORAGE_KEY = 'maintenance_bypass';
const ADMIN_PATHS = ['/admin', '/admin-panel'];

const hasBypass = () => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('dev') === '1') sessionStorage.setItem(BYPASS_STORAGE_KEY, 'true');

    if (params.get('bypass') === 'true') return true;
    if (sessionStorage.getItem(BYPASS_STORAGE_KEY) === 'true') return true;

    return ADMIN_PATHS.some((path) => window.location.pathname.startsWith(path));
};

export function useMaintenance() {
    const [mode, setMode] = useState(() => ({
        enabled: !!INITIAL_DATA.maintenance.enabled,
        until: INITIAL_DATA.maintenance.until || null
    }));

    useEffect(() => {
        const controller = new AbortController();

        fetchMaintenanceMode(controller.signal).then((next) => {
            if (!next || controller.signal.aborted) return;
            setMode((prev) => ({
                enabled: next.enabled === null ? prev.enabled : next.enabled,
                until: next.until
            }));
        });

        return () => controller.abort();
    }, []);

    return {
        isMaintenance: mode.enabled && !hasBypass(),
        maintenanceUntil: mode.until
    };
}
