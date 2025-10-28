export const BASE_URL = "http://localhost:8787"

export interface User {
    firstName: string;
    lastName: string;
    userId: string;
}

// Helper function to get authorization headers
function getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('access_token');
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
    };
}

export async function getLoggedInUserId(): Promise<string> {
    return "123"
}


export async function getUser(userId: string): Promise<User> {
    return {
        firstName: "Kushal",
        lastName: "Garg",
        userId
    }
}

export interface ChatPreview {
    title: string;
    recentMessage: string;
    chatId: string;
}

export async function getChats(userId: string): Promise<ChatPreview[]> {
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