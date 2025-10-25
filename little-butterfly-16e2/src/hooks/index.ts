import { useEffect, useState } from "react";
import { getChats, getLoggedInUserId, getUser, type ChatPreview, type User } from "../db";

export function useLoggedInUser(): [User | null, boolean] {
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState<boolean>(true)

    useEffect(() => {
        getLoggedInUserId()
            .then(userId => getUser(userId))
            .then(user => {
                setUser(user)
            })
            .catch(e => console.error(e))
            .finally(() => setIsLoading(false))
    }, [])

    return [user, isLoading]
}


export function usePreviousChats(): [ChatPreview[] | null, boolean] {
    const [chats, setChats] = useState<ChatPreview[] | null>(null)
    const [isLoading, setIsLoading] = useState<boolean>(true)

    useEffect(() => {
        getLoggedInUserId()
            .then(userId => getChats(userId))
            .then(chats => {
                setChats(chats)
            })
            .catch(e => console.error(e))
            .finally(() => setIsLoading(false))
    }, [])

    return [chats, isLoading]
}