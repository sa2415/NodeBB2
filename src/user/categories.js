"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
Object.defineProperty(exports, "__esModule", { value: true });
const _ = __importStar(require("lodash"));
const database_1 = __importDefault(require("../database"));
const categories_1 = __importDefault(require("../categories"));
const plugins_1 = __importDefault(require("../plugins"));
const User = {
    setCategoryWatchState(uid, cids, state) {
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
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
            const exists = yield categories_1.default.exists(cids);
            // The next line calls a function in a module that has not been updated to TS yet
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
            if (exists.includes(false)) {
                throw new Error('[[error:no-category]]');
            }
            // The next line calls a function in a module that has not been updated to TS yet
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
            yield database_1.default.sortedSetsAdd(cids.map(cid => `cid:${cid}:uid:watch:state`), state, uid);
        });
    },
    getCategoryWatchState(uid) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(parseInt(String(uid), 10) > 0)) {
                return {};
            }
            // The next line calls a function in a module that has not been updated to TS yet
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
            const cids = yield categories_1.default.getAllCidsFromSet('categories:cid');
            // The next line calls a function in a module that has not been updated to TS yet
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
            const states = yield categories_1.default.getWatchState(cids, uid);
            // The next line calls a function in a module that has not been updated to TS yet
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument
            return _.zipObject(cids, states);
        });
    },
    getIgnoredCategories(uid) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(parseInt(String(uid), 10) > 0)) {
                return [];
            }
            // The next line calls a function in a module that has not been updated to TS yet
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument
            const cids = yield User.getCategoriesByStates(uid, [categories_1.default.watchStates.ignoring]);
            // The next line calls a function in a module that has not been updated to TS yet
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
            const result = yield plugins_1.default.hooks.fire('filter:user.getIgnoredCategories', {
                uid: uid,
                cids: cids,
            });
            return result.cids;
        });
    },
    getWatchedCategories(uid) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(parseInt(String(uid), 10) > 0)) {
                return [];
            }
            // The next line calls a function in a module that has not been updated to TS yet
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument
            const cids = yield User.getCategoriesByStates(uid, [categories_1.default.watchStates.watching]);
            // The next line calls a function in a module that has not been updated to TS yet
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
            const result = yield plugins_1.default.hooks.fire('filter:user.getWatchedCategories', {
                uid: uid,
                cids: cids,
            });
            return result.cids;
        });
    },
    getCategoriesByStates(uid, states) {
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
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
            const userState = yield categories_1.default.getWatchState(cids, uid);
            return cids.filter((cid, index) => states.includes(userState[index]));
        });
    },
    ignoreCategory(uid, cid) {
        return __awaiter(this, void 0, void 0, function* () {
            // The next line calls a function in a module that has not been updated to TS yet
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument
            yield User.setCategoryWatchState(uid, cid, categories_1.default.watchStates.ignoring);
        });
    },
    watchCategory(uid, cid) {
        return __awaiter(this, void 0, void 0, function* () {
            // The next line calls a function in a module that has not been updated to TS yet
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument
            yield User.setCategoryWatchState(uid, cid, categories_1.default.watchStates.watching);
        });
    },
};
exports.default = User;
