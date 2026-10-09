import React, {useCallback, useState} from 'react';
import {Badge, Button, EmptyState, IconButton, Note, SkeletonRows} from '../../ui';
import {toastFail} from '../../platform/notify';
import {invalidate} from '../../platform/cache';
import {keys} from '../../platform/resources';
import {updateBanner} from './api';
import {bannerScope, bannerTitle, moveBanner} from './bannerModel';
import style from './StorefrontScreen.module.scss';

const SLOT_GROUPS = [
    {slot: 'main', title: 'Главная карусель', empty: 'Больших баннеров нет'},
    {slot: 'side', title: 'Побочная карусель справа', empty: 'Малых баннеров нет'}
];

const slotOf = (item) => (item.data?.slot === 'side' ? 'side' : 'main');

export default function PageBanners({rows, all, pages, isLoading, bySlot = false, onEdit}) {
    const [isBusy, setBusy] = useState(false);

    const reorder = useCallback(async (list, id, delta) => {
        const source = all || rows;
        const moved = moveBanner(list, id, delta, source);
        if (!moved || isBusy) return;

        setBusy(true);

        try {
            const changed = moved.filter((item) => {
                const before = source.find((row) => row.id === item.id);
                return before && before.serialNumber !== item.serialNumber;
            });

            for (const item of changed) {
                await updateBanner(item.id, {serialNumber: item.serialNumber});
            }
        } catch (error) {
            toastFail(error.message || 'Не получилось переставить', error.hint || '');
        } finally {
            invalidate(keys.banners);
            setBusy(false);
        }
    }, [rows, all, isBusy]);

    const toggleHidden = useCallback(async (item) => {
        try {
            await updateBanner(item.id, {isHidden: item.isHidden ? 0 : 1});
            invalidate(keys.banners);
        } catch (error) {
            toastFail(error.message || 'Не получилось переключить', error.hint || '');
        }
    }, []);

    const renderRows = (list) => (
        <div className={style.blocks}>
            {list.map((item, index) => (
                <div key={item.id} className={style.block}>
                    <span className={style.blockOrder}>{index + 1}</span>

                    <span
                        className={style.bannerArt}
                        style={item.data?.image
                            ? {backgroundImage: `url(${item.data.image})`}
                            : {background: item.data?.gradient || 'var(--a2-raised)'}}
                    />

                    <span className={style.blockBody}>
                        <span className={style.blockTitle}>{bannerTitle(item)}</span>
                        <span className={style.blockMeta}>
                            <Badge tone="neutral">{item.type === 'product' ? 'Товар' : 'Произвольный'}</Badge>
                            <span className={style.blockNote}>{bannerScope(item, pages)}</span>
                            {!bySlot && slotOf(item) === 'side' ? <Badge tone="neutral">справа</Badge> : null}
                            {item.isHidden ? <Badge tone="warning">скрыт</Badge> : null}
                        </span>
                    </span>

                    <span className={style.blockTools}>
                        <IconButton label="Выше" disabled={index === 0 || isBusy} onClick={() => reorder(list, item.id, -1)}>↑</IconButton>
                        <IconButton label="Ниже" disabled={index === list.length - 1 || isBusy} onClick={() => reorder(list, item.id, 1)}>↓</IconButton>
                        <Button size="s" variant="ghost" onClick={() => toggleHidden(item)}>
                            {item.isHidden ? 'Показать' : 'Скрыть'}
                        </Button>
                        <Button size="s" variant="ghost" onClick={() => onEdit(item)}>Править</Button>
                    </span>
                </div>
            ))}
        </div>
    );

    if (bySlot) {
        return (
            <>
                <div className={style.bannerBar}>
                    <Note tone="neutral">
                        Баннеры этой страницы и общие для всех витрин. Баннер товара берёт цену и картинку
                        из карточки на лету.
                    </Note>
                </div>

                {isLoading ? <SkeletonRows count={4}/> : <div className={style.bannerColumns}>{SLOT_GROUPS.map((group) => {
                    const list = rows.filter((item) => slotOf(item) === group.slot);

                    return (
                        <section key={group.slot} className={style.bannerGroup}>
                            <div className={style.bannerGroupHead}>
                                <span className={style.bannerGroupTitle}>
                                    {group.title}
                                    <span className={style.bannerGroupCount}>{list.length}</span>
                                </span>
                                <Button size="s" variant="primary" onClick={() => onEdit(null, group.slot)}>
                                    Новый баннер
                                </Button>
                            </div>

                            {list.length ? renderRows(list) : <div className={style.bannerGroupEmpty}>{group.empty}</div>}
                        </section>
                    );
                })}</div>}
            </>
        );
    }

    return (
        <>
            <div className={style.bannerBar}>
                <Note tone="neutral">
                    Карусель наверху главной. Здесь баннеры этой страницы и общие для всех витрин.
                    Баннер товара берёт цену и картинку из карточки на лету.
                </Note>
                <Button size="s" variant="primary" onClick={() => onEdit(null)}>
                    Новый баннер
                </Button>
            </div>

            {isLoading ? <SkeletonRows count={4}/> : null}

            {!isLoading && rows.length === 0 ? (
                <EmptyState
                    title="Баннеров нет"
                    text="Пока карусель пуста, витрина держит на её месте серые прямоугольники."
                />
            ) : null}

            {renderRows(rows)}
        </>
    );
}
