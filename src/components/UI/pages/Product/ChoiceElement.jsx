import React from 'react';
import style from './Product.module.scss';

const ChoiceElement = ({set, list, index : selectedIndex, parameter}) => {
    return (<div className={style['choiceBlock']}>
            {list.map((item, index) => (<div style={{background: selectedIndex === index ? '#404ADE' : '#838383'}} onClick={() => {
                    set(index)
                }}>{item[parameter]}</div>))}
        </div>);
};

export default ChoiceElement;