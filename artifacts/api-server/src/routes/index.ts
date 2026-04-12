import { Router, type IRouter } from "express";
import healthRouter from "./health";
import categoriesRouter from "./categories";
import restaurantsRouter from "./restaurants";
import menuRouter from "./menu";
import ordersRouter from "./orders";

const router: IRouter = Router();

router.use(healthRouter);
router.use(categoriesRouter);
router.use(restaurantsRouter);
router.use(menuRouter);
router.use(ordersRouter);

export default router;
