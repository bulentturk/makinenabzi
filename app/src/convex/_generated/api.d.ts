/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as auth from "../auth.js";
import type * as auth_emailOtp from "../auth/emailOtp.js";
import type * as companies from "../companies.js";
import type * as crons from "../crons.js";
import type * as fairs from "../fairs.js";
import type * as http from "../http.js";
import type * as lib_authz from "../lib/authz.js";
import type * as listings from "../listings.js";
import type * as magazines from "../magazines.js";
import type * as news from "../news.js";
import type * as profiles from "../profiles.js";
import type * as push from "../push.js";
import type * as seed from "../seed.js";
import type * as seedData from "../seedData.js";
import type * as siteFeed from "../siteFeed.js";
import type * as siteSync from "../siteSync.js";
import type * as siteSyncLogic from "../siteSyncLogic.js";
import type * as siteSyncStore from "../siteSyncStore.js";
import type * as sources from "../sources.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  "auth/emailOtp": typeof auth_emailOtp;
  companies: typeof companies;
  crons: typeof crons;
  fairs: typeof fairs;
  http: typeof http;
  "lib/authz": typeof lib_authz;
  listings: typeof listings;
  magazines: typeof magazines;
  news: typeof news;
  profiles: typeof profiles;
  push: typeof push;
  seed: typeof seed;
  seedData: typeof seedData;
  siteFeed: typeof siteFeed;
  siteSync: typeof siteSync;
  siteSyncLogic: typeof siteSyncLogic;
  siteSyncStore: typeof siteSyncStore;
  sources: typeof sources;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
