const format = new Intl.NumberFormat(navigator.language)

let userHistory = JSON.parse(localStorage.getItem('history'))

const isFloat = (num) => {
    return +num === num && num % 1 !== 0
}
const randomNumber = (min, max) => {
    if (isFloat(min) || isFloat(max)) {
        return (Math.random() * (max - min) + min).toFixed(2)
    } else {
        return Math.floor(Math.random() * (max - min + 1)) + min
    }
}
const rollRandom = (min, max, rolls) => {
    for (let i = 0; i < rolls; i++) {
        document.querySelector('.rollInfo').textContent = `Roll ${i + 1} out of ${rolls}`
        let res = randomNumber(min, max)
        if (i == rolls - 1) {
            document.querySelector('.rollInfo').textContent = ``
            return res
        }
    }
}
const rollRandomArray = (array, rolls) => {
    const x = rollRandom(0, array.length - 1, rolls)
    return { item: array[x], index: x }
}

function toArray(text) {
    let t = text.replaceAll(', ', ',')
    return t.split(',')
}

let list = '';
function setList() {
    list = toArray(prompt('Edit list:', list.toString().replaceAll(',', ', ')) || '')
    document.querySelector('.editListBtn').setAttribute('len', (list.length))
}
document.querySelector('.editListBtn').addEventListener('click', setList)


const tabView = document.querySelector('.tabView')
const generateBtn = document.querySelector('.generateBtn')
const sidebar = document.querySelector('.sidebar')
const toggleSidebarBtn = document.querySelector('.hideSidebarBtn')
const settingsFrame = document.querySelector('.randomSettings')
const title = document.querySelector('.tit')
const gen = document.querySelector('.randomView')
const sidebarFrame = document.querySelector('.sidebarContent')
const clearHistoryBtn = document.querySelector('.clearHistoryBtn')

let mode
tabView.childNodes.forEach(item => {
    item.addEventListener('click', () => {
        tabView.querySelector('.active').classList.remove('active')
        item.classList.add('active')
        mode = item.innerText.toLowerCase()
        title.textContent = `Random ${item.innerText} Generator`

        if (mode == 'item') {
            settingsFrame.children[0].style.display = 'none'
            settingsFrame.children[1].style.display = 'none'
            document.querySelector('.editListBtn').style.display = 'flex'
        } else {
            settingsFrame.children[0].style.display = 'flex'
            settingsFrame.children[1].style.display = 'flex'
            document.querySelector('.editListBtn').style.display = 'none'
            generateBtn.disabled = false
        }
        gen.innerHTML = `<p class="demoText">Click the "Generate" icon to generate a random ${mode}!</p>`
    })
})
tabView.children[0].click()


toggleSidebarBtn.addEventListener('click', () => {
    sidebar.style.display = sidebar.style.display == 'none' ? '' : 'none'
})

generateBtn.addEventListener('click', () => {
    const get = (el) => settingsFrame.querySelector('.' + el)

    const settings = {
        min: +get('numMinLabel').value || 1,
        max: +get('numMaxLabel').value || 10,
        rolls: +get('numRollsLabel').value || 1
    }
    if (mode == 'number') {
        const r = rollRandom(settings.min, settings.max, settings.rolls)

        const formatted = format.format(r)
        gen.innerHTML = `<div class="randomText">${formatted}</div>`

        addToHistory({
            type: 'number',
            min: settings.min,
            max: settings.max,
            result: formatted,
            rolls: settings.rolls
        })
    } else if (mode == 'item') {
        const r = rollRandomArray(list, settings.rolls)
        gen.innerHTML = `<div class="randomText">${r.item || 'Empty'}</div><div class="randomSub">#${r.index + 1}</div>`
        addToHistory({
            type: 'list',
            rolls: settings.rolls,
            result: r.item,
            list: list
        })
    }

    let el = gen.querySelector('.randomText')
    let len = el.innerHTML.length
    if (len > 30) {
        el.className = 'randomText'
        el.classList.add('tiny')
    } else if (len > 14) {
        el.className = 'randomText'
        el.classList.add('sm')
    } else if (len > 7) {
        el.className = 'randomText'
        el.classList.add('med')
    }
})

document.querySelector('.copyResBtn').addEventListener('click', () => {
    navigator.clipboard.writeText(gen.querySelector('.randomText').innerText)
    if (document.querySelector('.copyResBtn span')) {
        document.querySelector('.copyResBtn span').remove()
    }
    document.querySelector('.copyResBtn').innerHTML += '<span>Copied!</span>'
    setTimeout(() => {
        document.querySelector('.copyResBtn span').remove()
    }, 3000);
})

function loadHistory() {
    if (userHistory && userHistory.length > 0) {
        sidebarFrame.innerHTML = ''
        userHistory.forEach(item => {
            const el = document.createElement('div')
            el.className = 'sidebarItem'
            el.innerHTML = `
        <div class="siSub">${item.type == 'number' ? item.min + '-' + item.max : `${item.list.toString().replaceAll(',', ', ').substring(0, 40)}${item.list.toString().replaceAll(',', ', ').length > 39 ? '...' : ''}`}</div>
        <div class="siCt">${item.result}</div>
        `
        sidebarFrame.append(el)
        })
    } else {
        sidebarFrame.innerHTML = '<center>Your history is empty</center>'
    }
}
function addToHistory(config) {
    if (!userHistory) {
        userHistory = []
    }
    userHistory.push(config)
    localStorage.setItem('history', JSON.stringify(userHistory))
    userHistory = JSON.parse(localStorage.getItem('history'))
    loadHistory()
}
function clearHistory() {
    if (window.confirm('Are you sure you want to clear your history? This cannot be undone.')) {
        localStorage.removeItem('history')
        userHistory = []
        loadHistory()
    }
}
clearHistoryBtn.addEventListener('click', clearHistory)

loadHistory()