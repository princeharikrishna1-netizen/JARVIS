// =====================================================
// J.A.R.V.I.S - AI CORE
// Gemini + Cloudflare + Memory + Voice + HUD
// Telugu + English Voice
// Phase 2: Weather + Location + Time + Date
// =====================================================


// =====================================================
// CONFIGURATION
// =====================================================

const JARVIS_API =
    "https://jarvis.princeharikrishna1.workers.dev/api/chat";

const WEATHER_API =
    "https://api.open-meteo.com/v1/forecast";

const MEMORY_KEY =
    "jarvisMemory";


// =====================================================
// ELEMENTS
// =====================================================

const chat =
    document.getElementById("chat");

const msg =
    document.getElementById("msg");

const send =
    document.getElementById("send");

const micBtn =
    document.getElementById("mic-btn");

const camBtn =
    document.getElementById("cam-btn");

const clearBtn =
    document.getElementById("clear-btn");

const imgInput =
    document.getElementById("img-input");

const coreStatus =
    document.querySelector(".core-status");


// =====================================================
// MEMORY
// =====================================================

let memory = [];

try {

    const saved =
        localStorage.getItem(
            MEMORY_KEY
        );

    if (saved) {

        memory =
            JSON.parse(saved);

    }

} catch (error) {

    console.error(
        "Memory load error:",
        error
    );

    memory = [];

}


// =====================================================
// HUD STATE
// =====================================================

function setHudState(
    state = "ready"
) {

    document.body.classList.remove(
        "thinking",
        "listening",
        "speaking"
    );


    if (state === "thinking") {

        document.body.classList.add(
            "thinking"
        );

        setStatus(
            "THINKING..."
        );

    }

    else if (state === "listening") {

        document.body.classList.add(
            "listening"
        );

        setStatus(
            "LISTENING..."
        );

    }

    else if (state === "speaking") {

        document.body.classList.add(
            "speaking"
        );

        setStatus(
            "SPEAKING..."
        );

    }

    else {

        setStatus(
            "SYSTEM READY"
        );

    }

}


// =====================================================
// STATUS
// =====================================================

function setStatus(
    text
) {

    if (coreStatus) {

        coreStatus.textContent =
            text;

    }

}


// =====================================================
// SAVE MEMORY
// =====================================================

function saveMemory() {

    try {

        localStorage.setItem(
            MEMORY_KEY,
            JSON.stringify(
                memory.slice(-30)
            )
        );

    }

    catch (error) {

        console.error(
            "Memory save error:",
            error
        );

    }

}


// =====================================================
// ADD MESSAGE
// =====================================================

function addMessage(
    text,
    sender = "jarvis",
    save = true
) {

    if (!text) {
        return;
    }


    const message =
        document.createElement(
            "div"
        );


    message.className =
        `message ${sender}`;


    const label =
        document.createElement(
            "div"
        );


    label.className =
        "message-label";


    label.textContent =
        sender === "user"
            ? "BOSS"
            : "J.A.R.V.I.S";


    const content =
        document.createElement(
            "div"
        );


    content.className =
        "message-content";


    content.textContent =
        text;


    message.appendChild(
        label
    );


    message.appendChild(
        content
    );


    chat.appendChild(
        message
    );


    chat.scrollTop =
        chat.scrollHeight;


    if (save) {

        memory.push({

            role:
                sender === "user"
                    ? "user"
                    : "model",

            text:
                text,

            time:
                new Date()
                    .toISOString()

        });


        saveMemory();

    }

}


// =====================================================
// LOAD MEMORY
// =====================================================

function loadMemory() {

    if (!Array.isArray(memory)) {

        memory = [];

        return;

    }


    memory
        .slice(-20)
        .forEach(item => {

            addMessage(

                item.text,

                item.role === "user"
                    ? "user"
                    : "jarvis",

                false

            );

        });

}


// =====================================================
// VOICE ENGINE
// TELUGU + ENGLISH
// =====================================================

