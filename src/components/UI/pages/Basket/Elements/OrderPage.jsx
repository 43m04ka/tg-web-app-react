import React, {useEffect, useState} from 'react';
import style from "./OrderPage.module.scss";

const OrderPage = ({orderId}) => {

    const [stage, setStage] = useState(0);

    useEffect(() => {
        setTimeout(()=>{
            setStage(1)
        }, 5400)
    }, [])

    return (
        <div className={style['container']}>
            {stage === 0 ?
                (<div className={style['golo']}>
                    <div/>
                </div>)
                : ''}

            {/*<div style={{flexDirection: 'column', display: 'flex'}}>*/}
            {/*    <div className={style['happyDuck']}/>*/}
            {/*    <div className={style['label']}>{'Заказ №' + String(orderId) + ' успешно оформлен.'}</div>*/}
            {/*    <div className={style['label']} style={{marginBottom: '5vw'}}>*/}
            {/*        Совсем скоро с Вами свяжется наш менеджер - @gwstore_admin для оплаты и активации Вашего заказа.*/}
            {/*    </div>*/}
            {/*    <a className={style['linkElement']}*/}
            {/*       href={'https://t.me/gwstore_admin'}>*/}
            {/*        <button className={style['button']} style={{background: '#50A355'}}>*/}
            {/*            Написать менеджеру*/}
            {/*        </button>*/}
            {/*    </a>*/}
            {/*    <Link to={'/'} className={style['linkElement']}>*/}
            {/*        <button className={style['button']} style={{background: '#454545'}}>*/}
            {/*            Вернуться на главную*/}
            {/*        </button>*/}
            {/*    </Link>*/}
            {/*</div>*/}
        </div>
    );
};

export default OrderPage;