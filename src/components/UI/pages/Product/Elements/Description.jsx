import React, {createRef, useEffect, useState} from 'react';
import styles from '../Product.module.scss';

const Description = ({children}) => {

    const [textHidden, setTextHidden] = useState(false);
    const [height, setHeight] = useState('max-content');
    const refText = createRef();

    useEffect(() => {
        if (refText.current) {
            setHeight(String(refText.current.getBoundingClientRect().height) + 'px')
            setTextHidden(true);
        }
    }, []);


    return (<div className={styles['description']} onClick={() => {
        setTextHidden(!textHidden)
    }}>
        <div ref={refText} style={{height: (textHidden ? String(window.innerWidth * 5.35 / 100) + 'px' : height)}}>
                <span>
                    Описание игры:
                </span>
            {children}
        </div>
        <div>
            {textHidden ? 'нажать, чтобы прочитать полностью' : 'нажать, чтобы скрыть'}
        </div>
    </div>);
};

export default Description;