import express from "express";
import bcrypt from "bcrypt";
import { prisma } from "../utils/prisma/index.js";
import jwt from "jsonwebtoken";
import authMiddleware from "../middlewares/auth.middleware.js";
import dotenv from "dotenv"; // dotenv 패키지 불러오기

dotenv.config();

const router = express.Router();

//회원가입 api
router.post("/sign-up", async (req, res, next) => {
  const { email, password, username } = req.body;

  try {
    // 트랜잭션을 사용하여 여러 작업을 원자적으로 처리
    const result = await prisma.$transaction(async (prisma) => {
      // 이메일 중복 체크
      const isExistUser = await prisma.users.findFirst({
        where: { email },
      });

      if (isExistUser) {
        const error = new Error("이미 존재하는 이메일입니다.");
        error.status = 409; // Conflict
        throw error; // 트랜잭션을 롤백하려면 예외를 던져야 합니다.
      }

      // 사용자 비밀번호를 암호화합니다.
      const hashedPassword = await bcrypt.hash(password, 10);

      // Users 테이블에 사용자를 추가합니다.
      const user = await prisma.users.create({
        data: {
          email,
          password: hashedPassword, // 암호화된 비밀번호 저장
          username, // 사용자명 추가
          status: "active", // 기본 상태 'active'로 설정 (필요에 따라 수정)
        },
      });

      return user; // 트랜잭션 성공 시 반환할 데이터
    });

    // 성공적인 회원가입 처리
    return res
      .status(201)
      .json({ message: "회원가입이 완료되었습니다.", data: result });
  } catch (error) {
    next(error); // 에러 핸들러로 에러 전달
  }
});

/** 로그인 API **/
router.post("/sign-in", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // 사용자 정보 찾기
    const user = await prisma.users.findFirst({ where: { email } });

    if (!user) {
      const error = new Error("사용자 정보가 일치하지 않습니다.");
      error.status = 401; // Unauthorized
      return next(error);
    }

    // 비밀번호 확인
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      const error = new Error("사용자 정보가 일치하지 않습니다.");
      error.status = 401; // Unauthorized
      return next(error);
    }

    // JWT 생성
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_KEY,
      { expiresIn: "1h" }, // 토큰 만료 시간 1시간 설정
    );

    // 쿠키에 JWT 토큰 저장
    res.cookie("authorization", `Bearer ${token}`, {
      maxAge: 3600000     // 쿠키 만료 시간 (1시간)
    });

    return res.status(200).json({ message: "로그인이 완료되었습니다." });
  } catch (error) {
    next(error);
  }
});

/* 유저 정보 api */
router.get("/users", authMiddleware, async (req, res, next) => {
  const { id } = req.user; // 로그인한 유저의 ID

  try {
    // 유저 정보와 연결된 캐릭터 정보 조회
    const user = await prisma.users.findFirst({
      where: { id: +id }, // 로그인한 유저의 ID로 조회
      select: {
        id: true,
        email: true,
        createdAt: true,
        characters: {
          // 해당 유저의 캐릭터들 조회
          select: {
            id: true,
            name: true,
            money: true,
            status: true,
            createdAt: true,
          },
        },
      },
    });

    if (!user) {
      const error = new Error("유저를 찾을 수 없습니다.");
      error.status = 404; // Not Found
      return next(error);
    }

    return res.status(200).json({ data: user });
  } catch (error) {
    next(error);
  }
});

export default router;
