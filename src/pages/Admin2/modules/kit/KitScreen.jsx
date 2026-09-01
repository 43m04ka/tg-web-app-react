import React, {useState} from 'react';
import {usePageHeader} from '../../shell/pageHeader';
import HeaderActions from '../../shell/HeaderActions';
import {askConfirm, toast} from '../../platform/notify';
import {Button, ButtonRow, IconButton} from '../../ui/primitives/Button';
import {Field, Input, SearchInput, Select, Textarea, Toggle} from '../../ui/primitives/Field';
import {Badge, Chip, Count, Dot} from '../../ui/primitives/Badge';
import {Money, Mono, Stat, StatRow, Time} from '../../ui/primitives/Data';
import {Tabs} from '../../ui/primitives/Tabs';
import {EmptyState, ErrorState, Note, ProgressBar, Skeleton, SkeletonRows, Spinner} from '../../ui/primitives/Feedback';
import {Modal} from '../../ui/primitives/Modal';
import Icon from '../../shell/Icon';
import style from './KitScreen.module.scss';

const TONES = ['neutral', 'accent', 'positive', 'warning', 'danger', 'info'];

function Block({title, note = '', children}) {
    return (
        <section className={style.block}>
            <header className={style.blockHead}>
                <h2 className={style.blockTitle}>{title}</h2>
                {note ? <span className={style.blockNote}>{note}</span> : null}
            </header>
            <div className={style.blockBody}>{children}</div>
        </section>
    );
}

