import express from "express";
import { prisma } from "../utils/prisma/index.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import dotenv from "dotenv"; // dotenv 패키지 불러오기

dotenv.config();

const router = express.Router();

router.get("/:characterId", async (req, res, next) => {
  try {
    const { characterId } = req.params; // URL 파라미터로 전달된 캐릭터 ID

    // 먼저 character 테이블에서 해당 characterId가 존재하는지 확인
    const character = await prisma.character.findUnique({
      where: {
        id: +characterId, // characterId가 실제로 존재하는지 확인
      },
    });

    // character 테이블에 해당 characterId가 없으면 404 오류 반환
    if (!character) {
      const error = new Error("해당 캐릭터를 찾을 수 없습니다.");
      error.status = 404; // Not Found
      return next(error);
    }

    // characterId가 존재하면 equippedItem 테이블에서 아이템 정보 조회
    const equippedItemData = await prisma.equippedItem.findFirst({
      where: {
        characterId: +characterId, // 캐릭터 ID에 맞는 아이템을 찾기
      },
      select: {
        itemId: true, // itemId 정보를 가져옵니다.
        item : {
          select: {
            name: true,
          },
        },
      },
    });

    // 아이템 정보가 없으면 null 반환, 아니면 데이터 반환
    return res.status(200).json({ data: equippedItemData });
  } catch (error) {
    next(error); // 에러가 발생한 경우 에러 핸들러로 전달
  }
});

export default router;
