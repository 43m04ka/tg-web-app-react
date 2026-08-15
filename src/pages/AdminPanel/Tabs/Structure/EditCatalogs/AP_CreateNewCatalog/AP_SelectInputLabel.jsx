import React, {useEffect} from 'react';
import AP_SelectInputLabel from './AP_SelectInputLabel';
import InputLabel from "../../../../Elements/Input/InputLabel";
import DropBox from "../../../../Elements/DropBox/DropBox";

const ApSelectInputLabel = ({data, resultJson, setResultJson}) => {

    const [selectButton, setSelectButton] = React.useState(0)

    // Автоматически выбираем правильный вариант на основе текущих данных
    useEffect(() => {
        if (typeof data[0].name !== 'undefined' && resultJson) {
            // Ищем вариант, который соответствует текущему типу в resultJson
            for (let i = 0; i < data.length; i++) {
                const option = data[i];
                if (option.select && Array.isArray(option.select)) {
                    // Проверяем, совпадают ли значения с текущими данными
                    let match = true;
                    for (let field of option.select) {
                        if (field.value !== undefined && resultJson[field.argument] !== field.value) {
                            match = false;
                            break;
                        }
                        // Для полей с defaultValue проверяем совпадение
                        if (field.defaultValue !== undefined && resultJson[field.argument] !== field.defaultValue) {
                            // Особая проверка для path с тегами
                            if (field.tag && resultJson[field.argument] && resultJson[field.argument].includes(field.tag)) {
                                continue;
                            }
                            match = false;
                            break;
                        }
                    }
                    if (match) {
                        setSelectButton(i);
                        break;
                    }
                }
            }
        }
    }, [data, resultJson]);

    let inputLabelElement = (<div/>)

    if (Array.isArray(data[selectButton].select)) {
        inputLabelElement =
            <AP_SelectInputLabel data={data[selectButton].select} resultJson={resultJson}
                                 setResultJson={setResultJson}/>
    }


    let buttonElement

    if (typeof data[0].name !== 'undefined') {
        buttonElement = (<DropBox label={data} onChange={(value) => {setSelectButton(value)}}/>)

    }else{
        buttonElement = (<div>
            {data.map((item) => {
            if (Array.isArray(item)) {
                return <AP_SelectInputLabel data={item} resultJson={resultJson} setResultJson={setResultJson}/>
            } else if (typeof item === 'object' && !Array.isArray(item) && item !== null && typeof item.value === 'undefined') {
                return (<InputLabel label={item.placeholder} onChange={(event) => {
                    let newJson = resultJson
                    if (item.type === 'number') {
                        newJson[item.argument] = Number(event.target.value)
                    } else {
                        newJson[item.argument] = (item.tag || '') + event.target.value
                    }
                    setResultJson(newJson)
                }}/>)
            }else{
                let newJson = resultJson
                newJson[item.argument] = item.value || item.defaultValue
                setResultJson(newJson)
            }
        })}</div>)
    }

    return (
        <div style={{display: 'flex', flexDirection: 'column'}}>
            {buttonElement}
            {inputLabelElement}
        </div>
    );
};

export default ApSelectInputLabel;
