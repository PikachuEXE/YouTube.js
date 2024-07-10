var _Cache_persistent_directory, _Cache_persistent;
import { __awaiter, __classPrivateFieldGet, __classPrivateFieldSet } from "tslib";
import { Platform } from '../utils/Utils.js';
import evaluate from './jsruntime/jinter.js';
import sha1Hash from './polyfills/web-crypto.js';
const { homepage, version, bugs } = { "homepage": "https://github.com/LuanRT/YouTube.js#readme", "version": "9.4.0", "bugs": { "url": "https://github.com/LuanRT/YouTube.js/issues" } };
const repo_url = homepage === null || homepage === void 0 ? void 0 : homepage.split('#')[0];
class Cache {
    constructor(persistent = false, persistent_directory) {
        _Cache_persistent_directory.set(this, void 0);
        _Cache_persistent.set(this, void 0);
        __classPrivateFieldSet(this, _Cache_persistent_directory, persistent_directory || '', "f");
        __classPrivateFieldSet(this, _Cache_persistent, persistent, "f");
    }
    get cache_dir() {
        return __classPrivateFieldGet(this, _Cache_persistent, "f") ? __classPrivateFieldGet(this, _Cache_persistent_directory, "f") : '';
    }
    get(key) {
        return __awaiter(this, void 0, void 0, function* () {
            const cache = yield caches.open('yt-api');
            const response = yield cache.match(key);
            if (!response)
                return undefined;
            return response.arrayBuffer();
        });
    }
    set(key, value) {
        return __awaiter(this, void 0, void 0, function* () {
            const cache = yield caches.open('yt-api');
            cache.put(key, new Response(value));
        });
    }
    remove(key) {
        return __awaiter(this, void 0, void 0, function* () {
            const cache = yield caches.open('yt-api');
            yield cache.delete(key);
        });
    }
}
_Cache_persistent_directory = new WeakMap(), _Cache_persistent = new WeakMap();
Platform.load({
    runtime: 'cf-worker',
    info: {
        version: version,
        bugs_url: (bugs === null || bugs === void 0 ? void 0 : bugs.url) || `${repo_url}/issues`,
        repo_url
    },
    server: true,
    Cache: Cache,
    sha1Hash,
    uuidv4() {
        return crypto.randomUUID();
    },
    eval: evaluate,
    fetch: fetch.bind(globalThis),
    Request: Request,
    Response: Response,
    Headers: Headers,
    FormData: FormData,
    File: File,
    ReadableStream: ReadableStream,
    CustomEvent: CustomEvent
});
export * from './lib.js';
import Innertube from './lib.js';
export default Innertube;
//# sourceMappingURL=cf-worker.js.map