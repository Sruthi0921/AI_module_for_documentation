const express = require("express");
const cors = require("cors");

const documentRoutes = require("./routes/documentRoutes");
const chatRoutes = require("./routes/chatRoutes");
const adminTrainRoutes = require("./routes/adminTrainRoutes");
const adminAnalyticsRoutes = require("./routes/adminAnalyticsRoutes");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/uploads", express.static("uploads"));

app.use("/api/documents", documentRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/admin", adminTrainRoutes);
app.use("/api/admin", adminAnalyticsRoutes);

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
