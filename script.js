// =====================================================
// J.A.R.V.I.S - AI CORE
// Voice + Chat + Memory + Camera + Basic Commands
// =====================================================


// =====================================================
// 1. ELEMENTS
// =====================================================

const chat = document.getElementById("chat");
const msgInput = document.getElementById("msg");
const sendBtn = document.getElementById("send");
const micBtn = document.getElementById("mic-btn");
const camBtn = document.getElementById("cam-btn");
const clearBtn = document.getElementById("clear-btn");
const imgInput = document.getElementById("img-input");

const coreStatus = document.querySelector(".core-status");


// =====================================================
// 2. MEMORY
// =====================================================

const MEMORY_KEY = "jarvisMemory";

let memory = JSON.parse(localStorage.getItem(MEMORY_KEY)) || [];


// =====================================================
// 3. CHAT MESSAGE
// =====================================================

function addMessage(text, type = "jarvis") {

    const message = document.createElement("div");

    message.className = `msg ${type}`;

    message.textContent = text;

    chat.appendChild(message);

    chat.scrollTop = chat.scrollHeight;

    memory.push({
        type: type,
        text: text,
        time: new Date().toISOString()
    });

    localStorage.setItem(MEMORY_KEY, JSON.stringify(memory));
}


// =====================================================
// 4. LOAD MEMORY
// =====================================================

function loadMemory() {

    chat.innerHTML = "";

    if (memory.length === 0) {

        addMessage(
            "Good evening, Boss. J.A.R.V.I.S is online. System ready."
        );

        return;
    }

    memory.forEach(item => {

        const message = document.createElement("div");

        message.className = `msg ${item.type}`;

        message.textContent = item.text;

        chat.appendChild(message);

    });

    chat.scrollTop = chat.scrollHeight;
}


// =====================================================
// 5. TEXT TO SPEECH
// =====================================================

function speak(text) {

    if (!("speechSynthesis" in window)) {
        return;
    }

    window.speechSynthesis.cancel();

    const speech = new SpeechSynthesisUtterance(text);

    speech.lang = "en-IN";
    speech.rate = 0.95;
    speech.pitch = 0.9;
    speech.volume = 1;

    speech.onstart = () => {

        if (coreStatus) {
            coreStatus.textContent = "SPEAKING";
        }

    };

    speech.onend = () => {

        if (coreStatus) {
            coreStatus.textContent = "SYSTEM READY";
        }

    };

    window.speechSynthesis.speak(speech);
}


// =====================================================
// 6. JARVIS RESPONSE
// =====================================================

function jarvisReply(text, voice = true) {

    addMessage(text, "jarvis");

    if (voice) {
        speak(text);
    }
}


// =====================================================
// 7. TIME
// =====================================================

function getCurrentTime() {

    const now = new Date();

    return now.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
    });
}


// =====================================================
// 8. DATE
// =====================================================

function getCurrentDate() {

    const now = new Date();

    return now.toLocaleDateString("en-IN", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
    });
}


// =====================================================
// 9. LOCATION
// =====================================================

function getLocation() {

    if (!navigator.geolocation) {

        jarvisReply(
            "Boss, location service is not supported by this browser."
        );

        return;
    }

    if (coreStatus) {
        coreStatus.textContent = "LOCATING";
    }

    jarvisReply(
        "Boss, requesting your location."
    );

    navigator.geolocation.getCurrentPosition(

        position => {

            const latitude =
                position.coords.latitude.toFixed(6);

            const longitude =
                position.coords.longitude.toFixed(6);

            const accuracy =
                Math.round(position.coords.accuracy);

            const result =
                `Boss, your current coordinates are latitude ${latitude}, longitude ${longitude}. Accuracy approximately ${accuracy} meters.`;

            addMessage(result, "jarvis");

            speak(result);

            if (coreStatus) {
                coreStatus.textContent = "SYSTEM READY";
            }

        },

        error => {

            let message =
                "Boss, I could not access your location.";

            if (error.code === 1) {

                message =
                    "Boss, location permission was denied. Please allow location access in your browser.";

            } else if (error.code === 2) {

                message =
                    "Boss, your location is currently unavailable.";

            } else if (error.code === 3) {

                message =
                    "Boss, the location request timed out.";

            }

            jarvisReply(message);

            if (coreStatus) {
                coreStatus.textContent = "SYSTEM READY";
            }

        },

        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        }
    );
}


// =====================================================
// 10. OPEN WEBSITE
// =====================================================

function openWebsite(url) {

    window.open(url, "_blank");

}


// =====================================================
// 11. PROCESS COMMAND
// =====================================================

