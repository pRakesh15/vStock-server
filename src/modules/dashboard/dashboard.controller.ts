import type { Request, Response } from "express";
import { dashboardService } from "./dashboard.service";

export const getDashboardSummary = async (
    req: Request,
    res: Response
) => {
    const data = await dashboardService.getSummary(req.user!.userId);
    res.json(data);
};
