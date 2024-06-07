import express from "express";
import gscale from "./routes/gscale.routes.js";
import sobel from "./routes/sobel.routes.js";
import exp from "./routes/eqexp.routes.js";
import prom from "./routes/filprom.routes.js";
import pasob from "./routes/pasob.routes.js";
import pasoa from "./routes/pasoa.routes.js";

const app = express();

//Middlewares
app.use(express.raw({ type: "application/octet-stream", limit: "10mb" }));
app.use(express.json({ limit: "10mb" }));

//Config
app.set("port", process.env.PORT || 3000);

//Rutas
app.use(gscale);
app.use(sobel);
app.use(exp);
app.use(prom);
app.use(pasob);
app.use(pasoa);

//Listen
app.listen(app.get("port"), () => {
  console.log("Server is listening on port:", app.get("port"));
});
