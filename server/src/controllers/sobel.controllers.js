import Jimp from "jimp";

export const sobel = async (req, res) => {
  const kernelX = [
    [-1, 0, 1],
    [-2, 0, 2],
    [-1, 0, 1],
  ];

  const kernelY = [
    [-1, -2, -1],
    [0, 0, 0],
    [1, 2, 1],
  ];

  try {
    if (!req.body) throw new Error("No se ha proporcionado un buffer");
    const image = await Jimp.read(req.body);
    const { width, height } = image.bitmap;

    const imageX = image.clone().convolute(kernelX);
    const imageY = image.clone().convolute(kernelY);

    image.scan(0, 0, width, height, function (x, y, idx) {
      const gx = imageX.bitmap.data[idx];
      const gy = imageY.bitmap.data[idx];

      const g = Math.sqrt(gx * gx + gy * gy);

      const value = Math.max(0, Math.min(255, g));

      this.bitmap.data[idx] = value;
      this.bitmap.data[idx + 1] = value;
      this.bitmap.data[idx + 2] = value;
      this.bitmap.data[idx + 3] = 255; 
    });

    const buffer = await image.getBufferAsync(Jimp.MIME_JPEG);
    return res.status(200).send({ name: "sobel", buffer: buffer });
  } catch (error) {
    return res.status(400).send({ message: error.message });
  }
};
