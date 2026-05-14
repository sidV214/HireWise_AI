import axios from 'axios'

export const askAI = async (messages) => {
    try {
        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            throw new Error("Messages array is empty.")
        }
        const response = await axios.post("https://openrouter.ai/api/v1/chat/completions",
            {
                model: "openai/gpt-4o-mini",
                messages: messages
            }, {
            headers: {
                Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json',
            },
        })
        const content = response?.data?.choices?.[0]?.message?.content
        if (!content || !content.trim()) {
            throw new Error("AI returned empty response!!!")
        }
        return content
    } catch (error) {
        console.error("OpenRouter Error: ", error.response?.data || error.message);
        throw new Error("OpenRouter API error!!!")
    }
}

/*
|==========================================================================
| FILE: openRouter.service.js
| PURPOSE: Provides a wrapper service around the OpenRouter API for generating
|          AI-driven interview questions and evaluating candidate answers.
|==========================================================================
|
| ROLE IN THE ARCHITECTURE
| ────────────────────────
| This file lives in the `server/services` layer. It acts as the application's
| brain by interfacing with external LLMs (Large Language Models) like GPT-4o-mini
| via the OpenRouter proxy. It abstracts away the raw HTTP request logic so controllers
| can easily ask for AI inferences.
|
| IMPORTS & DEPENDENCIES
| ──────────────────────
| 1. `axios`: A promise-based HTTP client used here to make REST POST requests to the external OpenRouter API.
|
| FUNCTIONS & EXECUTION FLOW
| ──────────────────────────
| [generateAIResponse] - Asynchronous Function
| - PARAMETERS: `systemPrompt` (The persona/instructions for the AI), `userPrompt` (The specific task/input).
| - STEP 1: Calls `axios.post` pointing to `https://openrouter.ai/api/v1/chat/completions`.
| - STEP 2: Sends a JSON payload specifying the `model` ("openai/gpt-4o-mini") and the `messages` array combining the system and user prompts.
| - STEP 3: Attaches the `Authorization: Bearer <OPENROUTER_API_KEY>` header.
| - STEP 4: Awaits the response and deeply navigates the JSON tree to extract the text `content` from `response.data.choices[0].message.content`.
| - STEP 5: Validates the content. If the AI returned an empty string or hallucinated badly, it manually throws an Error.
| - STEP 6: Returns the valid string content back to the caller.
| - EDGE CASE (Catch Block): Network timeouts, invalid API keys, or OpenRouter downtimes are caught. The catch block logs the specific OpenRouter error payload (`error.response.data`) for backend debugging, but throws a generic "OpenRouter API error!!!" to hide sensitive API details from the client.
|
| CONNECTIONS (Dependency Map)
| ───────────
| CALLED BY: 
|  - `interview.controller.js` -> `generateQuestions()` (To create the initial 5 questions).
|  - `interview.controller.js` -> `submitAnswer()` (To evaluate the user's audio transcription and generate a follow-up).
| EXTERNAL API: OpenRouter REST API (which proxies to OpenAI).
|
| DESIGN PATTERNS
| ───────────────
| - **Adapter/Wrapper Pattern**: This function adapts the specific shape of the OpenRouter API into a generic `(systemPrompt, userPrompt) => text` interface. If we ever decide to switch to OpenAI directly, Anthropic, or Gemini, we only need to change this one file. The controllers remain completely unaware of the underlying LLM provider.
|
| INTERVIEW QUESTIONS
| ───────────────────
| Q1: Why use OpenRouter instead of calling the OpenAI API directly?
| A1: OpenRouter acts as an aggregator. It provides a unified API structure for hundreds of LLMs (GPT-4, Claude, Llama). Using it allows developers to swap models seamlessly just by changing the `model` string in the payload, without rewriting the API integration logic. It also often routes to the cheapest provider.
|
| Q2: What is the purpose of the `systemPrompt`?
| A2: LLMs are highly versatile. The system prompt sets the foundational constraints and persona (e.g., "You are an expert technical interviewer. Return your response STRICTLY as a JSON array..."). Without it, the model might include conversational filler like "Sure, here are your questions:..." which breaks JSON parsers downstream.
|
| Q3: Why is `response?.data?.choices?.[0]?.message?.content` written with optional chaining (`?.`)?
| A3: External APIs can unpredictably change their schema or return malformed errors. If `response.data` is undefined, attempting to access `.choices` would crash the entire Node process with a `TypeError`. Optional chaining safely short-circuits to `undefined` instead of crashing.
|
| Q4: What happens if the API key in `.env` is expired?
| A4: Axios will receive a 401 Unauthorized HTTP status. Because Axios throws an error for any status code >= 400, execution jumps to the catch block. The backend console logs the 401 details, and the controller receives the generic "OpenRouter API error!!!".
|
| Q5: How could we optimize this service for faster response times?
| A5: LLM generation is inherently slow (often taking 2-10 seconds). We could implement Server-Sent Events (SSE) or WebSockets to stream the chunks of text back to the React frontend as they are generated, rather than waiting for the entire response to complete before returning.
|==========================================================================
*/