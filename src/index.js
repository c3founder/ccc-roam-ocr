import Tesseract from 'tesseract.js';
import Mousetrap from 'mousetrap';

// let ocrParams = {
//     lang1: "eng", //Shift + Click
//     lang2: "ara", //Alt + Click
//     //Mathpix parameters
//     appId: "YOUR_APP_ID",
//     appKey: "YOUR_APP_KEY",
//     //Cleanup Shortcut
//     cleanKey: 'alt+a c',
//     //Edit options
//     saveRef2Img: false
// };

const allLang = ['afr', 'amh', 'ara', 'asm', 'aze', 'aze_cyrl', 'bel', 'ben', 'bod', 'bos', 'bre',
    'bul', 'cat', 'ceb', 'ces', 'chi_sim', 'chi_tra', 'chr', 'cos', 'cym', 'dan', 'dan_frak', 'deu', 'deu_frak',
    'dzo', 'ell', 'eng', 'enm', 'epo', 'equ', 'est', 'eus', 'fao', 'fas', 'fil', 'fin', 'fra',
    'frk', 'frm', 'fry', 'gla', 'gle', 'glg', 'grc', 'guj', 'hat', 'heb', 'hin', 'hrv', 'hun',
    'hye', 'iku', 'ind', 'isl', 'ita', 'ita_old', 'jav', 'jpn', 'kan', 'kat', 'kat_old', 'kaz', 'khm',
    'kir', 'kmr', 'kor', 'kor_vert', 'kur', 'lao', 'lat', 'lav', 'lit', 'ltz', 'mal', 'mar', 'mkd',
    'mlt', 'mon', 'mri', 'msa', 'mya', 'nep', 'nld', 'nor', 'oci', 'ori', 'osd', 'pan', 'pol',
    'por', 'pus', 'que', 'ron', 'rus', 'san', 'sin', 'slk', 'slk_frak', 'slv', 'snd', 'spa', 'spa_old',
    'sqi', 'srp', 'srp_latn', 'swa', 'swe', 'syr', 'tam', 'tat', 'tel', 'tgk', 'tgl', 'tha', 'tir',
    'ton', 'tur', 'uig', 'ukr', 'urd', 'uzb', 'uzb_cyrl', 'vie', 'yid', 'yor'];

let ocrParams = {
    lang1: '', //Shift + Click
    lang2: '', //Alt + Click
    //Mathpix parameters
    appId: "YOUR_APP_ID",
    appKey: "YOUR_APP_KEY",
    //Cleanup Shortcut
    cleanKey: '',
    //Edit options
    saveRef2Img: false
};

const panelConfig = {
    tabTitle: "CCC Roam OCR",
    settings: [
        {
            id: "lang1",
            name: "Language 1 Code",
            action: {
                type: "select",
                items: [...allLang],
                onChange: (item) => ocrParams.lang1 = item
            }
        },
        {
            id: "lang2",
            name: "Language 2 Code",
            action: {
                type: "select",
                items: [...allLang],
                onChange: (item) => ocrParams.lang2 = item
            }
        },
        {
            id: "mathpix-app-id",
            name: "Mathpix App Id",
            action: {
                type: "input",
                placeholder: "YOUR_APP_ID",
                onChange: (evt) => { ocrParams.appId = evt.target.value; }
            }
        },
        {
            id: "mathpix-app-key",
            name: "Mathpix App Key",
            action: {
                type: "input",
                placeholder: "YOUR_APP_KEY",
                onChange: (evt) => { ocrParams.appKey = evt.target.value; }
            }
        },
        {
            id: "save-ref2Image",
            name: "Save Reference to Image",
            description: "Save reference to image after clean up as [*](link)",
            action: {
                type: "switch",
                onChange: (evt) => ocrParams.saveRef2Img = evt.target.checked
            }
        },
        {
            id: "cleanup-shortcut",
            name: "cleanup",
            description: "Check valid shortcuts on [Mousetrap](https://craig.is/killing/mice)",
            action: {
                type: "input",
                placeholder: "alt+a c",
                onChange: (evt) => { ocrParams.cleanKey = evt.target.value; }
            }
        }


    ]
};


/* Begin Importing Utility Functions */
function onload({ extensionAPI }) {
    ocrParams.lang1 = setSettingDefault(extensionAPI, "lang1", 'eng');
    ocrParams.lang2 = setSettingDefault(extensionAPI, "lang2", '');
    ocrParams.appId = setSettingDefault(extensionAPI, "mathpix-app-id", '');
    ocrParams.appKey = setSettingDefault(extensionAPI, "mathpix-app-key", '');
    ocrParams.saveRef2Img = setSettingDefault(extensionAPI, "save-ref2Image", false);
    ocrParams.cleanKey = setSettingDefault(extensionAPI, "cleanup-shortcut", '');

    extensionAPI.settings.panel.create(panelConfig);


    console.log("onload")
    if (typeof ccc !== 'undefined' && typeof ccc.util !== 'undefined') {
        //Somebody has already loaded the utility
        startC3OcrExtension();
    } else {
        let s = document.createElement("script");
        s.type = "text/javascript";
        s.src = "https://c3founder.github.io/Roam-Enhancement/enhancedUtility.js"
        s.id = 'c3util4ocr'
        s.onload = () => { startC3OcrExtension() }
        try { document.getElementById('c3util').remove() } catch (e) { };
        document.getElementsByTagName('head')[0].appendChild(s);
    }
    extensionAPI.settings.panel.create(panelConfig);

}

