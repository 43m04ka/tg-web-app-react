import React, {useCallback} from 'react';

const Cassa = () => {

    let dataRequestDatabase = {
        userName:'Admin-bot',
        password:'49ODAvir',

    }

    const sendRequestDatabase = useCallback(() => {
        fetch('https://alfa.rbsuat.com/payment/rest/register.do', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(dataRequestDatabase)
        }).then(r => {
            let Promise = r.json()
            Promise.then(prom => {

                console.log(prom)
            })
        })
    }, [dataRequestDatabase])

    return (
        <div>
            <form method='POST' action='https://demo.alfa-processing.ru/create/'>
                Введите сумму оплаты: <input type='text' name='sum' value='100'/>
                Введите номер заказа: <input type='text' name='orderid' value='123456'/> <br/>
                Введите номер телефона: <input type='text' name='client_phone' value=''/> <br/>
                <input type='submit' value='Перейти к оплате'/>
            </form>
            <button onClick={() => {
                sendRequestDatabase()
            }}>запрос
            </button>
        </div>
    );
};

export default Cassa;