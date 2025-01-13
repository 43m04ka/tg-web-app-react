import React, {useState} from 'react';
import {useTelegram} from "../../hooks/useTelegram";

const Filer = ({height}) => {
    const {tg} = useTelegram();
    const [panelIsVisible, setPanelIsVisible] = useState(false);

    let panelWidth = 0
    if (panelIsVisible) {
        panelWidth = window.innerWidth / 2;
    }
    return (
        <div style={{display:'flex', flexDirection:'row', }}>
            <div style={{
                background: '#232323',
                height: String(height - 70 - tg?.contentSafeAreaInset.bottom - tg?.safeAreaInset.bottom - tg?.contentSafeAreaInset.top - tg?.safeAreaInset.top) + 'px',
                width: String(panelWidth) + 'px',
                borderTopRightRadius: '10px',
                borderBottomRightRadius: '10px',
                transitionProperty:'width',
                transitionDuration:'0.3s'
            }}>
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