import express from "express";
import { getUserByEmail } from "../db";
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from "@simplewebauthn/server";

const RP_ID = "localhost";

export const authRoutes = express
  .Router()
  .get("/init-registration", async (req, res) => {
    const email = req.query.email as string;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const userExists = getUserByEmail(email);

    if (userExists) {
      return res.status(400).json({ error: "User already exists" });
    }

    const options = await generateRegistrationOptions({
      rpID: RP_ID,
      rpName: "Finger Print Tutorial",
      userName: email,
    });

    return res.status(201).json(options);
  });
