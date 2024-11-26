import express from "express";
import bcrypt from "bcrypt";
import { prisma } from "../utils/prisma/index.js";
import jwt from "jsonwebtoken";
import authMiddleware from "../middlewares/auth.middleware.js";
import dotenv from "dotenv"; // dotenv 패키지 불러오기

dotenv.config();

const router = express.Router();

//아이템 생성 api
router.post("/create", async (req, res, next) => {
  try {
    const { name, price, rarity, stats, type, description } = req.body;

    const isExistItem = await prisma.item.findFirst({
      where: {
        name,
      },
    });

    if (isExistItem) {
      const error = new Error("이미 존재하는 아이템 이름입니다.");
      error.status = 409; // Conflict
      return next(error);
    }
    const item = await prisma.item.create({
      data: {
        name, //아이템 이름
        price, //아이템 가격
        rarity, //레어도
        stats, //아이템 스텟 JSON으로 작성
        type, //어느 부위
        description, //아이템 설명
      },
    });

    return res.status(201).json({ message: "아이템이 생성되었습니다." });
  } catch (error) {
    next(error);
  }
});

router.patch("/:itemId", async (req, res, next) => {
  const { itemId } = req.params;
  const { name, description, price, rarity, stats } = req.body;

  try {
    // 아이템을 찾아서 업데이트할 필드를 준비합니다.
    const itemToUpdate = await prisma.item.findUnique({
      where: {
        id: +itemId, // 전달받은 itemId로 아이템 조회
      },
    });

    if (!itemToUpdate) {
      return res.status(404).json({ message: "아이템을 찾을 수 없습니다." });
    }

    // 아이템의 업데이트 내용 생성
    const updatedItem = await prisma.item.update({
      where: { id: +itemId }, // 아이템 ID로 찾음
      data: {
        name: name || itemToUpdate.name, // 새로운 이름이 없으면 기존 이름 사용
        description: description || itemToUpdate.description, // 새로운 설명이 없으면 기존 설명 사용
        price: price || itemToUpdate.price, // 새로운 가격이 없으면 기존 가격 사용
        rarity: rarity || itemToUpdate.rarity, // 새로운 희귀도가 없으면 기존 희귀도 사용
        stats: stats || itemToUpdate.stats, // 새로운 능력치가 없으면 기존 능력치 사용
      },
    });

    return res
      .status(200)
      .json({ message: "아이템이 성공적으로 수정되었습니다." });
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
          id: +itemId,  // itemId를 정수로 변환하여 아이템 조회
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
        return res.status(404).json({ message: "해당 아이템을 찾을 수 없습니다." });
      }
  
      // 아이템 상세 정보 응답
      return res.status(200).json({ data: item });
  
    } catch (error) {
      next(error); // 에러 핸들러로 에러 전달
    }
  });

export default router;
