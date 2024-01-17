import { Router } from "express";
import { SearchService } from "./service/SearchService";
import { SearchController } from "./controller/SearchController";
import { authenticate } from "../../../middlewares/AuthMiddleware";
import { asyncHandler } from "../../../util/AsyncHandler";

const searchService = new SearchService();
const searchController = new SearchController(searchService);

const router = Router();
router.get(
    "/",
    asyncHandler(authenticate),
    asyncHandler(searchController.search)
);
export { router as APIV1SearchRouter };
