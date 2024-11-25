
import express from 'express';
import cookieParser from 'cookie-parser';
import UsersRouter from './routes/users.router.js';

const app = express();
const PORT = 3018;

const ACCESS_TOKEN_SECRET_KEY = `HangHae99`; // 이부분은 나중에 다른 키로 변경하고 env파일로 넣을것
const REFRESH_TOKEN_SECRET_KEY = `Sparta`; // 이부분은 나중에 다른 키로 변경하고 env파일로 넣을것.

app.use(express.json());
app.use(cookieParser());
app.use('/api', [UsersRouter]);

app.listen(PORT, () => {
  console.log(PORT, '포트로 서버가 열렸어요!');
});