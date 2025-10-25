export interface User {
    firstName: string;
    lastName: string;
    userId: string;
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
    console.log(userId)
    return [
        {
            title: "Fix foam in dishwasher",
            recentMessage: "Foam in a dishwasher is almost always caused by using the wrong type or too much detergent. Here’s how to fix it safely:",
            chatId: "234"
        }
    ]
}

export interface ChatMessage {
    sender: "LLM" | "USER";
    message: string;
    timestamp: Date;
}

export async function getChatMessages(chatId: string): Promise<ChatMessage[]> {
    console.log(chatId)
    return [
        {
            sender: "USER",
            message: "Hello Message 1",
            timestamp: new Date('2025-01-01')
        },
        {
            sender: "LLM",
            message: "Hello Message 2",
            timestamp: new Date('2025-02-02')
        },
        {
            sender: "USER",
            message: "Goodbye Machine",
            timestamp: new Date('2025-03-03')
        },
        {
            sender: "LLM",
            message: "Goodbye Human",
            timestamp: new Date('2025-04-04')
        }
    ]
}