import React, {useMemo, useState} from 'react';
import {REGION_FLAGS, findFlagByIcon} from './flags';
import style from './FlagPicker.module.scss';

const FlagPicker = ({value, onPick, onClear}) => {
    const [isOpen, setOpen] = useState(false);
    const [query, setQuery] = useState('');

    const current = useMemo(() => findFlagByIcon(value), [value]);

    const list = useMemo(() => {
        const needle = query.trim().toLowerCase();
        if (!needle) return REGION_FLAGS;

        return REGION_FLAGS.filter((flag) =>
            flag.name.toLowerCase().includes(needle) || flag.code.includes(needle));
    }, [query]);

    const pick = (flag) => {
        onPick(flag);
        setOpen(false);
        setQuery('');
    };

    return (
        <div className={style['picker']}>
            <div className={style['current']}>
                {current || value
                    ? <img className={style['flag']} src={value} alt=""/>
                    : <span className={style['blank']}>Нет</span>}

                <span className={style['name']}>
                    {current ? current.name : (value ? 'Своя картинка' : 'Флаг не выбран')}
                </span>

                <button type="button" className={style['toggle']} onClick={() => setOpen((prev) => !prev)}>
                    {isOpen ? 'Свернуть' : 'Выбрать флаг'}
                </button>

                {value ? (
                    <button type="button" className={style['clear']} onClick={onClear}>Убрать</button>
                ) : null}
            </div>

            {isOpen ? (
                <div className={style['panel']}>
                    <input
                        className={style['search']}
                        type="search"
                        placeholder="Поиск: Турция, kz…"
                        value={query}
                        autoFocus
                        onChange={(event) => setQuery(event.target.value)}
                    />

                    <div className={style['grid']}>
                        {list.map((flag) => (
                            <button
                                key={flag.code}
                                type="button"
                                className={`${style['cell']} ${flag.icon === value ? style['cellActive'] : ''}`}
                                title={flag.name}
                                onClick={() => pick(flag)}
                            >
                                <img className={style['cellFlag']} src={flag.icon} alt=""/>
                                <span className={style['cellName']}>{flag.name}</span>
                            </button>
                        ))}
                    </div>

                    {list.length === 0 ? <p className={style['empty']}>Ничего не нашлось</p> : null}
                </div>
            ) : null}
        </div>
    );
};

export default FlagPicker;
