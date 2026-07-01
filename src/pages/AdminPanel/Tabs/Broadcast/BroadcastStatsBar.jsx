import React from 'react';
import style from './Broadcast.module.scss';

const BroadcastStatsBar = ({stats, error, onReload, loading}) => (
    <div className={style['statsBar']}>
        <div className={style['statsBarHeader']}>
            <span className={style['statsBarTitle']}>Получатели</span>
            <button type="button" className={style['statsReload']} onClick={onReload} disabled={loading}>
                ⟳ Обновить
            </button>
        </div>
        {error ? <p className={style['statsError']}>{error}</p> : null}
        {stats && !error ? (
            <div className={style['statsGrid']}>
                <div className={style['statsItem']}>
                    <span className={style['statsLabel']}>Production (уникальные TG)</span>
                    <span className={style['statsValue']}>{stats.productionUniqueRecipients ?? '—'}</span>
                </div>
                <div className={style['statsItem']}>
                    <span className={style['statsLabel']}>Тест: админы</span>
                    <span className={style['statsValue']}>
                        {Array.isArray(stats.testAdminRecipients)
                            ? stats.testAdminRecipients.length
                            : stats.testAdminChatIds?.length ?? '—'}
                    </span>
                </div>
                {stats.limits ? (
                    <div className={style['statsItemWide']}>
                        <span className={style['statsLabel']}>Лимиты бэка</span>
                        <span className={style['statsMeta']}>
                            text ≤ {stats.limits.messageHtmlMaxChars ?? 4096} симв.; подпись к медиа ≤{' '}
                            {stats.limits.captionHtmlMaxChars ?? 1024}; parse_mode:{' '}
                            {stats.limits.parseMode ?? 'HTML'}
                            {stats.limits.maxFileBytes != null
                                ? `; файл ≤ ${Math.round(stats.limits.maxFileBytes / (1024 * 1024))} МБ`
                                : ''}
                            {stats.limits.inlineKeyboard ? (
                                <>
                                    {' '}
                                    · кнопки: до {stats.limits.inlineKeyboard.maxRows ?? 100} рядов, до{' '}
                                    {stats.limits.inlineKeyboard.maxButtons ?? 100} кнопок
                                </>
                            ) : null}
                        </span>
                    </div>
                ) : null}
            </div>
        ) : null}
    </div>
);

export default BroadcastStatsBar;
