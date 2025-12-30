import Paste from "../models/Paste.js";
import { nanoid } from "nanoid";

function getNow(req) {
  if (process.env.TEST_MODE === "1") {
    const testNow = req.header("x-test-now-ms");
    if (testNow) return new Date(Number(testNow));
  }
  return new Date();
}

export async function healthCheck(req, res) {
  res.status(200).json({ ok: true });
}

export async function createPaste(req, res) {
  const { content, ttl_seconds, max_views } = req.body;

  if (!content || typeof content !== "string" || !content.trim()) {
    return res.status(400).json({ error: "Invalid content" });
  }

  if (ttl_seconds !== undefined && (!Number.isInteger(ttl_seconds) || ttl_seconds < 1)) {
    return res.status(400).json({ error: "Invalid ttl_seconds" });
  }

  if (max_views !== undefined && (!Number.isInteger(max_views) || max_views < 1)) {
    return res.status(400).json({ error: "Invalid max_views" });
  }

  let expiresAt = null;
  if (ttl_seconds) {
    expiresAt = new Date(Date.now() + ttl_seconds * 1000);
  }

  const paste = await Paste.create({
    content,
    expiresAt,
    maxViews: max_views ?? null
  });

  res.status(201).json({
    id: paste._id.toString(),
    url: `${req.protocol}://${req.get("host")}/p/${paste._id}`
  });
}

export async function getPasteApi(req, res) {
  const paste = await Paste.findById(req.params.id);
  if (!paste) {
    return res.status(404).json({ error: "Not found" });
  }

  const now = getNow(req);

  if (paste.expiresAt && now > paste.expiresAt) {
    return res.status(404).json({ error: "Expired" });
  }

  if (paste.maxViews !== null && paste.views >= paste.maxViews) {
    return res.status(404).json({ error: "View limit exceeded" });
  }

  paste.views += 1;
  await paste.save();

  res.json({
    content: paste.content,
    remaining_views:
      paste.maxViews === null ? null : Math.max(paste.maxViews - paste.views, 0),
    expires_at: paste.expiresAt
  });
}

export async function viewPasteHtml(req, res) {
  const paste = await Paste.findById(req.params.id);
  if (!paste) return res.status(404).send("Not found");

  const now = getNow(req);

  if (paste.expiresAt && now > paste.expiresAt) {
    return res.status(404).send("Expired");
  }

  if (paste.maxViews !== null && paste.views >= paste.maxViews) {
    return res.status(404).send("View limit exceeded");
  }

  paste.views += 1;
  await paste.save();

  res.setHeader("Content-Type", "text/html");
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <title>Paste</title>
      </head>
      <body>
        <pre>${paste.content.replace(/</g, "&lt;")}</pre>
      </body>
    </html>
  `);
}
