import { BrowserRouter, Route, Routes } from "react-router-dom";
import Body from "./components/Body";
import Login from "./components/auth/Login";
import Profile from "./components/Profile";
import appStore from "./utils/appStore";
import { Provider } from "react-redux";
import Feed from "./components/Feed";
import Connections from "./components/Connections";
import Request from "./components/Request";
import Premium from "./components/Premium";
import Verification from "./components/verification";
import Chat from "./components/Chat";

function App() {

  console.log("API URL:", import.meta.env.VITE_BASE_URL);
  
  return (
    <>
      <Provider store={appStore}>
        <BrowserRouter basename="/">
          <Routes>
            <Route path="/" element={<Body />}>
              <Route path="/" element={<Feed></Feed>}></Route>
              <Route path="login" element={<Login />} />
              <Route path="profile" element={<Profile />} />
              <Route path="connections" element={<Connections />} />
              <Route path="requests" element={<Request />} />
              <Route path="premium" element={<Premium />} />
              <Route path="verify/:token" element={<Verification />} />
              <Route path="chat/:toUserId" element={<Chat />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </Provider>
    </>
  );
}

export default App;
