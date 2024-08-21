import path from "path";
import express from "express";
import logger from "./middleware/logger";
import cookieParser from "cookie-parser";

export const app = express();

const port = process.env.PORT || 3000;

//Middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());
app.disable("x-powered-by");

//Logger middleware
app.use(logger);

//API Routes

// Serve static files from the "client/dist" directory
app.use(express.static(path.join(__dirname, "../client/dist")));

// Serve index.html for all other routes
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/dist", "index.html"));
});

app.listen(port, () => {
  console.log(`App running on port:${port}`);
});
