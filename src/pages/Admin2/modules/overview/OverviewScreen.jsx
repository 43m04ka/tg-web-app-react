import React from 'react';
import {http} from '../../platform/http';
import {keys} from '../../platform/resources';
import {useResource} from '../../platform/useResource';
import {summarize, useTasks} from '../../platform/tasks';
import {usePageHeader} from '../../shell/pageHeader';
import HeaderActions from '../../shell/HeaderActions';
import {Badge, Dot} from '../../ui/primitives/Badge';
import {Button} from '../../ui/primitives/Button';
import {Stat, StatRow} from '../../ui/primitives/Data';
import {EmptyState, ErrorState, Note, Skeleton} from '../../ui/primitives/Feedback';
import style from './OverviewScreen.module.scss';

const valueOf = (settings, key) => {
    const entry = settings?.[key];
    if (entry && typeof entry === 'object' && 'value' in entry) return entry.value;
    return entry;
};

export default function OverviewScreen() {
    usePageHeader('Что происходит');

    const tasks = useTasks();
    const {running, waiting, noticeCount, alarming} = summarize(tasks);

    const settings = useResource(keys.settings, () => http('/settings/public'));
    const maintenance = valueOf(settings.data?.settings, 'maintenance_mode');
    const maintenanceUntil = valueOf(settings.data?.settings, 'maintenance_mode_until');

    return (
        <div className={style.screen}>
            <HeaderActions>
                <Button variant="ghost" size="s" onClick={settings.refresh}>Обновить</Button>
            </HeaderActions>

            <section className={style.section}>
                <StatRow>
                    <Stat
                        label="Задачи в работе"
                        value={running.length}
                        note={waiting.length ? `ещё ${waiting.length} в очереди` : 'очередь пуста'}
                    />
                    <Stat
                        label="Итоги без разбора"
                        value={noticeCount}
                        tone={alarming ? 'danger' : 'default'}
                        note={alarming ? 'есть завершения с ошибкой' : 'ошибок нет'}
                    />
                    <Stat
                        label="Витрина"
                        value={settings.isLoading ? <Skeleton width={80} height={18}/> : (maintenance ? 'Техработы' : 'Работает')}
                        tone={maintenance ? 'danger' : 'positive'}
                        note={maintenance && maintenanceUntil ? `до ${maintenanceUntil}` : ''}
                    />
                </StatRow>

                {settings.error ? <ErrorState error={settings.error} onRetry={settings.refresh}/> : null}
            </section>

            <section className={style.section}>
                <header className={style.head}>
                    <h2 className={style.title}>Деньги и заказы</h2>
                    <Badge tone="neutral">ждёт трек B1</Badge>
                </header>

                <EmptyState
                    title="Метрики появятся вместе с серверным треком B1"
                    text="Выручка, доля оплаченных, средний чек и остатки складов считаются на сервере одним запросом. Пока такого эндпоинта нет, показывать здесь нечего — цифры, посчитанные в браузере, врали бы."
                />
            </section>

            <section className={style.section}>
                <header className={style.head}>
                    <h2 className={style.title}>Фон</h2>
                    <span className={style.hint}>
                        <Dot tone={tasks.error ? 'danger' : 'positive'}/>
                        {tasks.error ? 'связь с сервером потеряна' : 'опрос раз в 3 секунды'}
                    </span>
                </header>

                <Note>
                    Полоса задач внизу экрана показывает всё, что идёт в фоне: парсы, очередь источников
                    и итоги завершённых задач. Она общая для всех разделов и не теряет прогресс при переходах.
                </Note>
            </section>
        </div>
    );
}
