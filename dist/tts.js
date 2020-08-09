const fetch = require('node-fetch');
const tmi = require('tmi.js');

const urlParams = new URLSearchParams(window.location.href);
var settings = {
    streamer: urlParams.get('c'),
    reward: urlParams.get('r'),
    tts_voice: urlParams.get('v')
};

if (!settings.streamer || !settings.reward || !settings.tts_voice) {
    console.log(settings);

    location.replace("https://tts.openpeepo.com/setup.html");
}

let msg_queue = [];
let audio_queue = [];
let audio = document.querySelector("audio");
audio.onended = () => {
    if (audio_queue.length == 0) return;
    audio_queue = audio_queue.slice(1);
    if (audio_queue.length >= 1) {
        audio.src = audio_queue[0];
        audio.play();
    } else {
        // clearInterval(audio_queue_interval_id);
        audio_queue_interval();
        // audio_queue_interval_id = setInterval(audio_queue_interval, 6000);
    }
}

let currentPromise;
function audio_queue_interval() {
    if (msg_queue.length > 0) {
        let msg = msg_queue.shift();

        let promise = fetch("https://cors-anywhere.herokuapp.com/https://streamlabs.com/polly/speak", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                voice: msg[0].charAt(0).toUpperCase() + msg[0].slice(1),
                text: msg[1]
            })
        }).then(r => r.json());

        if (!currentPromise) {
            currentPromise = promise.then(json => {
                let speak_url = json.speak_url;

                audio_queue.push(speak_url);
                if (audio_queue.length <= 1) {
                    audio.src = speak_url;
                    audio.play();
                }
            });
        } else {
            currentPromise.then(() => {
                promise.then(json => {
                    let speak_url = json.speak_url;
    
                    audio_queue.push(speak_url);
                    if (audio_queue.length <= 1) {
                        audio.src = speak_url;
                        audio.play();
                    }
                });
            });
            currentPromise = promise;
        }
    }
};
// let audio_queue_interval_id = setInterval(audio_queue_interval, 6000);

var twitchClient = new tmi.client({
    options: {
        debug: false
    },
    connection: {
        secure: true,
        cluster: "aws",
        reconnect: true
    },
    channels: [settings.streamer]
});

let voices = ["nicole", "kevin", "enrique", "tatyana", "russell", "lotte", "geraint", "carmen", "mads", "penelope", "mia", "joanna", "matthew", "brian", "seoyeon", "ruben", "ricardo", "maxim", "lea", "giorgio", "carla", "naja", "maja", "astrid", "ivy", "kimberly", "chantal", "amy", "vicki", "marlene", "ewa", "conchita", "camila", "karl", "zeina", "miguel", "mathieu", "justin", "lucia", "jacek", "bianca", "takumi", "ines", "gwyneth", "cristiano", "mizuki", "celine", "zhiyu", "jan", "liv", "joey", "raveena", "filiz", "dora", "salli", "aditi", "vitoria", "emma", "lupe", "hans", "kendra"]
twitchClient.connect();
twitchClient.on('chat', (channel, userstate, message) => {
    if (userstate['custom-reward-id'] && userstate['custom-reward-id'] == settings.reward) {
        if (message == "") return;

        let voice = settings.tts_voice.toLowerCase();

        while (true) {
            let nextVoiceIndex = calcBatchSize(message);
            let text = message.slice(0, nextVoiceIndex).trim();
            if (text && text != "") {
                msg_queue.push([voice, text]);
                if (msg_queue.length <= 1) {
                    // clearInterval(audio_queue_interval_id);
                    audio_queue_interval();
                    // audio_queue_interval_id = setInterval(audio_queue_interval, 6000);
                }
            }

            if (typeof nextVoiceIndex == 'undefined') return;

            message = message.slice(nextVoiceIndex);
            let colonIndex = message.indexOf(":");
            voice = message.slice(0, colonIndex).toLowerCase();
            message = message.slice(colonIndex + 1);
        }
    }
});

function calcBatchSize(message) {
    let voiceMap = {}
    for (let voiceIt of voices) {
        let newVoiceIndex = message.toLowerCase().indexOf(voiceIt + ":");
        if (newVoiceIndex >= 0) {
            voiceMap[voiceIt] = newVoiceIndex;
        }
    }
    let lowestVoiceKey;
    for (let voiceKey of Object.keys(voiceMap)) {
        if (!lowestVoiceKey || voiceMap[voiceKey] < voiceMap[lowestVoiceKey]) lowestVoiceKey = voiceKey;
    }
    if (lowestVoiceKey) return voiceMap[lowestVoiceKey];
}

let skipButton = document.querySelector('#skip');
skipButton.onclick = event => {
    audio.pause();
    audio.onended();
}