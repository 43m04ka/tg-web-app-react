export function searchRoute() {

    const getSearch = async (setResult, searchString, pageId, filterJson) => {
        fetch('/api/search/', {
            method: 'POST', headers: {
                'Content-Type': 'application/json',
            }, body: JSON.stringify({
                searchString: searchString, pageId: pageId, filterJson: filterJson
            })
        }).then(response => {
            let Promise = response.json()
            Promise.then(result => {
                let resultList = []

                for (let card of result.cards) {
                    let flag = true
                    resultList.map(resCard => {
                        if (card.name === resCard.name && card.similarCard?.price === resCard.similarCard?.price && card.regionActivate === resCard.regionActivate && card.choiceRow === resCard.choiceRow && card.choiceColumn === resCard.choiceColumn) {
                            flag = false
                        }
                    })
                    if (flag) {
                        resultList.push(card)
                    }
                }

                resultList = resultList.filter(el => el !== null)

                if (searchString === '') {
                    setResult(null)
                } else {
                    setResult(resultList.splice(0, 20))
                }
            })
        })
    }

    const getClueList = async (setResult) => {
        fetch(`/api/search/allClue?time=${Date.now()}`, {
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

    return {getSearch, getClueList}
}