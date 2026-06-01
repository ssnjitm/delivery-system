import { NextFunction, Request,Response } from "express";
import { fail } from "../utils/ApiResponse.js";


export function notFound(req:Request,res:Response,next:NextFunction){
    res.status(404).json(
        fail(`Route not found ${req.method}`)
    )

}