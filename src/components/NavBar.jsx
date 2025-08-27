import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { BASE_URL } from "../utils/constant";
import axios from "axios";
import { removeuser } from "../utils/userSlice";
import { removeFeed } from "../utils/feedSlice";
import { useState } from "react";

const NavBar = () => {
  const user = useSelector((store) => store.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);

  const handelLogOut = async () => {
    try {
      setLoggingOut(true);
      await axios.post(BASE_URL + "/logout", {}, { withCredentials: true });
      dispatch(removeuser());
      dispatch(removeFeed());
      navigate("/login");
    } catch (err) {
      console.log("Error: " + err.message);
      alert("Failed to logout. Please try again.");
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <nav className="bg-white/95 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0">
            <Link
              to={"/"}
              className="text-2xl font-bold text-slate-800 hover:text-slate-600 transition-colors duration-200"
            >
              SwipeChat
            </Link>
          </div>
          {user && (
            <div className="flex items-center space-x-8">
              <Link
                to="/profile"
                className="text-slate-600 hover:text-slate-900 font-medium transition-colors duration-200 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-slate-900 after:transition-all after:duration-200 hover:after:w-full"
              >
                Profile
              </Link>
              <Link
                to="/connections"
                className="text-slate-600 hover:text-slate-900 font-medium transition-colors duration-200 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-slate-900 after:transition-all after:duration-200 hover:after:w-full"
              >
                Connections
              </Link>
              <Link
                to="/requests"
                className="text-slate-600 hover:text-slate-900 font-medium transition-colors duration-200 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-slate-900 after:transition-all after:duration-200 hover:after:w-full"
              >
                Requests
              </Link>
              <Link
                to="/premium"
                className="bg-slate-900 text-white px-5 py-2 rounded-lg font-medium hover:bg-slate-800 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                Premium
              </Link>
              <div className="flex items-center space-x-3">
                <span className="text-slate-600 font-medium hidden md:block">
                  {user.firstName}
                </span>
                <div className="relative group">
                  <button className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-slate-200 hover:ring-slate-300 transition-all duration-200">
                    <img
                      alt="profile"
                      src={user.photourl}
                      className="w-full h-full object-cover"
                    />
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="p-2">
                      <button
                        onClick={handelLogOut}
                        disabled={loggingOut}
                        className={`w-full text-left px-4 py-2 rounded-lg font-medium cursor-pointer transition-colors duration-200 ${
                          loggingOut
                            ? "text-black cursor-not-allowed"
                            : "text-black  hover:bg-white"
                        }`}
                      >
                        {loggingOut ? "Logging out..." : "Logout"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
