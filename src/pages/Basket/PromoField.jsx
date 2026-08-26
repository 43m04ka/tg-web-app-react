import React, {useCallback, useState} from 'react';
import {hapticImpact} from '../../shared/lib/haptic';
import {checkPromo} from '../../shared/api/basket';
import style from './Basket.module.scss';

const HINTS = {
    missing: 'Такого промокода нет',
    exhausted: 'Промокод уже использован'
};

export default function PromoField({promo, onApply, onClear}) {
    const [isOpen, setOpen] = useState(false);
    const [value, setValue] = useState('');
    const [hint, setHint] = useState('');
    const [isChecking, setChecking] = useState(false);

    const apply = useCallback(async () => {
        const name = value.trim().toUpperCase();
        if (!name || isChecking) return;

        hapticImpact('light');
        setChecking(true);
        setHint('');

        try {
            const result = await checkPromo(name);

            if (result && Number(result.totalNumberUses) > 0) {
                onApply(name);
                setValue('');
                setOpen(false);
                return;
            }

            setHint(HINTS[result ? 'exhausted' : 'missing']);
        } catch (error) {
            setHint(HINTS.missing);
        } finally {
            setChecking(false);
        }
    }, [isChecking, onApply, value]);

    const clear = useCallback(() => {
        hapticImpact('light');
        setValue('');
        setHint('');
        setOpen(false);
        onClear();
    }, [onClear]);

    if (promo) {
        return (
            <div className={`${style.promoRow} ${style.promoApplied}`}>
                <span className={style.promoBadge}>−{promo.percent}%</span>
                <span className={style.promoLabel}>Промокод {promo.name}</span>
                <button type="button" className={style.promoAction} onClick={clear}>Убрать</button>
            </div>
        );
    }

    if (!isOpen) {
        return (
            <button
                type="button"
                className={style.promoRow}
                onClick={() => {
                    hapticImpact('light');
                    setOpen(true);
                }}
            >
                <span className={style.promoLabel}>Промокод</span>
                <span className={style.promoAction}>Применить</span>
            </button>
        );
    }

    return (
        <div className={`${style.promoRow} ${style.promoOpen} ${hint ? style.promoError : ''}`}>
            <input
                className={style.promoInput}
                value={value}
                placeholder="Введите промокод"
                autoComplete="off"
                autoCapitalize="characters"
                onChange={(event) => {
                    setValue(event.target.value.toUpperCase());
                    setHint('');
                }}
            />

            <button type="button" className={style.promoAction} disabled={isChecking} onClick={apply}>
                {isChecking ? 'Проверяем' : 'Применить'}
            </button>

            {hint ? <span className={style.promoHint}>{hint}</span> : null}
        </div>
    );
}