export default function KitScreen() {
    usePageHeader('Витрина компонентов', 'все состояния в текущей теме');

    const [text, setText] = useState('Тайм-код на 3 часа');
    const [search, setSearch] = useState('');
    const [toggle, setToggle] = useState(true);
    const [tab, setTab] = useState('all');
    const [chip, setChip] = useState('ps');
    const [modal, setModal] = useState(false);
    const [progress, setProgress] = useState(43);

    return (
        <div className={style.screen}>
            <HeaderActions>
                <Button size="s" variant="ghost" onClick={() => setProgress((value) => (value + 17) % 100)}>
                    Двинуть прогресс
                </Button>
                <Button size="s" variant="secondary" onClick={() => setModal(true)}>Модальное окно</Button>
            </HeaderActions>

            <Block title="Кнопки" note="варианты, размеры, состояния">
                <ButtonRow>
                    <Button variant="primary">Основная</Button>
                    <Button variant="secondary">Обычная</Button>
                    <Button variant="ghost">Прозрачная</Button>
                    <Button variant="danger">Опасная</Button>
                </ButtonRow>

                <ButtonRow>
                    <Button variant="primary" size="s">Мелкая</Button>
                    <Button variant="secondary" loading>Загрузка</Button>
                    <Button variant="secondary" disabled>Отключена</Button>
                    <Button variant="secondary" icon={<Icon name="tasks"/>}>С иконкой</Button>
                    <IconButton label="Иконка"><Icon name="settings"/></IconButton>
                    <IconButton label="Активная" active><Icon name="search"/></IconButton>
                </ButtonRow>
            </Block>

            <Block title="Поля" note="ввод, выбор, переключатели">
                <div className={style.grid}>
                    <Field label="Обычное поле" hint="Подсказка под полем">
                        <Input value={text} onChange={(event) => setText(event.target.value)}/>
                    </Field>

                    <Field label="Моноширинное" hint="для кодов и идентификаторов">
                        <Input mono value="EP0001-CUSA00001_00" readOnly/>
                    </Field>

                    <Field label="С ошибкой" error="Значение уже занято">
                        <Input invalid value="ps-tr-deals"/>
                    </Field>

                    <Field label="Отключено">
                        <Input value="Недоступно" disabled/>
                    </Field>

                    <Field label="Выбор">
                        <Select
                            options={[
                                {value: 'ps', title: 'PlayStation'},
                                {value: 'xbox', title: 'Xbox'},
                                {value: 'steam', title: 'Steam'},
                            ]}
                        />
                    </Field>

                    <Field label="Поиск">
                        <SearchInput value={search} onChange={setSearch} placeholder="Название товара"/>
                    </Field>
                </div>

                <Field label="Многострочное">
                    <Textarea defaultValue={'Текст рассылки\nвторая строка'}/>
                </Field>

                <Toggle checked={toggle} onChange={setToggle} label="Сообщить в Telegram"/>
            </Block>

            <Block title="Ярлыки и метки">
                <div className={style.row}>
                    {TONES.map((tone) => <Badge key={tone} tone={tone}>{tone}</Badge>)}
                    <Count value={12}/>
                </div>

                <div className={style.row}>
                    {TONES.map((tone) => (
                        <span key={tone} className={style.dotItem}>
                            <Dot tone={tone}/>
                            {tone}
                        </span>
                    ))}
                </div>

                <div className={style.row}>
                    <Chip active={chip === 'ps'} onClick={() => setChip('ps')}>PlayStation · 428</Chip>
                    <Chip active={chip === 'xbox'} onClick={() => setChip('xbox')}>Xbox · 117</Chip>
                    <Chip onRemove={() => toast({tone: 'info', title: 'Фильтр снят'})}>Со скидкой</Chip>
                </div>

                <Tabs
                    value={tab}
                    onChange={setTab}
                    items={[
                        {id: 'all', title: 'Все', count: 540},
                        {id: 'sale', title: 'Со скидкой', count: 96},
                        {id: 'hidden', title: 'Скрытые', count: 4},
                    ]}
                />
            </Block>

            <Block title="Данные" note="числа табличными цифрами">
                <StatRow>
                    <Stat label="Выручка за сутки" value={<Money value={128400}/>} note="+12% к вчерашнему"/>
                    <Stat label="Заказов" value="34" note="из них оплачено 29"/>
                    <Stat label="Без остатка" value="7" tone="danger" note="позиций в сервисах"/>
                </StatRow>

                <div className={style.row}>
                    <Money value={1290.5}/>
                    <Money value={0} tone="muted"/>
                    <Money value={null}/>
                    <Mono>EP0001-CUSA00001_00</Mono>
                    <Time value={Date.now()}/>
                </div>
            </Block>

            <Block title="Состояния" note="загрузка, пустота, ошибка, прогресс">
                <div className={style.row}>
                    <Spinner/>
                    <Skeleton width={160} height={14}/>
                    <span className={style.progressCell}><ProgressBar value={progress}/></span>
                    <span className={style.progressValue}>{progress}%</span>
                </div>

                <SkeletonRows count={3}/>

                <div className={style.grid}>
                    <EmptyState
                        title="Каталогов пока нет"
                        text="Каталог появляется после первого парса источника"
                        action={{title: 'Запустить парс', run: () => toast({tone: 'info', title: 'Это витрина'})}}
                    />
                    <ErrorState
                        error={{message: 'Коды забронированы', hint: 'Сервер отказал по состоянию данных'}}
                        onRetry={() => toast({tone: 'info', title: 'Повтор'})}
                    />
                </div>

                <Note tone="warning">Предупреждение спокойным тоном</Note>
                <Note tone="danger">Необратимое действие</Note>
            </Block>

            <Block title="Сообщения" note="тосты и подтверждения">
                <ButtonRow>
                    <Button variant="secondary" onClick={() => toast({tone: 'positive', title: 'Сохранено', text: '12 позиций обновлено'})}>
                        Успех
                    </Button>
                    <Button variant="secondary" onClick={() => toast({tone: 'warning', title: 'Часть позиций пропущена', text: 'У 3 карточек нет цены'})}>
                        Предупреждение
                    </Button>
                    <Button variant="secondary" onClick={() => toast({tone: 'danger', title: 'Не удалось сохранить', text: 'Сервер вернул 409'})}>
                        Ошибка
                    </Button>
                    <Button
                        variant="danger"
                        onClick={async () => {
                            const answer = await askConfirm({
                                title: 'Удалить 240 товаров каталога ps-tr-deals?',
                                text: 'Карточки исчезнут из витрины сразу.',
                                consequence: 'Действие необратимо: восстановить можно только повторным парсом источника.',
                                confirmText: 'Удалить',
                                tone: 'danger',
                            });

                            toast({
                                tone: answer ? 'danger' : 'info',
                                title: answer ? 'Подтверждено' : 'Отменено',
                            });
                        }}
                    >
                        Подтверждение
                    </Button>
                </ButtonRow>
            </Block>

            {modal ? (
                <Modal
                    title="Модальное окно"
                    subtitle="слой поверх рабочей области"
                    onClose={() => setModal(false)}
                    footer={<Button variant="primary" onClick={() => setModal(false)}>Понятно</Button>}
                >
                    <p className={style.modalText}>
                        Окно закрывается по Esc и по клику мимо. Внутри работает обычная вёрстка,
                        полосы прокрутки появляются только у содержимого.
                    </p>
                </Modal>
            ) : null}
        </div>
    );
}
