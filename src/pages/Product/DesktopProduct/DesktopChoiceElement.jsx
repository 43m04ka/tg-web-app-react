import React from 'react';
import {getChoiceTitle} from "./productDesktopUtils";
import style from "./DesktopChoiceElement.module.scss";

const DesktopChoiceElement = ({set, list, index: selectedIndex, parameter, isXbox}) => {
    if (!list.length) return null;

    return (
        <section className={style.card}>
            <p className={style.title}>{getChoiceTitle(list[0][parameter] || '', parameter)}</p>

            <div className={style.items}>
                {list.map((item, index) => (
                    <button
                        key={`${parameter}-${item.id || item[parameter]}-${index}`}
                        className={selectedIndex === index ? `${style.active} ${isXbox ? style.activeXbox : style.activeDefault}` : style.item}
                        onClick={() => set(index)}
                    >
                        {item[parameter]}
                    </button>
                ))}
            </div>
        </section>
    );
};

export default DesktopChoiceElement;
