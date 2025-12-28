import { describe, it, expect, vi } from "vitest";
import { sendSuccess, sendError } from "../src/responseFormatter";
import { Response } from "express";

describe("responseFormatter", () => {
  describe("sendSuccess", () => {
    it("should prepare success response and return response object for chaining", async () => {
      const mockRes = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
      } as unknown as Response;

      const result = sendSuccess(mockRes, { id: 1 }, "Success", 200);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(result).toBe(mockRes); // Should return the response for chaining
      
      // Wait for setImmediate to trigger
      await new Promise(resolve => setTimeout(resolve, 0));
      
      expect(mockRes.json).toHaveBeenCalledWith({
        status: "success",
        success: true,
        message: "Success",
        data: { id: 1 },
      });
    });

    it("should allow chaining methods and send final response", async () => {
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
      
      // Wait for setImmediate to trigger
      await new Promise(resolve => setTimeout(resolve, 0));
      
      expect(mockRes.json).toHaveBeenCalledWith({
        status: "success",
        success: true,
        message: "Success",
        data: { id: 1 },
      });
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
        success: false,
        message: "Error message",
        data: { details: "extra" },
      });
    });
  });
});