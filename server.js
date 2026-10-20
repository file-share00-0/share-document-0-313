
const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const PORT = process.env.PORT || 10000;
const HOST = "0.0.0.0";

const ZIP_PATH = path.join(__dirname, "build.zip");
const HTML_PATH = path.join(__dirname, "index.html");

const server = http.createServer((req, res) => {
  const url = new URL(
    req.url,
    `http://${req.headers.host || "localhost"}`
  );

  if (req.method !== "GET" && req.method !== "HEAD") {
    res.writeHead(405, { Allow: "GET, HEAD" });
    res.end("Method not allowed");
    return;
  }

  if (url.pathname === "/download") {
    fs.stat(ZIP_PATH, (err, stats) => {
      if (err || !stats.isFile()) {
        res.writeHead(404);
        res.end("ZIP file not found");
        return;
      }

      // Generate a random seven-digit number
      const randomNumber = Math.floor(
        1000000 + Math.random() * 9000000
      );

      const filename = `Design blueprint_${randomNumber}.zip`;

      res.writeHead(200, {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": stats.size,
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "no-store"
      });

      if (req.method === "HEAD") {
        res.end();
        return;
      }

      const stream = fs.createReadStream(ZIP_PATH);

      stream.on("error", () => {
        res.destroy();
      });

      stream.pipe(res);
    });

    return;
  }

  if (url.pathname === "/" || url.pathname === "/index.html") {
    if (req.method === "HEAD") {
      res.writeHead(200, {
        "Content-Type": "text/html; charset=utf-8"
      });
      res.end();
      return;
    }

    fs.createReadStream(HTML_PATH)
      .on("error", () => {
        if (!res.headersSent) {
          res.writeHead(500);
          res.end("Unable to load page");
        }
      })
      .pipe(res);

    return;
  }

  res.writeHead(404, {
    "Content-Type": "text/plain"
  });
  res.end("Not found");
});

server.listen(PORT, HOST, () => {
  console.log(`Server listening on ${HOST}:${PORT}`);
});
