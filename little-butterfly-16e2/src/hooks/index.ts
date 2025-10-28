import { useEffect, useState } from "react";
import { getChats, type ChatPreview } from "../db";

export function usePreviousChats(isAuthenticated?: boolean): [ChatPreview[] | null, boolean, () => void] {
    const [chats, setChats] = useState<ChatPreview[] | null>(null)
    const [isLoading, setIsLoading] = useState<boolean>(true)

    const refresh = () => {
        getChats()
            .then(chats => {
                setChats(chats)
            })
            .catch(e => console.error(e))
            .finally(() => setIsLoading(false))
    }
    useEffect(() => {
        if (isAuthenticated !== false) {
            refresh()
        }
    }, [isAuthenticated])

    return [chats, isLoading, refresh]
}