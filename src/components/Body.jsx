import { Outlet, useNavigate } from "react-router-dom";
import NavBar from "./NavBar";
import Footer from "./Footer";
import { BASE_URL } from "../utils/constant";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { adduser } from "../utils/userSlice";
import { useEffect, useState } from "react";
import LoadingSpinner from "./common/LoadingSpinner";

const Body = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((store) => store.user);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchUser = async () => {
    if (user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await axios.get(BASE_URL + "/profile", {
        withCredentials: true,
      });
      dispatch(adduser(res.data));
      setError("");
    } catch (err) {
      if (err.status === 401) {
        navigate("/login");
      } else {
        setError("Failed to load user profile");
      }
      console.log("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  if (loading) {
    return (
      <LoadingSpinner
        variant="fullscreen"
        title="Loading SwipeChat"
        subtitle="Setting up your experience..."
        size="large"
      />
    );
  }

  return (
    <div className="min-h-screen bg-primary">
      <NavBar />
      {error && (
        <div className="bg-red-50 border-b border-red-200 p-3 text-center">
          <p className="text-red-800 font-medium text-sm">⚠️ {error}</p>
        </div>
      )}
      <main className="min-h-screen">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Body;
