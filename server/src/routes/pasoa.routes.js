import { Router } from "express";
import Jimp from "jimp";

const router = Router();

router.post("/pasoa", async (req, res) => {
  try {
    if (!req.body) throw new Error("No ha proporcionado ninguna imagen");

    const image = await Jimp.read(req.body);
    //image.greyscale()
    image.convolute([
      [-1, -1, -1],
      [-1, 8, -1],
      [-1, -1, -1],
    ]);

    const buffer = await image.getBufferAsync(Jimp.MIME_JPEG);

    return res.status(200).send({ name: "Paso Altas", buffer: buffer });
  } catch (error) {
    return res.status(400).send(error.message);
  }
});

export default router;
