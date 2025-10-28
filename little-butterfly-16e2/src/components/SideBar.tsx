import { type Dispatch, type SetStateAction, useState } from 'react'
import { usePreviousChats } from '../hooks'
import { truncate } from "lodash"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faMessage } from '@fortawesome/free-solid-svg-icons'
import type { ChatPreview } from '../db'

interface SideBarProps {
    chats: ChatPreview[] | null
    currentChat: string | null;
    setCurrentChat: Dispatch<SetStateAction<string | null>>
}

function generateChatId() {
    return `CHAT${new Date().getTime().toString()}`
}

export default function SideBar({ chats, currentChat, setCurrentChat }: SideBarProps) {
    const [hoveredChat, setHoveredChat] = useState<string | null>(null);

    return (
        <aside style={{
            padding: "20px",
            width: "280px",
            borderRight: "1px solid #ffffff20",
            height: "calc(100vh - 60px)",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            backgroundColor: "#00000015"
        }}>
            {/* New Chat Button */}
            <div>
                <button
                    style={{
                        width: "100%",
                        padding: "12px 16px",
                        borderRadius: "12px",
                        border: "1px solid #ffffff30",
                        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        color: "white",
                        fontWeight: "600",
                        fontSize: "15px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px",
                        transition: "all 0.2s ease",
                        boxShadow: "0 2px 8px rgba(102, 126, 234, 0.3)"
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-2px)";
                        e.currentTarget.style.boxShadow = "0 4px 12px rgba(102, 126, 234, 0.4)";
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "0 2px 8px rgba(102, 126, 234, 0.3)";
                    }}
                    onClick={() => setCurrentChat(generateChatId())}
                >
                    <FontAwesomeIcon icon={faPlus} />
                    New Chat
                </button>
            </div>

            {/* Chats Section */}
            <div style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                flex: 1,
                overflow: "hidden"
            }}>
                <div style={{
                    fontSize: "13px",
                    fontWeight: "600",
                    color: "#ffffff80",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    padding: "0 8px"
                }}>
                    Recent Chats
                </div>

                <div style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                    overflowY: "auto",
                    paddingRight: "4px"
                }}>
                    {chats && chats.length === 0 && (
                        <div style={{
                            padding: "32px 16px",
                            textAlign: "center",
                            color: "#ffffff50",
                            fontSize: "14px"
                        }}>
                            No chats yet. Start a new conversation!
                        </div>
                    )}

                    {chats?.map(chat => (
                        <div
                            key={chat.chatId}
                            style={{
                                padding: "12px 14px",
                                cursor: "pointer",
                                backgroundColor: chat.chatId === currentChat
                                    ? "#ffffff20"
                                    : hoveredChat === chat.chatId
                                    ? "#ffffff10"
                                    : "transparent",
                                borderRadius: "10px",
                                transition: "all 0.2s ease",
                                border: chat.chatId === currentChat
                                    ? "1px solid #ffffff30"
                                    : "1px solid transparent",
                                position: "relative",
                                overflow: "hidden"
                            }}
                            onClick={() => setCurrentChat(chat.chatId)}
                            onMouseEnter={() => setHoveredChat(chat.chatId)}
                            onMouseLeave={() => setHoveredChat(null)}
                        >
                            {/* Active indicator */}
                            {chat.chatId === currentChat && (
                                <div style={{
                                    position: "absolute",
                                    left: 0,
                                    top: "50%",
                                    transform: "translateY(-50%)",
                                    width: "3px",
                                    height: "60%",
                                    background: "linear-gradient(180deg, #667eea 0%, #764ba2 100%)",
                                    borderRadius: "0 2px 2px 0"
                                }} />
                            )}

                            <div style={{
                                display: "flex",
                                alignItems: "flex-start",
                                gap: "10px",
                                paddingLeft: chat.chatId === currentChat ? "8px" : "0"
                            }}>
                                <FontAwesomeIcon
                                    icon={faMessage}
                                    style={{
                                        marginTop: "3px",
                                        color: chat.chatId === currentChat ? "#667eea" : "#ffffff60",
                                        fontSize: "14px"
                                    }}
                                />

                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{
                                        fontWeight: chat.chatId === currentChat ? "600" : "500",
                                        fontSize: "14px",
                                        marginBottom: "4px",
                                        color: chat.chatId === currentChat ? "#ffffff" : "#ffffffd0",
                                        whiteSpace: "nowrap",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis"
                                    }}>
                                        {chat.title}
                                    </div>
                                    <div style={{
                                        fontSize: "13px",
                                        color: "#ffffff70",
                                        lineHeight: "1.4",
                                        display: "-webkit-box",
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: "vertical",
                                        overflow: "hidden"
                                    }}>
                                        {truncate(chat.recentMessage, { length: 50 })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </aside>
    )
}
