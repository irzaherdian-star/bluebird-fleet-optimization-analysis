/**
 * BLUE BIRD ANALYTICS WEB APP
 * Backend Apps Script
 *
 * SETUP:
 * 1. Paste this file into Code.gs.
 * 2. Set SPREADSHEET_ID below to the ID of your Google Sheets workbook.
 * 3. Add an HTML file named Index and paste Index.html into it.
 * 4. Deploy > New deployment > Web app.
 */

const APP_CONFIG = {
  SPREADSHEET_ID: '1trFy2CrXb8UzKBeynMWKrczxc6okz2J6s9LUM8pXU4U',
  TIME_ZONE: 'Asia/Jakarta',
  SHEETS: {
    KPI: 'KPI',
    POOL_DAILY: 'Daily_Fleet',
    DEMAND_DAILY: 'Daily_Demand',
    EVOUCHER_DAILY: 'Daily_eVoucher',
    HOURLY: 'Supply_Demand_Hourly'
  }
};

function doGet() {
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('Blue Bird | Fleet & eVoucher Analytics')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function getSpreadsheet_() {
  if (!APP_CONFIG.SPREADSHEET_ID ||
      APP_CONFIG.SPREADSHEET_ID === 'PASTE_GOOGLE_SHEETS_ID_HERE') {
    throw new Error('SPREADSHEET_ID belum diisi. Salin ID Google Sheets ke APP_CONFIG di Code.gs.');
  }
  return SpreadsheetApp.openById(APP_CONFIG.SPREADSHEET_ID);
}

function getDashboardData(filters) {
  const ss = getSpreadsheet_();
  const start = String((filters && filters.startDate) || '2023-10-01');
  const end = String((filters && filters.endDate) || '2023-12-29');
  const poolFilter = String((filters && filters.pool) || 'ALL');
  const zoneFilter = String((filters && filters.zone) || 'ALL');

  const fleetRows = readRows_(ss, APP_CONFIG.SHEETS.POOL_DAILY);
  const demandRows = readRows_(ss, APP_CONFIG.SHEETS.DEMAND_DAILY);
  const evRows = readRows_(ss, APP_CONFIG.SHEETS.EVOUCHER_DAILY);
  const hourlyRows = readRows_(ss, APP_CONFIG.SHEETS.HOURLY);

  // Daily_Fleet: date, pool_name, primary_zone_affinity, shifts, drivers,
  // trips, avg_trips_per_shift, idle_minutes, avg_idle_minutes,
  // zero_trip_shifts, revenue, zero_trip_rate_pct
  const fleet = fleetRows.filter(r =>
    inRange_(r[0], start, end) &&
    (poolFilter === 'ALL' || String(r[1]) === poolFilter)
  );

  // Daily_Demand: date, pickup_zone_type, hour, requests, fulfilled,
  // unfulfilled, fulfillment_pct
  const demand = demandRows.filter(r =>
    inRange_(r[0], start, end) &&
    (zoneFilter === 'ALL' || String(r[1]) === zoneFilter)
  );

  // Daily_eVoucher: date, location_group, time_window, pool_name, trips,
  // evoucher_trips, evoucher_fare, evoucher_share_pct
  const evoucher = evRows.filter(r =>
    inRange_(r[0], start, end) &&
    (poolFilter === 'ALL' || String(r[3]) === poolFilter)
  );

  const sum = (rows, index) => rows.reduce((a, r) => a + num_(r[index]), 0);
  const trips = sum(fleet, 5);
  const shifts = sum(fleet, 3);
  const idleTotal = sum(fleet, 7);
  const zeroShifts = sum(fleet, 9);
  const requests = sum(demand, 3);
  const fulfilled = sum(demand, 4);
  const evTrips = sum(evoucher, 5);
  const evFare = sum(evoucher, 6);
  const totalTripsForEv = sum(evoucher, 4);

  const poolMap = {};
  fleet.forEach(r => {
    const key = String(r[1] || 'Unknown');
    if (!poolMap[key]) poolMap[key] = {pool:key, trips:0, shifts:0, idle:0, revenue:0};
    poolMap[key].trips += num_(r[5]);
    poolMap[key].shifts += num_(r[3]);
    poolMap[key].idle += num_(r[7]);
    poolMap[key].revenue += num_(r[10]);
  });
  const poolChart = Object.keys(poolMap).map(k => {
    const x = poolMap[k];
    return {label:x.pool, value:x.shifts ? x.trips/x.shifts : 0};
  }).sort((a,b) => b.value-a.value);

  const zoneMap = {};
  demand.forEach(r => {
    const key = String(r[1] || 'Unknown');
    if (!zoneMap[key]) zoneMap[key] = {zone:key, requests:0, fulfilled:0};
    zoneMap[key].requests += num_(r[3]);
    zoneMap[key].fulfilled += num_(r[4]);
  });
  const zoneChart = Object.keys(zoneMap).map(k => {
    const x = zoneMap[k];
    return {label:x.zone, value:x.requests ? 100*x.fulfilled/x.requests : 0,
      requests:x.requests, unfulfilled:x.requests-x.fulfilled};
  }).sort((a,b) => a.value-b.value);

  const evMap = {};
  evoucher.forEach(r => {
    const key = String(r[2] || 'Unknown');
    if (!evMap[key]) evMap[key] = {window:key, trips:0, fare:0};
    evMap[key].trips += num_(r[5]);
    evMap[key].fare += num_(r[6]);
  });
  const evChart = Object.keys(evMap).map(k => ({label:k, value:evMap[k].trips, fare:evMap[k].fare}));

  // Supply-demand hourly table is a period-level aggregate, not date-grained.
  const hourlyChart = hourlyRows.map(r => ({
    hour: String(r[0]),
    drivers: num_(r[1]),
    requests: num_(r[2])
  })).sort((a,b) => Number(a.hour)-Number(b.hour));

  const poolOptions = unique_(fleetRows.map(r => r[1]));
  const zoneOptions = unique_(demandRows.map(r => r[1]));

  return {
    period: {start:start, end:end},
    filters: {pool:poolFilter, zone:zoneFilter},
    kpis: {
      trips: trips,
      shifts: shifts,
      tripPerShift: shifts ? trips/shifts : 0,
      idleMinutes: shifts ? idleTotal/shifts : 0,
      fulfillment: requests ? 100*fulfilled/requests : 0,
      requests: requests,
      unfulfilled: requests-fulfilled,
      zeroTripRate: shifts ? 100*zeroShifts/shifts : 0,
      evoucherTrips: evTrips,
      evoucherShare: totalTripsForEv ? 100*evTrips/totalTripsForEv : 0,
      evoucherFare: evFare
    },
    charts: {pool:poolChart, zone:zoneChart, hourly:hourlyChart, evoucher:evChart},
    options: {pools:poolOptions, zones:zoneOptions},
    meta: {fleetRows:fleet.length, demandRows:demand.length, evoucherRows:evoucher.length}
  };
}

function getInitialDashboardData() {
  return getDashboardData({startDate:'2023-10-01', endDate:'2023-12-29', pool:'ALL', zone:'ALL'});
}

function readRows_(ss, name) {
  const sh = ss.getSheetByName(name);
  if (!sh) throw new Error('Sheet "' + name + '" tidak ditemukan di workbook.');
  const values = sh.getDataRange().getValues();
  return values.length > 1 ? values.slice(1) : [];
}

function inRange_(value, start, end) {
  const d = normalizeDate_(value);
  return d && d >= start && d <= end;
}

function normalizeDate_(value) {
  if (value instanceof Date && !isNaN(value.getTime())) {
    return Utilities.formatDate(value, APP_CONFIG.TIME_ZONE, 'yyyy-MM-dd');
  }
  const s = String(value || '').trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  const d = new Date(s);
  if (!isNaN(d.getTime())) return Utilities.formatDate(d, APP_CONFIG.TIME_ZONE, 'yyyy-MM-dd');
  return '';
}

function num_(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function unique_(values) {
  return Array.from(new Set(values.map(v => String(v || '').trim()).filter(Boolean))).sort();
}
