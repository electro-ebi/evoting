import express from "express";
import {
  createElection,
  getElections,
  getElectionById,
} from "../controllers/electionController.js";

const router = express.Router();

router.post("/", createElection);
router.get("/", getElections);
router.get("/:id", getElectionById);

export default router;
