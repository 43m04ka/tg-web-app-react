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

    const [getData, setGetData] = useState(null)

    const [status, setStatus] = useState(0)


    const sendSingUp = {
        method: 'login',
        userData: {login: inputOne, password: inputTwo}
    }

    const onSingUpButton = useCallback(() => {
        console.log(sendSingUp)
        fetch('https://2ae04a56-b56e-4cc1-b14a-e7bf1761ebd5.selcdn.net/admin', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(sendSingUp)
        }).then(r => {
            if (r.status === 200) {
                userData = sendSingUp.userData
                setStatus(1)
            } else {
                alert('Неверный логин или пароль')
            }
        })
    }, [sendSingUp])


    const sendGetData = {
        method: 'get',
    }


    const onGetData = useCallback(() => {
        fetch('https://2ae04a56-b56e-4cc1-b14a-e7bf1761ebd5.selcdn.net/admin', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(sendGetData)
        }).then(r => {
            let Promise = r.json()
            Promise.then(prom => {
                setGetData(prom.body)
                setStatus(2)
            })
        })
    }, [sendGetData])




    const selectPS = () => {
        setPageSelected(0)
    }
    const selectXB = () => {
        setPageSelected(1)
    }
    const selectSR = () => {
        setPageSelected(2)
    }

    const setButtonTableClassic = (table) => {

        let arrayRequest = []
        table.map(el =>{
            let newCard = el
            newCard.tab = pageSelected
            newCard.tabCategoryName = inputCategory2
            newCard.tabCategoryName = inputCategory3
            newCard.type = 1
            arrayRequest = [...arrayRequest, ...[newCard]]
        })

        sendDataOnServer(arrayRequest, 'add')
    }

    const setButtonTableSlider = (table) => {
        let typeI = 0;

        let id = 0;

        getData[pageSelected].body[typeI].map(el => {
            if (el.id > id) {
                id = el.id
            }
        })

        const bodyPromt = {
            id: id+1,
            path: inputCategory2,
            img: inputCategory3,
            body: table
        }

        let newData = getData
        newData[pageSelected].body[typeI].splice(parseInt(inputCategory1), 0, bodyPromt);
        sendDataOnServer(getData)
    }

    let dataSetRequest = {
        method: '',
        userData: userData,
        data:[]
    }

    const setRequest = useCallback(() => {
        fetch('https://2ae04a56-b56e-4cc1-b14a-e7bf1761ebd5.selcdn.net/database', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(dataSetRequest)
        }).then(r => {
            let Promise = r.json()
            Promise.then(prom => {
                console.log(prom)
                if(prom.method === 'add'){
                    const inputData = prom.body;

                }else if(prom.method === 'get'){
                    console.log(prom.body)
                }
            })
        })
    }, [dataSetRequest])

    const sendDataOnServer = (inputData, operation) => {
        dataSetRequest.method = operation
        dataSetRequest.data = inputData
        setRequest()
    }

    if (status === 2) {
        let data = getData[pageSelected]
        return (<div>
            <div style={{display: 'flex'}}>
                <button onClick={selectPS}>Playstation</button>
                <button onClick={selectXB}>Xbox</button>
                <button onClick={selectSR}>Services</button>
            </div>
            <div>
                <div className={'title'}>Элементы слайдера</div>
                {data.body[0].map(el => {
                    return (
                        <div style={{border: '2px solid gray', display: 'grid', padding: '10px', borderRadius: '10px'}}>
                            <div className={'text-element'}>Путь: {el.path}</div>
                            <div className={'text-element'}>URL: {el.img}</div>
                            <button className={'text-element'} style={{background: 'black'}} onClick={() => {
                                console.log(el.body)
                            }}>Тело элемента
                            </button>

                            <button className={'text-element'} style={{background: 'black'}} onClick={
                                () => {
                                    let userBasket = getData
                                    let deleteItem = [el];
                                    const editArray = userBasket[pageSelected].body[0].filter(person_A => !deleteItem.some(person_B => person_A.id === person_B.id));
                                    userBasket[pageSelected].body[0] = editArray;
                                    sendSetData.data = {body: userBasket}
                                    onSendData()
                                }}>Удалить
                            </button>
                        </div>
                    )
                })}

                <div style={{border: '2px solid gray', display: 'grid', padding: '10px', borderRadius: '10px'}}>
                    <div className={'text-element'}>Добавить новый элемент слайдера</div>
                    <input defaultValue={'Порядковый_номер'} onChange={(event) => {
                        setInputCategory1(event.target.value)
                    }}/>
                    <input defaultValue={'Путь_до_категории'} onChange={(event) => {
                        setInputCategory2(event.target.value)
                    }}/>
                    <input defaultValue={'url_превью_изображения'} onChange={(event) => {
                        setInputCategory3(event.target.value)
                    }}/>
                    <div className={'text-element'}>Таблица с данными категории</div>
                    <ExcelReader setButtonTable={setButtonTableSlider}/>
                </div>

                <div className={'title'}>Элементы тела</div>
                {data.body[1].map(el => {
                    return (
                        <div style={{border: '2px solid gray', display: 'grid', padding: '10px', borderRadius: '10px'}}>
                            <div className={'text-element'}>Имя: {el.name}</div>
                            <div className={'text-element'}>Путь: {el.path}</div>
                            <button className={'text-element'} style={{background: 'black'}} onClick={() => {
                                console.log(el.body)
                            }}>Тело элемента
                            </button>
                            <button className={'text-element'} style={{background: 'black'}} onClick={
                                () => {
                                    let userBasket = getData
                                    let deleteItem = [el];
                                    const editArray = userBasket[pageSelected].body[1].filter(person_A => !deleteItem.some(person_B => person_A.id === person_B.id));
                                    userBasket[pageSelected].body[1] = editArray;
                                    sendSetData.data = {body: userBasket}
                                    onSendData()
                                }}>Удалить
                            </button>
                        </div>
                    )
                })}
                <div style={{border: '2px solid gray', display: 'grid', padding: '10px', borderRadius: '10px'}}>
                    <div className={'text-element'}>Добавить новую категорию</div>
                    <input defaultValue={'Порядковый_номер'} onChange={(event) => {
                        setInputCategory1(event.target.value)
                    }}/>
                    <input defaultValue={'Имя_категории'} onChange={(event) => {
                        setInputCategory2(event.target.value)
                    }}/>
                    <input defaultValue={'Путь_до_категории'} onChange={(event) => {
                        setInputCategory3(event.target.value)
                    }}/>
                    <div className={'text-element'}>Таблица с данными категории</div>
                    <ExcelReader setButtonTable={setButtonTableClassic}/>
                </div>
            </div>
        </div>)
    } else if (status === 1) {
        onGetData()
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
                <button onClick={onSingUpButton}>Войти</button>
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
