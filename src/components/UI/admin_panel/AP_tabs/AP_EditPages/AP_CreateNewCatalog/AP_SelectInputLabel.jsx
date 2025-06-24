import React from 'react';
import AP_SelectInputLabel from './AP_SelectInputLabel';

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
        buttonElement = (<div>{data.map((view, index) => {
            let styleElement = {
                margin: '5px',
                borderRadius: '100px',
                padding: '5px',
                border: '0px',
            }
            if (selectButton === index) {
                styleElement.background = '#ef7474'
            }
            return (<button onClick={() => {
                setSelectButton(index)
            }} style={styleElement}>{view.name}
            </button>)
        })}</div>)
    }else{
        buttonElement = (<div style={{paddingRight:'10px'}}>
            {data.map((item, index) => {
            if (Array.isArray(item)) {
                return <AP_SelectInputLabel data={item} resultJson={resultJson} setResultJson={setResultJson}/>
            } else if (typeof item === 'object' && !Array.isArray(item) && item !== null && typeof item.value === 'undefined') {
                return (<input placeholder={item.placeholder} onChange={(event) => {
                    let newJson = resultJson
                    if (item.type === 'number') {
                        newJson[item.argument] = Number(event.target.value)
                    } else {
                        newJson[item.argument] = (item.tag || '') + event.target.value
                    }
                    setResultJson(newJson)
                }} style={{margin: '5px', marginRight:'5px', borderRadius: '100px', padding: '5px', border: '0px', width: '100%'}}/>)
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