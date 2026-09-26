// =====================================================
// J.A.R.V.I.S - AI CORE
// Gemini + Cloudflare Worker + Voice + Memory
// =====================================================

// =====================================================
// CONFIGURATION
// =====================================================

const JARVIS_API =
    "https://jarvis.princeharikrishna1.workers.dev/api/chat";


// =====================================================
// ELEMENTS
// =====================================================

const chat = document.getElementById("chat");
const msg = document.getElementById("msg");
const send = document.getElementById("send");
const micBtn = document.getElementById("mic-btn");
const camBtn = document.getElementById("cam-btn");
const clearBtn = document.getElementById("clear-btn");
const imgInput = document.getElementById("img-input");
const coreStatus = document.querySelector(".core-status");


// =====================================================
// MEMORY
// =====================================================

const MEMORY_KEY = "jarvisMemory";

let memory = [];

try {
    const saved = localStorage.getItem(MEMORY_KEY);

    if (saved) {
        memory = JSON.parse(saved);
    }
} catch (error) {
    console.error("Memory load error:", error);
    memory = [];
}


// =====================================================
// SAVE MEMORY
// =====================================================

function saveMemory() {

    try {

        localStorage.setItem(
            MEMORY_KEY,
            JSON.stringify(memory.slice(-30))
        );

    } catch (error) {

        console.error("Memory save error:", error);

    }

}


// =====================================================
// ADD MESSAGE TO UI
// =====================================================

