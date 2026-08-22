import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import s from './StructurePanel.module.scss';
import {useServer} from '../useServer';
import useData from '../../../useData';
import {useFeedback} from '../../../Elements/Feedback/Feedback';
import BannerForm from './BannerForm';
import {BANNER_TYPES, TYPE_LABELS, formatPrice, formatPromoDate} from './bannerContent';

// БАННЕРЫ СТРАНИЦЫ
// ----------------
// Третья группа правой половины «Страниц», рядом с каруселью и телом сайта.
// Отдельного раздела меню у баннеров нет намеренно: их настраивают там же,
// где выбрали витрину, а не выбирая её второй раз в другом месте.
//
// В списке видны баннеры этой страницы и общие (pageId = null) — общие правятся
// отсюда же, но помечены, чтобы никто не менял их, думая, что трогает только свою витрину.

const BannerPanel = ({page}) => {
    const {getBannerList, createBanner, updateBanner, deleteBanner, searchBannerSources} = useServer();
    const {authenticationData} = useData();
    const {showToast, confirm} = useFeedback();

    const serverRef = useRef(null);
    serverRef.current = {getBannerList, createBanner, updateBanner, deleteBanner, searchBannerSources};

    const authRef = useRef(authenticationData);
    authRef.current = authenticationData;

    const [all, setAll] = useState([]);
    const [loading, setLoading] = useState(false);
    const [busy, setBusy] = useState(false);
    const [editing, setEditing] = useState(null);
    const [dragId, setDragId] = useState(null);

    const pageId = page?.id ?? null;

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const result = await serverRef.current.getBannerList();
            setAll(Array.isArray(result) ? result : []);
        } catch (error) {
            showToast(error.message || 'Не удалось загрузить баннеры', 'error');
            setAll([]);
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        setEditing(null);
        load();
    }, [load, pageId]);

    const items = useMemo(
        () => all
            .filter((banner) => banner.pageId === null || banner.pageId === pageId)
            .sort((a, b) => a.serialNumber - b.serialNumber),
        [all, pageId],
    );

    const persistOrder = useCallback(async (ordered) => {
        const changed = ordered
            .map((banner, index) => ({banner, serialNumber: index}))
            .filter(({banner, serialNumber}) => banner.serialNumber !== serialNumber);

        if (!changed.length) return;

        setBusy(true);
        try {
            for (const {banner, serialNumber} of changed) {
                await serverRef.current.updateBanner(authRef.current, banner.id, {serialNumber});
            }
            await load();
        } catch (error) {
            showToast(error.message || 'Не удалось изменить порядок', 'error');
        } finally {
            setBusy(false);
        }
    }, [load, showToast]);

    const move = useCallback((banner, delta) => {
        const index = items.findIndex((entry) => entry.id === banner.id);
        const target = index + delta;
        if (index === -1 || target < 0 || target >= items.length) return;

        const ordered = [...items];
        ordered.splice(target, 0, ordered.splice(index, 1)[0]);
        persistOrder(ordered);
    }, [items, persistOrder]);

    const handleDrop = (targetBanner) => {
        if (dragId === null || dragId === targetBanner.id) {
            setDragId(null);
            return;
        }

        const from = items.findIndex((entry) => entry.id === dragId);
        const to = items.findIndex((entry) => entry.id === targetBanner.id);
        setDragId(null);
        if (from === -1 || to === -1) return;

        const ordered = [...items];
        ordered.splice(to, 0, ordered.splice(from, 1)[0]);
        persistOrder(ordered);
    };

    const handleSubmit = async (payload) => {
        try {
            if (editing?.item?.id) {
                await serverRef.current.updateBanner(authRef.current, editing.item.id, payload);
                showToast('Баннер сохранён', 'success');
            } else {
                await serverRef.current.createBanner(authRef.current, {
                    ...payload,
                    serialNumber: items.length,
                });
                showToast('Баннер создан', 'success');
            }
            setEditing(null);
            await load();
        } catch (error) {
            showToast(error.message || 'Не удалось сохранить баннер', 'error');
        }
    };

    const handleDelete = async (banner) => {
        const agreed = await confirm({
            title: 'Удалить баннер?',
            text: `«${banner.data?.title || TYPE_LABELS[banner.type]}» пропадёт из карусели сразу. Действие необратимо.`,
            confirmLabel: 'Удалить',
            danger: true,
        });
        if (!agreed) return;

        setBusy(true);
        try {
            await serverRef.current.deleteBanner(authRef.current, banner.id);
            showToast('Баннер удалён', 'success');
            await load();
        } catch (error) {
            showToast(error.message || 'Не удалось удалить баннер', 'error');
        } finally {
            setBusy(false);
        }
    };

    if (editing) {
        return (
            <BannerForm
                item={editing.item}
                pageId={pageId}
                searchSources={searchBannerSources}
                onSubmit={handleSubmit}
                onCancel={() => setEditing(null)}
                showToast={showToast}
            />
        );
    }

    return (
        <>
            <div className={s['panelTools']}>
                {BANNER_TYPES.map((type) => (
                    <button key={type} type="button"
                            className={`${s['btn']} ${type === 'product' ? s['btnPrimary'] : ''}`}
                            disabled={busy}
                            onClick={() => setEditing({item: {type, pageId, serialNumber: items.length}})}>
                        + {TYPE_LABELS[type]}
                    </button>
                ))}
                <button type="button" className={s['btn']} disabled={busy} onClick={load}>Обновить</button>
            </div>

            <div className={s['blockList']}>
                {loading ? (
                    <p className={s['empty']}>Загрузка…</p>
                ) : items.length === 0 ? (
                    <p className={s['empty']}>
                        У этой витрины пока нет баннеров — добавьте первый кнопкой сверху
                    </p>
                ) : items.map((banner, index) => {
                    const data = banner.data || {};
                    const price = formatPrice(data.price);
                    const promo = formatPromoDate(data.promoEndDate);

                    return (
                        <article key={banner.id}
                                 className={`${s['block']} ${dragId === banner.id ? s['blockDragging'] : ''}`}
                                 draggable
                                 onDragStart={() => setDragId(banner.id)}
                                 onDragOver={(event) => event.preventDefault()}
                                 onDrop={() => handleDrop(banner)}
                                 onDoubleClick={() => setEditing({item: banner})}>
                            <div className={s['blockOrder']}>
                                <span className={s['blockNum']}>{index + 1}</span>
                                <button type="button" className={s['moveBtn']}
                                        disabled={busy || index === 0}
                                        title="Выше" onClick={() => move(banner, -1)}>↑
                                </button>
                                <button type="button" className={s['moveBtn']}
                                        disabled={busy || index === items.length - 1}
                                        title="Ниже" onClick={() => move(banner, 1)}>↓
                                </button>
                            </div>

                            <div className={s['blockPreview']}>
                                {data.image ? (
                                    <img className={s['blockImage']} src={data.image} alt=""
                                         style={data.imageFit === 'coverTop' ? {objectPosition: 'top center'} : undefined}/>
                                ) : (
                                    <span className={s['blockNoImage']}
                                          style={data.gradient ? {background: data.gradient} : undefined}/>
                                )}
                            </div>

                            <div className={s['blockBody']}>
                                <span className={s['blockTitle']}>{data.title || TYPE_LABELS[banner.type]}</span>
                                <span className={s['blockMeta']}>
                                    <span className={s['blockKind']}>{TYPE_LABELS[banner.type]}</span>
                                    <span className={s['blockTarget']}>
                                        {banner.pageId === null ? 'на всех витринах' : 'только эта витрина'}
                                        {price ? ` · ${price}` : ''}
                                        {promo ? ` · до ${promo}` : ''}
                                        {banner.isHidden === 1 ? ' · скрыт' : ''}
                                    </span>
                                </span>
                            </div>

                            <div className={s['blockActions']}>
                                <button type="button" className={s['btn']} onClick={() => setEditing({item: banner})}>
                                    Изменить
                                </button>
                                <button type="button" className={`${s['btn']} ${s['btnDanger']}`}
                                        disabled={busy} onClick={() => handleDelete(banner)}>
                                    Удалить
                                </button>
                            </div>
                        </article>
                    );
                })}
            </div>
        </>
    );
};

export default BannerPanel;
