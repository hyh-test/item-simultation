import express from 'express';
import bcrypt from 'bcrypt';
import { prisma } from '../utils/prisma/index.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config(); 

const router = express.Router();

//회원가입 api
router.post('/sign-up', async (req, res, next) => {
  const { email, password, username } = req.body;

  // 이메일 중복 체크
  const isExistUser = await prisma.users.findFirst({
    where: {
      email,
    },
  });

  if (isExistUser) {
    return res.status(409).json({ message: '이미 존재하는 이메일입니다.' });
  }

  // 사용자 비밀번호를 암호화합니다.
  const hashedPassword = await bcrypt.hash(password, 10);

  // Users 테이블에 사용자를 추가합니다.
  const user = await prisma.users.create({
    data: {
      email,
      password: hashedPassword,  // 암호화된 비밀번호 저장
      username,  // 사용자명 추가
      status: 'active',  // 기본 상태 'active'로 설정 (필요에 따라 수정)
    },
  });

  return res.status(201).json({ message: '회원가입이 완료되었습니다.' });
});

/** 로그인 API **/
router.post('/sign-in', async (req, res, next) => {
    const { email, password } = req.body;
    const user = await prisma.users.findFirst({ where: { email } });
  
    if (!user)
      return res.status(401).json({ message: '존재하지 않는 이메일입니다.' });
    // 입력받은 사용자의 비밀번호와 데이터베이스에 저장된 비밀번호를 비교합니다.
    else if (!(await bcrypt.compare(password, user.password)))
      return res.status(401).json({ message: '비밀번호가 일치하지 않습니다.' });
  
    // 로그인에 성공하면, 사용자의 userId를 바탕으로 토큰을 생성합니다.
    const token = jwt.sign(
      {
        userId: user.userId,
      },
      process.env.JWT_SECRET,
    );
  
    // authotization 쿠키에 Berer 토큰 형식으로 JWT를 저장합니다.
    res.cookie('authorization', `Bearer ${token}`);
    return res.status(200).json({ message: '로그인 성공' });
  });



export default router;