function processCommand(command) {

    const originalCommand = command.trim();

    const text = originalCommand.toLowerCase();

    if (!text) {
        return;
    }


    // ---------------------------------------------
    // HELLO
    // ---------------------------------------------

    if (
        text.includes("hello") ||
        text.includes("hi jarvis") ||
        text.includes("hey jarvis") ||
        text === "hi" ||
        text === "hey" ||
        text.includes("హలో") ||
        text.includes("హాయ్")
    ) {

        jarvisReply(
            "Hello Boss. J.A.R.V.I.S is online and ready."
        );

        return;
    }


    // ---------------------------------------------
    // WHO ARE YOU
    // ---------------------------------------------

    if (
        text.includes("who are you") ||
        text.includes("what are you") ||
        text.includes("నువ్వు ఎవరు")
    ) {

        jarvisReply(
            "I am J.A.R.V.I.S, your intelligent virtual assistant."
        );

        return;
    }


    // ---------------------------------------------
    // TIME
    // ---------------------------------------------

    if (
        text === "time" ||
        text.includes("what time") ||
        text.includes("current time") ||
        text.includes("సమయం")
    ) {

        const time = getCurrentTime();

        jarvisReply(
            `Boss, the current time is ${time}.`
        );

        return;
    }


    // ---------------------------------------------
    // DATE
    // ---------------------------------------------

    if (
        text === "date" ||
        text.includes("today date") ||
        text.includes("what is the date") ||
        text.includes("today") ||
        text.includes("తేదీ")
    ) {

        const date = getCurrentDate();

        jarvisReply(
            `Boss, today is ${date}.`
        );

        return;
    }


    // ---------------------------------------------
    // LOCATION
    // ---------------------------------------------

    if (
        text.includes("location") ||
        text.includes("where am i") ||
        text.includes("my location") ||
        text.includes("నా లొకేషన్") ||
        text.includes("నేను ఎక్కడ")
    ) {

        getLocation();

        return;
    }


    // ---------------------------------------------
    // OPEN GOOGLE
    // ---------------------------------------------

    if (
        text.includes("open google") ||
        text.includes("google open")
    ) {

        jarvisReply(
            "Opening Google, Boss."
        );

        setTimeout(() => {

            openWebsite("https://www.google.com");

        }, 500);

        return;
    }


    // ---------------------------------------------
    // OPEN YOUTUBE
    // ---------------------------------------------

    if (
        text.includes("open youtube") ||
        text.includes("youtube open")
    ) {

        jarvisReply(
            "Opening YouTube, Boss."
        );

        setTimeout(() => {

            openWebsite("https://www.youtube.com");

        }, 500);

        return;
    }


    // ---------------------------------------------
    // SEARCH GOOGLE
    // ---------------------------------------------

    if (
        text.startsWith("search google for ") ||
        text.startsWith("google search ")
    ) {

        let searchText = "";

        if (text.startsWith("search google for ")) {

            searchText =
                originalCommand.substring(
                    "search google for ".length
                );

        } else {

            searchText =
                originalCommand.substring(
                    "google search ".length
                );

        }

        if (!searchText.trim()) {

            jarvisReply(
                "Boss, what should I search for?"
            );

            return;
        }

        jarvisReply(
            `Searching Google for ${searchText}.`
        );

        setTimeout(() => {

            const url =
                "https://www.google.com/search?q=" +
                encodeURIComponent(searchText);

            openWebsite(url);

        }, 500);

        return;
    }


    // ---------------------------------------------
    // SEARCH YOUTUBE
    // ---------------------------------------------

    if (
        text.startsWith("search youtube for ") ||
        text.startsWith("youtube search ")
    ) {

        let searchText = "";

        if (text.startsWith("search youtube for ")) {

            searchText =
                originalCommand.substring(
                    "search youtube for ".length
                );

        } else {

            searchText =
                originalCommand.substring(
                    "youtube search ".length
                );

        }

        if (!searchText.trim()) {

            jarvisReply(
                "Boss, what should I search for on YouTube?"
            );

            return;
        }

        jarvisReply(
            `Searching YouTube for ${searchText}.`
        );

        setTimeout(() => {

            const url =
                "https://www.youtube.com/results?search_query=" +
                encodeURIComponent(searchText);

            openWebsite(url);

        }, 500);

        return;
    }


    // ---------------------------------------------
    // CLEAR MEMORY
    // ---------------------------------------------

    if (
        text.includes("clear memory") ||
        text.includes("delete memory") ||
        text.includes("clear chat")
    ) {

        clearMemory();

        return;
    }


    // ---------------------------------------------
    // UNKNOWN COMMAND
    // ---------------------------------------------

    jarvisReply(
        `Boss, I heard "${originalCommand}". My AI brain is not connected yet.`
    );

}


// =====================================================
// 12. SEND TEXT COMMAND
// =====================================================

