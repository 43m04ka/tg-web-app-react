export function structureRoute(){

    const getPageList = async (setResult, hide) => {
        await fetch('/api/structure/allPages?time=' + Date.now(), {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        }).then(async response => {
            let answer = response.json()
            answer.then((data) => {
                let result = data.result.sort((a, b) => a.serialNumber - b.serialNumber).filter(page => typeof hide !== 'undefined' || page.isHide === 1)
                setResult(result)
            })
        })
    }


    const getStructureCatalogList = async (setResult) => {
        await fetch('/api/structure/allStructureBlocks?time=' + Date.now(), {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        }).then(async response => {
            let answer = response.json()
            answer.then((data) => {
                setResult(data.result)
            })
        })
    }

    const getPreviewCardList = async (setResult) => {
        await fetch('/api/structure/mainPageProducts?time=' + Date.now(), {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        }).then(async response => {
            let answer = response.json()
            answer.then((data) => {
                setResult(data.result.sort((a, b) => a.serialNumber - b.serialNumber))
            })
        })
    }

    const getInfoBlocks = async (setResult) => {
        await fetch(`/api/structure/infoBlocks?time${new Date()}`, {
            method: 'GET', headers: {
                'Content-Type': 'application/json',
            }
        }).then(async response => {
            let answer = response.json()
            answer.then((data) => {
                setResult(data.result)
            })
        })
    }

    return {getStructureCatalogList, getPreviewCardList, getPageList, getInfoBlocks}
}