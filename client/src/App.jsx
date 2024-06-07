import { useEffect, useRef, useState } from "react";
import {
  Chart,
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
} from "chart.js";

Chart.register(
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip
);
import "./App.css";

function App() {
  const [image, setImage] = useState(null);
  const [imageURL, setImageURL] = useState(null);
  const imagesMap = useRef(new Map());
  const histogramRef = useRef(null);

  useEffect(() => {
    if (image) {
      imagesMap.current.set(image.name, image.buffer);
      const blob = new Blob([image.buffer], { type: "image/jpeg" });
      setImageURL(URL.createObjectURL(blob));

      // Generate the histogram
      const ctx = histogramRef.current.getContext("2d");
      const imageElement = new Image();
      imageElement.src = URL.createObjectURL(blob);
      imageElement.onload = () => {
        const canvas = document.createElement("canvas");
        const canvasContext = canvas.getContext("2d");
        canvas.width = imageElement.width;
        canvas.height = imageElement.height;
        canvasContext.drawImage(
          imageElement,
          0,
          0,
          canvas.width,
          canvas.height
        );
        const imageData = canvasContext.getImageData(
          0,
          0,
          canvas.width,
          canvas.height
        );
        const data = imageData.data;

        const histogramData = new Array(256).fill(0);
        for (let i = 0; i < data.length; i += 4) {
          const brightness = Math.round(
            (data[i] + data[i + 1] + data[i + 2]) / 3
          );
          histogramData[brightness]++;
        }

        if (ctx.chart) {
          ctx.chart.destroy();
        }

        ctx.chart = new Chart(ctx, {
          type: "bar",
          data: {
            labels: Array.from({ length: 256 }, (_, i) => i),
            datasets: [
              {
                label: "Cantidad de pixeles",
                data: histogramData,
                backgroundColor: "rgba(75, 192, 192, 0.2)",
                borderColor: "rgba(75, 192, 192, 1)",
                borderWidth: 1,
              },
            ],
          },
          options: {
            scales: {
              y: {
                beginAtZero: true,
              },
            },
          },
        });
      };
    }
  }, [image]);

  function handleImageChange(e) {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = async function (e) {
      const arrayBuffer = e.target.result;
      setImage({ name: file.name, buffer: arrayBuffer });
    };
    reader.readAsArrayBuffer(file);
  }

  async function exec(route, buffer) {
    try {
      const request = await fetch("/server/" + route, {
        method: "POST",
        headers: { "Content-Type": "application/octet-stream" },
        body: buffer,
      });
      const {
        name,
        buffer: { data },
      } = await request.json();
      const newBuffer = new Uint8Array(data);
      console.log(newBuffer);
      setImage({ name: name, buffer: newBuffer });
    } catch (error) {
      throw new Error(error.message);
    }
  }

  function handleImageSelectChange(e) {
    if (e.target.value !== null) {
      const image = {
        name: e.target.value,
        buffer: imagesMap.current.get(e.target.value),
      };
      setImage(image);
    }
  }

  return (
    <div className="app">
      <div className="header">
        <button onClick={() => exec("gscale", image.buffer)}>
          Escala de grises
        </button>
        <button onClick={() => exec("sobel", image.buffer)}>
          Filtro de sobel
        </button>
        <button onClick={(e) => exec("exp", image.buffer)}>
          Ecualizacion Exponencial
        </button>
        <button onClick={(e) => exec("prom", image.buffer)}>
          Filtro Promedio
        </button>
        <button onClick={(e) => exec("pasob", image.buffer)}>Paso Bajas</button>
        <button onClick={(e) => exec("pasoa", image.buffer)}>Paso Altas</button>
        <button>No lineales</button>
        <select
          name="imageSelector"
          id="imageSelector"
          onChange={(e) => handleImageSelectChange(e)}
        >
          <option value={null}>Seleccione una Imagen</option>
          {Array.from(imagesMap.current.entries()).map(([key], index) => (
            <option key={index} value={key}>
              {key}
            </option>
          ))}
        </select>
      </div>
      <div className="holder">
        <img
          src={!imageURL ? "default.svg" : imageURL}
          alt="image"
          width="500px"
          height="300px"
        />
        {!image ? (
          <img src="chart.svg" alt="" srcset="" width="500px" height="300px" />
        ) : (
          <canvas
            id="histograma"
            ref={histogramRef}
            width="500px"
            height="300px"
          ></canvas>
        )}
      </div>

      <input
        type="file"
        accept="image/*"
        onChange={(e) => handleImageChange(e)}
        style={{ alignSelf: "flex-end" }}
      />
    </div>
  );
}

export default App;