function sendMessage() {

    const command =
        msgInput.value.trim();

    if (!command) {
        return;
    }

    addMessage(command, "user");

    msgInput.value = "";

    processCommand(command);
}


// =====================================================
// 13. SEND BUTTON
// =====================================================

sendBtn.addEventListener(
    "click",
    sendMessage
);


// =====================================================
// 14. ENTER KEY
// =====================================================

msgInput.addEventListener(
    "keydown",
    event => {

        if (event.key === "Enter") {

            event.preventDefault();

            sendMessage();

        }

    }
);


// =====================================================
// 15. SPEECH RECOGNITION
// =====================================================

const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;

let recognition = null;

let isListening = false;


if (SpeechRecognition) {

    recognition =
        new SpeechRecognition();

    recognition.lang = "en-IN";

    recognition.continuous = false;

    recognition.interimResults = false;

    recognition.maxAlternatives = 1;


    // ---------------------------------------------
    // START
    // ---------------------------------------------

    recognition.onstart = () => {

        isListening = true;

        micBtn.classList.add("active");

        if (coreStatus) {
            coreStatus.textContent = "LISTENING";
        }

    };


    // ---------------------------------------------
    // RESULT
    // ---------------------------------------------

    recognition.onresult = event => {

        const transcript =
            event.results[0][0].transcript.trim();

        if (!transcript) {
            return;
        }

        addMessage(
            transcript,
            "user"
        );

        processCommand(
            transcript
        );

    };


    // ---------------------------------------------
    // END
    // ---------------------------------------------

    recognition.onend = () => {

        isListening = false;

        micBtn.classList.remove("active");

        if (coreStatus) {
            coreStatus.textContent = "SYSTEM READY";
        }

    };


    // ---------------------------------------------
    // ERROR
    // ---------------------------------------------

    recognition.onerror = event => {

        isListening = false;

        micBtn.classList.remove("active");

        if (coreStatus) {
            coreStatus.textContent = "SYSTEM READY";
        }

        let message =
            "Boss, voice recognition failed.";

        if (event.error === "not-allowed") {

            message =
                "Boss, microphone permission was denied. Please allow microphone access.";

        } else if (event.error === "no-speech") {

            message =
                "Boss, I did not hear anything.";

        } else if (event.error === "network") {

            message =
                "Boss, voice recognition requires a network connection.";

        }

        addMessage(
            message,
            "jarvis"
        );

    };

}


// =====================================================
// 16. MICROPHONE BUTTON
// =====================================================

micBtn.addEventListener(
    "click",
    () => {

        if (!recognition) {

            jarvisReply(
                "Boss, speech recognition is not supported in this browser."
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

            console.log(
                "Recognition start error:",
                error
            );

        }

    }
);


// =====================================================
// 17. CAMERA BUTTON
// =====================================================

camBtn.addEventListener(
    "click",
    () => {

        imgInput.click();

    }
);


// =====================================================
// 18. IMAGE SELECTED
// =====================================================

imgInput.addEventListener(
    "change",
    event => {

        const file =
            event.target.files[0];

        if (!file) {
            return;
        }


        addMessage(
            `Image received: ${file.name}`,
            "user"
        );


        const imageURL =
            URL.createObjectURL(file);


        const image =
            document.createElement("img");

        image.src = imageURL;

        image.style.maxWidth = "100%";

        image.style.maxHeight = "250px";

        image.style.marginTop = "10px";

        image.style.borderRadius = "12px";

        image.style.display = "block";


        chat.appendChild(image);

        chat.scrollTop =
            chat.scrollHeight;


        jarvisReply(
            "Boss, image received. AI vision is not connected yet."
        );


        imgInput.value = "";

    }
);


// =====================================================
// 19. CLEAR MEMORY
// =====================================================

function clearMemory() {

    localStorage.removeItem(
        MEMORY_KEY
    );

    memory = [];

    chat.innerHTML = "";

    addMessage(
        "Memory cleared, Boss. J.A.R.V.I.S is ready."
    );

}


// =====================================================
// 20. CLEAR MEMORY BUTTON
// =====================================================

clearBtn.addEventListener(
    "click",
    () => {

        const confirmed =
            confirm(
                "Clear J.A.R.V.I.S memory?"
            );

        if (confirmed) {

            clearMemory();

        }

    }
);


// =====================================================
// 21. INITIALIZE J.A.R.V.I.S
// =====================================================

loadMemory();


// =====================================================
// 22. SYSTEM READY
// =====================================================

console.log(
    "J.A.R.V.I.S initialized successfully."
);

console.log(
    "Voice:",
    !!SpeechRecognition
);

console.log(
    "Speech Synthesis:",
    "speechSynthesis" in window
);