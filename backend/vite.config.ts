import { defineConfig, UserConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import { VitePluginNode } from 'vite-plugin-node';
import path from 'path';
import { fileURLToPath } from 'url';

export default defineConfig(({ command }) => {
    const dirname = path.dirname(fileURLToPath(import.meta.url));
    const config: UserConfig = {
        resolve: {
            extensions: ['.ts', '.js', '.json'],
            alias: {
                '@': path.resolve(dirname, 'src'),
            },
        },
        build: {
            ssr: true,
            target: 'esnext',
            outDir: 'dist',
            rollupOptions: {
                input: 'src/server.ts',
                output: {
                    format: 'es',
                    entryFileNames: 'server.js',
                },
            },
        },
        plugins: [
            tsconfigPaths(),
        ],
        server: {
            port: 5010,
        },
    };

    if (command === 'serve') {
        config.plugins!.push(
            VitePluginNode({
                adapter: 'express',
                appPath: './src/server.ts',
                exportName: 'viteNodeApp',
            })
        );
    }

    return config;
});
