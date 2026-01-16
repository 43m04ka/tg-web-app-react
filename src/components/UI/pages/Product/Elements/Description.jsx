import React, {createRef, useEffect, useState} from 'react';
import style from './Description.module.scss';
import CatalogItem from "../../Catalog/CatalogItem";

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
            {productData.conceptProducts !== null && productData.conceptProducts.length > 0 ?
                <button onClick={() => {
                    setMode(2)
                }} className={style[mode === 2 ? 'activeButton' : 'noActiveButton']}>
                    Издания
                </button>
                : ''}
            {productData.conceptAddOns !== null ?
                <button onClick={() => {
                    setMode(3)
                }} className={style[mode === 3 ? 'activeButton' : 'noActiveButton']}>
                    Донат
                </button> : ''}
        </div>

        <div className={style['textContainer']}
             style={{height: textHidden && mode === 0 ? String(window.innerWidth * 5.35 * 3 / 100) + 'px' : height + 'px'}}>
            {mode === 0 ? <div className={style['description']}>
                <div ref={refText} onClick={() => {
                    setTextHidden(false)
                }}>
                    {productData.description.split('<br/>').map((item, index) => (<span key={index}>
                            {item}
                        {index !== productData.description.split('<br/>').length - 1 && <br/>}
                        </span>))}
                </div>
            </div> : ''}
            {mode === 1 ? <div className={style['parameters']} ref={refText}>
                {parameters.map((parameter, index) => {
                    if (!(productData[parameter.key] === null || productData[parameter.key] === '' || (typeof parameter.key === 'function' && parameter.key(productData) === null))) {
                        return (<div key={index}>
                            <p>
                                <span>{parameter.label}:</span>{typeof parameter.key !== 'function' ? productData[parameter.key] : parameter.key(productData)}
                            </p>
                        </div>)
                    }
                })}
            </div> : ''}
            {mode === 2 ? <div className={style['conceptList']} ref={refText}>
                <div>
                    {productData.conceptProducts.map(item => {
                        return (<div>
                            <CatalogItem key={item.id} product={item}/>
                        </div>)
                    })}
                </div>
            </div> : ''}
            {mode === 3 ? <div className={style['conceptList']} ref={refText}>
                <div>
                    {productData.conceptAddOns.map(item => {
                        return (<div>
                            <CatalogItem key={item.id} product={item}/>
                        </div>)
                    })}
                </div>
            </div> : ''}
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