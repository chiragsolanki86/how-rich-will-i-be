// index.js
import React from 'react';
import ReactDOM from 'react-dom';
import WealthCalculator from './WealthCalculator';
import './styles.css';

ReactDOM.render(
  <React.StrictMode>
    <WealthCalculator />
  </React.StrictMode>,
  document.getElementById('root')
);

// WealthCalculator.js
import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const formatInIndianStyle = (num) => {
  const lakhs = 100000;
  const crores = 10000000;
  if (num >= crores) {
    return `₹${(num / crores).toFixed(2)} Cr`;
  } else if (num >= lakhs) {
    return `₹${(num / lakhs).toFixed(2)} L`;
  } else {
    return `₹${num.toLocaleString('en-IN')}`;
  }
};

const WealthCalculator = () => {
  const [inputs, setInputs] = useState({
    currentInvestments: 5000000,
    rateOfReturn: 8,
    sipMonthly: 100000,
    currentSavings: 1000000,
    salaryMonthly: 500000,
    yearlySalaryIncrement: 5,
    inflation: 2,
    years: 20
  });

  const [results, setResults] = useState([]);
  const [startingWealth, setStartingWealth] = useState(0);

  const inputLabels = {
    currentInvestments: "Current Investments (₹)",
    rateOfReturn: "Rate of Return (%)",
    sipMonthly: "Monthly SIP (₹)",
    currentSavings: "Current Savings (₹)",
    salaryMonthly: "Monthly Salary (₹)",
    yearlySalaryIncrement: "Yearly Salary & SIP Increment (%)",
    inflation: "Inflation Rate (%)",
    years: "Investment Period (Years)"
  };

  useEffect(() => {
    calculateWealth();
  }, []);

  const handleInputChange = (name, value) => {
    value = parseFloat(value);
    setInputs(prev => ({ ...prev, [name]: value }));
  };

  const calculateWealth = () => {
    const {
      currentInvestments, rateOfReturn, sipMonthly, currentSavings,
      salaryMonthly, yearlySalaryIncrement, inflation, years
    } = inputs;

    let totalWealth = currentInvestments + currentSavings;
    setStartingWealth(totalWealth);
    let currentSalary = salaryMonthly;
    let currentSIP = sipMonthly;
    const newResults = [];

    for (let year = 1; year <= years; year++) {
      totalWealth *= (1 + rateOfReturn / 100);

      for (let month = 0; month < 12; month++) {
        totalWealth += currentSIP;
        totalWealth *= (1 + rateOfReturn / 100) ** (1/12);
      }

      currentSalary *= (1 + yearlySalaryIncrement / 100);
      currentSIP *= (1 + yearlySalaryIncrement / 100);

      const realWealth = totalWealth / (1 + inflation / 100) ** year;

      newResults.push({
        year,
        totalWealth: Math.round(totalWealth),
        realWealth: Math.round(realWealth),
        monthlySIP: Math.round(currentSIP),
        monthlySalary: Math.round(currentSalary)
      });
    }

    setResults(newResults);
  };

  return (
    <div className="wealth-calculator">
      <h1>Future Wealth Calculator (INR)</h1>
      <div className="input-grid">
        {Object.entries(inputs).map(([key, value]) => (
          <div key={key} className="input-group">
            <label htmlFor={key}>{inputLabels[key]}</label>
            <input
              type="number"
              id={key}
              value={value}
              onChange={(e) => handleInputChange(key, e.target.value)}
            />
          </div>
        ))}
      </div>
      <button onClick={calculateWealth} className="calculate-button">Calculate</button>

      {results.length > 0 && (
        <div className="results">
          <h2>Results</h2>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={results}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis tickFormatter={(value) => formatInIndianStyle(value)} />
                <Tooltip 
                  formatter={(value, name) => [formatInIndianStyle(value), name]}
                  labelFormatter={(label) => `Year ${label}`}
                />
                <Legend />
                <Line type="monotone" dataKey="totalWealth" stroke="#8884d8" name="Total Wealth" />
                <Line type="monotone" dataKey="realWealth" stroke="#82ca9d" name="Real Wealth" />
                <Line type="monotone" dataKey="monthlySIP" stroke="#ffc658" name="Monthly SIP" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="final-results">
            <h3>Final Results:</h3>
            <p>Starting Wealth: {formatInIndianStyle(startingWealth)}</p>
            <p>Final Total Wealth: {formatInIndianStyle(results[results.length - 1].totalWealth)}</p>
            <p>Final Real Wealth: {formatInIndianStyle(results[results.length - 1].realWealth)}</p>
            <p>Wealth Growth (Total): {((results[results.length - 1].totalWealth / startingWealth) - 1).toLocaleString(undefined, {style: 'percent', minimumFractionDigits:2})} </p>
            <p>Wealth Growth (Real): {((results[results.length - 1].realWealth / startingWealth) - 1).toLocaleString(undefined, {style: 'percent', minimumFractionDigits:2})} </p>
            <p>Final Monthly SIP: {formatInIndianStyle(results[results.length - 1].monthlySIP)}</p>
            <p>Final Monthly Salary: {formatInIndianStyle(results[results.length - 1].monthlySalary)}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default WealthCalculator;

// styles.css
body {
  font-family: Arial, sans-serif;
  line-height: 1.6;
  color: #333;
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.wealth-calculator {
  background-color: #f4f4f4;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

h1, h2, h3 {
  color: #2c3e50;
}

.input-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
}

.input-group {
  display: flex;
  flex-direction: column;
}

label {
  margin-bottom: 5px;
  font-weight: bold;
}

input {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.calculate-button {
  background-color: #3498db;
  color: white;
  padding: 10px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}

.calculate-button:hover {
  background-color: #2980b9;
}

.results {
  margin-top: 30px;
}

.chart-container {
  margin-bottom: 20px;
}

.final-results p {
  margin: 5px 0;
}
