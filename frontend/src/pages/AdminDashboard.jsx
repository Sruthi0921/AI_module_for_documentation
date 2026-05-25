import { useState } from "react";
import UploadBox from "../components/UploadBox";
import DocumentTable from "../components/DocumentTable";
import ChatBot from "../components/ChatBot";

export default function AdminDashboard() {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <div style={{ flex: 3, padding: "0px", overflowY: "scroll" }}>
        <h2>Admin – Document Control</h2>

        <UploadBox onUploadSuccess={() => setRefreshKey(prev => prev + 1)} />

       <DocumentTable refresh={refreshKey} isAdmin />
      </div>

      <div style={{ flex: 1, borderLeft: "1px solid #ddd", height: "99%" }}>
        <ChatBot />
      </div>
    </div>
  );
}


const layout = {
  container: { display: "flex", height: "10vh" },
  main: { flex: 1, padding: 0 }
};
