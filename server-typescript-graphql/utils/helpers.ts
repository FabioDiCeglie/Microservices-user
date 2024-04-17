import { NextFunction, Request, Response } from "express";
import { GraphQLError } from "graphql";
import jwt from "jsonwebtoken";
import { MyContext } from "./types";

export const verifyToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let token = req.header("Authorization");

    if (!token) {
      return res.status(403).send("Access Denied");
    }

    if (token.startsWith("Bearer ")) {
      token = token.slice(7, token.length).trimStart();
    }

    const verified = jwt.verify(token, process.env.JWT_SECRET as string);
    (req as unknown as any).user = verified;

    next();
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
};

export const verifyTokenContext = (contextValue: MyContext) => {
  if (!contextValue.token)
    throw new GraphQLError("User is not authenticated", {
      extensions: {
        code: "UNAUTHENTICATED",
        http: { status: 401 },
      },
    });
};