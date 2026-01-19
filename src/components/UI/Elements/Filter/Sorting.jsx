import React from 'react';
import style from './SortingFilter.module.scss'
import {useTelegram} from "../../../../hooks/useTelegram";


const parameters = [
    {
        type: 'sorting',
        name: 'По умолчанию',
        parameter: 'default',
        image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAACXBIWXMAAAsTAAALEwEAmpwYAAABwklEQVR4nO3dTUoDURBF4bcBf8CFqGsJrkxFsxQVN6CQ2oUOomu4oSFvJM4CfavqHHgQMurOB52m60GPQURERERERER0kiSdSXqU9H1cD8t3ax9XyyRdSvrU30LS1drH1yr9jwGKIcYMFCOMGShGGDNQjDBmoBhhzEAxwpiBYoQxA8UIYwaKEcYMFCOMGShGGDNQjDBmoBhhzEAxwpj1RTHE6ItijNEPJQFGH5REGPVREmLURUmMUQ+lAEYdlEIY+VEKYuRFKYyRD0XSuaSd6rdbznW4J2mrPj0P9yT9qk/74Z6kH/VpP9zjkmWWpAtJr6rfS4o/9Zmka0kbSXfF1mY5t7V/XyIiIiIiIiIiorJJui38cPFmJNvg8K76vS2jhuFeswHVdrjHTN0sZupmLXNm9elpuMdGOd87rQ/VLdJsJW2AEukwCqNEWoyCKJEeoxBKlMEogBLlMBKjRFmMhChRHiMRSrTBSIAS7TCMUaIthiFKtMcwQgkwfFACDB+UAMMHJcDwQQkwfFACDB+UAMMHJcDwQQkwfFACDB+UAMMHJcDwQQkwfFACjHVf330v6eu4ls+8vpuIiIiIiIiIxmk6AGUQB2heUhIKAAAAAElFTkSuQmCC'
    },
    {
        type: 'sorting',
        name: 'Сначала дешевле',
        parameter: 'priceDown',
        image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAACXBIWXMAAAsTAAALEwEAmpwYAAADsklEQVR4nO3dT2tcVRjH8dMiLcRiwW5ctLSlCO7FTYyQ1G5sJU1B0bfgxvpnkS4LRhfqKt1JaQsmFgN5EaW2gVJt34ALN7oRRdqoBZuvHJjAOGTmnnvuufc+z/j7wF2VGe6Zb+7M7ZlzkhBEREREREREREREugQ8C3wErAEbQ8dV4FyYAsCLwJfATeBD4GCwCDgEPGSyz4JjwCvA45Ex3QMOBGuAS1TbAU4Fp4BbY8b1XrAG2CTNO8EpYHvMmK4Ha4AriUHmglOMtxGsAV6a8BO06y6wLziFpyARMAvcAf4eOeHf42UNPB8cw1uQaYeC2KIgxqAgtiiIMSiILS6DACeA88DbCcdbg/khF/83wVuQOHkIPKW+74AjwTg8BQEu0Mx6MA5nQb5pGOQvYH8wDGdB1hXEEGCpYRC9ZZUGfJr5oX5bH+otAY4BizVue18OTuAxyDRDQWxREGNQEFsUxBgUxBZ3QYBXgS3gCc09GaxSmQ1GTOMyoBzb8bmDAd6CpC6Uy7EaDPAWJHUpaY7NYIC3ICmLrXMtBwO8BYnbER60EOP7+NzBAFdBhjbsfAB8PbJhJ+eIz3ERmAlGuAsy7VAQWxTEGBTEFgUxBgWxxV2QCfvUmx7fAp/HPeI9j89PkMR96iUmGud6HKOrIG1OnQy73+MYXQVpc3JxWFz39UxPY3QVpM3p92E/9zhGV0Ha+oJq1Mc9jtFPkIp96k3tAD8C7/e5ucddkGmHgtiiIMagILYoiDEoiC3/h33qJY5F4HjmuT4HvAmcjhOjbQYBTgLvAvOd7aVssE+9qafASs1zPQP8NvQcP8WlsBWPyQoCXB55XX4AXgjG96mXsJR4roeBX/d4fJxpmJ/wuNpBgC96WfxXYJ96CWuJ5xrfpsaJURbGPK5WkAkxdheT77e8T73LIG9UPM+eUeoEqYgR/dl2kKb71Lt8y5oBfqkbJTVIQozoWukGJfepN/UP8EnNc30tYXb6P1FSgiTGiB/qh0u//iX2qZe67T2aea7zdaJUBakRw/VvZ21V/I4eeJQQ5fVJQQa3/FUeePiNFb0j/UrJ+bddujJauFJy6cowFEUxDEVRjBIGt8SP3McovE+9hD+AGzkvTLzVbbCKpv8P8A6XAeXYylmtkhml/xgdL5TLlbUmuGYUGzE6XkqaK/tPLSVGsROj48XWORr/MbKKKLZitLxPvYSVQmNcGEybD3toLkZL+9RLHF8BZ1u4eVkdvEUvp3wXLyIiIiIiIiIiIhL68C/z/1Ddl3FiDQAAAABJRU5ErkJggg=='
    },
    {
        type: 'sorting',
        name: 'Сначала дороже',
        parameter: 'priceUp',
        image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAACXBIWXMAAAsTAAALEwEAmpwYAAADkElEQVR4nO2dS2sUQRRGyyAKRgzoxoWiooJ7caFGiI+ND3QERf+CK1+LuBR8IOhG3Ymo4EQxkB8hPgIiJv9AXLkRRRJfYDxSpIUxZGZ6MtVVtybfgVkFivpyUt2Vmnu7nRNCCCGEEEIIIYQQQoiYAP3ABaAOjBr43AcOB864FbgFPAXOA8udRYCVwCQ2uR4o4w5ges7Yb4BlzhrAJezyB9gcIOPzJuOfcdYAxrDNqQAZvzUZ+6GzBnAX2wwGyNiMUWcNYFuLv6DUvAaWBMiYjxAPsAt4BfzEBl/85QRYHShfXkJ6HSTEFhJiDCTEFhJiDCTEFlkKATYCx4CTkT5HgQ2RsuUlxB/iATPEZwa4GiFfPkKA46SnVnHGrIQ8IT31ijNmJWSE9NQrzpiVkBrpqVWcMR8hHuBaopv6b+BKhHx5CfEA64utaMxt77pI2fIT0ssgIbaQEGMgIbaQEGMgIbbITgiwGxgHfhG+0O09cDZE9ciiEBKxDOhiwoxZCYlVKPcxYcashMQqJZ0BlibKmJWQWMXWbxNmzEqIb0eYqFjGtN84JMyYj5CGhp1zwOPAjTfPgBvAlsT58hLS6yAhtpAQYyAhtpAQYyAhtshOSOA+9XrRB97vjJCVkAr71Cf82M4AuQmp8uhk2BkgNyFVHi6OOQPkJqTK4/fbzgC5CanqC6ppP7YzQFZCKuhT92O8BHY6I2QnpNdBQmwhIcZAQmwhIcZAQmyxGPrUTxTPMUxSjQisAo4A+8ocYnYjBNgEnAaGgL5gISrqU/f/b6yJMskC4ADwuWEOH9pVtCxUCHB5zu/lHbDWGe9TH6l0gg0AA8CneebgTxqGQgoBbiY5nwvQp/4j1lJm9jLVDC9lbwghLWRQFKT3We5TjynkYJu5zCulEyFtZHi+Vy2kltEla4Uv2u5USlkhJWR4HljuU3+R4Ka+p8Tp9H9SyggpKcPf1Acs9qn7be/2KBObh2ILWlpKOyEdyAjylNSeBBgEpkpI2d9KSLHlL1MfEPVKkCWUXykL+dk/tDIqWCkLRSvDkBTJMCRFMgJuiaeyl9GiT/0r8Cj5BDvAb3W7qKJJfwMvWQY0nrLxP5KU9DI6LJTr+sUqhqXYkNFhKWnXrx4yKsWOjA6KrYO8nMugFFsyOuhTr/zp0xGk+GPzRibNySjRp34POOR6AGY3L3eKS/SwpYYiIYQQQgghhBBCCCGEcI38BaEoUNyWq4MnAAAAAElFTkSuQmCC'
    },
    {
        type: 'sorting',
        name: 'По алфавиту',
        parameter: 'alphabet',
        image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAACXBIWXMAAAsTAAALEwEAmpwYAAAEmElEQVR4nO2dbcieUxzA/15mjHlCoY0Q856SfNqWZ4zyUsi0JZJJmbdaaSb0yAcJ+aD2hRrlAz0iIdGamSTDNkm++LQPmsTImLdtPx271N3dfV6u233u8z/X8//V+XSf69z///O7r/+5Xs8jYhiGYRiGYRiGYRiGYRiGoQVgHjCd0JaKYoAFwNPAy8BqYLbUCHAfabwuSgEuBn7ti/dT4DCpDeCjRCF7gLmiEGCzJ+ZVUhPAScA+0rlJFAL85on3BamJpta24Q1RCH6mpSaAj1sK+QOYEGXQBSHAycB+2nOLKIOOCFkd2AvuDiT5piiDjgj5xJPEu8CxwF7P538Cx4giqhcSKVf3Jswvt4oiuiDk/kASZzR9Hgn0eVsU0QUhWzwJfN3T56JAon+5siZKqFoIcGqgXD3Z0+8g4NtAsreJEmoXsiaQwCV9fdcH+r4jSqhdyGee4H8GZvX1vTFSto4TBVQrBDgtUK5eGdD/6OYP7+N2UUDNQta2PQMHPghs854ooGYhWz2Buyu+x3u2eSCQ8N++7cZJlUKA0wOB/w5s8LRthLlDQW5VCnmQPGxQkFuVQmK/9GHZW7psVSckUq5GwZ2F86tOyEOZhWwsnF91QrYHgv4qMKH3NnfiGCpbJxTMrx4hwJmRX/f5ieM8FxnnrvzZdENI6DL6jhbjXB8RsilvJt0R8mUg4HUtxpnb3C0kcHI5L282lQsBzor8qq9qOd6myHj35MumG0KmIk8izmk5XugyimNzvmyCcVUjxB1B+XhriPEuIMw+YH6ebCoXAhza3M/wtfOGGNPdRbwhMu78PBlVLmQmgQnRhQlRBiZEFyZEGZgQXZgQZWBCdGFClIEJ0YUJUQYmRBdVCgGujVwU/D9tVuHcqhSyi3xMFM7NhPRhQtpiQpRhQmaOkJ+AwwvnVqWQ94HPW7YvIjL2A9cpyK0+IcMALIsIeUYUMCOEAKcAPwaS3aJlxbbOC3HrFTYly8cu9767KGEmCFkXmTeuzvz97u3fa4BLgSNzCmneTF4BTAIHizaA5YR5IvP3L+07ItwBLMwhBHi0b4lD95bZiaLs1YVfAgl+6B7Ay/j9E8APA77Xrak4OUohwFOebV4TDQBHRA5zv8/9VCIHypQPJ2XJKIQEZNA84V++dAHPB4J0u/UVY4jhykAMXilthERk/PcQelkhwM2RIB8bUxxzgJ1tpaQKSZDhWC8lAc4ZsCp0L+4M/5AxxrM4sA7vQCkpQhJlbCt6XS5h3viuxFtRwCJgd4KUy1KEAI8nyNhefHUj4MXIvHF5wdgWpUoJCalJxspIkA8XDVD+jXEysXwN81lvmSq7XKF7FToS7MZxzhsj2FOGRcWecZRb7DIQ5E5VZ6uSTUp5GU1yL0XWv1osCmG0UtTIWBUJdI0ohgOHxLu7IuPCZqGy0FHV2ubV57Zt4RjzWJI4WeucwHvmjW/Ix9SY8xlGig4ZDuBc8jKlvHzpKFNdFtJCii4ZXRaSIEWfjK4L6ZlT9gyQoWPO8Pw3tumMbZmCHM8GngVebda3j96LNwzDMAzDMAzDMAzDMAzDkBL8AwsPhD454RhRAAAAAElFTkSuQmCC'
    },
]

