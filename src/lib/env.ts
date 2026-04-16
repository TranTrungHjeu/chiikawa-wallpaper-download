const PUBLIC_ENV = {
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL?.trim() || "",
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || "",
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() || "",
} as const;

const SERVER_ENV = {
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || "",
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME?.trim() || "",
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY?.trim() || "",
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET?.trim() || "",
  TURNSTILE_SITE_KEY: process.env.TURNSTILE_SITE_KEY?.trim() || "",
  TURNSTILE_SECRET_KEY: process.env.TURNSTILE_SECRET_KEY?.trim() || "",
} as const;

const getEnv = (key: keyof typeof PUBLIC_ENV | keyof typeof SERVER_ENV) => {
  if (key in PUBLIC_ENV) {
    return PUBLIC_ENV[key as keyof typeof PUBLIC_ENV];
  }

  return SERVER_ENV[key as keyof typeof SERVER_ENV];
};

export function getSiteUrl() {
  return getEnv("NEXT_PUBLIC_SITE_URL") || "http://localhost:3000";
}

export function getSupabaseUrl() {
  return getEnv("NEXT_PUBLIC_SUPABASE_URL");
}

export function isPublicSupabaseConfigured() {
  return Boolean(
    getEnv("NEXT_PUBLIC_SUPABASE_URL") && getEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY")
  );
}

export function isServiceSupabaseConfigured() {
  return Boolean(isPublicSupabaseConfigured() && getEnv("SUPABASE_SERVICE_ROLE_KEY"));
}

export function isCloudinaryConfigured() {
  return Boolean(
    getEnv("CLOUDINARY_CLOUD_NAME") &&
      getEnv("CLOUDINARY_API_KEY") &&
      getEnv("CLOUDINARY_API_SECRET")
  );
}

export function isTurnstileConfigured() {
  return Boolean(getEnv("TURNSTILE_SITE_KEY") && getEnv("TURNSTILE_SECRET_KEY"));
}

export function getCloudinaryEnv() {
  const cloudName = getEnv("CLOUDINARY_CLOUD_NAME");
  const apiKey = getEnv("CLOUDINARY_API_KEY");
  const apiSecret = getEnv("CLOUDINARY_API_SECRET");

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Cloudinary environment variables are not configured.");
  }

  return { cloudName, apiKey, apiSecret };
}

export function getPublicSupabaseEnv() {
  const url = getEnv("NEXT_PUBLIC_SUPABASE_URL");
  const anonKey = getEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");

  if (!url || !anonKey) {
    throw new Error("Public Supabase environment variables are not configured.");
  }

  return { url, anonKey };
}

export function getServiceSupabaseEnv() {
  const { url } = getPublicSupabaseEnv();
  const serviceRoleKey = getEnv("SUPABASE_SERVICE_ROLE_KEY");

  if (!serviceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not configured.");
  }

  return { url, serviceRoleKey };
}

export function getTurnstileSecretKey() {
  const secretKey = getEnv("TURNSTILE_SECRET_KEY");

  if (!secretKey) {
    throw new Error("TURNSTILE_SECRET_KEY is not configured.");
  }

  return secretKey;
}

export function getTurnstileSiteKey() {
  return getEnv("TURNSTILE_SITE_KEY");
}
