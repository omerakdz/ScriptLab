import express, { Express } from "express";
import ejs from "ejs";
import dotenv from "dotenv";
import path from "path";
import { fetchSkins} from "./api";
import session from "./session";
import {usersCollection,connect} from "./database";

import rootRouter from "./routers/rootRoutes"
import authRouter from "./routers/authRoutes";
import cardGameRouter from "./routers/cardGameRoutes";
import gameRouter from "./routers/gameRoutes";
import guideRouter from "./routers/guideRoutes";
import itemRouter from "./routers/itemRoutes";
import menuRouter from "./routers/menuRoutes";
import searchRouter from "./routers/searchRoutes";
import shopRouter from "./routers/shopRoutes";
import skinRouter from "./routers/skinRoutes";
import userRoutes from "./routers/userRoutes";

dotenv.config();

const app: Express = express();

app.set("view engine", "ejs");
app.use(session);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("port", process.env.PORT ?? 3000);

// export async function secureMiddleware(req: Request, res: Response, next: NextFunction) {
//     console.log("Session username:", req.session.username); // controle
//     if (req.session.username) {
//         next();
//     } else {
//         res.redirect("/");
//     }
// };

app.use(async (req, res, next) => {
  if (req.session.username) {
    res.locals.username = req.session.username;

    const user = await usersCollection.findOne({
      username: req.session.username,
    });

    if (user) {
      res.locals.level = user.level || 1;
      res.locals.wins = user.wins || 0;
      res.locals.losses = user.losses || 0;
      res.locals.vbucks = user.vbucks || 1000;

      if (user.selectedSkinId) {
        const skins = await fetchSkins();
        res.locals.selectedSkin = skins.find(
          (skin) => skin.id === user.selectedSkinId
        );
      } else {
        res.locals.selectedSkin = null;
      }
    }
  } else {
    res.locals.username = null;
    res.locals.selectedSkin = null;
  }

  next();
});

// async function addTestMoves() { // test voor leaderboard
//   try {
//     const result1 = await usersCollection.updateOne(
//       { username: "omer" },
//       { $set: { moves: 35 } }
//     );

//     const result2 = await usersCollection.updateOne(
//       { username: "Player2" },
//       { $set: { moves: 25 } }
//     );

//     console.log("Updated result:", result1.modifiedCount);
//   } catch (err) {
//     console.error("error updating the resuls:", err);
//   }
// }

// addTestMoves();

app.use("/", rootRouter());              
app.use("/", authRouter());          
app.use("/", cardGameRouter()); 
app.use("/", gameRouter());
app.use("/", guideRouter());
app.use("/", itemRouter());
app.use("/", menuRouter());
app.use("/", searchRouter());
app.use("/", shopRouter());
app.use("/", skinRouter());
app.use("/", userRoutes());


app.listen(app.get("port"), "0.0.0.0", async () => {
  await connect();
  console.log("Server started on http://localhost:" + app.get("port"));
});

