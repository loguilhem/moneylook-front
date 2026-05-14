import { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPaperPlane, faXmark } from '@fortawesome/free-solid-svg-icons'
import { useTranslation } from 'react-i18next'
import logo from '../assets/logo.png'
import { request } from '../context/AppContext'

function renderInlineMarkdown(text) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)

  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index}>{part.slice(2, -2)}</strong>
    }

    return part
  })
}

function renderChatMessage(text) {
  const blocks = []
  const lines = text.split('\n')
  let index = 0

  while (index < lines.length) {
    const line = lines[index].trim()

    if (!line) {
      index += 1
      continue
    }

    const orderedMatch = line.match(/^(\d+)[.)]\s+(.+)$/)
    if (orderedMatch) {
      const items = []

      while (index < lines.length) {
        const itemMatch = lines[index].trim().match(/^(\d+)[.)]\s+(.+)$/)
        if (!itemMatch) {
          break
        }

        items.push(itemMatch[2])
        index += 1
      }

      blocks.push(
        <ol key={`ol-${index}`}>
          {items.map((item, itemIndex) => (
            <li key={itemIndex}>{renderInlineMarkdown(item)}</li>
          ))}
        </ol>,
      )
      continue
    }

    const unorderedMatch = line.match(/^[-*]\s+(.+)$/)
    if (unorderedMatch) {
      const items = []

      while (index < lines.length) {
        const itemMatch = lines[index].trim().match(/^[-*]\s+(.+)$/)
        if (!itemMatch) {
          break
        }

        items.push(itemMatch[1])
        index += 1
      }

      blocks.push(
        <ul key={`ul-${index}`}>
          {items.map((item, itemIndex) => (
            <li key={itemIndex}>{renderInlineMarkdown(item)}</li>
          ))}
        </ul>,
      )
      continue
    }

    const paragraphLines = []
    while (index < lines.length) {
      const paragraphLine = lines[index].trim()
      if (!paragraphLine || /^(\d+)[.)]\s+/.test(paragraphLine) || /^[-*]\s+/.test(paragraphLine)) {
        break
      }

      paragraphLines.push(paragraphLine)
      index += 1
    }

    blocks.push(
      <p key={`p-${index}`}>
        {renderInlineMarkdown(paragraphLines.join(' '))}
      </p>,
    )
  }

  return blocks
}

function FloatingChat() {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const [draft, setDraft] = useState('')
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      author: 'skiro',
      text: t('chat.welcome'),
    },
  ])
  const [isSending, setIsSending] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()

    const trimmedDraft = draft.trim()
    if (!trimmedDraft) {
      return
    }

    const nextMessages = [
      ...messages,
      {
        id: `user-${Date.now()}`,
        author: 'user',
        text: trimmedDraft,
      },
    ]

    setMessages(nextMessages)
    setDraft('')
    setIsSending(true)

    try {
      const response = await request('/llm/chat', {
        method: 'POST',
        body: JSON.stringify({
          messages: nextMessages.map((message) => ({
            role: message.author === 'user' ? 'user' : 'assistant',
            content: message.text,
          })),
        }),
      })

      setMessages((currentMessages) => [
        ...currentMessages,
        {
          id: `skiro-${Date.now()}`,
          author: 'skiro',
          text: response.message.content,
        },
      ])
    } catch (chatError) {
      setMessages((currentMessages) => [
        ...currentMessages,
        {
          id: `skiro-${Date.now()}`,
          author: 'skiro',
          text: t('chat.error', { message: chatError.message }),
        },
      ])
    } finally {
      setIsSending(false)
    }
  }

  function handleDraftKeyDown(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      event.currentTarget.form?.requestSubmit()
    }
  }

  return (
    <aside className={`floating-chat ${isOpen ? 'is-open' : ''}`} aria-label={t('chat.ariaLabel')}>
      {isOpen ? (
        <section className="floating-chat-panel" aria-live="polite">
          <header className="floating-chat-header">
            <div className="floating-chat-title">
              <img src={logo} alt="" aria-hidden="true" />
              <div>
                <strong>{t('chat.title')}</strong>
                <span>{t('chat.subtitle')}</span>
              </div>
            </div>
            <button type="button" className="floating-chat-close" aria-label={t('chat.close')} onClick={() => setIsOpen(false)}>
              <FontAwesomeIcon icon={faXmark} />
            </button>
          </header>

          <div className="floating-chat-messages">
            {messages.map((message) => (
              <div className={`floating-chat-message is-${message.author}`} key={message.id}>
                {renderChatMessage(message.text)}
              </div>
            ))}
          </div>

          <form className="floating-chat-form" onSubmit={handleSubmit}>
            <label>
              <span className="sr-only">{t('chat.messageLabel')}</span>
              <textarea
                value={draft}
                rows="2"
                placeholder={t('chat.placeholder')}
                disabled={isSending}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={handleDraftKeyDown}
              />
            </label>
            <button type="submit" className="primary-button" aria-label={t('chat.send')} disabled={isSending}>
              {isSending ? <span className="loader-spinner" aria-hidden="true" /> : <FontAwesomeIcon icon={faPaperPlane} />}
            </button>
          </form>
        </section>
      ) : null}

      {!isOpen ? (
        <button type="button" className="floating-chat-toggle" onClick={() => setIsOpen(true)}>
          <img src={logo} alt="" aria-hidden="true" />
          <span>{t('chat.button')}</span>
        </button>
      ) : null}
    </aside>
  )
}

export default FloatingChat
