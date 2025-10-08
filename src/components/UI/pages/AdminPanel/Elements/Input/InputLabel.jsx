import React from 'react';
import styles from './Input.module.scss';

const InputLabel = ({placeholder, label, defaultValue, onChange, value}) => {
    return (
        <div className={styles['text-field_floating']}>
            <input className={styles['text-field__input']} type="text"  defaultValue={placeholder} placeholder={placeholder}
                   onChange={(event) => onChange(event)}/>
            <label className={styles['text-field__label']}>{label}</label>
        </div>
    );
};

export default InputLabel;