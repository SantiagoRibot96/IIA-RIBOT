import express from "express";
import exphbs from "express-handlebars";

/* Declaraciones para el servidor */
const app = express();
const PORT = 8080;

app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.engine("handlebars", exphbs.engine({
    runtimeOptions:{
        allowProtoMethodsByDefault:true,
        allowProtoPropertiesByDefault:true,
    }})
);
app.set("view engine", "handlebars");
app.set("views", "./views");

app.use("*/css", express.static("./public/css"));
app.use("*/js", express.static("./public/js"));

app.listen(PORT, () => {
    console.log("Funcionando");
});

app.get("/", (req, res) => {
    res.render("index");
});

