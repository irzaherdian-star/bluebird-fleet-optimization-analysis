/**
 * BLUE BIRD - AUTOMATED GOOGLE SHEETS DASHBOARD
 * Jalankan fungsi buildBlueBirdDashboard() setelah workbook Excel
 * diunggah dan dibuka sebagai Google Sheets.
 *
 * Sheet sumber yang diperlukan:
 * KPI, Pool_KPI, Zone_Fulfillment, Supply_Demand_Hourly, eVoucher_Window
 */

const BB_CONFIG = {
  dashboardName: 'Dashboard',
  sourceSheets: ['KPI', 'Pool_KPI', 'Zone_Fulfillment', 'Supply_Demand_Hourly', 'eVoucher_Window'],
  navy: '#0B2E59',
  blue: '#1F6FB2',
  lightBlue: '#A9CBEB',
  yellow: '#F2B705',
  red: '#D64545',
  pale: '#EAF2F8',
  white: '#FFFFFF',
  dark: '#17324D'
};

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Blue Bird Dashboard')
    .addItem('Buat / Perbarui Dashboard', 'buildBlueBirdDashboard')
    .addToUi();
}

function buildBlueBirdDashboard() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const missing = BB_CONFIG.sourceSheets.filter(name => !ss.getSheetByName(name));
  if (missing.length) {
    throw new Error('Sheet sumber belum ditemukan: ' + missing.join(', ') +
      '. Pastikan file data Blue Bird sudah diimpor ke Google Sheets.');
  }

  let dash = ss.getSheetByName(BB_CONFIG.dashboardName);
  if (!dash) dash = ss.insertSheet(BB_CONFIG.dashboardName);
  dash.getCharts().forEach(chart => dash.removeChart(chart));
  dash.clear();
  dash.setHiddenGridlines(true);
  dash.setTabColor(BB_CONFIG.navy);
  dash.setColumnWidths(1, 12, 115);
  dash.setRowHeights(1, 2, 32);

  // Header
  dash.getRange('A1:L2').merge()
    .setValue('BLUE BIRD | FLEET OPTIMIZATION & eVOUCHER MONITORING')
    .setBackground(BB_CONFIG.navy).setFontColor(BB_CONFIG.white)
    .setFontSize(18).setFontWeight('bold')
    .setHorizontalAlignment('center').setVerticalAlignment('middle');
  dash.getRange('A3:L3').merge()
    .setValue('Executive dashboard • Periode analisis: 1 Okt – 29 Des 2023 • Klik menu Blue Bird Dashboard untuk memperbarui')
    .setBackground(BB_CONFIG.pale).setFontColor(BB_CONFIG.dark)
    .setFontSize(9).setHorizontalAlignment('center');

  // KPI cards (label/value pairs are written into merged cells)
  const kpiSheet = ss.getSheetByName('KPI');
  const kpiValues = kpiSheet.getDataRange().getValues();
  const kpis = {};
  kpiValues.slice(1).forEach(row => { if (row[0]) kpis[String(row[0]).trim()] = {value: row[1], unit: row[2]}; });

  const cards = [
    ['Total trip', 'Total trip', '#,##0'],
    ['Total shift', 'Total shift', '#,##0'],
    ['Total request', 'Total request', '#,##0'],
    ['Trip / shift', 'Rata-rata trip per shift', '0.00'],
    ['Idle (menit/shift)', 'Idle rata-rata', '#,##0'],
    ['Fulfillment', 'Fulfillment', '0.0%'],
    ['Shift tanpa trip', 'Shift tanpa trip', '0.0%'],
    ['eVoucher share', 'eVoucher share', '0.0%']
  ];
  const positions = [
    ['A5:C5','A6:C7'], ['D5:F5','D6:F7'], ['G5:I5','G6:I7'], ['J5:L5','J6:L7'],
    ['A9:C9','A10:C11'], ['D9:F9','D10:F11'], ['G9:I9','G10:I11'], ['J9:L9','J10:L11']
  ];
  cards.forEach((card, i) => {
    const [labelRange, valueRange] = positions[i];
    const entry = kpis[card[1]];
    const label = dash.getRange(labelRange).merge();
    label.setValue(card[0]).setBackground(BB_CONFIG.blue).setFontColor(BB_CONFIG.white)
      .setFontWeight('bold').setHorizontalAlignment('center').setVerticalAlignment('middle');
    const value = dash.getRange(valueRange).merge();
    const rawValue = entry ? entry.value : 'N/A';
    // Nilai persentase di file KPI disimpan sebagai angka 0-100,
    // sedangkan format persen Google Sheets membutuhkan pecahan 0-1.
    const displayValue = entry && card[2].includes('%') ? Number(rawValue) / 100 : rawValue;
    value.setValue(displayValue).setNumberFormat(card[2])
      .setBackground(BB_CONFIG.pale).setFontColor(BB_CONFIG.navy)
      .setFontSize(19).setFontWeight('bold').setHorizontalAlignment('center').setVerticalAlignment('middle');
  });

  // Section headings
  section_(dash, 'A13:F13', 'FLEET PRODUCTIVITY');
  section_(dash, 'G13:L13', 'FULFILLMENT PER ZONA');
  section_(dash, 'A30:F30', 'SUPPLY DRIVER VS DEMAND PER JAM');
  section_(dash, 'G30:L30', 'POLA PENGGUNAAN eVOUCHER');

  // Pool productivity chart
  const pool = ss.getSheetByName('Pool_KPI');
  const poolRange = pool.getRange(1, 1, pool.getLastRow(), 5); // pool_name + avg_trips_per_shift
  const poolChart = dash.newChart().setChartType(Charts.ChartType.BAR)
    .addRange(pool.getRange(1,1,pool.getLastRow(),1))
    .addRange(pool.getRange(1,5,pool.getLastRow(),1))
    .setNumHeaders(1).setOption('title', 'Rata-rata Trip per Shift per Pool')
    .setOption('legend', {position: 'none'}).setOption('colors', [BB_CONFIG.blue])
    .setOption('hAxis', {title: 'Trip per shift'})
    .setOption('width', 540).setOption('height', 300)
    .setPosition(14, 1, 0, 0).build();
  dash.insertChart(poolChart);

  // Fulfillment by zone chart
  const zone = ss.getSheetByName('Zone_Fulfillment');
  const zoneChart = dash.newChart().setChartType(Charts.ChartType.BAR)
    .addRange(zone.getRange(1,1,zone.getLastRow(),1))
    .addRange(zone.getRange(1,5,zone.getLastRow(),1))
    .setNumHeaders(1).setOption('title', 'Fulfillment Rate berdasarkan Zona')
    .setOption('legend', {position: 'none'}).setOption('colors', [BB_CONFIG.yellow])
    .setOption('hAxis', {title: 'Fulfillment', format: 'percent', viewWindow: {min: 0, max: 1}})
    .setOption('width', 540).setOption('height', 300)
    .setPosition(14, 7, 0, 0).build();
  dash.insertChart(zoneChart);

  // Hourly supply-demand chart
  const hourly = ss.getSheetByName('Supply_Demand_Hourly');
  const hourlyChart = dash.newChart().setChartType(Charts.ChartType.LINE)
    .addRange(hourly.getRange(1,1,hourly.getLastRow(),3))
    .setNumHeaders(1).setOption('title', 'Rata-rata Driver Aktif vs Request per Jam')
    .setOption('legend', {position: 'bottom'})
    .setOption('series', {0: {color: BB_CONFIG.blue}, 1: {color: BB_CONFIG.red}})
    .setOption('hAxis', {title: 'Jam'})
    .setOption('width', 540).setOption('height', 300)
    .setPosition(31, 1, 0, 0).build();
  dash.insertChart(hourlyChart);

  // eVoucher window chart
  const ev = ss.getSheetByName('eVoucher_Window');
  const evChart = dash.newChart().setChartType(Charts.ChartType.COLUMN)
    .addRange(ev.getRange(1,2,ev.getLastRow(),1))
    .addRange(ev.getRange(1,3,ev.getLastRow(),1))
    .setNumHeaders(1).setOption('title', 'Jumlah eVoucher berdasarkan Waktu')
    .setOption('legend', {position: 'none'}).setOption('colors', [BB_CONFIG.blue])
    .setOption('vAxis', {title: 'Jumlah trip'})
    .setOption('width', 540).setOption('height', 300)
    .setPosition(31, 7, 0, 0).build();
  dash.insertChart(evChart);

  // Notes and interpretation guardrail
  dash.getRange('A47:L47').merge()
    .setValue('CATATAN: Flag eVoucher adalah indikator transaksi yang perlu ditinjau, bukan bukti fraud. Verifikasi dengan dokumen perjalanan, kebijakan klien, dan data operasional.')
    .setWrap(true).setBackground('#FFF4CC').setFontColor(BB_CONFIG.dark)
    .setFontSize(10).setVerticalAlignment('middle');
  dash.setRowHeight(47, 42);
  dash.getRange('A49:L49').merge()
    .setValue('Sumber: tab KPI, Pool_KPI, Zone_Fulfillment, Supply_Demand_Hourly, dan eVoucher_Window pada workbook analisis Blue Bird.')
    .setFontColor('#666666').setFontSize(9);

  dash.setFrozenRows(3);
  dash.activate();
  SpreadsheetApp.flush();
  SpreadsheetApp.getUi().alert('Dashboard Blue Bird berhasil dibuat / diperbarui.');
}

function section_(sheet, rangeA1, title) {
  sheet.getRange(rangeA1).merge().setValue(title)
    .setBackground(BB_CONFIG.navy).setFontColor(BB_CONFIG.white)
    .setFontWeight('bold').setHorizontalAlignment('left')
    .setVerticalAlignment('middle');
}
