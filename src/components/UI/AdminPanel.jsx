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

    const [pageSelected, setPageSelected] = useState(0);

    const [buttonTable, setButtonTable] = useState(null);
    const [getData, setGetData] = useState(null)

    const [status, setStatus] = useState(0)


    const sendSingUp = {
        method: 'login',
        data: {login: inputOne, password: inputTwo}
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
                userData = sendSingUp.data
                setStatus(1)
            } else {
                alert('Неверный логин или пароль')
            }
        })
    }, [sendSingUp])


    const sendGetData = {
        method: 'get',
        data: userData,
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

    if (status === 2) {
        let data = getData[pageSelected]
        return (<div>
            <div style={{display: 'flex'}}>
                <button onClick={selectPS}>Playstation</button>
                <button onClick={selectXB}>Xbox</button>
                <button onClick={selectSR}>Services</button>
            </div>
            <div>
                {data.body.map(el => {
                    return(
                        <div>
                            {console.log(el)}
                        </div>
                    )
                })}
                <div style = {{border:'2px solid red'}}>
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
