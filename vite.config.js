import { defineConfig } from 'vite'

export default defineConfig({
    // Server configuration
    server: {
        port: 3000,
        open: '/index.html', // Auto-open Splash Screen
        host: true
    },

    // Build configuration
    build: {
        outDir: 'dist',
        assetsDir: 'assets',
        emptyOutDir: true,
        rollupOptions: {
            input: {
                main: 'index.html',
                focustime: 'focustime.html',
                settings: 'settings.html',
                'password-vault': 'password-vault.html',
                utilities: 'utilities.html',
                'text-tools': 'text-tools.html',
                'image-tools': 'image-tools.html',
                'network-tools': 'network-tools.html',
                'quick-notes': 'quick-notes.html',
                'qr-generator': 'qr-generator.html',
                calculator: 'calculator.html',
                'todo-list': 'todo-list.html',
                'module-library': 'module-library.html',
                'cpu-monitor': 'cpu-monitor.html',
                'world-clock': 'world-clock.html',
                'unit-converter': 'unit-converter.html',
                'json-validator': 'json-validator.html',
                'network-map': 'network-map.html',
                'web-terminal': 'web-terminal.html',
                'quick-deploy': 'quick-deploy.html',
                'network-scan': 'network-scan.html',
                'clean-cache': 'clean-cache.html',
                'pixel-crusher': 'pixel-crusher.html',
                'color-library': 'color-library.html'
            }
        }
    },

    // Base path
    base: './'
})
