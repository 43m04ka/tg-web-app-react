import {useCallback, useEffect, useState} from 'react';
import {fetchMaintenanceMode} from '../shared/api/settings';
import {INITIAL_DATA} from '../shared/lib/initialData';
import {closedCount, normalizeSections} from '../shared/lib/maintenance';

const BYPASS_STORAGE_KEY = 'maintenance_bypass';
const ADMIN_PATHS = ['/admin', '/admin-panel'];
const POLL_MS = 30000;

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
        until: INITIAL_DATA.maintenance.until || null,
        sections: normalizeSections(INITIAL_DATA.maintenance.sections)
    }));

    const refresh = useCallback((signal) => fetchMaintenanceMode(signal).then((next) => {
        if (!next || signal?.aborted) return;

        setMode((prev) => ({
            enabled: next.enabled === null ? prev.enabled : next.enabled,
            until: next.until,
            sections: normalizeSections(next.sections)
        }));
    }), []);

    useEffect(() => {
        const controller = new AbortController();
        refresh(controller.signal);
        return () => controller.abort();
    }, [refresh]);

    const isClosed = mode.enabled || closedCount(mode.sections) > 0;

    useEffect(() => {
        if (!isClosed) return undefined;

        const controller = new AbortController();
        const timerId = setInterval(() => refresh(controller.signal), POLL_MS);

        const onVisible = () => {
            if (document.visibilityState === 'visible') refresh(controller.signal);
        };

        document.addEventListener('visibilitychange', onVisible);

        return () => {
            clearInterval(timerId);
            document.removeEventListener('visibilitychange', onVisible);
            controller.abort();
        };
    }, [isClosed, refresh]);

    const bypassed = hasBypass();

    return {
        isMaintenance: mode.enabled && !bypassed,
        maintenanceUntil: mode.until,
        maintenanceSections: bypassed ? {} : mode.sections
    };
}
