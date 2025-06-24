import React from 'react';

const ApNavigationPanel = ({setPage: setPageGlobal}) => {

    const label_buttons = ['Загрузить новые данные', 'Редактировать каталоги', 'Редактировать карты', 'Редактировать структуру', 'Промокоды', 'История заказов', 'Кубик']
    const [page, setPage] = React.useState(0);
    return (
        <div>
            {label_buttons.map((label, index) => {
                let this_button_style = {margin: '5px', borderRadius: '100px', padding: '5px', border: '0px'}
                if(page === index) {
                    this_button_style.background = '#ef7474'
                }
                return(<button onClick={() => {setPage(index); setPageGlobal(index)}} style={this_button_style}>{label}</button>)
            })}

        </div>
    );
};

export default ApNavigationPanel;