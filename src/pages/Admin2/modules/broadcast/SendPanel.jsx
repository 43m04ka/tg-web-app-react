import React from 'react';
import {Badge, Button, Field, Input, Note, Stat, StatRow, Toggle} from '../../ui';
import {
    SCHEDULE_AHEAD_DAYS,
    STATE_TITLES,
    STATE_TONES,
    isVideo,
    mediaError,
    recipientsTitle
} from './broadcastModel';
import style from './BroadcastScreen.module.scss';

const sizeTitle = (bytes) => {
    const mb = bytes / (1024 * 1024);
    return mb >= 1 ? `${mb.toFixed(1)} МБ` : `${Math.round(bytes / 1024)} КБ`;
};

export default function SendPanel({
    stats,
    state,
    busy,
    media,
    schedule,
    disablePreview,
    problem,
    testDone,
    sending,
    onPickMedia,
    onDropMedia,
    onSchedule,
    onDisablePreview,
    onSendTest,
    onSendProduction
}) {
    const production = stats?.productionUniqueRecipients ?? 0;
    const admins = stats?.testAdminRecipients ?? 0;
    const badMedia = mediaError(media);

    return (
        <div className={style.send}>
            <StatRow>
                <Stat label="Получателей в бою" value={production.toLocaleString('ru-RU')}/>
                <Stat label="Админов для пробы" value={admins.toLocaleString('ru-RU')}/>
                <Stat
                    label="Очередь"
                    value={STATE_TITLES[state] || state || '—'}
                    tone={state === 'idle' ? 'positive' : 'danger'}
                />
            </StatRow>

            {busy ? (
                <Note tone="warning">
                    {state === 'running'
                        ? 'Рассылка уже идёт. Вторую сервер не примет — дождитесь конца.'
                        : 'Рассылка запланирована. Отмените её в полосе задач, чтобы отправить другую.'}
                </Note>
            ) : null}

            <div className={style.sendBlock}>
                <span className={style.sendTitle}>Медиа</span>

                {media ? (
                    <div className={style.mediaCard}>
                        <span className={style.mediaName}>{media.name}</span>
                        <span className={style.mediaMeta}>
                            {isVideo(media) ? 'Видео' : 'Изображение'} · {sizeTitle(media.size)}
                        </span>
                        <Button size="s" variant="ghost" onClick={onDropMedia}>Убрать</Button>
                    </div>
                ) : (
                    <label className={style.mediaPick}>
                        <input
                            type="file"
                            accept="image/*,video/*"
                            className={style.mediaInput}
                            onChange={(event) => {
                                const file = event.target.files?.[0] || null;
                                event.target.value = '';
                                if (file) onPickMedia(file);
                            }}
                        />
                        <span className={style.mediaPickText}>Выбрать изображение или видео</span>
                        <span className={style.mediaPickHint}>До 50 МБ. С медиа текст становится подписью, и лимит падает до 1024 знаков.</span>
                    </label>
                )}

                {badMedia ? <Note tone="danger">{badMedia}</Note> : null}
            </div>

            <div className={style.sendBlock}>
                <span className={style.sendTitle}>Отправка</span>

                <Field
                    label="Отложить запуск"
                    hint={`Пусто — уходит сразу. Максимум ${SCHEDULE_AHEAD_DAYS} дней вперёд; до запуска рассылку можно отменить в полосе задач.`}
                >
                    <Input
                        type="datetime-local"
                        value={schedule}
                        onChange={(event) => onSchedule(event.target.value)}
                    />
                </Field>

                <Toggle
                    checked={disablePreview}
                    label="Не разворачивать превью ссылок"
                    onChange={onDisablePreview}
                />
            </div>

            {problem ? <Note tone="danger">{problem}</Note> : null}

            <div className={style.sendActions}>
                <Button
                    variant="secondary"
                    disabled={busy || sending || Boolean(problem)}
                    onClick={onSendTest}
                >
                    {sending === 'test' ? 'Отправляем…' : `Проба на админов (${admins})`}
                </Button>

                <Button
                    variant="danger"
                    disabled={busy || sending || Boolean(problem) || !testDone}
                    onClick={onSendProduction}
                >
                    {sending === 'production' ? 'Отправляем…' : `Отправить всем — ${recipientsTitle(production)}`}
                </Button>
            </div>

            {testDone ? (
                <Badge tone="positive">Проба этого сообщения отправлена</Badge>
            ) : (
                <Note tone="warning">
                    Боевая отправка откроется после пробы. Проба уходит только админам, показывает
                    сообщение ровно таким, каким его получит покупатель, и ловит то, чего не видно
                    в предпросмотре: битые ссылки, обрезанную подпись, неработающие кнопки.
                    Любая правка сбрасывает пробу.
                </Note>
            )}
        </div>
    );
}
