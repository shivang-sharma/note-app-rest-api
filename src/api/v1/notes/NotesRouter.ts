import { Router } from "express";
import { authenticate } from "../../../middlewares/AuthMiddleware";
import { NotesService } from "./service/NotesService";
import { NotesController } from "./controller/NotesController";
import { asyncHandler } from "../../../util/AsyncHandler";

const notesService = new NotesService();
const notesController = new NotesController(notesService);
const router = Router();

router.get(
    "/",
    asyncHandler(authenticate),
    asyncHandler(notesController.getAllNotes)
);
router.get(
    "/:noteId",
    asyncHandler(authenticate),
    asyncHandler(notesController.getNote)
);
router.post(
    "/",
    asyncHandler(authenticate),
    asyncHandler(notesController.postNote)
);
router.put(
    "/:noteId",
    asyncHandler(authenticate),
    asyncHandler(notesController.putNote)
);
router.delete(
    "/:noteId",
    asyncHandler(authenticate),
    asyncHandler(notesController.deleteNote)
);
router.post(
    "/:noteId/share",
    asyncHandler(authenticate),
    asyncHandler(notesController.shareNote)
);

export { router as APIV1NotesRouter };