function speak(
    text
) {

    if (
        !(
            "speechSynthesis"
            in window
        )
    ) {

        console.warn(
            "Speech synthesis not supported."
        );

        return;

    }


    window.speechSynthesis.cancel();


    const cleanText =
        text
            .replace(
                /[*_#`]/g,
                ""
            )
            .trim();


    if (!cleanText) {
        return;
    }


    const isTelugu =
        /[\u0C00-\u0C7F]/
            .test(
                cleanText
            );


    const language =
        isTelugu
            ? "te-IN"
            : "en-IN";


    const utterance =
        new SpeechSynthesisUtterance(
            cleanText
        );


    utterance.lang =
        language;


    utterance.rate =
        isTelugu
            ? 0.90
            : 0.95;


    utterance.pitch =
        1.0;


    utterance.volume =
        1.0;


    // ---------------------------------------------
    // FIND AVAILABLE VOICE
    // ---------------------------------------------

    const voices =
        window.speechSynthesis
            .getVoices();


    let selectedVoice =
        null;


    if (isTelugu) {

        // Telugu voice
        selectedVoice =
            voices.find(
                voice =>
                    voice.lang
                        .toLowerCase()
                        .startsWith(
                            "te"
                        )
            );


    }

    else {

        // Indian English voice
        selectedVoice =
            voices.find(
                voice =>
                    voice.lang
                        .toLowerCase()
                        .startsWith(
                            "en-in"
                        )
            );


        // Any English voice fallback
        if (!selectedVoice) {

            selectedVoice =
                voices.find(
                    voice =>
                        voice.lang
                            .toLowerCase()
                            .startsWith(
                                "en"
                            )
                );

        }

    }


    if (selectedVoice) {

        utterance.voice =
            selectedVoice;

        console.log(
            "J.A.R.V.I.S voice:",
            selectedVoice.name,
            selectedVoice.lang
        );

    }

    else {

        console.warn(
            "No dedicated voice found for:",
            language
        );

    }


    // ---------------------------------------------
    // SPEAKING START
    // ---------------------------------------------

    utterance.onstart =
        () => {

            setHudState(
                "speaking"
            );

        };


    // ---------------------------------------------
    // SPEAKING END
    // ---------------------------------------------

    utterance.onend =
        () => {

            setHudState(
                "ready"
            );

        };


    // ---------------------------------------------
    // SPEECH ERROR
    // ---------------------------------------------

    utterance.onerror =
        error => {

            console.error(
                "J.A.R.V.I.S speech error:",
                error
            );

            setHudState(
                "ready"
            );

        };


    window.speechSynthesis.speak(
        utterance
    );

}


// =====================================================
// LOAD AVAILABLE VOICES
// =====================================================

if (
    "speechSynthesis"
    in window
) {

    window.speechSynthesis
        .onvoiceschanged =
        () => {

            const voices =
                window.speechSynthesis
                    .getVoices();


            console.log(
                "Available voices:",
                voices.length
            );


            const teluguVoice =
                voices.find(
                    voice =>
                        voice.lang
                            .toLowerCase()
                            .startsWith(
                                "te"
                            )
                );


            if (teluguVoice) {

                console.log(
                    "Telugu voice available:",
                    teluguVoice.name,
                    teluguVoice.lang
                );

            }

            else {

                console.log(
                    "Dedicated Telugu voice is not available in this browser."
                );

            }

        };

}


// =====================================================
// LOCAL COMMANDS
// =====================================================

function handleLocalCommand(
    command
) {

    const text =
        command
            .toLowerCase()
            .trim();


    // ---------------------------------------------
    // HELLO
    // ---------------------------------------------

    if (

        text === "hello" ||

        text === "hi" ||

        text === "hey" ||

        text === "హలో" ||

        text === "హాయ్"

    ) {

        return (
            "Hello Boss. J.A.R.V.I.S is online and ready."
        );

    }


    // ---------------------------------------------
    // WHO ARE YOU
    // ---------------------------------------------

    if (

        text.includes(
            "who are you"
        ) ||

        text.includes(
            "neevaru"
        ) ||

        text.includes(
            "నువ్వెవరు"
        )

    ) {

        return (
            "I am J.A.R.V.I.S, your personal artificial intelligence assistant."
        );

    }


    // ---------------------------------------------
    // TIME
    // ---------------------------------------------

    if (

        text === "time" ||

        text.includes(
            "what time"
        ) ||

        text.includes(
            "current time"
        ) ||

        text.includes(
            "time now"
        ) ||

        text.includes(
            "సమయం"
        )

    ) {

        return (

            `Boss, the current time is ${
                new Date()
                    .toLocaleTimeString(
                        "en-IN",
                        {
                            hour:
                                "numeric",

                            minute:
                                "2-digit",

                            second:
                                "2-digit"
                        }
                    )
            }.`

        );

    }


    // ---------------------------------------------
    // DATE
    // ---------------------------------------------

    if (

        text === "date" ||

        text.includes(
            "today date"
        ) ||

        text.includes(
            "today's date"
        ) ||

        text.includes(
            "what is today's date"
        ) ||

        text.includes(
            "తేదీ"
        )

    ) {

        return (

            `Boss, today is ${
                new Date()
                    .toLocaleDateString(
                        "en-IN",
                        {
                            weekday:
                                "long",

                            day:
                                "numeric",

                            month:
                                "long",

                            year:
                                "numeric"
                        }
                    )
            }.`

        );

    }


    return null;

}


// =====================================================
// GET GPS COORDINATES
// =====================================================

function getCoordinates() {

    return new Promise(
        resolve => {

            if (
                !navigator.geolocation
            ) {

                resolve({

                    success:
                        false,

                    error:
                        "This browser does not support GPS location."

                });

                return;

            }


            navigator.geolocation
                .getCurrentPosition(

                    position => {

                        resolve({

                            success:
                                true,

                            latitude:
                                position
                                    .coords
                                    .latitude,

                            longitude:
                                position
                                    .coords
                                    .longitude,

                            accuracy:
                                position
                                    .coords
                                    .accuracy

                        });

                    },


                    error => {

                        console.error(
                            "Location error:",
                            error
                        );


                        resolve({

                            success:
                                false,

                            error:
                                "Location permission was denied or location could not be obtained."

                        });

                    },


                    {

                        enableHighAccuracy:
                            true,

                        timeout:
                            15000,

                        maximumAge:
                            0

                    }

                );

        }
    );

}


// =====================================================
// REVERSE GEOCODING
// =====================================================

async function reverseGeocode(
    latitude,
    longitude
) {

    try {

        const url =
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`;


        const response =
            await fetch(
                url
            );


        if (!response.ok) {
            return null;
        }


        return await response.json();

    }

    catch (error) {

        console.error(
            "Reverse geocoding error:",
            error
        );

        return null;

    }

}


// =====================================================
// DETAILED LOCATION
// =====================================================

async function getDetailedLocation() {

    const location =
        await getCoordinates();


    if (
        !location.success
    ) {

        return (

            `Boss, ${location.error} Please allow location permission for J.A.R.V.I.S.`

        );

    }


    const latitude =
        location.latitude
            .toFixed(6);


    const longitude =
        location.longitude
            .toFixed(6);


    const accuracy =
        Math.round(
            location.accuracy
        );


    const address =
        await reverseGeocode(

            location.latitude,

            location.longitude

        );


    if (!address) {

        return (

            `Boss, your coordinates are latitude ${latitude}, longitude ${longitude}. Accuracy is approximately ${accuracy} meters.`

        );

    }


    const a =
        address.address || {};


    const area =
        a.suburb ||
        a.village ||
        a.town ||
        a.city_district ||
        "";


    const city =
        a.city ||
        a.town ||
        a.municipality ||
        a.county ||
        "";


    const state =
        a.state ||
        "";


    const country =
        a.country ||
        "";


    let result =
        "Boss, your current location is approximately ";


    result +=
        area
            ? area + ", "
            : "";


    result +=
        city
            ? city + ", "
            : "";


    result +=
        state
            ? state + ", "
            : "";


    result +=
        country;


    result +=
        ". ";


    result +=
        `Your coordinates are latitude ${latitude}, longitude ${longitude}. `;


    result +=
        `GPS accuracy is approximately ${accuracy} meters.`;


    return result;

}


// =====================================================
// WEATHER
// =====================================================

async function getWeather() {

    const location =
        await getCoordinates();


    if (
        !location.success
    ) {

        return (

            `Boss, I need your location to get the weather. ${location.error}`

        );

    }


    try {

        const latitude =
            location.latitude;


        const longitude =
            location.longitude;


        const url =
            `${WEATHER_API}` +

            `?latitude=${latitude}` +

            `&longitude=${longitude}` +

            `&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,weather_code,wind_speed_10m,wind_direction_10m` +

            `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset` +

            `&timezone=auto`;


        const response =
            await fetch(
                url
            );


        if (!response.ok) {

            throw new Error(
                "Weather API request failed."
            );

        }


        const data =
            await response.json();


        const current =
            data.current;


        const daily =
            data.daily;


        const temperature =
            Math.round(
                current
                    .temperature_2m
            );


        const feelsLike =
            Math.round(
                current
                    .apparent_temperature
            );


        const humidity =
            Math.round(
                current
                    .relative_humidity_2m
            );


        const wind =
            Math.round(
                current
                    .wind_speed_10m
            );


        const condition =
            getWeatherDescription(
                current.weather_code
            );


        const maxTemp =
            Math.round(
                daily
                    .temperature_2m_max[0]
            );


        const minTemp =
            Math.round(
                daily
                    .temperature_2m_min[0]
            );


        const rainChance =
            daily
                .precipitation_probability_max?.[0]
            ?? 0;


        const sunrise =
            formatTime(
                daily.sunrise?.[0]
            );


        const sunset =
            formatTime(
                daily.sunset?.[0]
            );


        const locationName =
            await getLocationName(

                latitude,

                longitude

            );


        return (

            `Boss, here is the current weather` +

            `${
                locationName
                    ? " for " +
                      locationName
                    : ""
            }.\n\n` +

            `Temperature: ${temperature}°C\n` +

            `Feels like: ${feelsLike}°C\n` +

            `Condition: ${condition}\n` +

            `Humidity: ${humidity}%\n` +

            `Wind: ${wind} km/h\n` +

            `Today's range: ${minTemp}°C to ${maxTemp}°C\n` +

            `Rain probability: ${rainChance}%\n` +

            `Sunrise: ${sunrise}\n` +

            `Sunset: ${sunset}`

        );

    }

    catch (error) {

        console.error(
            "Weather error:",
            error
        );


        return (
            "Boss, I could not retrieve the current weather right now."
        );

    }

}


