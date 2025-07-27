import React from 'react';
import styles from './Modules.module.scss';

const DropLabel = ({label, onChange}) => {

    const [state, setState] = React.useState(false);
    const [value, setValue] = React.useState(-1);

    const clickItem = (index) =>{
        setValue(index);
        onChange(index);
        setState(false);
    }

    return (
        <div className={styles['input-box']}>
            <div className={styles[`block-border`]}>
                <button className={styles['button']} type="text"
                        onClick={() => {
                            state ? setState(false) : setState(true);
                        }}>
                    <div className={`${styles['background-arrow']} ${styles['background-arrow-' + (state ? 'active' : '')]}`}></div>
                    <div>{value !== -1 ? label[value].label : 'Выберите'}</div>
                </button>
                {state ?
                <div className={`${styles[`drop-element`]}`}>
                    {label.map((item, index) => (<div className={styles['button']} onClick={()=>clickItem(index)}>{item.label}</div>))}
                </div> : ''}
            </div>
        </div>
    );
};

export default DropLabel;