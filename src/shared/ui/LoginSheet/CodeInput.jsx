import React, {useEffect, useRef} from 'react';
import style from './LoginSheet.module.scss';

const digitsOf = (value) => String(value || '').replace(/\D/g, '');

export default function CodeInput({value, onChange, length = 6, disabled = false, autoFocus = false}) {
    const refs = useRef([]);
    const cells = Array.from({length}, (_, index) => value[index] || '');

    useEffect(() => {
        if (autoFocus) refs.current[Math.min(value.length, length - 1)]?.focus();
    }, [autoFocus]);

    const focusAt = (index) => {
        const target = refs.current[Math.max(0, Math.min(index, length - 1))];
        if (target) {
            target.focus();
            target.select();
        }
    };

    const fill = (from, digits) => {
        const next = (value.slice(0, from) + digits).slice(0, length);
        onChange(next);
        focusAt(next.length);
    };

    const handleChange = (index, event) => {
        const digits = digitsOf(event.target.value);
        if (!digits) return;
        const pos = Math.min(index, value.length);

        if (digits.length > 2 || (digits.length === 2 && !cells[index])) {
            fill(pos, digits);
            return;
        }

        const digit = digits.length === 2 ? (digits[0] === cells[index] ? digits[1] : digits[0]) : digits;
        onChange((value.slice(0, pos) + digit + value.slice(pos + 1)).slice(0, length));
        focusAt(pos + 1);
    };

    const handleKeyDown = (index, event) => {
        if (event.key === 'Backspace') {
            event.preventDefault();
            if (cells[index]) {
                onChange(value.slice(0, index) + value.slice(index + 1));
                focusAt(index);
            } else if (index > 0) {
                onChange(value.slice(0, index - 1) + value.slice(index));
                focusAt(index - 1);
            }
        } else if (event.key === 'ArrowLeft') {
            event.preventDefault();
            focusAt(index - 1);
        } else if (event.key === 'ArrowRight') {
            event.preventDefault();
            focusAt(Math.min(index + 1, value.length));
        }
    };

    const handlePaste = (index, event) => {
        const digits = digitsOf(event.clipboardData?.getData('text'));
        if (!digits) return;
        event.preventDefault();
        fill(digits.length >= length ? 0 : Math.min(index, value.length), digits);
    };

    return (
        <div className={style.codeCells} role="group" aria-label="Код из письма">
            {cells.map((digit, index) => (
                <input
                    key={index}
                    ref={(node) => {
                        refs.current[index] = node;
                    }}
                    className={`${style.codeCell} ${digit ? style.codeCellFilled : ''}`}
                    inputMode="numeric"
                    autoComplete={index === 0 ? 'one-time-code' : 'off'}
                    aria-label={`Цифра ${index + 1}`}
                    maxLength={index === 0 ? length : 2}
                    value={digit}
                    disabled={disabled}
                    onChange={(event) => handleChange(index, event)}
                    onKeyDown={(event) => handleKeyDown(index, event)}
                    onPaste={(event) => handlePaste(index, event)}
                    onFocus={(event) => event.target.select()}
                />
            ))}
        </div>
    );
}
