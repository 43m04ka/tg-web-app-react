import React, {useEffect} from 'react';
import style from './List.module.scss';

const ThreePoint = ({positionOptions, returnOption}) => {

    const [isOpen, setIsOpen] = React.useState(null);

    useEffect(() => {
        if (positionOptions['name'].length > 0) {
            setIsOpen(false);
        }
    }, [positionOptions]);

    if (isOpen !== null) {
        return (
            <div className={style['threePoint']}
                 onClick={() => {
                     setIsOpen(!isOpen)
                 }}
                 onMouseLeave={() => {
                     setIsOpen(false)
                 }}>
                {isOpen ?
                    (
                        <div className={style['threePointContainer']}>
                            <div className={style['threePointMenu']}>
                                <div>
                                    {positionOptions['name'].map((item, index) => (
                                        <div style={{justifyItems: 'center'}}>
                                            <div className={style['buttonOption']}
                                                 onClick={() => {
                                                     returnOption(positionOptions['key'][index]);
                                                 }}>{item}</div>
                                            {index < positionOptions['name'].length - 1 ?
                                                <div className={style['buttonOptionSeparator']}/> : ''}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>)
                    : ''}
            </div>
        );
    }
};

export default ThreePoint;