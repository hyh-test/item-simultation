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
  try {
    const { email, password, username } = req.body;

    // 이메일 중복 체크
    const isExistUser = await prisma.users.findFirst({
      where: {
        email,
      },
    });

    if (isExistUser) {
      return res.status(409).json({ message: "이미 존재하는 이메일입니다." });
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

    return res.status(201).json({ message: "회원가입이 완료되었습니다." });
  } catch (error) {
    // 에러 핸들러로 에러를 전달합니다.
    next(error);
  }
});

/** 로그인 API **/
router.post("/sign-in", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // 사용자 정보 찾기
    const user = await prisma.users.findFirst({ where: { email } });

    if (!user) {
      return res.status(401).json({ message: "존재하지 않는 이메일입니다." });
    }

    // 비밀번호 확인
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: "비밀번호가 일치하지 않습니다." });
    }

    // JWT 생성
    const token = jwt.sign({ userId: user.id }, process.env.JWT_KEY);

    // 쿠키에 JWT 토큰 저장
    res.cookie("authorization", `Bearer ${token}`);

    // 로그인 성공 응답
    return res.status(200).json({ message: "로그인이 완료되었습니다." });
  } catch (error) {
    next(error);
  }
});

/*캐릭터 생성*/
router.post("/characters", authMiddleware, async (req, res, next) => {
  try {
    const { name } = req.body; // 캐릭터 이름

    // 이름이 없으면 오류 반환
    if (!name) {
      return res.status(400).json({ message: "캐릭터 이름을 입력해 주세요." });
    }

    // 로그인한 유저의 id 가져오기
    const { id: userId } = req.user;

    // 캐릭터 이름 중복 확인
    const existingCharacter = await prisma.character.findFirst({
      where: {
        name,     // 입력받은 이름
      },
    });

    if (existingCharacter) {
      return res.status(409).json({ message: "이미 존재하는 캐릭터 이름입니다." });
    }

    // 캐릭터 추가
    const character = await prisma.character.create({
      data: {
        userId,  // 로그인한 유저의 ID
        name,    // 입력받은 이름
        money: 100000,  // 기본 금액 100000
        status: "active", // 캐릭터 상태 기본값 'active'
      },
    });

    return res.status(201).json({ message: "캐릭터가 성공적으로 추가되었습니다.", data: character });
  } catch (error) {
    next(error);
  }
});

// 캐릭터 삭제 API
router.delete("/characters/:characterId", authMiddleware, async (req, res, next) => {
  try {
    const { characterId } = req.params;  // URL 파라미터로 전달된 캐릭터 ID
    const { id: userId } = req.user;    // 로그인한 유저의 ID (authMiddleware에서 제공)

    // 해당 캐릭터가 해당 유저의 것인지 확인
    const character = await prisma.character.findFirst({
      where: {
        id: +characterId,   // 캐릭터 ID가 요청된 캐릭터 ID와 일치하는지
        userId: userId,     // 캐릭터의 유저 ID가 로그인한 유저 ID와 일치하는지
      },
    });

    // 캐릭터가 존재하지 않으면 오류 반환
    if (!character) {
      return res.status(404).json({ message: "캐릭터를 찾을 수 없습니다." });
    }

    // 캐릭터 삭제
    await prisma.character.delete({
      where: {
        id: +characterId,   // 삭제할 캐릭터의 ID
      },
    });

    return res.status(200).json({ message: "캐릭터가 삭제되었습니다." });
  } catch (error) {
    // 에러 핸들링
    next(error);
  }
});


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
        characters: { // 해당 유저의 캐릭터들 조회
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

    // 유저가 존재하지 않으면 404 오류 반환
    if (!user) {
      return res.status(404).json({ message: "유저를 찾을 수 없습니다." });
    }

    // 유저와 그에 해당하는 캐릭터 정보 응답
    return res.status(200).json({ data: user });
  } catch (error) {
    next(error);
  }
});


export default router;