function setSettingDefault(extensionAPI, settingId, settingDefault) {
    let storedSetting = extensionAPI.settings.get(settingId);
    if (null == storedSetting) extensionAPI.settings.set(settingId, settingDefault);
    return storedSetting || settingDefault;
}

function onunload() {
    Mousetrap.bind(ocrParams.cleanKey);
    observerImg.disconnect();
}


/* End Importing Utility Functions */
let observerImg;

function startC3OcrExtension() {
    var ccc = window.ccc || {};
    var c3u = ccc.util;
    let parsedStr = '';

    function scanForNewImages(mutationsList = null) {
        let oldImg = document.querySelectorAll('.rm-inline-img.img-ready4ocr');
        let curImg = document.getElementsByClassName('rm-inline-img');
        if (oldImg.length === curImg.length) return;
        Array.from(curImg).forEach(im => {
            if (!im.classList.contains('img-ready4ocr')) {
                im.classList.add('img-ready4ocr');
                im.addEventListener('click', async function (e) {
                    let ocrBlockUid;
                    try {
                        if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) {
                            e.preventDefault();
                            e.stopPropagation();
                            e.stopImmediatePropagation();

                            const blockUid = c3u.getUidOfContainingBlock(e.target);
                            ocrBlockUid = c3u.createUid();
                            c3u.createChildBlock(blockUid, 0, "Granting wishes...", ocrBlockUid)

                            parsedStr = await parseImage(e);
                            let postfix = ocrParams.saveRef2Img ? " [*](" + e.target.src + ") " : "";
                            c3u.updateBlockString(ocrBlockUid, parsedStr + postfix)
                        }
                    }
                    catch (err) {
                        let msg = "OCR was unsuccessful."
                        c3u.updateBlockString(ocrBlockUid, msg);
                    }
                });
            }
        });
    };

    async function parseImage(e) {
        const tempImg = new Image();
        tempImg.crossOrigin = "Anonymous";
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        tempImg.src = "https://ccc-cors-anywhere.herokuapp.com/" + e.target.src //+ "?not-from-cache-please"
        let str = tempImg.onload = async function () {
            let ocrStr;
            canvas.width = tempImg.width;
            canvas.height = tempImg.height;
            ctx.drawImage(tempImg, 0, 0);
            if (e.ctrlKey || e.metaKey) {  //Math OCR
                ocrStr = await parseMath(e.target.src);
            }
            if (e.shiftKey) {
                ocrStr = await parseLan(tempImg, ocrParams.lang1);
            }
            if (e.altKey) {
                ocrStr = await parseLan(tempImg, ocrParams.lang2);
            }
            return ocrStr
        }();
        return str;
    }

    //OCR the image in url using language lan
    async function parseLan(url, lan) {
        return Tesseract.recognize(url, lan)
            .then(({ data: { text } }) => {
                return (text.replace(/\n/g, " "));
            });
    }

    //OCR the given image using the Mathpix API
    async function parseMath(url) {
        //Send the request to Mathpix API
        let ocrReq = {
            "src": url,
            "formats": "text",
        }
        let latexStr = await postData('https://api.mathpix.com/v3/text', ocrReq)
            .then(response => {
                return (response.text)
            });
        //Make the math Roam-readable
        latexStr = latexStr.replace(/(\\\( )|( \\\))/g, "$$$$");
        latexStr = latexStr.replace(/(\n\\\[\n)|(\n\\\]\n?)/g, " $$$$ ");
        return (latexStr)
    }

    async function postData(url = '', data = {}) {
        // Default options are marked with *
        const response = await fetch(url, {
            method: 'POST', // *GET, POST, PUT, DELETE, etc.      
            headers: {
                "content-type": "application/json",
                "app_id": ocrParams.appID,
                "app_key": ocrParams.appKey
            },
            body: JSON.stringify(data) // body data type must match "Content-Type" header
        });
        return response.json(); // parses JSON response into native JavaScript objects
    }

    observerImg = new MutationObserver(scanForNewImages);
    observerImg.observe(document, { childList: true, subtree: true })
}


function bindShortkeys() {
    Mousetrap.prototype.stopCallback = function () { return false }

    Mousetrap.bind(ocrParams.cleanKey, async function (e) {
        e.preventDefault();
        const activeTxt = document.querySelector('textarea.rm-block-input');
        let recognizedTxt = activeTxt.value;
        const blockUid = window.ccc.util.getUidOfContainingBlock(activeTxt);
        const parentUid = window.ccc.util.parentBlockUid(blockUid);
        window.ccc.util.deleteBlock(blockUid);
        window.ccc.util.updateBlockString(parentUid, recognizedTxt);
        return false;
    }, 'keydown');
}




export default {
    onload: onload,
    onunload: onunload
}
