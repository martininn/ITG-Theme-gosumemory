let socket = new ReconnectingWebSocket("ws://127.0.0.1:24050/ws");

let statsContainer = document.getElementById('statsContainer');

let bpm = document.getElementById('bpm');
let bg = document.getElementById("bg");
let fantastic = document.getElementById('300');
let great = document.getElementById('100');
let bad = document.getElementById('50');
let miss = document.getElementById('miss');
let songLength = document.getElementById('songLength');
let currentLength = document.getElementById('currentLength')
let canvas = document.getElementById('canvas');
let progress = document.getElementById('titleProgress');

socket.onopen = () => console.log("Successfully Connected");
socket.onclose = event => {
    console.log("Socket Closed Connection: ", event);
    socket.send("Client Closed!");
};
socket.onerror = error => console.log("Socket Error: ", error);

let tempState;
let tempImg;
let tempTitle;
let onepart;
let seek;
let fullTime;

socket.onmessage = event => {
    let data = JSON.parse(event.data)

    let fantasticHit = data.gameplay.hits[300];
    let greatHit = data.gameplay.hits[100];
    let badHit = data.gameplay.hits[50];
    let missHit = data.gameplay.hits[0];
    

    // PROGRESS
    if (data.menu.state !== tempState) {
        tempState = data.menu.state;
        if(tempState == 2){
            progress.style.opacity = 1
        } else {
            progress.style.opacity = 0
        }
    }

    if(fullTime !== data.menu.bm.time.full){
        fullTime = data.menu.bm.time.full
    }
    if(seek !== data.menu.bm.time.current && fullTime !== undefined && fullTime != 0){
        seek = data.menu.bm.time.current;
        onepart = seek/fullTime;
        progress.style.width = onepart*100+'%'
        if(onepart*100 >= 98){
            progress.style.width = 98+'%'
        }
    }


    // TITLE
    if(tempTitle !== '[' + data.menu.bm.stats.fullSR + ']' + ' ' + data.menu.bm.metadata.title + ' - ' + data.menu.bm.metadata.difficulty){
        tempTitle = '[' + data.menu.bm.stats.fullSR + ']' + ' ' + data.menu.bm.metadata.title + ' - ' + data.menu.bm.metadata.difficulty;
        title.innerHTML = tempTitle
    }
    
    //BPM
    bpm.innerHTML = `${data.menu.bm.stats.BPM.max}`;

    //BG IMG
    if(tempImg !== data.menu.bm.path.full){
        tempImg = data.menu.bm.path.full
        let img = data.menu.bm.path.full.replace(/#/g,'%23').replace(/%/g,'%25')
        bg.setAttribute('style', `height:65px; width:150px;`)
        bg.setAttribute('src',`http://127.0.0.1:24050/Songs/${img}?a=${Math.random(10000)}`)
    }

    let ctx = canvas.getContext('2d');
    ctx.drawImage(bg, 0,-17,150,100);

    //OFFSET CONVERT INTO TIME
    let currentTimeIntoSeconds = data.menu.bm.time.current / 1000;
    let currentMinute = Math.floor(currentTimeIntoSeconds / 60);
    let currentSecond = formatNumberWithLeadingZero(Math.floor(currentTimeIntoSeconds % 60));

    currentLength.innerHTML = `${currentMinute}:${currentSecond} current`;

    let intoSeconds = data.menu.bm.time.full / 1000;
    let minute = Math.floor(intoSeconds / 60);
    let second = formatNumberWithLeadingZero(Math.floor(intoSeconds % 60));
    songLength.innerHTML = `${minute}:${second} song`;

    //Formats the timer to start with 0. Example: "1:02"
    function formatNumberWithLeadingZero(number){
        return String(number).padStart(2, '0');
    }

    //Formats the data.gameplay.hits with 4 zeros
    function formatNumberWithMoreLeadingZero(number){
        return `${String(number).padStart(4, '0')}`
    }

    //Formats data.gameplay.hits[300] to 5 zeros if it hits more than 9999
    function formatNumberWithEvenMoreLeadingZero(number){
        return String(number).padStart(5, '0');
    }


    //HITS

    //Magic function that checks for opacities on zeros. No idea how it works.
    function checkOpacity(hitting){
        // variabel evt
        let hitString = "";

        for(i=0;i<hitting.length;i++){
            if(hitting[i] == '0' && i==0){
                hitString += `<div style="opacity: 1;"><span style="opacity: 0.25;">0</span>`
            } else if(hitting[i] == '0' && hitting[i-1] == '0'){
                if(hitting[i-2] == '0'){
                    if(hitting[i-3] == '0'){}
                }
                hitString += `<span style="opacity: 0.25;">0</span>`
            } else {
                hitString += `<span style="opacity: 1;">${hitting[i]}</span>`
            }
        } 
        return hitString + `</div>`;
    }


    if (fantasticHit > 9999){
        fantastic.innerHTML = `${checkOpacity(formatNumberWithEvenMoreLeadingZero(fantasticHit))}`;
    } else if (fantasticHit >= 0){
        fantastic.innerHTML = `${checkOpacity(formatNumberWithMoreLeadingZero(fantasticHit))}`;
    }
    if (greatHit >= 0) {
		great.innerHTML = `${checkOpacity(formatNumberWithMoreLeadingZero(greatHit))}`;
	} else {
		great.innerHTML = 0
    }
    if (badHit >= 0) {
		bad.innerHTML = `${checkOpacity(formatNumberWithMoreLeadingZero(badHit))}`;
	} else {
		bad.innerHTML = 0
	}
	if (missHit >= 0) {
		miss.innerHTML = `${checkOpacity(formatNumberWithMoreLeadingZero(missHit))}`;
	} else {
		miss.innerHTML = 0
	}

    //GAMESTATE (wip..?)
    
}