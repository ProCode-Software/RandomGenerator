const format = new Intl.NumberFormat(navigator.language);
let isFormatted = true,
    currentPreset = "",
    listEmpty;

let userHistory = JSON.parse(localStorage.getItem("history"));

const presets = [
    {
        name: "PIN",
        params: [1, 9999],
        mode: "number",
    },
    {
        name: "Phone Number",
        params: [100_000_0000, 999_999_9999],
        mode: "number",
    },
    {
        name: "Dice",
        params: [1, 6],
        mode: "number",
    },
    {
        name: "Heads/Tails",
        params: ["Heads", "Tails"],
        mode: "item",
    },
    {
        name: "Rock/Paper/Scissors",
        params: "Rock/Paper/Scissors".split("/"),
        mode: "item",
    },
];

const isFloat = (num) => {
    return +num === num && num % 1 !== 0;
};
const randomNumber = (min, max) => {
    if (isFloat(min) || isFloat(max)) {
        return (Math.random() * (max - min) + min).toFixed(3);
    } else {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
};
const rollRandom = (min, max, rolls) => {
    for (let i = 0; i < rolls; i++) {
        document.querySelector(".rollInfo").textContent = `Roll ${i + 1
            } out of ${rolls}`;
        let res = randomNumber(min, max);
        if (i == rolls - 1) {
            document.querySelector(".rollInfo").textContent = ``;
            return res;
        }
    }
};
const rollRandomArray = (array, rolls) => {
    const x = rollRandom(0, array.length - 1, rolls);
    return { item: array[x], index: x };
};

function toArray(text) {
    let t = text.replaceAll(", ", ",");
    return t.split(",");
}

const tabView = document.querySelector(".tabView");
const generateBtn = document.querySelector(".generateBtn");
const sidebar = document.querySelector(".sidebar");
const toggleSidebarBtn = document.querySelector(".hideSidebarBtn");
const settingsFrame = document.querySelector(".randomSettings");
const title = document.querySelector(".tit");
const gen = document.querySelector(".randomView");
const sidebarFrame = document.querySelector(".sidebarContent");
const clearHistoryBtn = document.querySelector(".clearHistoryBtn");
const presetFrame = document.querySelector(".presetFrame");
const darkModeBtn = document.querySelector('.darkModeBtn')

let list = "";
function setList() {
    list = toArray(
        prompt("Edit list:", list.toString().replaceAll(",", ", ")) || list.toString()
    );
    isFormatted = true, currentPreset = ""
    let f = list.toString().replaceAll(',', ', ')

    listEmpty = list[0] == '' && list.length < 2

    document.querySelector(".editListBtn").setAttribute("len", listEmpty ? '0' : list.length);
    document.querySelector(".editListBtn").title = f || '[No items]'
    useTooltip(document.querySelector(".editListBtn"))

    generateBtn.disabled = listEmpty
}
document.querySelector(".editListBtn").addEventListener("click", setList);

let mode;
tabView.childNodes.forEach((item) => {
    item.addEventListener("click", () => {
        tabView.querySelector(".active").classList.remove("active");
        item.classList.add("active");
        mode = item.innerText.toLowerCase();
        title.textContent = `Random ${item.innerText} Generator`;
        document.title = title.textContent

        if (mode == "item") {
            settingsFrame.children[0].style.display = "none";
            settingsFrame.children[1].style.display = "none";
            document.querySelector(".editListBtn").style.display = "flex";

            if (!list || list == [''] || list == [] || listEmpty) {
                generateBtn.disabled = listEmpty
                setList()
            }
        } else {
            settingsFrame.children[0].style.display = "flex";
            settingsFrame.children[1].style.display = "flex";
            document.querySelector(".editListBtn").style.display = "none";
            generateBtn.disabled = false;
        }
        gen.innerHTML = `<p class="demoText">Click the "Generate" icon to generate a random ${mode}!</p>`;
        if (mode == 'item') {
            gen.querySelector('.demoText').innerHTML += `<br>Don't forget to check your list by clicking the ${document.querySelector(".editListBtn").innerHTML} icon below!`
        }

        const presetsForMode = presets.filter((p) => p.mode == mode);
        presetFrame.innerHTML = "";
        presetsForMode.forEach((preset) => {
            const e = document.createElement("div");
            e.className = "preset";
            e.textContent = preset.name;
            e.tabIndex = 0;
            presetFrame.append(e);

            e.addEventListener("click", () => {
                currentPreset = preset.name;
                if (mode == "number") {
                    applyPreset(...preset.params);
                } else {
                    list = preset.params;
                    document.querySelector(".editListBtn").setAttribute("len", list.length);
                    listEmpty = false
                    generateBtn.disabled = false
                }
            });
        });
    });
});
tabView.children[0].click();

toggleSidebarBtn.addEventListener("click", () => {
    sidebar.style.display = sidebar.style.display == "none" ? "flex" : "none";
});

generateBtn.addEventListener("click", () => {
    const get = (el) => settingsFrame.querySelector("." + el);

    const settings = {
        min: isNaN(+get("numMinLabel").value) ? 1 : +get("numMinLabel").value,
        max: isNaN(+get("numMaxLabel").value) ? 1 : +get("numMaxLabel").value,
        rolls: +get("numRollsLabel").value || 1,
    };
    if (mode == "number") {
        const r = rollRandom(settings.min, settings.max, settings.rolls);

        const formatted = isFormatted ? format.format(r) : r;
        gen.innerHTML = `<div class="randomText">${formatted}</div>`;

        const conf = {
            type: "number",
            min: settings.min,
            max: settings.max,
            result: formatted,
            rolls: settings.rolls,
        };
        if (currentPreset) conf.preset = currentPreset;

        addToHistory(conf);
    } else if (mode == "item") {
        const r = rollRandomArray(list, settings.rolls);
        gen.innerHTML = `<div class="randomText">${r.item || "Empty"
            }</div><div class="randomSub">#${r.index + 1}</div>`;

        const conf = {
            type: "list",
            rolls: settings.rolls,
            result: r.item,
            list: list,
        };
        if (currentPreset) conf.preset = currentPreset;
        addToHistory(conf);
    }

    let el = gen.querySelector(".randomText");
    let len = el.innerHTML.length;
    if (len > 30) {
        el.className = "randomText";
        el.classList.add("tiny");
    } else if (len > 14) {
        el.className = "randomText";
        el.classList.add("sm");
    } else if (len > 7) {
        el.className = "randomText";
        el.classList.add("med");
    }
});

document.querySelector(".copyResBtn").addEventListener("click", () => {
    navigator.clipboard.writeText(gen.querySelector(".randomText").innerText);
    if (document.querySelector(".copyResBtn span")) {
        document.querySelector(".copyResBtn span").remove();
    }
    document.querySelector(".copyResBtn").innerHTML += "<span>Copied!</span>";
    setTimeout(() => {
        document.querySelector(".copyResBtn span").remove();
    }, 3000);
});

function loadHistory() {
    if (userHistory && userHistory.length > 0) {
        sidebarFrame.innerHTML = "";
        userHistory.forEach((item) => {
            const el = document.createElement("div");
            el.className = "sidebarItem";
            el.innerHTML = `
        <div class="siSub">${item.preset ? `Preset - ${item.preset}` : item.type == "number"
                    ? item.min + "-" + item.max
                    : `${item.list.toString().replaceAll(",", ", ")
                        .substring(0, 40)}${item.list.toString().replaceAll(",", ", ").length > 39
                            ? "..."
                            : ""
                    }` || 'No list provided'}</div>
        <div class="siCt">${item.result || '-'}</div>
        `;
            sidebarFrame.append(el);
        });
    } else {
        sidebarFrame.innerHTML = "<center>Your history is empty</center>";
    }
}
function addToHistory(config) {
    if (!userHistory) {
        userHistory = [];
    }
    userHistory.push(config);
    localStorage.setItem("history", JSON.stringify(userHistory));
    userHistory = JSON.parse(localStorage.getItem("history"));
    loadHistory();
}
function clearHistory() {
    if (
        window.confirm(
            "Are you sure you want to clear your history? This cannot be undone."
        )
    ) {
        localStorage.removeItem("history");
        userHistory = [];
        loadHistory();
    }
}
clearHistoryBtn.addEventListener("click", clearHistory);

loadHistory();

function applyPreset(min, max) {
    console.log(settingsFrame.children);
    settingsFrame.children[0].querySelector("input").value = min;
    settingsFrame.children[1].querySelector("input").value = max;
    isFormatted = false;
}

document.querySelectorAll(".randomSettings input").forEach((c) => {
    c.addEventListener("change", () => {
        isFormatted = true;
        currentPreset = "";
    });
});

function fieldAt(name) {
    return settingsFrame.querySelector("input." + name);
}


/**
 * 
 * @param {Element} element 
 */
function useTooltip(element) {
    let title = element.title
    const tt = element.querySelector('.tooltip') || document.createElement('div')
    tt.className = 'tooltip'
    tt.innerHTML = title
    element.append(tt)
    element.classList.add('tparent')
    element.title = ''

    function checkSize() {
        const bounds = tt.getBoundingClientRect()
        const pb = element.getBoundingClientRect()

        if (pb.x > window.innerWidth / 2) {
            tt.classList.add('right')
        } else {
            if (tt.classList.contains('right')) tt.classList.remove('right')
        }

        if (!tt.classList.contains('right')) {
            if (bounds.left < 10) {
                tt.style.left = 0
            } else {
                tt.style.left = ''
            }
        } else {
            if (bounds.right < 10) {
                tt.style.right = 0
            } else {
                tt.style.right = ''
            }
        }
    }

    window.onresize = checkSize

    checkSize()
}

document.querySelectorAll('[title]').forEach(el => useTooltip(el))



let darkThemeOn = JSON.parse(localStorage.getItem('darkMode') || window.matchMedia('(prefers-color-scheme: dark)').matches)
document.body.classList[darkThemeOn ? 'add' : 'remove']('dark')

darkModeBtn.addEventListener('click', () => {
    darkThemeOn = !darkThemeOn
    document.body.classList[darkThemeOn ? 'add' : 'remove']('dark')
    localStorage.setItem('darkMode', darkThemeOn)
})