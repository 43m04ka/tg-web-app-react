import {useEffect, useState} from 'react';
import {fetchMaintenanceMode} from '../api/settings';
import {INITIAL_DATA} from '../lib/initialData';

export function useTurkeyCodesMode() {
    const [isCodes, setCodes] = useState(INITIAL_DATA.maintenance?.turkeyFulfillment === 'codes');

    useEffect(() => {
        const controller = new AbortController();

        fetchMaintenanceMode(controller.signal).then((next) => {
            if (!next || controller.signal.aborted) return;
            setCodes(next.turkeyFulfillment === 'codes');
        });

        return () => controller.abort();
    }, []);

    return isCodes;
}
