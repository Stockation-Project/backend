export const swaggerDocument = {
  openapi: "3.0.0",
  info: {
    title: "Stockation Backend API",
    description: "API Gateway untuk aplikasi simulasi investasi saham tergamifikasi",
    version: "1.0.0",
  },
  servers: [
    {
      url: "http://localhost:3000/api",
      description: "Development server",
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
  paths: {
    "/users/register": {
      post: {
        summary: "Register akun baru",
        tags: ["Users"],
        security: [],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  first_name: { type: "string" },
                  last_name: { type: "string" },
                  email: { type: "string" },
                  password: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          "201": { description: "Created" },
        },
      },
    },
    "/users/login": {
      post: {
        summary: "Login",
        tags: ["Users"],
        security: [],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  email: { type: "string" },
                  password: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          "200": { description: "Success" },
        },
      },
    },
    "/users/google-sync": {
      post: {
        summary: "Sinkronisasi akun via Google",
        tags: ["Users"],
        security: [],
        responses: {
          "200": { description: "Success" },
        },
      },
    },
    "/users/profile": {
      get: {
        summary: "Dapatkan profil user",
        tags: ["Users"],
        responses: {
          "200": { description: "Success" },
        },
      },
      put: {
        summary: "Update profil user",
        tags: ["Users"],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  first_name: { type: "string" },
                  last_name: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          "200": { description: "Success" },
        },
      },
    },
    "/users/profile/avatar": {
      post: {
        summary: "Upload Avatar",
        tags: ["Users"],
        responses: {
          "200": { description: "Success" },
        },
      },
    },
    "/users/dashboard": {
      get: {
        summary: "Dapatkan ringkasan dashboard user",
        tags: ["Users"],
        responses: {
          "200": { description: "Success" },
        },
      },
    },
    "/wallets/": {
      get: {
        summary: "Get Wallet (Dompet Global)",
        tags: ["Wallets"],
        responses: {
          "200": { description: "Success" },
        },
      },
    },
    "/wallets/topup": {
      post: {
        summary: "Top up saldo wallet",
        tags: ["Wallets"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  amount: { type: "number" },
                },
              },
            },
          },
        },
        responses: {
          "200": { description: "Success" },
        },
      },
    },
    "/wallets/allocate": {
      post: {
        summary: "Alokasikan saldo ke portofolio tertentu",
        tags: ["Wallets"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  portfolio_id: { type: "string" },
                  amount: { type: "number" },
                },
              },
            },
          },
        },
        responses: {
          "200": { description: "Success" },
        },
      },
    },
    "/wallets/withdraw": {
      post: {
        summary: "Tarik saldo dari portofolio ke wallet utama",
        tags: ["Wallets"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  portfolio_id: { type: "string" },
                  amount: { type: "number" },
                },
              },
            },
          },
        },
        responses: {
          "200": { description: "Success" },
        },
      },
    },
    "/wallets/history": {
      get: {
        summary: "Riwayat mutasi wallet (Activity)",
        tags: ["Wallets"],
        responses: {
          "200": { description: "Success" },
        },
      },
    },
    "/portfolios/": {
      get: {
        summary: "Daftar portofolio milik user",
        tags: ["Portfolios"],
        responses: {
          "200": { description: "Success" },
        },
      },
      post: {
        summary: "Buat portofolio baru",
        tags: ["Portfolios"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  initial_cash: { type: "number" },
                },
              },
            },
          },
        },
        responses: {
          "201": { description: "Created" },
        },
      },
    },
    "/portfolios/{id}": {
      get: {
        summary: "Detail portofolio dan holdings (saham yang dimiliki)",
        tags: ["Portfolios"],
        parameters: [
          {
            in: "path",
            name: "id",
            schema: { type: "string" },
            required: true,
            description: "ID Portofolio",
          },
        ],
        responses: {
          "200": { description: "Success" },
        },
      },
    },
    "/portfolios/optimize": {
      post: {
        summary: "Optimasi portofolio via AI",
        tags: ["Portfolios"],
        responses: {
          "200": { description: "Success" },
        },
      },
    },
    "/transactions/buy": {
      post: {
        summary: "Simulasi pembelian saham",
        tags: ["Transactions"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  portfolio_id: { type: "string" },
                  ticker: { type: "string" },
                  shares: { type: "number" },
                },
              },
            },
          },
        },
        responses: {
          "200": { description: "Success" },
        },
      },
    },
    "/transactions/sell": {
      post: {
        summary: "Simulasi penjualan saham",
        tags: ["Transactions"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  portfolio_id: { type: "string" },
                  ticker: { type: "string" },
                  shares: { type: "number" },
                },
              },
            },
          },
        },
        responses: {
          "200": { description: "Success" },
        },
      },
    },
    "/transactions/portfolio/{portfolioId}/stock/{ticker}": {
      get: {
        summary: "Riwayat transaksi suatu saham di portofolio tertentu",
        tags: ["Transactions"],
        parameters: [
          {
            in: "path",
            name: "portfolioId",
            schema: { type: "string" },
            required: true,
          },
          {
            in: "path",
            name: "ticker",
            schema: { type: "string" },
            required: true,
          },
        ],
        responses: {
          "200": { description: "Success" },
        },
      },
    },
    "/stocks/": {
      get: {
        summary: "Daftar semua saham (IDX80)",
        tags: ["Stocks"],
        responses: {
          "200": { description: "Success" },
        },
      },
    },
    "/stocks/explore": {
      get: {
        summary: "Explore Saham (Gainers/Losers/All)",
        tags: ["Stocks"],
        responses: {
          "200": { description: "Success" },
        },
      },
    },
    "/stocks/recommendations": {
      get: {
        summary: "Rekomendasi saham berdasarkan Profil Risiko User",
        tags: ["Stocks"],
        responses: {
          "200": { description: "Success" },
        },
      },
    },
    "/stocks/detail/{ticker}": {
      get: {
        summary: "Detail informasi suatu saham (Fundamental & Chart)",
        tags: ["Stocks"],
        parameters: [
          {
            in: "path",
            name: "ticker",
            schema: { type: "string" },
            required: true,
          },
        ],
        responses: {
          "200": { description: "Success" },
        },
      },
    },
    "/stocks/sync-metadata": {
      post: {
        summary: "Sync metadata saham secara manual (Admin/Internal)",
        tags: ["Stocks"],
        responses: {
          "200": { description: "Success" },
        },
      },
    },
    "/stocks/seed-idx80": {
      post: {
        summary: "Seed database dengan list IDX80 (Admin/Internal)",
        tags: ["Stocks"],
        responses: {
          "200": { description: "Success" },
        },
      },
    },
    "/stocks/sync-clustering": {
      post: {
        summary: "Sync clustering dari ML ke database (Admin/Internal)",
        tags: ["Stocks"],
        responses: {
          "200": { description: "Success" },
        },
      },
    },
    "/explore/market-movers": {
      get: {
        summary: "Saham-saham market movers",
        tags: ["Explore"],
        responses: {
          "200": { description: "Success" },
        },
      },
    },
    "/explore/watchlist": {
      get: {
        summary: "Lihat daftar watchlist saham user",
        tags: ["Explore"],
        responses: {
          "200": { description: "Success" },
        },
      },
    },
    "/explore/watchlist/toggle": {
      post: {
        summary: "Tambahkan atau hapus saham dari watchlist",
        tags: ["Explore"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  ticker: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          "200": { description: "Success" },
        },
      },
    },
    "/ai/explanation": {
      get: {
        summary: "Dapatkan penjelasan istilah investasi dengan LLM",
        tags: ["AI"],
        parameters: [
          {
            in: "query",
            name: "term",
            schema: { type: "string" },
            required: true,
          },
          {
            in: "query",
            name: "context",
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": { description: "Success" },
        },
      },
    },
    "/questionnaire/submit": {
      post: {
        summary: "Submit kuesioner profil risiko investasi",
        tags: ["Questionnaire"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  answers: {
                    type: "array",
                    items: { type: "string" },
                  },
                },
              },
            },
          },
        },
        responses: {
          "200": { description: "Success" },
        },
      },
    },
  },
};
