// src/middleware/__tests__/auth.middleware.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { requireAuth } from "../auth.middleware.js";
import supabase from "../../config/supabase.js";

// Mocking Supabase
vi.mock("../../config/supabase.js", () => ({
  default: {
    auth: {
      getUser: vi.fn()
    }
  }
}));

describe("Auth Middleware", () => {
  let mockRequest: any;
  let mockResponse: any;
  let nextFunction: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockRequest = {
      headers: {}
    };
    mockResponse = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis()
    };
    nextFunction = vi.fn();
  });

  it("should call next() if a valid Bearer token is provided", async () => {
    // 1. Setup Request
    mockRequest.headers.authorization = "Bearer valid-token";
    
    // 2. Mock Supabase success
    (supabase.auth.getUser as any).mockResolvedValue({
      data: { user: { id: "user-123", email: "test@gmail.com" } },
      error: null
    });

    // 3. Execute
    await requireAuth(mockRequest, mockResponse, nextFunction);

    // 4. Verify
    expect(nextFunction).toHaveBeenCalled();
    expect(mockRequest.user).toBeDefined();
    expect(mockRequest.user.id).toBe("user-123");
    expect(mockResponse.status).not.toHaveBeenCalled();
  });

  it("should return 401 if authorization header is missing", async () => {
    // 1. Execute with empty headers
    await requireAuth(mockRequest, mockResponse, nextFunction);

    // 2. Verify
    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.stringContaining("Tiket tidak ditemukan") })
    );
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it("should return 401 if token format is invalid", async () => {
    // 1. Setup Invalid Header
    mockRequest.headers.authorization = "invalid-format-token";

    // 2. Execute
    await requireAuth(mockRequest, mockResponse, nextFunction);

    // 3. Verify
    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it("should return 401 if token is rejected by Supabase", async () => {
    // 1. Setup Request
    mockRequest.headers.authorization = "Bearer expired-token";
    
    // 2. Mock Supabase error
    (supabase.auth.getUser as any).mockResolvedValue({
      data: { user: null },
      error: { message: "Invalid token" }
    });

    // 3. Execute
    await requireAuth(mockRequest, mockResponse, nextFunction);

    // 4. Verify
    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.stringContaining("Tiket tidak valid") })
    );
    expect(nextFunction).not.toHaveBeenCalled();
  });
});
