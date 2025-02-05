import React, {Component, useCallback, useEffect, useRef, useState} from 'react';
import * as XLSX from "xlsx";
import {useTelegram} from "../../hooks/useTelegram";
import ProductList from "./ProductList";
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
    const [inputCategory2, setInputCategory2] = useState('')
    const [inputCategory3, setInputCategory3] = useState('')

    const [pageSelected, setPageSelected] = useState(0);

    const [dataStructure, setDataStructure] = useState(null);
    const [dataCards, setDataCards] = useState(null);
    const [dataPromo, setDataPromo] = useState([]);

    const [selectCatalog, setSelectCatalog] = useState('')
    console.log(dataPromo)

    const [status, setStatus] = useState(0)


    const dataRequestAdmin = {
        method: 'login',
        data: {},
        userData: {login: inputOne, password: inputTwo}
    }

    const sendRequestAdmin = useCallback(() => {
        console.log(dataRequestAdmin, 'input setAdmin')
        fetch('https://2ae04a56-b56e-4cc1-b14a-e7bf1761ebd5.selcdn.net/admin', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(dataRequestAdmin)
        }).then(r => {
            console.log(r, 'выход setAdmin')
            if (r.status === 200) {
                userData = dataRequestAdmin.userData
                onReload()
                setStatus(1)
            } else {
                alert('Неверный логин или пароль')
            }
        })
    }, [dataRequestAdmin])


    const sendRequestOnAdmin = (inputData, operation) => {
        dataRequestAdmin.method = operation
        dataRequestAdmin.data = inputData
        sendRequestAdmin()
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
        await setStatus(10);
        subarray.map(async el => {
            await sendRequestOnDatabase(el, 'add')
        })
        await onReload()
        await setStatus(1);
    }


    let dataRequestDatabase = {
        method: '',
        userData: userData,
        data: []
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
                if (dataRequestDatabase.method === 'getPreview') {
                    setDataStructure(prom.structure)
                    setDataCards(prom.cards)
                    setStatus(2)
                } else if (dataRequestDatabase.method === 'upd') {
                    onReload()
                    setStatus(1)
                } else if (dataRequestDatabase.method === 'del') {
                    onReload()
                    setStatus(1)
                } else if (dataRequestDatabase.method === 'delCategory') {
                    onReload()
                    setStatus(1)
                } else if (dataRequestDatabase.method === 'updCategory') {
                    onReload()
                    setStatus(1)
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

    const sendRequestPromo = useCallback(() => {
        console.log(dataRequestPromo, 'inputRequestDb')
        fetch('https://2ae04a56-b56e-4cc1-b14a-e7bf1761ebd5.selcdn.net/promo', {
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

    const deleteCategoryCards = (path) => {
        sendRequestOnDatabase(path, 'delCategory');
    }

    const updateCategoryCards = (path) => {
        sendRequestOnDatabase(path, 'updCategory');
    }

    const onReload = async () => {
        await sendRequestOnDatabase([], 'reload');
        await sendRequestOnDatabase([], 'getPreview');
    }

    const addPromo = () => {
        sendRequestOnPromo({str: inputCategory1, count: inputCategory2, parcent: inputCategory3}, 'add')
    }


    if (status === 2) {
        if (pageSelected === 0) {
            return <div>
                <div>
                    <button onClick={() => {
                        setPageSelected(0)
                    }}>Загрузить новые данные
                    </button>
                    <button onClick={() => {
                        setPageSelected(1)
                    }}>Редактировать карты
                    </button>
                    <button onClick={() => {
                        setPageSelected(2)
                    }}>Редактировать каталоги
                    </button>
                    <button onClick={() => {
                        setPageSelected(3)
                    }}>Редактировать промокоды
                    </button>
                </div>
                <div style={{
                    display: 'grid',
                    padding: '10px',
                    border: '2px gray solid',
                    marginTop: '10px',
                    margin: '10px',
                    borderRadius: '10px',
                    background: '#454545'
                }}>
                    <div className={'text-element'} style={{
                        fontSize: '15px',
                        textAlign: 'center',
                        width: String(window.innerWidth - 60) + 'px',
                        textJustify: 'center'
                    }}>Загрузить карты на сервер
                    </div>
                    <div className={'text-element'}>Выберете страницу</div>
                    <div className={'text-element'}
                         style={{display: 'flex', flexDirection: 'column', paddingLeft: '20px'}}>
                        <div>
                            1.
                            <button style={{
                                width: '150px',
                                height: '25px',
                                marginTop: '7px',
                                borderRadius: '4px',
                                border: '0px'
                            }} onClick={() => {
                                setInputCategory2(0)
                            }}>Playstation
                            </button>
                        </div>
                        <div>
                            2.
                            <button style={{
                                width: '150px',
                                height: '25px',
                                marginTop: '7px',
                                borderRadius: '4px',
                                border: '0px'
                            }} onClick={() => {
                                setInputCategory2(1)
                            }}>Xbox
                            </button>
                        </div>
                        <div>
                            3.
                            <button style={{
                                width: '150px',
                                height: '25px',
                                marginTop: '7px',
                                borderRadius: '4px',
                                border: '0px'
                            }} onClick={() => {
                                setInputCategory2(2)
                            }}>Сервисы
                            </button>
                        </div>
                        <div>{'Выбрано: ' + (inputCategory2 + 1)}</div>
                    </div>
                    <div className={'text-element'}
                         style={{display: 'flex', flexDirection: 'column', marginTop: '15px'}}>
                        Введите уникальный путь до категории:
                        <input style={{marginLeft: '20px'}} onChange={(event) => {
                            setInputCategory3(event.target.value)
                        }}/>
                    </div>

                    <div style={{marginTop: '15px'}} className={'text-element'}>Таблица с данными категории</div>
                    <div style={{marginLeft: '20px'}}>
                        <ExcelReader setButtonTable={setButtonTableClassic}/>
                    </div>
                </div>

                <button onClick={() => {
                    onReload()
                }}>Обновить
                </button>
            </div>
        }
        if (pageSelected === 1) {
            let allCategory = []
            dataCards.map(card => {

                let flag = false
                let count = 0
                let index = 0
                allCategory.map(cat => {
                    if (cat.path === card.body.tabCategoryPath) {
                        flag = true
                        index = count
                    }
                    count += 1;
                })
                if (flag === false) {
                    allCategory = [...allCategory, {path: card.body.tabCategoryPath, body: [card]}]
                } else {
                    allCategory[index].body = [...allCategory[index].body, card]
                }
            })

            const setDataCardsDop = () => {
            }

            console.log(allCategory)

            return (<div>
                <div>
                    <button onClick={() => {
                        setPageSelected(0)
                    }}>Загрузить новые данные
                    </button>
                    <button onClick={() => {
                        setPageSelected(1)
                    }}>Редактировать карты
                    </button>
                    <button onClick={() => {
                        setPageSelected(2)
                    }}>Редактировать каталоги
                    </button>
                    <button onClick={() => {
                        setPageSelected(3)
                    }}>Редактировать промокоды
                    </button>
                </div>
                <div>
                    {allCategory.map(category => {
                        let height
                        if(selectCatalog===category.path){
                            height = 1000
                        }else{
                            height = 0
                        }

                        return (
                            <div>
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: '2fr 3fr 3fr 1fr ',
                                    borderBottom: '1px solid gray',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <div className={'title'}>{category.path}</div>
                                    <button onClick={async () => {
                                        if(selectCatalog===category.path){
                                            setSelectCatalog('')
                                        }else{
                                            setSelectCatalog(category.path)
                                        }
                                    }}>Скрыть/показать карты
                                    </button>
                                    <button onClick={async () => {
                                        await updateCategoryCards(category.path)
                                        await setStatus(10);
                                    }}>Убрать\включить в продажу
                                    </button>
                                    <button onClick={async () => {
                                        deleteCategoryCards(category.path)
                                        await setStatus(10);
                                    }}>Удалить
                                    </button>
                                </div>
                                <div style={{overflow: 'hidden', height: String(height) + 'px'}}>
                                    <AdminProductList main_data={category} setDataDop={setDataCardsDop} update={async ()=>{await onReload();}}/></div>
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
                    }}>Загрузить новые данные
                    </button>
                    <button onClick={() => {
                        setPageSelected(1)
                    }}>Редактировать карты
                    </button>
                    <button onClick={() => {
                        setPageSelected(2)
                    }}>Редактировать каталоги
                    </button>
                    <button onClick={() => {
                        setPageSelected(3)
                    }}>Редактировать промокоды
                    </button>
                </div>
                {dataStructure.map(tab => (
                    <div style={{borderRadius: '10px', marginTop: '5px', background: 'gray'}} key={tab.id}>
                        <div className={'title'} style={{color: 'red'}}>{tab.page}</div>
                        <div>
                            <div className={'text-element'} style={{fontSize: '15px', color: 'orange'}}>Карусель</div>
                            {dataStructure[tab.id].body[0].map(category => (
                                <div style={{
                                    borderRadius: '10px',
                                    background: '#232323',
                                    marginTop: '7px',
                                    marginLeft: '5px',
                                    marginRight: '5px'
                                }} key={category.id}>
                                    <div className={'text-element'}>Путь: {category.path}</div>
                                    <div className={'text-element'}>Url: {category.url}</div>
                                    <button style={{background: '#343434'}} onClick={() => {
                                        deleteCategory(0, tab.id, category.id)
                                    }}>Удалить категорию
                                    </button>
                                </div>
                            ))}
                            <div style={{
                                border: '2px solid green',
                                borderRadius: '10px',
                                marginTop: '5px',
                                background: '#232323',
                                marginLeft: '5px',
                                marginRight: '5px'
                            }}>
                                <div className={'text-element'}>Добавить категорию слайдера</div>
                                <input placeholder={'Порядковый_номер'} onChange={(event) => {
                                    setInputCategory1(event.target.value)
                                }}/>
                                <input placeholder={'url_изображения'} onChange={(event) => {
                                    setInputCategory2(event.target.value)
                                }}/>
                                <input placeholder={'Путь_до_категории'} onChange={(event) => {
                                    setInputCategory3(event.target.value)
                                }}/>
                                <button style={{background: '#343434'}} onClick={() => {
                                    addCategory(0, tab.id);
                                }}>Добавить категорию
                                </button>
                            </div>
                        </div>
                        <div>
                            <div className={'text-element'} style={{fontSize: '15px', color: 'orange'}}>Tело</div>
                            {dataStructure[tab.id].body[1].map(category => (
                                <div style={{
                                    marginTop: '7px',
                                    borderRadius: '10px',
                                    background: '#232323',
                                    marginLeft: '5px',
                                    marginRight: '5px'
                                }} key={category.id}>
                                    <div className={'text-element'}>Путь: {category.path}</div>
                                    <div className={'text-element'}>Имя: {category.name}</div>
                                    <button style={{background: '#343434'}} onClick={() => {
                                        deleteCategory(1, tab.id, category.id)
                                    }}>Удалить категорию
                                    </button>
                                </div>
                            ))}
                            <div style={{
                                border: '2px solid green',
                                borderRadius: '10px',
                                marginTop: '5px',
                                background: '#232323',
                                marginLeft: '5px',
                                marginRight: '5px'
                            }}>
                                <div className={'text-element'}>Добавить категорию тела</div>
                                <input placeholder={'Порядковый_номер'} onChange={(event) => {
                                    setInputCategory1(event.target.value)
                                }}/>
                                <input placeholder={'Имя_категории'} onChange={(event) => {
                                    setInputCategory2(event.target.value)
                                }}/>
                                <input placeholder={'Путь_до_категории'} onChange={(event) => {
                                    setInputCategory3(event.target.value)
                                }}/>
                                <button style={{background: '#343434'}} onClick={() => {
                                    addCategory(1, tab.id)
                                }}>Добавить категорию
                                </button>
                            </div>
                        </div>
                    </div>))}

            </div>)
        }
        if (pageSelected === 3) {
            return (<div>
                <div>
                    <button onClick={() => {
                        setPageSelected(0)
                    }}>Загрузить новые данные
                    </button>
                    <button onClick={() => {
                        setPageSelected(1)
                    }}>Редактировать карты
                    </button>
                    <button onClick={() => {
                        setPageSelected(2)
                    }}>Редактировать каталоги
                    </button>
                    <button onClick={() => {
                        setPageSelected(3)
                    }}>Редактировать промокоды
                    </button>
                </div>
                {dataPromo.map(promo => (
                    <div style={{
                        marginTop: '7px',
                        borderRadius: '10px',
                        background: '#232323',
                        marginLeft: '5px',
                        marginRight: '5px'
                    }} key={promo.id}>
                        <div className={'text-element'}>Кодовое слово: {promo.body}</div>
                        <div className={'text-element'}>Осталось использований: {promo.number}</div>
                        <div className={'text-element'}>Процент скидки: {promo.parcent}</div>
                        <button style={{background: '#343434'}} onClick={() => {
                            sendRequestOnPromo({id: promo.id}, 'del')
                        }}>Удалить категорию
                        </button>
                    </div>
                ))}
                <div style={{
                    border: '2px solid green',
                    borderRadius: '10px',
                    marginTop: '5px',
                    background: '#232323',
                    marginLeft: '5px',
                    marginRight: '5px'
                }}>
                    <div className={'text-element'}>Добавить промокод</div>
                    <input placeholder={'Кодовое слово'} onChange={(event) => {
                        setInputCategory1(event.target.value)
                    }}/>
                    <input placeholder={'Количество использований'} onChange={(event) => {
                        setInputCategory2(event.target.value)
                    }}/>
                    <input placeholder={'Процент скидки(от 0 до 100)'} onChange={(event) => {
                        setInputCategory3(event.target.value)
                    }}/>
                    <button style={{background: '#343434'}} onClick={() => {
                        addPromo()
                    }}>Добавить промокод
                    </button>
                </div>
            </div>)
        }
    } else if (status === 1) {
        sendRequestOnDatabase([], 'getPreview')
        sendRequestOnPromo([], 'get')
        setStatus(10)
    } else if (status === 10) {
        return (
            <div className={'text-element'}>
                Ожидайте
            </div>)
    } else {
        return (
            <div>
                <div className={'text-element'}>Регистрация</div>
                <div style={{display: 'flex'}}>
                    <div className={'text-element'}>Логин: .</div>
                    <input onChange={(event) => setInputOne(event.target.value)}/>
                </div>
                <div style={{display: 'flex'}}>
                    <div className={'text-element'}>Пароль: .</div>
                    <input onChange={(event) => setInputTwo(event.target.value)}/>
                </div>
                <button onClick={sendRequestAdmin}>Войти</button>
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
                <input type="file" id="file" style={{color: 'white'}} accept={SheetJSFT}
                       onChange={this.handleChange}/>
                <button className={'all-see-button'}
                        style={{background: '#373737', justifyContent: 'left', marginLeft: '20px'}}
                        onClick={this.handleFile}>Загрузить
                </button>
            </div>

        )
    }
}

