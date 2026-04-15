// hooks/useConversation.ts
import { useState, useRef } from 'react'

export interface Message {
  role: 'user' | 'assistant'
  content: string
}

export function useConversation() {
  const historyRef = useRef<Message[]>([])
  const [messages, setMessages] = useState<Message[]>([])

  const addUserMessage = (content: string) => {
    const msg: Message = { role: 'user', content }
    historyRef.current = [...historyRef.current, msg]
    setMessages(prev => [...prev, msg])
  }

  const addAssistantMessage = (content: string) => {
    const msg: Message = { role: 'assistant', content }
    historyRef.current = [...historyRef.current, msg]
    setMessages(prev => [...prev, msg])
  }

  const getHistory = () => historyRef.current

  const clearConversation = () => {
    historyRef.current = []
    setMessages([])
  }

  return { messages, addUserMessage, addAssistantMessage, getHistory, clearConversation }
}
