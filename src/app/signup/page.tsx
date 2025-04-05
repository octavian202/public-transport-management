import { signupAction } from "@/actions/auth";
import React from "react";

export default function () {
  return (
    <div>
      <form>
        <input id="email" name="email" type="email" placeholder="email" />
        <input
          id="password"
          name="password"
          type="password"
          placeholder="password"
        />
        <input
          id="username"
          name="username"
          type="text"
          placeholder="username"
        />
        <input id="role" name="role" type="text" placeholder="role" />

        <button formAction={signupAction}>sign up</button>
      </form>
    </div>
  );
}
