import express from "express";
import { prisma } from "../utils/prisma/index.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import dotenv from "dotenv"; // dotenv 패키지 불러오기

dotenv.config();

const router = express.Router();

/*캐릭터 생성*/
router.post("/", authMiddleware, async (req, res, next) => {
  const { name } = req.body;
  const { id: userId } = req.user;

  try {
    // 트랜잭션을 사용하여 캐릭터 생성
    const result = await prisma.$transaction(async (prisma) => {
      // 캐릭터 이름 중복 체크
      const existingCharacter = await prisma.character.findFirst({
        where: { name },
      });

      if (existingCharacter) {
        const error = new Error("이미 존재하는 캐릭터 이름입니다.");
        error.status = 409; // Conflict
        throw error; // 트랜잭션 롤백
      }

      // 새 캐릭터 생성
      const character = await prisma.character.create({
        data: {
          userId,
          name,
          money: 100000, // 기본 금액 100000
          status: "active",
        },
      });

      return character;
    });

    return res.status(201).json({
      message: "캐릭터가 성공적으로 추가되었습니다.",
      data: result,
    });
  } catch (error) {
    next(error);
  }
});

//캐릭터 삭제
router.delete("/:characterId", authMiddleware, async (req, res, next) => {
  try {
    const { characterId } = req.params;
    const { id: userId } = req.user;

    // 트랜잭션을 사용하여 캐릭터 삭제
    await prisma.$transaction(async (prisma) => {
      // 해당 캐릭터가 해당 유저의 것인지 확인
      const character = await prisma.character.findFirst({
        where: {
          id: +characterId,
          userId: userId,
        },
      });

      if (!character) {
        const error = new Error("캐릭터를 찾을 수 없습니다.");
        error.status = 404; // Not Found
        throw error; // 트랜잭션 롤백
      }

      // 캐릭터 삭제
      await prisma.character.delete({
        where: {
          id: +characterId,
        },
      });
    });

    return res.status(200).json({ message: "캐릭터가 삭제되었습니다." });
  } catch (error) {
    next(error);
  }
});

// 캐릭터 상세 조회 API
router.get("/:characterId", authMiddleware, async (req, res, next) => {
  try {
    const { characterId } = req.params; // URL 파라미터로 전달된 캐릭터 ID
    const { id: userId } = req.user; // 로그인한 유저의 ID (authMiddleware에서 제공)

    // 캐릭터를 찾고, 해당 캐릭터가 로그인한 유저의 것인지 확인
    const character = await prisma.character.findFirst({
      where: {
        id: +characterId, // 캐릭터 ID가 요청된 ID와 일치하는지
      },
    });

    // 캐릭터가 존재하지 않으면 오류 반환
    if (!character) {
      const error = new Error("해당 캐릭터를 찾을 수 없습니다.");
      error.status = 404; // Not Found
      return next(error);
    }

    // 캐릭터가 로그인한 유저의 것인지 확인
    const isOwner = character.userId === userId;

    // 캐릭터 정보 조회
    const characterData = await prisma.character.findFirst({
      where: {
        id: +characterId, // 캐릭터 ID가 요청된 캐릭터 ID와 일치하는지
      },
      select: {
        name: true,
        attack: true, // 공격력
        health: true, // 채력
        defense: true, // 방어력
        ...(isOwner && { money: true }), // 주인인 경우에만 money 필드 포함
      },
    });

    return res.status(200).json({ data: characterData });
  } catch (error) {
    next(error);
  }
});

export default router;
