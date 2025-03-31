import express, { Express } from "express";
import ejs from "ejs";
import dotenv from "dotenv";

dotenv.config();

const app : Express = express();

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("port", process.env.PORT ?? 3000);


app.get("/", (req, res) => {
    res.render("index");
});

app.get("/login", (req, res) => {
    
}); 

app.get("register", (req, res) => {
    
});

app.get("/landing", (req, res) => {
    
});

app.get("/menu", (req, res) => {
    
});

app.get("/shop", (req, res) => {
    
});

app.listen(app.get("port"), () => {
    console.log("Server started on http://localhost/:" + app.get("port"));
});