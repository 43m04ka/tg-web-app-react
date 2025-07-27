import React from 'react';
import styles from './Modules.module.scss';

const SwitchLabel = ({label, onChange, defaultValue}) => {

    const [state, setState] = React.useState(defaultValue || false);

    return (
        <div className={styles['input-box']}>
            <div className={styles[`border-${state}`]}>
                <button className={styles['button']} type="text"
                        onClick={() => {
                            onChange(!state)
                            state ? setState(false) : setState(true);
                        }}>{state ? label[0] : label[1]}</button>
            </div>
        </div>
    );
};

export default SwitchLabel;