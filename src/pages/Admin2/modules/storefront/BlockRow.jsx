import React from 'react';
import {Badge, Button, IconButton} from '../../ui';
import {describeTarget, detectKind} from './blockKinds';
import style from './StorefrontScreen.module.scss';

const pad = (value) => String(value).padStart(2, '0');

const dateOf = (stamp) => {
    const date = new Date(Number(stamp));
    if (Number.isNaN(date.getTime())) return null;

    return `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()}`;
};

function BlockArt({item, kind}) {
    if (kind.fields.image && item.url) {
        return <img className={style.blockArt} src={item.url} alt=""/>;
    }

    const tint = kind.fields.color && item.backgroundColor ? {background: item.backgroundColor} : undefined;

    return (
        <span className={style.blockIcon} style={tint}>
            {kind.fields.icon && item.imageIcon
                ? <img src={item.imageIcon} alt=""/>
                : kind.label.slice(0, 1)}
        </span>
    );
}

export default function BlockRow({item, index, group, catalog, isFirst, isLast, isBusy, onMove, onEdit, onRemove}) {
    const kind = detectKind(item, group);
    const until = kind.fields.deleteDate && item.deleteDate ? dateOf(item.deleteDate) : null;
    const missing = kind.fields.catalogPath && item.path && catalog === null;

    return (
        <div className={style.block}>
            <span className={style.blockOrder}>{index + 1}</span>

            <BlockArt item={item} kind={kind}/>

            <span className={style.blockBody}>
                <span className={style.blockTitle}>{item.name || kind.label}</span>

                <span className={style.blockMeta}>
                    <Badge tone="neutral">{kind.label}</Badge>
                    <span className={style.blockNote}>{describeTarget(item, group)}</span>
                    {missing ? <Badge tone="danger">каталог не найден</Badge> : null}
                    {kind.fields.catalogPath && !item.path ? <Badge tone="warning">без каталога</Badge> : null}
                    {kind.fields.image && !item.url ? <Badge tone="warning">без картинки</Badge> : null}
                    {until ? <Badge tone="warning">снимется {until}</Badge> : null}
                </span>
            </span>

            <span className={style.blockTools}>
                <IconButton label="Выше" disabled={isFirst || isBusy} onClick={() => onMove(item.id, -1)}>↑</IconButton>
                <IconButton label="Ниже" disabled={isLast || isBusy} onClick={() => onMove(item.id, 1)}>↓</IconButton>
                <Button size="s" variant="ghost" onClick={() => onEdit(item)}>Править</Button>
                <IconButton label="Убрать" onClick={() => onRemove(item)}>×</IconButton>
            </span>
        </div>
    );
}
