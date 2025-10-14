import React from 'react';
import styles from './DropBox.module.scss';

const DropBox = ({label, onChange}) => {

    const [state, setState] = React.useState(false);
    const [value, setValue] = React.useState(0);

    const clickItem = (index) => {
        setValue(index);
        onChange(index);
        setState(false);
    }

    return (
        <div className={styles['body']} onMouseLeave={()=>{setState(false)}}>
            <button type="text"
                    onClick={() => {
                        state ? setState(false) : setState(true);
                    }}>
                <p>{label[value].name}</p>
                <div
                    className={`${styles['background-arrow']} ${styles['background-arrow-' + (state ? 'active' : '')]}`}></div>
            </button>
            <div>
                {state ?
                    <ul>
                        {label.map((item, index) => (<>
                            <div className={styles['button']} onClick={() => clickItem(index)}>{item.name}</div>
                            {index < label.length - 1 ?
                                <div className={styles['buttonOptionSeparator']}/> : ''}</>))}
                    </ul> : ''}
            </div>
        </div>
    );
};

export default DropBox;