import { type Dispatch, type SetStateAction } from 'react'
import { usePreviousChats } from '../hooks'
import { truncate } from "lodash"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSearch } from '@fortawesome/free-solid-svg-icons'

interface SideBarProps {
    currentChat: string | null;
    setCurrentChat: Dispatch<SetStateAction<string | null>>
}

export default function SideBar({ currentChat, setCurrentChat }: SideBarProps) {

    const [chats, _] = usePreviousChats()

    return (
        <aside style={{ padding: "0.6em 1.2em", width: "300px", borderRight: "1px solid #ffffff34", height: "100%" }}>

            <div style={{ margin: "10px 0" }}>
                <button style={{ padding: "0", margin: 0 }}>
                    <FontAwesomeIcon icon={faSearch} style={{ marginRight: "10px" }} />
                    New Chat
                </button>
            </div>
            <div>
                <div style={{ fontSize: "18px", fontWeight: "bold" }}>Chats</div>
                {chats?.map(chat => <div style={{ margin: "10px 0", cursor: "pointer", backgroundColor: (chat.chatId === currentChat) ? "#000000" : undefined }} onClick={() => setCurrentChat(chat.chatId)}>
                    <div style={{ fontWeight: "bold" }}>{chat.title}</div>
                    <div>{truncate(chat.recentMessage, { length: 40 })}</div>
                </div>)}

            </div>
        </aside>
    )
}
