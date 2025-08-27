import { useState, useEffect } from "react";
import axios from "axios";
import { BASE_URL } from "../utils/constant";
import { useSelector, useDispatch } from "react-redux";
import { adduser } from "../utils/userSlice";
import LoadingSpinner from "./common/LoadingSpinner";

const Premium = () => {
  const user = useSelector((store) => store.user);
  const dispatch = useDispatch();
  const [basicLoading, setBasicLoading] = useState(false);
  const [proLoading, setProLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const refreshUserData = async () => {
    try {
      const res = await axios.get(BASE_URL + "/profile", {
        withCredentials: true,
      });
      dispatch(adduser(res.data));
    } catch (err) {
      console.log("Failed to refresh user data:", err);
    }
  };

  const handlePurchase = async (planType) => {
    const setLoading = planType === "basic" ? setBasicLoading : setProLoading;

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      // Check if Razorpay is loaded
      if (!window.Razorpay) {
        throw new Error(
          "Payment gateway not loaded. Please refresh and try again."
        );
      }

      const order = await axios.post(
        BASE_URL + "/payment/create",
        { planType },
        { withCredentials: true }
      );

      const { amount, keyId, currency, notes, orderId } = order.data;

      const options = {
        key: keyId,
        amount: amount,
        currency: currency,
        name: "DevTinder Premium",
        description: `${planType.toUpperCase()} Plan Subscription`,
        order_id: orderId,
        prefill: {
          name: notes.firstName + " " + notes.lastName,
          email: notes.emailId,
          contact: "9999999999",
        },
        theme: {
          color: "#F37254",
        },
        handler: async function (response) {
          try {
            setSuccess("Payment successful! Updating subscription...");
            await refreshUserData();
            setSuccess("Subscription activated successfully!");
            setTimeout(() => setSuccess(""), 3000);
          } catch (err) {
            setError(
              "Payment completed but verification failed. Please contact support."
            );
          }
        },
        modal: {
          ondismiss: function () {
            setError(
              "Payment cancelled. Please try again if you want to subscribe."
            );
            setLoading(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (response) {
        setError(`Payment failed: ${response.error.description}`);
        setLoading(false);
      });

      rzp.open();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to initiate payment"
      );
      console.log("Payment error:", err);
    } finally {
      // Don't set loading false here as it will be handled by payment completion
      setTimeout(() => setLoading(false), 1000);
    }
  };

  // Check if user has unpaid subscription
  const hasUnpaidSubscription =
    user?.isPremium && user?.planType && user?.planType !== "None";
  const isBasicPlan = user?.planType === "basic";
  const isProPlan = user?.planType === "pro";

  return (
    <div className="min-h-screen bg-primary p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-2">
            Premium Plans
          </h1>
          <p className="text-slate-600 text-lg">
            Unlock the full potential of SwipeChat
          </p>

          {/* Active Plan Display */}
          {user?.isPremium && user?.planType && user?.planType !== "None" && (
            <div className="mt-6 inline-block">
              <div className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-full shadow-lg">
                <div className="flex items-center space-x-2">
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="font-semibold">
                    Active Plan:{" "}
                    {user.planType.charAt(0).toUpperCase() +
                      user.planType.slice(1)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Payment Status Warning - Only show if payment is not completed */}
          {user?.planType && user?.planType !== "None" && !user?.isPremium && (
            <div className="mt-4 inline-block">
              <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-6 py-3 rounded-full shadow-lg">
                <div className="flex items-center space-x-2">
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="font-semibold">
                    Payment Pending for{" "}
                    {user.planType.charAt(0).toUpperCase() +
                      user.planType.slice(1)}{" "}
                    Plan
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Success Message */}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 text-center">
            <div className="flex items-center justify-center space-x-2">
              <svg
                className="w-5 h-5 text-green-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <p className="text-green-800 font-medium">{success}</p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <svg
                className="w-5 h-5 text-red-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <p className="text-red-800 font-medium">{error}</p>
            </div>
            <button
              onClick={() => setError("")}
              className="text-red-600 hover:text-red-800 text-sm font-medium underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="mb-6">
            <LoadingSpinner
              variant="inline"
              size="small"
              title="Processing..."
              subtitle=""
            />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Basic Plan */}
          <div className="card overflow-hidden">
            <div className="bg-slate-800 p-6 text-center text-white">
              <h2 className="text-2xl font-bold mb-2">Basic Plan</h2>
              <div className="text-4xl font-bold">
                $9.99<span className="text-lg font-normal">/month</span>
              </div>
            </div>
            <div className="p-6">
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center">
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
                  <span className="text-slate-700">Unlimited swipes</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center">
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
                  <span className="text-slate-700">See who liked you</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center">
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
                  <span className="text-slate-700">Priority support</span>
                </li>
              </ul>
              {isBasicPlan ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                  <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg
                      className="w-6 h-6 text-white"
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
                  <h3 className="text-lg font-semibold text-green-800 mb-1">
                    Current Plan
                  </h3>
                  <p className="text-green-600 text-sm">
                    You're subscribed to this plan
                  </p>
                </div>
              ) : (
                <button
                  onClick={() => handlePurchase("basic")}
                  disabled={basicLoading || isProPlan}
                  className={`btn-primary w-full ${
                    basicLoading || isProPlan
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                >
                  {basicLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Processing...</span>
                    </div>
                  ) : isProPlan ? (
                    "Downgrade to Basic"
                  ) : (
                    "Get Basic Plan"
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Pro Plan */}
          <div className="card overflow-hidden relative">
            <div className="absolute -top-2 -right-2 bg-slate-900 text-white px-3 py-1 rounded-full text-sm font-semibold transform rotate-12 shadow-lg">
              Popular
            </div>
            <div className="bg-slate-900 p-6 text-center text-white">
              <h2 className="text-2xl font-bold mb-2">Pro Plan</h2>
              <div className="text-4xl font-bold">
                $19.99<span className="text-lg font-normal">/month</span>
              </div>
            </div>
            <div className="p-6">
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center">
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
                  <span className="text-slate-700">All Basic features</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center">
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
                  <span className="text-slate-700">Super likes</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center">
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
                  <span className="text-slate-700">Boost profile</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center">
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
                  <span className="text-slate-700">Advanced filters</span>
                </li>
              </ul>
              {isProPlan ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                  <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg
                      className="w-6 h-6 text-white"
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
                  <h3 className="text-lg font-semibold text-green-800 mb-1">
                    Current Plan
                  </h3>
                  <p className="text-green-600 text-sm">
                    You're subscribed to this plan
                  </p>
                </div>
              ) : (
                <button
                  onClick={() => handlePurchase("pro")}
                  disabled={proLoading}
                  className={`btn-primary w-full ${
                    proLoading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {proLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Processing...</span>
                    </div>
                  ) : isBasicPlan ? (
                    "Upgrade to Pro"
                  ) : (
                    "Get Pro Plan"
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Payment Security Footer */}
        <div className="card p-6 mt-8 text-center">
          <div className="flex items-center justify-center gap-6 mb-4 flex-wrap">
            <div className="flex items-center space-x-2 text-green-600">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="font-medium">SSL Secured</span>
            </div>
            <div className="flex items-center space-x-2 text-blue-600">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                <path
                  fillRule="evenodd"
                  d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="font-medium">Razorpay Protected</span>
            </div>
          </div>
          <p className="text-slate-600 text-sm">
            Secure payment gateway • Instant activation
          </p>
        </div>
      </div>
    </div>
  );
};

export default Premium;