// =====================================================
// WEATHER DESCRIPTION
// =====================================================

function getWeatherDescription(
    code
) {

    const descriptions = {

        0:
            "Clear sky",

        1:
            "Mainly clear",

        2:
            "Partly cloudy",

        3:
            "Overcast",

        45:
            "Foggy",

        48:
            "Depositing rime fog",

        51:
            "Light drizzle",

        53:
            "Moderate drizzle",

        55:
            "Dense drizzle",

        56:
            "Light freezing drizzle",

        57:
            "Dense freezing drizzle",

        61:
            "Slight rain",

        63:
            "Moderate rain",

        65:
            "Heavy rain",

        66:
            "Light freezing rain",

        67:
            "Heavy freezing rain",

        71:
            "Slight snow",

        73:
            "Moderate snow",

        75:
            "Heavy snow",

        77:
            "Snow grains",

        80:
            "Slight rain showers",

        81:
            "Moderate rain showers",

        82:
            "Violent rain showers",

        85:
            "Slight snow showers",

        86:
            "Heavy snow showers",

        95:
            "Thunderstorm",

        96:
            "Thunderstorm with slight hail",

        99:
            "Thunderstorm with heavy hail"

    };


    return (

        descriptions[code] ||
        "Unknown weather condition"

    );

}


