import { defineConfig } from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";
import { pluginQRCode } from "@lynx-js/qrcode-rsbuild-plugin";

import path from "node:path";
import { fileURLToPath } from "node:url";
import os from "os";
import chalk from "chalk";
import fs from "node:fs";
import qrcode from "qrcode-terminal";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper function to get network interfaces
function getNetworkInterfaces() {
  const interfaces = os.networkInterfaces();
  const addresses: string[] = [];

  for (const name of Object.keys(interfaces)) {
    const networkInterface = interfaces[name];
    if (networkInterface) {
      for (const iface of networkInterface) {
        // Skip internal and non-IPv4 addresses
        if (iface.family === "IPv4" && !iface.internal) {
          addresses.push(iface.address);
        }
      }
    }
  }

  return addresses;
}

// Create a custom plugin that adds QR code and URLs
function pluginEnhancedUrls() {
  return {
    name: "plugin-enhanced-urls",
    setup(api) {
      api.onDevCompileDone(({ isFirstCompile }) => {
        if (isFirstCompile) {
          const port = 3000;
          const networkInterfaces = getNetworkInterfaces();
          const mainIp = networkInterfaces[0] || "192.168.50.131";
          const mainUrl = `http://${mainIp}:${port}/?fullscreen=true`;

          // Write to a file first
          const urlContent = [
            "🚀 RSBuild Server ready!",
            "",
            `➜  Local:   http://localhost:${port}/`,
            ...networkInterfaces.map(
              (ip) => `➜  Network: http://${ip}:${port}/`
            ),
            "",
            "Scan this QR code to open on your mobile device:",
            "",
          ].join("\n");

          const urlFilePath = path.join(__dirname, "server-urls.txt");
          fs.writeFileSync(urlFilePath, urlContent, "utf8");

          // Wait for RSBuild's own output to complete, then show our enhanced output
          setTimeout(() => {
            console.log("\n\n");
            console.log(chalk.green("🚀 RSBuild Server ready!"));
            console.log("");
            console.log(chalk.cyan(`➜  Local:   http://localhost:${port}/`));
            networkInterfaces.forEach((ip) => {
              console.log(chalk.cyan(`➜  Network: http://${ip}:${port}/`));
            });
            console.log("");

            // Display QR code directly in terminal
            console.log(
              chalk.yellow("Scan this QR code to open on your mobile device:")
            );
            qrcode.generate(mainUrl, { small: true });
            console.log("");

            console.log(
              chalk.green("To use with Lynx Explorer, scan this QR code:")
            );
            console.log(
              chalk.cyan(
                `This URL includes the fullscreen parameter: ${mainUrl}`
              )
            );
            console.log("");

            console.log(
              chalk.yellow(
                "URLs not showing correctly? Run this command in a separate terminal:"
              )
            );
            console.log(chalk.cyan(`cat ${urlFilePath}`));
            console.log("\n");
          }, 500);
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [
    pluginReact(),
    // Configure QR code plugin to NOT display automatically
    pluginQRCode({
      schema() {
        const networkInterfaces = getNetworkInterfaces();
        const hostname = networkInterfaces[0] || "192.168.50.131";
        const port = 3000;
        return `http://${hostname}:${port}/?fullscreen=true`;
      },
    }),
    // Use our enhanced URL + QR code plugin instead
    pluginEnhancedUrls(),
  ],
  server: {
    host: "0.0.0.0",
    port: 3000,
    publicDir: [
      {
        name: path.join(__dirname, "public"),
      },
    ],
  },
  source: {
    entry: {
      index: "./src/index.jsx",
    },
  },
  dev: {
    writeToDisk: false,
    liveReload: true,
    client: {
      overlay: false,
    },
  },
  tools: {
    rspack: {
      stats: "errors-only",
    },
  },
});
