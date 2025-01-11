import React, {useEffect, useRef, useState} from 'react';
import {calculateNewValue} from "@testing-library/user-event/dist/utils";
import {isElementOfType} from "react-dom/test-utils";

let oldHeight = 0
const FilterCheckBox = ({param, data, json, preview, setJson}) => {
    const [isVisible, setIsVisible] = useState(true);
    const [filterHeight, setFilterHeight] = useState(null);
    const filterRef = useRef();
    const [signElement, setSignElement] = useState(
        <div className={'background-arrow'}
             style={{
                 width: '20px',
                 height: '20px',
                 rotate: '90deg',
                 transitionProperty: 'rotate',
                 transitionDuration: '0.3s'
             }}/>
    );

    useEffect(() => {
        const height = filterRef.current.getBoundingClientRect().height;
        oldHeight = height + 5
        setFilterHeight(0)
    }, [filterRef, setFilterHeight]);

    const onResize = () => {
        if (isVisible) {
            setSignElement(
                <div className={'background-arrow'}
                     style={{
                             width: '20px',
                             height: '20px',
                             rotate: '-90deg',
                             transitionProperty: 'rotate',
                             transitionDuration: '0.3s'
                         }}/>
                )
                setIsVisible(false)
            } else {
                setSignElement(
                    <div className={'background-arrow'}
                         style={{
                             width: '20px',
                             height: '20px',
                             rotate: '90deg',
                             transitionProperty: 'rotate',
                             transitionDuration: '0.3s'
                         }}/>
                )
                setIsVisible(true)
            }
    }


    return (
        <div style={{marginTop:'4px'}}>
            <div className={'text-element'}
                 style={{fontSize: '18px', lineHeight: '20px', display:'flex', flexDirection:'row', alignItems:'center', justifyContent:'space-between'}} onClick={() => {
                onResize()
                if (filterHeight === oldHeight) {
                    setFilterHeight(0)
                } else {
                    setFilterHeight(oldHeight)
                }
            }}>
               <div> {preview}</div>
               <div> {signElement}</div>
            </div>
            <div ref={filterRef}
                 style={{
                     transitionProperty: 'height',
                     transitionDuration: '0.3s',
                     height: String(filterHeight) + 'px',
                     overflow: 'hidden',
                     marginTop: '5px',
                     background: '#171717',
                     borderBottom: '2px solid gray',
                 }}>
                {data.map(el => (
                    <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'left', marginLeft: '15px'}}>
                        <input type={'checkbox'} style={{transform: 'scale(1.3)'}} onChange={(event) => {
                            const status = event.target.checked;
                            let jsonNew = json
                            if (param === 'platform') {
                                if (status) {
                                    jsonNew.platform = [...jsonNew.platform, el]
                                    setJson(jsonNew);
                                } else {
                                    jsonNew.platform.splice(jsonNew.platform.indexOf(el), 1)
                                    setJson(jsonNew);
                                }
                            }if (param === 'category') {
                                if (status) {
                                    jsonNew.category = [...jsonNew.category, el]
                                    setJson(jsonNew);
                                } else {
                                    jsonNew.category.splice(jsonNew.category.indexOf(el), 1)
                                    setJson(jsonNew);
                                }
                            }
                            console.log(jsonNew)
                        }}/>
                        <div className={'text-element'} style={{marginLeft: '5px', fontSize: '18px'}}>{el}</div>
                    </div>))}
            </div>
        </div>
    );
};

export default FilterCheckBox;