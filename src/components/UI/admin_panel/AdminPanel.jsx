import React, {Component, useCallback, useRef, useState} from 'react';
import * as XLSX from "xlsx";
import AP_NavigationPanel from "./AP_NavigationPanel";
import AP_UploadData from "./AP_tabs/AP_UploadData";
import AP_EditDirectories from "./AP_tabs/AP_Catalogs/AP_Catalogs";
import AP_EditCards from "./AP_tabs/AP_EditCards";
import AP_EditPages from "./AP_tabs/AP_EditPages/AP_EditPages";

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
let lenArray = 0
const AdminPanel = () => {
    const [inputOne, setInputOne] = useState('');
    const [inputTwo, setInputTwo] = useState('');

    const [inputCategory1, setInputCategory1] = useState('')
    const [inputCategory2, setInputCategory2] = useState(0)
    const [inputCategory3, setInputCategory3] = useState('')
    const [inputCategory4, setInputCategory4] = useState('')
    const [inputCategory5, setInputCategory5] = useState(['00', '00', '0000', '12', '00', '00'])

    const [dataStructure, setDataStructure] = useState([]);
    const [dataCards, setDataCards] = useState([]);
    const [dataCategory, setDataCategory] = useState([]);
    const [dataPromo, setDataPromo] = useState([]);
    const [dataOrderHistory, setDataOrderHistory] = useState([]);
    const [dataFreeGame, setDataFreeGame] = useState([]);

    const [page, setPage] = useState(0);
    const [selectedId, setSelectedId] = useState(-1);
    const [selectedPath, setSelectedPath] = useState(-1);
    const [selectedViewCatalog, setSelectedViewCatalog] = useState(0);
    const [selectedViewCatalog1, setSelectedViewCatalog1] = useState(0);

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
            } else if (method === 'set') {
                setDataStructure(dataRequestAdmin.data.body)
            }
        })
    }, [dataRequestAdmin])


    const sendRequestOnAdmin = async (inputData, operation) => {
        dataRequestAdmin.method = operation
        dataRequestAdmin.data = inputData
        await sendRequestAdmin()
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
                } else if (method === 'add') {
                    if (prom.answer) {
                        lenArray = lenArray - 1
                        console.log(lenArray)
                    }
                    if (lenArray === 0) {
                        await onReload()
                        setStatus(2)
                    }
                }
            })
        })
    }, [dataRequestDatabase])

    const sendRequestOnDatabase = async (inputData, operation) => {
        dataRequestDatabase.method = operation
        dataRequestDatabase.data = inputData
        await sendRequestDatabase()
    }

    let dataRequestFreeGame = {
        method: '',
        userData: userData,
        data: []
    }

    const sendRequestFreeGame = useCallback(async () => {
        let method = dataRequestDatabase.method
        await fetch('https://2ae04a56-b56e-4cc1-b14a-e7bf1761ebd5.selcdn.net/freegame', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                method: '',
                userData: userData,
                data: []
            })
        }).then(r => {
            let Promise = r.json()
            Promise.then(async prom => {
                console.log(prom, 'возвратил get')
                if (method === 'set') {
                    await sendRequestOnFreeGame({}, 'get')
                }
                if (method === 'get') {
                    setDataFreeGame(prom.body)
                }
            })
        })
    }, [dataRequestFreeGame])

    const sendRequestOnFreeGame = async (inputData, operation) => {
        dataRequestFreeGame.method = operation
        dataRequestFreeGame.data = inputData
        await sendRequestFreeGame()
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

    const sendRequestOnPromo = async (inputData, operation) => {
        dataRequestPromo.method = operation
        dataRequestPromo.data = inputData
        await sendRequestPromo()
    }

    const addCategory = (type, tab) => {
        let structure = dataStructure;
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

        let deleteData
        if (inputCategory5[2] !== '0000') {
            deleteData = Date.parse(inputCategory5[0] + ' ' + inputCategory5[1] + ' ' + inputCategory5[2] + ' ' + inputCategory5[3] + ':' + inputCategory5[4] + ':' + inputCategory5[5])
        } else {
            deleteData = 'none'
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
            if (selectedViewCatalog === 12) {
                structure[tab].body[type].splice(parseInt(inputCategory1), 0, {
                    id: id + 1,
                    type: 1,
                    url: inputCategory2,
                    path: inputCategory3,
                    backgroundColor: color,
                });
            } else {
                structure[tab].body[type].splice(parseInt(inputCategory1), 0, {
                    id: id + 1,
                    name: inputCategory2,
                    path: inputCategory3,
                    type: 0,
                    backgroundColor: color,
                    deleteData: deleteData,
                    body: []
                });
            }

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

    const addPromo = async () => {
        await sendRequestOnPromo({str: inputCategory1, count: inputCategory2, parcent: inputCategory3}, 'add')
    }

    const setButtonTablePromo = async (table) => {
        table.map(async promoData => {
            await sendRequestOnPromo({str: promoData.text, count: promoData.count, parcent: promoData.parcent}, 'add')
        })
    }

    const setButtonTableFreeGame = async (table) => {
        await sendRequestOnFreeGame({data:table}, 'set')
    }

    let screenElement = ([(<AP_UploadData/>), (<AP_EditDirectories/>), (<AP_EditCards/>), (<AP_EditPages/>)])[page]
    return (
        <div>
            <AP_NavigationPanel setPage={setPage}/>
            {screenElement}
        </div>
    )
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


//         if (pageSelected === 2) {
//             return (<div>
//                 <AP_NavigationPanel page={pageSelected} setPage={setPageSelected}/>
//
//             </div>)
//         }
//     }
//     if (pageSelected === 3) {
//
//     }
//     if (pageSelected === 4) {
//         return (<div>
//             <AP_NavigationPanel page={pageSelected} setPage={setPageSelected}/>
//             {dataPromo.map(promo => (
//                 <div style={{
//                     marginTop: '7px',
//                     borderRadius: '10px',
//                     background: '#232323',
//                     marginLeft: '5px',
//                     marginRight: '5px',
//                     padding: '5px'
//                 }} key={promo.id}>
//                     <div className={'text-element'} style={{margin: "3px"}}> Кодовое слово: {promo.body} </div>
//                     <div className={'text-element'} style={{margin: "3px"}}> Осталось
//                         использований: {promo.number} </div>
//                     <div className={'text-element'} style={{margin: "3px"}}> Процент скидки: {promo.parcent} </div>
//                     <button onClick={() => {
//                         sendRequestOnPromo({id: promo.id}, 'del')
//                     }} style={{margin: '5px', borderRadius: '100px', padding: '5px', border: '0px',}}>Удалить
//                         категорию
//                     </button>
//                 </div>
//             ))}
//             <div style={{
//                 padding: '5px',
//                 borderRadius: '10px',
//                 marginTop: '5px',
//                 background: '#232323',
//                 marginLeft: '5px',
//                 marginRight: '5px',
//                 display: 'flex',
//                 flexDirection: 'column'
//             }}>
//                 <div className={'text-element'} style={{margin: '3px'}}>Добавить промокод</div>
//                 <input placeholder={'Кодовое слово'} onChange={(event) => {
//                     setInputCategory1(event.target.value)
//                 }} style={{margin: '5px', borderRadius: '100px', padding: '5px', border: '0px',}}/>
//                 <input placeholder={'Количество использований'} onChange={(event) => {
//                     setInputCategory2(event.target.value)
//                 }} style={{margin: '5px', borderRadius: '100px', padding: '5px', border: '0px',}}/>
//                 <input placeholder={'Процент скидки(от 0 до 100)'} onChange={(event) => {
//                     setInputCategory3(event.target.value)
//                 }} style={{margin: '5px', borderRadius: '100px', padding: '5px', border: '0px',}}/>
//                 <button onClick={() => {
//                     addPromo()
//                 }} style={{margin: '5px', borderRadius: '100px', padding: '5px', border: '0px',}}>Добавить промокод
//                 </button>
//             </div>
//             <div style={{
//                 display: 'grid',
//                 padding: '10px',
//                 marginTop: '10px',
//                 margin: '5px',
//                 borderRadius: '10px',
//                 background: '#232323'
//             }}>
//                 <div className={'text-element'} style={{
//                     margin: '3px'
//                 }}>Добавить промокоды таблицей
//                 </div>
//                 <div style={{marginTop: '15px'}} className={'text-element'}>Таблица с данными категории</div>
//                 <ExcelReader setButtonTable={setButtonTablePromo}/>
//             </div>
//         </div>)
//     }
//     if (pageSelected === 5) {
//         return (<div>
//             <AP_NavigationPanel page={pageSelected} setPage={setPageSelected}/>
//             {dataOrderHistory.map(order => {
//                 let height = 0
//                 let textButton = 'Показать список товаров'
//                 let buttonColor = 'black'
//                 let buttonBackground = 'white'
//                 if (selectedId === order.id) {
//                     height = order.body.length * 30
//                     textButton = 'Скрыть список товаров'
//                     buttonBackground = '#ef7474'
//                     buttonColor = 'white'
//                 }
//
//                 return (
//                     <div style={{
//                         marginTop: '7px',
//                         borderRadius: '10px',
//                         background: '#232323',
//                         marginLeft: '5px',
//                         marginRight: '5px',
//                         padding: '5px'
//                     }} key={order.id}>
//                         <div className={'text-element'} style={{margin: "3px"}}> Номер
//                             заказа: {order.id + '-' + order.createdAt.slice(5, 10).replace('-', '.')} </div>
//                         <div className={'text-element'} style={{margin: "3px"}}> Сумма
//                             заказа: {order.summa.toLocaleString() + ' ₽'} </div>
//                         <button onClick={async () => {
//                             await sendRequestOnAdmin({chatId: order.chatId}, 'sendMessage')
//                         }} style={{margin: '5px', borderRadius: '100px', padding: '5px', border: '0px'}}>Отправить
//                             сообщение
//                         </button>
//                         <button onClick={async () => {
//                             if (order.id !== selectedId) {
//                                 setSelectedId(order.id)
//                             } else {
//                                 setSelectedId(-1)
//                             }
//                         }} style={{
//                             margin: '5px',
//                             borderRadius: '100px',
//                             padding: '5px',
//                             border: '0px',
//                             background: buttonBackground,
//                             color: buttonColor
//                         }}>{textButton}
//                         </button>
//                         <div style={{height: String(height) + 'px', overflow: 'hidden'}}>
//                             {order.body.map(card => (
//                                 <div style={{height: '30px'}} key={order.id}>
//                                     <div style={{display: 'flex', flexDirection: 'column'}}
//                                          className={'text-element text-basket'}>
//                                         <div style={{
//                                             display: 'flex',
//                                             flexDirection: 'row',
//                                             height: '25px',
//                                         }}>
//                                             <div style={{
//                                                 background: '#131313',
//                                                 lineHeight: '15px',
//                                                 padding: '5px',
//                                                 borderRadius: '100px',
//                                             }}>
//                                                 <div style={{
//                                                     marginLeft: '5px',
//                                                     marginRight: '5px',
//                                                     height: '15px',
//                                                     overflow: 'hidden'
//                                                 }}>
//                                                     {'Id: ' + card.id}
//                                                 </div>
//                                             </div>
//
//                                             <div style={{
//                                                 background: '#131313',
//                                                 lineHeight: '15px',
//                                                 marginLeft: '5px',
//                                                 padding: '5px',
//                                                 borderRadius: '100px',
//                                             }}>
//                                                 <div style={{
//                                                     marginLeft: '5px',
//                                                     marginRight: '5px',
//                                                     height: '15px',
//                                                     maxWidth: '200px',
//                                                     overflow: 'hidden'
//                                                 }}>
//                                                     {'Имя: ' + card.body.title}
//                                                 </div>
//                                             </div>
//                                             <div style={{
//                                                 background: '#131313',
//                                                 lineHeight: '15px',
//                                                 padding: '5px',
//                                                 marginLeft: '5px',
//                                                 borderRadius: '100px',
//                                             }}>
//                                                 <div style={{
//                                                     marginLeft: '5px',
//                                                     marginRight: '5px',
//                                                     height: '15px',
//                                                     overflow: 'hidden'
//                                                 }}>
//                                                     {'Цена: ' + card.body.price}
//                                                 </div>
//                                             </div>
//
//                                             <div style={{
//                                                 marginLeft: '5px',
//                                                 background: '#131313',
//                                                 lineHeight: '15px',
//                                                 padding: '5px',
//                                                 borderRadius: '100px',
//                                             }}>
//                                                 <div style={{
//                                                     marginLeft: '5px',
//                                                     marginRight: '5px',
//                                                     height: '15px',
//                                                     overflow: 'hidden'
//                                                 }}>
//                                                     {'Платформа: ' + card.body.platform}
//                                                 </div>
//                                             </div>
//                                             <div style={{
//                                                 marginLeft: '5px',
//                                                 background: '#131313',
//                                                 lineHeight: '15px',
//                                                 padding: '5px',
//                                                 borderRadius: '100px',
//                                             }}>
//                                                 <div style={{
//                                                     marginLeft: '5px',
//                                                     marginRight: '5px',
//                                                     height: '15px',
//                                                     overflow: 'hidden'
//                                                 }}>
//                                                     {'Каталоги: ' + String(card.category)}
//                                                 </div>
//                                             </div>
//                                         </div>
//                                     </div>
//                                 </div>
//                             ))}
//                         </div>
//                     </div>
//                 )
//             })}
//         </div>)
//
//     }
//     if (pageSelected === 6) {
//         return (<div>
//             <AP_NavigationPanel page={pageSelected} setPage={setPageSelected}/>
//             <div>
//                 <div style={{marginLeft: '5px'}}>
//                     <ExcelReader setButtonTable={setButtonTableFreeGame}/>
//                 </div>
//             </div>
//         </div>)
//     }
// } else if (status === 1) {
//     sendRequestOnDatabase([], 'getDataAdmin')
//     sendRequestOnPromo([], 'get')
//     sendRequestOnDatabase([], 'getOrderHistory')
//     sendRequestOnFreeGame([], 'get')
//     setStatus(10)
// } else if (status === 10) {
//     return (
//         <div className={'text-element'}>
//             Ожидайте
//         </div>)
// } else {
//     return(<AP_Authentication/>)
// }
