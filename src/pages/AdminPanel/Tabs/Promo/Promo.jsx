import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import style from './Promo.module.scss';
import {useServer} from './useServer';
import useData from '../../useData';
import WorkTabs, {useWorkTabs} from '../../Elements/WorkTabs/WorkTabs';
import {useFeedback} from '../../Elements/Feedback/Feedback';
import PromoForm from './PromoForm';

// ПРОМОКОДЫ
// ---------
// Плоский список без сплита: у промокода всего четыре поля, отдельная панель справа
// была бы пустой. Строка открывает вкладку с формой — тем же способом, что и «Заказы».

const PromoList = ({onCountChange}) => {
    const {authenticationData} = useData();
    const server = useServer();
    const serverRef = useRef(server);
    serverRef.current = server;

    const authRef = useRef(authenticationData);
    authRef.current = authenticationData;

    const {openTab, closeTab, updateTab} = useWorkTabs();
    const {showToast} = useFeedback();

    const [promoList, setPromoList] = useState(null);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    // Вкладка живёт дольше рендера, в котором её открыли, поэтому внутрь уходят только
    // id и стабильные колбэки: сам промокод форма достаёт из актуального списка через ref
    const listRef = useRef([]);
    listRef.current = promoList || [];

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const result = await serverRef.current.getPromoList(authRef.current);
            setPromoList(result);
        } catch (error) {
            showToast(error.message || 'Не удалось загрузить список промокодов', 'error');
            setPromoList([]);
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    useEffect(() => { load(); }, [load]);

    const visibleList = useMemo(() => {
        const query = search.trim().toLowerCase();
        const list = promoList || [];

        if (!query) return list;

        return list.filter((promo) => String(promo.name || '').toLowerCase().includes(query)
            || String(promo.percent ?? '').includes(query));
    }, [promoList, search]);

    useEffect(() => {
        if (loading) {
            onCountChange('Загрузка…');
            return;
        }
        onCountChange(`${visibleList.length} из ${(promoList || []).length}`);
    }, [loading, visibleList.length, promoList, onCountChange]);

    const findPromo = useCallback(
        (promoId) => listRef.current.find((promo) => promo.id === promoId) || null,
        [],
    );

    const openPromo = useCallback((promo) => {
        const id = promo ? `promo-${promo.id}` : 'promo-new';

        openTab({
            id,
            title: promo ? promo.name || `Промокод ${promo.id}` : 'Новый промокод',
            subtitle: promo ? `${promo.percent ?? 0}% · осталось ${promo.totalNumberUses ?? 0}` : 'Создание',
            entity: 'promo',
            entityId: promo?.id ?? -1,
            content: (
                <PromoForm
                    promoId={promo?.id ?? -1}
                    findPromo={findPromo}
                    onClose={() => closeTab(id)}
                    onSaved={load}
                />
            ),
        });
    }, [openTab, closeTab, findPromo, load]);

    // Переименование или смена процента не закрывает вкладку, а обновляет её подпись
    useEffect(() => {
        (promoList || []).forEach((promo) => updateTab(`promo-${promo.id}`, {
            title: promo.name || `Промокод ${promo.id}`,
            subtitle: `${promo.percent ?? 0}% · осталось ${promo.totalNumberUses ?? 0}`,
        }));
    }, [promoList, updateTab]);

    return (
        <div className={style['screen']}>
            <header className={style['header']}>
                <div className={style['headerTop']}>
                    <h1 className={style['title']}>Промокоды</h1>
                    <span className={style['counter']}>
                        {loading ? 'Загрузка…' : `${visibleList.length} из ${(promoList || []).length}`}
                    </span>
                </div>

                <div className={style['toolbar']}>
                    <div className={style['searchField']}>
                        <svg className={style['searchIcon']} viewBox="0 0 24 24" width="16" height="16"
                             fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                            <circle cx="11" cy="11" r="7"/>
                            <path d="m20 20-3.5-3.5" strokeLinecap="round"/>
                        </svg>
                        <input className={style['searchInput']}
                               placeholder="Поиск по названию или проценту"
                               value={search}
                               onChange={(event) => setSearch(event.target.value)}/>
                        {search ? (
                            <button type="button" className={style['searchClear']}
                                    onClick={() => setSearch('')} aria-label="Очистить">
                                ✕
                            </button>
                        ) : null}
                    </div>

                    <button type="button" className={`${style['btn']} ${style['btnPrimary']}`}
                            onClick={() => openPromo(null)}>
                        Создать
                    </button>
                    <button type="button" className={style['btn']} onClick={load}>
                        Обновить
                    </button>
                </div>
            </header>

            <div className={style['tableWrap']}>
                <table className={style['table']}>
                    <thead>
                        <tr>
                            <th>Название</th>
                            <th className={style['percentCol']}>Скидка</th>
                            <th className={style['usesCol']}>Осталось использований</th>
                            <th className={style['usesCol']}>Лимит на пользователя</th>
                        </tr>
                    </thead>
                    <tbody>
                        {visibleList.length === 0 ? (
                            <tr>
                                <td className={style['emptyCell']} colSpan={4}>
                                    {loading
                                        ? 'Загрузка…'
                                        : (search.trim() ? 'Под поиск ничего не подошло' : 'Промокодов пока нет')}
                                </td>
                            </tr>
                        ) : visibleList.map((promo) => (
                            <tr key={promo.id} onClick={() => openPromo(promo)}>
                                <td className={style['nameCell']}>{promo.name || '—'}</td>
                                <td className={style['percentCol']}>
                                    <span className={style['badge']}>{promo.percent ?? 0}%</span>
                                </td>
                                <td className={style['usesCol']}>
                                    {(promo.totalNumberUses ?? 0) > 0 ? (
                                        <span className={style['mono']}>{promo.totalNumberUses}</span>
                                    ) : (
                                        <span className={`${style['badge']} ${style['badgeSpent']}`}>исчерпан</span>
                                    )}
                                </td>
                                <td className={`${style['usesCol']} ${style['mono']}`}>
                                    {(promo.personalNumberUses ?? 0) > 0 ? promo.personalNumberUses : 'без лимита'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const Promo = () => {
    const [subtitle, setSubtitle] = useState('');

    return (
        <WorkTabs rootTitle="Промокоды" rootSubtitle={subtitle}>
            <PromoList onCountChange={setSubtitle}/>
        </WorkTabs>
    );
};

export default Promo;
