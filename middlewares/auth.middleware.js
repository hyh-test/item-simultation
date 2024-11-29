import jwt from "jsonwebtoken";
import { prisma } from "../utils/prisma/index.js";

export default async function (req, res, next) {
  try {
    const { authorization } = req.headers;
    if (!authorization) throw new Error("액세스 토큰이 존재하지 않습니다.");

    const [tokenType, token] = authorization.split(" ");

    if (tokenType !== "Bearer") {
      throw new Error("토큰 타입이 일치하지 않습니다.");
    }

    const decodedToken = jwt.verify(token, process.env.JWT_KEY);
    const userId = decodedToken.userId;

    const user = await prisma.users.findFirst({
      where: { id: Number(userId) }, // 명시적으로 숫자 변환
    });

    if (!user) {
      res.clearCookie("authorization");
      throw new Error("사용자가 존재하지 않습니다.");
    }

    req.user = user;
    next();
  } catch (error) {
    res.clearCookie("authorization");

    // JWT 오류 처리
    switch (error.name) {
      case "TokenExpiredError":
        return res.status(401).json({ message: "액세스 토큰이 만료되었습니다. 다시 로그인해주세요." });
      case "JsonWebTokenError":
        return res.status(401).json({ message: "유효하지 않은 토큰입니다." });
      default:
        return res.status(401).json({ message: error.message ?? "비정상적인 요청입니다." });
    }
  }
}
