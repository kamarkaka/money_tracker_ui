import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	server: {
        host: '0.0.0.0',
        port: process.env.VITE_UI_PORT
    }
});
