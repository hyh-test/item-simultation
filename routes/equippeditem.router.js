import express from "express";
import { prisma } from "../utils/prisma/index.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import dotenv from "dotenv"; // dotenv 패키지 불러오기

dotenv.config();

const router = express.Router();

//장착된 아이템 조회
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
    const equippedItemData = await prisma.equippedItem.findMany({
      where: {
        characterId: +characterId, // 캐릭터 ID에 맞는 아이템을 찾기
      },
      select: {
        itemId: true, // itemId 정보를 가져옵니다.
        item: {
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

//아이템 장착
router.post("/:characterId", authMiddleware, async (req, res, next) => {
  try {
    const { characterId } = req.params; // URL 파라미터로 전달된 캐릭터 ID
    const { id: userId } = req.user; // 로그인한 유저의 ID (authMiddleware에서 제공)
    const { itemId } = req.body; // 아이템 ID (바디로 전달받음)

    // 캐릭터를 찾고, 해당 캐릭터가 로그인한 유저의 것인지 확인
    const character = await prisma.character.findFirst({
      where: {
        id: +characterId, // 캐릭터 ID가 요청된 ID와 일치하는지
        userId: userId, // 로그인한 유저의 ID와 일치하는지 확인
      },
    });

    // 캐릭터가 존재하지 않으면 오류 반환
    if (!character) {
      const error = new Error("해당 캐릭터를 찾을 수 없습니다.");
      error.status = 404; // Not Found
      return next(error);
    }

    // 인벤토리에서 아이템 존재 여부 확인
    const itemInInventory = await prisma.inventory.findFirst({
      where: {
        characterId: +characterId,
        itemId: +itemId,
      },
    });

    if (!itemInInventory) {
      const error = new Error("이 아이템은 캐릭터의 인벤토리에 없는 아이템 입니다.");
      error.status = 404; // Not Found
      return next(error);
    }

    // 이미 장착되어 있는지 확인
    const alreadyEquipped = await prisma.equippedItem.findFirst({
      where: {
        characterId: +characterId,
        itemId: +itemId,
      },
    });

    if (alreadyEquipped) {
      const error = new Error("이 아이템은 이미 장착되어 있습니다.");
      error.status = 400; // Bad Request
      return next(error);
    }

    // 아이템 정보 가져오기
    const item = await prisma.item.findUnique({
      where: { id: +itemId },
    });

    if (!item) {
      const error = new Error("아이템을 찾을 수 없습니다.");
      error.status = 404; // Not Found
      return next(error);
    }

    // 아이템 능력치 확인 및 캐릭터 능력치 증가
    const { attack, defense, health } = item;

    if (
      typeof attack !== "number" ||
      typeof defense !== "number" ||
      typeof health !== "number"
    ) {
      const error = new Error("아이템 능력치 정보가 잘못되었습니다.");
      error.status = 400; // Bad Request
      return next(error);
    }

    // 캐릭터 능력치 증가
    const updatedCharacter = await prisma.character.update({
      where: { id: +characterId },
      data: {
        attack: { increment: attack },
        defense: { increment: defense },
        health: { increment: health },
      },
    });

    // 아이템 장착 기록 추가
    await prisma.equippedItem.create({
      data: {
        characterId: +characterId,
        itemId: +itemId,
        equippedAt: new Date(),
      },
    });

    // 인벤토리에서 수량 감소
    if (itemInInventory.quantity > 1) {
      // 수량이 1보다 크면, 수량을 1 감소
      await prisma.inventory.update({
        where: {
          id: itemInInventory.id, // 인벤토리 항목의 고유 ID를 사용
        },
        data: {
          quantity: itemInInventory.quantity - 1,
        },
      });
    } else {
      // 수량이 0이면, 인벤토리에서 아이템 삭제
      await prisma.inventory.delete({
        where: {
          id: itemInInventory.id, // 인벤토리 항목의 고유 ID를 사용
        },
      });
    }

    // 응답 반환: 아이템 장착 후 캐릭터의 능력치와 메시지 반환
    res.status(200).json({
      message: `${item.name} 아이템이 장착되었습니다.`,
      character: {
        id: updatedCharacter.id,
        name: updatedCharacter.name,
        attack: updatedCharacter.attack,
        defense: updatedCharacter.defense,
        health: updatedCharacter.health,
      },
    });
  } catch (err) {
    next(err); // 에러 핸들러로 에러 전달
  }
});

export default router;
