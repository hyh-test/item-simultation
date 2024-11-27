import express from "express";
import { prisma } from "../utils/prisma/index.js";
import dotenv from "dotenv"; // dotenv 패키지 불러오기

dotenv.config();

const router = express.Router();

//아이템 생성
router.post("/create", async (req, res, next) => {
  const { name, price, rarity, attack, defense, health, type, description } =
    req.body;

  try {
    // 트랜잭션을 사용하여 여러 작업을 원자적으로 처리
    const result = await prisma.$transaction(async (prisma) => {
      // 아이템 이름 중복 체크
      const isExistItem = await prisma.item.findFirst({
        where: { name },
      });

      if (isExistItem) {
        const error = new Error("이미 존재하는 아이템 이름입니다.");
        error.status = 409; // Conflict
        throw error; // 트랜잭션을 롤백하려면 예외를 던져야 합니다.
      }

      // 아이템 생성
      const item = await prisma.item.create({
        data: {
          name, // 아이템 이름
          price, // 아이템 가격
          rarity, // 아이템 레어도
          attack, // 아이템 공격력
          defense, // 아이템 방어력
          health, // 아이템 체력
          type, // 아이템 타입
          description, // 아이템 설명
        },
      });

      return item;
    });

    return res
      .status(201)
      .json({ message: "아이템이 생성되었습니다.", data: result });
  } catch (error) {
    next(error); // 에러 핸들러로 에러 전달
  }
});

/*아이템 수정*/
router.patch("/:itemId", async (req, res, next) => {
  const { itemId } = req.params;
  const { name, description, rarity, attack, defense, health } = req.body;

  try {
    // 트랜잭션을 사용하여 아이템 수정
    const result = await prisma.$transaction(async (prisma) => {
      const itemToUpdate = await prisma.item.findUnique({
        where: { id: +itemId },
      });

      if (!itemToUpdate) {
        throw new Error("아이템을 찾을 수 없습니다.");
      }

      // 가격 수정은 불가하므로 가격을 요청 본문에서 제외
      if (req.body.price) {
        throw new Error("가격은 수정할 수 없습니다.");
      }

      // 아이템 업데이트
      const updatedItem = await prisma.item.update({
        where: { id: +itemId },
        data: {
          name: name || itemToUpdate.name,
          description: description || itemToUpdate.description,
          rarity: rarity || itemToUpdate.rarity,
          attack: attack ?? itemToUpdate.attack,
          defense: defense ?? itemToUpdate.defense,
          health: health ?? itemToUpdate.health,
        },
      });

      return updatedItem;
    });

    return res
      .status(200)
      .json({ message: "아이템이 성공적으로 수정되었습니다.", data: result });
  } catch (error) {
    next(error); // 에러 핸들러로 에러 전달
  }
});

/*아이템 조회*/
router.get("/items", async (req, res, next) => {
  try {
    // 모든 아이템을 조회합니다.
    const items = await prisma.item.findMany({
      select: {
        id: true,
        name: true,
        price: true,
      },
    });

    // 아이템 목록이 비었을 경우
    if (items.length === 0) {
      return res.status(404).json({ message: "아이템이 없습니다." });
    }

    // 아이템 목록 응답
    return res.status(200).json({ data: items });
  } catch (error) {
    next(error); // 에러 핸들러로 에러 전달
  }
});

/*아이템 상세 조회*/
router.get("/:itemId", async (req, res, next) => {
  try {
    const { itemId } = req.params;

    // 해당 아이템을 조회합니다.
    const item = await prisma.item.findUnique({
      where: {
        id: +itemId, // itemId를 정수로 변환하여 아이템 조회
      },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
      },
    });

    // 아이템이 존재하지 않는 경우
    if (!item) {
      return res
        .status(404)
        .json({ message: "해당 아이템을 찾을 수 없습니다." });
    }

    // 아이템 상세 정보 응답
    return res.status(200).json({ data: item });
  } catch (error) {
    next(error); // 에러 핸들러로 에러 전달
  }
});

export default router;
