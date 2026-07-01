import React from 'react';
import style from './SelectPlatformText.module.scss';

const SelectPlatformHeader = ({data}) => {
    return (
        <header className={style.header}>
            {data.type == 'title' ?
            (<div className={style.topRow}>
                {data.icon ? (
                    <div className={style.iconWrap}>
                        <div
                            className={style.icon}
                            style={{backgroundImage: `url(${data.icon})`}}
                        />
                    </div>
                ) : null}
                <h1 className={style.title}>{data.text}</h1>
            </div>)
            :
            (<p className={style.hint}>
                {data.text}
            </p>)
            }
        </header>
    );
};

export default SelectPlatformHeader;
