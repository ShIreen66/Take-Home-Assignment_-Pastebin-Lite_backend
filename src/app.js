import express from "express";
import cors from "cors";
import pasteRoutes from "./routes/paste.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use(pasteRoutes);

export default app;
