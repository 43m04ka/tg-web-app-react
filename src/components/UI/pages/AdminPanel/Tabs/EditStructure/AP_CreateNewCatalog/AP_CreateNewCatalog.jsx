import React, {useEffect} from 'react';
import AP_SelectInputLabel from "./AP_SelectInputLabel";
import {useServer} from "../../../../../../../hooks/useServer";

const ApCreateNewCatalog = ({data, reload}) => {

    const {createCatalog} = useServer()

    const [resultJson, setResultJson] = React.useState({})


    useEffect(() => {
        for (let item of data) {
            if (typeof item.argument !== 'undefined' && typeof item.value !== 'undefined') {
                let newJson = resultJson
                newJson[item.argument] = item.value
                setResultJson(newJson)
            }
        }
    })

    return (
        <div>
            <div style={{
                padding: "5px",
                borderRadius: '10px',
                marginTop: '5px',
                background: '#232323',
                marginRight: '5px',
                display: 'flex',
                flexDirection: 'column'
            }}>
                <div className={'text-element'} style={{margin: "5px", fontSize: '14px', marginBottom:'15px'}}>Добавить категорию
                </div>

                {data.map((item) => {
                    if (Array.isArray(item)) {
                        return <AP_SelectInputLabel data={item} resultJson={resultJson} setResultJson={setResultJson}/>
                    } else if (typeof item === 'object' && !Array.isArray(item) && item !== null && typeof item.value === 'undefined') {
                        return (<input placeholder={item.placeholder} onChange={(event) => {
                            let newJson = resultJson
                            if (item.type === 'number') {
                                newJson[item.argument] = Number(event.target.value)
                            } else {
                                newJson[item.argument] = event.target.value
                            }
                            setResultJson(newJson)
                            console.log(newJson)
                        }} style={{margin: '5px', borderRadius: '100px', padding: '5px', border: '0px',}}/>)
                    }
                })}

                {/*<div>*/}
                {/*    {[{id: 0, name: 'Некликабельный'}, {id: 1, name: 'На карту'}, {*/}
                {/*        id: 2,*/}
                {/*        name: 'На каталог'*/}
                {/*    }, {id: 3, name: 'Ссылочный'}].map(view => {*/}
                {/*        if (typeNewHeadCatalog === view.id) {*/}
                {/*            return (<button onClick={() => {*/}
                {/*                setTypeNewHeadCatalog(view.id)*/}
                {/*            }} style={{*/}
                {/*                margin: '5px',*/}
                {/*                borderRadius: '100px',*/}
                {/*                padding: '5px',*/}
                {/*                border: '0px',*/}
                {/*                background: '#ef7474'*/}
                {/*            }}>{view.name}*/}
                {/*            </button>)*/}
                {/*        } else {*/}
                {/*            return (<button onClick={() => {*/}
                {/*                setTypeNewHeadCatalog(view.id)*/}
                {/*            }} style={{*/}
                {/*                margin: '5px',*/}
                {/*                borderRadius: '100px',*/}
                {/*                padding: '5px',*/}
                {/*                border: '0px',*/}
                {/*            }}>{view.name}*/}
                {/*            </button>)*/}
                {/*        }*/}
                {/*    })}*/}
                {/*</div>*/}
                {/*<input placeholder={'Порядковый_номер'} ref={inputHead_1}*/}
                {/*       style={{margin: '5px', borderRadius: '100px', padding: '5px', border: '0px',}}/>*/}
                {/*<input placeholder={'url_изображения'} ref={inputHead_2}*/}
                {/*       style={{margin: '5px', borderRadius: '100px', padding: '5px', border: '0px',}}/>*/}
                {/*{linkInputElement}*/}
                <button onClick={async () => {
                    await createCatalog(resultJson)
                    await reload()
                }} style={{margin: '5px', marginTop:'15px', borderRadius: '100px', padding: '5px', border: '0px', width:'max-content'}}>Добавить
                    категорию
                </button>
            </div>
        </div>
    );
};

export default ApCreateNewCatalog;