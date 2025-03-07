import React, {Component, useCallback, useRef, useState} from 'react';
import * as XLSX from "xlsx";
import AdminProductList from "./AdminProductList";

const make_cols = refstr => {
    let o = [], C = XLSX.utils.decode_range(refstr).e.c + 1;
    for (var i = 0; i < C; ++i) o[i] = {name: XLSX.utils.encode_col(i), key: i}
    return o;
};
const SheetJSFT = [
    "xlsx", "xlsb", "xlsm", "xls", "xml", "csv", "txt", "ods", "fods", "uos", "sylk", "dif", "dbf", "prn", "qpw", "123", "wb*", "wq*", "html", "htm"
].map(function (x) {
    return "." + x;
}).join(",");

let userData = {}
const AdminPanel = () => {
    const [inputOne, setInputOne] = useState('');
    const [inputTwo, setInputTwo] = useState('');

    const [inputCategory1, setInputCategory1] = useState('')
    const [inputCategory2, setInputCategory2] = useState(0)
    const [inputCategory3, setInputCategory3] = useState('')
    const [inputCategory4, setInputCategory4] = useState('')

    const [pageSelected, setPageSelected] = useState(0);

    const [dataStructure, setDataStructure] = useState([]);
    const [dataCards, setDataCards] = useState([]);
    const [dataCategory, setDataCategory] = useState([]);
    const [dataPromo, setDataPromo] = useState([]);
    const [dataOrderHistory, setDataOrderHistory] = useState([]);

    const [page, setPage] = useState(0);
    const [selectedId, setSelectedId] = useState(-1);

    const searchInput = useRef();

    const [status, setStatus] = useState(0)


    const dataRequestAdmin = {
        method: 'login',
        data: {},
        userData: {login: inputOne, password: inputTwo}
    }

    const sendRequestAdmin = useCallback(async () => {
        console.log(dataRequestAdmin, 'inputAdmin')
        let method = dataRequestAdmin.method
        await fetch('https://2ae04a56-b56e-4cc1-b14a-e7bf1761ebd5.selcdn.net/admin', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(dataRequestAdmin)
        }).then(async r => {
            console.log(r, 'выход setAdmin')
            if (method === 'login') {
                if (r.status === 200) {
                    userData = dataRequestAdmin.userData
                    await onReload()
                    setStatus(1)
                } else {
                    alert('Неверный логин или пароль')
                }
            } else if (method === 'sendMessage') {
                if (r.status === 201) {
                    alert('Сообщение отправлено!')
                } else {
                    alert('Возникла ошибка при отправке сообщения!')
                }
            } else if(method === 'set'){
                setDataStructure(dataRequestAdmin.data.body)
            }
        })
    }, [dataRequestAdmin])


    const sendRequestOnAdmin = async (inputData, operation) => {
        dataRequestAdmin.method = operation
        dataRequestAdmin.data = inputData
        await sendRequestAdmin()
    }


    const setButtonTableClassic = async (table) => {

        let arrayRequest = []
        table.map(el => {
            let newCard = el
            newCard.tab = inputCategory2
            newCard.tabCategoryPath = inputCategory3
            newCard.type = inputCategory1
            arrayRequest = [...arrayRequest, ...[newCard]]
            let lang = false
            let voice = false

            if (typeof el.language !== 'undefined' && typeof el.voice !== 'undefined') {
                if (el.language.includes('Russian')) {
                    lang = true
                }
                if (el.voice.includes('Russian')) {
                    voice = true
                }
                if (lang && voice) {
                    newCard.languageSelector = 'На русском языке'
                } else if (lang) {
                    newCard.languageSelector = 'Русские субтитры (текст)'
                } else {
                    newCard.languageSelector = 'Без перевода'
                }
            }
        })


        let array = arrayRequest; //массив, можно использовать массив объектов
        let size = 20; //размер подмассива
        let subarray = []; //массив в который будет выведен результат.
        for (let i = 0; i < Math.ceil(array.length / size); i++) {
            subarray[i] = array.slice((i * size), (i * size) + size);
        }
        setStatus(10)
        for (let i = 0; i < subarray.length; i++) {
            await sendRequestOnDatabase(subarray[i], 'add')
        }
        setStatus(1)
    }


    let dataRequestDatabase = {
        method: '',
        userData: userData,
        data: []
    }

    const sendRequestDatabase = useCallback(async () => {
        console.log(dataRequestDatabase, 'inputRequestDb')
        let method = dataRequestDatabase.method
        await fetch('https://2ae04a56-b56e-4cc1-b14a-e7bf1761ebd5.selcdn.net/database', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(dataRequestDatabase)
        }).then(r => {
            let Promise = r.json()
            Promise.then(async prom => {
                console.log(prom, 'возвратил get')
                if (method === 'getDataAdmin') {
                    setDataStructure(prom.structure)
                    let DataCat = []
                    for (let i = 0; i < prom.allCategory.length; i++) {
                        DataCat.push({path: prom.allCategory[i], isSale: prom.isSaleArr[i]})
                    }
                    setDataCategory(DataCat)
                    setStatus(2)
                } else if (method === 'getSearch') {
                    setDataCards(prom.cards)
                } else if (method === 'changeStatus' || method === 'delete' || method === 'editPriceCard') {
                    try {
                        dataRequestDatabase.method = 'getSearch'
                        dataRequestDatabase.data = {str: searchInput.current.value, page: page}
                        await sendRequestDatabase()
                    } catch (e) {
                        await onReload()
                    }
                    setStatus(2)
                } else if (method === 'getOrderHistory') {
                    setDataOrderHistory(prom.allOrders)
                }
            })
        })
    }, [dataRequestDatabase])

    const sendRequestOnDatabase = (inputData, operation) => {
        dataRequestDatabase.method = operation
        dataRequestDatabase.data = inputData
        sendRequestDatabase()
    }

    let dataRequestPromo = {
        method: '',
        userData: userData,
        data: []
    }

    const sendRequestPromo = useCallback(async () => {
        console.log(dataRequestPromo, 'inputRequestDb')
        await fetch('https://2ae04a56-b56e-4cc1-b14a-e7bf1761ebd5.selcdn.net/promo', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(dataRequestPromo)
        }).then(r => {
            let Promise = r.json()
            Promise.then(prom => {
                console.log(prom, 'возвратил get')
                if (dataRequestPromo.method === 'get') {
                    setDataPromo(prom.promo)
                }
                if (dataRequestPromo.method === 'add') {
                    setStatus(1)
                }
                if (dataRequestPromo.method === 'del') {
                    setStatus(1)
                }
            })
        })
    }, [dataRequestPromo])

    const sendRequestOnPromo = (inputData, operation) => {
        dataRequestPromo.method = operation
        dataRequestPromo.data = inputData
        sendRequestPromo()
    }

    const addCategory = (type, tab) => {
        let structure = dataStructure;
        console.log(structure, dataStructure, 'вход addStructure')
        let id = 0
        structure[tab].body[type].map(el => {
            if (el.id > id) {
                id = el.id
            }
        })

        let color
        if (inputCategory4 !== '') {
            color = inputCategory4
        } else {
            color = 'none'
        }

        if (type === 0) {
            structure[tab].body[type].splice(parseInt(inputCategory1), 0, {
                id: id + 1,
                url: inputCategory2,
                path: inputCategory3,
                body: []
            });
        }
        if (type === 1) {
            structure[tab].body[type].splice(parseInt(inputCategory1), 0, {
                id: id + 1,
                name: inputCategory2,
                path: inputCategory3,
                backgroundColor: color,
                body: []
            });
        }

        console.log(structure, dataStructure, 'выход addStructure')
        sendRequestOnAdmin({body: structure}, 'set')
    }

    const deleteCategory = (type, tab, categoryId) => {

        let structure = dataStructure;

        let newArray = []

        structure[tab].body[type].map(el => {
            if (el.id !== categoryId) {
                newArray = [...newArray, ...[el]]
            }
        })

        structure[tab].body[type] = newArray

        sendRequestOnAdmin({body: structure}, 'set')

    }


    const onReload = async () => {
        await sendRequestOnDatabase([], 'getDataAdmin');
        await sendRequestOnDatabase([], 'getOrderHistory');
    }

    const addPromo = () => {
        sendRequestOnPromo({str: inputCategory1, count: inputCategory2, parcent: inputCategory3}, 'add')
    }

    const setButtonTablePromo = async (table) => {
        table.map(async promoData => {
            await sendRequestOnPromo({str: promoData.text, count: promoData.count, parcent: promoData.parcent}, 'add')
        })
    }


    if (status === 2) {
        if (pageSelected === 0) {
            return <div>
                <div>
                    <button onClick={() => {
                        setPageSelected(0)
                    }} style={{
                        margin: '5px',
                        borderRadius: '100px',
                        padding: '5px',
                        border: '0px',
                        background: '#ef7474'
                    }}>Загрузить новые
                        данные
                    </button>
                    <button onClick={() => {
                        setPageSelected(1)
                    }} style={{margin: '5px', borderRadius: '100px', padding: '5px', border: '0px',}}>Редактировать
                        данные
                    </button>
                    <button onClick={() => {
                        setPageSelected(3)
                    }} style={{margin: '5px', borderRadius: '100px', padding: '5px', border: '0px',}}>Редактировать
                        структуру
                    </button>
                    <button onClick={() => {
                        setPageSelected(4)
                    }} style={{margin: '5px', borderRadius: '100px', padding: '5px', border: '0px',}}>Промокоды
                    </button>
                    <button onClick={() => {
                        setPageSelected(5)
                    }} style={{margin: '5px', borderRadius: '100px', padding: '5px', border: '0px',}}>История заказов
                    </button>
                    <button onClick={async () => {
                        await onReload()
                    }} style={{margin: '5px', borderRadius: '100px', padding: '5px', border: '0px',}}>Обновить
                    </button>
                </div>
                <div style={{
                    display: 'grid',
                    padding: '10px',
                    marginTop: '10px',
                    margin: '10px',
                    borderRadius: '10px',
                    background: '#232323'
                }}>
                    <div className={'text-element'} style={{
                        fontSize: '15px',
                        margin: '5px'
                    }}>Загрузить карты на сервер
                    </div>
                    <div className={'text-element'} style={{margin: '5px'}}>Выберете страницу</div>
                    <div className={'text-element'}
                         style={{display: 'flex', flexDirection: 'column'}}>
                        {dataStructure.map(tab => {
                            if (tab.id === inputCategory2) {
                                return (<button onClick={() => {
                                    setInputCategory2(tab.id)
                                }} style={{
                                    margin: '5px',
                                    borderRadius: '100px',
                                    padding: '5px',
                                    border: '0px',
                                    background: '#ef7474'
                                }}>{tab.page}
                                </button>)
                            } else {
                                return (<button onClick={() => {
                                    setInputCategory2(tab.id)
                                }} style={{
                                    margin: '5px',
                                    borderRadius: '100px',
                                    padding: '5px',
                                    border: '0px',
                                }}>{tab.page}
                                </button>)
                            }
                        })}
                    </div>
                    <div className={'text-element'}
                         style={{display: 'flex', flexDirection: 'column', marginTop: '15px'}}>
                        Введите уникальный путь до категории:
                        <input onChange={(event) => {
                            setInputCategory3(event.target.value)
                        }} style={{margin: '5px', borderRadius: '100px', padding: '5px', border: '0px',}}/>
                    </div>

                    <div style={{marginTop: '15px'}} className={'text-element'}>Таблица с данными категории</div>
                    <div style={{marginLeft: '5px'}}>
                        <ExcelReader setButtonTable={setButtonTableClassic}/>
                    </div>
                </div>
            </div>
        }
        if (pageSelected === 1 || pageSelected === 2) {

            if (pageSelected === 1) {
                return (<div>
                    <div>
                        <button onClick={() => {
                            setPageSelected(0)
                        }} style={{margin: '5px', borderRadius: '100px', padding: '5px', border: '0px',}}>Загрузить
                            новые данные
                        </button>
                        <button onClick={() => {
                            setPageSelected(1)
                        }} style={{
                            margin: '5px',
                            borderRadius: '100px',
                            padding: '5px',
                            border: '0px',
                            background: '#ef7474'
                        }}>Редактировать данные
                        </button>
                        <button onClick={() => {
                            setPageSelected(3)
                        }} style={{margin: '5px', borderRadius: '100px', padding: '5px', border: '0px',}}>Редактировать
                            структуру
                        </button>
                        <button onClick={() => {
                            setPageSelected(4)
                        }} style={{margin: '5px', borderRadius: '100px', padding: '5px', border: '0px',}}>Промокоды
                        </button>
                        <button onClick={() => {
                            setPageSelected(5)
                        }} style={{margin: '5px', borderRadius: '100px', padding: '5px', border: '0px',}}>История
                            заказов
                        </button>
                        <button onClick={async () => {
                            await onReload()
                        }} style={{margin: '5px', borderRadius: '100px', padding: '5px', border: '0px',}}>Обновить
                        </button>
                    </div>
                    <div>
                        <button onClick={() => {
                            setPageSelected(1)
                        }} style={{
                            margin: '5px',
                            borderRadius: '100px',
                            padding: '5px',
                            border: '0px',
                            background: '#ef7474'
                        }}>Редактировать каталоги
                        </button>
                        <button onClick={() => {
                            setPageSelected(2)
                        }} style={{margin: '5px', borderRadius: '100px', padding: '5px', border: '0px',}}>Редактировать
                            карты
                        </button>
                    </div>
                    <div>
                        {dataCategory.map(category => {
                            let text
                            let styleButton
                            if (category.isSale) {
                                text = 'Убрать с продажи'
                                styleButton = {
                                    margin: '5px',
                                    borderRadius: '100px',
                                    padding: '5px',
                                    border: '0px',
                                }
                            } else {
                                text = 'Включить в продажу'
                                styleButton = {
                                    margin: '5px',
                                    borderRadius: '100px',
                                    padding: '5px',
                                    border: '0px',
                                    background: '#ef7474',
                                    color: 'white'
                                }
                            }
                            return (
                                <div>
                                    <div style={{
                                        display: 'grid',
                                        gridTemplateColumns: '2fr 3fr 3fr',
                                        borderBottom: '1px solid gray',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <div className={'title'}>{category.path}</div>
                                        <button onClick={async () => {
                                            await setStatus(10);
                                            dataRequestDatabase.method = 'changeStatus'
                                            dataRequestDatabase.data = category.path
                                            dataRequestDatabase.idList = 'all'
                                            await sendRequestDatabase()
                                        }} style={styleButton}>{text}
                                        </button>
                                        <button onClick={async () => {
                                            await setStatus(10);
                                            dataRequestDatabase.method = 'delete'
                                            dataRequestDatabase.data = category.path
                                            dataRequestDatabase.idList = 'all'
                                            await sendRequestDatabase()
                                        }} style={{
                                            margin: '5px',
                                            borderRadius: '100px',
                                            padding: '5px',
                                            border: '0px',
                                        }}>Удалить
                                        </button>
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                </div>)
            }

            if (pageSelected === 2) {
                return (<div>
                    <div>
                        <button onClick={() => {
                            setPageSelected(0)
                        }} style={{margin: '5px', borderRadius: '100px', padding: '5px', border: '0px',}}>Загрузить
                            новые данные
                        </button>
                        <button onClick={() => {
                            setPageSelected(1)
                        }} style={{
                            margin: '5px',
                            borderRadius: '100px',
                            padding: '5px',
                            border: '0px',
                            background: '#ef7474'
                        }}>Редактировать
                            данные
                        </button>
                        <button onClick={() => {
                            setPageSelected(3)
                        }} style={{margin: '5px', borderRadius: '100px', padding: '5px', border: '0px',}}>Редактировать
                            структуру
                        </button>
                        <button onClick={() => {
                            setPageSelected(4)
                        }} style={{margin: '5px', borderRadius: '100px', padding: '5px', border: '0px',}}>Промокоды
                        </button>
                        <button onClick={() => {
                            setPageSelected(5)
                        }} style={{margin: '5px', borderRadius: '100px', padding: '5px', border: '0px',}}>История
                            заказов
                        </button>
                        <button onClick={async () => {
                            await onReload()
                        }} style={{margin: '5px', borderRadius: '100px', padding: '5px', border: '0px',}}>Обновить
                        </button>
                    </div>
                    <div>
                        <button onClick={() => {
                            setPageSelected(1)
                        }} style={{margin: '5px', borderRadius: '100px', padding: '5px', border: '0px',}}>Редактировать
                            каталоги
                        </button>
                        <button onClick={() => {
                            setPageSelected(2)
                        }} style={{
                            margin: '5px',
                            borderRadius: '100px',
                            padding: '5px',
                            border: '0px',
                            background: '#ef7474'
                        }}>Редактировать карты
                        </button>
                    </div>
                    <div>

                        <div style={{display: 'flex', flexDirection: 'row', padding: '10px'}}>
                            {dataStructure.map(tab => {
                                if (tab.id === page) {
                                    return (<button onClick={() => {
                                        setPage(tab.id)
                                    }} style={{
                                        margin: '5px',
                                        borderRadius: '100px',
                                        padding: '5px',
                                        border: '0px',
                                        background: '#ef7474'
                                    }}>{tab.page}
                                    </button>)
                                } else {
                                    return (<button onClick={() => {
                                        setPage(tab.id)
                                    }} style={{
                                        margin: '5px',
                                        borderRadius: '100px',
                                        padding: '5px',
                                        border: '0px',
                                    }}>{tab.page}
                                    </button>)
                                }
                            })}
                            <input placeholder={'Поиск карты по имени'} ref={searchInput} onChange={(event) => {
                                setInputCategory1(event.target.value)
                            }} style={{
                                margin: '5px',
                                borderRadius: '100px',
                                padding: '5px',
                                border: '0px',
                                width: '300px'
                            }}/>
                            <button onClick={async () => {
                                dataRequestDatabase.method = 'getSearch'
                                dataRequestDatabase.data = {str: searchInput.current.value, page: page}
                                await sendRequestDatabase()
                            }} style={{
                                margin: '5px',
                                borderRadius: '100px',
                                padding: '5px',
                                border: '0px',
                            }}>Поиск
                            </button>
                        </div>
                        <div style={{display: 'flex', flexDirection: 'column', padding: '10px'}}>
                            {
                                dataCards.map(card => {
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
                                        height = card.category.length * 30 + 30
                                        textButton = 'Скрыть поле поле'
                                        buttonBackground = '#ef7474'
                                        buttonColor = 'white'
                                        if (typeof card.body.endDate !== 'undefined') {
                                            height += 30
                                        }
                                    }
                                    let newPriceArr = card.price

                                    let oldPriceEditElement = (<></>)
                                    let oldPriceValue = null

                                    if (typeof card.body.endDate !== 'undefined') {
                                        oldPriceValue = card.body.oldPrice
                                        oldPriceEditElement = (<div style={{height: '25px'}}>
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
                                    }

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
                                                        if(oldPriceValue !== null){
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
                    </div>
                </div>)
            }
        }
        if (pageSelected === 3) {
            return (<div>
                <div>
                    <button onClick={() => {
                        setPageSelected(0)
                    }} style={{margin: '5px', borderRadius: '100px', padding: '5px', border: '0px',}}>Загрузить новые
                        данные
                    </button>
                    <button onClick={() => {
                        setPageSelected(1)
                    }} style={{margin: '5px', borderRadius: '100px', padding: '5px', border: '0px',}}>Редактировать
                        данные
                    </button>
                    <button onClick={() => {
                        setPageSelected(3)
                    }} style={{
                        margin: '5px',
                        borderRadius: '100px',
                        padding: '5px',
                        border: '0px',
                        background: '#ef7474'
                    }}>Редактировать
                        структуру
                    </button>
                    <button onClick={() => {
                        setPageSelected(4)
                    }} style={{margin: '5px', borderRadius: '100px', padding: '5px', border: '0px',}}>Промокоды
                    </button>
                    <button onClick={() => {
                        setPageSelected(5)
                    }} style={{margin: '5px', borderRadius: '100px', padding: '5px', border: '0px',}}>История заказов
                    </button>
                    <button onClick={async () => {
                        await onReload()
                    }} style={{margin: '5px', borderRadius: '100px', padding: '5px', border: '0px',}}>Обновить
                    </button>
                </div>
                <div>
                    {dataStructure.map(tab => {
                        if (tab.id === page) {
                            return (<button onClick={() => {
                                setPage(tab.id)
                            }} style={{
                                margin: '5px',
                                borderRadius: '100px',
                                padding: '5px',
                                border: '0px',
                                background: '#ef7474'
                            }}>{tab.page}
                            </button>)
                        } else {
                            return (<button onClick={() => {
                                setPage(tab.id)
                            }} style={{margin: '5px', borderRadius: '100px', padding: '5px', border: '0px',}}>{tab.page}
                            </button>)
                        }
                    })}
                </div>
                <div className={'title'}
                     style={{
                         color: 'white',
                         fontVariant: 'small-caps',
                         fontSize: '28px',
                         marginTop: '10px'
                     }}>{dataStructure[page].page}</div>
                <div>
                    <div style={{marginTop: '5px', margin: '10px'}}>
                        <div className={'title'}
                             style={{color: 'white', marginLeft: '10px'}}>Карусель
                        </div>
                        {dataStructure[dataStructure[page].id].body[0].map(category => (
                            <div style={{
                                borderRadius: '10px',
                                background: '#232323',
                                marginTop: '7px',
                                marginLeft: '5px',
                                marginRight: '5px',
                                padding: '5px'
                            }} key={category.id}>
                                <div className={'text-element'} style={{margin: '3px'}}>Путь: {category.path}</div>
                                <div className={'text-element'} style={{margin: '3px'}}>Url: {category.url}</div>
                                <button style={{margin: '5px', borderRadius: '100px', padding: '5px', border: '0px',}}
                                        onClick={() => {
                                            deleteCategory(0, dataStructure[page].id, category.id)
                                        }}>Удалить категорию
                                </button>
                            </div>
                        ))}
                        <div style={{
                            padding: "5px",
                            borderRadius: '10px',
                            marginTop: '5px',
                            background: '#232323',
                            marginLeft: '5px',
                            marginRight: '5px',
                            display: 'flex',
                            flexDirection: 'column'
                        }}>
                            <div className={'text-element'} style={{margin: "5px"}}>Добавить категорию слайдера</div>
                            <input placeholder={'Порядковый_номер'} onChange={(event) => {
                                setInputCategory1(event.target.value)
                            }} style={{margin: '5px', borderRadius: '100px', padding: '5px', border: '0px',}}/>
                            <input placeholder={'url_изображения'} onChange={(event) => {
                                setInputCategory2(event.target.value)
                            }} style={{margin: '5px', borderRadius: '100px', padding: '5px', border: '0px',}}/>
                            <input placeholder={'Путь_до_категории'} onChange={(event) => {
                                setInputCategory3(event.target.value)
                            }} style={{margin: '5px', borderRadius: '100px', padding: '5px', border: '0px',}}/>
                            <button onClick={async () => {
                                await addCategory(0, dataStructure[page].id);
                            }} style={{margin: '5px', borderRadius: '100px', padding: '5px', border: '0px',}}>Добавить
                                категорию
                            </button>
                        </div>
                    </div>
                    <div style={{marginTop: '5px', margin: '10px'}} key={dataStructure[page].id}>
                        <div className={'title'}
                             style={{color: 'white', marginLeft: '10px'}}>Тело
                        </div>
                        {dataStructure[dataStructure[page].id].body[1].map(category => (
                            <div style={{
                                borderRadius: '10px',
                                background: '#232323',
                                marginTop: '7px',
                                marginLeft: '5px',
                                marginRight: '5px',
                                padding: '5px'
                            }} key={category.id}>
                                <div className={'text-element'} style={{margin: '3px'}}>Путь: {category.path}</div>
                                <div className={'text-element'} style={{margin: '3px'}}>Имя: {category.name}</div>
                                <button style={{margin: '5px', borderRadius: '100px', padding: '5px', border: '0px',}}
                                        onClick={() => {
                                            deleteCategory(1, dataStructure[page].id, category.id)
                                        }}>Удалить категорию
                                </button>
                            </div>
                        ))}
                        <div style={{
                            padding: "5px",
                            borderRadius: '10px',
                            marginTop: '5px',
                            background: '#232323',
                            marginLeft: '5px',
                            marginRight: '5px',
                            display: 'flex',
                            flexDirection: 'column'
                        }}>
                            <div className={'text-element'} style={{margin: "5px"}}>Добавить категорию тела</div>
                            <input placeholder={'Порядковый_номер'} onChange={(event) => {
                                setInputCategory1(event.target.value)
                            }} style={{margin: '5px', borderRadius: '100px', padding: '5px', border: '0px',}}/>
                            <input placeholder={'Имя_категории'} onChange={(event) => {
                                setInputCategory2(event.target.value)
                            }} style={{margin: '5px', borderRadius: '100px', padding: '5px', border: '0px',}}/>
                            <input placeholder={'Путь_до_категории'} onChange={(event) => {
                                setInputCategory3(event.target.value)
                            }} style={{margin: '5px', borderRadius: '100px', padding: '5px', border: '0px',}}/>
                            <input placeholder={'Выделение_цветом'} onChange={(event) => {
                                setInputCategory4(event.target.value)
                            }} style={{margin: '5px', borderRadius: '100px', padding: '5px', border: '0px',}}/>
                            <button onClick={() => {
                                addCategory(1, dataStructure[page].id)
                            }} style={{margin: '5px', borderRadius: '100px', padding: '5px', border: '0px',}}>Добавить
                                категорию
                            </button>
                        </div>
                    </div>
                </div>

            </div>)
        }
        if (pageSelected === 4) {
            return (<div>
                <div style={{borderBottom: '2px', color: 'white'}}>
                    <button onClick={() => {
                        setPageSelected(0)
                    }} style={{margin: '5px', borderRadius: '100px', padding: '5px', border: '0px',}}>Загрузить новые
                        данные
                    </button>
                    <button onClick={() => {
                        setPageSelected(1)
                    }} style={{margin: '5px', borderRadius: '100px', padding: '5px', border: '0px',}}>Редактировать
                        данные
                    </button>
                    <button onClick={() => {
                        setPageSelected(3)
                    }} style={{margin: '5px', borderRadius: '100px', padding: '5px', border: '0px',}}>Редактировать
                        структуру
                    </button>
                    <button onClick={() => {
                        setPageSelected(4)
                    }} style={{
                        margin: '5px',
                        borderRadius: '100px',
                        padding: '5px',
                        border: '0px',
                        background: '#ef7474'
                    }}>Промокоды
                    </button>
                    <button onClick={() => {
                        setPageSelected(5)
                    }} style={{margin: '5px', borderRadius: '100px', padding: '5px', border: '0px',}}>История заказов
                    </button>
                    <button onClick={async () => {
                        await onReload()
                    }} style={{margin: '5px', borderRadius: '100px', padding: '5px', border: '0px',}}>Обновить
                    </button>
                </div>
                {dataPromo.map(promo => (
                    <div style={{
                        marginTop: '7px',
                        borderRadius: '10px',
                        background: '#232323',
                        marginLeft: '5px',
                        marginRight: '5px',
                        padding: '5px'
                    }} key={promo.id}>
                        <div className={'text-element'} style={{margin: "3px"}}> Кодовое слово: {promo.body} </div>
                        <div className={'text-element'} style={{margin: "3px"}}> Осталось
                            использований: {promo.number} </div>
                        <div className={'text-element'} style={{margin: "3px"}}> Процент скидки: {promo.parcent} </div>
                        <button onClick={() => {
                            sendRequestOnPromo({id: promo.id}, 'del')
                        }} style={{margin: '5px', borderRadius: '100px', padding: '5px', border: '0px',}}>Удалить
                            категорию
                        </button>
                    </div>
                ))}
                <div style={{
                    padding: '5px',
                    borderRadius: '10px',
                    marginTop: '5px',
                    background: '#232323',
                    marginLeft: '5px',
                    marginRight: '5px',
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    <div className={'text-element'} style={{margin: '3px'}}>Добавить промокод</div>
                    <input placeholder={'Кодовое слово'} onChange={(event) => {
                        setInputCategory1(event.target.value)
                    }} style={{margin: '5px', borderRadius: '100px', padding: '5px', border: '0px',}}/>
                    <input placeholder={'Количество использований'} onChange={(event) => {
                        setInputCategory2(event.target.value)
                    }} style={{margin: '5px', borderRadius: '100px', padding: '5px', border: '0px',}}/>
                    <input placeholder={'Процент скидки(от 0 до 100)'} onChange={(event) => {
                        setInputCategory3(event.target.value)
                    }} style={{margin: '5px', borderRadius: '100px', padding: '5px', border: '0px',}}/>
                    <button onClick={() => {
                        addPromo()
                    }} style={{margin: '5px', borderRadius: '100px', padding: '5px', border: '0px',}}>Добавить промокод
                    </button>
                </div>
                <div style={{
                    display: 'grid',
                    padding: '10px',
                    marginTop: '10px',
                    margin: '5px',
                    borderRadius: '10px',
                    background: '#232323'
                }}>
                    <div className={'text-element'} style={{
                        margin: '3px'
                    }}>Добавить промокоды таблицей
                    </div>
                    <div style={{marginTop: '15px'}} className={'text-element'}>Таблица с данными категории</div>
                    <ExcelReader setButtonTable={setButtonTablePromo}/>
                </div>
            </div>)
        }
        if (pageSelected === 5) {
            return (<div>
                <div style={{borderBottom: '2px', color: 'white'}}>
                    <button onClick={() => {
                        setPageSelected(0)
                    }} style={{margin: '5px', borderRadius: '100px', padding: '5px', border: '0px',}}>Загрузить новые
                        данные
                    </button>
                    <button onClick={() => {
                        setPageSelected(1)
                    }} style={{margin: '5px', borderRadius: '100px', padding: '5px', border: '0px',}}>Редактировать
                        данные
                    </button>
                    <button onClick={() => {
                        setPageSelected(3)
                    }} style={{margin: '5px', borderRadius: '100px', padding: '5px', border: '0px',}}>Редактировать
                        структуру
                    </button>
                    <button onClick={() => {
                        setPageSelected(4)
                    }} style={{margin: '5px', borderRadius: '100px', padding: '5px', border: '0px',}}>Промокоды
                    </button>
                    <button onClick={() => {
                        setPageSelected(5)
                    }} style={{
                        margin: '5px',
                        borderRadius: '100px',
                        padding: '5px',
                        border: '0px',
                        background: '#ef7474'
                    }}>История заказов
                    </button>
                    <button onClick={async () => {
                        await onReload()
                    }} style={{margin: '5px', borderRadius: '100px', padding: '5px', border: '0px',}}>Обновить
                    </button>
                </div>
                {dataOrderHistory.map(order => {
                    let height = 0
                    let textButton = 'Показать список товаров'
                    let buttonColor = 'black'
                    let buttonBackground = 'white'
                    if (selectedId === order.id) {
                        height = order.body.length * 30
                        textButton = 'Скрыть список товаров'
                        buttonBackground = '#ef7474'
                        buttonColor = 'white'
                    }

                    return (
                        <div style={{
                            marginTop: '7px',
                            borderRadius: '10px',
                            background: '#232323',
                            marginLeft: '5px',
                            marginRight: '5px',
                            padding: '5px'
                        }} key={order.id}>
                            <div className={'text-element'} style={{margin: "3px"}}> Номер
                                заказа: {order.id + '-' + order.createdAt.slice(5, 10).replace('-', '.')} </div>
                            <div className={'text-element'} style={{margin: "3px"}}> Сумма
                                заказа: {order.summa.toLocaleString() + ' ₽'} </div>
                            <button onClick={async () => {
                                await sendRequestOnAdmin({chatId: order.chatId}, 'sendMessage')
                            }} style={{margin: '5px', borderRadius: '100px', padding: '5px', border: '0px'}}>Отправить
                                сообщение
                            </button>
                            <button onClick={async () => {
                                if (order.id !== selectedId) {
                                    setSelectedId(order.id)
                                } else {
                                    setSelectedId(-1)
                                }
                            }} style={{
                                margin: '5px',
                                borderRadius: '100px',
                                padding: '5px',
                                border: '0px',
                                background: buttonBackground,
                                color: buttonColor
                            }}>{textButton}
                            </button>
                            <div style={{height: String(height) + 'px', overflow: 'hidden'}}>
                                {order.body.map(card => (
                                    <div style={{height: '30px'}} key={order.id}>
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
                                                        {'Id: ' + card.id}
                                                    </div>
                                                </div>

                                                <div style={{
                                                    background: '#131313',
                                                    lineHeight: '15px',
                                                    marginLeft: '5px',
                                                    padding: '5px',
                                                    borderRadius: '100px',
                                                }}>
                                                    <div style={{
                                                        marginLeft: '5px',
                                                        marginRight: '5px',
                                                        height: '15px',
                                                        maxWidth: '200px',
                                                        overflow: 'hidden'
                                                    }}>
                                                        {'Имя: ' + card.body.title}
                                                    </div>
                                                </div>
                                                <div style={{
                                                    background: '#131313',
                                                    lineHeight: '15px',
                                                    padding: '5px',
                                                    marginLeft: '5px',
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
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )
                })}
            </div>)
        }
    } else if (status === 1) {
        sendRequestOnDatabase([], 'getDataAdmin')
        sendRequestOnPromo([], 'get')
        sendRequestOnDatabase([], 'getOrderHistory')
        setStatus(10)
    } else if (status === 10) {
        return (
            <div className={'text-element'}>
                Ожидайте
            </div>)
    } else {
        return (
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                marginTop: String(window.innerHeight / 2 - 100) + 'px'
            }}>
                <div className={'text-element'} style={{margin: '5px', fontSize: '20px'}}>Регистрация</div>
                <div style={{display: 'flex'}}>
                    <input onChange={(event) => setInputOne(event.target.value)}
                           style={{
                               margin: '5px',
                               borderRadius: '100px',
                               padding: '5px',
                               border: '0px',
                               fontSize: '20px',
                               textAlign: 'center'
                           }}
                           placeholder={'Введите логин'}/>
                </div>
                <div style={{display: 'flex'}}>
                    <input onChange={(event) => setInputTwo(event.target.value)}
                           style={{
                               margin: '5px',
                               borderRadius: '100px',
                               padding: '5px',
                               border: '0px',
                               fontSize: '20px',
                               textAlign: 'center'
                           }} placeholder={'Введите пароль'}/>
                </div>
                <button onClick={sendRequestAdmin} style={{
                    margin: '5px',
                    borderRadius: '100px',
                    padding: '5px',
                    border: '0px',
                    width: '100px',
                    fontSize: '20px'
                }}>Войти
                </button>
            </div>
        );
    }
};
export default AdminPanel;


class ExcelReader extends Component {
    constructor(props) {
        super(props);
        this.state = {
            file: {},
            data: [],
            cols: []
        }
        this.handleFile = this.handleFile.bind(this);
        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(e) {
        const files = e.target.files;
        if (files && files[0]) this.setState({file: files[0]});
    };

    handleFile() {
        /* Boilerplate to set up FileReader */
        try {
            const reader = new FileReader();

            reader.onload = (e) => {
                /* Parse data */
                const bstr = e.target.result;
                const wb = XLSX.read(bstr, {type: 'array', bookVBA: true});
                /* Get first worksheet */
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];
                /* Convert array of arrays */
                const data = XLSX.utils.sheet_to_json(ws);
                /* Update state */
                this.setState({data: data, cols: make_cols(ws['!ref'])}, () => {
                    this.props.setButtonTable(this.state.data)
                });

            };
            reader.readAsArrayBuffer(this.state.file);
        } catch (e) {
            console.log(e)
        }
    }

    render() {
        return (
            <div style={{display: 'grid'}}>
                <input type="file" id="file" className={'text-element'}
                       style={{margin: '5px', borderRadius: '100px', padding: '5px', border: '0px',}} accept={SheetJSFT}
                       onChange={this.handleChange}/>
                <button style={{margin: '5px', borderRadius: '100px', padding: '5px', border: '0px',}}
                        onClick={this.handleFile}>Загрузить
                </button>
            </div>

        )
    }
}

