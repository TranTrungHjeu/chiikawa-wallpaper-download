import { describe, expect, it } from "vitest";

import {
  dedupeParsedAssets,
  extractLastPageNumber,
  parseAssetCards,
} from "@/lib/chiikawa/parser";

const sampleHtml = `
  <div class="wallpaper-item mobile-item" data-id="514">
    <img
      src="https://r2.chiikawa-wallpaper.com/example-300.png"
      alt="Chiikawa trên thảm hồng"
      srcset="https://r2.chiikawa-wallpaper.com/example-300.png 1x, https://r2.chiikawa-wallpaper.com/example.png 2x"
    />
    <span>Featured</span>
    <span>4K</span>
    <button class="download-btn" data-file-name="https://r2.chiikawa-wallpaper.com/example.png"></button>
  </div>
  <ul class="pagination">
    <li><a href="/mobile?sort=latest&amp;page=2">2</a></li>
    <li><a href="/mobile?sort=latest&amp;page=10">10</a></li>
  </ul>
`;

const gifFallbackHtml = `
  <div class="wallpaper-item gif-item" data-id="675">
    <img
      src="https://r2.chiikawa-wallpaper.com/wallpaper/gif/7da9fb9c1c7559e1538bfa600f39ca45.gif"
      alt="GIF Chiikawa chớp mắt và vẫy tay"
    />
  </div>
  <ul class="pagination">
    <li><a href="/gif?page=2">2</a></li>
    <li><a href="/gif?page=11">11</a></li>
  </ul>
`;

describe("chiikawa parser", () => {
  it("parses asset cards from SSR html", () => {
    const assets = parseAssetCards(sampleHtml, "mobile");

    expect(assets).toHaveLength(1);
    expect(assets[0]).toMatchObject({
      sourceId: "514",
      kind: "mobile",
      title: "Chiikawa trên thảm hồng",
      originalUrl: "https://r2.chiikawa-wallpaper.com/example.png",
      featured: true,
      resolutionTag: "4K",
    });
    expect(assets[0].srcSet).toContain(
      "https://r2.chiikawa-wallpaper.com/example-300.png"
    );
  });

  it("extracts last page number from pagination links", () => {
    expect(extractLastPageNumber(sampleHtml, "mobile")).toBe(10);
  });

  it("dedupes repeated assets", () => {
    const parsed = parseAssetCards(sampleHtml, "mobile");
    const deduped = dedupeParsedAssets([...parsed, ...parsed]);

    expect(deduped).toHaveLength(1);
  });

  it("falls back to image src when gif cards have no download button", () => {
    const assets = parseAssetCards(gifFallbackHtml, "gif");

    expect(assets).toHaveLength(1);
    expect(assets[0]).toMatchObject({
      sourceId: "675",
      kind: "gif",
      title: "GIF Chiikawa chớp mắt và vẫy tay",
      originalUrl:
        "https://r2.chiikawa-wallpaper.com/wallpaper/gif/7da9fb9c1c7559e1538bfa600f39ca45.gif",
    });
    expect(extractLastPageNumber(gifFallbackHtml, "gif")).toBe(11);
  });
});