// =====================================================
// FORMAT TIME
// =====================================================

function formatTime(
    value
) {

    if (!value) {
        return "Unknown";
    }


    try {

        return new Date(
            value
        ).toLocaleTimeString(

            "en-IN",

            {

                hour:
                    "numeric",

                minute:
                    "2-digit"

            }

        );

    }

    catch {

        return value;

    }

}


// =====================================================
// LOCATION NAME
// =====================================================

async function getLocationName(
    latitude,
    longitude
) {

    try {

        const data =
            await reverseGeocode(

                latitude,

                longitude

            );


        if (!data) {
            return "";
        }


        const a =
            data.address || {};


        return (

            a.city ||

            a.town ||

            a.village ||

            a.municipality ||

            a.county ||

            ""

        );

    }

    catch {

        return "";

    }

}


// =====================================================
// OPEN WEBSITE
// =====================================================

function openWebsite(
    url
) {

    window.open(
        url,
        "_blank"
    );

}


// =====================================================
// SPECIAL COMMANDS
// =====================================================

async function checkSpecialCommand(
    command
) {

    const text =
        command
            .toLowerCase()
            .trim();


    // ---------------------------------------------
    // LOCATION
    // ---------------------------------------------

    if (

        text.includes(
            "my location"
        ) ||

        text.includes(
            "where am i"
        ) ||

        text.includes(
            "current location"
        ) ||

        text.includes(
            "నా లొకేషన్"
        ) ||

        text.includes(
            "నా location"
        ) ||

        text.includes(
            "నేను ఎక్కడ"
        ) ||

        text.includes(
            "location cheppu"
        )

    ) {

        return await getDetailedLocation();

    }


    // ---------------------------------------------
    // WEATHER
    // ---------------------------------------------

    if (

        text.includes(
            "weather"
        ) ||

        text.includes(
            "temperature"
        ) ||

        text.includes(
            "weather cheppu"
        ) ||

        text.includes(
            "weather ela undi"
        ) ||

        text.includes(
            "వాతావరణం"
        ) ||

        text.includes(
            "వెదర్"
        )

    ) {

        return await getWeather();

    }


    // ---------------------------------------------
    // GOOGLE
    // ---------------------------------------------

    if (
        text ===
        "open google"
    ) {

        openWebsite(
            "https://www.google.com"
        );


        return (
            "Opening Google, Boss."
        );

    }


    // ---------------------------------------------
    // YOUTUBE
    // ---------------------------------------------

    if (
        text ===
        "open youtube"
    ) {

        openWebsite(
            "https://www.youtube.com"
        );


        return (
            "Opening YouTube, Boss."
        );

    }


    // ---------------------------------------------
    // GOOGLE SEARCH
    // ---------------------------------------------

    if (
        text.startsWith(
            "google search "
        )
    ) {

        const query =
            command
                .substring(
                    "google search ".length
                )
                .trim();


        if (query) {

            openWebsite(

                "https://www.google.com/search?q=" +

                encodeURIComponent(
                    query
                )

            );


            return (
                `Searching Google for ${query}.`
            );

        }

    }


    // ---------------------------------------------
    // YOUTUBE SEARCH
    // ---------------------------------------------

    if (
        text.startsWith(
            "youtube search "
        )
    ) {

        const query =
            command
                .substring(
                    "youtube search ".length
                )
                .trim();


        if (query) {

            openWebsite(

                "https://www.youtube.com/results?search_query=" +

                encodeURIComponent(
                    query
                )

            );


            return (
                `Searching YouTube for ${query}.`
            );

        }

    }


    return null;

}


