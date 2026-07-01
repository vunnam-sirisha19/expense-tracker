import { PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
const COLORS = ['#58a6ff', '#3fb950', '#f78166', '#d2a8ff', '#ffa657', '#79c0ff', '#ff7b9c', '#8b949e'];
function Dashboard() {
  const [expenses, setExpenses] = useState([]);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('food');
  const [note, setNote] = useState('');
  const [date, setDate] = useState('');
  const navigate = useNavigate();
  const categoryData = Object.values(
    expenses.reduce((acc, exp) => {
      if (!acc[exp.category]) {
        acc[exp.category] = { name: exp.category, value: 0 };
      }
      acc[exp.category].value += parseFloat(exp.amount);
      return acc;
    }, {})
  );

  const monthlyData = Object.values(
    expenses.reduce((acc, exp) => {
      const month = new Date(exp.date).toLocaleString('default', { month: 'short', year: '2-digit' });
      if (!acc[month]) {
        acc[month] = { month, total: 0 };
      }
      acc[month].total += parseFloat(exp.amount);
      return acc;
    }, {})
  );
  const fetchExpenses = async () => {
    try {
      const res = await api.get('expenses/');
      setExpenses(res.data);
    } catch (err) {
      console.error('Failed to fetch expenses', err);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleAddExpense = async () => {
    if (!amount || !date) return;
    try {
      await api.post('expenses/', { amount, category, note, date });
      setAmount('');
      setNote('');
      setDate('');
      fetchExpenses();
    } catch (err) {
      console.error('Failed to add expense', err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`expenses/${id}/`);
      fetchExpenses();
    } catch (err) {
      console.error('Failed to delete expense', err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    navigate('/login');
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Expense Tracker</h1>
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </div>
<div className="stats-row">
        <div className="stat-card">
          <div className="stat-label">Total Spent</div>
          <div className="stat-value">₹{expenses.reduce((sum, e) => sum + parseFloat(e.amount), 0).toFixed(2)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Expenses</div>
          <div className="stat-value">{expenses.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">This Month</div>
          <div className="stat-value">
            ₹{expenses
              .filter(e => new Date(e.date).getMonth() === new Date().getMonth())
              .reduce((sum, e) => sum + parseFloat(e.amount), 0)
              .toFixed(2)}
          </div>
        </div>
      </div>
      <div className="add-expense-form">
        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="food">Food</option>
          <option value="transport">Transport</option>
          <option value="rent">Rent</option>
          <option value="utilities">Utilities</option>
          <option value="entertainment">Entertainment</option>
          <option value="shopping">Shopping</option>
          <option value="health">Health</option>
          <option value="other">Other</option>
        </select>
        <input
          type="text"
          placeholder="Note (optional)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <button onClick={handleAddExpense}>Add Expense</button>
      </div>
{expenses.length > 0 && (
        <div className="charts-row">
          <div className="chart-card">
            <h3>Spending by Category</h3>
            <PieChart width={280} height={250}>
              <Pie
                data={categoryData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
              >
                {categoryData.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </div>

          <div className="chart-card">
            <h3>Monthly Spending</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#30363d" />
                <XAxis dataKey="month" stroke="#8b949e" />
                <YAxis stroke="#8b949e" />
                <Tooltip
                  contentStyle={{ background: '#161b22', border: '1px solid #30363d' }}
                />
                <Bar dataKey="total" fill="#58a6ff" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="expense-list">
        <h2>Your Expenses</h2>
        {expenses.length === 0 && <p>No expenses yet.</p>}
        {expenses.map((exp) => (
          <div key={exp.id} className="expense-item">
            <span className="expense-category">{exp.category}</span>
            <span className="expense-amount">₹{exp.amount}</span>
            <span className="expense-date">{exp.date}</span>
            <span className="expense-note">{exp.note}</span>
            <button onClick={() => handleDelete(exp.id)} className="delete-btn">✕</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Dashboard;