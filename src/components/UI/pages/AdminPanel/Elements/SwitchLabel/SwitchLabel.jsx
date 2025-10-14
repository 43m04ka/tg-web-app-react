import React from 'react';
import styles from './SwitchLabel.module.scss';

const SwitchLabel = ({label, onChange, defaultValue}) => {

    return (
        <div className={styles['container']}>
        <label className={styles["switch"]}>
            <input type="checkbox" onChange={onChange} defaultChecked={defaultValue === 1 || defaultValue === true} />
            <span className={styles["slider"]}></span>
        </label>
            <div className={styles['label']}>
                {label}
            </div>
        </div>
    );
};

export default SwitchLabel;