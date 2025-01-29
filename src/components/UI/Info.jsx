import React, {useCallback, useEffect} from 'react';
import {useTelegram} from "../../hooks/useTelegram";
import {useNavigate} from "react-router-dom";

const Info = () => {
    const {tg} = useTelegram();
    const navigate = useNavigate();

    const onBack = useCallback(() => {
        navigate(-1);
    }, [])

    useEffect(() => {
        tg.BackButton.show();
    }, [])

    useEffect(() => {
        tg.onEvent('backButtonClicked', onBack)
        return () => {
            tg.offEvent('backButtonClicked', onBack)
        }
    }, [onBack])

    return (
        <div>
            <div style={{background: '#454545', borderRadius: '7px', margin: '15px'}}>
                <div style={{
                    marginLeft: '3px',
                    marginRight: '3px',
                    borderBottom: '1px solid gray',
                    display: "flex",
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <div style={{
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                    }}>
                        <div className={'background-loveInfo'} style={{
                            width: '30px',
                            height: '30px',
                            borderRadius: '7px',
                            marginLeft: '4px',
                            marginTop: '5px',
                            marginBottom: '5px'
                        }}>
                        </div>
                        <div className={'text-element'} style={{fontSize: '15px', marginLeft: '15px'}}>
                            Избранное
                        </div>
                    </div>
                    <div className={'background-arrowGray'}
                         style={{width: '20px', height: '20px', marginRight: '5px'}}/>
                </div>
                <div style={{
                    marginLeft: '3px',
                    marginRight: '3px',
                    display: "flex",
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <div style={{
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                    }}>
                        <div className={'background-basketInfo'} style={{
                            width: '30px',
                            height: '30px',
                            borderRadius: '7px',
                            marginLeft: '4px',
                            marginTop: '5px',
                            marginBottom: '5px'
                        }}>
                        </div>
                        <div className={'text-element'} style={{fontSize: '15px', marginLeft: '15px'}}>
                            Мои покупки
                        </div>
                    </div>
                    <div className={'background-arrowGray'}
                         style={{width: '20px', height: '20px', marginRight: '5px'}}/>
                </div>
            </div>

            <div className={'text-element'} style={{color: 'gray', fontSize: '9px', textAlign: 'center'}}>
                Добавьте данные от своего аккаунта, что бы бот оформлял заказы быстрее
            </div>

            <div style={{background: '#454545', borderRadius: '7px', margin: '15px'}}>
                <div style={{
                    marginLeft: '3px',
                    marginRight: '3px',
                    borderBottom: '1px solid gray',
                    display: "flex",
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <div style={{
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                    }}>
                        <div className={'background-psInfo'} style={{
                            width: '30px',
                            height: '30px',
                            borderRadius: '7px',
                            marginLeft: '4px',
                            marginTop: '5px',
                            marginBottom: '5px'
                        }}>
                        </div>
                        <div className={'text-element'} style={{fontSize: '15px', marginLeft: '15px'}}>
                            Мой аккаунт PlayStation
                        </div>
                    </div>
                    <div className={'background-arrowGray'}
                         style={{width: '20px', height: '20px', marginRight: '5px'}}/>
                </div>
                <div style={{
                    marginLeft: '3px',
                    marginRight: '3px',
                    display: "flex",
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <div style={{
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                    }}>
                        <div className={'background-xbInfo'} style={{
                            width: '30px',
                            height: '30px',
                            borderRadius: '7px',
                            marginLeft: '4px',
                            marginTop: '5px',
                            marginBottom: '5px'
                        }}>
                        </div>
                        <div className={'text-element'} style={{fontSize: '15px', marginLeft: '15px'}}>
                            Мой аккаунт Xbox
                        </div>
                    </div>
                    <div className={'background-arrowGray'}
                         style={{width: '20px', height: '20px', marginRight: '5px'}}/>
                </div>
            </div>

            <div className={'text-element'} style={{color: 'gray', fontSize: '9px', textAlign: 'center'}}>
                Наши социальные сети с интересными новостями и розыгрышами
            </div>

            <div style={{background: '#454545', borderRadius: '7px', margin: '15px'}}>
                <a style={{textDecoration: 'none'}}
                   href={'https://t.me/gameworld_ps'}>
                    <div style={{
                        marginLeft: '3px',
                        marginRight: '3px',
                        borderBottom: '1px solid gray',
                        display: "flex",
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <div style={{
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'center',
                        }}>
                            <div className={'background-tgInfo'} style={{
                                width: '30px',
                                height: '30px',
                                borderRadius: '7px',
                                marginLeft: '4px',
                                marginTop: '5px',
                                marginBottom: '5px'
                            }}>
                            </div>
                            <div className={'text-element'} style={{fontSize: '15px', marginLeft: '15px'}}>
                                Канал Telegram для PlayStation
                            </div>
                        </div>
                        <div className={'background-arrowGray'}
                             style={{width: '20px', height: '20px', marginRight: '5px'}}/>
                    </div>
                </a>
                <a style={{textDecoration: 'none'}}
                   href={'https://t.me/gameworld_xbox'}>
                    <div style={{
                        marginLeft: '3px',
                        marginRight: '3px',
                        borderBottom: '1px solid gray',
                        display: "flex",
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <div style={{
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'center',
                        }}>
                            <div className={'background-tgInfo'} style={{
                                width: '30px',
                                height: '30px',
                                borderRadius: '7px',
                                marginLeft: '4px',
                                marginTop: '5px',
                                marginBottom: '5px'
                            }}>
                            </div>
                            <div className={'text-element'} style={{fontSize: '15px', marginLeft: '15px'}}>
                                Канал Telegram для Xbox
                            </div>
                        </div>
                        <div className={'background-arrowGray'}
                             style={{width: '20px', height: '20px', marginRight: '5px'}}/>
                    </div>
                </a>
                <a style={{textDecoration: 'none'}}
                   href={'https://vk.com/gameworld.playstation'}>
                    <div style={{
                        marginLeft: '3px',
                        marginRight: '3px',
                        display: "flex",
                        flexDirection: 'row',
                        borderBottom: '1px solid gray',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <div style={{
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'center',
                        }}>
                            <div className={'background-vkInfo'} style={{
                                width: '30px',
                                height: '30px',
                                borderRadius: '7px',
                                marginLeft: '4px',
                                marginTop: '5px',
                                marginBottom: '5px'
                            }}>
                            </div>
                            <div className={'text-element'} style={{fontSize: '15px', marginLeft: '15px'}}>
                                Группа ВК для PlayStation
                            </div>
                        </div>
                        <div className={'background-arrowGray'}
                             style={{width: '20px', height: '20px', marginRight: '5px'}}/>
                    </div>
                </a>
                <a style={{textDecoration: 'none'}}
                   href={'https://vk.com/gameworld.xbox'}>

                    <div style={{
                        marginLeft: '3px',
                        marginRight: '3px',
                        display: "flex",
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <div style={{
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'center',
                        }}>
                            <div className={'background-vkInfo'} style={{
                                width: '30px',
                                height: '30px',
                                borderRadius: '7px',
                                marginLeft: '4px',
                                marginTop: '5px',
                                marginBottom: '5px'
                            }}>
                            </div>
                            <div className={'text-element'} style={{fontSize: '15px', marginLeft: '15px'}}>
                                Группа ВК для xbox
                            </div>
                        </div>
                        <div className={'background-arrowGray'}
                             style={{width: '20px', height: '20px', marginRight: '5px'}}/>
                    </div>
                </a>
            </div>

            <div style={{background: '#454545', borderRadius: '7px', margin: '15px'}}>
                <a style={{textDecoration: 'none'}}
                   href={'https://t.me/gwstore_faq/11'}>
                    <div style={{
                        marginLeft: '3px',
                        marginRight: '3px',
                        borderBottom: '1px solid gray',
                        display: "flex",
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <div style={{
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'center',
                        }}>
                            <div className={'background-pzInfo'} style={{
                                width: '30px',
                                height: '30px',
                                borderRadius: '7px',
                                marginLeft: '4px',
                                marginTop: '5px',
                                marginBottom: '5px'
                            }}>
                            </div>
                            <div className={'text-element'} style={{fontSize: '15px', marginLeft: '15px'}}>
                                Пользовательское соглашение
                            </div>
                        </div>
                        <div className={'background-arrowGray'}
                             style={{width: '20px', height: '20px', marginRight: '5px'}}/>
                    </div>
                </a>
                    <a style={{textDecoration: 'none'}}
                       href={'https://t.me/gwstore_admin'}>
                        <div style={{
                            marginLeft: '3px',
                            marginRight: '3px',
                            display: "flex",
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <div style={{
                                display: 'flex',
                                flexDirection: 'row',
                                alignItems: 'center',
                            }}>
                                <div className={'background-pkInfo'} style={{
                                    width: '30px',
                                    height: '30px',
                                    borderRadius: '7px',
                                    marginLeft: '4px',
                                    marginTop: '5px',
                                    marginBottom: '5px'
                                }}>
                                </div>
                                <div className={'text-element'} style={{fontSize: '15px', marginLeft: '15px'}}>
                                    Политика конфиденциальности
                                </div>
                            </div>
                            <div className={'background-arrowGray'}
                                 style={{width: '20px', height: '20px', marginRight: '5px'}}/>
                        </div>
                    </a>
            </div>

            <div style={{background: '#454545', borderRadius: '7px', margin: '15px'}}>
            <a style={{textDecoration: 'none'}}
                   href={'https://t.me/gwstore_faq/12'}>
                    <div style={{
                        marginLeft: '3px',
                        marginRight: '3px',
                        borderBottom: '1px solid gray',
                        display: "flex",
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <div style={{
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'center',
                        }}>
                            <div className={'background-supportInfo'} style={{
                                width: '30px',
                                height: '30px',
                                borderRadius: '7px',
                                marginLeft: '4px',
                                marginTop: '5px',
                                marginBottom: '5px'
                            }}>
                            </div>
                            <div className={'text-element'} style={{fontSize: '15px', marginLeft: '15px'}}>
                                Поддержка бота в Telegram
                            </div>
                        </div>
                        <div className={'background-arrowGray'}
                             style={{width: '20px', height: '20px', marginRight: '5px'}}/>
                    </div>
                </a>
                <a style={{textDecoration: 'none'}}
                   href={'https://t.me/gwstore_admin'}>
                    <div style={{
                        marginLeft: '3px',
                        marginRight: '3px',
                        display: "flex",
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <div style={{
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'center',
                        }}>
                            <div className={'background-ideaInfo'} style={{
                                width: '30px',
                                height: '30px',
                                borderRadius: '7px',
                                marginLeft: '4px',
                                marginTop: '5px',
                                marginBottom: '5px'
                            }}>
                            </div>
                            <div className={'text-element'} style={{fontSize: '13px', marginLeft: '15px'}}>
                                Предложить идею для улучшения бота
                            </div>
                        </div>
                        <div className={'background-arrowGray'}
                             style={{width: '20px', height: '20px', marginRight: '5px'}}/>
                    </div>
                </a>
            </div>



            <div style={{margin: '15px'}}><a className={'link-element text-element'}
                                             href={'https://t.me/gwstore_faq/10'}>Инструкции для PlayStation</a>
            </div>

            <div style={{margin: '15px'}}><a className={'link-element text-element'}
                                             href={'https://t.me/gwstore_faq/9'}>Инструкции для Xbox</a>
            </div>

        </div>
    );
};

export default Info;