import React from 'react';
import AP_SelectInputLabel from './AP_SelectInputLabel';
import InputLabel from "../../../../Elements/Input/InputLabel";
import DropBox from "../../../../Elements/DropBox/DropBox";

const ApSelectInputLabel = ({data, resultJson, setResultJson}) => {

    const [selectButton, setSelectButton] = React.useState(0)

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
            {data.map((item, index) => {
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
                newJson[item.argument] = item.value
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