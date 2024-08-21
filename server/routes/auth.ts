import express from "express";
import type { AuthenticatorTransportFuture } from "@simplewebauthn/types";
import {
  getUserByEmail,
  getUserById,
  createUser,
  updateUserCounter,
} from "../db";
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

    res.cookie(
      "regInfo",
      JSON.stringify({
        userId: options.user.id,
        email,
        challenge: options.challenge,
      }),
      { httpOnly: true, maxAge: 360000, secure: true }
    );

    return res.status(200).json(options);
  })
  .post("/verify-registration", async (req, res) => {
    const regInfo = JSON.parse(req.cookies.regInfo);

    if (!regInfo) {
      return res.status(400).json({ error: "Registration info not found" });
    }

    const verification = await verifyRegistrationResponse({
      response: req.body,
      expectedChallenge: regInfo.challenge,
      expectedOrigin: process.env.CLIENT_URL || "http://localhost:5173",
      expectedRPID: RP_ID,
    });

    if (
      !verification ||
      !verification.verified ||
      !verification.registrationInfo
    ) {
      return res.status(400).json({ error: "Verification failed" });
    }

    createUser(regInfo.userId, regInfo.email, {
      id: verification.registrationInfo?.credentialID,
      publicKey: verification.registrationInfo?.credentialPublicKey,
      counter: verification.registrationInfo?.counter,
      deviceType: verification.registrationInfo?.credentialDeviceType,
      backedUp: verification.registrationInfo?.credentialBackedUp,
      transports: req.body.transports as AuthenticatorTransportFuture[],
    });

    res.clearCookie("regInfo");

    return res.status(201).json({ verified: verification.verified });
  })
  .get("/init-auth", async (req, res) => {
    const email = req.query.email as string;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const userExists = getUserByEmail(email);

    if (!userExists) {
      return res.status(400).json({ error: "User not found" });
    }

    const options = await generateAuthenticationOptions({
      rpID: RP_ID,
      allowCredentials: [
        {
          id: userExists.passKey.id,
          transports: userExists.passKey.transports,
        },
      ],
    });

    res.cookie(
      "authInfo",
      JSON.stringify({
        userId: userExists.id,
        challenge: options.challenge,
      }),
      { httpOnly: true, maxAge: 360000, secure: true }
    );

    return res.status(200).json(options);
  })
  .post("/verify-auth", async (req, res) => {
    const authInfo = JSON.parse(req.cookies.authInfo);

    if (!authInfo) {
      return res.status(400).json({ error: "Authentication info not found" });
    }

    const userExists = getUserById(authInfo.userId);

    if (!userExists) {
      return res.status(400).json({ error: "User not found" });
    }

    const verification = await verifyAuthenticationResponse({
      response: req.body,
      expectedChallenge: authInfo.challenge,
      expectedOrigin: process.env.CLIENT_URL || "http://localhost:5173",
      expectedRPID: RP_ID,
      authenticator: {
        credentialID: userExists.passKey.id,
        credentialPublicKey: userExists.passKey.publicKey,
        counter: userExists.passKey.counter,
        transports: userExists.passKey.transports,
      },
    });

    if (
      !verification ||
      !verification.verified ||
      !verification.authenticationInfo
    ) {
      return res.status(400).json({ error: "Verification failed" });
    }

    updateUserCounter(
      userExists.id,
      verification.authenticationInfo.newCounter
    );

    res.clearCookie("authInfo");

    // Save user in a session cookie in a real application

    return res.status(200).json({ verified: verification.verified });
  });
