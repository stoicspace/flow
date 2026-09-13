import express from "express";
import path from "path";

export function createLocalServer(port = 3200): Promise<{ url: string; close: () => void }> {
  return new Promise((resolve) => {
    const app = express();
    const nextDir = path.join(__dirname, "../renderer");

    app.use(express.static(nextDir));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(nextDir, "index.html"));
    });

    const server = app.listen(port, () => {
      resolve({
        url: `http://localhost:${port}`,
        close: () => server.close(),
      });
    });
  });
}
