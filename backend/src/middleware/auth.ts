import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: {
    email: string;
    nome: string;
  };
  query: Request['query'];
  body: Request['body'];
  params: Request['params'];
}

export const authenticateToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: 'Token de autenticação não fornecido' });
    return;
  }

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    res.status(500).json({ error: 'Configuração de servidor inválida' });
    return;
  }

  jwt.verify(token, jwtSecret, (err, decoded) => {
    if (err) {
      res.status(403).json({ error: 'Token inválido ou expirado' });
      return;
    }

    const decodedUser = decoded as { email: string; nome?: string; name?: string };
    req.user = {
      email: decodedUser.email,
      nome: decodedUser.nome || decodedUser.name || '',
    };
    next();
  });
};

