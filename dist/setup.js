const tmi = require('tmi.js');

const querystring = require('query-string');
const appendQuery = require('append-query');

let setupButton = document.querySelector("#pointsetupbutton");
let setupScreen = document.querySelector("#channelpointsetup");
let setupCancelButton = document.querySelector("#setupcancel");
let channelInput = document.querySelector("#channel");
let urlRequestButton = document.querySelector("#url-request");


const urlParams = querystring.parse(window.location.href);
var settings = {
    streamer: urlParams['c'],
    reward: urlParams['r'],
    tts_voice: urlParams['v']
};
if (settings.streamer && settings.reward && settings.tts_voice) {
    location.replace(appendQuery("https://tts.openpeepo.com", {
        c: actualChannelName,
        r: rewardId,
        v: voice ? voice : "Brian"
    }));
    return;
}

let rewardId;
let actualChannelName;
function scanChannelReward(channel) {
    var twitchClient = new tmi.client({
        options: {
            debug: false
        },
        connection: {
            secure: true,
            cluster: "aws",
            reconnect: true
        },
        channels: [channel]
    });

    twitchClient.connect();
    twitchClient.on('chat', (channel, userstate, message) => {
        if (userstate['custom-reward-id'] && (userstate['badges'].broadcaster || userstate['badges'].moderator) && message == "!setup") {
            clearInterval(observerIntervalId);
            channelPlaceholder.style = "color: #44EE44";
            channelPlaceholder.innerHTML = "<b>Success!</b> TTS reward recognized. :)";
            rewardId = userstate['custom-reward-id'];
            setupButton.style = "background-color:rgba(20, 50, 20, 0.6);";
            actualChannelName = channelInput.value;
            document.getElementById('current-channel').innerHTML = "Logged in as " + actualChannelName;
            checkReadynessForButton();
            setTimeout(() => {
                setupScreen.style = "display: none;";
                channelPlaceholder.style = "color: #AAAAAA";
                observerIntervalId = setInterval(observerCallback, 600);
            }, 6000);
            twitchClient.disconnect();
        }
    });
}

let channelPlaceholder = document.querySelector("#channel-placeholder");
let dotCounter = 1;
let observerCallback = () => {
    let progressName = "Observing chat of " + channelInput.value;

    for (let i = 0; i < dotCounter; i++) {
        progressName += ".";
    }
    if (dotCounter++ >= 3) dotCounter = 1;

    channelPlaceholder.innerHTML = progressName;
};

let observerIntervalId = setInterval(observerCallback, 600);

let cacheTtsRewardId;
setupButton.onclick = () => {
    if (!channelInput.value) return;

    setupScreen.style = "";

    cacheTtsRewardId = rewardId;
    scanChannelReward(channelInput.value);
    checkReadynessForButton();
}

setupCancelButton.onclick = () => {
    setupScreen.style = "display: none;";

    rewardId = cacheTtsRewardId;
    checkReadynessForButton();
}

channelInput.onchange = () => {
    if (!channelInput.value || channelInput.value == "") {
        setupButton.style = "display: none;"
    } else {
        setupButton.style = ""
    }
    setupButton.style = "background-color:rgba(0, 0, 0, 0.6);";
    checkReadynessForButton();
}

function checkReadynessForButton() {
    if (channelInput.value && channelInput.value != "" && rewardId) {
        document.getElementById("url-request").style = "";
    } else {
        document.getElementById("url-request").style = "display: none;";
    }
}

let urlDisplay = document.getElementById("url-display");
let urlInput = document.getElementById("url-input");
urlRequestButton.onclick = () => {
    let voice = document.getElementById("voice-selection").value;
    
    let url = appendQuery("https://tts.openpeepo.com", {
        c: actualChannelName,
        r: rewardId,
        v: voice ? voice : "Brian"
    });

    urlInput.value = url;
    urlDisplay.style = "";
}


/*Dropdown Menu*/
$('.dropdown').click(function () {
    $(this).attr('tabindex', 1).focus();
    $(this).toggleClass('active');
    $(this).find('.dropdown-menu').slideToggle(300);
});
$('.dropdown').focusout(function () {
    $(this).removeClass('active');
    $(this).find('.dropdown-menu').slideUp(300);
});
$('.dropdown .dropdown-menu li').click(function () {
    $(this).parents('.dropdown').find('span').text($(this).text());
    document.getElementById("voice-placeholder").style = "";
    $(this).parents('.dropdown').find('input').attr('value', $(this).attr('id'));
});
/*End Dropdown Menu*/


$('.dropdown-menu li').click(() => {
    let input = '<b>' + document.getElementById("voice-selection").value + '</b>';
    document.querySelector('#volume-placeholder').innerHTML = input;
});