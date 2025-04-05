"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var axios_1 = require("axios");
var client_1 = require("@prisma/client");
var ProgressBar = require("progress");
var prisma = new client_1.PrismaClient();
var API_KEY = "bYxNFJQzxCkEuuGalKMynFhFYKEzbxGYYBY3HaLE";
var API_BASE = "https://api.tranzy.ai/v1/opendata";
// Helper functions for data generation
var randomElement = function (arr) {
    return arr[Math.floor(Math.random() * arr.length)];
};
var randomBetween = function (min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};
var vehicleTypeMap = {
    0: "Tram",
    1: "Subway",
    2: "Rail",
    3: "Bus",
    4: "Ferry",
    5: "Cable tram",
    6: "Aerial lift",
    7: "Funicular",
    11: "Trolleybus",
    12: "Monorail",
};
var daysOfWeek = Array.from({ length: 7 }, function (_, i) { return i; });
function fetchData(url, agencyId) {
    return __awaiter(this, void 0, void 0, function () {
        var headers, response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    headers = __assign({ "X-API-KEY": API_KEY }, (agencyId && { "X-Agency-Id": agencyId }));
                    return [4 /*yield*/, axios_1.default.get(url, { headers: headers })];
                case 1:
                    response = _a.sent();
                    return [2 /*return*/, response.data];
            }
        });
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var bar, agencyId, routesData, createdRoutes, stopsData, createdStops, _loop_1, _i, _a, _b, idx, route, timetableEntries, _c, createdRoutes_1, route, routeStops, _d, routeStops_1, routeStop, _e, daysOfWeek_1, dayOfWeek, trips, tripDate, _loop_2, _f, _g, entry, createdTrips, occupancyPromises, _h, createdTrips_1, trip, baseHour, isRushHour, currentTime, maxOccupancy, count;
        var _j;
        return __generator(this, function (_k) {
            switch (_k.label) {
                case 0:
                    bar = new ProgressBar("Seeding database [:bar] :percent :etas remaining", {
                        total: 8,
                        width: 40,
                    });
                    agencyId = "2";
                    // Step 2: Fetch and create routes
                    bar.tick(1, { message: "Fetching routes" });
                    return [4 /*yield*/, fetchData("".concat(API_BASE, "/routes"), agencyId)];
                case 1:
                    routesData = _k.sent();
                    return [4 /*yield*/, Promise.all(routesData.map(function (route) {
                            return prisma.route.create({
                                data: {
                                    name: route.route_short_name,
                                    description: route.route_long_name,
                                    operatingHours: "".concat(randomBetween(5, 7), ":00 AM - ").concat(randomBetween(21, 23), ":00 PM"),
                                },
                            });
                        }))];
                case 2:
                    createdRoutes = _k.sent();
                    // Step 3: Fetch and create stops
                    bar.tick(1, { message: "Fetching stops" });
                    return [4 /*yield*/, fetchData("".concat(API_BASE, "/stops"), agencyId)];
                case 3:
                    stopsData = _k.sent();
                    return [4 /*yield*/, Promise.all(stopsData.map(function (stop) {
                            return prisma.stop.create({
                                data: {
                                    name: stop.stop_name,
                                    latitude: stop.stop_lat,
                                    longitude: stop.stop_lon,
                                    accessibility: randomElement(["Elevator", "Ramp", "None"]),
                                },
                            });
                        }))];
                case 4:
                    createdStops = _k.sent();
                    // Step 4: Create route stops
                    bar.tick(1, { message: "Creating route stops" });
                    _loop_1 = function (idx, route) {
                        var selectedStops;
                        return __generator(this, function (_l) {
                            switch (_l.label) {
                                case 0:
                                    selectedStops = createdStops.slice(0, randomBetween(5, 15));
                                    return [4 /*yield*/, Promise.all(selectedStops.map(function (stop, order) {
                                            return prisma.routeStop.create({
                                                data: {
                                                    routeId: route.id,
                                                    stopId: stop.id,
                                                    stopOrder: order,
                                                },
                                            });
                                        }))];
                                case 1:
                                    _l.sent();
                                    return [2 /*return*/];
                            }
                        });
                    };
                    _i = 0, _a = createdRoutes.entries();
                    _k.label = 5;
                case 5:
                    if (!(_i < _a.length)) return [3 /*break*/, 8];
                    _b = _a[_i], idx = _b[0], route = _b[1];
                    return [5 /*yield**/, _loop_1(idx, route)];
                case 6:
                    _k.sent();
                    _k.label = 7;
                case 7:
                    _i++;
                    return [3 /*break*/, 5];
                case 8:
                    // Step 5: Create timetable entries
                    bar.tick(1, { message: "Creating timetable entries" });
                    timetableEntries = [];
                    _c = 0, createdRoutes_1 = createdRoutes;
                    _k.label = 9;
                case 9:
                    if (!(_c < createdRoutes_1.length)) return [3 /*break*/, 12];
                    route = createdRoutes_1[_c];
                    return [4 /*yield*/, prisma.routeStop.findMany({
                            where: { routeId: route.id },
                            include: { stop: true },
                        })];
                case 10:
                    routeStops = _k.sent();
                    for (_d = 0, routeStops_1 = routeStops; _d < routeStops_1.length; _d++) {
                        routeStop = routeStops_1[_d];
                        for (_e = 0, daysOfWeek_1 = daysOfWeek; _e < daysOfWeek_1.length; _e++) {
                            dayOfWeek = daysOfWeek_1[_e];
                            timetableEntries.push(prisma.timetableEntry.create({
                                data: {
                                    routeId: route.id,
                                    stopId: routeStop.stopId,
                                    dayOfWeek: dayOfWeek,
                                    departureTime: "".concat(randomBetween(5, 23)
                                        .toString()
                                        .padStart(2, "0"), ":").concat(randomElement(["00", "15", "30", "45"])),
                                    isHoliday: false,
                                    isWeekday: dayOfWeek < 5,
                                    isWeekend: dayOfWeek >= 5,
                                },
                            }));
                        }
                    }
                    _k.label = 11;
                case 11:
                    _c++;
                    return [3 /*break*/, 9];
                case 12: return [4 /*yield*/, Promise.all(timetableEntries)];
                case 13:
                    _k.sent();
                    // Step 6: Create trips
                    bar.tick(1, { message: "Creating trips" });
                    trips = [];
                    tripDate = new Date();
                    _loop_2 = function (entry) {
                        var departureTime = new Date(tripDate);
                        var _m = entry.departureTime.split(":"), hours = _m[0], minutes = _m[1];
                        departureTime.setHours(parseInt(hours), parseInt(minutes));
                        var arrivalTime = new Date(departureTime);
                        arrivalTime.setMinutes(arrivalTime.getMinutes() + randomBetween(15, 45));
                        trips.push(prisma.trip.create({
                            data: {
                                routeId: entry.routeId,
                                timetableEntryId: entry.id,
                                vehicleType: vehicleTypeMap[((_j = routesData.find(function (r) { return r.route_id === entry.routeId; })) === null || _j === void 0 ? void 0 : _j.route_type) || 3],
                                capacity: randomBetween(20, 100),
                                date: departureTime,
                                departureTime: departureTime,
                                arrivalTime: arrivalTime,
                                status: randomElement(["Scheduled", "Active", "Completed"]),
                            },
                        }));
                    };
                    _f = 0;
                    return [4 /*yield*/, prisma.timetableEntry.findMany()];
                case 14:
                    _g = _k.sent();
                    _k.label = 15;
                case 15:
                    if (!(_f < _g.length)) return [3 /*break*/, 17];
                    entry = _g[_f];
                    _loop_2(entry);
                    _k.label = 16;
                case 16:
                    _f++;
                    return [3 /*break*/, 15];
                case 17: return [4 /*yield*/, Promise.all(trips)];
                case 18:
                    createdTrips = _k.sent();
                    // Step 7: Generate occupancy data
                    bar.tick(1, { message: "Generating occupancy data" });
                    occupancyPromises = [];
                    for (_h = 0, createdTrips_1 = createdTrips; _h < createdTrips_1.length; _h++) {
                        trip = createdTrips_1[_h];
                        baseHour = trip.departureTime.getHours();
                        isRushHour = (baseHour >= 7 && baseHour <= 9) || (baseHour >= 16 && baseHour <= 18);
                        currentTime = new Date(trip.departureTime);
                        while (currentTime < trip.arrivalTime) {
                            maxOccupancy = isRushHour
                                ? randomBetween(75, 95)
                                : randomBetween(20, 60);
                            count = Math.floor((maxOccupancy / 100) * trip.capacity);
                            occupancyPromises.push(prisma.occupancyData.create({
                                data: {
                                    tripId: trip.id,
                                    timestamp: currentTime,
                                    count: count,
                                    percentage: (count / trip.capacity) * 100,
                                    seated: Math.floor(count * 0.7),
                                    standing: Math.ceil(count * 0.3),
                                    capacity: trip.capacity,
                                },
                            }));
                            currentTime = new Date(currentTime.getTime() + 5 * 60000); // Add 5 minutes
                        }
                    }
                    return [4 /*yield*/, Promise.all(occupancyPromises)];
                case 19:
                    _k.sent();
                    bar.tick(1, { message: "Database seeding complete!" });
                    return [2 /*return*/];
            }
        });
    });
}
main()
    .catch(function (e) {
    console.error(e);
    process.exit(1);
})
    .finally(function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, prisma.$disconnect()];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
