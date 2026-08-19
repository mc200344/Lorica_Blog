import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwind from "@astrojs/tailwind";
import { unified } from "@astrojs/markdown-remark";
import playformCompress from "@playform/compress";
import expressiveCode from "astro-expressive-code";
import icon from "astro-icon";
import { defineConfig } from "astro/config";
import rehypeExternalLinks from "rehype-external-links";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";

import { CODE_THEME, USER_SITE } from "./src/config.ts";

import updateConfig from "./src/integration/updateConfig.ts";

import { remarkReadingTime } from "./src/plugins/remark-reading-time";

// https://astro.build/config
export default defineConfig({
  site: USER_SITE,
  output: "static",
  style: {
    scss: {
      includePaths: ["./src/styles"],
    },
  },
  integrations: [updateConfig(), expressiveCode({
    themes: [CODE_THEME],
    styleOverrides: {
      borderRadius: "0.75rem",
    },
  }), mdx(), icon(), sitemap(), tailwind({
    configFile: "./tailwind.config.mjs",
  }), playformCompress()],
  markdown: {
    processor: unified({
      remarkPlugins: [remarkMath, remarkReadingTime],
      rehypePlugins: [
        rehypeKatex,
        [
          rehypeExternalLinks,
          {
            content: { type: "text", value: "↗" },
          },
        ],
      ],
    }),
  },
  vite: {
    server: {
      // Windows 下 Vite 文件监听遇到盘根系统文件（DumpStack.log.tmp 等）会抛 EINVAL 崩溃
      watch: {
        ignored: [
          (path) =>
            /(?:\\|\/)DumpStack\.log\.tmp$/.test(path) ||
            /(?:\\|\/)(?:hiberfil|pagefile|swapfile)\.sys$/i.test(path) ||
            /(?:System Volume Information|\\\$RECYCLE\.BIN)(?:\\|\/|$)/.test(path),
        ],
      },
    },
    plugins: [
      {
        // Windows 上 Vite 会额外监听盘根目录，Windows 崩溃转储写入
        // D:\DumpStack.log.tmp 时 chokidar 内部 lstat 抛 EINVAL，
        // 未处理的 'error' 事件会直接杀死 dev 服务器。这里接管该事件。
        name: "watch-error-guard",
        configureServer(server) {
          server.watcher.on("error", (err) => {
            const code = err && err.code;
            const path = err && err.path;
            if (code === "EINVAL" && /(?:DumpStack\.log\.tmp|(?:hiberfil|pagefile|swapfile)\.sys)$/i.test(String(path))) {
              console.warn(`[watcher] 忽略瞬态系统文件错误: ${path}`);
              return;
            }
            console.error("[watcher error]", err);
          });
        },
      },
    ],
    css: {
      preprocessorOptions: {
        scss: {
          api: "modern-compiler",
        },
      },
    },
  },
});
