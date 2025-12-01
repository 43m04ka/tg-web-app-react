import React from 'react';
import InputLabel from "../../Elements/Input/InputLabel";
import style from './EditDataPosition.module.scss'
import SwitchLabel from "../../Elements/SwitchLabel/SwitchLabel";
import ButtonLabel from "../../Elements/ButtonLabel";
import Button from "../../Elements/ButtonLabel";

const EditDataPosition = ({structure, setNewData, currentData}) => {

    const [json, setJson] = React.useState(currentData);

    const [updateTrigger, setUpdateTrigger] = React.useState(0);

    const forceRerender = () => {
        setUpdateTrigger(prevValue => prevValue + 1);
    };

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
            if (parameter.type === 'list') {
                return (<div>
                    <p className={style['infoLabel']}>
                        {parameter.label}
                    </p>
                    <div>
                        <div style={{borderLeft:'solid 1px gray', paddingLeft: '5px', marginLeft:'10px', marginRight:'10px'}}>
                            {json[parameter.key] !== null ? json[parameter.key].map((str, index) => (
                                <div>
                                <div style={{display:'grid', gridTemplateColumns:'1fr max-content'}}>
                                    <InputLabel
                                        label={parameter.body.label || parameter.body.key}
                                        defaultValue={json[parameter.key][index] || ''}
                                        onChange={(e) => {
                                            let newJson = json
                                            newJson[parameter.key][index] = e.target.value;
                                            setJson(newJson);
                                            setNewData(newJson);
                                            forceRerender();
                                        }}/>
                                    <ButtonLabel label={'Удалить'} onClick={() => {
                                        let newJson = json
                                        newJson[parameter.key].splice(index, 1);
                                        setJson(newJson);
                                        setNewData(newJson);
                                        forceRerender();
                                    }}/>
                                </div>
                                    <img style={{height:'150px', width:'auto', marginLeft:'7px', borderRadius:'10px', border:'1px solid gray'}} src={json[parameter.key][index]}/>
                                </div>
                            )) : ''}
                        </div>
                        <ButtonLabel label={'Добавить изображение'} onClick={() => {
                            let newJson = json
                            newJson[parameter.key] = [...(json[parameter.key] || []), '']

                            setJson(newJson);
                            setNewData(newJson);
                            forceRerender();
                        }}/>
                    </div>
                </div>)
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