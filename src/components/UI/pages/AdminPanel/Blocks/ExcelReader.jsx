import React from 'react';
import * as XLSX from "xlsx";
import styles from './ExcelReader.module.scss'

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

const ExcelReader = ({setButtonTable}) => {

    const [file, setFile] = React.useState(null);
    const [text, setText] = React.useState('Файл не выбран');

    const handleChange = (e) => {
        const files = e.target.files;
        setText(e.target.value.replace('C:\\fakepath\\', ''));

        try {
            const reader = new FileReader();

            reader.onload = async (e) => {
                const b_str = e.target.result;
                const wb = await XLSX.read(b_str, {type: 'array', bookVBA: true});
                const ws_name = wb.SheetNames[0];

                const ws = wb.Sheets[ws_name];
                const data = XLSX.utils.sheet_to_json(ws);

                await setButtonTable(data)
            };

            if (files && files[0]) reader.readAsArrayBuffer(files[0]);
        } catch (e) {
            console.log(e)
        }
    };


    const handleFile = () => {

    }

    return (
        <div style={{marginLeft: '7px'}}>
            <label className={styles["input-file"]}>
                <input type="file" id="file" className={'text-element'}
                       style={{margin: '5px', borderRadius: '100px', padding: '5px', border: '0px',}} accept={SheetJSFT}
                       onChange={handleChange}/>
                <div className={styles["input-file-btn"]}> Выберите файл</div>
                <div className={styles["input-file-text"]}>{text}</div>
            </label>
        </div>

    )
}

export default ExcelReader;