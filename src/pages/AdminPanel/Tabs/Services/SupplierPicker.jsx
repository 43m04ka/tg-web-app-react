import React, {useEffect, useMemo, useRef, useState} from 'react';
import f from '../../Elements/FormLayout/FormLayout';
import {useServer} from './useServer';
import {money} from './serviceModel';
import s from './Services.module.scss';

const TTL_MS = 60 * 1000;
let cache = {at: 0, promise: null};

export const loadSupplierCatalog = (fetcher) => {
    if (!cache.promise || Date.now() - cache.at > TTL_MS) {
        cache = {at: Date.now(), promise: fetcher().catch((error) => {
            cache = {at: 0, promise: null};
            throw error;
        })};
    }
    return cache.promise;
};

export const useSupplierCatalog = () => {
    const server = useServer();
    const serverRef = useRef(server);
    serverRef.current = server;
    const [state, setState] = useState({items: null, error: ''});

    useEffect(() => {
        let alive = true;
        loadSupplierCatalog(() => serverRef.current.getSupplierCatalog())
            .then((items) => alive && setState({items, error: ''}))
            .catch((error) => alive && setState({items: [], error: error.message || 'Каталог PanYanStore недоступен'}));
        return () => { alive = false; };
    }, []);

    return state;
};

const stockText = (item) => (item.inStock > 0 ? `${item.inStock} шт.` : 'нет в наличии');

const SupplierPicker = ({itemId, items, error, onPick}) => {
    const [query, setQuery] = useState('');

    const current = useMemo(
        () => (items || []).find((item) => String(item.itemId) === String(itemId)) || null,
        [items, itemId],
    );

    const matches = useMemo(() => {
        const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
        if (!words.length || !items) return [];

        return items
            .filter((item) => {
                const text = `${item.itemId} ${item.category} ${item.name}`.toLowerCase();
                return words.every((word) => text.includes(word));
            })
            .slice(0, 8);
    }, [items, query]);

    return (
        <div className={s['supplierPick']}>
            {items === null ? (
                <span className={s['formStatus']}>Загрузка каталога PanYanStore…</span>
            ) : error ? (
                <span className={s['formWarn']}>{error}</span>
            ) : current ? (
                <div className={s['supplierItem']}>
                    <span className={s['supplierName']}>{current.name}</span>
                    <span className={s['mono']}>
                        №{current.itemId} · {money(current.price)} · {stockText(current)}
                    </span>
                </div>
            ) : (
                <span className={s['formWarn']}>
                    {itemId ? `Товара №${itemId} нет в каталоге PanYanStore` : 'Товар не выбран'}
                </span>
            )}

            <input className={f.input} type="text" placeholder="Найти: «PlayStation Польша 50»"
                   value={query} onChange={(event) => setQuery(event.target.value)}/>

            {matches.length ? (
                <div className={s['stockRows']}>
                    {matches.map((item) => (
                        <button key={item.itemId} type="button" className={s['supplierRow']}
                                onClick={() => { onPick(item); setQuery(''); }}>
                            <span className={s['stockCode']}>{item.name}</span>
                            <span className={s['mono']}>{money(item.price)} · {stockText(item)}</span>
                        </button>
                    ))}
                </div>
            ) : null}
        </div>
    );
};

export default SupplierPicker;