// =====================================================
// GEMINI AI
// =====================================================

async function askGemini(
    userMessage
) {

    setHudState(
        "thinking"
    );


    const history =
        memory
            .slice(-12)
            .map(item => ({

                role:
                    item.role === "model"
                        ? "model"
                        : "user",

                text:
                    item.text

            }));


    try {

        const response =
            await fetch(

                JARVIS_API,

                {

                    method:
                        "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body:
                        JSON.stringify({

                            message:
                                userMessage,

                            history:
                                history

                        })

                }

            );


        const data =
            await response.json();


        if (!response.ok) {

            console.error(
                "JARVIS API Error:",
                data
            );


            throw new Error(

                data.error ||
                "Gemini request failed."

            );

        }


        if (
            !data.success ||
            !data.reply
        ) {

            throw new Error(

                data.error ||
                "No response from Gemini."

            );

        }


        setHudState(
            "ready"
        );


        return data.reply;

    }

    catch (error) {

        console.error(
            "Gemini connection error:",
            error
        );


        setHudState(
            "ready"
        );


        return (

            "Boss, I could not connect to my AI brain right now. Please check the Cloudflare Worker connection."

        );

    }

}


// =====================================================
// MAIN JARVIS PROCESSOR
// =====================================================

async function processCommand(
    command
) {

    const originalCommand =
        command.trim();


    if (!originalCommand) {
        return;
    }


    // USER MESSAGE

    addMessage(
        originalCommand,
        "user"
    );


    // ---------------------------------------------
    // CLEAR MEMORY
    // ---------------------------------------------

    if (

        originalCommand
            .toLowerCase()
            .trim() ===
        "clear memory"

    ) {

        memory = [];


        localStorage.removeItem(
            MEMORY_KEY
        );


        chat.innerHTML =
            "";


        const response =
            "Memory cleared, Boss.";


        addMessage(
            response,
            "jarvis"
        );


        speak(
            response
        );


        return;

    }


    // ---------------------------------------------
    // LOCAL COMMAND
    // ---------------------------------------------

    const localResponse =
        handleLocalCommand(
            originalCommand
        );


    if (localResponse) {

        addMessage(
            localResponse,
            "jarvis"
        );


        speak(
            localResponse
        );


        setHudState(
            "ready"
        );


        return;

    }


    // ---------------------------------------------
    // SPECIAL COMMAND
    // ---------------------------------------------

    const specialResponse =
        await checkSpecialCommand(
            originalCommand
        );


    if (specialResponse) {

        addMessage(
            specialResponse,
            "jarvis"
        );


        speak(
            specialResponse
        );


        setHudState(
            "ready"
        );


        return;

    }


    // ---------------------------------------------
    // GEMINI
    // ---------------------------------------------

    const aiResponse =
        await askGemini(
            originalCommand
        );


    addMessage(
        aiResponse,
        "jarvis"
    );


    speak(
        aiResponse
    );

}


