import React from 'react';
import {calculateNewValue} from "@testing-library/user-event/dist/utils";

const FilterCheckBox = ({param, data, json, preview, setJson}) => {

    const [isVisible, setIsVisible] = React.useState(false);

    let listElement = (<div></div>)
    if (isVisible) {
        listElement = (<div style={{
            position: 'absolute',
            marginLeft: '7px',
            marginTop: '5px',
            background: '#171717',
            padding: '4px',
            border: '2px solid gray',
            borderRadius: '5px'
        }}>
            {data.map(el => (
                <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between'}}>
                    <input type={'checkbox'} onChange={(event) => {
                        const status = event.target.checked;
                        let jsonNew = json
                        if(param === 'platform'){
                            if(status){
                                jsonNew.platform = [...jsonNew.platform, el]
                                setJson(jsonNew);
                            }else{
                                jsonNew.platform.splice(jsonNew.platform.indexOf(el), 1)
                                setJson(jsonNew);
                            }
                        }
                        console.log(jsonNew)
                    }}/>
                    <div className={'text-element'} style={{marginLeft: '5px'}}>{el}</div>
                </div>))}
        </div>)
    }
    return (
        <div>
            <div className={'text-element'} style={{fontSize: '16px',}} onClick={() => {
                if (isVisible) {
                    setIsVisible(false)
                } else {
                    setIsVisible(true);
                }
            }}>{preview}</div>
            {listElement}
        </div>
    );
};

export default FilterCheckBox;