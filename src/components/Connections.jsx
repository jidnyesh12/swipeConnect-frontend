import axios from "axios";
import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { BASE_URL } from "../utils/constant";
import { addConnections } from "../utils/connectionsSlice";
import { createSocketConnection } from "../utils/socket";

const Connections = () => {
  const connections = useSelector((store) => store.connections);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedChat, setSelectedChat] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("disconnected");
  const [connectionsWithChats, setConnectionsWithChats] = useState([]);
  const messagesEndRef = useRef(null);

  const user = useSelector((store) => store.user);
  const isPremium = user.isPremium;

  const dispatch = useDispatch();

  const fetchConnections = async () => {
    try {
      setLoading(true);
      const res = await axios.get(BASE_URL + "/user/connections", {
        withCredentials: true,
      });
      dispatch(addConnections(res.data.data));

      // Fetch chat data for each connection
      await fetchAllChatsData(res.data.data);
      setError("");
    } catch (err) {
      setError("Failed to load connections");
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllChatsData = async (connections) => {
    try {
      const connectionsWithChatData = await Promise.all(
        connections.map(async (connection) => {
          try {
            const chat = await axios.get(BASE_URL + "/chat/" + connection._id, {
              withCredentials: true,
            });

            const messages = chat?.data?.messages || [];
            const lastMessage =
              messages.length > 0 ? messages[messages.length - 1] : null;

            return {
              ...connection,
              lastMessage: lastMessage
                ? {
                    text: lastMessage.text,
                    time: lastMessage.time,
                    senderId: lastMessage.senderId._id,
                  }
                : null,
              hasUnread: false, // You can implement unread logic here
            };
          } catch (err) {
            console.log(
              `Error fetching chat for ${connection.firstName}:`,
              err
            );
            return {
              ...connection,
              lastMessage: null,
              hasUnread: false,
            };
          }
        })
      );

      // Sort connections by last message time (most recent first)
      const sortedConnections = connectionsWithChatData.sort((a, b) => {
        if (!a.lastMessage && !b.lastMessage) return 0;
        if (!a.lastMessage) return 1;
        if (!b.lastMessage) return -1;
        return new Date(b.lastMessage.time) - new Date(a.lastMessage.time);
      });

      setConnectionsWithChats(sortedConnections);
    } catch (err) {
      console.log("Error fetching chats data:", err);
      setConnectionsWithChats(
        connections.map((conn) => ({
          ...conn,
          lastMessage: null,
          hasUnread: false,
        }))
      );
    }
  };

  const fetchChatMessages = async (toUserId) => {
    try {
      const chat = await axios.get(BASE_URL + "/chat/" + toUserId, {
        withCredentials: true,
      });

      const chatMessages = chat?.data?.messages.map((message) => {
        return {
          text: message?.text,
          sender: message?.senderId._id,
          time: message?.time,
        };
      });
      setMessages(chatMessages);
    } catch (err) {
      console.log("Error loading messages: " + err);
      setMessages([]);
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({
          behavior: "smooth",
          block: "end",
          inline: "nearest",
        });
      }
    }, 150);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    fetchConnections();
  }, []);

  useEffect(() => {
    if (!user?._id || !selectedChat) {
      return;
    }

    const socket = createSocketConnection();

    socket.on("connect", () => {
      setConnectionStatus("connected");
    });

    socket.on("disconnect", () => {
      setConnectionStatus("disconnected");
    });

    socket.emit("joinChat", {
      firstName: user.firstName,
      userId: user._id,
      toUserId: selectedChat._id,
    });

    socket.on("textReceived", ({ userId, data, time }) => {
      const message = {
        text: data,
        sender: userId,
        time,
      };

      setMessages((prevMessages) => {
        const isDuplicate = prevMessages.some(
          (msg) =>
            msg.text === data &&
            msg.sender === userId &&
            Math.abs(new Date(msg.time) - new Date(time)) < 1000
        );
        if (isDuplicate) return prevMessages;
        return [...prevMessages, message];
      });

      // Update the connections list with the new message
      setConnectionsWithChats((prevConnections) => {
        const updatedConnections = prevConnections.map((conn) => {
          if (conn._id === userId || conn._id === selectedChat._id) {
            return {
              ...conn,
              lastMessage: {
                text: data,
                time: time,
                senderId: userId,
              },
            };
          }
          return conn;
        });

        // Re-sort by most recent message
        return updatedConnections.sort((a, b) => {
          if (!a.lastMessage && !b.lastMessage) return 0;
          if (!a.lastMessage) return 1;
          if (!b.lastMessage) return -1;
          return new Date(b.lastMessage.time) - new Date(a.lastMessage.time);
        });
      });
    });

    fetchChatMessages(selectedChat._id);

    return () => {
      socket.disconnect();
    };
  }, [user?._id, selectedChat]);

  const handleSend = async () => {
    if (!newMessage.trim() || !selectedChat) return;

    try {
      setSendingMessage(true);
      const socket = createSocketConnection();
      socket.emit("sendMessage", {
        userId: user._id,
        toUserId: selectedChat._id,
        data: newMessage,
        time: new Date(),
      });
      setNewMessage("");
    } catch (err) {
      console.log("Error sending message:", err);
    } finally {
      setSendingMessage(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const getTimeAgo = (timestamp) => {
    if (!timestamp) return "";

    const now = new Date();
    const messageTime = new Date(timestamp);
    const diffInSeconds = Math.floor((now - messageTime) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds}s`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d`;
    return `${Math.floor(diffInSeconds / 604800)}w`;
  };

  const filteredConnections = connectionsWithChats.filter(
    (connection) =>
      connection.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      connection.lastName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading your messages...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md">
          <div className="bg-red-100 border border-red-300 rounded-lg p-6">
            <h2 className="text-red-800 font-semibold mb-2">
              Connection Error
            </h2>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!connections || connections.length === 0) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-2xl">💬</span>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              No Messages Yet
            </h2>
            <p className="text-gray-600">
              Start connecting with people to begin conversations!
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-white flex">
      {/* Chat Sidebar */}
      <div className="w-80 border-r border-gray-200 flex flex-col bg-white">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-semibold text-gray-900 mb-4">Messages</h1>

          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search messages"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-black bg-gray-100 border-0 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            />
            <svg
              className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 transform -translate-y-1/2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto">
          {filteredConnections.map((connection) => {
            const isOnline = Math.random() > 0.5; // Mock online status - you can implement real online status
            const lastMessage = connection.lastMessage;
            const timeAgo = getTimeAgo(lastMessage?.time);

            // Determine message preview text
            let messagePreview = "No messages yet";
            if (lastMessage) {
              const isMyMessage = lastMessage.senderId === user._id;
              messagePreview = isMyMessage
                ? `You: ${lastMessage.text}`
                : lastMessage.text;
            }

            return (
              <div
                key={connection._id}
                onClick={() => setSelectedChat(connection)}
                className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                  selectedChat?._id === connection._id
                    ? "bg-blue-50 border-r-2 border-r-blue-500"
                    : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={connection.photourl}
                      alt={`${connection.firstName} ${connection.lastName}`}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    {isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-medium text-gray-900 truncate">
                        {connection.firstName} {connection.lastName}
                      </h3>
                      {timeAgo && (
                        <span className="text-xs text-gray-500">{timeAgo}</span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <p
                        className={`text-sm truncate flex-1 ${
                          lastMessage ? "text-gray-600" : "text-gray-400 italic"
                        }`}
                      >
                        {messagePreview}
                      </p>
                      {connection.hasUnread && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full ml-2"></div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 bg-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={selectedChat.photourl}
                    alt={`${selectedChat.firstName} ${selectedChat.lastName}`}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <h2 className="font-semibold text-gray-900">
                      {selectedChat.firstName} {selectedChat.lastName}
                    </h2>
                    <p
                      className={`text-sm ${
                        connectionStatus === "connected"
                          ? "text-green-600"
                          : "text-gray-500"
                      }`}
                    >
                      {connectionStatus === "connected" ? "Online" : "Offline"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Chat Messages */}
            {isPremium ? (
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                  {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-blue-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                          <svg
                            className="w-8 h-8 text-blue-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                            />
                          </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          Start a conversation with {selectedChat.firstName}
                        </h3>
                        <p className="text-gray-600">
                          {selectedChat.about ||
                            "Get to know each other better!"}
                        </p>
                      </div>
                    </div>
                  ) : (
                    messages.map((msg, index) => {
                      const isMe = msg.sender === user._id;
                      return (
                        <div
                          key={index}
                          className={`flex ${
                            isMe ? "justify-end" : "justify-start"
                          }`}
                        >
                          <div
                            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                              isMe
                                ? "bg-blue-500 text-white"
                                : "bg-white text-gray-900 border border-gray-200"
                            }`}
                          >
                            <p className="text-sm">{msg.text}</p>
                            <p
                              className={`text-xs mt-1 ${
                                isMe ? "text-blue-100" : "text-gray-500"
                              }`}
                            >
                              {new Date(msg.time).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-gray-200 bg-white">
                  <div className="flex items-end gap-3">
                    <div className="flex-1">
                      <textarea
                        placeholder="Type a message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={handleKeyPress}
                        disabled={
                          sendingMessage || connectionStatus !== "connected"
                        }
                        className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows="1"
                        maxLength="500"
                      />
                    </div>
                    <button
                      onClick={handleSend}
                      disabled={
                        !newMessage.trim() ||
                        sendingMessage ||
                        connectionStatus !== "connected"
                      }
                      className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                        !newMessage.trim() ||
                        sendingMessage ||
                        connectionStatus !== "connected"
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : "bg-blue-500 text-white hover:bg-blue-600"
                      }`}
                    >
                      {sendingMessage ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                          />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              /* Premium Required */
              <div className="flex-1 flex items-center justify-center bg-gray-50">
                <div className="text-center max-w-md">
                  <div className="w-16 h-16 bg-yellow-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <svg
                      className="w-8 h-8 text-yellow-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Premium Feature
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Upgrade to premium to start messaging your connections and
                    unlock unlimited conversations!
                  </p>
                  <button className="bg-yellow-500 text-white px-6 py-3 rounded-lg hover:bg-yellow-600 transition-colors font-medium">
                    Upgrade to Premium
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          /* No Chat Selected */
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center max-w-md">
              <div className="w-20 h-20 bg-gray-100 rounded-full mx-auto mb-6 flex items-center justify-center">
                <svg
                  className="w-10 h-10 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">
                Your Messages
              </h2>
              <p className="text-gray-600">
                Select a conversation from the sidebar to start chatting with
                your connections.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Connections;
