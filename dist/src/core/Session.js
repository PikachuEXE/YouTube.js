var _a, _Session_api_version, _Session_key, _Session_context, _Session_account_index, _Session_player, _Session_getVisitorID, _Session_retrieveSessionData, _Session_generateSessionData;
import { __awaiter, __classPrivateFieldGet, __classPrivateFieldSet } from "tslib";
import OAuth from './OAuth.js';
import { Log, EventEmitter, HTTPClient } from '../utils/index.js';
import * as Constants from '../utils/Constants.js';
import * as Proto from '../proto/index.js';
import Actions from './Actions.js';
import Player from './Player.js';
import { generateRandomString, getRandomUserAgent, InnertubeError, Platform, SessionError } from '../utils/Utils.js';
export var ClientType;
(function (ClientType) {
    ClientType["WEB"] = "WEB";
    ClientType["KIDS"] = "WEB_KIDS";
    ClientType["MUSIC"] = "WEB_REMIX";
    ClientType["IOS"] = "iOS";
    ClientType["ANDROID"] = "ANDROID";
    ClientType["ANDROID_MUSIC"] = "ANDROID_MUSIC";
    ClientType["ANDROID_CREATOR"] = "ANDROID_CREATOR";
    ClientType["TV_EMBEDDED"] = "TVHTML5_SIMPLY_EMBEDDED_PLAYER";
})(ClientType || (ClientType = {}));
/**
 * Represents an InnerTube session. This holds all the data needed to make requests to YouTube.
 */
