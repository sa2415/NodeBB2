

import * as _ from 'lodash';
import * as db from '../database';
import * as categories from '../categories';
import * as plugins from '../plugins';

// Define the User interface
interface User {
    setCategoryWatchState: (uid: number, cids: number | number[], state: number) => Promise<void>;
    getCategoryWatchState: (uid: number) => Promise<{ [cid: string]: number }>;
    getIgnoredCategories: (uid: number) => Promise<number[]>;
    getWatchedCategories: (uid: number) => Promise<number[]>;
    getCategoriesByStates: (uid: number, states: number[]) => Promise<number[]>;
    ignoreCategory: (uid: number, cid: number) => Promise<void>;
    watchCategory: (uid: number, cid: number) => Promise<void>;
}

export default function (User: User) {
    User.setCategoryWatchState = async function (uid: number, cids: number | number[], state: number) {
        if (!(parseInt(uid.toString(), 10) > 0)) {
            return;
        }
        const isStateValid = Object.values(categories.watchStates).includes(parseInt(state.toString(), 10));
        if (!isStateValid) {
            throw new Error('[[error:invalid-watch-state]]');
        }
        // Ensure cids is an array of numbers or single number
        const cidsArray = Array.isArray(cids) ? cids : [cids];

        // Check if any cid is invalid
        const exists = await (categories.exists as (cids: any) => Promise<boolean[]>)(cidsArray);
        if (exists.includes(false)) {
            throw new Error('[[error:no-category]]');
        }
        // Use map on cidsArray to create the sorted sets keys
        const sortedSetKeys = cidsArray.map((cid: number) => `cid:${cid}:uid:watch:state`);
        await db.sortedSetsAdd(sortedSetKeys, state, uid);
        // await db.sortedSetsAdd(cids.map((cid: number) => `cid:${cid}:uid:watch:state`), state, uid);
    };

    User.getCategoryWatchState = async function (uid: number) {
        if (!(parseInt(uid.toString(), 10) > 0)) {
            return {};
        }

        const cids = await categories.getAllCidsFromSet('categories:cid');
        const states = await categories.getWatchState(cids, uid);
        return _.zipObject(cids, states);
    };

    User.getIgnoredCategories = async function (uid: number) {
        if (!(parseInt(uid.toString(), 10) > 0)) {
            return [];
        }
        const cids = await User.getCategoriesByStates(uid, [categories.watchStates.ignoring]);
        const result = await plugins.hooks.fire('filter:user.getIgnoredCategories', {
            uid: uid,
            cids: cids,
        });
        return result.cids;
    };

    User.getWatchedCategories = async function (uid: number) {
        if (!(parseInt(uid.toString(), 10) > 0)) {
            return [];
        }
        const cids = await User.getCategoriesByStates(uid, [categories.watchStates.watching]);
        const result = await plugins.hooks.fire('filter:user.getWatchedCategories', {
            uid: uid,
            cids: cids,
        });
        return result.cids;
    };

    User.getCategoriesByStates = async function (uid: number, states: number[]) {
        if (!(parseInt(uid.toString(), 10) > 0)) {
            return await categories.getAllCidsFromSet('categories:cid');
        }
        const cids = await categories.getAllCidsFromSet('categories:cid');
        const userState = await categories.getWatchState(cids, uid);
        return cids.filter((cid: number, index: number) => states.includes(userState[index]));
    };

    User.ignoreCategory = async function (uid: number, cid: number) {
        await User.setCategoryWatchState(uid, cid, categories.watchStates.ignoring);
    };

    User.watchCategory = async function (uid: number, cid: number) {
        await User.setCategoryWatchState(uid, cid, categories.watchStates.watching);
    };
}
