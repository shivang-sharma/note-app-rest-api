import { Router } from "express";
import { APIV1AuthRouter } from "./auth/AuthRouter";
import { APIV1NotesRouter } from "./notes/NotesRouter";
import { APIV1SearchRouter } from "./search/SearchRouter";

export const APIV1Router = Router();
APIV1Router.use("/auth", APIV1AuthRouter);
APIV1Router.use("/notes", APIV1NotesRouter);
APIV1Router.use("/search", APIV1SearchRouter);
