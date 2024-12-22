import React from 'react';

const Info = () => {
    return (
        <div>
            <div style={{margin: '15px'}}><a className={'link-element text-element'}
                                             href={'https://t.me/gwstore_admin'}>Связь с администратором -
                @gwstore_admin</a>
            </div>

            <div style={{margin: '15px'}}><a className={'link-element text-element'}
                                             href={'https://gwstore.su/privacy'}>Пользовательское соглашение</a>
            </div>

            <div style={{margin: '15px'}}><a className={'link-element text-element'}
                                             href={'https://t.me/gameworld_ps'}>Канал в Telegram для PlayStation</a>
            </div>

            <div style={{margin: '15px'}}><a className={'link-element text-element'}
                                             href={'https://t.me/gameworld_xbox'}>Канал в Telegram для Xbox</a>
            </div>

            <div style={{margin: '15px'}}><a className={'link-element text-element'}
                                             href={'https://vk.com/gameworld.playstation'}>Группа ВК для PlayStation</a>
            </div>

            <div style={{margin: '15px'}}><a className={'link-element text-element'}
                                             href={'https://vk.com/gameworld.xbox'}>Группа ВК для Xbox</a>
            </div>

        </div>
    );
};

export default Info;