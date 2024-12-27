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

    let cordCategory = (window.innerWidth - 7 - 7 - 2 - 2) / data.length * selectCategory + 1.5
    let cordView = (window.innerWidth - 7 - 7 - 2 - 2) / data[selectCategory].body.length * selectView + 1.5

    let url = data[selectCategory].body[selectView].img

    console.log(data);
    return (
        <div>
            <div style={{
                background: '#565656', borderRadius: '7px', marginLeft: '7px',
                marginRight: '7px',
                width: String(window.innerWidth - 14) + 'px',
                marginTop: '7px'
            }}>
                <img src={url} className={'img_wrap'} style={{borderTopRightRadius:'7px', borderTopLeftRadius:'7px'}}/>
                <div style={{
                    display: 'grid',
                    alignItems: 'center',
                    width: String(window.innerWidth - 14) + 'px',
                    border: '1px gray solid',
                    borderRadius: '7px',
                    marginBottom: '7px'
                }}>
                    <div style={{
                        background: '#414BE0FF',
                        width: String(((window.innerWidth - 7 - 7 - 2 - 2) - (data.length - 1) * 2) / data.length) + 'px',
                        height: '25px',
                        marginTop: '2px',
                        marginBottom: '2px',
                        borderRadius: '5px',
                        position: 'relative',
                        marginLeft: String(cordCategory) + 'px',
                        transitionProperty: 'margin-left',
                        transitionDuration: '0.2s',
                    }}></div>

                    {data.map(el => (
                        <div key={el.id} style={{
                            position: 'absolute',
                            marginLeft: String((el.id) * (window.innerWidth - 14) / data.length) + 'px',
                            width: String((window.innerWidth - 24) / data.length) + 'px',
                            height: '30px'
                        }}>
                            <div style={{
                                justifyContent: 'center',
                                alignItems: 'center',
                                display: 'flex',
                                height: '30px',
                                overflow: 'hidden',
                            }} onClick={() => {
                                setSelectCategory(el.id)
                                setSelectView(0)
                            }}>
                                <div>
                                    {el.title}
                                </div>

                            </div>
                        </div>
                    ))}
                </div>
                <div style={{
                    display: 'grid',
                    alignItems: 'center',
                    width: String(window.innerWidth - 14) + 'px',
                    border: '1px gray solid',
                    borderRadius: '7px',
                }}>
                    <div style={{
                        background: '#414BE0FF',
                        width: String(((window.innerWidth - 7 - 7 - 2 - 2) - (data[selectCategory].body.length - 1) * 2) / data[selectCategory].body.length) + 'px',
                        height: '55px',
                        borderRadius: '5px',
                        marginTop: '2px',
                        marginBottom: '2px',
                        marginRight: '2px',
                        position: 'relative',
                        marginLeft: String(cordView) + 'px',
                        transitionProperty: 'margin-left',
                        transitionDuration: '0.2s',
                    }}></div>
                    {data[selectCategory].body.map(el => (
                        <div key={el.id} style={{
                            position: 'absolute',
                            marginLeft: String(((el.id - 1) % 3) * (window.innerWidth - 14) / data[selectCategory].body.length + 'px'),
                            width: String((window.innerWidth - 24) / data[selectCategory].body.length) + 'px',
                            height: '60px'
                        }}>
                            <div style={{
                                justifyContent: 'center',
                                alignItems: 'center',
                                display: 'flex',
                                height: '60px',
                                overflow: 'hidden',
                                width: String((window.innerWidth - 24) / data[selectCategory].body.length) + 'px',
                            }} onClick={() => {
                                setSelectView(((el.id - 1) % 3))
                            }}>
                                <div style={{
                                    color: 'white',
                                    fontSize: '10px',
                                    height: '50px',
                                    display: 'grid',
                                    gridTemplateRows: '1fr 1fr',
                                    justifyItems: 'center',
                                    alignItems: 'center'
                                }}>
                                    <div>{el.view}</div>
                                    <div>{el.price}</div>
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