import { createHmac } from "crypto";

type ResizeType = "fit" | "fill" | "crop";

function encodeUrlCharacters(url: string) {
  const encodedUrl = url
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
  return encodedUrl;
}

function encodeUrl(data: Buffer | string) {
  if (Buffer.isBuffer(data)) {
    return encodeUrlCharacters(data.toString("base64"));
  }
  return encodeUrlCharacters(Buffer.from(data, "utf-8").toString("base64"));
}

function serialize(obj: { [key: string]: string }) {
  const keys = Object.keys(obj);
  if (keys.length === 0) {
    return "";
  }

  return keys
    .map((key) => {
      return `${key}:${obj[key]}`;
    })
    .join("/");
}

export function getImageURL(
  url: string,
  options?: {
    resize?: {
      type?: ResizeType;
      width?: number;
      height?: number;
      enlarge?: boolean;
    };
    gravity?: string;
    dpr?: number;
    blur?: number;
  }
) {
  if (
    process.env.IMGPROXY_URL === undefined ||
    process.env.IMGPROXY_KEY === undefined ||
    process.env.IMGPROXY_SALT === undefined
  ) {
    throw new Error("imgproxy environment variables are not set");
  }

  const { resize, gravity = "ce", dpr = 2, blur = 0 } = options || {};

  const imgOptions: { [key: string]: string } = {};

  // create resize part of the url
  const { type, width, height, enlarge = true } = resize || {};
  if (typeof resize !== "undefined") {
    imgOptions.rs = [type, width, height, enlarge ? 1 : 0].join(":");
  }

  imgOptions.g = gravity;
  imgOptions.dpr = dpr.toString();
  imgOptions.bl = blur.toString();

  const serializedOptions = serialize(imgOptions); // {key: "value"} --> "/key:value"
  const uri = `/${serializedOptions}/${encodeUrl(url)}`;

  const hmac = createHmac(
    "sha256",
    Buffer.from(process.env.IMGPROXY_KEY, "hex")
  );
  hmac.update(Buffer.from(process.env.IMGPROXY_SALT, "hex"));
  hmac.update(Buffer.from(uri));

  const signature = encodeUrl(hmac.digest().subarray(0, 32));

  const imgUrl = new URL(`${signature}${uri}`, process.env.IMGPROXY_URL);

  return imgUrl.toString();
}
