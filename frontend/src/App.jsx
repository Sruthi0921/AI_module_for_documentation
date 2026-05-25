import { Routes, Route } from "react-router-dom";
import AdminDashboard from "./pages/AdminDashboard";
import UserDashboard from "./pages/UserDashboard";
import DocumentViewPage from "./pages/DocumentViewPage";
import DocumentEditPage from "./pages/DocumentEditPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<UserDashboard />} />
      <Route path="/user" element={<UserDashboard />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/documents/view/:id" element={<DocumentViewPage />} />
      <Route path="/documents/edit/:id" element={<DocumentEditPage />} />
    </Routes>
  );
}
