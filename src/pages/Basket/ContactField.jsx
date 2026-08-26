import React from 'react';
import {hapticSelection} from '../../shared/lib/haptic';
import {CONTACT_CHANNELS, findChannel, isContactValid} from './cartModel';
import {CHANNEL_ICONS} from './ContactIcons';
import style from './Basket.module.scss';

export default function ContactField({channel, value, isTouched, onChannel, onChange}) {
    const active = findChannel(channel);
    const isValid = isContactValid(active.key, value);
    const isBad = isTouched && !isValid;

    return (
        <div className={style.contact}>
            <div className={style.channels} role="tablist">
                {CONTACT_CHANNELS.map((option) => {
                    const Icon = CHANNEL_ICONS[option.key];
                    const isActive = option.key === active.key;

                    return (
                        <button
                            key={option.key}
                            type="button"
                            role="tab"
                            aria-selected={isActive}
                            className={`${style.channel} ${isActive ? style.channelActive : ''}`}
                            onClick={() => {
                                if (isActive) return;
                                hapticSelection();
                                onChannel(option.key);
                            }}
                        >
                            <Icon className={style.channelIcon}/>
                            <span className={style.channelTitle}>{option.title}</span>
                        </button>
                    );
                })}
            </div>

            <label key={active.key} className={`${style.field} ${style.contactField}`}>
                <span className={style.fieldLabel}>{active.label}</span>

                <span className={`${style.contactInput} ${isBad ? style.contactInputBad : ''}`}>
                    {active.key === 'telegram' ? <span className={style.contactPrefix}>@</span> : null}

                    <input
                        className={style.bareInput}
                        value={value}
                        type={active.key === 'phone' ? 'tel' : 'text'}
                        inputMode={active.key === 'phone' ? 'tel' : 'text'}
                        placeholder={active.placeholder}
                        autoComplete={active.key === 'email' ? 'email' : 'off'}
                        autoCapitalize="none"
                        autoCorrect="off"
                        spellCheck="false"
                        onChange={(event) => onChange(event.target.value)}
                    />

                    <span className={`${style.contactCheck} ${isValid ? style.contactCheckOn : ''}`} aria-hidden="true">
                        ✓
                    </span>
                </span>

                <span className={`${style.contactNote} ${isBad ? style.contactNoteBad : ''}`}>
                    {isBad ? active.error : active.note}
                </span>
            </label>
        </div>
    );
}
