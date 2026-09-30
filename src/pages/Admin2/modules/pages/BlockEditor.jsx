import React, {useCallback, useRef, useState} from 'react';
import {Button, IconButton, Input, Select, Textarea} from '../../ui';
import {MediaPicker, useMediaPicker} from '../media/MediaPicker';
import {LEVEL_OPTIONS, blockSummary, kindTitle, moveItem, prefixLines, wrapSelection} from './pagesModel';
import style from './PagesScreen.module.scss';

const rowsFor = (text, min = 3) => Math.min(24, Math.max(min, String(text || '').split('\n').length + 1, Math.ceil(String(text || '').length / 95)));

function RichArea({value, onChange, placeholder, minRows = 3}) {
    const rootRef = useRef(null);

    const apply = useCallback((transform) => {
        const node = rootRef.current?.querySelector('textarea');
        if (!node) return;

        const result = transform(node.value, node.selectionStart, node.selectionEnd);
        onChange(result.value);

        requestAnimationFrame(() => {
            node.focus();
            node.setSelectionRange(result.start, result.end);
        });
    }, [onChange]);

    return (
        <div className={style.rich} ref={rootRef}>
            <div className={style.tools}>
                <button
                    type="button"
                    className={style.tool}
                    title="Жирный"
                    onClick={() => apply((text, start, end) => wrapSelection(text, start, end, '**', '**', 'текст'))}
                >
                    <b>Ж</b>
                </button>
                <button
                    type="button"
                    className={style.tool}
                    title="Ссылка"
                    onClick={() => apply((text, start, end) => wrapSelection(text, start, end, '[', '](https://)', 'текст ссылки'))}
                >
                    Ссылка
                </button>
                <button
                    type="button"
                    className={style.tool}
                    title="Маркированный список"
                    onClick={() => apply((text, start, end) => prefixLines(text, start, end, '- '))}
                >
                    • Список
                </button>
                <button
                    type="button"
                    className={style.tool}
                    title="Нумерованный список"
                    onClick={() => apply((text, start, end) => prefixLines(text, start, end, (index) => `${index + 1}. `))}
                >
                    1. Список
                </button>
                <span className={style.toolsHint}>Пустая строка — новый абзац</span>
            </div>

            <Textarea
                rows={rowsFor(value, minRows)}
                value={value}
                placeholder={placeholder}
                onChange={(event) => onChange(event.target.value)}
            />
        </div>
    );
}

function ImageField({value, onChange}) {
    const picker = useMediaPicker();

    return (
        <div className={style.imageField}>
            {value ? <img className={style.thumb} src={value} alt=""/> : <span className={style.thumb}/>}

            <Input
                value={value}
                placeholder="https://… адрес картинки"
                onChange={(event) => onChange(event.target.value)}
            />

            <Button size="s" onClick={picker.show}>Выбрать</Button>

            {picker.open ? <MediaPicker value={value} onPick={(url) => onChange(url)} onClose={picker.hide}/> : null}
        </div>
    );
}

function ItemRows({items, blank, onChange, addLabel, render}) {
    const setItem = (index, patch) => onChange(items.map((item, position) => (position === index ? {...item, ...patch} : item)));

    return (
        <div className={style.items}>
            {items.map((item, index) => (
                <div key={index} className={style.item}>
                    <div className={style.itemBody}>{render(item, (patch) => setItem(index, patch))}</div>

                    <div className={style.itemTools}>
                        <IconButton label="Выше" disabled={index === 0} onClick={() => onChange(moveItem(items, index, -1))}>↑</IconButton>
                        <IconButton label="Ниже" disabled={index === items.length - 1} onClick={() => onChange(moveItem(items, index, 1))}>↓</IconButton>
                        <IconButton label="Убрать" onClick={() => onChange(items.filter((entry, position) => position !== index))}>×</IconButton>
                    </div>
                </div>
            ))}

            <Button size="s" variant="ghost" onClick={() => onChange([...items, blank])}>{addLabel}</Button>
        </div>
    );
}

