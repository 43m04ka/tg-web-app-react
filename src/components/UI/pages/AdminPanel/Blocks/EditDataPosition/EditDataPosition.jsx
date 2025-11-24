import React from 'react';
import InputLabel from "../../Elements/Input/InputLabel";
import style from './EditDataPosition.module.scss'
import SwitchLabel from "../../Elements/SwitchLabel/SwitchLabel";

const EditDataPosition = ({structure, setNewData, currentData}) => {

    const [json, setJson] = React.useState(currentData);

    return (<div className={style['container']}>
        {structure.map((parameter) => {
            if (parameter.type === 'string') {
                return (<InputLabel
                    label={parameter.label || parameter.key}
                    defaultValue={json[parameter.key] || ''}
                    onChange={(e) => {
                        let newJson = json
                        newJson[parameter.key] = e.target.value;
                        setJson(newJson);
                        setNewData(newJson);
                    }}/>)
            }
            if (parameter.type === 'number') {
                return (<InputLabel
                    label={parameter.label || parameter.key}
                    defaultValue={json[parameter.key] || ''}
                    onChange={(e) => {
                        let newJson = json
                        newJson[parameter.key] = Number(e.target.value);
                        setJson(newJson);
                        setNewData(newJson);
                    }}/>)
            }
            if (parameter.type === 'boolean') {
                return (<SwitchLabel
                    defaultValue={json[parameter.key] || ''}
                    label={parameter.label || parameter.key}
                onChange={(e) => {
                    let newJson = json
                    newJson[parameter.key] = e.target.checked;
                    setJson(newJson);
                    setNewData(newJson);
                }}/>)
            }
        })}
    </div>);
};

export default EditDataPosition;