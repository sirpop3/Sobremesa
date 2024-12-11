import { useState, useRef, useEffect } from "react";
import "./chat.css";

type ChatMessage = {
    username: string;
    message: string;
    color: string;
};

export default function Chat() {
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const [chatInput, setChatInput] = useState<string>(""); // Input field for chat
    const [messages, setMessages] = useState<ChatMessage[]>([]); // Messages sent in the chat
    const [isAutoScroll, setIsAutoScroll] = useState<boolean>(true); // Track if auto-scroll is enabled
    const messageContainerRef = useRef<HTMLUListElement>(null);
    const [username] = useState<string>(() =>
        Math.random().toString(36).substring(2, 12)
    ); // Randomly generated username
    const [contextMenu, setContextMenu] = useState<{ x: number; y: number; messageIndex: number } | null>(null);

    function constructSocket() {
        const newSocket = new WebSocket("ws://localhost:8080/ws");


        newSocket.addEventListener("message", (event) => {
            try {
                const data = JSON.parse(event.data);

                if (data.username && data.message && data.color) {
                    // Add the received message to the state
                    const newMessage: ChatMessage = {
                        username: data.username,
                        message: data.message,
                        color: data.color,
                    };
                    setMessages((prevMessages) => [...prevMessages, newMessage]);
                }
            } catch (error) {
                console.error("Error processing WebSocket message:", error);
            }
            try {
                const data = JSON.parse(event.data);

                if (data.username && data.message && data.color) {
                    const newMessage: ChatMessage = {
                        username: data.username,
                        message: data.message,
                        color: data.color,
                    };
                    setMessages((prevMessages) => [...prevMessages, newMessage]);
                }
            } catch (error) {
                console.error("Error processing WebSocket message:", error);
            }
        });

        setSocket(newSocket);
    }

    // Placeholder, generates random username
    const generateRandomUsername = (): string => {
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        let username = "";
        for (let i = 0; i < 10; i++) {
            username += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return username;
    };

    const handleSendMessage = () => {
        if (chatInput.trim() !== "" && socket) {
            // Send message to WebSocket
            const outgoingMessage = {
                username: generateRandomUsername(), // have to add support for username Editing
                message: chatInput,
                color: "#000000", // Default color
            };
            socket.send(JSON.stringify(outgoingMessage));

            // Add the message locally
            setMessages((prevMessages) => [...prevMessages, outgoingMessage]);
            setChatInput(""); // Clear input after sending
        }
    };

    const handleRightClick = (e: React.MouseEvent, index: number) => {
        e.preventDefault(); 
        setContextMenu({ x: e.clientX, y: e.clientY, messageIndex: index });
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
        if (e.key === "Enter") {
            handleSendMessage();
        }
    };

    useEffect(() => {
        const messageContainer = messageContainerRef.current;
        if (messageContainer && isAutoScroll) {
            messageContainer.scrollTop = messageContainer.scrollHeight;
        }
    }, [messages, isAutoScroll]);

    const handleScroll = () => {
        const messageContainer = messageContainerRef.current;
        if (messageContainer) {
            const isAtBottom =
               
                messageContainer.scrollHeight - messageContainer.scrollTop ===
               
                messageContainer.clientHeight;
            setIsAutoScroll(isAtBottom);
        }
    };

    const onChatLoad = () => {
        constructSocket();
    };

    useEffect(() => {
        onChatLoad();
    }, []);

    return (
        <div className="chat" onClick={() => setContextMenu(null)}> {}
            <ul
               
                className="messageContainer"
               
                ref={messageContainerRef}
               
                onScroll={handleScroll}
            
            >
                {messages.map((message, index) => (
                    <li key={index} className="messageList">
                        <span className="message">
                            {message}
                        </span>
                        <span className="messageText">{message.message}</span>
                    </li>
                ))}
            </ul>

            {contextMenu && (
                <div
                    className="contextMenu"
                    style={{ top: `${contextMenu.y}px`, left: `${contextMenu.x}px` }}
                >
                    <button
                        onClick={() => handleDeleteMessage(contextMenu.messageIndex)}
                        className="contextMenuButton"
                    >
                        Delete
                    </button>
                </div>
            )}

            <div className="inputContainer">
                <input
                    type="text"
                    className="chatInput"
                    placeholder="Type a message..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                />
                <button
                    className="sendButton"
                    onClick={handleSendMessage}
                >
                    Send
                </button>
            </div>
        </div>
    );
}