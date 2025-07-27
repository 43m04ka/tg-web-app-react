import React from 'react';
import styles from './Modules.module.scss';

const SeparatorLabel = ({label, children}) => {
    return (
        <div className={styles['separator-main']}>
            <label className={styles['label']}>{label}</label>
            <div className={styles['separator-body']}>{children}</div>
        </div>
    );
};

export default SeparatorLabel;