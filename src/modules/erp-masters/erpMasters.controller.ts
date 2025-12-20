import type { Request, Response } from "express";
import { erpMastersService } from "./erpMasters.service";

export const getERPMasters = async (req: Request, res: Response) => {
    const data = await erpMastersService.getAll(req.user!.userId);
    res.json(data);
};
