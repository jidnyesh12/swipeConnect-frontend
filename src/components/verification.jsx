import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { BASE_URL } from "../utils/constant";
import LoadingSpinner from "./common/LoadingSpinner";

const Verification = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("verifying"); // verifying, success, error
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verifyUser = async () => {
      try {
        const response = await axios.post(`${BASE_URL}/verify/${token}`);
        setStatus("success");
        setMessage(response.data.message);

        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate("/");
        }, 3000);
      } catch (error) {
        setStatus("error");
        setMessage(error.response?.data?.message || "Verification failed");
      }
    };

    if (token) {
      verifyUser();
    } else {
      setStatus("error");
      setMessage("Invalid verification link");
    }
  }, [token, navigate]);

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center p-4">
      <div className="w-full max-w-md card">
        <div className="p-8 text-center">
          {status === "verifying" && (
            <LoadingSpinner
              title="Verifying Account"
              subtitle="Please wait while we verify your account"
              size="large"
            />
          )}

          {status === "success" && (
            <>
              <div className="mb-6">
                <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              </div>
              <h2 className="text-2xl font-bold text-green-600 mb-4">
                Account Verified!
              </h2>
              <p className="text-slate-700 mb-4">{message}</p>
              <p className="text-sm text-slate-500">
                Redirecting to feed in 3 seconds...
              </p>
            </>
          )}

          {status === "error" && (
            <>
              <div className="mb-6">
                <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </div>
              </div>
              <h2 className="text-2xl font-bold text-red-600 mb-4">
                Verification Failed
              </h2>
              <p className="text-slate-700 mb-6">{message}</p>
              <button
                onClick={() => navigate("/login")}
                className="btn-primary"
              >
                Go to Login
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Verification;
