import React from 'react';
import PlatformCard from '../../../../SelectPlatform/Elements/PlatformCard';
import SelectPlatformText from '../../../../SelectPlatform/Elements/SelectPlatformText';
import { decodeStartPageContent } from './startPageContent';
import style from './StartPagePreview.module.scss';
import SelectPlatformLink from '../../../../SelectPlatform/Elements/SelectPlatformLink';

const TYPE_LABELS = {
    title: 'Заголовок',
    label: 'Надпись',
    page: 'Страница',
    link: 'Ссылка'
};


const StartPagePreviewItem = ({
    item,
    page,
    isDragging,
    isDropTarget,
    onEdit,
    onDragStart,
    onDragOver,
    onDrop,
    onDragEnd,
}) => {

    const renderContent = () => {
        if (item.type === 'title' || item.type === 'label') {
            return (
                <SelectPlatformText data={item} />
            );
        }

        if (item.type === 'page' && page) {
            const cardItem = {
                ...page,
                ...item
            };

            return (
                <div className={style.cardWrap}>
                    <PlatformCard
                        item={cardItem}
                        isActive={false}
                        animationDelay="0s"
                        onSelect={() => { }}
                        onTouchStart={() => { }}
                    />
                </div>
            );
        }

        if (item.type === 'page') {
            return <div className={style.missingPage}>Страница не найдена (id: {item.structurePageId})</div>;
        }

        if (item.type === 'link') {
            return (<div className={style.cardWrap}>
                <SelectPlatformLink item={item} isActive={false} animationDelay={'0s'}/>
            </div>)
        }

        return null;
    };

    return (
        <div
            className={[
                style.item,
                isDragging ? style.itemDragging : '',
                isDropTarget ? style.itemDropTarget : '',
            ].filter(Boolean).join(' ')}
            draggable
            onDragStart={(event) => onDragStart(event, item)}
            onDragOver={(event) => onDragOver(event, item)}
            onDrop={(event) => onDrop(event, item)}
            onDragEnd={onDragEnd}
        >
            <div className={style.itemToolbar}>
                <span className={style.dragHandle} title="Перетащите для смены порядка">⠿</span>
                <span className={style.typeBadge}>
                    {TYPE_LABELS[item.type]}
                </span>
                <button
                    type="button"
                    className={style.editButton}
                    onClick={(event) => {
                        event.stopPropagation();
                        onEdit(item);
                    }}
                >
                    Изменить
                </button>
            </div>
            {renderContent()}
        </div>
    );
};

const StartPagePreview = ({
    items,
    pageList,
    draggedItem,
    dropTargetId,
    onEdit,
    onDragStart,
    onDragOver,
    onDrop,
    onDragEnd,
}) => {
    const resolvePage = (structurePageId) =>
        pageList?.find((page) => page.id === structurePageId) ?? null;

    return (
        <div className={style.frame}>
            <div className={style.phone}>
                <div className={style.phoneInner}>
                    {items.length === 0 ? (
                        <div className={style.empty}>
                            Добавьте заголовок, надпись или страницу — они появятся здесь
                        </div>
                    ) : (
                        <div className={style.list}>
                            {items.map((item) => (
                                <StartPagePreviewItem
                                    key={item.id}
                                    item={item}
                                    page={resolvePage(item.structurePageId)}
                                    isDragging={draggedItem?.id === item.id}
                                    isDropTarget={dropTargetId === item.id && draggedItem?.id !== item.id}
                                    onEdit={onEdit}
                                    onDragStart={onDragStart}
                                    onDragOver={onDragOver}
                                    onDrop={onDrop}
                                    onDragEnd={onDragEnd}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StartPagePreview;
