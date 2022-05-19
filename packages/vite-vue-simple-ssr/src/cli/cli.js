#!/bin/sh
':' //# comment; exec /usr/bin/env node  --no-warnings --experimental-loader=@mrx-media/vite-vue-simple-ssr/loader --experimental-json-modules --noharmony "$0" "$@"

const { execute } = await import('./program');

execute();
