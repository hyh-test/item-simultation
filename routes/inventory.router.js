import express from "express";
import { prisma } from "../utils/prisma/index.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import dotenv from "dotenv"; // dotenv 패키지 불러오기

dotenv.config();

const router = express.Router();

//인벤토리 조회
router.get("/:characterId", authMiddleware, async (req, res, next) => {
  const { characterId } = req.params; // URL 파라미터로 전달된 캐릭터 ID
    const { id: userId } = req.user; // 로그인한 유저의 ID (authMiddleware에서 제공)
    try {
      // 1. 요청한 캐릭터가 존재하는지 확인
      const character = await prisma.character.findUnique({
        where: {
          id: +characterId,
        },
      });
  
      // 캐릭터가 존재하지 않으면
      if (!character) {
        const error = new Error("캐릭터가 없습니다.");
        error.statusCode = 404; // 캐릭터가 없으면 404 상태 코드
        throw error;
      }
  
      // 2. 캐릭터가 현재 로그인된 사용자의 캐릭터인지 확인
      if (character.userId !== userId) {
        const error = new Error("이 캐릭터는 사용자의 것이 아닙니다.");
        error.statusCode = 403; // 사용자의 것이 아니면 403 상태 코드
        throw error;
      }
  

    // 캐릭터의 인벤토리 조회
    const inventoryData = await prisma.inventory.findMany({
      where: {
        characterId: +characterId, // 캐릭터의 ID와 일치하는 인벤토리 데이터 조회
      },
      select: {
        item: {
          select: {
            id: true,
            name: true,
          },
        },
        quantity: true, //아이템 수량
      },
    });

    return res.status(200).json({ data: inventoryData });
  } catch (error) {
    next(error);
  }
});

export default router;
