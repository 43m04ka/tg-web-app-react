import React from 'react';
import styles from './Modules.module.scss';

const BlockLabel = ({label, children, onReload}) => {
    return (
        <div className={styles['block-main']}>
            <label className={styles['label']}>{label}</label>
            {typeof onReload !== 'undefined' ? (<label className={styles['label-reload']} onClick={onReload}>» обновить «</label>) : ''}
            <div className={styles['block-border']}>
                <div className={styles['block-body']}>{children}</div>
            </div>
        </div>
    );
};

export default BlockLabel;