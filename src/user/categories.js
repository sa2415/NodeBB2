"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const lodash_1 = __importDefault(require("lodash"));
const database_1 = __importDefault(require("../database"));
const categories_1 = __importDefault(require("../categories"));
const plugins_1 = __importDefault(require("../plugins"));
module.exports = function (User) {
    User.setCategoryWatchState = async function (uid, cids, state) {
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
        const exists = await categories_1.default.exists(cids);
        // The next line calls a function in a module that has not been updated to TS yet
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument
        if (exists.includes(false)) { // eslint-disable-line @typescript-eslint/no-unsafe-member-access
            throw new Error('[[error:no-category]]');
        }
        // The next line calls a function in a module that has not been updated to TS yet
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        await database_1.default.sortedSetsAdd(cids.map((cid) => `cid:${cid}:uid:watch:state`), state, uid);
    };
    // The next line calls a function in a module that has not been updated to TS yet
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
    User.getCategoryWatchState = async function (uid) {
        if (!(parseInt(String(uid), 10) > 0)) {
            return {};
        }
        // The next line calls a function in a module that has not been updated to TS yet
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument
        const cids = await categories_1.default.getAllCidsFromSet('categories:cid'); // eslint-disable-line @typescript-eslint/no-unsafe-assignment
        // The next line calls a function in a module that has not been updated to TS yet
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment
        const states = await categories_1.default.getWatchState(cids, uid);
        // The next line calls a function in a module that has not been updated to TS yet
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument
        return lodash_1.default.zipObject(cids, states);
    };
    User.getIgnoredCategories = async function (uid) {
        if (!(parseInt(String(uid), 10) > 0)) {
            return [];
        }
        // The next line calls a function in a module that has not been updated to TS yet
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument
        const cids = await User.getCategoriesByStates(uid, [categories_1.default.watchStates.ignoring]);
        // The next line calls a function in a module that has not been updated to TS yet
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment
        const result = await plugins_1.default.hooks.fire('filter:user.getIgnoredCategories', {
            uid: uid,
            cids: cids,
        });
        // The next line calls a function in a module that has not been updated to TS yet
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
        return result.cids;
    };
    User.getWatchedCategories = async function (uid) {
        if (!(parseInt(String(uid), 10) > 0)) {
            return [];
        }
        // The next line calls a function in a module that has not been updated to TS yet
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
        const cids = await User.getCategoriesByStates(uid, [categories_1.default.watchStates.watching]);
        // The next line calls a function in a module that has not been updated to TS yet
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
        const result = await plugins_1.default.hooks.fire('filter:user.getWatchedCategories', {
            uid: uid,
            cids: cids,
        });
        // The next line calls a function in a module that has not been updated to TS yet
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return
        return result.cids;
    };
    User.getCategoriesByStates = async function (uid, states) {
        if (!(parseInt(String(uid), 10) > 0)) {
            // The next line calls a function in a module that has not been updated to TS yet
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return
            return await categories_1.default.getAllCidsFromSet('categories:cid');
        }
        // The next line calls a function in a module that has not been updated to TS yet
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
        const cids = await categories_1.default.getAllCidsFromSet('categories:cid');
        // The next line calls a function in a module that has not been updated to TS yet
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment
        const userState = await categories_1.default.getWatchState(cids, uid);
        // The next line calls a function in a module that has not been updated to TS yet
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return
        return cids.filter((cid, index) => states.includes(userState[index])); // eslint-disable-line 
    };
    User.ignoreCategory = async function (uid, cid) {
        // The next line calls a function in a module that has not been updated to TS yet
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument
        await User.setCategoryWatchState(uid, cid, categories_1.default.watchStates.ignoring);
    };
    User.watchCategory = async function (uid, cid) {
        // The next line calls a function in a module that has not been updated to TS yet
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument
        await User.setCategoryWatchState(uid, cid, categories_1.default.watchStates.watching);
    };
};
