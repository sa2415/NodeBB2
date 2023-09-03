import * as _ from 'lodash';
import db from '../database';
import categories from '../categories';
import plugins from '../plugins';

interface User {
  setCategoryWatchState(uid: number, cids: number | number[], state: number): Promise<void>;
  getCategoryWatchState(uid: number): Promise<{ [key: number]: number }>;
  getIgnoredCategories(uid: number): Promise<number[]>;
  getWatchedCategories(uid: number): Promise<number[]>;
  getCategoriesByStates(uid: number, states: number[]): Promise<number[]>;
  ignoreCategory(uid: number, cid: number): Promise<void>;
  watchCategory(uid: number, cid: number): Promise<void>;
}

const User: User = {
    async setCategoryWatchState(uid, cids, state) {
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
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
        const exists = await categories.exists(cids);
        // The next line calls a function in a module that has not been updated to TS yet
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        if (exists.includes(false)) {
            throw new Error('[[error:no-category]]');
        }
        // The next line calls a function in a module that has not been updated to TS yet
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        await db.sortedSetsAdd(cids.map(cid => `cid:${cid}:uid:watch:state`), state, uid);
    },

    async getCategoryWatchState(uid) {
        if (!(parseInt(String(uid), 10) > 0)) {
            return {};
        }
        // The next line calls a function in a module that has not been updated to TS yet
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
        const cids = await categories.getAllCidsFromSet('categories:cid');
        // The next line calls a function in a module that has not been updated to TS yet
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
        const states = await categories.getWatchState(cids, uid);
        // The next line calls a function in a module that has not been updated to TS yet
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument
        return _.zipObject(cids, states);
    },

    async getIgnoredCategories(uid) {
        if (!(parseInt(String(uid), 10) > 0)) {
            return [];
        }
        // The next line calls a function in a module that has not been updated to TS yet
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument
        const cids = await User.getCategoriesByStates(uid, [categories.watchStates.ignoring]);
        // The next line calls a function in a module that has not been updated to TS yet
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
        const result = await plugins.hooks.fire('filter:user.getIgnoredCategories', {
            uid: uid,
            cids: cids,
        }) as {cids: number[]};
        return result.cids;
    },

    async getWatchedCategories(uid) {
        if (!(parseInt(String(uid), 10) > 0)) {
            return [];
        }
        // The next line calls a function in a module that has not been updated to TS yet
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument
        const cids = await User.getCategoriesByStates(uid, [categories.watchStates.watching]);
        // The next line calls a function in a module that has not been updated to TS yet
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
        const result = await plugins.hooks.fire('filter:user.getWatchedCategories', {
            uid: uid,
            cids: cids,
        }) as {cids: number[]};
        return result.cids;
    },

    async getCategoriesByStates(uid, states: number[]): Promise<number[]> {
        if (!(parseInt(String(uid), 10) > 0)) {
            // The next line calls a function in a module that has not been updated to TS yet
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return
            return await categories.getAllCidsFromSet('categories:cid');
        }
        // The next line calls a function in a module that has not been updated to TS yet
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
        const cids: number[] = await categories.getAllCidsFromSet('categories:cid');
        // The next line calls a function in a module that has not been updated to TS yet
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
        const userState: number[] = await categories.getWatchState(cids, uid);
        return cids.filter((cid, index) => states.includes(userState[index]));
    },

    async ignoreCategory(uid, cid) {
        // The next line calls a function in a module that has not been updated to TS yet
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument
        await User.setCategoryWatchState(uid, cid, categories.watchStates.ignoring);
    },

    async watchCategory(uid, cid) {
        // The next line calls a function in a module that has not been updated to TS yet
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument
        await User.setCategoryWatchState(uid, cid, categories.watchStates.watching);
    },
};

export default User;
