import React from 'react';
import style from './ButtonLine.module.scss'

const ButtonLine = ({listButtonData, returnOptions}) => {

    return (
        <div className={style['buttonLine']}>
            {listButtonData.map((item, index) => (
                <div>
                    <div className={style['status-' + String(item.status)]}
                         style={{color:item.color || 'white'}} key={index}
                         onClick={() => {
                            returnOptions(item.key)
                         }}>
                        {item.name}
                    </div>
                    {index < listButtonData.length - 1 ?
                        <div className={style['separator']}/> : ''}
                </div>
            ))
            }
        </div>
    );
};

export default ButtonLine;