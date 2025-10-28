import { useEffect, useState, useRef } from 'react'
import { getChatMessages, sendMessage, type ChatMessage } from '../db';
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import ReactMarkdown from 'react-markdown';
import ThinkingAnimation from './ThinkingAnimation';

interface ChatAreaProps {
    currentChat: string | null;
    refreshChats: () => void;
}

export default function ChatArea({ currentChat, refreshChats }: ChatAreaProps) {
    const [chatMessages, setChatMessages] = useState<ChatMessage[] | null>(null)
    const [currentMessage, setCurrentMessage] = useState<string>("")
    const [isChatbotThinking, setIsChatbotThinking] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    async function sendMessageToSystem() {
        if (currentChat) {
            setCurrentMessage("")
            setIsChatbotThinking(true)
            setChatMessages(chatMessages => [
                ...(chatMessages ?? []),
                { sender: "user", message: currentMessage, timestamp: new Date().toISOString(), chat_id: currentChat }
            ])

            const response = await sendMessage(currentChat, currentMessage)
            console.log(response)
            const updatedMessages = await getChatMessages(currentChat)
            if (chatMessages?.length == 0) {
                refreshChats()
            }
            setIsChatbotThinking(false)
            setChatMessages(updatedMessages)
        }
    }
    useEffect(() => {
        if (currentChat) {
            getChatMessages(currentChat)
                .then(messages => setChatMessages(messages))
                .catch(e => console.error(e))
        }

    }, [currentChat])

    // Auto-scroll to bottom when messages change or when thinking state changes
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [chatMessages, isChatbotThinking])
    return (
        currentChat !== null &&
        <div style={{ padding: "20px", display: "flex", flexDirection: "column", width: "100%", height: "calc(100vh - 100px)" }}>
            <div style={{ flex: "1", overflowY: "auto", display: "flex", flexDirection: "column", gap: "10px", marginBottom: "10px" }}>
                {
                    chatMessages?.map(
                        chatMessage => <div key={new Date(chatMessage.timestamp).toISOString()} style={{
                            borderRadius: "20px",
                            alignSelf: chatMessage.sender == "user" ? "end" : undefined,
                            padding: "10px 30px", width: "fit-content",
                            background: chatMessage.sender === "user" ? "white" : undefined,
                            color: chatMessage.sender == "user" ? "black" : undefined
                        }}>
                            <ReactMarkdown>
                                {chatMessage.message}
                            </ReactMarkdown>
                        </div>
                    )
                }
                {isChatbotThinking && <ThinkingAnimation />}
                <div ref={messagesEndRef} />
            </div>
            <div style={{ display: "flex" }}>
                <textarea rows={1} style={{ flex: "1", borderRadius: "20px", padding: "20px" }} value={currentMessage} onChange={e => setCurrentMessage(e.target.value)} />
                <button style={{ borderRadius: "20px" }} onClick={sendMessageToSystem}>
                    <FontAwesomeIcon icon={faPaperPlane} style={{ marginRight: "10px" }} /> Send
                </button>
            </div>
        </div>
    )
}
