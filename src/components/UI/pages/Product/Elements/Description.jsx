import React, {createRef, useEffect, useState} from 'react';
import styles from './Description.module.scss';

const Description = ({parameters, productData}) => {

    const [textHidden, setTextHidden] = useState(false);
    const [mode, setMode] = useState(0);
    const [height, setHeight] = useState('max-content');
    const refText = createRef();

    useEffect(() => {
        if (refText.current) {
            setHeight(String(refText.current.offsetHeight) + 'px')
            setTextHidden(true);
        }
    }, []);

    if (refText.current){
        console.log(refText.current.getBoundingClientRect());
    }

    return (<div className={styles['description']}>
        <div className={styles['modeButtons']}>
            <button onClick={() => {setMode(0)}} className={styles[mode === 0 ? 'activeButton' : 'noActiveButton']}>
                Описание
            </button>
            <button onClick={() => {setMode(1)}} className={styles[mode === 1 ? 'activeButton' : 'noActiveButton']}>
                Характеристики
            </button>
        </div>
        <div ref={refText} style={{height: (textHidden ? String(window.innerWidth * 5.35 / 100) + 'px' : height)}}>
            {productData.description}
        </div>
        <div style={{height: textHidden ? '5.35vw' : '0'}} onClick={() => {
            setTextHidden(false)
        }}>
            нажать, чтобы прочитать полностью
        </div>
    </div>);
};

export default Description;