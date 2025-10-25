import React, {useEffect} from 'react';
import AP_SelectInputLabel from "./AP_SelectInputLabel";
import {useServer} from "../../../../useServer";
import useData from "../../../../useData";
import InputLabel from "../../../../Elements/Input/InputLabel";

const ApCreateNewCatalog = ({data, setResult}) => {

    const [resultJson, setResultJson] = React.useState({})


    useEffect(() => {
        for (let item of data) {
            if ((typeof item.argument !== 'undefined' && typeof item.value !== 'undefined') || (typeof item.defaultValue !== 'undefined' && item.defaultValue !== '')) {
                let newJson = resultJson
                newJson[item.argument] = item.value || item.defaultValue
                setResultJson(newJson)
            }
        }
    })

    return (
        <div>
            {data.map((item) => {
                if (Array.isArray(item)) {
                    return <AP_SelectInputLabel data={item} resultJson={resultJson} setResultJson={(res)=>{setResultJson(res); setResult(res)}}/>
                } else if (typeof item === 'object' && !Array.isArray(item) && item !== null && typeof item.value === 'undefined') {
                    return (<InputLabel label={item.placeholder} defaultValue={item.defaultValue} onChange={(event) => {
                        let newJson = resultJson
                        if (item.type === 'number') {
                            newJson[item.argument] = Number(event.target.value)
                        } else {
                            newJson[item.argument] = (item.tag || '') + event.target.value
                        }
                        setResultJson(newJson);
                        setResult(newJson)
                    }}/>)
                }
            })}
        </div>
    );
};

export default ApCreateNewCatalog;