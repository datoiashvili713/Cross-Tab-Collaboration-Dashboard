import { Message } from '../types'

export const isMessageExpired = (message: Message): boolean => {
  if (!message.expiresAt) return false
  return Date.now() > message.expiresAt
}

export const filterExpiredMessages = (messages: Message[]): Message[] => {
  return messages.filter(msg => !isMessageExpired(msg))
}

