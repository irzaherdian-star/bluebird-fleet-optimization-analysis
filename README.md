# Blue Bird Fleet Optimization & eVoucher Analysis

**Data Analytics Capstone Project – Purwadhika Digital Technology School**

An end-to-end data analytics project investigating fleet productivity, unmet customer demand, operational efficiency, and corporate eVoucher usage at Blue Bird.

---

## Project Overview

This project analyzes Blue Bird's operational data from **October to December 2023** to identify opportunities for improving fleet utilization and strengthening corporate eVoucher monitoring.

The analysis focuses on two main business challenges:

1. **Fleet Optimization:** Low trip productivity, high idle time, and mismatches between driver availability and customer demand.
2. **B2B Fraud Mitigation:** Unusual corporate eVoucher usage patterns that may indicate gaps in transaction monitoring and approval policies.

The project uses Python-based data analysis, statistical testing, and data visualization to translate operational data into actionable business recommendations.

## Business Problems

Blue Bird faces several operational challenges:

- Low average trips per driver shift.
- High idle time across fleet operations.
- Imbalances between driver supply and customer demand.
- Unfulfilled customer requests concentrated in specific zones and hours.
- Unusual corporate eVoucher usage patterns, particularly at airport locations and during weekends or nighttime.

## Project Objectives

- Evaluate fleet productivity across pools and operational zones.
- Identify factors associated with differences in trip productivity.
- Analyze hourly driver supply and customer demand.
- Identify locations and time periods with high unmet demand.
- Assess data quality issues affecting analytical reliability.
- Examine unusual corporate eVoucher usage patterns.
- Develop data-driven recommendations to improve operational efficiency and transaction controls.

## Dataset

The analysis uses six interconnected datasets:

| Dataset | Description |
|---|---|
| Pools | Fleet pool information |
| Corporate Clients | Corporate client information |
| Drivers | Driver profiles |
| Driver Shifts | Driver shift and operational activity |
| Service Requests | Customer service requests |
| Trips | Trip and fare transaction records |

**Analysis period:** October–December 2023.

*Note: Original dataset files are not included in this public repository unless their publication is explicitly authorized.*

## Methodology

The project follows an end-to-end data analytics workflow:

1. **Business Understanding** – Define business problems, stakeholders, and business questions.
2. **Data Understanding** – Explore dataset structures, relationships, and descriptive statistics.
3. **Data Cleaning** – Handle missing values, duplicates, inconsistent categories, and data anomalies.
4. **Feature Engineering & Data Merging** – Prepare analytical features and integrate related datasets.
5. **Exploratory Data Analysis** – Investigate operational patterns and trends.
6. **Statistical Analysis** – Apply statistical tests to evaluate relationships and differences.
7. **Business Impact Assessment** – Estimate potential financial impact.
8. **Recommendations** – Translate analytical findings into operational action plans.

## Key Analytical Areas

### 1. Fleet Optimization

- Trips per shift by pool.
- Driver idle time and utilization.
- Factors associated with fleet productivity.
- Hourly driver supply versus customer demand.

### 2. Unmet Demand Analysis

- Fulfillment rate by pickup zone.
- Hourly demand patterns.
- Concentration of unfulfilled requests.
- Estimated potential revenue loss.

### 3. Data Quality Assessment

- Missing value validation.
- Duplicate checks.
- Service category standardization.
- Timestamp and distance anomaly investigation.
- Cross-table consistency validation.

### 4. Corporate eVoucher Monitoring

- eVoucher usage by time and location.
- Weekend and nighttime usage patterns.
- Client and industry concentration.
- Transactions flagged for further review.

**Important:** Unusual transaction patterns are treated as risk indicators requiring further investigation, not as conclusive evidence of fraud.

## Key Findings

The analysis identified several important findings:

- Average fleet productivity was approximately **1.26 trips per shift**.
- Average idle time was approximately **461 minutes per shift**.
- Only **0.35% of shifts** achieved the analytical target of at least six trips.
- Approximately **6.7% of customer requests** were not fulfilled.
- CBD demand fulfillment during selected peak hours was approximately **63%**.
- Airport eVoucher usage showed a different pattern during weekends and nighttime, with an observed share of approximately **55%**.
- Approximately **5,931 excess eVoucher trips**, valued at around **Rp891 million**, were identified as requiring policy review over the three-month period.

These findings suggest opportunities to improve fleet allocation, shift scheduling, demand fulfillment, and corporate transaction controls.

## Business Recommendations

### Fleet Optimization

- Align driver shift schedules with hourly demand patterns.
- Reallocate fleet capacity toward high-demand zones during peak hours.
- Improve vehicle positioning and dispatch strategies.
- Introduce pool-level productivity and utilization monitoring.

### Unmet Demand

- Prioritize fleet availability in CBD during identified peak hours.
- Monitor fulfillment performance by zone and time.
- Use demand patterns to support operational planning.

### Corporate eVoucher Monitoring

- Strengthen eVoucher approval policies.
- Introduce QR or OTP validation for relevant transaction channels.
- Review unusual time and location patterns.
- Establish periodic transaction transparency reports for corporate clients.

## Tools & Technologies

- Python
- Pandas
- NumPy
- Matplotlib
- Seaborn
- SciPy
- Jupyter Notebook
- Google Sheets
- Google Apps Script

## Repository Structure

```text
bluebird-fleet-optimization-analysis/
│
├── README.md
├── notebooks/
│   └── BlueBird_Irza_Herdian.ipynb
├── dashboard/
│   └── BlueBird_Dashboard.gs
├── reports/
├── images/
├── requirements.txt
└── .gitignore
```

## How to Run

1. Clone this repository:

   ```bash
   git clone https://github.com/YOUR-USERNAME/bluebird-fleet-optimization-analysis.git
   ```

2. Navigate to the project directory:

   ```bash
   cd bluebird-fleet-optimization-analysis
   ```

3. Install the required dependencies:

   ```bash
   pip install -r requirements.txt
   ```

4. Open Jupyter Notebook:

   ```bash
   jupyter notebook
   ```

5. Open the notebook in the `notebooks/` directory.

6. Configure the dataset paths according to your local environment.

*The original datasets must be obtained separately where access is authorized.*

## Dashboard Automation

The repository also includes a Google Apps Script file designed to generate a dashboard in Google Sheets.

The dashboard supports operational monitoring through KPI summaries and charts covering fleet productivity, demand fulfillment, hourly supply-demand patterns, and eVoucher usage.

To use it, upload the prepared analytical data workbook to Google Sheets, open **Extensions → Apps Script**, and execute the dashboard-building function.

## Limitations

- The analysis covers a three-month observation period.
- Location data is based on operational zones rather than precise geographic coordinates.
- Estimated financial impacts depend on analytical assumptions and should be validated by business stakeholders.
- Unusual eVoucher patterns require further operational investigation before any conclusion about misconduct can be made.

## Author

**Irza Herdian**  
Data Analytics Capstone Project  
Purwadhika Digital Technology School

---

*This project was developed for educational and portfolio purposes.*
