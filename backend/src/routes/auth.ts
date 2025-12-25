import express, { Request, Response } from 'express';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import User from '../models/User';

const router = express.Router();

const getOAuthClient = () => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  
  if (!clientId || !clientSecret) {
    throw new Error('GOOGLE_CLIENT_ID ou GOOGLE_CLIENT_SECRET não configurados');
  }
  
  return new OAuth2Client(clientId, clientSecret);
};

router.post('/google', async (req: Request, res: Response) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      res.status(400).json({ error: 'Token Google não fornecido' });
      return;
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) {
      res.status(500).json({ error: 'GOOGLE_CLIENT_ID não configurado no servidor' });
      return;
    }

    const client = getOAuthClient();
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: clientId,
    });

    const payload = ticket.getPayload();
    if (!payload) {
      res.status(401).json({ error: 'Token Google inválido' });
      return;
    }

    const { email, name, picture } = payload;

    if (!email || !name) {
      res.status(400).json({ error: 'Dados do usuário incompletos' });
      return;
    }

    // Criar ou atualizar usuário
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({ email, nome: name, foto_perfil: picture });
    } else {
      user.nome = name;
      if (picture) user.foto_perfil = picture;
      await user.save();
    }

    // Gerar JWT
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      res.status(500).json({ error: 'Configuração de servidor inválida' });
      return;
    }

    const token = jwt.sign(
      { email: user.email, nome: user.nome },
      jwtSecret,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        email: user.email,
        name: user.nome,
        picture: user.foto_perfil,
      },
    });
  } catch (error: any) {
    console.error('Erro na autenticação:', error);
    console.error('Erro detalhado:', error.message);
    console.error('Stack:', error.stack);
    res.status(500).json({ 
      error: 'Erro ao autenticar usuário',
      details: error.message 
    });
  }
});

router.post('/verify', async (req: Request, res: Response) => {
  try {
    const { token } = req.body;

    if (!token) {
      res.status(400).json({ error: 'Token não fornecido' });
      return;
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      res.status(500).json({ error: 'Configuração de servidor inválida' });
      return;
    }

    const decoded = jwt.verify(token, jwtSecret) as { email: string; nome: string };
    const user = await User.findOne({ email: decoded.email });

    if (!user) {
      res.status(404).json({ error: 'Usuário não encontrado' });
      return;
    }

    res.json({
      user: {
        email: user.email,
        name: user.nome,
        picture: user.foto_perfil,
      },
    });
  } catch (error) {
    res.status(401).json({ error: 'Token inválido ou expirado' });
  }
});

export default router;

