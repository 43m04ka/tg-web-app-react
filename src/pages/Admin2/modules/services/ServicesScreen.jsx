import React, {useCallback, useMemo} from 'react';
import {useNavigate, useParams, useSearchParams} from 'react-router-dom';
import {
    Badge,
    Button,
    EmptyState,
    ErrorState,
    Panel,
    SkeletonRows,
    Tabs,
    Workspace,
} from '../../ui';
import {usePageHeader} from '../../shell/pageHeader';
import {useResource} from '../../platform/useResource';
import {useMutation} from '../../platform/useMutation';
import {keys} from '../../platform/resources';
import {createBrand, fetchTree} from './api';
import BrandForm from './BrandForm';
import OffersMatrix from './OffersMatrix';
import CatalogLinks from './CatalogLinks';
import StockPanel from './StockPanel';
import PageSettings from './PageSettings';
import style from './ServicesScreen.module.scss';

const TABS = [
    {id: 'brand', title: 'Оформление'},
    {id: 'offers', title: 'Предложения'},
    {id: 'links', title: 'Каталоги'},
    {id: 'stock', title: 'Склад'},
];

const stockOf = (brand) => (brand.offers || []).reduce(
    (sum, offer) => sum + (offer.stock?.available || 0),
    0,
);

const emptyStockOf = (brand) => (brand.offers || [])
    .filter((offer) => !offer.fromCatalog && offer.fulfillment === 'code' && !offer.stock?.available)
    .length;

export default function ServicesScreen() {
    usePageHeader('Сервисы');

    const navigate = useNavigate();
    const {brandId} = useParams();
    const [params, setParams] = useSearchParams();
    const tab = params.get('tab') || 'brand';

    const tree = useResource(keys.serviceTree, fetchTree);
    const brands = useMemo(() => tree.data?.result || [], [tree.data]);

    const current = useMemo(
        () => brands.find((brand) => String(brand.id) === String(brandId)) || null,
        [brands, brandId],
    );

    const add = useMutation(createBrand, {
        invalidates: [keys.services],
        done: 'Бренд создан',
        onDone: (result) => {
            const id = result?.result?.id;
            if (id) navigate(`/admin2/services/${id}`);
        },
    });

    const openBrand = useCallback((id) => navigate(`/admin2/services/${id}`), [navigate]);

    const setTab = useCallback((next) => {
        setParams((current) => {
            const draft = new URLSearchParams(current);
            if (next === 'brand') draft.delete('tab');
            else draft.set('tab', next);
            return draft;
        }, {replace: true});
    }, [setParams]);

    const onCreate = useCallback(() => {
        add.run({
            name: 'Новый бренд',
            glyph: '🎁',
            serialNumber: brands.length,
            isHidden: true,
            catalogLinks: [],
        });
    }, [add, brands.length]);

    return (
        <Workspace>
            <section className={style.list}>
                <header className={style.listHead}>
                    <span className={style.listTitle}>Бренды</span>
                    <Button size="s" variant="secondary" loading={add.loading} onClick={onCreate}>Добавить</Button>
                </header>

                <div className={style.listBody}>
                    <button
                        type="button"
                        className={[style.item, brandId === 'page' && style.itemActive].filter(Boolean).join(' ')}
                        onClick={() => navigate('/admin2/services/page')}
                    >
                        <span className={style.glyph}>⚙</span>
                        <span className={style.itemBody}>
                            <span className={style.itemName}>Страница витрины</span>
                            <span className={style.itemNote}>Как «Сервисы» показаны в боте</span>
                        </span>
                    </button>

                    {tree.isLoading ? <div className={style.pad}><SkeletonRows count={6}/></div> : null}

                    {tree.error ? (
                        <div className={style.pad}><ErrorState error={tree.error} onRetry={tree.refresh}/></div>
                    ) : null}

                    {!tree.isLoading && !tree.error && !brands.length ? (
                        <div className={style.pad}>
                            <EmptyState
                                title="Брендов пока нет"
                                text="Бренд — это Steam, PSN, Netflix и подобные. Внутри бренда живут тарифы и номиналы."
                                action={{title: 'Создать первый', run: onCreate}}
                            />
                        </div>
                    ) : null}

                    {brands.map((brand) => (
                        <button
                            key={brand.id}
                            type="button"
                            className={[style.item, String(brand.id) === String(brandId) && style.itemActive]
                                .filter(Boolean).join(' ')}
                            onClick={() => openBrand(brand.id)}
                        >
                            {brand.icon
                                ? <img className={style.icon} src={brand.icon} alt=""/>
                                : <span className={style.glyph}>{brand.glyph || '🎁'}</span>}

                            <span className={style.itemBody}>
                                <span className={style.itemName}>
                                    {brand.name}
                                    {brand.isHidden ? <Badge tone="neutral">скрыт</Badge> : null}
                                    {emptyStockOf(brand) ? <Badge tone="warning">{`без кодов: ${emptyStockOf(brand)}`}</Badge> : null}
                                </span>
                                <span className={style.itemNote}>
                                    {(brand.offers || []).length} предложений · склад {stockOf(brand)}
                                </span>
                            </span>
                        </button>
                    ))}
                </div>
            </section>

            {brandId === 'page' ? (
                <PageSettings/>
            ) : !current ? (
                <Panel scroll wide>
                    <EmptyState
                        title="Выберите бренд"
                        text="Слева — бренды витрины «Сервисы» и настройки самой страницы в боте."
                    />
                </Panel>
            ) : (
                <Panel
                    wide
                    title={current.name}
                    subtitle={`${(current.offers || []).length} предложений · свободных кодов ${stockOf(current)}`}
                >
                    <div className={style.tabs}>
                        <Tabs items={TABS} value={tab} onChange={setTab}/>
                    </div>

                    <div className={style.content}>
                        {tab === 'brand' ? <BrandForm brand={current}/> : null}
                        {tab === 'offers' ? <OffersMatrix brand={current}/> : null}
                        {tab === 'links' ? <CatalogLinks brand={current}/> : null}
                        {tab === 'stock' ? <StockPanel brand={current}/> : null}
                    </div>
                </Panel>
            )}
        </Workspace>
    );
}
