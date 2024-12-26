import React from 'react';

const ProductListSelector = ({main_data, page, height}) => {
    const [selectCategory, setSelectCategory] = React.useState(0);
    const [selectView, setSelectView] = React.useState(0);
    const dataOld = main_data.body;
    let data = []

    let lastName = ''
    let vsArray = []
    let lastId = 0
    dataOld.map(el => {
        if (lastName !== el.category) {
            data = [...data, ...vsArray]
            lastName = el.category
            vsArray = [{}]
            vsArray[0].id = lastId
            vsArray[0].title = el.category
            vsArray[0].body = [el]
            lastId += 1
        } else {
            vsArray[0].body = [...vsArray[0].body, ...[el]]
        }

    })
    data = [...data, ...vsArray]




    console.log(data);
    return (
        <div>
            <div style={{
                display: 'grid',
                alignItems: 'center',
                width: String(window.innerWidth - 20) + 'px',
                border: '2px gray solid',
                borderRadius: '5px',
                marginLeft: '10px',
            }}>
                <div style={{
                    background: 'blue',
                    width: String((window.innerWidth - 20) / 4) + 'px',
                    height: '30px',
                    borderRadius: '5px',
                    position: 'relative'
                }}>

                    {data.map(el => (
                        <div key={el.id} style={{
                            position: 'absolute',
                            marginLeft: String((el.id) * (window.innerWidth - 20) / 4 + 'px'),
                            width: String((window.innerWidth - 30) / 4) + 'px',
                            height: '25px'
                        }}>
                            <div style={{
                                border: '1px solid green',
                                justifyContent: 'center',
                                alignItems: 'center',
                                display: 'flex',
                                height: '30px',
                                overflow: 'hidden',
                            }} onClick={() => {
                                setSelectCategory(el.id)
                            }}>
                                {el.title}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div style={{
                display: 'grid',
                alignItems: 'center',
                width: String(window.innerWidth - 20) + 'px',
                border: '2px gray solid',
                borderRadius: '5px',
                marginLeft: '10px',
            }}>
                <div style={{
                    background: 'blue',
                    width: String((window.innerWidth - 20) / 3) + 'px',
                    height: '30px',
                    borderRadius: '5px',
                    position: 'relative'
                }}>
                    {data[selectCategory].body.map(el => (
                        <div key={el.id} style={{
                            position: 'absolute',
                            marginLeft: String(((el.id - 1) % 3) * (window.innerWidth - 20) / 3 + 'px'),
                            width: String((window.innerWidth - 30) / el.length) + 'px',
                            height: '25px'
                        }}>
                            <div style={{
                                border: '1px solid green',
                                justifyContent: 'center',
                                alignItems: 'center',
                                display: 'flex',
                                height: '30px',
                                overflow: 'hidden',
                                width: String((window.innerWidth - 30) / data[selectCategory].body.length) + 'px',
                            }} onClick={() => {
                                setSelectView(el.id)
                            }}>
                                <div>
                                    {el.view}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ProductListSelector;