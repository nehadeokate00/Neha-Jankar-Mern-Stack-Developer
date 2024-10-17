// TransactionsTable.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TransactionsTable = ({ selectedMonth }) => {
  const [transactions, setTransactions] = useState([]);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [total, setTotal] = useState(0);

  const fetchTransactions = async (searchQuery = '') => {
    const response = await axios.get('http://localhost:3000/transactions', {
      params: {
        page,
        perPage: 10,
        search: searchQuery,
        month: selectedMonth,
      },
    });
    setTransactions(response.data.transactions);
    setTotal(response.data.total);
  };

  useEffect(() => {
    fetchTransactions(search);
  }, [page, selectedMonth]);

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(1); // Reset to first page on search
    fetchTransactions(e.target.value);
  };

  return (
    <div>
      <input
        type="text"
        placeholder="Search transactions..."
        value={search}
        onChange={handleSearch}
      />
      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Description</th>
            <th>Price</th>
            <th>Sale Date</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction) => (
            <tr key={transaction.id}>
              <td>{transaction.title}</td>
              <td>{transaction.description}</td>
              <td>{transaction.price}</td>
              <td>{new Date(transaction.dateOfSale).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div>
        <button onClick={() => setPage(page - 1)} disabled={page === 1}>
          Previous
        </button>
        <button onClick={() => setPage(page + 1)} disabled={page * 10 >= total}>
          Next
        </button>
      </div>
    </div>
  );
};

export default TransactionsTable;
// Statistics.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Statistics = ({ selectedMonth }) => {
  const [stats, setStats] = useState({
    totalSaleAmount: 0,
    soldItemsCount: 0,
    notSoldItemsCount: 0,
  });

  useEffect(() => {
    const fetchStatistics = async () => {
      const response = await axios.get('http://localhost:3000/statistics', {
        params: { month: selectedMonth },
      });
      setStats(response.data);
    };
    fetchStatistics();
  }, [selectedMonth]);

  return (
    <div>
      <h3>Statistics</h3>
      <p>Total Sale Amount: ${stats.totalSaleAmount}</p>
      <p>Total Sold Items: {stats.soldItemsCount}</p>
      <p>Total Not Sold Items: {stats.notSoldItemsCount}</p>
    </div>
  );
};

export default Statistics;
// BarChart.js
import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import axios from 'axios';

const BarChart = ({ selectedMonth }) => {
  const [priceRangeData, setPriceRangeData] = useState([]);

  useEffect(() => {
    const fetchBarChartData = async () => {
      const response = await axios.get('http://localhost:3000/price-range', {
        params: { month: selectedMonth },
      });
      setPriceRangeData(response.data);
    };
    fetchBarChartData();
  }, [selectedMonth]);

  const data = {
    labels: priceRangeData.map((range) => range.range),
    datasets: [
      {
        label: '# of Items',
        data: priceRangeData.map((range) => range.count),
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  return <Bar data={data} />;
};

export default BarChart;
// MonthSelector.js
import React from 'react';

const MonthSelector = ({ selectedMonth, setSelectedMonth }) => {
  const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' },
  ];

  return (
    <select
      value={selectedMonth}
      onChange={(e) => setSelectedMonth(parseInt(e.target.value, 10))}
    >
      {months.map((month) => (
        <option key={month.value} value={month.value}>
          {month.label}
        </option>
      ))}
    </select>
  );
};

export default MonthSelector;
// App.js
import React, { useState } from 'react';
import TransactionsTable from './components/TransactionsTable';
import Statistics from './components/Statistics';
import BarChart from './components/BarChart';
import MonthSelector from './components/MonthSelector';

function App() {
  const [selectedMonth, setSelectedMonth] = useState(3); // Default to March

  return (
    <div>
      <h1>Transactions Dashboard</h1>
      <MonthSelector selectedMonth={selectedMonth} setSelectedMonth={setSelectedMonth} />
      <Statistics selectedMonth={selectedMonth} />
      <TransactionsTable selectedMonth={selectedMonth} />
      <BarChart selectedMonth={selectedMonth} />
    </div>
  );
}

export default App;