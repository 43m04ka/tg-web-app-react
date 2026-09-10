import React, {useCallback, useState} from 'react';
import {Badge, Button, EmptyState, IconButton, Note, SkeletonRows} from '../../ui';
import {toastFail} from '../../platform/notify';
import {invalidate} from '../../platform/cache';
import {keys} from '../../platform/resources';
import {updateBanner} from './api';
import {bannerScope, bannerTitle, moveBanner} from './bannerModel';
import BannerInspector from './BannerInspector';
import style from './StorefrontScreen.module.scss';

export default function PageBanners({page, rows, total, pages, isLoading}) {
    const [editing, setEditing] = useState(null);
    const [isBusy, setBusy] = useState(false);

    const reorder = useCallback(async (id, delta) => {
        const moved = moveBanner(rows, id, delta);
        if (!moved || isBusy) return;

        setBusy(true);

        try {
            const changed = moved.filter((item) => {
                const before = rows.find((row) => row.id === item.id);
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
    }, [rows, isBusy]);

    const toggleHidden = useCallback(async (item) => {
        try {
            await updateBanner(item.id, {isHidden: item.isHidden ? 0 : 1});
            invalidate(keys.banners);
        } catch (error) {
            toastFail(error.message || 'Не получилось переключить', error.hint || '');
        }
    }, []);

    return (
        <>
            <div className={style.bannerBar}>
                <Note tone="neutral">
                    Карусель наверху главной. Здесь баннеры этой страницы и общие для всех витрин.
                    Баннер товара берёт цену и картинку из карточки на лету.
                </Note>
                <Button size="s" variant="primary" onClick={() => setEditing({item: null})}>
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

            <div className={style.blocks}>
                {rows.map((item, index) => (
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
                                {item.isHidden ? <Badge tone="warning">скрыт</Badge> : null}
                            </span>
                        </span>

                        <span className={style.blockTools}>
                            <IconButton label="Выше" disabled={index === 0 || isBusy} onClick={() => reorder(item.id, -1)}>↑</IconButton>
                            <IconButton label="Ниже" disabled={index === rows.length - 1 || isBusy} onClick={() => reorder(item.id, 1)}>↓</IconButton>
                            <Button size="s" variant="ghost" onClick={() => toggleHidden(item)}>
                                {item.isHidden ? 'Показать' : 'Скрыть'}
                            </Button>
                            <Button size="s" variant="ghost" onClick={() => setEditing({item})}>Править</Button>
                        </span>
                    </div>
                ))}
            </div>

            {editing ? (
                <BannerInspector
                    banner={editing.item}
                    pages={pages}
                    count={total}
                    pageId={page?.id ?? null}
                    onClose={() => setEditing(null)}
                />
            ) : null}
        </>
    );
}
