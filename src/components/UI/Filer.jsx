import React, {useState} from 'react';
import {useTelegram} from "../../hooks/useTelegram";
import FilterCheckBox from "./FilterCheckBox";

const Filer = ({height, elementKeys, onRequestFilter}) => {
    const {tg} = useTelegram();
    const [panelIsVisible, setPanelIsVisible] = useState(false);
    const [jsonFilter, setJsonFilter] = useState({platform: [], price: {min: 0, max: 50000, sort: null}});

    let panelWidth = 0
    if (panelIsVisible) {
        panelWidth = window.innerWidth / 2;
    }
    let platformElement = (<></>)
    if (elementKeys.includes('platformPS')) {
        platformElement = (
            <FilterCheckBox param={'platform'} setJson={setJsonFilter} json={jsonFilter} data={['PS5', 'PS4']}
                            preview={'Консоль'}/>)
    }
    if (elementKeys.includes('platformXB')) {
        platformElement = (
            <FilterCheckBox param={'platform'} setJson={setJsonFilter} json={jsonFilter} data={['One', 'Series']}
                            preview={'Консоль'}/>)
    }
    return (
        <div style={{display: 'flex', flexDirection: 'row',}}>
            <div style={{
                background: '#232323',
                height: String(height - 70 - tg?.contentSafeAreaInset.bottom - tg?.safeAreaInset.bottom - tg?.contentSafeAreaInset.top - tg?.safeAreaInset.top) + 'px',
                width: String(panelWidth) + 'px',
                borderTopRightRadius: '10px',
                borderBottomRightRadius: '10px',
                transitionProperty: 'width',
                transitionDuration: '0.3s',
                overflow: 'hidden',
            }}>
                <div
                    style={{height: String(height - 70 - tg?.contentSafeAreaInset.bottom - tg?.safeAreaInset.bottom - tg?.contentSafeAreaInset.top - tg?.safeAreaInset.top - 45) + 'px'}}>
                    {platformElement}
                </div>
                <button onClick={()=>{onRequestFilter(jsonFilter)}}
                    className={'text-element'} style={{
                    width: String(window.innerWidth / 2 - 10) + 'px',
                    marginLeft: '5px',
                    height: '35px',
                    borderRadius: '10px',
                    border: '0px',
                    color: 'black',
                    textAlign: 'center'
                }}>Показать
                </button>
            </div>
            <div style={{
                width: '45px',
                padding: '5px',
                height: '45px',
                marginTop: '10px',
                marginLeft: '10px',
                borderRadius: '50%',
                background: 'white',
            }} onClick={() => {
                if (panelIsVisible) {
                    setPanelIsVisible(false);
                } else {
                    setPanelIsVisible(true);
                }
            }}>
                <div className={'background-filter'} style={{height: '35px', width: '35px'}}></div>
            </div>
        </div>
    );
};

export default Filer;