const Sorting = ({onClose, json, setJson, setIcon}) => {

    const {tg} = useTelegram()

    const [selected, setSelected] = React.useState(parameters.map((el, index) => {
        return el.parameter === json.sorting ? index : null
    }).filter(el => el !== null)[0])

    return (
        <div className={style['container']} style={{height: String(window.innerHeight) + 'px', marginTop: String(- tg?.contentSafeAreaInset.top - tg?.safeAreaInset.top) + 'px',}}>
            <div>
                <div onClick={onClose}/>
                <div style={{bottom:'23vw'}}>
                    <div className={style['title']}>
                        Сортировка
                    </div>
                    {parameters.map((param, index) => (
                        <>
                            <div key={index} onClick={() => {
                                setSelected(index)
                                let newJson = json
                                newJson.sorting = param.parameter
                                setJson(newJson)
                                setIcon(param.image)
                                onClose()
                            }}>
                                <div style={{backgroundImage: `url(${param.image})`}}/>
                                <p>
                                    {param.name}
                                </p>
                                {index === selected ? (<div className={style['selected']}/>) : ''}
                            </div>
                            {index < parameters.length - 1 ? (<div className={style['separator']}/>) : ''}
                        </>
                    ))}
                </div>
                <button onClick={onClose}>
                    Закрыть
                </button>
            </div>
        </div>);
};

export default Sorting;