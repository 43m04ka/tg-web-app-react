import React, {Component, useEffect, useState} from 'react';
import * as XLSX from "xlsx";
import {useServer} from "../../../../hooks/useServer";

const make_cols = ref_str => {
    let o = [], C = XLSX.utils.decode_range(ref_str).e.c + 1;
    for (let i = 0; i < C; ++i) o[i] = {name: XLSX.utils.encode_col(i), key: i}
    return o;
};
const SheetJSFT = [
    "xlsx", "xlsb", "xlsm", "xls", "xml", "csv", "txt", "ods", "fods", "uos", "sylk", "dif", "dbf", "prn", "qpw", "123", "wb*", "wq*", "html", "htm"
].map(function (x) {
    return "." + x;
}).join(",");

const ApUploadData = () => {

    const [tabId, setTabId] = useState(0)
    const [gameType, setGameType] = useState(0)
    const [path, setPath] = useState('')
    const [addToAll, setAddToAll] = useState(0)
    const [onLoad, setOnLoad] = useState(false)
    const [left, setLeft] = useState(0)
    const [pageList, setPageList] = useState([])

    const {uploadCards, getPages} = useServer();

    useEffect(() => {
        getPages(setPageList).then()
    }, [])

    const setButtonTableClassic = async (table) => {

        let arrayRequest = []
        table.map(el => {
            let newCard = el
            newCard.tab = tabId
            newCard.tabCategoryPath = path
            if (gameType === 1) {
                newCard.globalView = 'game'
            } else {
                newCard.globalView = 'other'
            }
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

            arrayRequest = [...arrayRequest, ...[newCard]]
        })

        let array = arrayRequest; //массив, можно использовать массив объектов
        let size = 20; //размер подмассива
        let subarray = []; //массив в который будет выведен результат.
        for (let i = 0; i < Math.ceil(array.length / size); i++) {
            subarray[i] = array.slice((i * size), (i * size) + size);
        }
        setOnLoad(true)
        for (let i = 0; i < subarray.length; i++) {
            await setLeft((subarray.length-i)*20)
            await uploadCards({data:subarray[i], addToAll: addToAll === 1})
        }
        await setOnLoad(false)
    }
    if(onLoad){
        return(<div className={'text-element'} style={{fontSize:'20px', marginTop:'30px', marginLeft:'30px', display:'flex', flexDirection:'row', justifyContent:'center',}}>
            Загрузка карт на сервер. Осталось {left} карт
        </div>)
    }
    else {
        return (
            <div style={{
                display: 'grid',
                padding: '10px',
                marginTop: '10px',
                margin: '10px',
                borderRadius: '10px',
                background: '#232323'
            }}>
                <div className={'text-element'}
                     style={{display: 'flex', flexDirection: 'row', marginLeft: '0px'}}>
                    {pageList.map((tab, index) => {
                        if (index === tabId) {
                            return (<button onClick={() => {
                                setTabId(index)
                            }} style={{
                                margin: '5px',
                                borderRadius: '100px',
                                padding: '5px',
                                border: '0px',
                                background: '#ef7474'
                            }}>{tab.name}
                            </button>)
                        } else {
                            return (<button onClick={() => {
                                setTabId(index)
                            }} style={{
                                margin: '5px',
                                borderRadius: '100px',
                                padding: '5px',
                                border: '0px',
                            }}>{tab.name}
                            </button>)
                        }
                    })}
                </div>
                <input className={'text-element'} onChange={(event) => {
                    setPath(event.target.value)
                }} style={{margin: '5px', borderRadius: '100px', padding: '5px', border: '0px', color: 'black'}}
                       placeholder={'уникальный_путь_до_категории'}/>

                <div style={{
                    margin: '5px',
                    borderRadius: '100px',
                    paddingLeft: '5px',
                    border: '0px',
                    display: 'flex',
                    flexDirection: 'row',
                    background: 'white',
                    color: 'black',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}
                     className={'text-element'}>
                    Добавить в общий каталог игр? -
                    {[0].map(() => {
                        if (addToAll === 1) {
                            return (<div style={{
                                borderRadius: '100px',
                                padding: '5px',
                                border: '0px',
                                background: '#1eae6d',
                                color: 'white',
                                margin: '0',
                                width: '400px',
                                textAlign: 'center'
                            }} onClick={async () => {
                                await setAddToAll(0)
                            }}>Да</div>)
                        } else {
                            return (<div style={{
                                borderRadius: '100px',
                                padding: '5px',
                                border: '0px',
                                background: '#ef7474',
                                color: 'white',
                                margin: '0',
                                width: '400px',
                                textAlign: 'center'
                            }} onClick={async () => {
                                await setAddToAll(1)
                            }}>Нет</div>)
                        }
                    })}
                </div>
                <div style={{
                    margin: '5px',
                    borderRadius: '100px',
                    paddingLeft: '5px',
                    border: '0px',
                    display: 'flex',
                    flexDirection: 'row',
                    background: 'white',
                    color: 'black',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}
                     className={'text-element'}>
                    Загружаемые карты принадлежат у типу игр? -
                    {[0].map(() => {
                        if (1 === gameType) {
                            return (<div style={{
                                borderRadius: '100px',
                                padding: '5px',
                                border: '0px',
                                background: '#1eae6d',
                                color: 'white',
                                margin: '0',
                                width: '400px',
                                textAlign: 'center'
                            }} onClick={async () => {
                                await setGameType(0)
                            }}>Да</div>)
                        } else {
                            return (<div style={{
                                borderRadius: '100px',
                                padding: '5px',
                                border: '0px',
                                background: '#ef7474',
                                color: 'white',
                                margin: '0',
                                width: '400px',
                                textAlign: 'center'
                            }} onClick={async () => {
                                await setGameType(1)
                            }}>Нет</div>)
                        }
                    })}
                </div>
                <div style={{marginTop: '15px'}} className={'text-element'}>Таблица с данными категории</div>
                <div style={{marginLeft: '5px'}}>
                    <ExcelReader setButtonTable={setButtonTableClassic}/>
                </div>
            </div>
        );
    }
};

export default ApUploadData;


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
                const b_str = e.target.result;
                const wb = XLSX.read(b_str, {type: 'array', bookVBA: true});
                /* Get first worksheet */
                const ws_name = wb.SheetNames[0];
                const ws = wb.Sheets[ws_name];
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
