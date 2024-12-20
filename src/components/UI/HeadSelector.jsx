import React, {useState} from 'react';
import {Link} from "react-router-dom";
import basket from "../icons/basket.png";

const HeadSelector = ({onChange, main_data}) => {
    const [pageSelected, setPageSelected] = useState(0);
    const [colorPS, setColorPS] = useState([64, 73, 233]);
    const [colorXB, setColorXB] = useState([23, 23, 23]);
    const [colorSR, setColorSR] = useState([23, 23, 23]);


    function rgb([r, g, b]) {
        return '#' + (0x1000000 + (r << 16) + (g << 8) + b).toString(16).substring(1);
    }


    const onclickPS = () => {
        setPageSelected(0);
        setColorPS([64, 73, 233]);
        setColorXB([23, 23, 23]);
        setColorSR([23, 23, 23]);
        onChange(0);
    }
    const onclickXB = () => {
        setPageSelected(1);
        setColorXB([73, 233, 64]);
        setColorSR([23, 23, 23]);
        setColorPS([23, 23, 23]);
        onChange(1);
    }
    const onclickSR = () => {
        setPageSelected(2);
        setColorSR([233, 64, 73]);
        setColorPS([23, 23, 23]);
        setColorXB([23, 23, 23]);
        onChange(2);
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
            array.map(card =>{
                allCard = [...allCard, card]
            })
        })
        let result = []
        allCard.map(card =>{
            if(card.title.toLowerCase().includes(valueInput.toLowerCase())){
                result = [...result, card]
            }
        })
    }

    return (
        <div>
            <div className="selector-container">
                <div className={'div-box-4563'} style={{width: '100%', height: "100%", padding: '3px'}}>
                    <button className={'selector-button'} onClick={onclickPS} style={stylePs}>Playstation</button>
                </div>
                <div className={'div-box-4563'} style={{width: '100%', height: "100%", padding: '3px'}}>
                    <button className={'selector-button'} onClick={onclickXB} style={styleXB}>Xbox</button>
                </div>
                <div className={'div-box-4563'} style={{width: '100%', height: "100%", padding: '3px'}}>
                    <button className={'selector-button'} onClick={onclickSR} style={styleSR}>Сервисы</button>
                </div>
            </div>
            <div className={'box-grid-panel'}>
                <input className={'search'} onChange={onChangeEmpty}></input>
                <Link to={'basket'} className={'link-element'}>
                <div className={'div-button-panel'} style={{padding:'10px !important'}}>
                    <div className={'background-basket'} style={{ width:'100%', height:'100%'}}></div>
                </div></Link>
                <div className={'div-button-panel'} style={{padding:'10px !important'}} >
                    <div className={'background-profile'} style={{width: '100%', height: '100%'}}></div>
                </div>
            </div>
        </div>
    );
};

export default HeadSelector;