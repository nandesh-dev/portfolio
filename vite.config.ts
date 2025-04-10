import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
    plugins: [tailwindcss()],
    root: 'src/',
    build: {
        outDir: '../dist',
        emptyOutDir: true,
    },
    resolve: {
        extensions: ['.ts'],
        alias: {
            '@': path.resolve(__dirname, 'src/'),
        },
    },
    server: {
        port: 2011,
        allowedHosts: true,
    },
})
