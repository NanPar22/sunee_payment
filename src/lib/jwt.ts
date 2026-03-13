import jwt, { JwtPayload as DefaultJwtPayload } from "jsonwebtoken";

export interface MenuPermission {
  menuId: number;
  path: string | null;
  permissions: number[]; 
}

export interface JwtPayload {
  id: number;
  roleId: number; // เพิ่มตรงนี้
  role: string;
  username: string;
  spid?: string;
  permissions: MenuPermission[];
}

const JWT_SECRET = process.env.JWT_SECRET!;

export const signToken = (payload: JwtPayload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "1d" });
};

export const verifyToken = (token: string): JwtPayload & DefaultJwtPayload => {
  return jwt.verify(token, JWT_SECRET) as JwtPayload & DefaultJwtPayload;
};
