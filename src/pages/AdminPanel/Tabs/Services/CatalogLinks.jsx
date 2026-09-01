import React from 'react';
import f from '../../Elements/FormLayout/FormLayout';
import FlagPicker from '../../Elements/FlagPicker/FlagPicker';
import {isFlagName} from '../../Elements/FlagPicker/flags';
import {KIND_OPTIONS} from './serviceModel';
import s from './Services.module.scss';

const emptyLink = () => ({catalogId: '', kind: 'subscription', regionName: '', regionFlag: '', regionIcon: ''});

const CatalogLinks = ({links, catalogs, onChange}) => {
    const used = new Set(links.map((link) => String(link.catalogId)).filter(Boolean));

    const patch = (index, next) => onChange(links.map((link, i) => (i === index ? {...link, ...next} : link)));

    const drop = (index) => onChange(links.filter((_, i) => i !== index));

    const pickFlag = (index, flag) => {
        const link = links[index];
        const keepName = link.regionName.trim() && !isFlagName(link.regionName);

        patch(index, {regionIcon: flag.icon, regionName: keepName ? link.regionName : flag.name});
    };

    const label = (catalog) => `${[catalog.pageName, catalog.path].filter(Boolean).join(' · ')} — ${catalog.productCount} карточек`;

    return (
        <div className={s['links']}>
            {links.length === 0 ? (
                <p className={s['formNote']}>
                    Связей нет — бренд живёт только на своих позициях.
                </p>
            ) : null}

            {links.map((link, index) => {
                const catalog = (catalogs || []).find((item) => String(item.id) === String(link.catalogId)) || null;

                return (
                    <div key={index} className={s['link']}>
                        <div className={s['linkHead']}>
                            <select
                                className={`${f.input} ${f.select}`}
                                value={link.catalogId}
                                onChange={(event) => patch(index, {catalogId: event.target.value})}
                            >
                                <option value="">Выберите каталог…</option>
                                {(catalogs || [])
                                    .filter((item) => String(item.id) === String(link.catalogId)
                                        || !used.has(String(item.id)))
                                    .map((item) => (
                                        <option key={item.id} value={item.id}>{label(item)}</option>
                                    ))}
                            </select>

                            <button type="button" className={`${s['btn']} ${s['btnDanger']}`}
                                    onClick={() => drop(index)}>
                                Убрать
                            </button>
                        </div>

                        <div className={s['linkBody']}>
                            <label className={s['linkField']}>
                                <span className={s['linkLabel']}>Регион</span>
                                <input className={f.input} type="text" placeholder="Турция"
                                       value={link.regionName}
                                       onChange={(event) => patch(index, {regionName: event.target.value})}/>
                            </label>

                            <label className={s['linkField']}>
                                <span className={s['linkLabel']}>Тип</span>
                                <select className={`${f.input} ${f.select}`} value={link.kind}
                                        onChange={(event) => patch(index, {kind: event.target.value})}>
                                    {KIND_OPTIONS.map((option) => (
                                        <option key={option.key} value={option.key}>{option.name}</option>
                                    ))}
                                </select>
                            </label>

                            <label className={s['linkField']}>
                                <span className={s['linkLabel']}>Эмодзи</span>
                                <input className={`${f.input} ${f.mono}`} type="text" maxLength={4} placeholder="🇹🇷"
                                       value={link.regionFlag}
                                       onChange={(event) => patch(index, {regionFlag: event.target.value})}/>
                            </label>
                        </div>

                        <div className={s['linkFlags']}>
                            <FlagPicker value={link.regionIcon}
                                        onPick={(flag) => pickFlag(index, flag)}
                                        onClear={() => patch(index, {regionIcon: ''})}/>
                        </div>

                        {link.catalogId && catalog && catalog.productCount === 0 ? (
                            <p className={s['formNote']}>
                                В каталоге нет ни одной видимой карточки в продаже — на витрине
                                от связи ничего не появится.
                            </p>
                        ) : null}

                        {link.catalogId && catalogs && !catalog ? (
                            <p className={s['formNote']}>
                                Каталог с id {link.catalogId} не найден — возможно, его удалили.
                            </p>
                        ) : null}
                    </div>
                );
            })}

            <button type="button" className={s['btn']} onClick={() => onChange([...links, emptyLink()])}>
                + каталог
            </button>
        </div>
    );
};

export default CatalogLinks;
