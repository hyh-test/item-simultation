import jwt from "jsonwebtoken";
import { prisma } from "../utils/prisma/index.js";

export default async function (req, res, next) {
  try {
    // Authorization 헤더에서 토큰 가져오기
    const { authorization } = req.headers;
    if (!authorization) throw new Error("액세스 토큰이 존재하지 않습니다.");

    const [tokenType, token] = authorization.split(" ");

    // Bearer 타입의 토큰만 처리
    if (tokenType !== "Bearer") {
      throw new Error("토큰 타입이 일치하지 않습니다.");
    }

    // 액세스 토큰 검증 (비밀키는 JWT_ACCESS_KEY로 검증)
    const decodedToken = jwt.verify(token, process.env.JWT_ACCESS_KEY);
    const userId = decodedToken.userId;

    // 사용자 존재 여부 확인
    const user = await prisma.users.findFirst({
      where: { id: +userId },
    });

    if (!user) {
      res.clearCookie("authorization");
      throw new Error("토큰 사용자가 존재하지 않습니다.");
    }

    // req.user에 사용자 정보를 저장
    req.user = user;

    // 다음 미들웨어로 넘어가기
    next();
  } catch (error) {
    // 액세스 토큰 만료 처리
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "액세스 토큰이 만료되었습니다. 다시 로그인해주세요." });
    }

    // 기타 JWT 오류 처리
    res.clearCookie("authorization");
    switch (error.name) {
      case "JsonWebTokenError":
        return res.status(401).json({ message: "토큰이 조작되었습니다." });
      default:
        return res.status(401).json({ message: error.message ?? "비정상적인 요청입니다." });
    }
  }
}