class Session extends EventEmitter {
    constructor(context, api_key, api_version, account_index, player, cookie, fetch, cache) {
        super();
        _Session_api_version.set(this, void 0);
        _Session_key.set(this, void 0);
        _Session_context.set(this, void 0);
        _Session_account_index.set(this, void 0);
        _Session_player.set(this, void 0);
        __classPrivateFieldSet(this, _Session_context, context, "f");
        __classPrivateFieldSet(this, _Session_account_index, account_index, "f");
        __classPrivateFieldSet(this, _Session_key, api_key, "f");
        __classPrivateFieldSet(this, _Session_api_version, api_version, "f");
        __classPrivateFieldSet(this, _Session_player, player, "f");
        this.http = new HTTPClient(this, cookie, fetch);
        this.actions = new Actions(this);
        this.oauth = new OAuth(this);
        this.logged_in = !!cookie;
        this.cache = cache;
    }
    on(type, listener) {
        super.on(type, listener);
    }
    once(type, listener) {
        super.once(type, listener);
    }
    static create() {
        return __awaiter(this, arguments, void 0, function* (options = {}) {
            const { context, api_key, api_version, account_index } = yield _a.getSessionData(options.lang, options.location, options.account_index, options.visitor_data, options.enable_safety_mode, options.generate_session_locally, options.device_category, options.client_type, options.timezone, options.fetch, options.on_behalf_of_user);
            return new _a(context, api_key, api_version, account_index, options.retrieve_player === false ? undefined : yield Player.create(options.cache, options.fetch), options.cookie, options.fetch, options.cache);
        });
    }
    static getSessionData() {
        return __awaiter(this, arguments, void 0, function* (lang = '', location = '', account_index = 0, visitor_data = '', enable_safety_mode = false, generate_session_locally = false, device_category = 'desktop', client_name = ClientType.WEB, tz = Intl.DateTimeFormat().resolvedOptions().timeZone, fetch = Platform.shim.fetch, on_behalf_of_user) {
            let session_data;
            const session_args = { lang, location, time_zone: tz, device_category, client_name, enable_safety_mode, visitor_data, on_behalf_of_user };
            Log.info(_a.TAG, 'Retrieving InnerTube session.');
            if (generate_session_locally) {
                session_data = __classPrivateFieldGet(this, _a, "m", _Session_generateSessionData).call(this, session_args);
            }
            else {
                try {
                    // This can fail if the data changes or the request is blocked for some reason.
                    session_data = yield __classPrivateFieldGet(this, _a, "m", _Session_retrieveSessionData).call(this, session_args, fetch);
                }
                catch (err) {
                    Log.error(_a.TAG, 'Failed to retrieve session data from server. Will try to generate it locally.');
                    session_data = __classPrivateFieldGet(this, _a, "m", _Session_generateSessionData).call(this, session_args);
                }
            }
            Log.info(_a.TAG, 'Got session data.\n', session_data);
            return Object.assign(Object.assign({}, session_data), { account_index });
        });
    }
    signIn(credentials) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                const error_handler = (err) => reject(err);
                this.once('auth', (data) => {
                    this.off('auth-error', error_handler);
                    if (data.status === 'SUCCESS') {
                        this.logged_in = true;
                        resolve();
                    }
                    reject(data);
                });
                this.once('auth-error', error_handler);
                try {
                    yield this.oauth.init(credentials);
                    if (this.oauth.validateCredentials()) {
                        yield this.oauth.refreshIfRequired();
                        this.logged_in = true;
                        resolve();
                    }
                }
                catch (err) {
                    reject(err);
                }
            }));
        });
    }
    /**
     * Signs out of the current account and revokes the credentials.
     */
    signOut() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.logged_in)
                throw new InnertubeError('You must be signed in to perform this operation.');
            const response = yield this.oauth.revokeCredentials();
            this.logged_in = false;
            return response;
        });
    }
    /**
     * InnerTube API key.
     */
    get key() {
        return __classPrivateFieldGet(this, _Session_key, "f");
    }
    /**
     * InnerTube API version.
     */
    get api_version() {
        return __classPrivateFieldGet(this, _Session_api_version, "f");
    }
    get client_version() {
        return __classPrivateFieldGet(this, _Session_context, "f").client.clientVersion;
    }
    get client_name() {
        return __classPrivateFieldGet(this, _Session_context, "f").client.clientName;
    }
    get account_index() {
        return __classPrivateFieldGet(this, _Session_account_index, "f");
    }
    get context() {
        return __classPrivateFieldGet(this, _Session_context, "f");
    }
    get player() {
        return __classPrivateFieldGet(this, _Session_player, "f");
    }
    get lang() {
        return __classPrivateFieldGet(this, _Session_context, "f").client.hl;
    }
}
_a = Session, _Session_api_version = new WeakMap(), _Session_key = new WeakMap(), _Session_context = new WeakMap(), _Session_account_index = new WeakMap(), _Session_player = new WeakMap(), _Session_getVisitorID = function _Session_getVisitorID(visitor_data) {
    const decoded_visitor_data = Proto.decodeVisitorData(visitor_data);
    Log.info(_a.TAG, 'Custom visitor data decoded successfully.\n', decoded_visitor_data);
    return decoded_visitor_data.id;
}, _Session_retrieveSessionData = function _Session_retrieveSessionData(options_1) {
    return __awaiter(this, arguments, void 0, function* (options, fetch = Platform.shim.fetch) {
        const url = new URL('/sw.js_data', Constants.URLS.YT_BASE);
        let visitor_id = generateRandomString(11);
        if (options.visitor_data) {
            visitor_id = __classPrivateFieldGet(this, _a, "m", _Session_getVisitorID).call(this, options.visitor_data);
        }
        const res = yield fetch(url, {
            headers: {
                'accept-language': options.lang || 'en-US',
                'user-agent': getRandomUserAgent('desktop'),
                'accept': '*/*',
                'referer': 'https://www.youtube.com/sw.js',
                'cookie': `PREF=tz=${options.time_zone.replace('/', '.')};VISITOR_INFO1_LIVE=${visitor_id};`
            }
        });
        if (!res.ok)
            throw new SessionError(`Failed to retrieve session data: ${res.status}`);
        const text = yield res.text();
        const data = JSON.parse(text.replace(/^\)\]\}'/, ''));
        const ytcfg = data[0][2];
        const api_version = Constants.CLIENTS.WEB.API_VERSION;
        const [[device_info], api_key] = ytcfg;
        const context = {
            client: {
                hl: device_info[0],
                gl: options.location || device_info[2],
                remoteHost: device_info[3],
                screenDensityFloat: 1,
                screenHeightPoints: 1080,
                screenPixelDensity: 1,
                screenWidthPoints: 1920,
                visitorData: device_info[13],
                clientName: options.client_name,
                clientVersion: device_info[16],
                osName: device_info[17],
                osVersion: device_info[18],
                platform: options.device_category.toUpperCase(),
                clientFormFactor: 'UNKNOWN_FORM_FACTOR',
                userInterfaceTheme: 'USER_INTERFACE_THEME_LIGHT',
                timeZone: device_info[79] || options.time_zone,
                browserName: device_info[86],
                browserVersion: device_info[87],
                originalUrl: Constants.URLS.YT_BASE,
                deviceMake: device_info[11],
                deviceModel: device_info[12],
                utcOffsetMinutes: -new Date().getTimezoneOffset()
            },
            user: {
                enableSafetyMode: options.enable_safety_mode,
                lockedSafetyMode: false
            },
            request: {
                useSsl: true,
                internalExperimentFlags: []
            }
        };
        if (options.on_behalf_of_user)
            context.user.onBehalfOfUser = options.on_behalf_of_user;
        return { context, api_key, api_version };
    });
}, _Session_generateSessionData = function _Session_generateSessionData(options) {
    let visitor_id = generateRandomString(11);
    if (options.visitor_data) {
        visitor_id = __classPrivateFieldGet(this, _a, "m", _Session_getVisitorID).call(this, options.visitor_data);
    }
    const context = {
        client: {
            hl: options.lang || 'en',
            gl: options.location || 'US',
            screenDensityFloat: 1,
            screenHeightPoints: 1080,
            screenPixelDensity: 1,
            screenWidthPoints: 1920,
            visitorData: Proto.encodeVisitorData(visitor_id, Math.floor(Date.now() / 1000)),
            clientName: options.client_name,
            clientVersion: Constants.CLIENTS.WEB.VERSION,
            osName: 'Windows',
            osVersion: '10.0',
            platform: options.device_category.toUpperCase(),
            clientFormFactor: 'UNKNOWN_FORM_FACTOR',
            userInterfaceTheme: 'USER_INTERFACE_THEME_LIGHT',
            timeZone: options.time_zone,
            originalUrl: Constants.URLS.YT_BASE,
            deviceMake: '',
            deviceModel: '',
            utcOffsetMinutes: -new Date().getTimezoneOffset()
        },
        user: {
            enableSafetyMode: options.enable_safety_mode,
            lockedSafetyMode: false
        },
        request: {
            useSsl: true,
            internalExperimentFlags: []
        }
    };
    if (options.on_behalf_of_user)
        context.user.onBehalfOfUser = options.on_behalf_of_user;
    return { context, api_key: Constants.CLIENTS.WEB.API_KEY, api_version: Constants.CLIENTS.WEB.API_VERSION };
};
Session.TAG = 'Session';
export default Session;
//# sourceMappingURL=Session.js.map