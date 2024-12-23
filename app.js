import express from "express";
import cookieParser from "cookie-parser";
import UsersRouter from "./routes/users.router.js";
import characterRouter from "./routes/character.router.js";
import itemRouter from "./routes/item.router.js";
import itemshopRouter from "./routes/itemshop.router.js";
import inventoryRouter from "./routes/inventory.router.js";
import equippedItemRouter from "./routes/equippeditem.router.js";
import LogMiddleware from "./middlewares/log.middleware.js";
import ErrorHandlingMiddleware from "./middlewares/auth.middleware.js";

const app = express();
const PORT = 3018;

app.use(LogMiddleware);
app.use(express.json());
app.use(cookieParser());
app.use("/api", UsersRouter);
app.use("/api/item", itemRouter);
app.use("/api/itemshop", itemshopRouter);
app.use("/api/character", characterRouter);
app.use("/api/inventory", inventoryRouter);
app.use("/api/equippedItem", equippedItemRouter);

app.use(ErrorHandlingMiddleware);

app.listen(PORT, () => {
  console.log(PORT, "포트로 서버가 열렸어요!");
});
