import Jimp from "jimp";

export const gScale = async (req, res) => {
  try {
    if (!req.body) throw new Error("No se ha proporcionado un buffer");
    const image = await Jimp.read(req.body);
    const { width, height, data } = image.bitmap;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (width * y + x) * 4;
        const r = data[idx + 0];
        const g = data[idx + 1];
        const b = data[idx + 2];
        const a = data[idx + 3];

        const grey = (r + g + b) / 3;
        const greyInt = Math.round(grey);

        data[idx + 0] = greyInt;
        data[idx + 1] = greyInt;
        data[idx + 2] = greyInt;
        data[idx + 3] = a;
      }
    }
    const buffer = await image.getBufferAsync(Jimp.MIME_JPEG);
    res.status(200).send({ name: "greyScale", buffer: buffer });
  } catch (error) {
    return res.status(400).send({ message: error.message });
  }
};
