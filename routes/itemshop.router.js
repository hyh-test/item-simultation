import express from "express";
import bcrypt from "bcrypt";
import { prisma } from "../utils/prisma/index.js";
import jwt from "jsonwebtoken";
import authMiddleware from "../middlewares/auth.middleware.js";
import dotenv from "dotenv"; // dotenv 패키지 불러오기

dotenv.config();

const router = express.Router();

//아이템 구매 api jwt인증
router.post("/buy/:characterId", authMiddleware, async (req, res, next) => {
  const { itemId, quantity } = req.body; // 구매하려는 아이템 ID와 수량
  const characterId = parseInt(req.params.characterId); // URL 파라미터에서 캐릭터 ID를 받음
  const userId = req.user.id; // 인증된 사용자의 ID (authMiddleware에서 설정됨)

  try {
    // 1. 요청한 캐릭터가 존재하는지 확인
    const character = await prisma.character.findUnique({
      where: {
        id: characterId,
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

    // 3. 아이템 정보 조회
    const item = await prisma.item.findUnique({
      where: { id: + itemId},
    });

    if (!item) {
      const error = new Error("아이템을 찾을 수 없습니다.");
      error.statusCode = 404; // 아이템이 없으면 404 상태 코드
      throw error;
    }

    // 4. 사용자의 보유 금액 확인
    if (character.money < item.price * quantity) {
      const error = new Error("금액이 부족합니다.");
      error.statusCode = 400; // 금액이 부족하면 400 상태 코드
      throw error;
    }

    // 5. 아이템 구매 (아이템을 인벤토리에 추가)
    const updatedInventory = await prisma.inventory.create({
      data: {
        characterId: character.id,
        itemId: item.id,
        quantity: quantity,
      },
    });

    // 6. 캐릭터의 돈 차감
    const updatedCharacter = await prisma.character.update({
      where: { id: character.id },
      data: {
        money: character.money - item.price * quantity,
      },
    });

    return res.status(200).json({
      message: "아이템을 성공적으로 구매했습니다.",
      updatedCharacter,
      updatedInventory,
    });
  } catch (error) {
    next(error); // 에러 핸들러로 전달
  }
});

export default router;
