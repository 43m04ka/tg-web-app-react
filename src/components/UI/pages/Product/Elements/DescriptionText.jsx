import React, {createRef, useEffect, useState} from 'react';
import style from "./Description.module.scss";

const DescriptionText = ({productData}) => {

    const [textHidden, setTextHidden] = useState(true);
    const [height, setHeight] = useState(0);
    const refText = createRef();

    useEffect(() => {
        if (refText.current) {
            setHeight(String(refText.current.scrollHeight))
        }
    }, []);

    return (
        <div className={style['descriptionContainer']}>
            <div className={style['textContainer']}
                 style={{height: textHidden ? String(window.innerWidth * 5.35 * 3 / 100) + 'px' : height + 'px'}}>
                <div className={style['description']}>
                    <div ref={refText} onClick={() => {
                        setTextHidden(false)
                    }}>
                        {productData.description.split('<br/>').map((item, index) => (<span key={index}>
                            {item}
                            {index !== productData.description.split('<br/>').length - 1 && <br/>}
                        </span>))}
                    </div>
                </div>
            </div>
            <div className={style['seeAll']} style={{height: textHidden ? '5.35vw' : '0'}}
                 onClick={() => {
                     setTextHidden(false)
                 }}>
                нажать, чтобы прочитать полностью
            </div>
        </div>
    );
};

export default DescriptionText;