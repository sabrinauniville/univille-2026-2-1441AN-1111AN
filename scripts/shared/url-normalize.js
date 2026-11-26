/**
 * Extrai a URL de mídia do HTML retornado pela API.
 * A API pode disponibilizar a mídia dentro de basic_html.
 */
export function extractMediaUrl(item) {
  if (!item.basic_html) {
    return null;
  }

  const videoSourceMatch = item.basic_html.match(
    /<source[^>]+src=["']([^"']+)["']/i,
  );

  if (videoSourceMatch) {
    return videoSourceMatch[1];
  }

  const videoMatch = item.basic_html.match(/<video[^>]+src=["']([^"']+)["']/i);

  if (videoMatch) {
    return videoMatch[1];
  }

  const imageMatch = item.basic_html.match(/<img[^>]+src=["']([^"']+)["']/i);

  return imageMatch?.[1] || null;
}

/**
 * Retorna somente URLs HTTP ou HTTPS válidas.
 */
export function getSafeMediaUrl(value) {
  if (!value) {
    return "";
  }

  try {
    const url = new URL(value);

    if (url.protocol === "https:" || url.protocol === "http:") {
      return url.href;
    }
  } catch {
    return "";
  }

  return "";
}
