import React, {useCallback, useState} from 'react';
import {checkPromo} from '../../../shared/api/basket';
import Spinner from '../../ui/Spinner';
import style from './DesktopBasket.module.scss';

const HINTS = {
    missing: 'Такого промокода нет',
    exhausted: 'Промокод уже использован',
    failed: 'Не удалось проверить, попробуйте ещё раз'
};

export default function DesktopPromo({promo, onApply, onClear}) {
    const [isOpen, setOpen] = useState(false);
    const [value, setValue] = useState('');
    const [hint, setHint] = useState('');
    const [isChecking, setChecking] = useState(false);

    const apply = useCallback(async () => {
        const name = value.trim().toUpperCase();
        if (!name || isChecking) return;

        setChecking(true);
        setHint('');

        try {
            const result = await checkPromo(name);
            const percent = Number(result?.percent);

            if (result && Number(result.totalNumberUses) > 0 && percent > 0) {
                onApply({name, percent});
                setValue('');
                setOpen(false);
                return;
            }

            setHint(HINTS[result ? 'exhausted' : 'missing']);
        } catch (error) {
            setHint(HINTS.failed);
        } finally {
            setChecking(false);
        }
    }, [isChecking, onApply, value]);

    const clear = useCallback(() => {
        setValue('');
        setHint('');
        setOpen(false);
        onClear();
    }, [onClear]);

    if (promo) {
        return (
            <div className={`${style.promo} ${style.promoApplied}`}>
                <span className={style.promoBadge}>−{promo.percent}%</span>
                <span className={style.promoLabel}>Промокод {promo.name}</span>
                <button type="button" className={style.promoAction} onClick={clear}>Убрать</button>
            </div>
        );
    }

    if (!isOpen) {
        return (
            <button type="button" className={style.promo} onClick={() => setOpen(true)}>
                <span className={style.promoLabel}>Есть промокод?</span>
                <span className={style.promoAction}>Ввести</span>
            </button>
        );
    }

    return (
        <div className={`${style.promo} ${style.promoOpen} ${hint ? style.promoError : ''}`}>
            <input
                className={style.promoInput}
                value={value}
                placeholder="Введите промокод"
                autoComplete="off"
                autoCapitalize="characters"
                autoFocus
                onChange={(event) => {
                    setValue(event.target.value.toUpperCase());
                    setHint('');
                }}
                onKeyDown={(event) => {
                    if (event.key === 'Enter') apply();
                    if (event.key === 'Escape') setOpen(false);
                }}
            />

            <button type="button" className={style.promoAction} disabled={isChecking} onClick={apply}>
                {isChecking ? <Spinner/> : 'Применить'}
            </button>

            {hint ? <span className={style.promoHint}>{hint}</span> : null}
        </div>
    );
}
