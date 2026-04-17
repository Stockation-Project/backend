import express from "express";
import cors from "cors";
import * as dotenv from "dotenv";
import userRoutes from "./routes/user.routes.js";
import questionnaireRouter from "./routes/questionnaire.routes.js";
import portfolioRouter from "./routes/portfolio.routes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// buat user
app.use('/api/users', userRoutes);

// buat quesionner
app.use('/api/questionnaire', questionnaireRouter)

// buat create portoflio
app.use('/api/portfolios', portfolioRouter)

app.get("/", (req, res) => {
  res.json({ message: "Server Stockation API berjalan dengan baik!" });
});

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
