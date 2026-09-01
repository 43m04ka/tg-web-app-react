import React from 'react';
import f from '../../Elements/FormLayout/FormLayout';
import {ACCENT_PRESETS} from './serviceModel';
import s from './Services.module.scss';

const AccentPicker = ({value, onChange}) => (
    <div className={s['accentField']}>
        <div className={s['accentSwatches']}>
            {ACCENT_PRESETS.map((preset) => (
                <button
                    key={preset.value}
                    type="button"
                    title={preset.name}
                    aria-label={preset.name}
                    aria-pressed={value === preset.value}
                    className={`${s['accentSwatch']} ${value === preset.value ? s['accentSwatchOn'] : ''}`}
                    style={{background: preset.value}}
                    onClick={() => onChange(preset.value)}
                />
            ))}
            <button
                type="button"
                title="Без акцента"
                aria-label="Без акцента"
                aria-pressed={!value}
                className={`${s['accentSwatch']} ${s['accentSwatchNone']} ${!value ? s['accentSwatchOn'] : ''}`}
                onClick={() => onChange('')}
            >
                ✕
            </button>
        </div>

        <div className={s['accentPreview']}>
            <span
                className={s['accentTile']}
                style={{background: `linear-gradient(140deg, ${value || 'oklch(0.42 0.12 250)'}, oklch(0.17 0.02 264))`}}
            />
            <input
                className={`${f.input} ${f.mono}`}
                type="text"
                placeholder="oklch(0.55 0.17 152)"
                value={value}
                onChange={(event) => onChange(event.target.value)}
            />
        </div>
    </div>
);

export default AccentPicker;
