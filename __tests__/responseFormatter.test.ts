import { describe, it, expect, vi } from "vitest";
import { sendSuccess, sendError } from "../src/responseFormatter";
import { Response } from "express";

describe("responseFormatter", () => {
  describe("sendSuccess", () => {
    it("should send success response and return response object for chaining", () => {
      const mockRes = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
      } as unknown as Response;

      const result = sendSuccess(mockRes, { id: 1 }, "Success", 200);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: "success",
        message: "Success",
        data: { id: 1 },
      });
      expect(result).toBe(mockRes); // Should return the response for chaining
    });

    it("should allow chaining methods", () => {
      const mockRes = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
        cookie: vi.fn().mockReturnThis(),
        setHeader: vi.fn().mockReturnThis(),
      } as unknown as Response;

      const result = sendSuccess(mockRes, { id: 1 })
        .cookie("session", "abc123")
        .setHeader("X-Custom", "value");

      expect(result).toBe(mockRes);
      expect(mockRes.cookie).toHaveBeenCalledWith("session", "abc123");
      expect(mockRes.setHeader).toHaveBeenCalledWith("X-Custom", "value");
    });
  });

  describe("sendError", () => {
    it("should send error response", () => {
      const mockRes = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
      } as unknown as Response;

      sendError(mockRes, "Error message", 400, { details: "extra" });

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: "error",
        message: "Error message",
        data: { details: "extra" },
      });
    });
  });
});