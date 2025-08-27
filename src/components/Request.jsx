import axios from "axios";
import { BASE_URL } from "../utils/constant";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  addReceivedRequests,
  addSentRequests,
  removeReceivedRequest,
  setLoading,
  setRefreshing,
  setError,
  setActionLoading,
} from "../utils/requestSlice";
import LoadingSpinner from "./common/LoadingSpinner";

const Request = () => {
  const {
    received: requests,
    sent: sentRequests,
    loading,
    refreshing,
    error,
    actionLoading,
  } = useSelector((store) => store.requests);
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState("received");

  const fetchAllRequests = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        dispatch(setRefreshing(true));
      } else {
        dispatch(setLoading(true));
      }
      dispatch(setError(""));

      // Fetch both received and sent requests simultaneously
      const [receivedRes, sentRes] = await Promise.all([
        axios.get(BASE_URL + "/user/request/recieved", {
          withCredentials: true,
        }),
        axios.get(BASE_URL + "/user/request/sent", { withCredentials: true }),
      ]);

      dispatch(addReceivedRequests(receivedRes.data.data));
      dispatch(addSentRequests(sentRes.data.data));
    } catch (err) {
      dispatch(setError("Failed to load requests"));
      console.log(err);
    } finally {
      dispatch(setLoading(false));
      dispatch(setRefreshing(false));
    }
  };

  useEffect(() => {
    fetchAllRequests();
  }, []);

  const handleReview = async (status, _id) => {
    try {
      dispatch(setActionLoading({ requestId: _id, loading: true }));
      await axios.post(
        BASE_URL + "/request/review/" + status + "/" + _id,
        {},
        { withCredentials: true }
      );
      dispatch(removeReceivedRequest(_id));
    } catch (err) {
      dispatch(setError("Failed to process request"));
      console.log(err);
    } finally {
      dispatch(setActionLoading({ requestId: _id, loading: false }));
    }
  };

  const renderLinkedInCard = (person, isReceived = true, requestId = null) => {
    // Handle null person case
    if (!person) {
      return (
        <div
          key={requestId}
          className="card p-6 bg-red-50 border border-red-200"
        >
          <div className="text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <svg
                className="w-6 h-6 text-red-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <p className="text-red-600 font-medium">User data unavailable</p>
            <p className="text-red-500 text-sm">
              This user may have been deleted
            </p>
          </div>
        </div>
      );
    }

    const { _id, firstName, lastName, about, photourl, skills, age, gender } =
      person;

    return (
      <div
        key={_id || requestId}
        className="card p-6 hover:shadow-lg transition-all duration-200"
      >
        <div className="flex items-start space-x-4">
          {/* Profile Image */}
          <div className="w-16 h-16 rounded-full overflow-hidden ring-2 ring-slate-200 flex-shrink-0">
            <img
              src={photourl}
              alt={`${firstName} ${lastName}`}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Name and Basic Info */}
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 truncate">
                  {firstName} {lastName}
                </h3>
                <p className="text-sm text-slate-600">
                  {age} years • {gender}
                </p>
              </div>
              {!isReceived && (
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                  Pending
                </span>
              )}
            </div>

            {/* About */}
            {about && (
              <p className="text-sm text-slate-700 mb-3 line-clamp-2 leading-relaxed">
                {about}
              </p>
            )}

            {/* Skills */}
            {skills && skills.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-4">
                {skills.slice(0, 3).map((skill, i) => (
                  <span
                    key={i}
                    className="bg-slate-100 text-slate-700 px-2 py-1 rounded text-xs font-medium"
                  >
                    {skill}
                  </span>
                ))}
                {skills.length > 3 && (
                  <span className="text-slate-500 text-xs px-2 py-1">
                    +{skills.length - 3} more
                  </span>
                )}
              </div>
            )}

            {/* Action Buttons - Only for received requests */}
            {isReceived && (
              <div className="flex space-x-3">
                <button
                  className={`flex-1 py-2 px-4 rounded-lg font-medium text-sm transition-all duration-200 ${
                    actionLoading[requestId]
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-green-600 text-white hover:bg-green-700"
                  }`}
                  onClick={() => handleReview("accepted", requestId)}
                  disabled={actionLoading[requestId]}
                >
                  {actionLoading[requestId] ? "Processing..." : "Accept"}
                </button>
                <button
                  className={`flex-1 py-2 px-4 rounded-lg font-medium text-sm transition-all duration-200 ${
                    actionLoading[requestId]
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "btn-secondary hover:bg-slate-100"
                  }`}
                  onClick={() => handleReview("rejected", requestId)}
                  disabled={actionLoading[requestId]}
                >
                  {actionLoading[requestId] ? "Processing..." : "Decline"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <LoadingSpinner
        variant="fullscreen"
        title="Loading Requests"
        subtitle="Please wait while we fetch your connection requests..."
      />
    );
  }

  const currentData = activeTab === "received" ? requests : sentRequests;
  // Filter out requests with null users before checking if we have data
  const validData =
    currentData?.filter((request) =>
      activeTab === "received" ? request.fromUserId : request.toUserId
    ) || [];
  const hasData = validData.length > 0;

  return (
    <div className="min-h-screen bg-primary p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-2">
            <h1 className="text-3xl font-bold text-slate-800">
              Connection Requests
            </h1>
            <button
              onClick={() => fetchAllRequests(true)}
              disabled={refreshing}
              className={`p-2 rounded-lg transition-all duration-200 ${
                refreshing
                  ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-800"
              }`}
              title="Refresh requests"
            >
              <svg
                className={`w-5 h-5 ${refreshing ? "animate-spin" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </button>
          </div>
          <p className="text-slate-600">Manage your connection requests</p>
        </div>

        {/* Tabs */}
        <div className="card mb-6">
          <div className="flex border-b border-slate-200">
            <button
              className={`flex-1 py-4 px-6 font-medium text-sm transition-colors duration-200 ${
                activeTab === "received"
                  ? "text-slate-900 border-b-2 border-slate-900"
                  : "text-slate-600 hover:text-slate-900"
              }`}
              onClick={() => setActiveTab("received")}
            >
              Received Requests
              {requests && requests.length > 0 && (
                <span className="ml-2 bg-slate-900 text-white px-2 py-1 rounded-full text-xs">
                  {requests.length}
                </span>
              )}
            </button>
            <button
              className={`flex-1 py-4 px-6 font-medium text-sm transition-colors duration-200 ${
                activeTab === "sent"
                  ? "text-slate-900 border-b-2 border-slate-900"
                  : "text-slate-600 hover:text-slate-900"
              }`}
              onClick={() => setActiveTab("sent")}
            >
              Sent Requests
              {sentRequests && sentRequests.length > 0 && (
                <span className="ml-2 bg-slate-900 text-white px-2 py-1 rounded-full text-xs">
                  {sentRequests.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="card p-6 text-center mb-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-red-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-red-600 mb-2">
              Something went wrong
            </h2>
            <p className="text-slate-700 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-red-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors duration-200"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!hasData && !error && (
          <div className="card p-8 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-slate-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-slate-800 mb-2">
              {activeTab === "received"
                ? "No Received Requests"
                : "No Sent Requests"}
            </h2>
            <p className="text-slate-600">
              {activeTab === "received"
                ? "You're all caught up! No new connection requests at the moment."
                : "You haven't sent any connection requests yet."}
            </p>
          </div>
        )}

        {/* Content */}
        {hasData && (
          <div className="space-y-4">
            {activeTab === "received"
              ? requests
                  .filter((request) => request.fromUserId) // Filter out null users
                  .map((request) =>
                    renderLinkedInCard(request.fromUserId, true, request._id)
                  )
              : sentRequests
                  .filter((request) => request.toUserId) // Filter out null users
                  .map((request) =>
                    renderLinkedInCard(request.toUserId, false, request._id)
                  )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Request;
