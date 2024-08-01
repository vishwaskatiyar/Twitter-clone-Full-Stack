import { Routes, Route } from "react-router-dom";
import HomePage from "./Pages/auth/home/HomePage";
import SignUpPage from "./Pages/auth/signup/SignUpPage";
import LoginPage from "./Pages/auth/login/LoginPage";
import Sidebar from "./components/common/Sidebar";
import RightPanel from "./components/common/RightPanel";
import NotificationPage from "./Pages/auth/notification/NotificationPage";
import ProfilePage from "./Pages/profile/ProfilePage";
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <div className="flex max-w-6xl mx-auto">
      <Sidebar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/notifications" element={<NotificationPage />} />
        <Route path="/profile/:username" element={<ProfilePage />} />
      </Routes>
      <RightPanel />
      <Toaster />
    </div>
  );
}

export default App;
