import express from "express";
import cors from "cors";
import * as dotenv from "dotenv";
import { connectRedis } from "./config/redis.js";
import userRoutes from "./routes/user.routes.js";
import questionnaireRouter from "./routes/questionnaire.routes.js";
import portfolioRouter from "./routes/portfolio.routes.js";
import stockRoutes from "./routes/stock.routes.js";
import transactionRoutes from "./routes/transaction.routes.js";
import walletRouter from "./routes/wallet.routes.js";


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

//buat stock
app.use('/api/stocks', stockRoutes)

// buat transactoin
app.use('/api/transactions', transactionRoutes)

app.use("/api/wallets", walletRouter);

app.get("/", (req, res) => {
  res.json({ message: "Server Stockation API berjalan dengan baik!" });
});

app.listen(PORT, async () => {
  await connectRedis();
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
