import { BASE_URL } from "../utils/constant";
import axios from "axios";
import { useDispatch } from "react-redux";
import { removeUserFromFeed } from "../utils/feedSlice";
import { useState, useRef } from "react";

const ProfileCard = ({ user, isSelf }) => {
  const dispatch = useDispatch();
  const cardRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  const [cardTransform, setCardTransform] = useState({ x: 0, rotate: 0 });

  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");

  const handleSendRequest = async (status, userID) => {
    try {
      setActionLoading(true);
      setActionError("");
      const res = await axios.post(
        BASE_URL + "/request/send/" + status + "/" + userID,
        {},
        { withCredentials: true }
      );

      dispatch(removeUserFromFeed(userID));
    } catch (err) {
      setActionError("Failed to send request. Please try again.");
      console.log(err);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle swipe start (mouse/touch)
  const handleStart = (clientX) => {
    setIsDragging(true);
    setStartX(clientX);
    setCurrentX(clientX);
  };

  // Handle swipe move (mouse/touch)
  const handleMove = (clientX) => {
    if (!isDragging) return;

    const deltaX = clientX - startX;
    const rotation = deltaX * 0.08; // Subtle rotation based on swipe distance

    setCurrentX(clientX);
    setCardTransform({ x: deltaX, rotate: rotation });
  };

  // Handle swipe end (mouse/touch)
  const handleEnd = () => {
    if (!isDragging) return;

    const deltaX = currentX - startX;
    const threshold = 120; // Minimum swipe distance to trigger action

    if (Math.abs(deltaX) > threshold) {
      if (deltaX > 0) {
        // Right swipe - Interested
        handleSendRequest("interested", user._id);
      } else {
        // Left swipe - Ignore
        handleSendRequest("ignored", user._id);
      }
    }

    // Reset card position
    setIsDragging(false);
    setCardTransform({ x: 0, rotate: 0 });
  };

  // Mouse events
  const handleMouseDown = (e) => {
    e.preventDefault();
    handleStart(e.clientX);
  };

  const handleMouseMove = (e) => {
    e.preventDefault();
    handleMove(e.clientX);
  };

  const handleMouseUp = (e) => {
    e.preventDefault();
    handleEnd();
  };

  // Touch events
  const handleTouchStart = (e) => {
    handleStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e) => {
    handleMove(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    handleEnd();
  };

  // Get overlay style based on swipe direction
  const getOverlayStyle = () => {
    const { x } = cardTransform;
    const intensity = Math.min(Math.abs(x) / 150, 1);

    if (x > 60) {
      return {
        background: `linear-gradient(135deg, rgba(16, 185, 129, ${
          intensity * 0.15
        }) 0%, rgba(5, 150, 105, ${intensity * 0.25}) 100%)`,
        backdropFilter: "blur(2px)",
      };
    } else if (x < -60) {
      return {
        background: `linear-gradient(135deg, rgba(239, 68, 68, ${
          intensity * 0.15
        }) 0%, rgba(220, 38, 38, ${intensity * 0.25}) 100%)`,
        backdropFilter: "blur(2px)",
      };
    }
    return { opacity: 0 };
  };

  // Mock interests for demo (you can add this to user data later)

  return (
    <div className="w-full max-w-xs mx-auto">
      <div
        ref={cardRef}
        className="relative w-full bg-white rounded-2xl overflow-hidden transition-all duration-300 cursor-grab active:cursor-grabbing select-none"
        style={{
          transform: `translateX(${cardTransform.x}px) rotate(${cardTransform.rotate}deg)`,
          transition: isDragging
            ? "none"
            : "transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
          boxShadow: isDragging
            ? "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
            : "0 15px 20px -5px rgba(0, 0, 0, 0.1), 0 8px 8px -5px rgba(0, 0, 0, 0.04)",
        }}
        onMouseDown={!isSelf ? handleMouseDown : undefined}
        onMouseMove={isDragging ? handleMouseMove : undefined}
        onMouseUp={isDragging ? handleMouseUp : undefined}
        onMouseLeave={isDragging ? handleMouseUp : undefined}
        onTouchStart={!isSelf ? handleTouchStart : undefined}
        onTouchMove={isDragging ? handleTouchMove : undefined}
        onTouchEnd={isDragging ? handleTouchEnd : undefined}
      >
        {/* Swipe Overlay */}
        {!isSelf && (
          <div
            className="absolute inset-0 z-20 pointer-events-none transition-all duration-200 rounded-2xl"
            style={getOverlayStyle()}
          />
        )}

        {/* Main Image */}
        <div className="relative h-72 overflow-hidden rounded-t-2xl">
          <img
            src={user.photourl}
            alt="Profile"
            className="w-full h-full object-cover"
            draggable={false}
          />
        </div>

        {/* Content Section */}
        <div className="p-4 bg-white rounded-b-2xl">
          {/* Name, Age and Verified Badge */}
          <div className="flex items-center mb-2">
            <h2 className="text-xl font-bold text-gray-900 mr-2">
              {user.firstName}
              {user.age && <span className="font-normal">, {user.age}</span>}
            </h2>
            {/* Blue Verified Checkmark */}
            {user.isVerified && (
              <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center ml-1">
                <svg
                  className="w-3 h-3 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            )}
          </div>

          {/* Bio */}
          {user.about && (
            <div className="mb-3">
              <p className="text-gray-700 text-sm leading-relaxed line-clamp-2">
                {user.about}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          {!isSelf && (
            <div className="flex items-center justify-center space-x-4 pt-2">
              {/* Pass Button */}
              <button
                onClick={() => handleSendRequest("ignored", user._id)}
                disabled={actionLoading}
                className="w-12 h-12 bg-red-100 hover:bg-red-200 rounded-full flex items-center justify-center transition-all duration-200 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
              >
                <svg
                  className="w-6 h-6 text-red-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>

              {/* Like Button */}
              <button
                onClick={() => handleSendRequest("interested", user._id)}
                disabled={actionLoading}
                className="w-12 h-12 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center transition-all duration-200 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
              >
                <svg
                  className="w-6 h-6 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          )}

          {/* Action Error */}
          {actionError && (
            <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-lg text-red-800 text-xs font-medium text-center">
              {actionError}
            </div>
          )}
        </div>

        {/* Loading Overlay */}
        {actionLoading && (
          <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center z-30 rounded-2xl">
            <div className="bg-white shadow-lg rounded-xl p-4 flex items-center space-x-2">
              <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
              <span className="text-gray-700 font-medium text-sm">
                Processing...
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileCard;
