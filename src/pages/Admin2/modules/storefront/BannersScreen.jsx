import React, {useCallback, useMemo, useState} from 'react';
import {
    Badge,
    Button,
    EmptyState,
    ErrorState,
    IconButton,
    Note,
    Panel,
    SkeletonRows,
    Workspace
} from '../../ui';
import {usePageHeader} from '../../shell/pageHeader';
import HeaderActions from '../../shell/HeaderActions';
import {toastFail} from '../../platform/notify';
import {invalidate} from '../../platform/cache';
import {keys} from '../../platform/resources';
import {useResource} from '../../platform/useResource';
import BannerCarousel from '../../../Main/BannerCarousel';
import {fetchBanners, fetchPages, updateBanner} from './api';
import {bannerScope, bannerTitle, moveBanner, sortBanners} from './bannerModel';
import BannerInspector from './BannerInspector';
import StorefrontTabs from './StorefrontTabs';
import style from './StorefrontScreen.module.scss';

export default function BannersScreen() {
    usePageHeader('Витрина');

    const [editing, setEditing] = useState(null);
    const [isBusy, setBusy] = useState(false);

    const banners = useResource(keys.banners, fetchBanners);
    const pages = useResource(keys.pages, fetchPages);

    const rows = useMemo(() => sortBanners(banners.data?.result), [banners.data]);
    const pageList = useMemo(() => pages.data?.result || [], [pages.data]);

    const visible = useMemo(() => rows.filter((item) => !item.isHidden), [rows]);

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

            invalidate(keys.banners);
        } catch (error) {
            toastFail(error.message || 'Не получилось переставить', error.hint || '');

            invalidate(keys.banners);
        } finally {
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

    if (banners.error && !banners.data) {
        return (
            <Workspace>
                <ErrorState error={banners.error} onRetry={banners.refresh}/>
            </Workspace>
        );
    }

    return (
        <Workspace>
            <HeaderActions>
                <StorefrontTabs active="banners"/>
                <Button size="s" variant="ghost" onClick={banners.refresh}>Обновить</Button>
            </HeaderActions>

            <Panel
                title="Баннеры"
                subtitle={`${visible.length} в карусели`}
                wide
                scroll
                actions={(
                    <Button size="s" variant="primary" onClick={() => setEditing({item: null})}>
                        Новый баннер
                    </Button>
                )}
            >
                <Note tone="neutral">
                    Это и есть карусель наверху главной. Баннер товара берёт цену и картинку из
                    карточки на лету, поэтому после парсинга его не нужно пересохранять.
                </Note>

                {banners.isLoading && !banners.data ? <SkeletonRows count={5}/> : null}

                {banners.data && rows.length === 0 ? (
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
                                <span className={style.blockNote}>
                                    {item.type === 'product' ? 'Товар' : 'Произвольный'}
                                    {' · '}
                                    {bannerScope(item, pageList)}
                                </span>
                            </span>

                            {item.isHidden ? <Badge tone="neutral">скрыт</Badge> : null}

                            <span className={style.blockTools}>
                                <IconButton
                                    label="Выше"
                                    disabled={index === 0 || isBusy}
                                    onClick={() => reorder(item.id, -1)}
                                >
                                    ↑
                                </IconButton>
                                <IconButton
                                    label="Ниже"
                                    disabled={index === rows.length - 1 || isBusy}
                                    onClick={() => reorder(item.id, 1)}
                                >
                                    ↓
                                </IconButton>
                                <Button size="s" variant="ghost" onClick={() => toggleHidden(item)}>
                                    {item.isHidden ? 'Показать' : 'Скрыть'}
                                </Button>
                                <Button size="s" variant="ghost" onClick={() => setEditing({item})}>
                                    Править
                                </Button>
                            </span>
                        </div>
                    ))}
                </div>
            </Panel>

            <aside className={style.preview}>
                <header className={style.previewHead}>
                    <span className={style.previewTitle}>Как увидит покупатель</span>
                </header>

                <div className={style.previewBody}>
                    {visible.length === 0 ? (
                        <p className={style.previewEmpty}>Видимых баннеров нет</p>
                    ) : (
                        <div className={style.phone}>
                            <div className={`${style.phoneScreen} ${style.phoneStatic}`}>
                                <BannerCarousel items={visible}/>
                            </div>
                        </div>
                    )}
                </div>
            </aside>

            {editing ? (
                <BannerInspector
                    banner={editing.item}
                    pages={pageList}
                    count={rows.length}
                    onClose={() => setEditing(null)}
                />
            ) : null}
        </Workspace>
    );
}
