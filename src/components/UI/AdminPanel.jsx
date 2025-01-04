import React, {Component, useCallback, useEffect, useRef, useState} from 'react';
import * as XLSX from "xlsx";

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
    const [computeData, setComputeData] = useState(null);

    const [status, setStatus] = useState(0)


    const dataRequestAdmin = {
        method: 'login',
        data:{},
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


    const setButtonTableClassic = (table) => {

        let arrayRequest = []
        table.map(el => {
            let newCard = el
            newCard.tab = inputCategory2
            newCard.tabCategoryPath = inputCategory3
            newCard.type = inputCategory1
            arrayRequest = [...arrayRequest, ...[newCard]]
        })

        sendRequestOnDatabase(arrayRequest, 'add')
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
                if (dataRequestDatabase.method === 'add') {
                    setStatus(1)
                } else if (dataRequestDatabase.method === 'get') {
                    setDataStructure(prom.structure)
                    setDataCards(prom.cards)
                    setStatus(2)
                }
            })
        })
    }, [dataRequestDatabase])

    const sendRequestOnDatabase = (inputData, operation) => {
        dataRequestDatabase.method = operation
        dataRequestDatabase.data = inputData
        sendRequestDatabase()
    }

    const addCategory = (type, tab) =>{
        let structure = dataStructure;
        console.log(structure,dataStructure, 'вход addStructure')
        let id = 0
        structure[tab].body[type].map(el => {
            if(el.id> id){id = el.id}
        })


        if(type === 0){structure[tab].body[type].splice(parseInt(inputCategory1), 0, {id:id+1, url:inputCategory2, path:inputCategory3, body:[]});}
        if(type === 1){structure[tab].body[type].splice(parseInt(inputCategory1), 0, {id:id+1, name:inputCategory2, path:inputCategory3, body:[]});}

        console.log(structure,dataStructure, 'выход addStructure')
        sendRequestOnAdmin({body: structure}, 'set')

    }

    const deleteCategory = (type, tab, categoryId) =>{
        let structure = dataStructure;

        let newArray = []
        
        structure[tab].body[type].map(el => {
            if(el.id !== categoryId){
                newArray = [...newArray, ... [{el}]]
            }
        })

        structure[tab].body[type] = newArray

        sendRequestOnAdmin({body: structure}, 'set')

    }

    const onComputeData = () =>{
        let inputDataCards = dataCards
        let resultData = dataStructure

        inputDataCards.map(cardOld => {
            let card = cardOld.body
            card.id = cardOld.id

            const cardTab = card.tab
            const cardType = card.type
            const cardCategory = card.tabCategoryPath

            let count = 0
            resultData[cardTab].body[cardType].map(category =>{
                if(category.path === cardCategory){
                    resultData[cardTab].body[cardType][count].body = [...resultData[cardTab].body[cardType][count].body, ...[card]]
                }
                count += 1;
            })

        })
        console.log(resultData)
    }


    if (status === 2) {
        if (pageSelected === 0) {
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
                </div>
                <div style={{display: 'grid', padding: '10px', borderTop: '3px gray solid', marginTop: '10px'}}>
                    <div className={'text-element'}>Загрузить карты на сервер</div>
                    <input defaultValue={'Вид категории'} onChange={(event) => {
                        setInputCategory1(event.target.value)
                    }}/>
                    <input defaultValue={'Tab_number'} onChange={(event) => {
                        setInputCategory2(event.target.value)
                    }}/>
                    <input defaultValue={'Путь_до_категории'} onChange={(event) => {
                        setInputCategory3(event.target.value)
                    }}/>
                    <div className={'text-element'}>Таблица с данными категории</div>
                    <ExcelReader setButtonTable={setButtonTableClassic}/>
                </div>
                <button onClick={() => {
                    sendRequestOnDatabase([], 'get')
                }}>getData
                </button>
            </div>)
        }
        if (pageSelected === 1) {
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
                </div>
                {dataStructure.map(tab =>(
                <div style={{border: '2px solid red', borderRadius:'10px', marginTop:'5px'}} key={tab.id}>
                    <div className={'title'}>{tab.page}</div>
                    <div>
                        <div className={'text-element'}>Слайдер</div>
                        {dataStructure[tab.id].body[0].map(category => (
                            <div style={{border: '2px solid green', borderRadius: '10px'}} key={category.id}>
                                <div className={'text-element'}>Id: {category.id}</div>
                                <div className={'text-element'}>Путь: {category.path}</div>
                                <div className={'text-element'}>Url: {category.url}</div>
                                <button style={{background: '#343434'}} onClick={() => {
                                    deleteCategory(0, tab.id, category.id)
                                }}>Удалить категорию
                                </button>
                            </div>
                        ))}
                        <div style={{border: '2px solid green', borderRadius: '10px', marginTop:'5px'}}>
                            <div className={'text-element'}>Добавить категорию слайдера</div>
                                <input defaultValue={'Порядковый_номер'} onChange={(event) => {
                                    setInputCategory1(event.target.value)
                                }}/>
                                <input defaultValue={'url_изображения'} onChange={(event) => {
                                    setInputCategory2(event.target.value)
                                }}/>
                                <input defaultValue={'Путь_до_категории'} onChange={(event) => {
                                    setInputCategory3(event.target.value)
                                }}/>
                                <button style={{background: '#343434'}} onClick={() => {
                                    addCategory(0, tab.id)
                                }}>Добавить категорию
                                </button>
                        </div>
                    </div>
                    <div>
                        <div className={'text-element'}>Tело</div>
                        {dataStructure[tab.id].body[1].map(category => (
                            <div style={{border: '2px solid green', borderRadius: '10px', marginTop:'5px'}} key={category.id}>
                                <div className={'text-element'}>Id: {category.id}</div>
                                <div className={'text-element'}>Путь: {category.path}</div>
                                <div className={'text-element'}>Имя: {category.name}</div>
                                <button style={{background: '#343434'}} onClick={() => {
                                    deleteCategory(1, tab.id, category.id)
                                }}>Удалить категорию
                                </button>
                            </div>
                        ))}
                        <div style={{border: '2px solid green', borderRadius:'10px', marginTop:'5px'}}>
                            <div className={'text-element'}>Добавить категорию тела</div>
                            <input defaultValue={'Порядковый_номер'} onChange={(event) => {
                                setInputCategory1(event.target.value)
                            }}/>
                            <input defaultValue={'Имя_категории'} onChange={(event) => {
                                setInputCategory2(event.target.value)
                            }}/>
                            <input defaultValue={'Путь_до_категории'} onChange={(event) => {
                                setInputCategory3(event.target.value)
                            }}/>
                            <button style={{background:'#343434'}} onClick={()=>{addCategory(1, tab.id)}}>Добавить категорию</button>
                        </div>
                    </div>
                </div>))}

            </div>)
        }
    } else if (status === 1) {
        sendRequestOnDatabase([], 'get')
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
                <input type="file" id="file" style={{color: 'white', marginLeft: '15px'}} accept={SheetJSFT}
                       onChange={this.handleChange}/>
                <button onClick={this.handleFile}>Загрузить</button>
            </div>

        )
    }
}
