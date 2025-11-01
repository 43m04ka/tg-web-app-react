import React from 'react';

const PromoInput = () => {

    const [inputValue, setInputValue] = React.useState('');
    return (
        <div style={{
            marginTop: '5px',
            background: '#454545',
            borderRadius: '6vw',
            margin: '0 2vw',
            padding: '2vw',
            height: '15vw',
        }}>
            <div style={{
                display: 'grid',
                gridTemplateColumns: '7fr 5fr',
                background: 'white',
                borderRadius: '15vw',
                margin: '0 1vw',
            }}>
                <input placeholder={"Промокод"} value={inputValue}
                       className={'text-element'}
                       style={{
                           height: '34px',
                           marginLeft: '0px',
                           marginTop: '0px',
                           borderTopLeftRadius: '17px',
                           borderBottomLeftRadius: '17px',
                           border: '0',
                           textAlign: 'center',
                           color: "black"
                       }} onChange={(event) => {
                    if (true) {
                        setInputValue(event.target.value.toUpperCase());
                    }
                }} onClick={() => {}}/>
                <div className={'text-element'} style={{background:'#AEAEAE'}}
                        onClick={() => {
                            usePromo(promoInput, (result)=>{
                                if (result !== null) {
                                    if (result.totalNumberUses !== 0) {
                                        setPromoIsUse(true)
                                        setParcent(result.percent)
                                        setPromoButtonColor([82, 165, 87])
                                        setPromoButtonText('Скидка активна')
                                    } else {
                                        setPromoIsUse(false)
                                        setPromoButtonColor([164, 30, 30])
                                        setPromoButtonText('Кол-во исчерпано')
                                    }
                                } else {
                                    setPromoIsUse(false)
                                    setPromoButtonColor([164, 30, 30])
                                    setPromoButtonText('Промокод не найден')
                                }
                            }).then()
                        }}>ПРИМЕНИТЬ
                </div>
            </div>
        </div>
    );
};

export default PromoInput;