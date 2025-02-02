import React, {useCallback} from 'react';

const Cassa = () => {

    let dataRequestDatabase = {

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
            <button onClick={()=>{sendRequestDatabase()}}>запрос</button>
        </div>
    );
};

export default Cassa;