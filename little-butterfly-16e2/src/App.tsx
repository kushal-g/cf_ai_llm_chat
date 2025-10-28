import { useEffect, useState } from 'react'

import { useLoggedInUser, usePreviousChats } from './hooks'
import { useAuth } from './context/AuthContext'
import AppBar from './components/AppBar'
import SideBar from './components/SideBar'
import ChatArea from './components/ChatArea'
import Login from './components/Login'

function App() {
  const { isAuthenticated, login, username } = useAuth()
  const [currentChat, setCurrentChat] = useState<string | null>(null)
  const [chats, , refreshChats] = usePreviousChats(isAuthenticated)

  if (!isAuthenticated) {
    return <Login onLogin={login} />
  }

  return (
    <div style={{}}>
      <AppBar />
      <div style={{ display: "flex" }}>

        <SideBar chats={chats} currentChat={currentChat} setCurrentChat={setCurrentChat} />
        <ChatArea currentChat={currentChat} refreshChats={refreshChats} />
      </div>
    </div>
  )
}

export default App
