// ============================================================
// J.A.R.V.I.S — JAVASCRIPT CORE
// ============================================================


// ============================================================
// ELEMENTS
// ============================================================

const voiceButton = document.getElementById("voiceButton");
const voiceStatus = document.getElementById("voiceStatus");
const jarvisMessage = document.getElementById("jarvisMessage");

const timeElement = document.getElementById("time");
const dateElement = document.getElementById("date");
const locationElement = document.getElementById("location");

const aiStatus = document.getElementById("aiStatus");
const modeStatus = document.getElementById("modeStatus");


// ============================================================
// JARVIS STATE
// ============================================================

let isListening = false;
let recognition = null;


// ============================================================
// JARVIS MESSAGE
// ============================================================

function showMessage(message, subMessage = "J.A.R.V.I.S SYSTEM") {

    jarvisMessage.textContent = message;

    const sub = document.querySelector(".message-sub");

    if (sub) {
        sub.textContent = subMessage;
    }
}


// ============================================================
// TEXT TO SPEECH
// ============================================================

function speak(text, language = "en-IN") {

    if (!("speechSynthesis" in window)) {
        return;
    }

    window.speechSynthesis.cancel();

    const speech = new SpeechSynthesisUtterance(text);

    speech.lang = language;
    speech.rate = 0.95;
    speech.pitch = 0.9;
    speech.volume = 1;

    speech.onstart = function () {

        aiStatus.textContent = "SPEAKING";
        voiceStatus.textContent = "OUTPUT";

    };

    speech.onend = function () {

        aiStatus.textContent = "STANDBY";
        voiceStatus.textContent = "READY";

    };

    window.speechSynthesis.speak(speech);
}


// ============================================================
// TIME
// ============================================================

function updateTime() {

    const now = new Date();

    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");

    timeElement.textContent =
        `${hours}:${minutes}:${seconds}`;
}


// ============================================================
// DATE
// ============================================================

function updateDate() {

    const now = new Date();

    const day = String(now.getDate()).padStart(2, "0");
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const year = now.getFullYear();

    dateElement.textContent =
        `${day}/${month}/${year}`;
}


// ============================================================
// START CLOCK
// ============================================================

setInterval(updateTime, 1000);

updateTime();
updateDate();


// ============================================================
// LOCATION
// ============================================================

function getLocation() {

    if (!navigator.geolocation) {

        locationElement.textContent = "NOT SUPPORTED";

        return;
    }

    locationElement.textContent = "REQUESTING...";

    navigator.geolocation.getCurrentPosition(

        function (position) {

            const latitude =
                position.coords.latitude.toFixed(4);

            const longitude =
                position.coords.longitude.toFixed(4);

            locationElement.textContent =
                `${latitude}, ${longitude}`;

        },

        function () {

            locationElement.textContent =
                "PERMISSION NEEDED";

        },

        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 60000
        }

    );
}

getLocation();


// ============================================================
// VOICE RECOGNITION SUPPORT
// ============================================================

const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;


if (SpeechRecognition) {

    recognition = new SpeechRecognition();

    recognition.continuous = false;

    recognition.interimResults = false;

    recognition.lang = "en-IN";


    // ========================================================
    // VOICE START
    // ========================================================

    recognition.onstart = function () {

        isListening = true;

        voiceStatus.textContent = "LISTENING";

        aiStatus.textContent = "LISTENING";

        modeStatus.textContent = "VOICE";

        showMessage(
            "I'M LISTENING, BOSS.",
            "SPEAK YOUR COMMAND"
        );

        voiceButton.classList.add("active");

    };


    // ========================================================
    // VOICE RESULT
    // ========================================================

    recognition.onresult = function (event) {

        const transcript =
            event.results[0][0].transcript.trim();

        console.log("User:", transcript);

        showMessage(
            transcript.toUpperCase(),
            "COMMAND RECEIVED"
        );

        processCommand(transcript);

    };


    // ========================================================
    // VOICE END
    // ========================================================

    recognition.onend = function () {

        isListening = false;

        voiceStatus.textContent = "READY";

        aiStatus.textContent = "STANDBY";

        modeStatus.textContent = "JARVIS";

        voiceButton.classList.remove("active");

    };


    // ========================================================
    // VOICE ERROR
    // ========================================================

    recognition.onerror = function (event) {

        console.log(
            "Speech recognition error:",
            event.error
        );

        isListening = false;

        voiceStatus.textContent = "READY";

        aiStatus.textContent = "STANDBY";

        voiceButton.classList.remove("active");

        if (event.error === "not-allowed") {

            showMessage(
                "MICROPHONE PERMISSION REQUIRED",
                "PLEASE ALLOW MICROPHONE ACCESS"
            );

            speak(
                "Boss, please allow microphone permission.",
                "en-IN"
            );

        } else {

            showMessage(
                "VOICE INPUT ERROR",
                "PLEASE TRY AGAIN"
            );

        }

    };

}


