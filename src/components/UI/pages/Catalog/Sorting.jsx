import React from 'react';
import style from './SortingFilter.module.scss'


const parameters = [
    {
        type: 'sorting',
        name: 'По умолчанию',
        parameter: 'default',
        image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAACXBIWXMAAAsTAAALEwEAmpwYAAACjUlEQVR4nO3dR24UQRSH8bciCAEmR2PSFRBwJ0AI7mLBCZAQG4JkjmDA5OBAnDmDkYDNh0qalkwS4GlPvffq/5N65U2Xv03PTNVrMxEREREREREREZkI4DxwdXSdq30/zQJ2Avf41d3yt9r312KMef7sMbC79n02AZgCHvB3T4A9te83Nf49hqJMKMZD/t9TRekZsAt4tI4Ya6Psrb2OFBg/RueZoowJ2Ac8pz9vgIO11xU5xoseYyjKegH7NyhGZxE4VHudkWK83MAYiuIwRmcJOFx73S4BB4BXTJ6iOIrRWVaUH2O8pr5l4Ii1rDx+OonRWWk2CnAUeIs/H4Hj1hJg2mmM9qKMYrzDv0/ACcsMOBYkRv4ooxjviWcAnLRMAsdYG+WUZQDMAB+Ibxg+SqIY8aOUx8bR42M2Q+C0BfzWttx4VsOyRosCuEV+Ny0CYAfwjfy+AtvNu/LMTjtmzDtgE7BKfp+BzRYBcI38Zi3xHtxo5sMdeQC2AheBOWAhyTUHXAC21P7/ioiIiIiIRPlgeBm47+AD3UJPV1nLpbI2a/RcoFfla6EpiwK4Tn6zFkFDX7+vlrWad2WnH+2YNu/Kz5qjnzez+wJsswjKBgDyu2FRNLANaFDO0VskCXctpti9mC3KMGyMRDvfU+6Ajx5lkPWMSKTTU02coopyvjB/jEAncJs8iev1jHp7MX6a4lCGiXmz0vI0B43W8EbDZxxyMJ5pSeOZ6k+T6yiGoyiLmrtYfyJpRzEczOztaHavg6nWHcUYc3/XAv3R/PdxoWH8qd4d0tHrKvqGXujiD3rlUcg3tHX0prZJQa/Ncxvlzm9i3A43ZSET4CxwZXSdqX0/IiIiIiIiIiIi1ojv9aD4fOfUvPQAAAAASUVORK5CYII='
    },
    {
        type: 'sorting',
        name: 'Сначала дешевле',
        parameter: 'priceDown',
        image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAACXBIWXMAAAsTAAALEwEAmpwYAAADa0lEQVR4nO3cTYhNYRzH8YepwQbZmCIbNV6GxbDCwqSwYWJKFkjkbTElFkRRJGQla8WEMKURmrBTLGiwsfJWLBQLooxRxldPzkyMe91zz5x7zv859/eps7ud+zzne9/mzDmPcyIiIiIiIiIiIlIYwDLgSLS15T2eugVMAG7wr+vA+LzHV3eAM5R3Ou/x1eO7o/8/Qb6ae5cAs4B2YF2V2ypgmjMMaKayZmcBMBW4zegMAmf9K9EZBLTEmEOLhYE2AA9JT5cziICC+I+oNP0EZjpjCCjIMdK33hlDQEEO1CDIamcMAQWZH33MpOULMNEZQyhBPOBUSjF82M3OIEIK4gFbgKfAQIIQ/o+qe8BKZxShBSk6FMQWBTEGBbFFQYxBQWxREGNQEFsUxBgUxBYFMQYFsSW4IMA4oAPYB+zPYNsBNGU4v3CCAPOAl2RvANiW0RzDCBJdr/Sa/AwCSzOYZzBBNpK/ngzmGUyQ4+Tv+SgvY2oDNgGLgDFpB/H7BBZHz+GfqyHpeONMaA/5u59w7AuBVyP29bjUZUhJg/h9AU9GPM5/3y5IeswrTWoG8J18dSYYdxPwocz+3gGzRxvE7yPaVynv/RWfaTQoNbntwA/ycTPJRwBwuMJ+/4pSbZAKMYYcSrPDyAn6z8hLwCOgL4PtTvRCGJtwvD0xDvBwlGqCxIzhXUu7Q7CArhgHbDhK3CBVxPDO5X0czADWxjxoQ1H8WYhKOqqI4bXnfRzM4PdP0atVHLz+lB4z5Eq5n9h1C2iM7g/MWq+5u63qOEqvYtiJohiGoiiGoSiKYSiKYhiKohiGoiiGoSj5xwCm+7OXwEWg2+DWBewGJieI4s8ox+Uf21i7Ix1v0CuAz4ThLTC3RlFMxJgCfCIsz6o9bR8jSv4xooHuIkxLEsy1scxp+/MmYnjACcK0YRRzbo2uJfBbq7ME2EmdvEOCEH2HfKTg3yFBAZYH9CvrDTDHFZ1fEQ44CFww8DdHd4nNf/F2ApPyPlYiIiIiIiIiIiLyB///BeByhndQ9WWw3Y1WjKjdXbO1EA3a38BfVLeCiWLkLlyTd/rmAthLfXjgQmBkJQfTq0XU41onhVhPpSirARVmxaHURPdnv6CYvgFbXWiiq/rWRBc6nCzAdtQvjlaz9UhERERERERERERcsfwCAUkIIMPNItMAAAAASUVORK5CYII='
    },
    {
        type: 'sorting',
        name: 'Сначала дороже',
        parameter: 'priceUp',
        image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAACXBIWXMAAAsTAAALEwEAmpwYAAADW0lEQVR4nO3cTYhOURzH8ctoULKwQJGNGmqIYeVlMabGcmJiFjILCy9bhCiihCZvWcnGe15KZEpqLMlLXrKyGCwsFAtSTBTz1cmdKdO83PvMfc75nzu/T93ddOee82XmztM5J0lERERERERERERERERkSMA8oAVYX4JrHbAcmJDEBpgB3KecPgCrklgANcBTyu0HUJ/EIP0RNRZcSmIAHGZseJPEANjL2PA8iQGwEOil/A4msQA6KLfXwJQkJsAm4BXwk3LoTV95TwJTQ8+viIiIiIiIiIhIaQETgVZgN7DH4LUTaAbGFzDWJuBQejUm1gALgLfE4REwvcJxTgbuDnLPO8CkxIL0Id8TlwcVjvXMMPc8nVgAbCROiyv4h9czwsqU8P9LgCPEaUPOcdZluGdd9WY6+4NuJ07NOcdZn+Ge4dduAXOAX8TlI1BbyiAOsBn4TRy+V7I0NKogTrow+SrwzK1hMng9Bs66BeEVji+uIGWHgtiiIMagILYoiDEoiC0KYgwKYouCGIOC2KIgxqAgtkQXBJgN7AeuADc9XKeAlR7HF08QYDXwjTCOexpjHEGAacBXwmrzMM5ogmwjvC4P44wmyFHC6/YwzmiCbCW8Lg/jjOp3yBfCavMwzjiCOOma2VBvWR2exhhPEAeYBewDLnv4G+QGcMItrCjovK9GoB1YBowrOoi7Z7oIpD39XjWjfe5SApYC7wZM6gtgblFB3L2AlwO+zi1MX+JtoDEAZgKfh1lIN3+0Qdw90nsN5pM7GtH7wK0CDowwuf9FyRtkhBh99gebAGuA2xkmuD9KniAZYzi3Qs+DGcDFDBPWHyVrkBwxnPOh58EMYG3GSeuL4rbrjaQ1RwynJfQ8mMG/V1H3+pxVT0Ff0+f6UK/YYxZQm+4P9O2eid1WFuE/imIYiqIYhqIohqEo/mMAK4BrFe6gegKcG/hxRcAonQXG6My7n7GIQWwB/hS0/6/J68NXN0qQGEXvws29Q9ZoFP8x0gffQeA95AajhIlRxZMccp2yYCxKuBhVPOtkUWII2aOEjVGl04AqOqnHQJTwMfqkHzt3FxDjYaVnWXmMMtjH9hfMxBjwsGvShQ7Hcl670lPaovj0E2hID91xV0Po5xEREREREREREUkM+AuSSAFGPepUogAAAABJRU5ErkJggg=='
    },
    {
        type: 'sorting',
        name: 'По алфавиту',
        parameter: 'alphabet',
        image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAACXBIWXMAAAsTAAALEwEAmpwYAAAE1klEQVR4nO2dfehfUxzHr4eNeRoyNA8hfqaIVhJpKVJjIVH8QbZlElKyppWSZcnDFkrkL9TPrISRNGF/WR7KEInI7w/SPC4P+y22lz6cb339+p5zz73fc859OJ9X3b++93vv+5xX997vPU/folAURVEURVEURVEURVEUpVMA+wHXAvcBq4AFTWfKFuAk4HP+z9/A6qazZQewN/Ahdi5vOmNWABfg5s0iF4CFwBJgXoMZVpQI+bboO8CBwOtDhd4J3NBQlltKhGwv+g6wdkTBd8nDtYEseQsB5gA/WQr/UAN5shey1FH4n4EDEufJXsi7JRVwfeI8+QoBzqKcdxJnylrIU/ixMGGmPIUAc4HfPYU8kTBXtkJuw5/fgEMS5cpWyCdU4+ZEufITAiyiOp8mypalkElLYaWJ+xlHZZyfIFteQoAjgGlLYV8GjjdiRvFsgnzZCbnLUdjFZp9XLZ9PA0dGzpePENP587WloN8A+5j9LnVUyMrIGbMScomjoKs8xX0ln0fMmJWQTZZC7pp5K5L+a+xcHDFjHkKA4xwP68kR+89zPPxfjJgzGyFrHIV8C3hyxPa9Zf+/gGMj5ey/EGBf6YsmLPdEypqFkKsJz3fArAhZsxAit6QYXBkha7+FAKcCeyIJ2Rwhb++FrCcee4CJwHn7K0TevB0jSqaAjZ7bS44KWhs4c6+FyO3KxtKKx3ovxW2r70Kkm3b3iELJVTOn4rGWWSro6cCZ+ytEAB4dUagbaxxnFrBtxnHkTf6MwHl7L0QaCm+VUePAa8BVYxzrcPMjYSuwATgzbNoMhHQNVEi7QIW0C1RIu0CFtAtUSLtAhbQLVEi7QIW0C1RIuyAnIcBlZlzvGzW3zcBjwAkRM+YhpOJ8kDK2y7CiSDn7L8Q0MP5CWB6IlDULIdJKG5qNkbL2X4gAfBlYyMpIObMRIqvs7AgkYwo4OFLOPIQIwDHSWwjcX7I9X1IpSyJmzEeID8Be5ieujQ2Rz69CPAczCL8C8yOfX4XMmH/4g6MyliXIoEIGAM85KuJtuZ3VOOZhwBXANcCJKYSYETIXAdcBZxc9nO62s86QUeB2890BMkbscWB2LCHAeeZX4DBbY7UsRAE4yEz6tLG6xjFlzV0br9ikjCMEuBD40/K9j2JMn2hiQPbHdQrisXTHSCl1hRgZf6SePhEcucc65h7uBs6pcczZliGspVLqCPGUIawp2oxleOgwj4zxLuO79NOmYSlVhVSQIdxZdHhVh6lxmkcc66k4pVQRUlGGXLGnFG0FONnxABy7eQSYX3Gi6b9SfIVUlCHcXeTePAJMVJQig8Hv8OgcW2QWVfNlXdHxpWGPDniuBWbGri9lHWnTFa+Mh4uON48sj3DOiQjz5Lt/ZXg0j2yp0zzSUimdkLG45FZwWuTzTySSsq4PzSPSm/hByfa+rConk0kTPlOq0u5nxgBZWD9goXeMMzYropT2XxlDf7BV5ZeJDw+OmSm0lG7IEICjCM9kgFyhpHRHxtCL4GeE5aZA2caV0i0ZA6TVFvgxkIwXBgtmNiylmzIGAIeajqMVNbflwLmRslWV0m0ZXQD/95T1TWfNBsqlqIyGVjH6YkR/xr3Jwyj/Aewv/38lb97SlwGcbj5SFEVRFEVRFEVRFKXIlX8AwDvcXFkJad0AAAAASUVORK5CYII='
    },
]

const Sorting = ({onClose, json, setJson}) => {

    const [selected, setSelected] = React.useState(parameters.map((el, index) => {
        return el.parameter === json.sorting ? index : null
    }).filter(el => el !== null)[0])

    return (
        <div className={style['container']} style={{height: String(window.innerHeight) + 'px'}}>
            <div>
                <div>
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