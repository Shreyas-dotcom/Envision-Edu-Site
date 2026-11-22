import { HtmlBasePlugin } from "@11ty/eleventy";
import fs from "node:fs";

// Image manifest: maps a Wix media id (e.g. "1dfaf6_53881bbb...") to the
// resized web copy in src/assets/img/wix/ plus its pixel size.
const manifest = JSON.parse(fs.readFileSync("src/assets/img/manifest.json", "utf8"));

const slugify = (s) => String(s).toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export default function (eleventyConfig) {
  // Lets the site work both at https://<user>.github.io/<repo>/ and on the custom domain.
  eleventyConfig.addPlugin(HtmlBasePlugin);

  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });
  eleventyConfig.addPassthroughCopy("src/CNAME");
  eleventyConfig.addWatchTarget("src/_data/");
  eleventyConfig.ignores.add("src/assets/**");

  // {{ "1dfaf6_53881bbb8f3c40e9afc9b595befefd14" | img }} -> /assets/img/wix/<file>
  // Anything starting with "/" is already a path (e.g. "/assets/img/new-photo.jpg") and is used as is.
  eleventyConfig.addFilter("img", (id) => {
    if (String(id).startsWith("/")) return id;
    const key = String(id).split("~")[0].split(".")[0];
    const hit = manifest[key];
    if (!hit) throw new Error(`Unknown image id: ${id}`);
    return `/assets/img/wix/${hit.file}`;
  });
  // width/height attributes so the page doesn't jump while photos load
  eleventyConfig.addFilter("imgSize", (id) => {
    const hit = manifest[String(id).split("~")[0].split(".")[0]];
    return hit ? `width="${hit.w}" height="${hit.h}"` : "";
  });

  // Small copy for grids (720px, made from the web copy): /assets/img/thumbs/<id>.jpg
  eleventyConfig.addFilter("thumb", (id) => {
    if (String(id).startsWith("/")) return id;
    const key = String(id).split("~")[0].split(".")[0];
    if (!manifest[key]) throw new Error(`Unknown image id: ${id}`);
    return `/assets/img/thumbs/${key}.jpg`;
  });

  // Every photo used in the given posts, in order of appearance.
  eleventyConfig.addFilter("postImages", (posts) => {
    const ids = [];
    for (const p of posts) {
      const raw = fs.readFileSync(p.inputPath, "utf8");
      // Wix photos by id; photos added later by their path
      for (const m of raw.matchAll(/\/assets\/img\/(?:wix\/([0-9a-z]+_[0-9a-f]{32})[^"')\s]*|(?!wix\/|thumbs\/)[^"')\s]+\.(?:jpe?g|png|webp|gif))/gi))
        ids.push(m[1] || m[0]);
    }
    return ids;
  });
  eleventyConfig.addFilter("unique", (arr) => [...new Set(arr)]);
  eleventyConfig.addFilter("withoutCategory", (posts) => posts.filter((p) => !(p.data.categories || []).length));
  eleventyConfig.addFilter("bySlug", (arr, slug) => arr.find((x) => x.slug === slug));

  const fmt = (d, opts) => new Date(d).toLocaleDateString("en-US", { timeZone: "UTC", ...opts });
  eleventyConfig.addFilter("longDate", (d) => fmt(d, { month: "short", day: "numeric", year: "numeric" }));
  eleventyConfig.addFilter("isoDate", (d) => new Date(d).toISOString().slice(0, 10));
  eleventyConfig.addFilter("slug", slugify);
  eleventyConfig.addFilter("year", () => new Date().getFullYear());
  eleventyConfig.addFilter("withCategory", (posts, cat) => posts.filter((p) => (p.data.categories || []).includes(cat)));
  eleventyConfig.addFilter("head", (arr, n) => arr.slice(0, n));
  eleventyConfig.addFilter("exclude", (posts, url) => posts.filter((p) => p.url !== url));

  eleventyConfig.addCollection("posts", (api) =>
    api.getFilteredByGlob("src/posts/*.md").sort((a, b) => b.date - a.date)
  );

  return {
    // Set by the GitHub Pages workflow; "/" once the custom domain is connected.
    pathPrefix: process.env.PATH_PREFIX || "/",
    dir: { input: "src", includes: "_includes", data: "_data", output: "_site" },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    templateFormats: ["njk", "md", "html"],
  };
}
