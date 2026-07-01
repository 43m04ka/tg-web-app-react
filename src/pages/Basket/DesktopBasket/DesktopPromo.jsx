import React from 'react';
import style from './DesktopPromo.module.scss';
import { useServerUser } from '../../../hooks/useServerUser';

const DesktopPromo = ({ setPromoData }) => {
    const [inputValue, setInputValue] = React.useState('');
    const [color, setColor] = React.useState('#222222');
    const [text, setText] = React.useState('Применить');
    const { usePromo } = useServerUser();

    const onReturnResult = (result) => {
        if (result !== null) {
            if (result.totalNumberUses > 0) {
                setPromoData(result);
                setColor('#50A355');
                setText('Скидка активна');
            } else {
                setColor('#ED7373');
                setText('Кол-во исчерпано');
            }
        } else {
            setColor('#ED7373');
            setText('Промокод не найден');
        }
    };

    return (
        <div className={style.mainContainer}>
            <input
                onClick={() => {
                    if (text !== 'Скидка активна') {
                        setInputValue('');
                        setColor('#222222');
                        setText('Применить');
                    }
                }}
                placeholder={'Промокод'}
                value={inputValue}
                onChange={(e) => {
                    if (text !== 'Скидка активна') {
                        setColor(e.target.value === '' ? '#222222' : '#50A355');
                        setInputValue(e.target.value.toUpperCase());
                    }
                }}
            />
            <button
                onClick={() => {
                    usePromo(inputValue, onReturnResult).then();
                }}
                style={{ background: color }}
            >
                <p>{text}</p>
            </button>
        </div>
    );
};

export default DesktopPromo;
