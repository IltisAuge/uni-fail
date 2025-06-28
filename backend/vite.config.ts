import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import { VitePluginNode } from 'vite-plugin-node';
import path from 'path';

export default defineConfig({
    resolve: {
        extensions: ['.ts', '.js', '.json'],
        alias: {
            '@': path.resolve(__dirname, 'src'),
        },
    },
    build: {
        outDir: 'dist',
        rollupOptions: {
            input: 'src/server.ts',
            output: {
                entryFileNames: 'server.js',
            },
        },
    },
    plugins: [
        tsconfigPaths(),
        VitePluginNode({
            adapter: 'express',
            appPath: './src/server.ts',
            exportName: 'viteNodeApp',
        }),
    ],
    server: {
        port: 5010,
    },
});
