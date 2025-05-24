import express from "express";
import bcrypt from "bcrypt";
import { usersCollection } from "../database";
import { createUser, loginUser } from "../account";
import { Player } from "../types";

export default function authRouter() {
  const router = express.Router();

  // Login pagina tonen
  router.get("/login", (req, res) => {
    res.render("login", {
      title: "Login",
      bodyId: "login-page",
      errorMessage: "",
    });
  });

  // Inloggen
  router.post("/login", async (req, res) => {
    const { username, password } = req.body;
    try {
      const user = await loginUser(username, password);
      req.session.username = user.username;

      const userExists = await usersCollection.findOne({ username });
      res.redirect(userExists ? "/index" : "/landing");
    } catch {
      res.render("login", {
        errorMessage: "Ongeldige login",
        title: "Login",
        bodyId: "login-page",
      });
    }
  });

  // Uitloggen
  router.get("/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) return res.status(500).send("Fout bij sessie beëindigen");
      res.redirect("/login");
    });
  });

  // Register pagina tonen
  router.get("/register", (req, res) => {
    res.render("register", {
      bodyId: "register-page",
      title: "Register",
      errorMessage: "",
    });
  });

  // Registreren
  router.post("/signup", async (req, res) => {
    const { username, password, confirmPassword } = req.body;

    const existingUser = await usersCollection.findOne({ username });
    if (existingUser)
      return res.render("register", {
        errorMessage: "Gebruikersnaam is al in gebruik.",
        title: "Register",
        bodyId: "register-page",
      });

    if (password !== confirmPassword)
      return res.render("register", {
        errorMessage: "De wachtwoorden komen niet overeen.",
        title: "Register",
        bodyId: "register-page",
      });

    const user = await createUser(username, password);
    if (!user)
      return res.render("register", {
        errorMessage: "Fout bij registreren.",
        title: "Register",
        bodyId: "register-page",
      });

    req.session.username = user.username;
    res.redirect("/landing");
  });

  return router;
}
