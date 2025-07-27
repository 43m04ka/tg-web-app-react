import React from 'react';
import styles from './Modules.module.scss';

const InputLabel = ({placeholder, label, defaultValue, onChange}) => {
    return (
        <div className={styles['input-box']}>
            <label className={styles['label']}>{label}</label>
            <div className={styles['div']}>
                <input className={styles['input']} type="text" defaultValue={defaultValue} placeholder={placeholder}
                       onChange={(event) => onChange(event)}/>
            </div>
        </div>
    );
};

export default InputLabel;