import jwt from "jsonwebtoken";
import { prisma } from "../utils/prisma/index.js";

export default async function (req, res, next) {
  try {
    const { authorization } = req.headers;
    if (!authorization) throw new Error("액세스 토큰이 존재하지 않습니다.");

    const [tokenType, token] = authorization.split(" ");

    if (tokenType !== "Bearer")
      throw new Error("토큰 타입이 일치하지 않습니다.");

    // 액세스 토큰 검증 (액세스 토큰의 비밀키는 JWT_ACCESS_KEY로 검증)
    const decodedToken = jwt.verify(token, process.env.JWT_ACCESS_KEY);
    const userId = decodedToken.userId;

    const user = await prisma.users.findFirst({
      where: { id: +userId },
    });
    if (!user) {
      res.clearCookie("authorization");
      throw new Error("토큰 사용자가 존재하지 않습니다.");
    }

    // req.user에 사용자 정보를 저장합니다.
    req.user = user;

    next();
  } catch (error) {
    // 액세스 토큰이 만료되었을 때
    if (error.name === "TokenExpiredError") {
      // 리프레시 토큰 확인
      const { refreshToken } = req.cookies;

      if (!refreshToken) {
        return res.status(401).json({ message: "리프레시 토큰이 존재하지 않습니다." });
      }

      try {
        // 리프레시 토큰 검증 (리프레시 토큰의 비밀키는 JWT_REFRESH_KEY로 검증)
        const decodedRefreshToken = jwt.verify(refreshToken, process.env.JWT_REFRESH_KEY);
        const userId = decodedRefreshToken.userId;

        // 새로운 액세스 토큰 생성
        const newAccessToken = jwt.sign({ userId }, process.env.JWT_ACCESS_KEY, {
          expiresIn: '15m',  // 새로운 액세스 토큰 유효 시간: 15분
        });

        // 새로운 액세스 토큰 반환
        return res.status(200).json({ accessToken: newAccessToken });
      } catch (refreshTokenError) {
        res.clearCookie("refreshToken");
        return res.status(401).json({ message: "리프레시 토큰이 만료되었거나 유효하지 않습니다." });
      }
    }

    res.clearCookie("authorization");

    switch (error.name) {
      case "JsonWebTokenError":
        return res.status(401).json({ message: "토큰이 조작되었습니다." });
      default:
        return res.status(401).json({ message: error.message ?? "비정상적인 요청입니다." });
    }
  }
}
