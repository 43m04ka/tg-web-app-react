import React, {createRef, useEffect, useState} from 'react';
import style from './Description.module.scss';

const Description = ({parameters, productData}) => {

    const [textHidden, setTextHidden] = useState(true);
    const [mode, setMode] = useState(0);
    const [height, setHeight] = useState(0);
    const refText = createRef();

    useEffect(() => {
        if (refText.current) {
            setHeight(String(refText.current.scrollHeight))
        }
    }, [mode]);

    return (<div className={style['descriptionContainer']}>
        <div className={style['modeButtons']}>
            <button onClick={() => {
                setMode(0)
            }} className={style[mode === 0 ? 'activeButton' : 'noActiveButton']}>
                Описание
            </button>
            <button onClick={() => {
                setMode(1)
            }} className={style[mode === 1 ? 'activeButton' : 'noActiveButton']}>
                Характеристики
            </button>
        </div>

        <div className={style['textContainer']}
             style={{height: textHidden && mode === 0 ? String(window.innerWidth * 5.35 * 3 / 100) + 'px' : height + 'px'}}>
            {mode === 0 ?
                <div className={style['description']}>
                    <div ref={refText}
                         onClick={() => {
                             setTextHidden(false)
                         }}>
                        {productData.description}
                    </div>
                </div> : <div className={style['parameters']} ref={refText}>
                    {parameters.map((parameter, index) => {
                        if (productData[parameter.key] !== null && productData[parameter.key] !== '') {
                            return (<div key={index}>
                                <div>{parameter.label}:</div>
                                <div>{typeof parameter.key !== 'function' ? productData[parameter.key] : parameter.key(productData)}</div>
                            </div>)
                        }
                    })}
                </div>}
        </div>

        <div className={style['seeAll']} style={{height: textHidden && mode === 0 ? '5.35vw' : '0'}}
             onClick={() => {
                 setTextHidden(false)
             }}>
            нажать, чтобы прочитать полностью
        </div>
    </div>);
};

export default Description;