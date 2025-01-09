import React, {useEffect, useState} from 'react';
import {Link} from "react-router-dom";
import basket from "../icons/basket.png";

const HeadSelector = ({main_data, hidden, page, basketLen}) => {
    const [pageSelected, setPageSelected] = useState(page);

    let c1, c2, c3 = null
    if (page === 0) {
        c1 = [64, 73, 233]
        c2 = [23, 23, 23]
        c3 = [23, 23, 23]
    }
    if (page === 1) {
        c1 = [23, 23, 23]
        c2 = [64, 233, 73]
        c3 = [23, 23, 23]
    }if (page === 2) {
        c1 = [23, 23, 23]
        c2 = [23, 23, 23]
        c3 = [233, 73, 64]
    }

    const [colorPS, setColorPS] = useState(c1);
    const [colorXB, setColorXB] = useState(c2);
    const [colorSR, setColorSR] = useState(c3);


    function rgb([r, g, b]) {
        return '#' + (0x1000000 + (r << 16) + (g << 8) + b).toString(16).substring(1);
    }


    const onclickPS = () => {
        setPageSelected(0);
        setColorPS([64, 73, 233]);
        setColorXB([23, 23, 23]);
        setColorSR([23, 23, 23]);
    }
    const onclickXB = () => {
        setPageSelected(1);
        setColorXB([73, 233, 64]);
        setColorSR([23, 23, 23]);
        setColorPS([23, 23, 23]);
    }
    const onclickSR = () => {
        setPageSelected(2);
        setColorSR([233, 64, 73]);
        setColorPS([23, 23, 23]);
        setColorXB([23, 23, 23]);
    }


    const stylePs = {background: rgb(colorPS)}
    const styleXB = {background: rgb(colorXB)}
    const styleSR = {background: rgb(colorSR)}

    const onChangeEmpty = (event) => {
        const valueInput = event.target.value
        const category = main_data[pageSelected].body

        let allCard = []
        category.map(el => {
            const array = el.body
            array.map(card => {
                allCard = [...allCard, card]
            })
        })
        let result = []
        allCard.map(card => {
            if (card.title.toLowerCase().includes(valueInput.toLowerCase())) {
                result = [...result, card]
            }
        })
    }

    let buttonMenuHeight = 50
    if (hidden) {
        buttonMenuHeight = 0
    }

    let basketKolElement = (<></>)
    if(basketLen !== null && basketLen !== 0){
        basketKolElement = (<div className={'text-element'} style={{
            background: '#f83d3d',
            fontSize: '15px',
            height: '20px',
            width: '20px',
            borderRadius: "50%",
            textAlign: 'center',
            lineHeight: '20px',
            position: 'absolute',
            marginLeft: '27px',
            marginTop: '27px'
        }}>{basketLen}</div>)
    }

    return (
        <div>
            <div className="selector-container" style={{
                height: String(buttonMenuHeight) + 'px',
                overflow: 'hidden',
                transitionProperty: 'height',
                transitionDuration: '0.1s'
            }}>
                <Link to={'/home0'} className={'link-element'}>
                    <div className={'div-box-4563'} style={{width: '100%', height: "100%", padding: '3px'}}>
                        <button className={'selector-button'} onClick={onclickPS} style={stylePs}>PLAYSTATION</button>
                    </div>
                </Link>
                <Link to={'/home1'} className={'link-element'}>
                    <div className={'div-box-4563'} style={{width: '100%', height: "100%", padding: '3px'}}>
                        <button className={'selector-button'} onClick={onclickXB} style={styleXB}>XBOX</button>
                    </div>
                </Link>
                <Link to={'/home2'} className={'link-element'}>
                    <div className={'div-box-4563'} style={{width: '100%', height: "100%", padding: '3px'}}>
                        <button className={'selector-button'} onClick={onclickSR} style={styleSR}>СЕРВИСЫ</button>
                    </div>
                </Link>
            </div>
            <div className={'box-grid-panel'}>
                <Link to={'/search' + String(pageSelected)} className={'link-element'}>
                    <div className={'search'} style={{padding: '10px', display: 'flex', flexDirection: 'row'}}>
                        <div className={'background-search'} style={{width: '25px', height: '25px'}}></div>
                        <div style={{
                            height: '25px',
                            alignContent: 'center',
                            marginLeft: '3px',
                            fontSize: "16px",
                            color: 'black',
                            fontFamily: "'Montserrat', sans-serif",
                            fontVariant: 'small-caps'
                        }}>Найти игру, подписку...
                        </div>
                    </div>
                </Link>
                <Link to={'/basket'+page} className={'link-element'}>
                    <div className={'div-button-panel'} style={{padding: '3px'}}>
                        <div className={'background-basket'} style={{width: '100%', height: '100%'}}>
                            {basketKolElement}
                        </div>
                    </div>
                </Link>
                <Link to={'/info'} className={'link-element'}>
                    <div className={'div-button-panel'} style={{padding: '6px'}}>
                        <div className={'background-profile'} style={{width: '100%', height: '100%'}}></div>
                    </div>
                </Link>
            </div>
        </div>
    );
};

export default HeadSelector;