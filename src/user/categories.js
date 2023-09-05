"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const lodash_1 = __importDefault(require("lodash"));
const database_1 = __importDefault(require("../database"));
const categories_1 = __importDefault(require("../categories"));
const plugins_1 = __importDefault(require("../plugins"));
module.exports = function (User) {
    User.setCategoryWatchState = function (uid, cids, state) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(parseInt(String(uid), 10) > 0)) {
                return;
            }
            // The next line calls a function in a module that has not been updated to TS yet
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument
            const isStateValid = Object.values(categories_1.default.watchStates).includes(parseInt(String(state), 10));
            if (!isStateValid) {
                throw new Error('[[error:invalid-watch-state]]');
            }
            cids = Array.isArray(cids) ? cids : [cids];
            // The next line calls a function in a module that has not been updated to TS yet
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment
            const exists = yield categories_1.default.exists(cids);
            // The next line calls a function in a module that has not been updated to TS yet
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument
            if (exists.includes(false)) { // eslint-disable-line @typescript-eslint/no-unsafe-member-access
                throw new Error('[[error:no-category]]');
            }
            // The next line calls a function in a module that has not been updated to TS yet
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
            yield database_1.default.sortedSetsAdd(cids.map((cid) => `cid:${cid}:uid:watch:state`), state, uid);
        });
    };
    // The next line calls a function in a module that has not been updated to TS yet
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
    User.getCategoryWatchState = function (uid) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(parseInt(String(uid), 10) > 0)) {
                return {};
            }
            // The next line calls a function in a module that has not been updated to TS yet
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument
            const cids = yield categories_1.default.getAllCidsFromSet('categories:cid'); // eslint-disable-line @typescript-eslint/no-unsafe-assignment
            // The next line calls a function in a module that has not been updated to TS yet
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment
            const states = yield categories_1.default.getWatchState(cids, uid);
            // The next line calls a function in a module that has not been updated to TS yet
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument
            return lodash_1.default.zipObject(cids, states);
        });
    };
    User.getIgnoredCategories = function (uid) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(parseInt(String(uid), 10) > 0)) {
                return [];
            }
            // The next line calls a function in a module that has not been updated to TS yet
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument
            const cids = yield User.getCategoriesByStates(uid, [categories_1.default.watchStates.ignoring]);
            // The next line calls a function in a module that has not been updated to TS yet
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment
            const result = yield plugins_1.default.hooks.fire('filter:user.getIgnoredCategories', {
                uid: uid,
                cids: cids,
            });
            // The next line calls a function in a module that has not been updated to TS yet
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
            return result.cids;
        });
    };
    User.getWatchedCategories = function (uid) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(parseInt(String(uid), 10) > 0)) {
                return [];
            }
            // The next line calls a function in a module that has not been updated to TS yet
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
            const cids = yield User.getCategoriesByStates(uid, [categories_1.default.watchStates.watching]);
            // The next line calls a function in a module that has not been updated to TS yet
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
            const result = yield plugins_1.default.hooks.fire('filter:user.getWatchedCategories', {
                uid: uid,
                cids: cids,
            });
            // The next line calls a function in a module that has not been updated to TS yet
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return
            return result.cids;
        });
    };
    User.getCategoriesByStates = function (uid, states) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(parseInt(String(uid), 10) > 0)) {
                // The next line calls a function in a module that has not been updated to TS yet
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return
                return yield categories_1.default.getAllCidsFromSet('categories:cid');
            }
            // The next line calls a function in a module that has not been updated to TS yet
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
            const cids = yield categories_1.default.getAllCidsFromSet('categories:cid');
            // The next line calls a function in a module that has not been updated to TS yet
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment
            const userState = yield categories_1.default.getWatchState(cids, uid);
            // The next line calls a function in a module that has not been updated to TS yet
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return
            return cids.filter((cid, index) => states.includes(userState[index])); // eslint-disable-line 
        });
    };
    User.ignoreCategory = function (uid, cid) {
        return __awaiter(this, void 0, void 0, function* () {
            // The next line calls a function in a module that has not been updated to TS yet
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument
            yield User.setCategoryWatchState(uid, cid, categories_1.default.watchStates.ignoring);
        });
    };
    User.watchCategory = function (uid, cid) {
        return __awaiter(this, void 0, void 0, function* () {
            // The next line calls a function in a module that has not been updated to TS yet
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument
            yield User.setCategoryWatchState(uid, cid, categories_1.default.watchStates.watching);
        });
    };
};
