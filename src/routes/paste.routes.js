import express from "express";
import {
  createPaste,
  getPasteApi,
  viewPasteHtml,
  healthCheck
} from "../controllers/paste.controller.js";

const router = express.Router();

router.get("/", (req, res) => res.send("Welcome to Pastebin Lite API"));
router.get("/api/healthz", healthCheck);
router.post("/api/pastes", createPaste);
router.get("/api/pastes/:id", getPasteApi);
router.get("/p/:id", viewPasteHtml);

export default router;
