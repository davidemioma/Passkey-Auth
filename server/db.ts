import type {
  AuthenticatorTransportFuture,
  CredentialDeviceType,
  Base64URLString,
} from "@simplewebauthn/types";

export type PassKey = {
  id: Base64URLString;
  publicKey: Uint8Array;
  counter: number;
  deviceType: CredentialDeviceType;
  backedUp: boolean;
  transports?: AuthenticatorTransportFuture[];
};

export type User = {
  id: string;
  email: string;
  passKey: PassKey;
};

const USERS: User[] = [];

export const getUserByEmail = (email: string) => {
  return USERS.find((user) => user.email === email);
};

export const getUserById = (id: string) => {
  return USERS.find((user) => user.id === id);
};

export const createUser = (id: string, email: string, passKey: PassKey) => {
  USERS.push({ id, email, passKey });
};

export const updateUserCounter = (id: string, counter: number) => {
  const user = USERS.find((user) => user.id === id);

  if (!user) return;

  user.passKey.counter = counter;
};
