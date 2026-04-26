// All 5 endpoints from SRS Section 2.3.
// Validation middleware runs before controllers.
// Controllers use req.validated — never req.body.

import { Router } from "express";
import {
  startSimulation,
  runRound,
  getState,
  getPlan,
  deleteSimulation,
} from "../controllers/simulationController.js";
import { validateBody } from "../middleware/validate.js";
import {
  startSimulationSchema,
  runRoundSchema,
} from "../schemas/simulationSchemas.js";

const router = Router();

router.post("/start", validateBody(startSimulationSchema), startSimulation);
router.post("/run-round", validateBody(runRoundSchema), runRound);
router.get("/state/:id", getState);
router.get("/plan/:id", getPlan);
router.delete("/:id", deleteSimulation);

export default router;
