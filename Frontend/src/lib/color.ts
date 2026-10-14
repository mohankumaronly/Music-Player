/**
 * Extract dominant colors from an image URL via canvas.
 * Returns two RGB strings useful for ambient gradients.
 *
 * Falls back to a hash-derived color if the image is cross-origin
 * without CORS headers, or if loading fails.
 */
export interface AmbientColors {
  a: string;
  b: string;
  c: string;
}

function fallback(seed: string): AmbientColors {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  const hue = Math.abs(h) % 360;
  return {
    a: `hsl(${hue} 70% 55%)`,
    b: `hsl(${(hue + 45) % 360} 70% 50%)`,
    c: `hsl(${(hue + 90) % 360} 70% 45%)`,
  };
}

export async function extractAmbientColors(
  imageUrl: string | null | undefined,
  seed: string
): Promise<AmbientColors> {
  if (!imageUrl) return fallback(seed);

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.decoding = "async";

    const timeout = setTimeout(() => resolve(fallback(seed)), 4000);

    img.onload = () => {
      clearTimeout(timeout);
      try {
        const size = 32;
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) return resolve(fallback(seed));

        ctx.drawImage(img, 0, 0, size, size);
        const { data } = ctx.getImageData(0, 0, size, size);

        // Bucket pixels by coarse hue and pick top 3 distinct buckets
        const buckets = new Map<number, { r: number; g: number; b: number; n: number }>();
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const a = data[i + 3];
          if (a < 128) continue;

          // Skip near-black and near-white
          const max = Math.max(r, g, b);
          const min = Math.min(r, g, b);
          if (max < 30 || min > 235) continue;

          const key = Math.floor((r + g + b) / 96); // coarse 8-bucket
          const prev = buckets.get(key) ?? { r: 0, g: 0, b: 0, n: 0 };
          prev.r += r;
          prev.g += g;
          prev.b += b;
          prev.n += 1;
          buckets.set(key, prev);
        }

        const sorted = [...buckets.values()]
          .sort((x, y) => y.n - x.n)
          .slice(0, 3);

        if (sorted.length === 0) return resolve(fallback(seed));

        const colors = sorted.map(({ r, g, b, n }) => {
          const rr = Math.round(r / n);
          const gg = Math.round(g / n);
          const bb = Math.round(b / n);
          return `rgb(${rr} ${gg} ${bb})`;
        });

        while (colors.length < 3) colors.push(colors[0]);

        resolve({ a: colors[0], b: colors[1], c: colors[2] });
      } catch {
        resolve(fallback(seed));
      }
    };

    img.onerror = () => {
      clearTimeout(timeout);
      resolve(fallback(seed));
    };

    img.src = imageUrl;
  });
}