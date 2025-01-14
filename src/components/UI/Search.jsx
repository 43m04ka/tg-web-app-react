import React, {useCallback, useEffect} from 'react';
import {Link, useNavigate} from "react-router-dom";
import {useTelegram} from "../../hooks/useTelegram";

const Search = ({height, page}) => {
    const [listRes, setListRes] = React.useState([]);
    const [status, setStatus] = React.useState(1);
    const [textInput, setTextInput] = React.useState('');
    const {tg} = useTelegram();
    const navigate = useNavigate();

    const onChangeEmpty = (event) => {
        let allCard = []
        let result = null
        allCard.map(card => {
            if (card.title.toLowerCase().includes(valueInput.toLowerCase())) {
                result = [...result, card]
            }
        })

    }

    let dataRequestDatabase = {
        method: 'getSearch',
        data: {str:textInput, page:page}
    }

    const sendRequestDatabase = useCallback(() => {
        console.log(dataRequestDatabase, 'inputRequestDb')
        fetch('https://2ae04a56-b56e-4cc1-b14a-e7bf1761ebd5.selcdn.net/database', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(dataRequestDatabase)
        }).then(r => {
            let Promise = r.json()
            Promise.then(prom => {
                console.log(prom, 'возвратил get')
                if (dataRequestDatabase.method === 'getSearch') {
                    setListRes(prom.cards)
                    setStatus(1)
                }
            })
        })
    }, [dataRequestDatabase])

    const onBack = useCallback(() => {
        navigate(-1);
    }, [])

    useEffect(() => {
        tg.BackButton.show();
    }, [])

    useEffect(() => {
        tg.onEvent('backButtonClicked', onBack)
        return () => {
            tg.offEvent('backButtonClicked', onBack)
        }
    }, [onBack])


    if (status === 1) {
        return (
            <div>
                <div style={{
                    borderBottom: '2px gray solid',
                    display: "grid",
                    gridTemplateColumns: '1fr 55px',
                    width: String(window.innerWidth) + 'px'
                }}>
                    <input className={'search'} placeholder={'Найти игру, водписку, валюту...'}
                           onChange={() => setTextInput(event.target.value)}
                           style={{
                               border: '0px', fontSize: '15px',
                               fontFamily: "'Montserrat', sans-serif",
                               paddingLeft: '5px'
                           }}></input>
                    <div className={'div-button-panel'} style={{padding: '3px'}} onClick={()=>{
                        setStatus(0)
                        sendRequestDatabase()
                    }}>
                        <div className={'background-search'} style={{width: '100%', height: '100%'}}></div>
                    </div>
                </div>
                <div className={'scroll-container-y'} style={{height: String(height - 70) + 'px'}}>
                    {listRes.map((item) => (
                        <div className={'list-element'}
                             style={{marginLeft: '20px', width: String(window.innerWidth - 40) + 'px'}}>
                            <Link to={'/card/' + item.body.id} className={'link-element'}
                                  style={{display: 'flex', flexDirection: 'row', justifyContent: 'left'}}>

                                <img src={item.body.img} alt={item.body.title} className={'img-mini'}/>
                                <div className={'box-grid-row'}>
                                    <div className={'text-element text-basket'} style={{
                                        marginTop: '3px',
                                        lineHeight: '17px',
                                        overflow:'hidden',
                                        height: '34px',
                                        fontSize: '15px'
                                    }}>{item.body.title}</div>
                                    <div className={'text-element text-basket'} style={{
                                        marginTop: '12px',
                                        lineHeight: '15px',
                                        height: '15px',
                                        fontSize: '15px'
                                    }}>{item.body.price + ' ₽'}</div>
                                </div>
                            </Link>
                        </div>))}
                </div>
            </div>
        );
    }

    if (status === 0) {
        return (
            <div>
                <div style={{
                    borderBottom: '2px gray solid',
                    display: "grid",
                    gridTemplateColumns: '1fr 55px',
                    width: String(window.innerWidth) + 'px'
                }}>
                    <input className={'search'} placeholder={'Найти игру, водписку, валюту...'}
                           onChange={() => setTextInput(event.target.value)}
                           style={{
                               border: '0px', fontSize: '15px',
                               fontFamily: "'Montserrat', sans-serif",
                               paddingLeft: '5px'
                           }}></input>
                    <div className={'div-button-panel'} style={{padding: '3px'}} onClick={() => {
                    }}>
                        <div className={'background-search'} style={{width: '100%', height: '100%'}}></div>
                    </div>
                </div>
                <div className={'pong-loader'} style={{
                    border: '2px solid #8cdb8b',
                    marginTop: String((window.innerHeight - 60) / 2 - 60) + 'px',
                    marginLeft: String(window.innerWidth / 2 - 40) + 'px'
                }}></div>
            </div>
        );
    }
}

export default Search;