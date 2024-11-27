import express from "express";
import { prisma } from "../utils/prisma/index.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import dotenv from "dotenv"; // dotenv 패키지 불러오기

dotenv.config();

const router = express.Router();


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
      const inventoryData = await prisma.inventory.findFirst({
        where: {
          id: +characterId, // 캐릭터 ID가 요청된 캐릭터 ID와 일치하는지
        },
        select: {
          id: true,
          itemId: true, //아이템 아이디
          quantity: true, //아이템 수량
        },
      });
  
      return res.status(200).json({ data: inventoryData });
    } catch (error) {
      next(error);
    }
  });

export default router;
