import {createContext, useContext, useMemo} from 'react';
import {normalizeSections} from '../../shared/lib/maintenance';

export const MaintenanceContext = createContext(null);

export function useOpenSections(sections) {
    const raw = useContext(MaintenanceContext);
    const closed = useMemo(() => normalizeSections(raw), [raw]);

    return useMemo(
        () => sections.filter((section) => !closed[section.key]),
        [sections, closed]
    );
}