// =====================================================
// SEND BUTTON
// =====================================================

send.addEventListener(
    "click",

    async () => {

        const command =
            msg.value.trim();


        if (!command) {
            return;
        }


        msg.value =
            "";


        send.disabled =
            true;


        micBtn.disabled =
            true;


        try {

            await processCommand(
                command
            );

        }

        finally {

            send.disabled =
                false;


            micBtn.disabled =
                false;


            msg.focus();

        }

    }

);


// =====================================================
// ENTER KEY
// =====================================================

msg.addEventListener(
    "keydown",

    event => {

        if (
            event.key ===
            "Enter"
        ) {

            event.preventDefault();

            send.click();

        }

    }

);


// =====================================================
// SPEECH RECOGNITION
// =====================================================

const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;


let recognition =
    null;


let isListening =
    false;


if (SpeechRecognition) {

    recognition =
        new SpeechRecognition();


    recognition.continuous =
        false;


    recognition.interimResults =
        false;


    recognition.lang =
        "en-IN";


    // ---------------------------------------------
    // LISTENING START
    // ---------------------------------------------

    recognition.onstart =
        () => {

            isListening =
                true;


            micBtn.classList.add(
                "active"
            );


            setHudState(
                "listening"
            );

        };


    // ---------------------------------------------
    // VOICE RESULT
    // ---------------------------------------------

    recognition.onresult =
        event => {

            const transcript =
                event
                    .results[0][0]
                    .transcript
                    .trim();


            msg.value =
                transcript;


            processVoiceCommand(
                transcript
            );

        };


    // ---------------------------------------------
    // VOICE ERROR
    // ---------------------------------------------

    recognition.onerror =
        event => {

            console.error(
                "Speech recognition error:",
                event.error
            );


            isListening =
                false;


            micBtn.classList.remove(
                "active"
            );


            setHudState(
                "ready"
            );

        };


    // ---------------------------------------------
    // LISTENING END
    // ---------------------------------------------

    recognition.onend =
        () => {

            isListening =
                false;


            micBtn.classList.remove(
                "active"
            );


            if (

                document.body
                    .classList
                    .contains(
                        "listening"
                    )

            ) {

                setHudState(
                    "ready"
                );

            }

        };

}


