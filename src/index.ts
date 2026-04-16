import express from "express";
import cors from "cors";
import * as dotenv from "dotenv";
import userRoutes from "./routes/user.routes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// buat user
app.use('/api/users', userRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Server Stockation API berjalan dengan baik!" });
});

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
