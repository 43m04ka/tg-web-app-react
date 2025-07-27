import React from 'react';
import styles from './Modules.module.scss';

const Button = ({label, onClick}) => {

    return (
        <div className={styles['input-box']}>
            <div className={styles[`block-border`]}>
                <button className={styles['button']} type="text"
                        onClick={() => onClick()}>» {label} «</button>
            </div>
        </div>
    );
};

export default Button;