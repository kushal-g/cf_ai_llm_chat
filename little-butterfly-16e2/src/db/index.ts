export const BASE_URL = "https://lucky-poetry-2fb1.kushalgarg2000.workers.dev"

// Helper function to get authorization headers
function getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('access_token');
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
    };
}

export interface ChatPreview {
    title: string;
    recentMessage: string;
    chatId: string;
}

export async function getChats(): Promise<ChatPreview[]> {
    const response = await fetch(`${BASE_URL}/latest-messages`, {
        headers: getAuthHeaders()
    })

    const body = await response.json()
    console.log(body)
    return body.map((msg: any) => ({
        title: msg.chat_title,
        recentMessage: msg.message,
        chatId: msg.chat_id
    }))
}

export interface ChatMessage {
    sender: "assistant" | "user";
    message: string;
    timestamp: string;
    chat_id: string;
}

export async function sendMessage(chatId: string, userResponse: string): Promise<string> {
    const response = await fetch(`${BASE_URL}?chatId=${chatId}`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
            userResponse
        })
    })

    const body = await response.json()
    return body["assistantResponse"]
}

export async function getChatMessages(chatId: string): Promise<ChatMessage[]> {
    const response = await fetch(`${BASE_URL}?chatId=${chatId}`, {
        headers: getAuthHeaders()
    })

    const body = await response.json()
    console.log(body)
    return body


}