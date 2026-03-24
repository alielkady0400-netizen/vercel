

"use client"; // Needed for Next.js 13+ page.tsx

import { useState } from "react";

export default function DoorGeneratorPage() {
  const [apiKey, setApiKey] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [mask, setMask] = useState<File | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [timeOfDay, setTimeOfDay] = useState("golden hour");
  const [weather, setWeather] = useState("sunny");
  const [houseStyle, setHouseStyle] = useState("modern");
  const [angle, setAngle] = useState("front view");

  const handleGenerate = async () => {
    if (!apiKey || !image || !mask) {
      alert("Add API key, image, and mask image");
      return;
    }

    setLoading(true);

    const toBase64 = (file: File) =>
      new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result!.toString().split(",")[1]);
      });

    const base64Image = await toBase64(image);
    const base64Mask = await toBase64(mask);

    const prompt = `A realistic ${houseStyle} house exterior, ${angle}, ${timeOfDay} lighting, ${weather} weather. Keep the door EXACTLY as it is, do not change the door, generate surroundings only, ultra realistic real estate photography`;

    try {
      const res = await fetch("https://api.openai.com/v1/images/edits", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-image-1",
          prompt,
          image: base64Image,
          mask: base64Mask,
          size: "1024x1024",
        }),
      });

      const data = await res.json();
      setResult(`data:image/png;base64,${data.data[0].b64_json}`);
    } catch (err) {
      console.error(err);
      alert("Error generating image");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-xl">
        <h1 className="text-2xl font-bold mb-4">Door Image Generator</h1>

        <input
          type="password"
          placeholder="OpenAI API Key"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          className="border p-2 w-full mb-4 rounded"
        />

        <div className="grid grid-cols-2 gap-3 mb-4">
          <select value={timeOfDay} onChange={(e) => setTimeOfDay(e.target.value)} className="border p-2 rounded">
            <option>golden hour</option>
            <option>daytime</option>
            <option>night</option>
          </select>

          <select value={weather} onChange={(e) => setWeather(e.target.value)} className="border p-2 rounded">
            <option>sunny</option>
            <option>rainy</option>
            <option>snowy</option>
          </select>

          <select value={houseStyle} onChange={(e) => setHouseStyle(e.target.value)} className="border p-2 rounded">
            <option>modern</option>
            <option>victorian</option>
            <option>suburban</option>
          </select>

          <select value={angle} onChange={(e) => setAngle(e.target.value)} className="border p-2 rounded">
            <option>front view</option>
            <option>angled view</option>
            <option>close up</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block mb-1">Door Image</label>
          <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files![0])} />
        </div>

        <div className="mb-4">
          <label className="block mb-1">Mask Image</label>
          <input type="file" accept="image/*" onChange={(e) => setMask(e.target.files![0])} />
        </div>

        <button onClick={handleGenerate} className="w-full bg-black text-white py-2 rounded">
          {loading ? "Generating..." : "Generate Image"}
        </button>

        {result && (
          <div className="mt-6">
            <h2 className="font-semibold">Result</h2>
            <img src={result} alt="Generated" className="mt-2 rounded" />
          </div>
        )}
      </div>
    </div>
  );
}