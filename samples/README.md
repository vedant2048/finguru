# Sample Portfolio Files

This directory contains test and demo files in various formats (CSV and Excel) that are fully compatible with Wealthzy's portfolio upload and identification pipeline.

---

## Available Sample Files

| File | Format | Description |
| :--- | :--- | :--- |
| **`standard_portfolio.csv`** | CSV | Clean standard Indian equity portfolio containing 10 major NSE stocks (`RELIANCE`, `TCS`, `HDFCBANK`, `INFY`, etc.). |
| **`zerodha_holdings.csv`** | CSV | Mirrors standard **Zerodha Kite** holdings CSV export format (`Instrument`, `Qty.`, `Avg. cost`, `LTP`, `Cur. val`, `P&L`, `Net chg. %`). |
| **`groww_holdings.csv`** | CSV | Mirrors standard **Groww** stock export format (`Stock Name`, `Symbol`, `Shares`, `Average Price`, `Market Price`, etc.). |
| **`diversified_portfolio.xlsx`** | Excel (`.xlsx`) | Multi-sector diversified portfolio spreadsheet containing 10 leading Indian companies across IT, Banking, FMCG, Auto, and Energy. |

---

## How to Test Uploads

1. Navigate to `/portfolio-upload` or `/portfolio` in the browser.
2. Drag and drop any of the files in this `samples/` folder.
3. The pipeline will automatically:
   - Parse the file and detect columns.
   - Resolve symbols to NSE/BSE tickers.
   - Fetch live market prices and 1-year historical charts via Yahoo Finance.
   - Run AI Portfolio Analysis.
