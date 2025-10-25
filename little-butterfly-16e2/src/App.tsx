import { useState } from 'react'

import { useLoggedInUser } from './hooks'
import AppBar from './components/AppBar'
import SideBar from './components/SideBar'
import ChatArea from './components/ChatArea'

function App() {
  const [user, _] = useLoggedInUser()
  const [currentChat, setCurrentChat] = useState<string | null>(null)

  return (
    <div style={{}}>
      <AppBar user={user} />
      <div style={{ display: "flex" }}>

        <SideBar currentChat={currentChat} setCurrentChat={setCurrentChat} />
        <ChatArea currentChat={currentChat} />
      </div>
    </div>
  )
}

export default App
