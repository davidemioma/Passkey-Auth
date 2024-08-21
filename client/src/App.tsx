import { toast } from "sonner";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import axios, { AxiosError } from "axios";
import { Input } from "./components/ui/input";
import { Button } from "./components/ui/button";
import { useMutation } from "@tanstack/react-query";
import {
  startRegistration,
  startAuthentication,
} from "@simplewebauthn/browser";

const App = () => {
  const [email, setEmail] = useState("");

  const { mutate: signUp, isPending: signingUp } = useMutation({
    mutationKey: ["sign-up"],
    mutationFn: async () => {
      // Get challenge from the server
      const initialResponse = await axios.get(
        `/api/init-registration?email=${email}`,
        { withCredentials: true }
      );

      const options = await initialResponse.data;

      // Create passkey
      const registrationJSON = await startRegistration(options);

      // Save passKey to DB
      const verifyResponse = await axios.post(
        `/api/verify-registration`,
        { ...registrationJSON },
        {
          withCredentials: true,
        }
      );

      return verifyResponse;
    },
    onSuccess: (res) => {
      const verifiedData = res.data;

      if (verifiedData.verified) {
        toast.success(`Successfull registered ${email}`);
      } else {
        toast.error("Failed to register!");
      }
    },
    onError: (err) => {
      if (err instanceof AxiosError) {
        toast.error(err.response?.data);
      } else {
        toast.error("Something went wrong! Try again.");
      }
    },
  });

  const { mutate: logIn, isPending: loggingIn } = useMutation({
    mutationKey: ["log-in"],
    mutationFn: async () => {
      // Get challenge from the server
      const initialResponse = await axios.get(`/api/init-auth?email=${email}`, {
        withCredentials: true,
      });

      const options = await initialResponse.data;

      // Get PassKey
      const authJSON = await startAuthentication(options);

      // Verify PassKey with DB
      const verifyResponse = await axios.post(
        `/api/verify-auth`,
        { ...authJSON },
        {
          withCredentials: true,
        }
      );

      return verifyResponse;
    },
    onSuccess: (res) => {
      const verifiedData = res.data;

      if (verifiedData.verified) {
        toast.success(`Successfull logged in ${email}`);
      } else {
        toast.error("Failed to log in!");
      }
    },
    onError: (err) => {
      if (err instanceof AxiosError) {
        toast.error(err.response?.data);
      } else {
        toast.error("Something went wrong! Try again.");
      }
    },
  });

  const handleSignUp = () => {
    signUp();
  };

  const handleLogIn = async () => {
    logIn();
  };

  return (
    <>
      <main className="w-full h-screen flex items-center justify-center">
        <div className="w-full flex flex-col gap-5 max-w-2xl p-5 mx-auto border rounded-lg">
          <Input
            type="email"
            value={email}
            placeholder="Email"
            onChange={(e) => setEmail(e.target.value)}
            disabled={signingUp || loggingIn}
          />

          <div className="flex items-center justify-end gap-3">
            <Button
              className="flex items-center justify-center"
              onClick={handleLogIn}
              disabled={!email.trim() || signingUp || loggingIn}
            >
              {loggingIn ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Log In"
              )}
            </Button>

            <Button
              className="flex items-center justify-center"
              variant="secondary"
              onClick={handleSignUp}
              disabled={!email.trim() || signingUp || loggingIn}
            >
              {signingUp ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Sign Up"
              )}
            </Button>
          </div>
        </div>
      </main>
    </>
  );
};

export default App;
