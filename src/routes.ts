import { Router } from "express";
import OrphanageController from "./controllers/OrphanagesController";

const routes = Router();

routes.post("/orphanages", OrphanageController.create);
routes.get("/orphanages", OrphanageController.index);

export default routes;
