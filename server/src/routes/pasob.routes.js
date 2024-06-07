import { Router } from "express";
import Jimp from "jimp";

const router = Router();

router.post("/pasob", async (req, res) => {
  try {
    if (!req.body) throw new Error("No ha proporcionado ninguna imagen");
    const image = await Jimp.read(req.body);
    image.blur(5);
    const buffer = await image.getBufferAsync(Jimp.MIME_JPEG);
    res.send({ name: "Paso Bajas", buffer: buffer });
  } catch (error) {
    return res.status(400).send(error.message);
  }
});

export default router;
