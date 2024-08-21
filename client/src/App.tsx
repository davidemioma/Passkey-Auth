import { useState } from "react";
import { Input } from "./components/ui/input";
import { Button } from "./components/ui/button";

const App = () => {
  const [email, setEmail] = useState("");

  const handleLogIn = () => {};

  const handleSignUp = () => {};

  return (
    <>
      <main className="w-full h-screen flex items-center justify-center">
        <div className="w-full flex flex-col gap-5 max-w-2xl p-5 mx-auto border rounded-lg">
          <Input
            type="email"
            value={email}
            placeholder="Email"
            onChange={(e) => setEmail(e.target.value)}
          />

          <div className="flex items-center justify-end gap-3">
            <Button onClick={handleLogIn}>Log In</Button>

            <Button variant="secondary" onClick={handleSignUp}>
              Sign Up
            </Button>
          </div>
        </div>
      </main>
    </>
  );
};

export default App;
