import { readFile, writeFile, mkdir } from "node:fs/promises";
import { basename, resolve } from "node:path";

const [countryInput, timezoneInput, outputInput] = process.argv.slice(2);
if (!countryInput || !timezoneInput || !outputInput) {
  throw new Error("Usage: node scripts/prepare-globe-geodata.mjs <countries.geojson> <timezones.geojson> <output-directory>");
}

const outputDirectory = resolve(outputInput);
await mkdir(outputDirectory, { recursive: true });

function simplifyLine(line, tolerance, latitudeScale) {
  if (line.length <= 4) return line;
  const keep = new Uint8Array(line.length);
  keep[0] = 1;
  keep[line.length - 1] = 1;
  const pending = [[0, line.length - 1]];

  while (pending.length) {
    const [startIndex, endIndex] = pending.pop();
    const start = line[startIndex];
    const end = line[endIndex];
    const startX = start[0] * latitudeScale;
    const endX = end[0] * latitudeScale;
    const dx = endX - startX;
    const dy = end[1] - start[1];
    const lengthSquared = dx * dx + dy * dy;
    let maxDistanceSquared = tolerance * tolerance;
    let maxIndex = -1;

    for (let index = startIndex + 1; index < endIndex; index += 1) {
      const point = line[index];
      const pointX = point[0] * latitudeScale;
      const px = pointX - startX;
      const py = point[1] - start[1];
      const projection = lengthSquared === 0 ? 0 : Math.max(0, Math.min(1, (px * dx + py * dy) / lengthSquared));
      const offsetX = pointX - (startX + projection * dx);
      const offsetY = point[1] - (start[1] + projection * dy);
      const distanceSquared = offsetX * offsetX + offsetY * offsetY;
      if (distanceSquared > maxDistanceSquared) {
        maxDistanceSquared = distanceSquared;
        maxIndex = index;
      }
    }

    if (maxIndex >= 0) {
      keep[maxIndex] = 1;
      pending.push([startIndex, maxIndex], [maxIndex, endIndex]);
    }
  }

  const simplified = line.filter((_, index) => keep[index]);
  return simplified.length >= 3 ? simplified : line;
}

function simplifyRing(ring, tolerance) {
  const open = ring.length > 1 && ring[0][0] === ring.at(-1)[0] && ring[0][1] === ring.at(-1)[1]
    ? ring.slice(0, -1)
    : ring;
  if (open.length <= 4) return open.map(roundPoint).concat([roundPoint(open[0])]);

  const origin = open[0];
  let split = 1;
  let farthest = -1;
  for (let index = 1; index < open.length; index += 1) {
    const dx = open[index][0] - origin[0];
    const dy = open[index][1] - origin[1];
    const distance = dx * dx + dy * dy;
    if (distance > farthest) {
      farthest = distance;
      split = index;
    }
  }

  const midLatitude = (origin[1] + open[split][1]) / 2;
  const latitudeScale = Math.max(0.05, Math.cos(midLatitude * Math.PI / 180));
  const firstHalf = simplifyLine(open.slice(0, split + 1), tolerance, latitudeScale);
  const secondHalf = simplifyLine([...open.slice(split), open[0]], tolerance, latitudeScale);
  const points = [...firstHalf.slice(0, -1), ...secondHalf.slice(0, -1)].map(roundPoint);
  if (points.length < 3) return open.map(roundPoint).concat([roundPoint(open[0])]);
  points.push(points[0]);
  return points;
}

function roundPoint(point) {
  return [Math.round(point[0] * 10000) / 10000, Math.round(point[1] * 10000) / 10000];
}

function mapGeometry(geometry, tolerance) {
  const sourcePolygons = geometry.type === "Polygon" ? [geometry.coordinates] : geometry.coordinates;
  return sourcePolygons.map((polygon) => polygon.map((ring) => simplifyRing(ring, tolerance)));
}

