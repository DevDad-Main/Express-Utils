import { describe, it, expect, vi } from 'vitest';
import { catchAsync } from '../src/catchAsync';

describe('catchAsync', () => {
  it('should wrap async function and handle errors', async () => {
    const mockFn = catchAsync(async (req, res, next) => {
      throw new Error('Test error');
    });

    const mockReq = {} as any;
    const mockRes = {} as any;
    const mockNext = vi.fn() as any;

    await mockFn(mockReq, mockRes, mockNext);
    expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
  });

  it('should execute function normally when no error', async () => {
    const mockFn = catchAsync(async (req, res, next) => {
      res.status(200).json({ success: true });
    });

    const mockReq = {} as any;
    const mockRes = { status: vi.fn().mockReturnThis(), json: vi.fn() } as any;
    const mockNext = vi.fn() as any;

    await mockFn(mockReq, mockRes, mockNext);
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith({ success: true });
    expect(mockNext).not.toHaveBeenCalled();
  });
});