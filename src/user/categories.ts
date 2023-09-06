
import _ from 'lodash';
import db from '../database';
import categories from '../categories';
import plugins from '../plugins';


interface UserT {
    setCategoryWatchState: (uid: number, cids: number | number[], state: number)=> Promise<void>;
    getCategoryWatchState: (uid: number)=> Promise<{ [key: number]: number }>;
    getIgnoredCategories: (uid: number)=> Promise<number[]>;
    getWatchedCategories: (uid: number)=> Promise<number[]>;
    getCategoriesByStates: (uid: number, states: number[])=> Promise<number[]>;
    ignoreCategory: (uid: number, cid: number)=> Promise<void>;
    watchCategory: (uid: number, cid: number)=> Promise<void>;
  }

export = function (User: UserT) {
    User.setCategoryWatchState = async function (uid: number, cids: number | number[], state: number) {
        if (!(parseInt(String(uid), 10) > 0)) {
            return;
        }
        // The next line calls a function in a module that has not been updated to TS yet
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument
        const isStateValid = Object.values(categories.watchStates).includes(parseInt(String(state), 10));
        if (!isStateValid) {
            throw new Error('[[error:invalid-watch-state]]');
        }
        cids = Array.isArray(cids) ? cids : [cids];
        // The next line calls a function in a module that has not been updated to TS yet
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment
        const exists = await categories.exists(cids);
        // The next line calls a function in a module that has not been updated to TS yet
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument
        if (exists.includes(false)) { // eslint-disable-line @typescript-eslint/no-unsafe-member-access
            throw new Error('[[error:no-category]]');
        }
        // The next line calls a function in a module that has not been updated to TS yet
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        await db.sortedSetsAdd(cids.map((cid: number) => `cid:${cid}:uid:watch:state`), state, uid);
    };
    // The next line calls a function in a module that has not been updated to TS yet
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
    User.getCategoryWatchState = async function (uid: number) {
        if (!(parseInt(String(uid), 10) > 0)) {
            return {};
        }
        // The next line calls a function in a module that has not been updated to TS yet
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument
        const cids = await categories.getAllCidsFromSet('categories:cid');// eslint-disable-line @typescript-eslint/no-unsafe-assignment
        // The next line calls a function in a module that has not been updated to TS yet
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment
        const states = await categories.getWatchState(cids, uid);
        // The next line calls a function in a module that has not been updated to TS yet
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument
        return _.zipObject(cids, states);
    };

    User.getIgnoredCategories = async function (uid: number) {
        if (!(parseInt(String(uid), 10) > 0)) {
            return [];
        }
        // The next line calls a function in a module that has not been updated to TS yet
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument
        const cids = await User.getCategoriesByStates(uid, [categories.watchStates.ignoring]);
        // The next line calls a function in a module that has not been updated to TS yet
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment
        const result = await plugins.hooks.fire('filter:user.getIgnoredCategories', {
            uid: uid,
            cids: cids,
        });
        // The next line calls a function in a module that has not been updated to TS yet
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
        return result.cids;
    };

    User.getWatchedCategories = async function (uid: number) {
        if (!(parseInt(String(uid), 10) > 0)) {
            return [];
        }
        // The next line calls a function in a module that has not been updated to TS yet
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
        const cids = await User.getCategoriesByStates(uid, [categories.watchStates.watching]);
        // The next line calls a function in a module that has not been updated to TS yet
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
        const result = await plugins.hooks.fire('filter:user.getWatchedCategories', {
            uid: uid,
            cids: cids,
        });
        // The next line calls a function in a module that has not been updated to TS yet
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return
        return result.cids;
    };

    User.getCategoriesByStates = async function (uid: number, states: number[]) {
        if (!(parseInt(String(uid), 10) > 0)) {
        // The next line calls a function in a module that has not been updated to TS yet
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return
            return await categories.getAllCidsFromSet('categories:cid');
        }
        // The next line calls a function in a module that has not been updated to TS yet
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
        const cids = await categories.getAllCidsFromSet('categories:cid');
        // The next line calls a function in a module that has not been updated to TS yet
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment
        const userState = await categories.getWatchState(cids, uid);
        // The next line calls a function in a module that has not been updated to TS yet
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return
        return cids.filter((cid: number, index: number) => states.includes(userState[index]));// eslint-disable-line 
    };

    User.ignoreCategory = async function (uid: number, cid: number) {
        // The next line calls a function in a module that has not been updated to TS yet
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument
        await User.setCategoryWatchState(uid, cid, categories.watchStates.ignoring);
    };

    User.watchCategory = async function (uid: number, cid: number) {
        // The next line calls a function in a module that has not been updated to TS yet
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument
        await User.setCategoryWatchState(uid, cid, categories.watchStates.watching);
    };
};


