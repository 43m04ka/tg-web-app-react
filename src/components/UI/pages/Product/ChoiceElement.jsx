import React from 'react';
import style from './Product.module.scss';


const ChoiceElement = ({set, list, index: selectedIndex, parentIndex, parameter}) => {
    if (list.length === 3) {
        return (
            <div className={style['subSlider']}>
                <div>
                    {list.map((item, index) => (
                        <div onClick={() => {
                            set(index)
                        }}>{item[parameter]}</div>))}
                </div>
                <div
                    className={style['v' + String(selectedIndex + 1)] + ' ' +
                        style['d' + String(typeof parentIndex !== "undefined" ? parentIndex + 1 : selectedIndex + 1)]}/>
            </div>
        );
    } else {
        return (<div className={style['choiceBlock']}>
            {list.map((item, index) => (
                <div style={{background: selectedIndex === index ? '#404ADE' : '#838383'}} onClick={() => {
                    set(index)
                }}>{item[parameter]}</div>))}
        </div>);
    }
};

export default ChoiceElement;