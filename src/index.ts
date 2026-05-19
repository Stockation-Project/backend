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
import exploreRoutes from "./routes/explore.routes.js";


dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(
  cors({
    origin: [
      "https://stockation-app.vercel.app",
      "https://frontend-cbsx.vercel.app", 
      "http://localhost:5173",
    ],
    credentials: true,
  }),
);
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
app.use("/api/explore", exploreRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Server Stockation API berjalan dengan baik!" });
});

export default app;

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, '0.0.0.0', async () => {
    await connectRedis();
    console.log(
      `Stockation Backend Aktif di Port: ${PORT}`,
    );
  });
}