function addMessage(
    text,
    sender = "jarvis",
    save = true
) {

    if (!text) return;


    const message = document.createElement("div");

    message.className =
        `message ${sender}`;


    const label = document.createElement("div");

    label.className = "message-label";

    label.textContent =
        sender === "user"
            ? "BOSS"
            : "J.A.R.V.I.S";


    const content = document.createElement("div");

    content.className = "message-content";

    content.textContent = text;


    message.appendChild(label);

    message.appendChild(content);

    chat.appendChild(message);


    chat.scrollTop =
        chat.scrollHeight;


    if (save) {

        memory.push({

            role:
                sender === "user"
                    ? "user"
                    : "model",

            text: text,

            time:
                new Date().toISOString()

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
// SPEECH
// =====================================================

function speak(text) {

    if (
        !("speechSynthesis" in window)
    ) {
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


    if (!cleanText) return;


    const utterance =
        new SpeechSynthesisUtterance(
            cleanText
        );


    // Telugu / English support
    if (
        /[\u0C00-\u0C7F]/.test(cleanText)
    ) {

        utterance.lang = "te-IN";

    } else {

        utterance.lang = "en-IN";

    }


    utterance.rate = 0.95;

    utterance.pitch = 1.0;

    utterance.volume = 1.0;


    window.speechSynthesis.speak(
        utterance
    );

}


// =====================================================
// STATUS
// =====================================================

function setStatus(text) {

    if (coreStatus) {

        coreStatus.textContent =
            text;

    }

}


// =====================================================
// LOCAL COMMANDS
// =====================================================

function handleLocalCommand(command) {

    const text =
        command
            .toLowerCase()
            .trim();


    // -----------------------------------------------
    // GREETING
    // -----------------------------------------------

    if (
        text === "hello" ||
        text === "hi" ||
        text === "hey" ||
        text === "హలో" ||
        text === "హాయ్"
    ) {

        return "Hello Boss. J.A.R.V.I.S is online and ready.";

    }


    // -----------------------------------------------
    // WHO ARE YOU
    // -----------------------------------------------

    if (
        text.includes("who are you") ||
        text.includes("neevaru") ||
        text.includes("నువ్వెవరు")
    ) {

        return "I am J.A.R.V.I.S, your personal artificial intelligence assistant.";

    }


    // -----------------------------------------------
    // TIME
    // -----------------------------------------------

    if (
        text === "time" ||
        text.includes("what time") ||
        text.includes("సమయం")
    ) {

        return `Boss, the current time is ${new Date().toLocaleTimeString(
            "en-IN",
            {
                hour: "numeric",
                minute: "2-digit",
                second: "2-digit"
            }
        )}.`;

    }


    // -----------------------------------------------
    // DATE
    // -----------------------------------------------

    if (
        text === "date" ||
        text.includes("today date") ||
        text.includes("తేదీ")
    ) {

        return `Boss, today is ${new Date().toLocaleDateString(
            "en-IN",
            {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric"
            }
        )}.`;

    }


    return null;

}


// =====================================================
// LOCATION
// =====================================================

function getLocation() {

    return new Promise(
        resolve => {

            if (
                !navigator.geolocation
            ) {

                resolve(
                    "Boss, this browser does not support location."
                );

                return;

            }


            navigator.geolocation.getCurrentPosition(

                position => {

                    const latitude =
                        position.coords.latitude
                            .toFixed(6);

                    const longitude =
                        position.coords.longitude
                            .toFixed(6);

                    const accuracy =
                        Math.round(
                            position.coords.accuracy
                        );


                    resolve(

                        `Boss, your current coordinates are latitude ${latitude}, longitude ${longitude}. Accuracy is approximately ${accuracy} meters.`

                    );

                },


                error => {

                    console.error(
                        "Location error:",
                        error
                    );


                    resolve(
                        "Boss, I could not access your location. Please allow location permission for J.A.R.V.I.S."
                    );

                },

                {

                    enableHighAccuracy: true,

                    timeout: 10000,

                    maximumAge: 0

                }

            );

        }
    );

}


// =====================================================
// OPEN WEBSITE
// =====================================================

function openWebsite(url) {

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


    // -----------------------------------------------
    // LOCATION
    // -----------------------------------------------

    if (
        text.includes("my location") ||
        text.includes("where am i") ||
        text.includes("నా లొకేషన్") ||
        text.includes("నేను ఎక్కడ")
    ) {

        return await getLocation();

    }


    // -----------------------------------------------
    // GOOGLE
    // -----------------------------------------------

    if (
        text === "open google"
    ) {

        openWebsite(
            "https://www.google.com"
        );

        return "Opening Google, Boss.";

    }


    // -----------------------------------------------
    // YOUTUBE
    // -----------------------------------------------

    if (
        text === "open youtube"
    ) {

        openWebsite(
            "https://www.youtube.com"
        );

        return "Opening YouTube, Boss.";

    }


    // -----------------------------------------------
    // GOOGLE SEARCH
    // -----------------------------------------------

    if (
        text.startsWith("google search ")
    ) {

        const query =
            command.substring(
                "google search ".length
            ).trim();


        if (query) {

            openWebsite(
                "https://www.google.com/search?q=" +
                encodeURIComponent(query)
            );


            return `Searching Google for ${query}.`;

        }

    }


    // -----------------------------------------------
    // YOUTUBE SEARCH
    // -----------------------------------------------

    if (
        text.startsWith("youtube search ")
    ) {

        const query =
            command.substring(
                "youtube search ".length
            ).trim();


        if (query) {

            openWebsite(
                "https://www.youtube.com/results?search_query=" +
                encodeURIComponent(query)
            );


            return `Searching YouTube for ${query}.`;

        }

    }


    return null;

}


// =====================================================
// SEND MESSAGE TO GEMINI
// =====================================================

async function askGemini(
    userMessage
) {

    setStatus(
        "THINKING..."
    );


    // Send recent conversation only
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

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body: JSON.stringify({

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


        setStatus(
            "SYSTEM READY"
        );


        return data.reply;

    }

    catch (error) {

        console.error(
            "Gemini connection error:",
            error
        );


        setStatus(
            "CONNECTION ERROR"
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


    // -----------------------------------------------
    // SHOW USER MESSAGE
    // -----------------------------------------------

    addMessage(
        originalCommand,
        "user"
    );


    // -----------------------------------------------
    // CLEAR MEMORY
    // -----------------------------------------------

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

        chat.innerHTML = "";

        const response =
            "Memory cleared, Boss. J.A.R.V.I.S is ready.";

        addMessage(
            response,
            "jarvis"
        );

        speak(response);

        return;

    }


    // -----------------------------------------------
    // LOCAL COMMAND
    // -----------------------------------------------

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

        setStatus(
            "SYSTEM READY"
        );

        return;

    }


    // -----------------------------------------------
    // SPECIAL COMMAND
    // -----------------------------------------------

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

        setStatus(
            "SYSTEM READY"
        );

        return;

    }


    // -----------------------------------------------
    // GEMINI AI
    // -----------------------------------------------

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


        msg.value = "";

        send.disabled = true;

        micBtn.disabled = true;


        try {

            await processCommand(
                command
            );

        }

        finally {

            send.disabled = false;

            micBtn.disabled = false;

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
            event.key === "Enter"
        ) {

            event.preventDefault();

            send.click();

        }

    }
);


// =====================================================
// VOICE RECOGNITION
// =====================================================

const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;


let recognition = null;

let isListening = false;


if (SpeechRecognition) {

    recognition =
        new SpeechRecognition();


    recognition.continuous = false;

    recognition.interimResults = false;

    recognition.lang = "en-IN";


    recognition.onstart = () => {

        isListening = true;

        micBtn.classList.add(
            "active"
        );

        setStatus(
            "LISTENING..."
        );

    };


    recognition.onresult = event => {

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


    recognition.onerror = event => {

        console.error(
            "Speech recognition error:",
            event.error
        );


        isListening = false;

        micBtn.classList.remove(
            "active"
        );


        setStatus(
            "SYSTEM READY"
        );

    };


    recognition.onend = () => {

        isListening = false;

        micBtn.classList.remove(
            "active"
        );


        if (
            coreStatus &&
            coreStatus.textContent ===
            "LISTENING..."
        ) {

            setStatus(
                "SYSTEM READY"
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


    msg.value = "";


    send.disabled = true;

    micBtn.disabled = true;


    try {

        await processCommand(
            transcript
        );

    }

    finally {

        send.disabled = false;

        micBtn.disabled = false;

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

            speak(response);

            return;

        }


        if (isListening) {

            recognition.stop();

            return;

        }


        try {

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

        speak(response);


        // Reset input
        imgInput.value = "";

    }
);


// =====================================================
// CLEAR MEMORY BUTTON
// =====================================================

clearBtn.addEventListener(
    "click",
    () => {

        memory = [];

        localStorage.removeItem(
            MEMORY_KEY
        );

        chat.innerHTML = "";


        const response =
            "Long-term memory cleared, Boss.";

        addMessage(
            response,
            "jarvis"
        );

        speak(response);

    }
);


// =====================================================
// INITIALIZE
// =====================================================

loadMemory();


setStatus(
    "SYSTEM READY"
);


console.log(
    "J.A.R.V.I.S AI CORE ONLINE"
);

console.log(
    "Cloudflare Gemini endpoint:",
    JARVIS_API
);