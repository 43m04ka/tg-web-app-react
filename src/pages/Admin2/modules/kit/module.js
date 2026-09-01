import {lazy} from 'react';
import {toast} from '../../platform/notify';

export default {
    id: 'kit',
    title: 'Компоненты',
    group: 'tools',
    icon: 'kit',
    order: 90,
    routes: [
        {path: '/kit', element: lazy(() => import('./KitScreen'))},
    ],
    commands: [
        {
            id: 'kit.open',
            title: 'Витрина компонентов',
            hint: 'Все примитивы в обеих темах',
            icon: 'kit',
            run: ({go}) => go('/kit'),
        },
        {
            id: 'kit.echo',
            title: 'Проверить палитру с вводом',
            hint: 'Команда с запросом значения',
            icon: 'search',
            prompt: 'Введите любой текст',
            run: ({value}) => toast({tone: 'info', title: 'Палитра передала значение', text: value || 'пусто'}),
        },
    ],
};
