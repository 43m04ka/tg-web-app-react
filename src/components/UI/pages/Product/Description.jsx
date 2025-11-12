import React, {createRef, useEffect, useState} from 'react';
import styles from './Product.module.scss';

const Description = ({children}) => {

    const [textHidden, setTextHidden] = useState(null);
    const refText = createRef();

    useEffect(() => {
        setTextHidden(refText.current.getBoundingClientRect().height > 76 ? true : 0)
    }, []);

    return (
        <div className={styles['description']} onClick={() => {
            setTextHidden(!textHidden)
        }}>
            <div>
                <div>Описание игры: </div>
                <div className={`${styles['background-arrow']} ${styles['background-arrow-' + textHidden]}`}/>
            </div>
            <div ref={refText} className={`${styles['text']} ${styles['text-' + textHidden]}`}>
                {children}
            </div>
        </div>
    );
};

export default Description;