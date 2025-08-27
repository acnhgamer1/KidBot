import { useState, useRef, useEffect } from 'react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  type?: 'text' | 'image';
  imageUrl?: string;
  timestamp: Date;
}

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDeepThink, setIsDeepThink] = useState(false);
  const [showImageGen, setShowImageGen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentInput = inputValue;
    setInputValue('');
    setIsLoading(true);

    try {
      let aiResponse: string;

      if (isDeepThink) {
        // Deep think mode: First AI generates, second AI improves

        // First AI response
        const firstResponse = await fetch('https://text.pollinations.ai/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages: [
              ...messages.map((m) => ({ role: m.role, content: m.content })),
              { role: 'user', content: currentInput },
            ],
            model: 'openai',
            jsonMode: false,
          }),
        });

        if (!firstResponse.ok) {
          throw new Error(`First AI response error: ${firstResponse.status}`);
        }

        const initialAnswer = await firstResponse.text();

        // Second AI reviews and improves
        const reviewPrompt = `Please review and improve the following response to the user's question: "${currentInput}"

Original response: ${initialAnswer}

Please provide an improved, more comprehensive, and accurate response:`;

        const secondResponse = await fetch('https://text.pollinations.ai/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages: [{ role: 'user', content: reviewPrompt }],
            model: 'openai',
            jsonMode: false,
          }),
        });

        if (!secondResponse.ok) {
          throw new Error(`Second AI response error: ${secondResponse.status}`);
        }

        aiResponse = await secondResponse.text();
      } else {
        // Normal chat mode
        const response = await fetch('https://text.pollinations.ai/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages: [
              ...messages.map((m) => ({ role: m.role, content: m.content })),
              { role: 'user', content: currentInput },
            ],
            model: 'openai',
            jsonMode: false,
          }),
        });

        if (!response.ok) {
          throw new Error(`Pollinations API error: ${response.status}`);
        }

        aiResponse = await response.text();
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const generateImage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: `Generate image: ${inputValue}`,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentPrompt = inputValue;
    setInputValue('');
    setIsLoading(true);

    try {
      // Generate image using Pollinations AI directly
      const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(currentPrompt)}?width=512&height=512&nologo=true`;

      const imageMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Generated image for: "${currentPrompt}"`,
        type: 'image',
        imageUrl: imageUrl,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, imageMessage]);
    } catch (error) {
      console.error('Error generating image:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content:
          'Sorry, I encountered an error generating the image. Please try again.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (showImageGen) {
        generateImage();
      } else {
        sendMessage();
      }
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  return (
    <div className="chat-container">
      {/* Header */}
      <div className="chat-header">
        <h1>KidBot AI</h1>
        <div className="header-controls">
          <button
            className={`mode-toggle ${isDeepThink ? 'active' : ''}`}
            onClick={() => setIsDeepThink(!isDeepThink)}
            disabled={isLoading}
          >
            {isDeepThink ? '🧠 Deep Think' : '💭 Normal'}
          </button>
          <button
            className={`mode-toggle ${showImageGen ? 'active' : ''}`}
            onClick={() => setShowImageGen(!showImageGen)}
            disabled={isLoading}
          >
            {showImageGen ? '🎨 Image' : '💬 Text'}
          </button>
          <button
            className="clear-button"
            onClick={clearChat}
            disabled={isLoading}
          >
            🗑️ Clear
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="messages-container">
        {messages.length === 0 && (
          <div className="welcome-message">
            <h2>Welcome to KidBot AI! 🤖</h2>
            <p>
              I can help you with questions, generate images, and even use deep
              thinking mode for complex problems.
            </p>
            <div className="feature-list">
              <div>
                💬 <strong>Normal Chat:</strong> Ask me anything!
              </div>
              <div>
                🧠 <strong>Deep Think:</strong> I'll think twice for better
                answers
              </div>
              <div>
                🎨 <strong>Image Generation:</strong> Describe what you want to
                see
              </div>
            </div>
          </div>
        )}

        {messages.map((message) => (
          <div key={message.id} className={`message ${message.role}`}>
            <div className="message-content">
              {message.type === 'image' && message.imageUrl ? (
                <div>
                  <p>{message.content}</p>
                  <img
                    src={message.imageUrl}
                    alt="Generated image"
                    className="generated-image"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const errorDiv = document.createElement('div');
                      errorDiv.textContent = 'Failed to load image';
                      errorDiv.className = 'image-error';
                      target.parentNode?.appendChild(errorDiv);
                    }}
                  />
                </div>
              ) : (
                <p>{message.content}</p>
              )}
            </div>
            <div className="message-time">
              {message.timestamp.toLocaleTimeString()}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="message assistant">
            <div className="message-content">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="input-container">
        <div className="input-wrapper">
          <textarea
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={
              showImageGen
                ? 'Describe the image you want to generate...'
                : isDeepThink
                  ? 'Ask me something complex for deep thinking...'
                  : 'Type your message...'
            }
            disabled={isLoading}
            rows={1}
          />
          <button
            onClick={showImageGen ? generateImage : sendMessage}
            disabled={!inputValue.trim() || isLoading}
            className="send-button"
          >
            {showImageGen ? '🎨' : '➤'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
