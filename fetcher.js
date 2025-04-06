const axios = require("axios");
const { PrismaClient } = require("@prisma/client");
const cliProgress = require("cli-progress");
const colors = require("colors");
const dotenv = require("dotenv");

dotenv.config();

const prisma = new PrismaClient();
const API_KEY = "bYxNFJQzxCkEuuGalKMynFhFYKEzbxGYYBY3HaLE";
const AGENCY_ID = "2"; // Default agency ID

// Time constants for scheduling
const RUSH_HOURS_MORNING = [7, 8, 9];
const RUSH_HOURS_EVENING = [16, 17, 18];
const WEEKDAYS = [1, 2, 3, 4, 5]; // Monday to Friday (0 is Sunday in JavaScript)
const WEEKEND = [0, 6]; // Sunday and Saturday

/**
 * Main function to orchestrate the data fetching and population
 */
async function populateDatabase() {
  // Create a multi-bar container
  const multibar = new cliProgress.MultiBar(
    {
      clearOnComplete: false,
      hideCursor: true,
      format: "{bar} {percentage}% | {task} | {value}/{total}",
    },
    cliProgress.Presets.shades_classic
  );

  try {
    console.log(colors.cyan("Starting database population process..."));

    // Create progress bars
    const stopsBar = multibar.create(100, 0, {
      task: "Fetching stops        ",
    });
    const routesBar = multibar.create(100, 0, {
      task: "Fetching routes       ",
    });
    const tripsBar = multibar.create(100, 0, {
      task: "Fetching trips        ",
    });
    const shapesBar = multibar.create(100, 0, {
      task: "Fetching shapes       ",
    });
    const stopTimesBar = multibar.create(100, 0, {
      task: "Fetching stop times   ",
    });
    const timetableBar = multibar.create(100, 0, {
      task: "Creating timetables   ",
    });
    const tripsGenBar = multibar.create(100, 0, {
      task: "Generating trips      ",
    });
    const occupancyBar = multibar.create(100, 0, {
      task: "Generating occupancy  ",
    });

    // Fetch and save stops
    stopsBar.update(0);
    const stops = await fetchStops();
    stopsBar.setTotal(stops.length);
    //await saveStops(stops, stopsBar);

    // Fetch and save routes (limited to first 30)
    routesBar.update(0);
    const routes = await fetchRoutes();
    const selectedRouteIds = routes.map((route) => route.route_id);
    routesBar.setTotal(routes.length);
    //await saveRoutes(routes, routesBar);

    // Fetch and filter trips for selected routes
    tripsBar.update(0);
    const allTrips = await fetchTrips();
    const trips = allTrips.filter((trip) =>
      selectedRouteIds.includes(trip.route_id)
    );
    tripsBar.setTotal(1); // Quick operation
    tripsBar.increment();
    const tripsMap = createTripsMap(trips);
    tripsBar.update(1);

    // Fetch shapes for filtered trips
    shapesBar.update(0);
    const shapes = await fetchAllShapes(trips, shapesBar);

    // Fetch and filter stop times for selected trips
    stopTimesBar.update(0);
    const allStopTimes = await fetchStopTimes();
    /*const selectedTripIds = trips.map((trip) => trip.trip_id);
    const stopTimes = allStopTimes.filter((stopTime) =>
      selectedTripIds.includes(stopTime.trip_id)
    );
    stopTimesBar.setTotal(1); // Quick operation
    stopTimesBar.increment();
    const routeStops = await linkRoutesAndStops(
      routes,
      stops,
      shapes,
      stopTimes,
      tripsMap
    );
    stopTimesBar.update(1);*/

    // Generate timetable entries
    /*timetableBar.update(0);
    await generateTimetableEntries(routeStops, timetableBar);
    timetableBar.update(1);*/

    // Generate trips
    tripsGenBar.update(0);
    const generatedTrips = await generateTrips();
    tripsGenBar.update(1);

    // Generate occupancy data
    occupancyBar.update(0);
    await generateOccupancyData(generatedTrips);
    occupancyBar.update(1);

    // Generate predictions
    await generatePredictions();

    multibar.stop();
    console.log(colors.green("\nDatabase successfully populated!"));
  } catch (error) {
    multibar.stop();
    console.error(colors.red("Error populating database:"), error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Fetch stops from the API
 */
async function fetchStops() {
  try {
    const response = await axios.get(
      "https://api.tranzy.ai/v1/opendata/stops",
      {
        headers: {
          "X-API-KEY": API_KEY,
          "X-Agency-Id": AGENCY_ID,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching stops:", error.message);
    return [];
  }
}

/**
 * Save stops to the database with progress updates
 */
async function saveStops(stops, progressBar) {
  for (const stop of stops) {
    const stopData = {
      id: `stop_${stop.stop_id}`,
      name: stop.stop_name,
      latitude: stop.stop_lat,
      longitude: stop.stop_lon,
      accessibility: generateRandomAccessibility(),
    };
    await prisma.stop.upsert({
      where: { id: stopData.id },
      update: stopData,
      create: stopData,
    });
    progressBar.increment();
  }
}

/**
 * Fetch routes from the API, limited to first 30
 */
async function fetchRoutes() {
  try {
    const response = await axios.get(
      "https://api.tranzy.ai/v1/opendata/routes",
      {
        headers: {
          "X-API-KEY": API_KEY,
          "X-Agency-Id": AGENCY_ID,
        },
      }
    );
    return response.data.slice(0, 30); // Only the first 30 routes
  } catch (error) {
    console.error("Error fetching routes:", error.message);
    return [];
  }
}

/**
 * Save routes to the database with progress updates
 */
async function saveRoutes(routes, progressBar) {
  for (const route of routes) {
    const routeData = {
      id: `route_${route.route_id}`,
      name: `${route.route_short_name} - ${route.route_long_name}`,
      description: route.route_desc,
      operatingHours: generateOperatingHours(route.route_type),
    };
    await prisma.route.upsert({
      where: { id: routeData.id },
      update: routeData,
      create: routeData,
    });
    progressBar.increment();
  }
}

/**
 * Fetch trips from the API
 */
async function fetchTrips() {
  try {
    const response = await axios.get(
      "https://api.tranzy.ai/v1/opendata/trips",
      {
        headers: {
          "X-API-KEY": API_KEY,
          "X-Agency-Id": AGENCY_ID,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching trips:", error.message);
    return [];
  }
}

/**
 * Create a map of trips by route_id
 */
function createTripsMap(trips) {
  const map = new Map();
  for (const trip of trips) {
    if (!map.has(trip.route_id)) {
      map.set(trip.route_id, []);
    }
    map.get(trip.route_id).push(trip);
  }
  return map;
}

/**
 * Fetch all shapes for trips with progress updates
 */
async function fetchAllShapes(trips, progressBar) {
  const shapeIds = Array.from(
    new Set(
      trips
        .filter((trip) => trip.shape_id)
        .map((trip) => trip.shape_id.toString())
    )
  );

  progressBar.setTotal(shapeIds.length);
  progressBar.update(0);

  const shapes = {};
  const RATE_LIMIT = 2; // Reduced to 2 requests per second to be safer
  const DELAY_MS = 1500; // Fixed delay of 1.5 seconds between requests
  const MAX_RETRIES = 3;

  for (let i = 0; i < shapeIds.length; i++) {
    const shapeId = shapeIds[i];
    let success = false;
    let retries = 0;

    while (!success && retries < MAX_RETRIES) {
      try {
        // Add consistent delay between all requests
        await new Promise((resolve) => setTimeout(resolve, DELAY_MS));

        const response = await axios.get(
          "https://api.tranzy.ai/v1/opendata/shapes",
          {
            headers: {
              "X-API-KEY": API_KEY,
              "X-Agency-Id": AGENCY_ID,
            },
            params: { shape_id: shapeId },
          }
        );
        shapes[shapeId] = response.data;
        progressBar.increment();
        success = true;
      } catch (error) {
        if (error.response && error.response.status === 429) {
          retries++;
          console.log(
            `Rate limit hit for shape ${shapeId}, retry ${retries}/${MAX_RETRIES}`
          );
          // Exponential backoff on rate limit errors
          await new Promise((resolve) =>
            setTimeout(resolve, Math.pow(2, retries) * 1000)
          );
        } else {
          console.error(`Error fetching shape ${shapeId}:`, error.message);
          break; // Don't retry on non-rate-limit errors
        }
      }
    }

    if (!success) {
      console.warn(
        `Failed to fetch shape ${shapeId} after ${MAX_RETRIES} retries`
      );
    }
  }

  return shapes;
}

/**
 * Fetch stop times from the API
 */
async function fetchStopTimes() {
  try {
    const response = await axios.get(
      "https://api.tranzy.ai/v1/opendata/stop_times",
      {
        headers: {
          "X-API-KEY": API_KEY,
          "X-Agency-Id": AGENCY_ID,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching stop times:", error.message);
    return [];
  }
}

/**
 * Link routes and stops using shapes and stop times
 */
async function linkRoutesAndStops(routes, stops, shapes, stopTimes, tripsMap) {
  const routeStopsMap = new Map();
  for (const stopTime of stopTimes) {
    const tripId = stopTime.trip_id;
    const stopId = stopTime.stop_id;
    let routeId;
    for (const [rid, trips] of tripsMap.entries()) {
      const foundTrip = trips.find((t) => t.trip_id === tripId);
      if (foundTrip) {
        routeId = rid;
        break;
      }
    }
    if (!routeId) continue;

    const key = `route_${routeId}`;
    if (!routeStopsMap.has(key)) routeStopsMap.set(key, new Map());

    const routeStops = routeStopsMap.get(key);
    const stopKey = `stop_${stopId}`;
    if (!routeStops.has(stopKey)) {
      routeStops.set(stopKey, { stopId: stopKey, sequences: [] });
    }
    routeStops.get(stopKey).sequences.push(stopTime.stop_sequence);
  }

  for (const [routeId, stopsMap] of routeStopsMap.entries()) {
    const stopsArray = Array.from(stopsMap.values());
    stopsArray.sort(
      (a, b) => Math.min(...a.sequences) - Math.min(...b.sequences)
    );
    for (let i = 0; i < stopsArray.length; i++) {
      const { stopId } = stopsArray[i];
      await prisma.routeStop.upsert({
        where: { routeId_stopId: { routeId, stopId } },
        update: { stopOrder: i + 1 },
        create: {
          id: `rs_${routeId}_${stopId}`,
          routeId,
          stopId,
          stopOrder: i + 1,
        },
      });
    }
  }
  return routeStopsMap;
}

/**
 * Generate timetable entries for routes
 */
async function generateTimetableEntries(routeStopsMap, progressBar) {
  // Calculate total operations to update progress bar accurately
  const routeCount = routeStopsMap.size;
  // 8 timetable operations per route (weekday morning, afternoon, evening, etc.)
  const totalOperations = routeCount * 8;
  let completedOperations = 0;

  progressBar.setTotal(totalOperations);
  progressBar.update(0);

  for (const [routeId, stopsMap] of routeStopsMap.entries()) {
    const stopsArray = Array.from(stopsMap.values());

    // Weekday morning
    await generateDailyTimetable(
      routeId,
      stopsArray,
      "06:00",
      "11:00",
      40,
      true,
      false,
      false
    );
    progressBar.update(++completedOperations);

    // Weekday afternoon
    await generateDailyTimetable(
      routeId,
      stopsArray,
      "11:00",
      "16:00",
      40,
      true,
      false,
      false
    );
    progressBar.update(++completedOperations);

    // Weekday evening
    await generateDailyTimetable(
      routeId,
      stopsArray,
      "16:00",
      "22:00",
      40,
      true,
      false,
      false
    );
    progressBar.update(++completedOperations);

    // Weekend morning
    await generateDailyTimetable(
      routeId,
      stopsArray,
      "07:00",
      "11:00",
      60,
      false,
      true,
      false
    );
    progressBar.update(++completedOperations);

    // Weekend afternoon
    await generateDailyTimetable(
      routeId,
      stopsArray,
      "11:00",
      "16:00",
      80,
      false,
      true,
      false
    );
    progressBar.update(++completedOperations);

    // Weekend evening
    await generateDailyTimetable(
      routeId,
      stopsArray,
      "16:00",
      "22:00",
      100,
      false,
      true,
      false
    );
    progressBar.update(++completedOperations);

    // Weekend night
    await generateDailyTimetable(
      routeId,
      stopsArray,
      "22:00",
      "07:00",
      140,
      false,
      true,
      false
    );
    progressBar.update(++completedOperations);

    // Holiday
    await generateDailyTimetable(
      routeId,
      stopsArray,
      "07:00",
      "22:00",
      100,
      false,
      false,
      true
    );
    progressBar.update(++completedOperations);
  }
}

/**
 * Generate daily timetable entries
 */
async function generateDailyTimetable(
  routeId,
  stops,
  startTime,
  endTime,
  frequencyMinutes,
  isWeekday,
  isWeekend,
  isHoliday = false
) {
  const [startHour, startMinute] = startTime.split(":").map(Number);
  const [endHour, endMinute] = endTime.split(":").map(Number);
  let currentTime = startHour * 60 + startMinute;
  const endTimeMinutes = endHour * 60 + endMinute;
  const totalMinutes =
    endTimeMinutes < currentTime
      ? endTimeMinutes + 24 * 60 - currentTime
      : endTimeMinutes - currentTime;
  const numDepartures = Math.floor(totalMinutes / frequencyMinutes);

  for (let i = 0; i < numDepartures; i++) {
    const departureHour = Math.floor(currentTime / 60) % 24;
    const departureMinute = currentTime % 60;
    const departureTime = `${departureHour
      .toString()
      .padStart(2, "0")}:${departureMinute.toString().padStart(2, "0")}`;
    let stopTime = currentTime;

    for (const stop of stops) {
      const { stopId } = stop;
      stopTime += Math.floor(Math.random() * 4) + 2;
      const stopHour = Math.floor(stopTime / 60) % 24;
      const stopMinute = stopTime % 60;
      const formattedStopTime = `${stopHour
        .toString()
        .padStart(2, "0")}:${stopMinute.toString().padStart(2, "0")}`;
      await prisma.timetableEntry.create({
        data: {
          id: `tt_${routeId}_${stopId}_${departureTime.replace(":", "")}_${
            isHoliday ? "h" : isWeekend ? "we" : "wd"
          }`,
          routeId,
          stopId,
          departureTime: formattedStopTime,
          isHoliday,
          isWeekday,
          isWeekend,
          validFrom: new Date(),
          validUntil: addMonths(new Date(), 3),
        },
      });
    }
    currentTime += frequencyMinutes;
    if (currentTime >= 24 * 60) currentTime %= 24 * 60;
  }
}

function addMonths(date, months) {
  const newDate = new Date(date);
  newDate.setMonth(newDate.getMonth() + months);
  return newDate;
}

function addDays(date, days) {
  const newDate = new Date(date);
  newDate.setDate(newDate.getDate() + days);
  return newDate;
}

/**
 * Generate trips based on timetable entries
 */
async function generateTrips() {
  const currentDate = new Date();
  const endDate = addDays(currentDate, 7);
  const allTrips = [];

  for (let day = new Date(currentDate); day <= endDate; day = addDays(day, 1)) {
    const isHoliday = isPublicHoliday(day);
    const isWeekend = [0, 6].includes(day.getDay());
    let timetableEntries;

    if (isHoliday) {
      timetableEntries = await prisma.timetableEntry.findMany({
        where: { isHoliday: true },
        include: {
          route: true,
          stop: {
            include: {
              RouteStop: true,
            },
          },
        },
        orderBy: [
          { routeId: "asc" },
          { stopId: "asc" },
          { departureTime: "asc" },
        ],
      });
    } else if (isWeekend) {
      timetableEntries = await prisma.timetableEntry.findMany({
        where: { isWeekend: true, isHoliday: false },
        include: {
          route: true,
          stop: {
            include: {
              RouteStop: true,
            },
          },
        },
        orderBy: [
          { routeId: "asc" },
          { stopId: "asc" },
          { departureTime: "asc" },
        ],
      });
    } else {
      timetableEntries = await prisma.timetableEntry.findMany({
        where: { isWeekday: true, isHoliday: false },
        include: {
          route: true,
          stop: {
            include: {
              RouteStop: true,
            },
          },
        },
        orderBy: [
          { routeId: "asc" },
          { stopId: "asc" },
          { departureTime: "asc" },
        ],
      });
    }

    const routeGroups = {};
    for (const entry of timetableEntries) {
      const key = `${entry.routeId}_${entry.departureTime}`;
      if (!routeGroups[key]) routeGroups[key] = [];
      routeGroups[key].push(entry);
    }

    for (const [key, entries] of Object.entries(routeGroups)) {
      entries.sort(
        (a, b) => a.stop.RouteStop[0].stopOrder - b.stop.RouteStop[0].stopOrder
      );
      if (entries.length < 2) continue;

      const routeId = entries[0].routeId;
      const firstEntry = entries[0];
      const lastEntry = entries[entries.length - 1];
      const [hours, minutes] = firstEntry.departureTime.split(":").map(Number);
      const departureDate = new Date(day);
      departureDate.setHours(hours, minutes, 0, 0);
      const [arrHours, arrMinutes] = lastEntry.departureTime
        .split(":")
        .map(Number);
      const arrivalDate = new Date(day);
      arrivalDate.setHours(arrHours, arrMinutes, 0, 0);
      if (arrivalDate < departureDate)
        arrivalDate.setDate(arrivalDate.getDate() + 1);

      const trip = await prisma.trip.create({
        data: {
          id: `trip_${routeId}_${formatDate(
            day
          )}_${firstEntry.departureTime.replace(":", "")}`,
          routeId,
          timetableEntryId: firstEntry.id,
          vehicleType: getVehicleType(firstEntry.route),
          capacity: getVehicleCapacity(firstEntry.route),
          features: generateVehicleFeatures(),
          date: day,
          departureTime: departureDate,
          arrivalTime: arrivalDate,
          status: getTripStatus(departureDate, arrivalDate),
        },
      });
      allTrips.push(trip);
    }
  }
  return allTrips;
}

/**
 * Generate occupancy data for trips
 */
async function generateOccupancyData(trips) {
  for (const trip of trips) {
    const tripDate = new Date(trip.date);
    const departureHour = trip.departureTime.getHours();
    const isRushHour =
      RUSH_HOURS_MORNING.includes(departureHour) ||
      RUSH_HOURS_EVENING.includes(departureHour);
    const isWeekend = [0, 6].includes(tripDate.getDay());
    let baseOccupancy =
      isRushHour && !isWeekend
        ? 0.7
        : !isRushHour && !isWeekend
        ? 0.4
        : isRushHour && isWeekend
        ? 0.5
        : 0.3;

    const tripDuration = (trip.arrivalTime - trip.departureTime) / (1000 * 60);
    const numReadings = Math.max(2, Math.floor(tripDuration / 10));

    for (let i = 0; i < numReadings; i++) {
      const percentComplete = i / (numReadings - 1);
      let occupancyFactor =
        percentComplete < 0.3
          ? baseOccupancy * ((percentComplete / 0.3) * 0.7 + 0.3)
          : percentComplete < 0.7
          ? baseOccupancy * (0.9 + Math.random() * 0.2)
          : baseOccupancy * (1 - ((percentComplete - 0.7) / 0.3) * 0.7);
      occupancyFactor *= 0.9 + Math.random() * 0.2;
      occupancyFactor = Math.max(0, Math.min(1, occupancyFactor));

      const timestamp = new Date(trip.departureTime);
      timestamp.setMinutes(
        timestamp.getMinutes() + percentComplete * tripDuration
      );
      const totalPassengers = Math.floor(trip.capacity * occupancyFactor);
      const seated = Math.min(totalPassengers, Math.floor(trip.capacity * 0.6));
      const standing = totalPassengers - seated;

      await prisma.occupancyData.create({
        data: {
          id: `occ_${trip.id}_${i}`,
          tripId: trip.id,
          timestamp,
          count: totalPassengers,
          percentage: occupancyFactor,
          seated,
          standing,
          capacity: trip.capacity,
        },
      });
    }
  }
}

/**
 * Generate route prediction data
 */
async function generatePredictions() {
  const routes = await prisma.route.findMany();
  const startDate = new Date();
  const endDate = addDays(startDate, 7);

  for (const route of routes) {
    for (let day = new Date(startDate); day <= endDate; day = addDays(day, 1)) {
      const dayOfWeek = day.getDay();
      const isWeekend = [0, 6].includes(dayOfWeek);
      const predictedOccupancy = {};

      for (let hour = 0; hour < 24; hour++) {
        let baseOccupancy =
          RUSH_HOURS_MORNING.includes(hour) && !isWeekend
            ? 0.65 + Math.random() * 0.15
            : RUSH_HOURS_EVENING.includes(hour) && !isWeekend
            ? 0.7 + Math.random() * 0.2
            : hour >= 10 && hour <= 14
            ? 0.3 + Math.random() * 0.2
            : hour >= 19 && hour <= 22
            ? 0.3 + Math.random() * 0.15
            : hour >= 23 || hour < 6
            ? 0.1 + Math.random() * 0.1
            : 0.2 + Math.random() * 0.3;
        if (isWeekend)
          baseOccupancy =
            hour >= 10 && hour <= 18
              ? 0.4 + Math.random() * 0.2
              : baseOccupancy * 0.7;
        predictedOccupancy[hour] = {
          average: baseOccupancy,
          peak: baseOccupancy + 0.1 + Math.random() * 0.1,
          low: baseOccupancy - 0.1 - Math.random() * 0.1,
        };
      }

      await prisma.prediction.create({
        data: {
          id: `pred_${route.id}_${formatDate(day)}`,
          routeId: route.id,
          date: day,
          predictedOccupancy,
          confidence: 0.8 + Math.random() * 0.15,
        },
      });
    }
  }
}

// Helper Functions
function generateRandomAccessibility() {
  const features = [
    "Wheelchair accessible",
    "Visual guide markings",
    "Audio announcements",
    "Tactile paving",
    "Level boarding",
    "Lowered platform",
    "Ramp available",
  ];
  const numFeatures = Math.floor(Math.random() * 4);
  const selectedFeatures = [];
  for (let i = 0; i < numFeatures; i++) {
    const randomFeature = features[Math.floor(Math.random() * features.length)];
    if (!selectedFeatures.includes(randomFeature))
      selectedFeatures.push(randomFeature);
  }
  return selectedFeatures.length > 0 ? selectedFeatures.join(", ") : null;
}

function generateOperatingHours(routeType) {
  switch (routeType) {
    case 0:
    case 1:
      return "Mon-Fri: 05:30-00:30, Sat-Sun: 06:00-00:00";
    case 3:
      return "Mon-Fri: 06:00-23:00, Sat-Sun: 07:00-22:00";
    case 11:
      return "Mon-Fri: 06:00-22:30, Sat-Sun: 07:00-22:00";
    default:
      return "Mon-Sun: 06:00-22:00";
  }
}

function getVehicleType(route) {
  const name = route.name.toLowerCase();
  if (name.includes("tram")) return "Tram";
  if (name.includes("metro") || name.includes("subway")) return "Metro";
  if (name.includes("trolley")) return "Trolleybus";
  return "Bus";
}

function getVehicleCapacity(route) {
  switch (getVehicleType(route)) {
    case "Tram":
      return Math.floor(Math.random() * (200 - 100 + 1)) + 100;
    case "Metro":
      return Math.floor(Math.random() * (300 - 150 + 1)) + 150;
    case "Trolleybus":
      return Math.floor(Math.random() * (120 - 80 + 1)) + 80;
    default:
      return Math.floor(Math.random() * (50 - 20 + 1)) + 20;
  }
}

function generateVehicleFeatures() {
  const features = [
    "WiFi",
    "USB charging ports",
    "Air conditioning",
    "Bike racks",
    "Priority seating",
    "Real-time tracking",
  ];
  const numFeatures = Math.floor(Math.random() * 4);
  const selectedFeatures = [];
  for (let i = 0; i < numFeatures; i++) {
    const randomFeature = features[Math.floor(Math.random() * features.length)];
    if (!selectedFeatures.includes(randomFeature))
      selectedFeatures.push(randomFeature);
  }
  return selectedFeatures.length > 0 ? selectedFeatures.join(", ") : null;
}

function getTripStatus(departureTime, arrivalTime) {
  const now = new Date();
  if (arrivalTime < now) return "completed";
  if (departureTime < now && arrivalTime > now) return "in progress";
  return "scheduled";
}

function isPublicHoliday(date) {
  const holidays = [
    new Date(date.getFullYear(), 0, 1),
    new Date(date.getFullYear(), 11, 25),
  ];
  return holidays.some(
    (holiday) => holiday.toDateString() === date.toDateString()
  );
}

function formatDate(date) {
  return date.toISOString().split("T")[0];
}

/**
 * Main entry point
 */
async function main() {
  console.log(colors.blue("Starting data population..."));
  await populateDatabase();
  console.log(colors.green("Data population completed!"));
}
main().catch((error) => {
  console.error(colors.red("Error in main function:"), error);
  process.exit(1);
});
