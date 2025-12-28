import { describe, it, expect, vi } from "vitest";
import { sendSuccess, sendError } from "../src/responseFormatter";
import { Response } from "express";

describe("responseFormatter", () => {
  describe("sendSuccess", () => {
    it("should send success response without callbacks", () => {
      const mockRes = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
      } as unknown as Response;

      sendSuccess(mockRes, { id: 1 }, "Success", 200);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: "success",
        success: true,
        message: "Success",
        data: { id: 1 },
      });
    });

    it("should execute callbacks for chaining", () => {
      const mockRes = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
        cookie: vi.fn().mockReturnThis(),
        header: vi.fn().mockReturnThis(),
      } as unknown as Response;

      sendSuccess(mockRes, { id: 1 }, "Success", 200, [
        (res) => res.cookie("session", "abc123"),
        (res) => res.header("X-Custom", "value")
      ]);

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

    it("should handle empty callbacks array", () => {
      const mockRes = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
      } as unknown as Response;

      sendSuccess(mockRes, { id: 1 }, "Success", 200, []);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: "success",
        success: true,
        message: "Success",
        data: { id: 1 },
      });
    });

    it("should use default values", () => {
      const mockRes = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
      } as unknown as Response;

      sendSuccess(mockRes, { data: "test" });

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: "success",
        success: true,
        message: "Success",
        data: { data: "test" },
      });
    });

    it("should handle multiple callbacks correctly", () => {
      const mockRes = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
        cookie: vi.fn().mockReturnThis(),
        header: vi.fn().mockReturnThis(),
        set: vi.fn().mockReturnThis(),
      } as unknown as Response;

      sendSuccess(mockRes, { token: "abc123" }, "Login successful", 200, [
        (res) => res.cookie("authToken", "xyz789", { httpOnly: true }),
        (res) => res.header("X-Custom", "value"),
        (res) => res.set("Another-Header", "test")
      ]);

      expect(mockRes.cookie).toHaveBeenCalledWith("authToken", "xyz789", { httpOnly: true });
      expect(mockRes.header).toHaveBeenCalledWith("X-Custom", "value");
      expect(mockRes.set).toHaveBeenCalledWith("Another-Header", "test");
      expect(mockRes.json).toHaveBeenCalledWith({
        status: "success",
        success: true,
        message: "Login successful",
        data: { token: "abc123" },
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
});