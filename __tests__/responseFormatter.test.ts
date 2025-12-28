import { describe, it, expect, vi } from "vitest";
import { sendSuccess, sendError, send } from "../src/responseFormatter";
import { Response } from "express";

describe("responseFormatter", () => {
  describe("sendSuccess", () => {
    it("should auto-send success response without chaining", async () => {
      const mockRes = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
      } as unknown as Response;

      sendSuccess(mockRes, { id: 1 }, "Success", 200);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect((mockRes as any)._responseData).toEqual({
        status: "success",
        success: true,
        message: "Success",
        data: { id: 1 },
      });
      
      // Wait for setImmediate to trigger auto-send
      await new Promise(resolve => setTimeout(resolve, 0));
      
      expect(mockRes.json).toHaveBeenCalledWith({
        status: "success",
        success: true,
        message: "Success",
        data: { id: 1 },
      });
    });

    it("should allow method chaining and send manually", async () => {
      const mockRes = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
        cookie: vi.fn().mockReturnThis(),
        header: vi.fn().mockReturnThis(),
      } as unknown as Response;

      sendSuccess(mockRes, { id: 1 }, "Success", 200)
        .cookie("session", "abc123")
        .header("X-Custom", "value");

      // Send manually when ready
      send(mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.cookie).toHaveBeenCalledWith("session", "abc123");
      expect(mockRes.header).toHaveBeenCalledWith("X-Custom", "value");
      expect(mockRes.json).toHaveBeenCalledWith({
        status: "success",
        success: true,
        message: "Success",
        data: { id: 1 },
      });
    });

    it("should send response when send() is called", () => {
      const mockRes = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
      } as unknown as Response;

      sendSuccess(mockRes, { data: "test" }, "Success");
      send(mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: "success",
        success: true,
        message: "Success",
        data: { data: "test" },
      });
    });

    it("should use default values and auto-send", async () => {
      const mockRes = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
      } as unknown as Response;

      sendSuccess(mockRes, { data: "test" });

      // Wait for auto-send
      await new Promise(resolve => setTimeout(resolve, 0));

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: "success",
        success: true,
        message: "Success",
        data: { data: "test" },
      });
    });
  });

  describe("sendError", () => {
    it("should send error response immediately", () => {
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

    it("should send error without data", () => {
      const mockRes = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
      } as unknown as Response;

      sendError(mockRes, "Simple error");

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: "error",
        success: false,
        message: "Simple error",
      });
    });

    it("should use default status code", () => {
      const mockRes = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
      } as unknown as Response;

      sendError(mockRes, "Default error");

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: "error",
        success: false,
        message: "Default error",
      });
    });
  });

  describe("send", () => {
    it("should send the prepared response", () => {
      const mockRes = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
      } as unknown as Response;

      // Manually set response data to test send function
      (mockRes as any)._responseData = { test: "data" };
      
      send(mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({ test: "data" });
    });
  });
});