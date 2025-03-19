import React, {useRef, useState} from 'react';
import '../styles/style.css';
import ProductItem from "./ProductItem";
import {useTelegram} from "../../hooks/useTelegram";
import {useCallback, useEffect} from "react";
import {Link, useNavigate} from "react-router-dom";
import Filter from "./Filter";


const getTotalPrice = (items = []) => {
    return items.reduce((acc, item) => {
        return acc += item.price
    }, 0)
}

let list = 1
let lastPath = ''

const AdminProductList = ({path}) => {
    if(lastPath !== path){
        list = 1
        lastPath = path
    }
    const [products, setProducts] = useState([])
    const [status, setStatus] = useState(0);
    const {tg, user} = useTelegram();
    const [len, setLen] = useState(0);
    const navigate = useNavigate();
    const [listNumber, setListNumber] = useState(list);
    const [selectedId, setSelectedId] = useState(-1);


    let dataRequestDatabase = {
        method: 'getList',
        data: {}
    }

    const sendRequestDatabase = useCallback(() => {
        fetch('https://2ae04a56-b56e-4cc1-b14a-e7bf1761ebd5.selcdn.net/database', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(dataRequestDatabase)
        }).then(r => {
            let Promise = r.json()
            Promise.then(async prom => {
                console.log(prom.cards + '----------------')
                if (dataRequestDatabase.method === 'getList') {
                    await setStatus(1)
                    await setProducts(prom.cards || [])
                    await setLen(prom.len)
                } else {
                    await setStatus(1)
                }
            })
        })
    }, [dataRequestDatabase])

    const sendRequestOnDatabase = (inputData, operation) => {
        dataRequestDatabase.method = operation
        dataRequestDatabase.data = inputData
        sendRequestDatabase()
    }

    const onBack = useCallback(() => {
        navigate(-1);
    }, [])

    useEffect(() => {
        tg.onEvent('backButtonClicked', onBack)
        return () => {
            tg.offEvent('backButtonClicked', onBack)
        }
    }, [onBack])

    useEffect(() => {
        tg.BackButton.show();
    }, [])

    let nav1El = (<div></div>)
    let nav2El = (<div></div>)
    let nav3El = (<div></div>)
    let nav4El = (<div></div>)
    if (listNumber > 1) {
        nav1El = (<div onClick={() => {
            list = 1;
            sendRequestOnDatabase({path: path, number: list}, 'getList')
            setListNumber(list)
            setStatus(10)
        }}
                       className={'text-element'} style={{
            height: '20px',
            width: '20px',
            textAlign: 'center',
            lineHeight: '20px',
            borderRadius: '5px',
            border: '1px solid gray',
        }}>{1}</div>)
        nav2El = (<div onClick={() => {
            list = listNumber - 1;
            sendRequestOnDatabase({path: path, number: list}, 'getList')

            setListNumber(list);
            setStatus(10)
        }}
                       className={'background-arrow'} style={{
            height: '20px',
            width: '20px',
            textAlign: 'center',
            lineHeight: '20px',
            borderRadius: '50%',
            rotate: '180deg'
        }}></div>)
    }
    if (listNumber < len) {
        nav3El = (<div onClick={() => {
            list = len;
            sendRequestOnDatabase({path: path, number: list}, 'getList')
            setListNumber(list);
            setStatus(10)
        }}
                       className={'text-element'} style={{
            height: '20px',
            width: '20px',
            textAlign: 'center',
            lineHeight: '20px',
            borderRadius: '5px',
            border: '1px solid gray',
        }}>{len}</div>)

        nav4El = (<div onClick={() => {
            list = listNumber + 1;
            sendRequestOnDatabase({path: path, number: list}, 'getList')
            setListNumber(list)
            setStatus(10)
        }}
                       className={'background-arrow'} style={{
            height: '20px',
            width: '20px',
            textAlign: 'center',
            lineHeight: '20px',
            borderRadius: '50%',
        }}></div>)
    }

    let bodyElement = (<div/>)

    if (products.length !== 0) {
        bodyElement = (<div>
                <div className={'list-grid'}>
                    {products.map(card => {
                            let colorButtonStatus, textColorButtonStatus, textButtonStatus

                            if (card.body.isSale) {
                                textButtonStatus = 'Убрать с продажи'
                                colorButtonStatus = 'white'
                                textColorButtonStatus = 'black'
                            } else {
                                textButtonStatus = 'Включить в продажу'
                                colorButtonStatus = '#ef7474'
                                textColorButtonStatus = 'white'
                            }

                            let height = 0
                            let textButton = 'Изменить цену'
                            let buttonColor = 'black'
                            let buttonBackground = 'white'
                            if (selectedId === card.id) {
                                height = card.category.length * 30 + 60
                                textButton = 'Скрыть поле поле'
                                buttonBackground = '#ef7474'
                                buttonColor = 'white'
                            }
                            let newPriceArr = card.price

                        let oldPriceValue = null

                        if (typeof card.body.endDate !== 'undefined') {
                            oldPriceValue = card.body.oldPrice
                        }

                            let oldPriceEditElement = (<div style={{height: '25px'}}>
                                    <div style={{
                                        display: 'flex',
                                        flexDirection: 'row',
                                        height: '25px',
                                        marginTop: '5px',
                                        width: 'max-content'
                                    }}>
                                        <div className={'text-element'} style={{
                                            marginLeft: '0px',
                                            background: '#131313',
                                            lineHeight: '15px',
                                            padding: '5px',
                                            borderRadius: '100px',
                                        }}>
                                            <div style={{
                                                marginLeft: '5px',
                                                marginRight: '5px',
                                                height: '15px',
                                                overflow: 'hidden'
                                            }}>
                                                {card.category.length + 1 + ' - Старая цена'}
                                            </div>
                                        </div>
                                        <div className={'text-element'} style={{
                                            marginLeft: '0px',
                                            background: '#131313',
                                            lineHeight: '15px',
                                            borderRadius: '100px',
                                        }}>
                                            <div style={{
                                                marginLeft: '5px',
                                                height: '25px',
                                                overflow: 'hidden',
                                                display: 'flex',
                                            }}>
                                                <div style={{marginRight: '3px', marginTop: '5px',}}>
                                                    Цена:
                                                </div>
                                                <input defaultValue={oldPriceValue}
                                                       onChange={(event) => {
                                                           oldPriceValue = parseInt(event.target.value)
                                                       }} style={{
                                                    borderRadius: '100px',
                                                    border: '0px',
                                                    paddingLeft: '5px'
                                                }}/>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )

                            return (
                                <div style={{
                                    borderBottom: '1px solid grey',
                                    paddingBottom: '5px'
                                }}>
                                    <div style={{
                                        display: 'flex',
                                        flexDirection: 'row',
                                        paddingTop: '5px',
                                    }}>
                                        <img src={card.body.img} alt={card.body.title} style={{
                                            height: '85px',
                                            width: '85px',
                                            backgroundSize: 'cover',
                                            borderRadius: '10px'
                                        }}/>
                                        <div style={{display: 'flex', flexDirection: 'column'}}
                                             className={'text-element text-basket'}>
                                            <div style={{
                                                display: 'flex',
                                                flexDirection: 'row',
                                                height: '25px',
                                            }}>
                                                <div style={{
                                                    background: '#131313',
                                                    lineHeight: '15px',
                                                    padding: '5px',
                                                    borderRadius: '100px',
                                                }}>
                                                    <div style={{
                                                        marginLeft: '5px',
                                                        marginRight: '5px',
                                                        height: '15px',
                                                        overflow: 'hidden'
                                                    }}>
                                                        {'Имя: ' + card.body.title}
                                                    </div>
                                                </div>
                                            </div>
                                            <div style={{
                                                display: 'flex',
                                                flexDirection: 'row',
                                                height: '25px',
                                                marginTop: '5px',
                                                width: 'max-content'
                                            }}>
                                                <div style={{
                                                    background: '#131313',
                                                    lineHeight: '15px',
                                                    padding: '5px',
                                                    borderRadius: '100px',
                                                }}>
                                                    <div style={{
                                                        marginLeft: '5px',
                                                        marginRight: '5px',
                                                        height: '15px',
                                                        overflow: 'hidden'
                                                    }}>
                                                        {'Цена: ' + card.body.price}
                                                    </div>
                                                </div>

                                                <div style={{
                                                    marginLeft: '5px',
                                                    background: '#131313',
                                                    lineHeight: '15px',
                                                    padding: '5px',
                                                    borderRadius: '100px',
                                                }}>
                                                    <div style={{
                                                        marginLeft: '5px',
                                                        marginRight: '5px',
                                                        height: '15px',
                                                        overflow: 'hidden'
                                                    }}>
                                                        {'Платформа: ' + card.body.platform}
                                                    </div>
                                                </div>
                                                <div style={{
                                                    marginLeft: '5px',
                                                    background: '#131313',
                                                    lineHeight: '15px',
                                                    padding: '5px',
                                                    borderRadius: '100px',
                                                }}>
                                                    <div style={{
                                                        marginLeft: '5px',
                                                        marginRight: '5px',
                                                        height: '15px',
                                                        overflow: 'hidden'
                                                    }}>
                                                        {'Каталоги: ' + String(card.category)}
                                                    </div>
                                                </div>
                                            </div>
                                            <div style={{
                                                display: 'flex',
                                                flexDirection: 'row',
                                                height: '25px',
                                                marginTop: '5px',
                                                width: 'max-content'
                                            }}>
                                                <div style={{
                                                    background: '#131313',
                                                    lineHeight: '15px',
                                                    padding: '5px',
                                                    borderRadius: '100px',
                                                }}>
                                                    <div style={{
                                                        marginLeft: '5px',
                                                        marginRight: '5px',
                                                        height: '15px',
                                                        overflow: 'hidden'
                                                    }}>
                                                        {'Id: ' + card.id}
                                                    </div>
                                                </div>
                                                <div style={{
                                                    marginLeft: '5px',
                                                    background: colorButtonStatus,
                                                    color: textColorButtonStatus,
                                                    lineHeight: '15px',
                                                    padding: '5px',
                                                    borderRadius: '100px',
                                                }}>
                                                    <div style={{
                                                        marginLeft: '5px',
                                                        marginRight: '5px',
                                                        height: '15px',
                                                        overflow: 'hidden'
                                                    }} onClick={async () => {
                                                        dataRequestDatabase.method = 'changeStatus'
                                                        dataRequestDatabase.data = card.category[0]
                                                        dataRequestDatabase.idList = [card.id]
                                                        await sendRequestDatabase()
                                                    }}>
                                                        {textButtonStatus}
                                                    </div>
                                                </div>
                                                <div style={{
                                                    marginLeft: '5px',
                                                    background: buttonBackground,
                                                    color: buttonColor,
                                                    lineHeight: '15px',
                                                    padding: '5px',
                                                    borderRadius: '100px',
                                                }}>
                                                    <div style={{
                                                        marginLeft: '5px',
                                                        marginRight: '5px',
                                                        height: '15px',
                                                        overflow: 'hidden'
                                                    }} onClick={async () => {
                                                        if (card.id !== selectedId) {
                                                            setSelectedId(card.id)
                                                        } else {
                                                            setSelectedId(-1)
                                                        }
                                                    }}>
                                                        {textButton}
                                                    </div>
                                                </div>
                                                <div style={{
                                                    marginLeft: '5px',
                                                    background: 'white',
                                                    color: 'black',
                                                    lineHeight: '15px',
                                                    padding: '5px',
                                                    borderRadius: '100px',
                                                }}>
                                                    <div style={{
                                                        marginLeft: '5px',
                                                        marginRight: '5px',
                                                        height: '15px',
                                                        overflow: 'hidden'
                                                    }} onClick={async () => {
                                                        if (card.category.length > 1) {
                                                            const name = prompt("Введите путь категории(ничего не вводить для удаления из всех)");
                                                            dataRequestDatabase.method = 'delete'
                                                            dataRequestDatabase.data = name
                                                            dataRequestDatabase.idList = [card.id]
                                                            await sendRequestDatabase()
                                                        } else {
                                                            const result = confirm("Точно хотите удалить?");
                                                            console.log(name)
                                                            if (result === true) {
                                                                dataRequestDatabase.method = 'delete'
                                                                dataRequestDatabase.data = card.category[0]
                                                                dataRequestDatabase.idList = [card.id]
                                                                await sendRequestDatabase()
                                                            }
                                                        }

                                                    }}>
                                                        Удалить
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{height: String(height) + 'px', overflow: 'hidden'}}>
                                        {card.category.map(categoryCard => {
                                            let index = card.category.indexOf(categoryCard)
                                            return (<div style={{height: '25px'}}>
                                                <div style={{
                                                    display: 'flex',
                                                    flexDirection: 'row',
                                                    height: '25px',
                                                    marginTop: '5px',
                                                    width: 'max-content'
                                                }}>
                                                    <div className={'text-element'} style={{
                                                        marginLeft: '0px',
                                                        background: '#131313',
                                                        lineHeight: '15px',
                                                        padding: '5px',
                                                        borderRadius: '100px',
                                                    }}>
                                                        <div style={{
                                                            marginLeft: '5px',
                                                            marginRight: '5px',
                                                            height: '15px',
                                                            overflow: 'hidden'
                                                        }}>
                                                            {index + 1 + ' - Каталог: ' + categoryCard}
                                                        </div>
                                                    </div>
                                                    <div className={'text-element'} style={{
                                                        marginLeft: '0px',
                                                        background: '#131313',
                                                        lineHeight: '15px',
                                                        borderRadius: '100px',
                                                    }}>
                                                        <div style={{
                                                            marginLeft: '5px',
                                                            height: '25px',
                                                            overflow: 'hidden',
                                                            display: 'flex',
                                                        }}>
                                                            <div
                                                                style={{marginRight: '3px', marginTop: '5px',}}>
                                                                Цена:
                                                            </div>
                                                            <input defaultValue={newPriceArr[index]}
                                                                   onChange={(event) => {
                                                                       newPriceArr[index] = parseInt(event.target.value)
                                                                   }} style={{
                                                                borderRadius: '100px',
                                                                border: '0px',
                                                                paddingLeft: '5px'
                                                            }}/>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>)
                                        })}
                                        {oldPriceEditElement}
                                        <div style={{
                                            marginLeft: '5px',
                                            marginTop: '5px',
                                            background: 'white',
                                            color: 'black',
                                            lineHeight: '15px',
                                            padding: '5px',
                                            borderRadius: '100px',
                                            width: 'max-content',
                                        }}>
                                            <div className={'text-element'} style={{
                                                marginLeft: '5px',
                                                marginRight: '5px',
                                                height: '15px',
                                                width: 'max-content',
                                                color: 'black'
                                            }} onClick={async () => {
                                                let json = {
                                                    id: card.id,
                                                    priceArray: newPriceArr
                                                }
                                                if(oldPriceValue !== null && oldPriceValue !== ''){
                                                    json.oldPrice = oldPriceValue
                                                }
                                                await sendRequestOnDatabase(json, 'editPriceCard')
                                                setSelectedId(-1)
                                            }}>
                                                Сохранить
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                        })
                    }
                </div>
                <div style={{
                    justifyContent: 'center',
                    alignItems: 'center',
                    display: 'flex',
                    flexDirection: 'row',
                    marginTop: '15px',
                    marginBottom: '15px',
                }}>
                    {nav2El}
                    {nav1El}
                    <div className={'text-element'} style={{
                        height: '20px',
                        width: '20px',
                        textAlign: 'center',
                        lineHeight: '20px',
                        borderRadius: '5px',
                        border: '1px solid gray',
                        background: '#6194ea'
                    }}>{listNumber}</div>
                    {nav3El}
                    {nav4El}
                </div>
            </div>
        )
    } else {
        bodyElement = (<div>
            <div className={'text-element'} style={{textAlign: 'center', marginTop: '30px', fontSize: '18px'}}>Ничего не
                найдено
            </div>
            <button className={'all-see-button'} onClick={() => {
                setStatus(10);
                sendRequestOnDatabase({path: path, number: list}, 'getList')
            }}>Сбросить фильтры
            </button>
        </div>)
    }
    if (status === 10) {
        bodyElement = (<div className={'plup-loader'} style={{
            marginTop: String(window.innerHeight / 2 - 60) + 'px',
            marginLeft: String(window.innerWidth / 2 - 40) + 'px'
        }}></div>)
    }

    if (status === 1 || status === 10) {
        return (
            <div className={'list'} style={{display: 'flex', flexDirection: 'column'}}>
                {bodyElement}
            </div>
        );
    } else if (status === 0) {
        sendRequestOnDatabase({path: path, number: list}, 'getList')
        return (<div className={'plup-loader'} style={{
            border: '2px solid #8cdb8b',
            marginTop: String(window.innerHeight / 2 - 120) + 'px',
            marginLeft: String(window.innerWidth / 2 - 40) + 'px'
        }}></div>)
    }

};

export default AdminProductList;