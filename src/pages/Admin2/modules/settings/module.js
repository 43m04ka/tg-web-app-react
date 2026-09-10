import {lazy} from 'react';
import {fetchSettings, updateSetting} from './api';
import {askConfirm, toast, toastFail} from '../../platform/notify';
import {invalidate} from '../../platform/cache';
import {keys} from '../../platform/resources';

const screen = lazy(() => import('./SettingsScreen'));

const toggleMaintenance = async () => {
    try {
        const answer = await fetchSettings();
        const current = answer?.settings?.maintenance_mode?.value === true;

        const confirmed = await askConfirm({
            title: current ? 'Выключить режим техработ?' : 'Включить режим техработ?',
            text: current
                ? 'Витрина сразу вернётся к обычной работе.'
                : 'Витрина сразу покажет заглушку всем покупателям.',
            confirmText: current ? 'Выключить' : 'Включить',
            tone: current ? 'accent' : 'danger',
        });

        if (!confirmed) return;

        await updateSetting({key: 'maintenance_mode', value: !current, type: 'boolean'});
        invalidate(keys.settings);
        toast({tone: 'positive', title: current ? 'Техработы выключены' : 'Техработы включены'});
    } catch (error) {
        toastFail(error.message || 'Не получилось переключить режим', error.hint || '');
    }
};

export default {
    id: 'settings',
    title: 'Настройки',
    group: 'tools',
    icon: 'settings',
    order: 90,
    routes: [
        {path: '/settings', element: screen},
    ],
    commands: [
        {
            id: 'settings.maintenance',
            title: 'Переключить режим техработ',
            icon: 'settings',
            run: toggleMaintenance,
        },
    ],
};
