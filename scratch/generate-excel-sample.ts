import * as XLSX from "xlsx";
import * as path from "path";

const data = [
  {
    "Company Name": "Reliance Industries Limited",
    "NSE Symbol": "RELIANCE",
    "Quantity": 30,
    "Buy Price": 2550.00,
    "Current Price": 2980.00,
    "Sector": "Energy / Conglomerate"
  },
  {
    "Company Name": "Tata Consultancy Services",
    "NSE Symbol": "TCS",
    "Quantity": 15,
    "Buy Price": 3720.00,
    "Current Price": 4120.00,
    "Sector": "Information Technology"
  },
  {
    "Company Name": "HDFC Bank Limited",
    "NSE Symbol": "HDFCBANK",
    "Quantity": 45,
    "Buy Price": 1520.00,
    "Current Price": 1650.00,
    "Sector": "Financial Services"
  },
  {
    "Company Name": "Infosys Limited",
    "NSE Symbol": "INFY",
    "Quantity": 35,
    "Buy Price": 1460.00,
    "Current Price": 1890.00,
    "Sector": "Information Technology"
  },
  {
    "Company Name": "Hindustan Unilever Limited",
    "NSE Symbol": "HINDUNILVR",
    "Quantity": 15,
    "Buy Price": 2400.00,
    "Current Price": 2750.00,
    "Sector": "FMCG"
  },
  {
    "Company Name": "ICICI Bank Limited",
    "NSE Symbol": "ICICIBANK",
    "Quantity": 40,
    "Buy Price": 1020.00,
    "Current Price": 1230.00,
    "Sector": "Financial Services"
  },
  {
    "Company Name": "Bharti Airtel Limited",
    "NSE Symbol": "BHARTIARTL",
    "Quantity": 30,
    "Buy Price": 1180.00,
    "Current Price": 1540.00,
    "Sector": "Telecommunications"
  },
  {
    "Company Name": "Larsen & Toubro Limited",
    "NSE Symbol": "LT",
    "Quantity": 10,
    "Buy Price": 3350.00,
    "Current Price": 3620.00,
    "Sector": "Capital Goods"
  },
  {
    "Company Name": "Tata Motors Limited",
    "NSE Symbol": "TATAMOTORS",
    "Quantity": 50,
    "Buy Price": 790.00,
    "Current Price": 985.00,
    "Sector": "Automobile"
  },
  {
    "Company Name": "ITC Limited",
    "NSE Symbol": "ITC",
    "Quantity": 80,
    "Buy Price": 430.00,
    "Current Price": 505.00,
    "Sector": "FMCG"
  }
];

const worksheet = XLSX.utils.json_to_sheet(data);
const workbook = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(workbook, worksheet, "Holdings");

const targetPath = path.resolve(__dirname, "../samples/diversified_portfolio.xlsx");
XLSX.writeFile(workbook, targetPath);
console.log("Created Excel file:", targetPath);
