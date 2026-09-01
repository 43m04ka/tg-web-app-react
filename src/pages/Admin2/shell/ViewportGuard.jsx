import React, {useEffect, useState} from 'react';
import style from './ViewportGuard.module.scss';

const MIN_WIDTH = 1024;

export default function ViewportGuard({children}) {
    const [width, setWidth] = useState(window.innerWidth);

    useEffect(() => {
        const onResize = () => setWidth(window.innerWidth);

        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    if (width >= MIN_WIDTH) return children;

    return (
        <div className={style.guard}>
            <div className={style.card}>
                <h1 className={style.title}>Пульт открывается на компьютере</h1>
                <p className={style.text}>
                    Рабочая ширина — от 1280 пикселей: списки, инспектор и полоса задач рассчитаны
                    на большой экран. С телефона краткую сводку присылает бот.
                </p>
                <span className={style.width}>Сейчас {width} px</span>
            </div>
        </div>
    );
}