// =====================================================
// PROCESS VOICE COMMAND
// =====================================================

async function processVoiceCommand(
    transcript
) {

    if (!transcript) {
        return;
    }


    msg.value =
        "";


    send.disabled =
        true;


    micBtn.disabled =
        true;


    try {

        await processCommand(
            transcript
        );

    }

    finally {

        send.disabled =
            false;


        micBtn.disabled =
            false;

    }

}


// =====================================================
// MICROPHONE BUTTON
// =====================================================

micBtn.addEventListener(
    "click",

    () => {

        if (!recognition) {

            const response =
                "Boss, voice recognition is not supported by this browser.";


            addMessage(
                response,
                "jarvis"
            );


            speak(
                response
            );


            return;

        }


        if (isListening) {

            recognition.stop();

            return;

        }


        try {

            // English + Telugu friendly
            recognition.lang =
                "en-IN";


            recognition.start();

        }

        catch (error) {

            console.error(
                "Microphone start error:",
                error
            );

        }

    }

);


// =====================================================
// CAMERA / IMAGE
// =====================================================

camBtn.addEventListener(
    "click",

    () => {

        imgInput.click();

    }

);


imgInput.addEventListener(
    "change",

    () => {

        const file =
            imgInput.files?.[0];


        if (!file) {
            return;
        }


        const response =
            `Boss, I received the image "${file.name}". Vision analysis will be connected next.`;


        addMessage(
            response,
            "jarvis"
        );


        speak(
            response
        );


        imgInput.value =
            "";

    }

);


// =====================================================
// CLEAR MEMORY
// =====================================================

clearBtn.addEventListener(
    "click",

    () => {

        memory = [];


        localStorage.removeItem(
            MEMORY_KEY
        );


        chat.innerHTML =
            "";


        const response =
            "Long-term memory cleared, Boss.";


        addMessage(
            response,
            "jarvis"
        );


        speak(
            response
        );

    }

);


// =====================================================
// INITIALIZE
// =====================================================

loadMemory();


setHudState(
    "ready"
);


console.log(
    "===================================="
);

console.log(
    "J.A.R.V.I.S AI CORE ONLINE"
);

console.log(
    "Gemini + Memory + Voice + HUD"
);

console.log(
    "Telugu + English Voice"
);

console.log(
    "Weather + Location + Time + Date"
);

console.log(
    "Google + YouTube Commands"
);

console.log(
    "===================================="
);

console.log(
    "Cloudflare Gemini endpoint:",
    JARVIS_API
);