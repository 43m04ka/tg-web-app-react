import React from "react";
import style from "./DesktopPayment.module.scss";

const addDays = (date, days) => {
    const nextDate = new Date(date.valueOf());
    nextDate.setDate(nextDate.getDate() + days);
    return nextDate;
};

const DesktopPayment = ({sumPrice, setPaymentMethodString}) => {
    const [selected, setSelected] = React.useState(0);
    const [infoLabel, setInfoLabel] = React.useState("");

    if (sumPrice < 2000 && selected !== 0) {
        setSelected(0);
    }

    const options = {month: "long", day: "numeric"};
    const date = new Date();

    return (
        <div>
            <div className={style.title}>Способ оплаты:</div>
            <div className={style.buttons}>
                <button
                    className={style[selected === 0 ? "activeButton" : "noActiveButton"]}
                    onClick={() => {
                        setSelected(0);
                        setPaymentMethodString("Способ оплаты: СБП");
                        setInfoLabel("");
                    }}
                >
                    <div className={style.sbpIcon}/>
                    <p>СБП</p>
                </button>
                <button
                    className={style[selected === 1 ? "activeButton" : "noActiveButton"]}
                    onClick={() => {
                        if (sumPrice < 2000) {
                            setInfoLabel("Яндекс Сплит доступен при покупке от 2000 руб");
                            return;
                        }
                        setSelected(1);
                        setPaymentMethodString("Способ оплаты: Яндекс Сплит");
                        setInfoLabel("");
                    }}
                >
                    <div className={style.splitIcon}/>
                    <p>Яндекс Сплит</p>
                </button>
                <button
                    className={style[selected === 2 ? "activeButton" : "noActiveButton"]}
                    onClick={() => {
                        if (sumPrice < 2000) {
                            setInfoLabel("Оплата Долями доступна при покупке от 2000 руб");
                            return;
                        }
                        setSelected(2);
                        setPaymentMethodString("Способ оплаты: Долями");
                        setInfoLabel("");
                    }}
                >
                    <div className={style.dolyamiIcon}/>
                    <p>Долями</p>
                </button>
            </div>

            <div
                style={{
                    height: selected === 1 || selected === 2 ? (selected === 1 ? "130px" : "145px") : "0",
                    transition: "all 0.15s ease-in-out"
                }}
            >
                {selected === 1 || selected === 2 ? (
                    <>
                        <div className={style.datePlace}>
                            {[0, 14, 28, 42].map((offset) => (
                                <div key={offset}>
                                    <p>{offset === 0 ? "Сегодня" : addDays(date, offset).toLocaleString("ru-RU", options)}</p>
                                    <p>{Math.round(sumPrice / 4).toLocaleString()} ₽</p>
                                    <div/>
                                </div>
                            ))}
                        </div>
                        {selected === 1 ? (
                            <p className={style.infoLabel}>
                                График платежей является информационным и может отличаться от конечного при оформлении.
                                <br/> <a href={"https://yandex.ru/legal/yandexpay_b2c/"}>Подробные условия сервиса</a>
                            </p>
                        ) : (
                            <p className={style.infoLabel}>
                                График платежей является информационным и может отличаться от конечного при оформлении.
                                <br/> Возможен сервисный сбор.
                                <br/> <a href={"https://dolyame.ru/"}>Подробные условия сервиса</a>
                            </p>
                        )}
                    </>
                ) : (
                    ""
                )}
            </div>

            <div style={{height: infoLabel !== "" ? "20px" : "0", transition: "all 0.15s ease-in-out"}}>
                <p className={style.infoLabel} style={{marginTop: "8px"}}>
                    {infoLabel}
                </p>
            </div>
        </div>
    );
};

export default DesktopPayment;