function GalleryField({images, onChange}) {
    const picker = useMediaPicker();
    const [address, setAddress] = useState('');

    const add = (url) => {
        const value = String(url || '').trim();
        if (value && !images.includes(value)) onChange([...images, value]);
    };

    return (
        <div className={style.items}>
            {images.length ? (
                <div className={style.shots}>
                    {images.map((src, index) => (
                        <span key={src} className={style.shotItem}>
                            <img src={src} alt=""/>
                            <span className={style.shotTools}>
                                <IconButton label="Левее" disabled={index === 0} onClick={() => onChange(moveItem(images, index, -1))}>←</IconButton>
                                <IconButton label="Правее" disabled={index === images.length - 1} onClick={() => onChange(moveItem(images, index, 1))}>→</IconButton>
                                <IconButton label="Убрать" onClick={() => onChange(images.filter((item) => item !== src))}>×</IconButton>
                            </span>
                        </span>
                    ))}
                </div>
            ) : null}

            <div className={style.imageField}>
                <Input
                    value={address}
                    placeholder="https://… адрес картинки"
                    onChange={(event) => setAddress(event.target.value)}
                    onKeyDown={(event) => {
                        if (event.key !== 'Enter') return;
                        add(address);
                        setAddress('');
                    }}
                />
                <Button
                    size="s"
                    disabled={!address.trim()}
                    onClick={() => {
                        add(address);
                        setAddress('');
                    }}
                >
                    Добавить
                </Button>
                <Button size="s" onClick={picker.show}>Выбрать</Button>
            </div>

            {picker.open ? <MediaPicker onPick={add} onClose={picker.hide}/> : null}
        </div>
    );
}

function BlockFields({block, onChange}) {
    if (block.type === 'heading') {
        return (
            <div className={style.headingRow}>
                <Input
                    value={block.text}
                    placeholder="Текст заголовка"
                    onChange={(event) => onChange({text: event.target.value})}
                />
                <Select
                    options={LEVEL_OPTIONS}
                    value={String(block.level || 2)}
                    onChange={(event) => onChange({level: Number(event.target.value)})}
                />
            </div>
        );
    }

    if (block.type === 'text') {
        return <RichArea value={block.text} placeholder="Текст" onChange={(text) => onChange({text})}/>;
    }

    if (block.type === 'note') {
        return <RichArea value={block.text} minRows={2} placeholder="Важное замечание" onChange={(text) => onChange({text})}/>;
    }

    if (block.type === 'image') {
        return (
            <div className={style.items}>
                <ImageField value={block.src} onChange={(src) => onChange({src})}/>
                <Input
                    value={block.caption || ''}
                    placeholder="Подпись под картинкой (необязательно)"
                    onChange={(event) => onChange({caption: event.target.value})}
                />
            </div>
        );
    }

    if (block.type === 'gallery') {
        return <GalleryField images={block.images || []} onChange={(images) => onChange({images})}/>;
    }

    if (block.type === 'video') {
        return (
            <Input
                value={block.url}
                placeholder="Ссылка на видео: YouTube, Rutube или VK Видео"
                onChange={(event) => onChange({url: event.target.value})}
            />
        );
    }

    if (block.type === 'buttons') {
        return (
            <ItemRows
                items={block.items || []}
                blank={{label: '', href: ''}}
                addLabel="Добавить кнопку"
                onChange={(items) => onChange({items})}
                render={(item, patch) => (
                    <div className={style.pair}>
                        <Input value={item.label} placeholder="Надпись" onChange={(event) => patch({label: event.target.value})}/>
                        <Input value={item.href} placeholder="https://… или /faq" onChange={(event) => patch({href: event.target.value})}/>
                    </div>
                )}
            />
        );
    }

    if (block.type === 'faq') {
        return (
            <ItemRows
                items={block.items || []}
                blank={{question: '', answer: ''}}
                addLabel="Добавить вопрос"
                onChange={(items) => onChange({items})}
                render={(item, patch) => (
                    <div className={style.items}>
                        <Input value={item.question} placeholder="Вопрос" onChange={(event) => patch({question: event.target.value})}/>
                        <RichArea value={item.answer} minRows={2} placeholder="Ответ" onChange={(answer) => patch({answer})}/>
                    </div>
                )}
            />
        );
    }

    return null;
}

export default function BlockEditor({block, index, total, collapsed, onToggle, onChange, onMove, onRemove, onInsert}) {
    return (
        <section className={style.block}>
            <header className={style.blockHead}>
                <button type="button" className={style.blockTitle} onClick={onToggle}>
                    <span className={collapsed ? style.caret : `${style.caret} ${style.caretOpen}`} aria-hidden="true"/>
                    <span className={style.blockKind}>{kindTitle(block.type)}</span>
                    {collapsed ? <span className={style.blockSummary}>{blockSummary(block)}</span> : null}
                </button>

                <div className={style.blockTools}>
                    <IconButton label="Добавить блок ниже" onClick={onInsert}>+</IconButton>
                    <IconButton label="Выше" disabled={index === 0} onClick={() => onMove(-1)}>↑</IconButton>
                    <IconButton label="Ниже" disabled={index === total - 1} onClick={() => onMove(1)}>↓</IconButton>
                    <IconButton label="Удалить блок" onClick={onRemove}>×</IconButton>
                </div>
            </header>

            {collapsed ? null : (
                <div className={style.blockBody}>
                    <BlockFields block={block} onChange={onChange}/>
                </div>
            )}
        </section>
    );
}
