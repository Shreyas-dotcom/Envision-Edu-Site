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
  eleventyConfig.ignores.add("src/assets/**");

  // {{ "1dfaf6_53881bbb8f3c40e9afc9b595befefd14" | img }} -> /assets/img/wix/<file>
  eleventyConfig.addFilter("img", (id) => {
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
