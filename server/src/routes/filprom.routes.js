import { Router } from "express";
import Jimp from "jimp";

const router = Router();

const applyAverageFilter = async (image) => {
  const width = image.bitmap.width;
  const height = image.bitmap.height;

  const newImage = image.clone();

  // Tamaño de la ventana del filtro (3x3 en este caso)
  const filterSize = 3;
  const offset = Math.floor(filterSize / 2);

  // Escanear la imagen y aplicar el filtro promedio
  image.scan(0, 0, width, height, function (x, y, idx) {
    if (
      x >= offset &&
      y >= offset &&
      x < width - offset &&
      y < height - offset
    ) {
      let sumRed = 0,
        sumGreen = 0,
        sumBlue = 0;
      let count = 0;

      // Promediar los valores de los píxeles en la vecindad
      for (let i = -offset; i <= offset; i++) {
        for (let j = -offset; j <= offset; j++) {
          const neighborIdx = this.getPixelIndex(x + i, y + j);
          sumRed += this.bitmap.data[neighborIdx];
          sumGreen += this.bitmap.data[neighborIdx + 1];
          sumBlue += this.bitmap.data[neighborIdx + 2];
          count++;
        }
      }

      // Establecer el nuevo valor del píxel
      const avgRed = sumRed / count;
      const avgGreen = sumGreen / count;
      const avgBlue = sumBlue / count;

      const newIdx = newImage.getPixelIndex(x, y);
      newImage.bitmap.data[newIdx] = avgRed;
      newImage.bitmap.data[newIdx + 1] = avgGreen;
      newImage.bitmap.data[newIdx + 2] = avgBlue;
    }
  });

  return newImage;
};

router.post("/prom", async (req, res) => {
  try {
    if (!req.body) throw new Error("No se ha proporcionado ninguna imagen");
    const image = await Jimp.read(req.body);

    const processedImage = await applyAverageFilter(image);

    const buffer = await processedImage.getBufferAsync(Jimp.MIME_JPEG);
    return res.status(200).send({ name: "Filtro Promedio", buffer: buffer });
  } catch (error) {
    return res.status(400).send(error.message);
  }
});

export default router;
