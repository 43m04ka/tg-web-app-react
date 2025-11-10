import React, {createRef, useEffect, useState} from 'react';
import styles from './Product.module.scss';

const Description = ({children}) => {

    const [textHidden, setTextHidden] = useState(null);
    const refText = createRef();

    useEffect(() => {
        setTextHidden(refText.current.getBoundingClientRect().height > 76 ? true : 0)
    }, []);

    return (
        <div style={{
            color: 'white',
            background: '#2b2e31',
            borderRadius: '15px',
            padding: '10px',
            paddingBottom: '10px',
            textAlign: 'left',
            fontFamily: "'Montserrat', sans-serif",
            marginTop: '5px',
            marginBottom: '7px',
        }} onClick={() => {
            setTextHidden(!textHidden)
        }}>
            <div style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginLeft: '5px',
                height: '20px',
                alignItems: 'center'
            }}>
                <div style={{fontWeight: '600', marginLeft: '0px', fontSize: '14px', lineHeight: '17px'}}
                     className={'text-element'}>
                    Описание
                </div>
                <div className={`${styles['background-arrow']} ${styles['background-arrow-' + textHidden]}`}/>
            </div>
            <div ref={refText} className={`${styles['text']} ${styles['text-' + textHidden]}`}>
                {children}
            </div>
        </div>
    );
};

export default Description;