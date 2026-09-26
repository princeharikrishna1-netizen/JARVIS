// =====================================================
// J.A.R.V.I.S - CLOUDFLARE WORKER
// Gemini AI Backend
// =====================================================

const GEMINI_MODEL = "gemini-3.5-flash";

const CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json"
};


// =====================================================
// MAIN WORKER
// =====================================================

export default {

    async fetch(request, env) {

        const url = new URL(request.url);


        // -------------------------------------------------
        // CORS PREFLIGHT
        // -------------------------------------------------

        if (request.method === "OPTIONS") {

            return new Response(null, {
                status: 204,
                headers: CORS_HEADERS
            });

        }


        // -------------------------------------------------
        // JARVIS AI API
        // -------------------------------------------------

        if (
            url.pathname === "/api/chat" &&
            request.method === "POST"
        ) {

            return handleChat(request, env);

        }


        // -------------------------------------------------
        // API STATUS
        // -------------------------------------------------

        if (
            url.pathname === "/api/status" &&
            request.method === "GET"
        ) {

            return jsonResponse({

                success: true,

                service: "J.A.R.V.I.S",

                status: "ONLINE",

                gemini: env.GEMINI_API_KEY
                    ? "CONNECTED"
                    : "API KEY NOT CONFIGURED"

            });

        }


        // -------------------------------------------------
        // SERVE JARVIS WEBSITE
        // -------------------------------------------------

        return env.ASSETS.fetch(request);

    }

};


// =====================================================
// GEMINI CHAT HANDLER
// =====================================================

async function handleChat(request, env) {

    try {

        // -------------------------------------------------
        // CHECK API KEY
        // -------------------------------------------------

        if (!env.GEMINI_API_KEY) {

            return jsonResponse({

                success: false,

                error: "Gemini API key is not configured in Cloudflare."

            }, 500);

        }


        // -------------------------------------------------
        // READ REQUEST
        // -------------------------------------------------

        const body = await request.json();

        const message =
            typeof body.message === "string"
                ? body.message.trim()
                : "";

        const history =
            Array.isArray(body.history)
                ? body.history
                : [];


        if (!message) {

            return jsonResponse({

                success: false,

                error: "Message is required."

            }, 400);

        }


        // -------------------------------------------------
        // CONVERSATION HISTORY
        // -------------------------------------------------

        const contents = [];


        for (
            const item of history.slice(-12)
        ) {

            if (
                !item ||
                typeof item.text !== "string" ||
                !item.text.trim()
            ) {
                continue;
            }


            const role =
                item.role === "model"
                    ? "model"
                    : "user";


            contents.push({

                role: role,

                parts: [
                    {
                        text: item.text.trim()
                    }
                ]

            });

        }


        // -------------------------------------------------
        // CURRENT USER MESSAGE
        // -------------------------------------------------

        contents.push({

            role: "user",

            parts: [
                {
                    text: message
                }
            ]

        });


        // -------------------------------------------------
        // GEMINI REQUEST
        // -------------------------------------------------

        const geminiURL =
            `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;


        const geminiResponse = await fetch(
            geminiURL,
            {

                method: "POST",

                headers: {

                    "Content-Type": "application/json",

                    "x-goog-api-key":
                        env.GEMINI_API_KEY

                },

                body: JSON.stringify({

                    systemInstruction: {

                        parts: [

                            {
                                text:
`You are J.A.R.V.I.S, a futuristic personal AI assistant.

Your personality:
- Intelligent
- Calm
- Helpful
- Professional
- Friendly
- Concise
- Futuristic

Address the user as "Boss" when appropriate.

Language:
- Understand Telugu, English and Telugu written using English letters.
- Reply in the same language style used by the user.
- If the user speaks Telugu, reply naturally in Telugu.
- If the user speaks English, reply in English.
- If the user mixes Telugu and English, you may naturally mix both.

Important:
- Do not claim that you performed an action if you did not actually perform it.
- Do not invent device access or permissions.
- Explain clearly when a requested device capability is not available through the browser.

You are the AI brain of the user's J.A.R.V.I.S interface.`
                            }

                        ]

                    },

                    contents: contents,

                    generationConfig: {

                        temperature: 0.7,

                        maxOutputTokens: 1024

                    }

                })

            }
        );


        // -------------------------------------------------
        // GEMINI ERROR
        // -------------------------------------------------

        if (!geminiResponse.ok) {

            const errorText =
                await geminiResponse.text();

            console.error(
                "Gemini API Error:",
                errorText
            );


            return jsonResponse({

                success: false,

                error:
                    "Gemini API request failed.",

                details:
                    errorText

            }, geminiResponse.status);

        }


        // -------------------------------------------------
        // GEMINI RESPONSE
        // -------------------------------------------------

        const data =
            await geminiResponse.json();


        const reply =
            data
                ?.candidates?.[0]
                ?.content?.parts
                ?.map(part => part.text || "")
                .join("")
                .trim();


        if (!reply) {

            return jsonResponse({

                success: false,

                error:
                    "Gemini returned an empty response."

            }, 502);

        }


        // -------------------------------------------------
        // SEND JARVIS RESPONSE
        // -------------------------------------------------

        return jsonResponse({

            success: true,

            reply: reply,

            model: GEMINI_MODEL

        });

    }

    catch (error) {

        console.error(
            "JARVIS Worker Error:",
            error
        );


        return jsonResponse({

            success: false,

            error:
                "J.A.R.V.I.S backend error.",

            details:
                error?.message || "Unknown error"

        }, 500);

    }

}


// =====================================================
// JSON RESPONSE
// =====================================================

function jsonResponse(data, status = 200) {

    return new Response(

        JSON.stringify(data),

        {

            status: status,

            headers: CORS_HEADERS

        }

    );

}