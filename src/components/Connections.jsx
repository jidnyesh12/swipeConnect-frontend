import axios from "axios";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { BASE_URL } from "../utils/constant";
import { addConnections } from "../utils/connectionsSlice";
import { Link } from "react-router-dom";

const Connections = () => {
  const connections = useSelector((store) => store.connections);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
      setError("");
    } catch (err) {
      setError("Failed to load connections");
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConnections();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white border-4 border-black p-8 shadow-[6px_6px_0px_0px_#000] text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-black border-t-transparent mx-auto mb-4"></div>
          <h2 className="text-xl font-black text-black uppercase tracking-tight">
            LOADING CONNECTIONS...
          </h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white border-4 border-black p-6 shadow-[6px_6px_0px_0px_#000] max-w-sm w-full text-center">
          <h1 className="text-2xl font-black text-red-600 uppercase tracking-tight mb-3">
            ERROR!
          </h1>
          <p className="text-sm font-bold text-gray-700 uppercase mb-4">
            {error}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-orange-400 border-3 border-black px-4 py-2 font-black text-sm uppercase tracking-wide shadow-[3px_3px_0px_0px_#000] hover:bg-orange-500 hover:translate-x-1 hover:translate-y-1 hover:shadow-[2px_2px_0px_0px_#000] transition-all duration-150"
          >
            RETRY
          </button>
        </div>
      </div>
    );
  }

  if (!connections) return;
  if (connections.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white border-4 border-black p-6 shadow-[6px_6px_0px_0px_#000] max-w-sm w-full text-center">
          <h1 className="text-2xl font-black text-black uppercase tracking-tight mb-3">
            NO CONNECTIONS!
          </h1>
          <p className="text-sm font-bold text-gray-700 uppercase">
            START CONNECTING
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-100 via-pink-50 to-red-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white border-4 border-black p-4 mb-6 text-center shadow-[4px_4px_0px_0px_#000]">
          <h1 className="text-2xl font-black text-black uppercase tracking-tight">
            YOUR CONNECTIONS
          </h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {connections.map(
            (
              {
                _id,
                firstName,
                lastName,
                about,
                photourl,
                skills,
                age,
                gender,
              },
              index
            ) => (
              <div
                key={index}
                className="bg-white border-3 border-black shadow-[4px_4px_0px_0px_#000] transform hover:translate-x-1 hover:translate-y-1 hover:shadow-[3px_3px_0px_0px_#000] transition-all duration-200"
              >
                <div className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-16 h-16 border-3 border-black overflow-hidden">
                      <img
                        src={photourl}
                        alt={`${firstName} ${lastName}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-lg font-black text-black uppercase tracking-tight mb-1">
                        {firstName} {lastName}
                      </h2>
                      <div className="bg-yellow-400 border-2 border-black px-2 py-1 inline-block font-bold text-xs uppercase text-black">
                        {age} YRS, {gender}
                      </div>
                    </div>
                  </div>
                  {about && (
                    <div className="bg-cyan-200 border-3 border-black p-2 mb-3 font-bold text-xs text-black">
                      {about}
                    </div>
                  )}
                  {skills && skills.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {skills.map((skill, i) => (
                        <div
                          key={i}
                          className="bg-pink-300 border-2 border-black px-2 py-1 font-bold text-xs uppercase tracking-wide text-black"
                        >
                          {skill}
                        </div>
                      ))}
                    </div>
                  )}
                  {!isPremium ? (
                    <h1 className="text-black">Buy Subscription</h1>
                  ) : (
                    <Link to={`/chat/${_id}`}>
                      {" "}
                      <button className="w-full bg-green-400 border-3 border-black px-4 py-2 font-black uppercase text-black shadow-[3px_3px_0px_0px_#000] hover:translate-x-1 hover:translate-y-1 hover:shadow-[1px_1px_0px_0px_#000] transition-all duration-200">
                        💬 Chat
                      </button>{" "}
                    </Link>
                  )}
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default Connections;