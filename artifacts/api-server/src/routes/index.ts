import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import categoriesRouter from "./categories";
import restaurantsRouter from "./restaurants";
import menuRouter from "./menu";
import ordersRouter from "./orders";
import adminRouter from "./admin";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(categoriesRouter);
router.use(restaurantsRouter);
router.use(menuRouter);
router.use(ordersRouter);
router.use(adminRouter);

export default router;
