import React, {useCallback, useEffect, useMemo, useState} from 'react';
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
import {invalidate} from '../../platform/cache';
import {toastFail} from '../../platform/notify';
import {createBrand, fetchTree, updateBrand} from './api';
import BrandForm from './BrandForm';
import OffersMatrix from './OffersMatrix';
import CatalogLinks from './CatalogLinks';
import StockPanel from './StockPanel';
import BrandPreview from './BrandPreview';
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

const move = (list, from, to) => {
    const next = list.slice();
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    return next;
};

export default function ServicesScreen() {
    usePageHeader('Сервисы');

    const navigate = useNavigate();
    const {brandId} = useParams();
    const [params, setParams] = useSearchParams();
    const tab = params.get('tab') || 'brand';

    const tree = useResource(keys.serviceTree, fetchTree);
    const loaded = useMemo(() => tree.data?.result || [], [tree.data]);

    const [brands, setBrands] = useState(loaded);
    const [dragging, setDragging] = useState(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        setBrands(loaded);
    }, [loaded]);

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

    const saveOrder = useCallback(async () => {
        setDragging(null);

        if (brands.every((brand, index) => brand.serialNumber === index)) return;

        setSaving(true);

        try {
            for (let index = 0; index < brands.length; index += 1) {
                const brand = brands[index];
                if (brand.serialNumber === index) continue;

                await updateBrand({brandId: brand.id, updateData: {serialNumber: index}});
            }

            invalidate(keys.services);
        } catch (error) {
            toastFail(error.message || 'Порядок не сохранился', error.hint || '');
            setBrands(loaded);
        } finally {
            setSaving(false);
        }
    }, [brands, loaded]);

    return (
        <Workspace>
            <section className={style.list}>
                <header className={style.listHead}>
                    <span className={style.listTitle}>Бренды</span>
                    <Button size="s" variant="secondary" loading={add.loading || saving} onClick={onCreate}>
                        Добавить
                    </Button>
                </header>

                <div className={style.listBody}>
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

                    {brands.map((brand, index) => (
                        <button
                            key={brand.id}
                            type="button"
                            draggable
                            onDragStart={() => setDragging(index)}
                            onDragEnter={() => {
                                if (dragging === null || dragging === index) return;
                                setBrands((current) => move(current, dragging, index));
                                setDragging(index);
                            }}
                            onDragOver={(event) => event.preventDefault()}
                            onDragEnd={saveOrder}
                            onDrop={saveOrder}
                            className={[
                                style.item,
                                String(brand.id) === String(brandId) && style.itemActive,
                                dragging === index && style.itemDragging,
                            ].filter(Boolean).join(' ')}
                            style={{'--brand': brand.accent || 'var(--a2-accent)'}}
                            onClick={() => openBrand(brand.id)}
                        >
                            <span className={style.itemTint}/>

                            {brand.icon
                                ? <img className={style.icon} src={brand.icon} alt=""/>
                                : <span className={style.glyph}>{brand.glyph || '🎁'}</span>}

                            <span className={style.itemBody}>
                                <span className={style.itemName}>
                                    {brand.name}
                                    {brand.isHidden ? <Badge tone="neutral">скрыт</Badge> : null}
                                    {emptyStockOf(brand)
                                        ? <Badge tone="warning">{`без кодов: ${emptyStockOf(brand)}`}</Badge>
                                        : null}
                                </span>
                                <span className={style.itemNote}>
                                    {(brand.offers || []).length} предложений · склад {stockOf(brand)}
                                </span>
                            </span>

                            <span className={style.grip} aria-hidden="true">⠿</span>
                        </button>
                    ))}
                </div>
            </section>

            {!current ? (
                <Panel scroll wide>
                    <EmptyState
                        title="Выберите бренд"
                        text="Слева — бренды витрины «Сервисы». Порядок на витрине меняется перетаскиванием."
                    />
                </Panel>
            ) : (
                <>
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

                    <BrandPreview brands={brands} brandId={current.id} onOpenBrand={openBrand}/>
                </>
            )}
        </Workspace>
    );
}
