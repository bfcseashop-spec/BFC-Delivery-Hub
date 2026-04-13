import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import categoriesRouter from "./categories";
import restaurantsRouter from "./restaurants";
import menuRouter from "./menu";
import ordersRouter from "./orders";
import reviewsRouter from "./reviews";
import adminRouter from "./admin";
import landingRouter from "./landing";
import uploadRouter from "./upload";
import partnerRouter from "./partner";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(categoriesRouter);
router.use(restaurantsRouter);
router.use(menuRouter);
router.use(ordersRouter);
router.use(reviewsRouter);
router.use(adminRouter);
router.use(landingRouter);
router.use(uploadRouter);
router.use(partnerRouter);

export default router;