function getBounds(polygons) {
  let west = 180;
  let south = 90;
  let east = -180;
  let north = -90;
  for (const polygon of polygons) {
    for (const ring of polygon) {
      for (const [longitude, latitude] of ring) {
        west = Math.min(west, longitude);
        south = Math.min(south, latitude);
        east = Math.max(east, longitude);
        north = Math.max(north, latitude);
      }
    }
  }
  return [west, south, east, north];
}

function ringContains(longitude, latitude, ring) {
  let inside = false;
  for (let current = 0, previous = ring.length - 1; current < ring.length; previous = current, current += 1) {
    const [currentLongitude, currentLatitude] = ring[current];
    const [previousLongitude, previousLatitude] = ring[previous];
    if ((currentLatitude > latitude) !== (previousLatitude > latitude)
      && longitude < ((previousLongitude - currentLongitude) * (latitude - currentLatitude)) / (previousLatitude - currentLatitude) + currentLongitude) {
      inside = !inside;
    }
  }
  return inside;
}

function featureContains(longitude, latitude, feature) {
  return feature.p.some((polygon) => ringContains(longitude, latitude, polygon[0])
    && !polygon.slice(1).some((hole) => ringContains(longitude, latitude, hole)));
}

const countryCollection = JSON.parse(await readFile(resolve(countryInput), "utf8"));
const countries = countryCollection.features.flatMap((feature) => {
  if (!feature.geometry || !["Polygon", "MultiPolygon"].includes(feature.geometry.type)) return [];
  const polygons = mapGeometry(feature.geometry, 0.012);
  const properties = feature.properties ?? {};
  const iso = properties.ISO_A2_EH && properties.ISO_A2_EH !== "-99" ? properties.ISO_A2_EH : properties.ISO_A2;
  return [{ n: properties.ADMIN ?? properties.NAME ?? properties.NAME_EN, i: iso && iso !== "-99" ? iso : null, b: getBounds(polygons), p: polygons }];
});

const timezoneCollection = JSON.parse(await readFile(resolve(timezoneInput), "utf8"));
const timezones = timezoneCollection.features.flatMap((feature) => {
  if (!feature.geometry || !["Polygon", "MultiPolygon"].includes(feature.geometry.type)) return [];
  const polygons = mapGeometry(feature.geometry, 0.012);
  return [{ z: feature.properties?.tzid, b: getBounds(polygons), p: polygons }];
});

for (const timezone of timezones) {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: timezone.z });
  } catch {
    throw new Error(`Timezone boundary data contains an invalid IANA timezone identifier: ${timezone.z}`);
  }
}

const referenceLocations = [
  { point: [79.8612, 6.9271], country: "Sri Lanka", timezone: "Asia/Colombo" },
  { point: [88.3639, 22.5726], country: "India", timezone: "Asia/Kolkata" },
  { point: [-74.006, 40.7128], country: "United States", timezone: "America/New_York" },
  { point: [151.2093, -33.8688], country: "Australia", timezone: "Australia/Sydney" },
];
for (const { point: [longitude, latitude], country: expectedCountry, timezone: expectedTimezone } of referenceLocations) {
  const country = countries.find((feature) => featureContains(longitude, latitude, feature));
  const timezone = timezones.find((feature) => featureContains(longitude, latitude, feature));
  if (!country?.n?.includes(expectedCountry) || timezone?.z !== expectedTimezone) {
    throw new Error(`Geographic sample mismatch at ${longitude},${latitude}: ${country?.n ?? "no country"} / ${timezone?.z ?? "no timezone"}`);
  }
}

await Promise.all([
  writeFile(resolve(outputDirectory, "countries.json"), JSON.stringify({ v: 1, features: countries })),
  writeFile(resolve(outputDirectory, "timezones.json"), JSON.stringify({ v: 1, features: timezones })),
]);
console.log(`Prepared ${countries.length} country features and ${timezones.length} valid IANA timezone features; Colombo, Kolkata, New York, and Sydney lookup samples passed.`);
