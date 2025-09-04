import axios from "axios";
import { useState, useEffect } from "react";
import { BASE_URL } from "../../utils/constant";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { adduser } from "../../utils/userSlice";

const Login = () => {
  const [emailId, setEmailId] = useState("test1@gmail.com");
  const [password, setPassword] = useState("Test@123");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [error, setError] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);

  const user = useSelector((store) => store.user);

  const dispatch = useDispatch();
  const navigate = useNavigate();


  if (user) {
    navigate("/");
  }

  const handelLogin = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await axios.post(
        BASE_URL + "/login",
        {
          emailID: emailId,
          password,
        },
        { withCredentials: true }
      );

      dispatch(adduser(res.data));
      return navigate("/");
    } catch (err) {
      console.log(err);
      if (err?.status === 400) {
        setError(err?.response?.data || "something went wrong");
      } else {
        setError("Login failed. Please try again.");
      }
      console.log("Error1: " + err);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await axios.post(
        BASE_URL + "/signup",
        {
          firstName,
          lastName,
          email: emailId,
          password,
        },
        { withCredentials: true }
      );

      dispatch(adduser(res.data.data));
      return navigate("/profile");
    } catch (err) {
      console.log(err);
      if (err?.status === 400) {
        setError(err?.response?.data || "something went wrong");
      } else {
        setError("Sign up failed. Please try again.");
      }
      console.log("Error1: " + err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
  // Redirect logged-in users to home
  if (user) navigate("/");

  // Optionally wake up backend on mount
  const wakeUpBackend = async () => {
    try {
      await axios.get(BASE_URL);
    } catch (err) {
      console.log("Backend wakeup failed:", err);
    }
  };
  wakeUpBackend();
}, [user, navigate]);

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-2">SwipeChat</h1>
          <p className="text-slate-600">Connect with amazing people</p>
        </div>

        {/* Main Card */}
        <div className="card">
          <div className="p-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-slate-800 mb-2">
                {isLogin ? "Welcome Back" : "Create Account"}
              </h2>
              <p className="text-slate-600">
                {isLogin
                  ? "Sign in to your account to continue"
                  : "Join SwipeChat and start connecting"}
              </p>
            </div>

            <div className="space-y-4">
              {!isLogin && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      placeholder="Enter first name"
                      className="form-input w-full"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      placeholder="Enter last name"
                      className="form-input w-full"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="form-input w-full"
                  value={emailId}
                  onChange={(e) => setEmailId(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  placeholder="Enter your password"
                  className="form-input w-full"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 text-sm font-medium">{error}</p>
              </div>
            )}

            <button
              className={`btn-primary w-full mt-6 ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
              onClick={isLogin ? handelLogin : handleSignUp}
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>
                    {isLogin ? "Signing in..." : "Creating account..."}
                  </span>
                </div>
              ) : isLogin ? (
                "Sign In"
              ) : (
                "Create Account"
              )}
            </button>

            <div className="mt-6 text-center">
              <p className="text-slate-600 mb-3">
                {isLogin
                  ? "Don't have an account?"
                  : "Already have an account?"}
              </p>
              <button
                className="btn-secondary"
                onClick={() => setIsLogin(!isLogin)}
              >
                {isLogin ? "Sign Up" : "Sign In"}
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-slate-500 text-sm">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
