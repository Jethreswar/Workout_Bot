import { useState, useRef, useEffect } from 'react';
import './ChatBot.css';

const ChatBot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [aiStatus, setAiStatus] = useState('unknown');
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    // Check API status and welcome message
    useEffect(() => {
        checkAIStatus();
    }, []);

    // Format text for better display
    const formatMessageContent = (text) => {
        if (!text) return '';
        
        return text
            // Ensure proper line breaks
            .replace(/\n{3,}/g, '\n\n')
            // Clean up extra spaces
            .replace(/[ \t]+/g, ' ')
            .trim();
    };

    const checkAIStatus = async () => {
        try {
            const response = await fetch('/api/chatbot/validate');
            const data = await response.json();
            
            setAiStatus(data.aiAvailable ? 'connected' : 'fallback');
            
            let welcomeMessage = "Hi there! 👋 I'm FitBot, your fitness assistant! ";
            
            if (data.aiAvailable) {
                welcomeMessage += "🤖 AI is online and ready to provide personalized fitness guidance!";
            } else {
                welcomeMessage += "⚠️ AI is currently offline, but I can still help you with built-in fitness knowledge!";
            }
            
            welcomeMessage += "\n\nI can help you with workout suggestions, exercise tips, progress analysis, and motivation. What would you like to know?";
            
            setMessages([{
                id: 1,
                type: 'bot',
                content: welcomeMessage,
                timestamp: new Date(),
                status: data.aiAvailable ? 'ai' : 'fallback'
            }]);
        } catch (error) {
            console.error('Failed to check AI status:', error);
            setAiStatus('error');
            setMessages([{
                id: 1,
                type: 'bot',
                content: "Hi there! 👋 I'm FitBot, your fitness assistant! I'm currently running in offline mode, but I can still help you with built-in fitness knowledge!\n\nI can help you with workout suggestions, exercise tips, and motivation. What would you like to know?",
                timestamp: new Date(),
                status: 'fallback'
            }]);
        }
    };

    // Auto scroll to bottom
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Focus input when chat opens
    useEffect(() => {
        if (isOpen && inputRef.current) {
            setTimeout(() => inputRef.current.focus(), 100);
        }
    }, [isOpen]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const toggleChat = () => {
        setIsOpen(!isOpen);
    };

    const handleSend = async () => {
        if (!inputValue.trim() || isLoading) return;

        const userMessage = {
            id: Date.now(),
            type: 'user',
            content: inputValue.trim(),
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsLoading(true);
        setIsTyping(true);

        try {
            // Prepare conversation history
            const conversationHistory = messages.map(msg => ({
                role: msg.type === 'user' ? 'user' : 'assistant',
                content: msg.content
            })).slice(-10); // Keep last 10 messages for context

            const response = await fetch('/api/chatbot/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: userMessage.content,
                    conversationHistory
                })
            });

            const data = await response.json();

            setIsTyping(false);

            if (response.ok) {
                const botMessage = {
                    id: Date.now() + 1,
                    type: 'bot',
                    content: formatMessageContent(data.response || data.fallback || "I'm sorry, I couldn't process that request."),
                    timestamp: new Date()
                };
                setMessages(prev => [...prev, botMessage]);
            } else {
                throw new Error(data.error || 'Failed to get response');
            }
        } catch (error) {
            console.error('Chat error:', error);
            setIsTyping(false);
            const errorMessage = {
                id: Date.now() + 1,
                type: 'bot',
                content: "I'm having trouble connecting right now. Please check your internet connection and try again. You can also ask about basic workout tips! 💪",
                timestamp: new Date(),
                isError: true
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleQuickAction = async (action) => {
        setIsLoading(true);
        setIsTyping(true);

        try {
            let response;
            let botMessage;

            switch (action) {
                case 'suggestions':
                    response = await fetch('/api/chatbot/suggestions', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            fitnessLevel: 'intermediate',
                            goals: 'general fitness',
                            timeAvailable: 30
                        })
                    });
                    break;
                case 'analyze':
                    response = await fetch('/api/chatbot/analyze');
                    break;
                case 'trends':
                    response = await fetch('/api/chatbot/trends');
                    break;
                case 'compare':
                    response = await fetch('/api/chatbot/compare?days=30');
                    break;
                case 'help':
                    response = await fetch('/api/chatbot/help');
                    break;
                default:
                    return;
            }

            const data = await response.json();
            setIsTyping(false);

            if (response.ok) {
                botMessage = {
                    id: Date.now(),
                    type: 'bot',
                    content: formatMessageContent(data.suggestions || data.analysis || data.trends || data.comparison || data.message || 'Here you go!'),
                    timestamp: new Date(),
                    actionType: action
                };
            } else {
                throw new Error(data.error);
            }

            setMessages(prev => [...prev, botMessage]);
        } catch (error) {
            console.error('Quick action error:', error);
            setIsTyping(false);
            const errorMessage = {
                id: Date.now(),
                type: 'bot',
                content: "Sorry, I couldn't complete that action right now. Try typing your request instead!",
                timestamp: new Date(),
                isError: true
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const formatTime = (timestamp) => {
        return new Date(timestamp).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <>
            {/* Floating Chat Button */}
            <div className={`chat-button ${isOpen ? 'open' : ''}`} onClick={toggleChat}>
                {isOpen ? (
                    <span className="close-icon">×</span>
                ) : (
                    <>
                        <span className="bot-icon">🤖</span>
                        <div className="pulse-ring"></div>
                    </>
                )}
            </div>

            {/* Chat Window */}
            {isOpen && (
                <div className="chat-window">
                    {/* Header */}
                    <div className="chat-header">
                        <div className="bot-info">
                            <span className="bot-avatar">🤖</span>
                            <div>
                                <h4>FitBot</h4>
                                <span className={`status ${isLoading ? 'typing' : aiStatus}`}>
                                    {isTyping ? 'Typing...' : 
                                     aiStatus === 'connected' ? '🟢 AI Online' :
                                     aiStatus === 'fallback' ? '🟡 Offline Mode' :
                                     aiStatus === 'error' ? '🔴 Connection Error' : 'Checking...'}
                                </span>
                            </div>
                        </div>
                        <button className="minimize-btn" onClick={toggleChat}>
                            −
                        </button>
                    </div>

                    {/* Quick Actions */}
                    <div className="quick-actions">
                        <button 
                            className="quick-btn" 
                            onClick={() => handleQuickAction('suggestions')}
                            disabled={isLoading}
                        >
                            💪 Workout Tips
                        </button>
                        <button 
                            className="quick-btn" 
                            onClick={() => handleQuickAction('analyze')}
                            disabled={isLoading}
                        >
                            📊 My Progress
                        </button>
                        <button 
                            className="quick-btn" 
                            onClick={() => handleQuickAction('trends')}
                            disabled={isLoading}
                        >
                            📈 Workout Trends
                        </button>
                        <button 
                            className="quick-btn" 
                            onClick={() => handleQuickAction('compare')}
                            disabled={isLoading}
                        >
                            🔄 Compare Performance
                        </button>
                        <button 
                            className="quick-btn" 
                            onClick={() => handleQuickAction('help')}
                            disabled={isLoading}
                        >
                            ❓ Help
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="chat-messages">
                        {messages.map((message) => (
                            <div key={message.id} className={`message ${message.type}`}>
                                {message.type === 'bot' && (
                                    <span className="message-avatar">🤖</span>
                                )}
                                <div className="message-content">
                                    <div className={`message-bubble ${message.isError ? 'error' : ''}`}>
                                        {message.content}
                                    </div>
                                    <span className="message-time">
                                        {formatTime(message.timestamp)}
                                    </span>
                                </div>
                                {message.type === 'user' && (
                                    <span className="message-avatar user">👤</span>
                                )}
                            </div>
                        ))}
                        
                        {/* Typing Indicator */}
                        {isTyping && (
                            <div className="message bot">
                                <span className="message-avatar">🤖</span>
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
                    <div className="chat-input-container">
                        <div className="chat-input">
                            <textarea
                                ref={inputRef}
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Ask about workouts, nutrition, or motivation..."
                                disabled={isLoading}
                                rows={1}
                            />
                            <button 
                                className="send-btn"
                                onClick={handleSend}
                                disabled={!inputValue.trim() || isLoading}
                            >
                                {isLoading ? (
                                    <span className="loading-spinner">⏳</span>
                                ) : (
                                    <span>🚀</span>
                                )}
                            </button>
                        </div>
                        <div className="input-hint">
                            Press Enter to send • Shift+Enter for new line
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ChatBot;