// ============================================================
// VOICE BUTTON
// ============================================================

voiceButton.addEventListener("click", function () {

    if (!recognition) {

        showMessage(
            "VOICE RECOGNITION NOT SUPPORTED",
            "USE A SUPPORTED BROWSER"
        );

        speak(
            "Boss, voice recognition is not supported in this browser.",
            "en-IN"
        );

        return;
    }


    if (isListening) {

        recognition.stop();

        return;
    }


    try {

        recognition.start();

    } catch (error) {

        console.log(error);

    }

});


// ============================================================
// COMMAND PROCESSOR
// ============================================================

function processCommand(command) {

    const text = command.toLowerCase().trim();


    // --------------------------------------------------------
    // HELLO
    // --------------------------------------------------------

    if (
        text.includes("hello") ||
        text.includes("hi jarvis") ||
        text.includes("hey jarvis") ||
        text.includes("హాయ్")
    ) {

        showMessage(
            "HELLO BOSS.",
            "J.A.R.V.I.S ONLINE"
        );

        speak(
            "Hello Boss. JARVIS is online.",
            "en-IN"
        );

        return;
    }


    // --------------------------------------------------------
    // WHO ARE YOU
    // --------------------------------------------------------

    if (
        text.includes("who are you") ||
        text.includes("what are you")
    ) {

        showMessage(
            "I AM J.A.R.V.I.S.",
            "JUST A RATHER VERY INTELLIGENT SYSTEM"
        );

        speak(
            "I am JARVIS, your intelligent personal assistant.",
            "en-IN"
        );

        return;
    }


    // --------------------------------------------------------
    // TIME
    // --------------------------------------------------------

    if (
        text.includes("time") ||
        text.includes("what time")
    ) {

        const now = new Date();

        const timeText =
            now.toLocaleTimeString(
                "en-IN",
                {
                    hour: "numeric",
                    minute: "2-digit"
                }
            );

        showMessage(
            timeText.toUpperCase(),
            "CURRENT TIME"
        );

        speak(
            `Boss, the time is ${timeText}.`,
            "en-IN"
        );

        return;
    }


    // --------------------------------------------------------
    // DATE
    // --------------------------------------------------------

    if (
        text.includes("date") ||
        text.includes("today")
    ) {

        const now = new Date();

        const dateText =
            now.toLocaleDateString(
                "en-IN",
                {
                    day: "numeric",
                    month: "long",
                    year: "numeric"
                }
            );

        showMessage(
            dateText.toUpperCase(),
            "CURRENT DATE"
        );

        speak(
            `Boss, today is ${dateText}.`,
            "en-IN"
        );

        return;
    }


    // --------------------------------------------------------
    // LOCATION
    // --------------------------------------------------------

    if (
        text.includes("where am i") ||
        text.includes("my location") ||
        text.includes("location")
    ) {

        getLocation();

        showMessage(
            "CHECKING LOCATION...",
            "GPS REQUEST"
        );

        speak(
            "Boss, checking your current location.",
            "en-IN"
        );

        return;
    }


    // --------------------------------------------------------
    // OPEN GOOGLE
    // --------------------------------------------------------

    if (
        text.includes("open google")
    ) {

        showMessage(
            "OPENING GOOGLE...",
            "COMMAND EXECUTED"
        );

        speak(
            "Opening Google, Boss.",
            "en-IN"
        );

        setTimeout(function () {

            window.open(
                "https://www.google.com",
                "_blank"
            );

        }, 1000);

        return;
    }


    // --------------------------------------------------------
    // OPEN YOUTUBE
    // --------------------------------------------------------

    if (
        text.includes("open youtube")
    ) {

        showMessage(
            "OPENING YOUTUBE...",
            "COMMAND EXECUTED"
        );

        speak(
            "Opening YouTube, Boss.",
            "en-IN"
        );

        setTimeout(function () {

            window.open(
                "https://www.youtube.com",
                "_blank"
            );

        }, 1000);

        return;
    }


    // --------------------------------------------------------
    // UNKNOWN COMMAND
    // --------------------------------------------------------

    showMessage(
        "COMMAND RECEIVED",
        "PROCESSING..."
    );

    speak(
        `Boss, I heard ${command}. I am not yet connected to my AI brain for this command.`,
        "en-IN"
    );

}


// ============================================================
// INITIAL JARVIS MESSAGE
// ============================================================

setTimeout(function () {

    showMessage(
        "GOOD EVENING, BOSS.",
        "J.A.R.V.I.S INITIALIZATION COMPLETE"
    );

}, 1000);


// ============================================================
// INITIAL SPEECH
// ============================================================

console.log(
    "J.A.R.V.I.S JavaScript Core initialized."
);
