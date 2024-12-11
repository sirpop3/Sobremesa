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

    // Handle Enter key press in the chat input
    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
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

    // Function to run when the chat is loaded
    const onChatLoad = () => {
        constructSocket(); // Connect to the WebSocket server
        // Add any other logic you want to run when the chat loads
    };

    useEffect(() => {
        onChatLoad();
    }, []); // Empty dependency array ensures this runs only once when the component mounts

    return (
        <div className="chat">
            <ul
                className="messageContainer"
                ref={messageContainerRef}
                onScroll={handleScroll}
            >
                {/* Display chat messages */}
                {messages.map((message, index) => (
                    <li key={index} className="messageList">
                        <span
                            className="messageUsername"
                            style={{ color: message.color }}
                        >
                            {message.username}:
                        </span>
                        <span className="messageText">{message.message}</span>
                    </li>
                ))}
            </ul>

            {/* Input field to type chat messages */}
            <div className="inputContainer">
                <input
                    type="text"
                    className="chatInput"
                    placeholder="Type a message..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyPress={handleKeyPress} // Add key press event
                />
                <button className="sendButton" onClick={handleSendMessage}>
                    Send
                </button>
            </div>
        </div>
    );
}