import UploadBox from "../components/UploadBox";
import ChatBot from "../components/ChatBot";

export default function UserDashboard() {
  return (
    <div style={styles.container}>
      {/* LEFT */}
      <div style={styles.main}>
        <h1 style={styles.title}>AI Document Reader</h1>

          <UploadBox />
      </div>

      {/* RIGHT */}
      <ChatBot />
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    height: "96vh",
    background: "#f8fafc"
  },
  main: {
    flex: 3,
    padding: "0px"
  },
  title: {
    marginBottom: "20px"
  },
  card: {
    background: "#fff",
    padding: "25px",
    borderRadius: "10px",
    border: "1px solid #e5e7eb"
  }
};
