import React from 'react';
import style from '../Product.module.scss';


const ChoiceElement = ({set, list, index: selectedIndex, parentIndex, parameter, isXbox}) => {
    if (list.length === 3) {
        return (<div className={style['subSlider']}>
            <div>
                {list[0][parameter].includes('акк') ? 'Способ активации:' : list[0][parameter].includes('месяц') ? 'Срок подписки:' : 'Вид подписки:'}
                {}
            </div>
            <div>
                <div>
                    {list.map((item, index) => (<div onClick={() => {
                        set(index)
                    }}>{item[parameter]}</div>))}
                </div>
                <div
                    className={style['v' + String(selectedIndex + 1)] + ' ' + style['d' + String(typeof parentIndex !== "undefined" ? parentIndex + 1 : selectedIndex + 1)]}/>
            </div>
        </div>);
    } else {
        return (<div className={style['choiceBlock']}>
            <div>
                {list[0][parameter].includes('акк') ? 'Способ активации:' : list[0][parameter].includes('месяц') ? 'Срок подписки:' : 'Номинал пополнения:'}
                {}
            </div>
            <div>
                {list.map((item, index) => (
                    <div style={{background: selectedIndex === index ? isXbox ? '#69C76E' : '#404ADE' : '#838383'}}
                         onClick={() => {
                             set(index)
                         }}>{item[parameter]}</div>))}
            </div>
        </div>);
    }
};

export default ChoiceElement;