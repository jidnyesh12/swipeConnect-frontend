import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { createSocketConnection } from "../utils/socket";
import axios from "axios";
import { BASE_URL } from "../utils/constant";

const Chat = () => {
  const { toUserId } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [toUser, setToUser] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("connecting");
  const [retryCount, setRetryCount] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const user = useSelector((store) => store.user);

  const userId = user?._id;
  const firstName = user?.firstName;

  // Auto-scroll to bottom when new messages arrive
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

  const fetchOtherUser = async (toUserId) => {
    try {
      const res = await axios.get(BASE_URL + "/user/" + toUserId, {
        withCredentials: true,
      });
      setToUser(res.data.data);
    } catch (err) {
      console.log("Error Fteching other User: " + err);
      setError("Failed to load user information");
    }
  };

  const fetchChatMessage = async () => {
    try {
      setLoading(true);
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
      setError("");
    } catch (err) {
      setError("Failed to load chat messages");
      console.log("Error loading messages: " + err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChatMessage();
  }, []);

  useEffect(() => {
    if (!userId) {
      return;
    }
    fetchOtherUser(toUserId);

    const scoket = createSocketConnection();

    scoket.on("connect", () => {
      setConnectionStatus("connected");
    });

    scoket.on("disconnect", () => {
      setConnectionStatus("disconnected");
    });

    scoket.emit("joinChat", { firstName, userId, toUserId });

    // scoket.emit("broadcast", { data: "Jidnyesh" });

    // scoket.on("boardcasttoallclient", ({ data }) => {
    //   console.log(data);
    // });

    scoket.on("textReceived", ({ userId, data, time }) => {
      const message = {
        text: data,
        sender: userId,
        time,
      };

      setMessages((prevMessages) => {
        // Avoid duplicate messages
        const isDuplicate = prevMessages.some(
          (msg) =>
            msg.text === data &&
            msg.sender === userId &&
            Math.abs(new Date(msg.time) - new Date(time)) < 1000
        );
        if (isDuplicate) return prevMessages;
        return [...prevMessages, message];
      });
    });

    return () => {
      scoket.disconnect();
    };
  }, [userId, toUserId]);

  const handleSend = async () => {
    if (!newMessage.trim()) return;

    try {
      setSendingMessage(true);
      setError("");
      const scoket = createSocketConnection();
      scoket.emit("sendMessage", {
        userId,
        toUserId,
        data: newMessage,
        time: new Date(),
      });
      setNewMessage("");
      setRetryCount(0);
    } catch (err) {
      setError("Failed to send message. Please try again.");
      console.log("Error sending message:", err);
    } finally {
      setSendingMessage(false);
    }
  };

  const retryConnection = () => {
    setRetryCount((prev) => prev + 1);
    setConnectionStatus("connecting");
    // Force reconnection by refreshing the component
    window.location.reload();
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col h-screen bg-primary">
        <div className="flex-1 flex items-center justify-center">
          <div className="card p-8 text-center max-w-md">
            <div className="w-12 h-12 border-4 border-slate-300 border-t-slate-700 rounded-full animate-spin mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-slate-800 mb-2">
              Loading Chat
            </h2>
            <p className="text-slate-600">Connecting you with your match...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-purple-100">
      {/* Chat Header */}
      <div className="bg-white border-b-4 border-black p-4 shadow-[0_4px_0px_0px_#000] sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {toUser.photourl && (
              <div className="w-14 h-14 border-4 border-black overflow-hidden bg-gray-200 shadow-[3px_3px_0px_0px_#000]">
                <img
                  src={toUser.photourl}
                  alt={toUser.firstName}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div>
              <h1 className="text-xl font-black text-black uppercase tracking-tight">
                {toUser.firstName || "LOADING..."}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <div
                  className={`w-3 h-3 border-2 border-black shadow-[1px_1px_0px_0px_#000] ${
                    connectionStatus === "connected"
                      ? "bg-green-400"
                      : connectionStatus === "connecting"
                      ? "bg-yellow-400 animate-pulse"
                      : "bg-red-400"
                  }`}
                ></div>
                <span className="text-xs font-black text-gray-700 uppercase tracking-wide">
                  {isTyping ? "TYPING..." : connectionStatus}
                </span>
              </div>
            </div>
          </div>
          <div className="bg-purple-400 border-3 border-black px-3 py-1 font-black text-xs uppercase text-black shadow-[2px_2px_0px_0px_#000]">
            CHAT
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-500 border-b-4 border-black p-3 text-center">
          <p className="text-white font-black text-sm uppercase tracking-wide">
            ⚠️ {error}
          </p>
        </div>
      )}

      {/* Chat Messages */}
      <div
        className="flex-1 overflow-y-auto p-6 space-y-6"
        style={{ scrollBehavior: "smooth" }}
      >
        {messages.length === 0 && !loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="card p-8 text-center max-w-sm">
              <div className="w-16 h-16 bg-slate-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl">💬</span>
              </div>
              <p className="text-lg font-black text-gray-600 uppercase tracking-tight mb-2">
                NO MESSAGES YET
              </p>
              <p className="text-sm font-bold text-gray-500 uppercase">
                START THE CONVERSATION!
              </p>
            </div>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isMe = msg.sender === userId;
            const prevMsg = messages[index - 1];
            const showAvatar = !prevMsg || prevMsg.sender !== msg.sender;

            return (
              <div
                key={index}
                className={`flex items-end gap-3 ${
                  isMe ? "justify-end flex-row-reverse" : "justify-start"
                }`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 ${showAvatar ? "visible" : "invisible"}`}
                >
                  {!isMe && showAvatar && toUser.photourl && (
                    <div className="w-8 h-8 border-2 border-black overflow-hidden bg-gray-200">
                      <img
                        src={toUser.photourl}
                        alt={toUser.firstName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  {isMe && showAvatar && (
                    <div className="w-8 h-8 bg-blue-500 border-2 border-black flex items-center justify-center">
                      <span className="text-white font-black text-xs">YOU</span>
                    </div>
                  )}
                </div>

                {/* Message Bubble */}
                <div className="flex flex-col max-w-xs lg:max-w-md">
                  <div
                    className={`p-4 border-4 border-black shadow-[4px_4px_0px_0px_#000] relative ${
                      isMe ? "bg-blue-400 text-black" : "bg-white text-black"
                    }`}
                  >
                    {/* Message tail */}
                    <div
                      className={`absolute w-0 h-0 ${
                        isMe
                          ? "right-[-8px] border-l-[8px] border-l-blue-400 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent"
                          : "left-[-8px] border-r-[8px] border-r-white border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent"
                      }`}
                      style={{ top: "12px" }}
                    />

                    <p className="font-bold text-sm leading-relaxed break-words">
                      {msg.text}
                    </p>

                    <div
                      className={`flex items-center gap-2 mt-2 ${
                        isMe ? "justify-end" : "justify-start"
                      }`}
                    >
                      <span className="text-xs font-black text-gray-600 uppercase">
                        {new Date(msg.time).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
        {/* Scroll anchor with padding */}
        <div ref={messagesEndRef} className="h-4" />
      </div>

      {/* Input Box */}
      <div className="bg-white border-t-4 border-black p-6 shadow-[0_-4px_0px_0px_#000]">
        <div className="flex items-end gap-4">
          <div className="flex-1">
            <div className="relative">
              <textarea
                placeholder="TYPE YOUR MESSAGE..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={sendingMessage || connectionStatus !== "connected"}
                className="w-full p-4 text-sm font-bold bg-gray-50 border-4 border-black placeholder-gray-500 text-black focus:bg-white focus:outline-none focus:border-blue-500 focus:shadow-[2px_2px_0px_0px_#000] tracking-wide resize-none transition-all duration-150"
                rows="2"
                maxLength="500"
              />
              <div className="absolute bottom-2 right-2 text-xs font-bold text-gray-400">
                {newMessage.length}/500
              </div>
            </div>
          </div>
          <button
            onClick={handleSend}
            disabled={
              !newMessage.trim() ||
              sendingMessage ||
              connectionStatus !== "connected"
            }
            className={`px-8 py-4 font-black text-sm uppercase tracking-wider border-4 border-black shadow-[4px_4px_0px_0px_#000] transition-all duration-150 min-w-[100px] ${
              !newMessage.trim() ||
              sendingMessage ||
              connectionStatus !== "connected"
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-green-400 text-black hover:bg-green-500 hover:translate-x-1 hover:translate-y-1 hover:shadow-[2px_2px_0px_0px_#000] active:translate-x-2 active:translate-y-2 active:shadow-none"
            }`}
          >
            {sendingMessage ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-black border-t-transparent"></div>
                SENDING
              </div>
            ) : (
              "SEND"
            )}
          </button>
        </div>

        {connectionStatus !== "connected" && (
          <div className="flex items-center justify-between mt-4 p-3 bg-red-100 border-3 border-black">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 border-2 border-black animate-pulse"></div>
              <p className="text-sm font-black text-red-700 uppercase">
                CONNECTION LOST - MESSAGES CANNOT BE SENT
              </p>
            </div>
            <button
              onClick={retryConnection}
              className="bg-red-400 border-3 border-black px-4 py-2 font-black text-xs uppercase tracking-wide shadow-[3px_3px_0px_0px_#000] hover:bg-red-500 hover:translate-x-1 hover:translate-y-1 hover:shadow-[1px_1px_0px_0px_#000] transition-all duration-150"
            >
              RECONNECT
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
