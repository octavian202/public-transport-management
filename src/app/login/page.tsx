import { loginAction } from "@/actions/auth";
import React from "react";

export default function page() {
  return (
    <div>
      <form action={loginAction}>
        <input id="email" name="email" type="email" placeholder="email" />
        <input
          id="password"
          name="password"
          type="password"
          placeholder="password"
        />

        <button type="submit">login</button>
      </form>
    </div>
  );
}
