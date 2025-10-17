const VERCEL_ENV = process.env.VERCEL_ENV || "";
const VERCEL_URL = process.env.VERCEL_URL || "";
const VERCEL_BRANCH_URL = process.env.VERCEL_BRANCH_URL || "";
const VERCEL_PROJECT_PRODUCTION_URL = (
  process.env.VERCEL_PROJECT_PRODUCTION_URL || ""
);


const LOCAL_URL = "http://localhost:3000";

const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY || "";
if (INTERNAL_API_KEY === "") {
  throw new Error("INTERNAL_API_KEY env var missing");
}


const BASE_URL = (function () {
  if (VERCEL_ENV === "production") {
    if (process.env.NEXT_PUBLIC_APP_URL) {
      return process.env.NEXT_PUBLIC_APP_URL;
    } else {
      return `https://${VERCEL_PROJECT_PRODUCTION_URL}`;
    }
  } else if (VERCEL_URL !== "") {
    return `https://${VERCEL_URL}`;
  } else {
    return LOCAL_URL;
  }
}());

const ALLOWED_ORIGINS = (function () {
  if (VERCEL_ENV === "production") {
    const vercel_url =`https://${VERCEL_PROJECT_PRODUCTION_URL}`;
    const public_url = process.env.NEXT_PUBLIC_APP_URL || "";
    if (public_url === "" || vercel_url === public_url) {
      return [vercel_url];
    } else {
      return [vercel_url, public_url];
    }
  } else {
    return [
      `https://${VERCEL_URL}`,
      `https://${VERCEL_BRANCH_URL}`,
      LOCAL_URL
    ]
  }
}());

export {
  BASE_URL,
  ALLOWED_ORIGINS,
  INTERNAL_API_KEY
};

export default {
  BASE_URL,
  ALLOWED_ORIGINS
}
