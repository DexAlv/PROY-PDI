import { Router } from "express";
import Jimp from "jimp";

const router = Router();

const exponentialEqualization = async (image) => {
  // Convertir la imagen a escala de grises
  image.grayscale();

  // Obtener el histograma
  const histogram = new Array(256).fill(0);
  const width = image.bitmap.width;
  const height = image.bitmap.height;
  image.scan(0, 0, width, height, function (x, y, idx) {
    const gray = this.bitmap.data[idx]; // En escala de grises, R=G=B=Gray
    histogram[gray]++;
  });

  // Calcular la función de distribución acumulativa (CDF)
  const cdf = new Array(256).fill(0);
  cdf[0] = histogram[0];
  for (let i = 1; i < 256; i++) {
    cdf[i] = cdf[i - 1] + histogram[i];
  }

  // Normalizar la CDF
  const cdfMin = cdf.find((value) => value > 0);
  const totalPixels = width * height;
  const cdfNormalized = cdf.map(
    (value) => (value - cdfMin) / (totalPixels - cdfMin)
  );

  // Aplicar la transformación exponencial
  const lambda = 1; // Puedes ajustar este parámetro
  const expTransformed = cdfNormalized.map(
    (value) => 255 * (1 - Math.exp(-lambda * value))
  );

  // Crear la nueva imagen con los valores de intensidad ajustados
  const newImage = image.clone();
  newImage.scan(0, 0, width, height, function (x, y, idx) {
    const gray = this.bitmap.data[idx];
    const newGray = expTransformed[gray];
    this.bitmap.data[idx] =
      this.bitmap.data[idx + 1] =
      this.bitmap.data[idx + 2] =
        newGray;
  });

  return newImage;
};

router.post("/exp", async (req, res) => {
  try {
    if (!req.body) throw new Error("No ha proporcionado una imagen");
    const image = await Jimp.read(req.body);

    const processedImage = await exponentialEqualization(image);

    const buffer = await processedImage.getBufferAsync(Jimp.MIME_JPEG);
    return res.status(200).send({ name: "exp", buffer: buffer });
  } catch (error) {
    return res.status(400).send(error.message);
  }
});

export default router;
