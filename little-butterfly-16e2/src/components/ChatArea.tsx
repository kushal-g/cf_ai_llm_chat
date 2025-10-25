import { useEffect, useState } from 'react'
import { getChatMessages, type ChatMessage } from '../db';

interface ChatAreaProps {
    currentChat: string | null;
}

export default function ChatArea({ currentChat }: ChatAreaProps) {
    const [chatMessages, setChatMessages] = useState<ChatMessage[] | null>(null)

    useEffect(() => {
        if (currentChat) {
            getChatMessages(currentChat)
                .then(messages => setChatMessages(messages))
                .catch(e => console.error(e))
        }

    }, [currentChat])
    return (
        currentChat !== null && <div style={{ padding: "20px", display: "flex", flexDirection: "column", width: "100%" }}>
            {
                chatMessages?.map(
                    chatMessage => <div key={chatMessage.timestamp.toISOString()} style={{
                        borderRadius: "20px",
                        alignSelf: chatMessage.sender == "USER" ? "end" : undefined,
                        padding: "10px 30px", width: "fit-content",
                        background: chatMessage.sender === "USER" ? "white" : undefined,
                        color: chatMessage.sender == "USER" ? "black" : undefined
                    }}>{chatMessage.message}</div>

                )
            }
        </div>
    )
}
