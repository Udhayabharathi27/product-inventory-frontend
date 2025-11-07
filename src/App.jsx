import { useState, useEffect } from 'react'
import axios from 'axios'
import './App.css'

// In App.jsx
// Replace the API_BASE_URL with your live backend
const API_BASE_URL = 'https://product-inventory-backend-eg9l.onrender.com/api';
// Dashboard Component with Graphs
function DashboardPage({ inventory, totalItems, totalValue, lowStockItems, recentItems, getCategoryIcon }) {
  // Calculate data for charts
  const categoryData = inventory.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + 1
    return acc
  }, {})

  const categoryNames = Object.keys(categoryData)
  const categoryCounts = Object.values(categoryData)
  const maxCount = Math.max(...categoryCounts, 1)

  // Top items by value
  const topItems = [...inventory]
    .sort((a, b) => (b.price * b.stock) - (a.price * a.stock))
    .slice(0, 5)

  // Stock level distribution
  const stockLevels = {
    low: inventory.filter(item => item.stock < 20).length,
    medium: inventory.filter(item => item.stock >= 20 && item.stock < 50).length,
    high: inventory.filter(item => item.stock >= 50).length
  }

  const inStockItems = inventory.filter(item => item.stock >= 20).length
  const mediumStock = inventory.filter(item => item.stock >= 20 && item.stock < 50).length
  const highStock = inventory.filter(item => item.stock >= 50).length

  return (
    <div className="dashboard-page">
      <div className="page-title-section">
        <h1>Inventory Dashboard</h1>
        <div className="breadcrumb">General {'>'} All Inventory</div>
      </div>

      <div className="summary-cards">
        <div className="summary-card paid">
          <div className="summary-card-icon">✅</div>
          <div className="summary-card-content">
            <div className="summary-card-label">In Stock</div>
            <div className="summary-card-value">Items: {inStockItems}</div>
            <div className="summary-card-amount">Value: ${(inventory.filter(item => item.stock >= 20).reduce((sum, item) => sum + (item.price * item.stock), 0) / 1000).toFixed(1)}K</div>
          </div>
        </div>
        <div className="summary-card unpaid">
          <div className="summary-card-icon">⏰</div>
          <div className="summary-card-content">
            <div className="summary-card-label">Medium Stock</div>
            <div className="summary-card-value">Items: {mediumStock}</div>
            <div className="summary-card-amount">Value: ${(inventory.filter(item => item.stock >= 20 && item.stock < 50).reduce((sum, item) => sum + (item.price * item.stock), 0) / 1000).toFixed(1)}K</div>
          </div>
        </div>
        <div className="summary-card overdue">
          <div className="summary-card-icon">⚠️</div>
          <div className="summary-card-content">
            <div className="summary-card-label">Low Stock</div>
            <div className="summary-card-value">Items: {lowStockItems}</div>
            <div className="summary-card-amount">Value: ${(inventory.filter(item => item.stock < 20).reduce((sum, item) => sum + (item.price * item.stock), 0) / 1000).toFixed(1)}K</div>
          </div>
        </div>
        <div className="summary-card draft">
          <div className="summary-card-icon">📦</div>
          <div className="summary-card-content">
            <div className="summary-card-label">Total Items</div>
            <div className="summary-card-value">Items: {totalItems}</div>
            <div className="summary-card-amount">Value: ${(totalValue / 1000).toFixed(1)}K</div>
          </div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h3>Items by Category</h3>
          <div className="bar-chart">
            {categoryNames.map((category, index) => (
              <div key={category} className="bar-chart-item">
                <div className="bar-label">{category}</div>
                <div className="bar-container">
                  <div 
                    className="bar-fill"
                    style={{ 
                      width: `${(categoryCounts[index] / maxCount) * 100}%`,
                      background: `linear-gradient(90deg, #7C3AED 0%, #6B46C1 100%)`
                    }}
                  >
                    <span className="bar-value">{categoryCounts[index]}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="chart-card">
          <h3>Stock Level Distribution</h3>
          <div className="pie-chart-container">
            <div className="pie-chart">
              <div 
                className="pie-segment low"
                style={{ 
                  '--percentage': (stockLevels.low / totalItems) * 100,
                  '--color': '#ef4444'
                }}
              ></div>
              <div 
                className="pie-segment medium"
                style={{ 
                  '--percentage': (stockLevels.medium / totalItems) * 100,
                  '--color': '#f59e0b',
                  '--offset': (stockLevels.low / totalItems) * 100
                }}
              ></div>
              <div 
                className="pie-segment high"
                style={{ 
                  '--percentage': (stockLevels.high / totalItems) * 100,
                  '--color': '#10b981',
                  '--offset': ((stockLevels.low + stockLevels.medium) / totalItems) * 100
                }}
              ></div>
            </div>
            <div className="pie-legend">
              <div className="legend-item">
                <span className="legend-color" style={{ background: '#ef4444' }}></span>
                <span>Low: {stockLevels.low}</span>
              </div>
              <div className="legend-item">
                <span className="legend-color" style={{ background: '#f59e0b' }}></span>
                <span>Medium: {stockLevels.medium}</span>
              </div>
              <div className="legend-item">
                <span className="legend-color" style={{ background: '#10b981' }}></span>
                <span>High: {stockLevels.high}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="chart-card">
          <h3>Top Items by Value</h3>
          <div className="top-items-list">
            {topItems.map((item, index) => (
              <div key={item.id} className="top-item">
                <div className="top-item-rank">{index + 1}</div>
                <div className="top-item-icon">{getCategoryIcon(item.category)}</div>
                <div className="top-item-info">
                  <div className="top-item-name">{item.name}</div>
                  <div className="top-item-value">${(item.price * item.stock).toFixed(2)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="chart-card">
          <h3>Recent Activity</h3>
          <div className="activity-timeline">
            {recentItems.slice(0, 5).map((item, index) => (
              <div key={item.id} className="timeline-item">
                <div className="timeline-dot">{getCategoryIcon(item.category)}</div>
                <div className="timeline-content">
                  <div className="timeline-title">{item.name} added</div>
                  <div className="timeline-date">{new Date(item.created_at).toLocaleDateString()}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// All Items Page with List/Table View
function AllItemsPage({ 
  inventory, 
  filteredInventory, 
  searchTerm, 
  setSearchTerm,
  filterCategory,
  setFilterCategory,
  categories,
  handleAdd,
  handleEdit,
  handleDelete 
}) {
  return (
    <div className="all-items-page">
      <div className="page-title-section">
        <div>
          <h1>All Inventory Items</h1>
          <div className="breadcrumb">General {'>'} All Items</div>
        </div>
        <button className="btn-create" onClick={handleAdd}>
          + Add Product
        </button>
      </div>

      <div className="list-controls">
        <input
          type="text"
          placeholder="🔍 Search products..."
          className="search-input-main"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          className="filter-dropdown"
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
        >
          <option value="All">All Categories</option>
          {categories.filter(cat => cat !== 'All').map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      <div className="table-wrapper">
        <table className="items-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Product Name</th>
              <th>Category</th>
              <th>Stock</th>
              <th>Price</th>
              <th>Total Value</th>
              <th>Created Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredInventory.length === 0 ? (
              <tr>
                <td colSpan="8" className="no-data-cell">
                  <div className="no-data-message">
                    <span>📭</span>
                    <p>No products found</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredInventory.map(item => (
                <tr key={item.id} className={item.stock < 20 ? 'low-stock-row' : ''}>
                  <td>{item.id}</td>
                  <td>
                    <div className="item-name-cell">
                      <strong>{item.name}</strong>
                    </div>
                  </td>
                  <td>
                    <span className="category-tag">{item.category}</span>
                  </td>
                  <td>
                    <span className={item.stock < 20 ? 'quantity-low' : 'quantity-ok'}>
                      {item.stock}
                    </span>
                  </td>
                  <td>${parseFloat(item.price).toFixed(2)}</td>
                  <td>${(parseFloat(item.price) * item.stock).toFixed(2)}</td>
                  <td>{new Date(item.created_at).toLocaleDateString()}</td>
                  <td>
                    <div className="table-actions">
                      <button className="btn-edit-small" onClick={() => handleEdit(item)}>
                        ✏️ Edit
                      </button>
                      <button className="btn-delete-small" onClick={() => handleDelete(item.id)}>
                        🗑️ Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// Low Stock Page
function LowStockPage({ inventory, handleEdit, handleDelete, getCategoryIcon }) {
  const lowStockItems = inventory.filter(item => item.stock < 20)

  return (
    <div className="low-stock-page">
      <div className="page-title-section">
        <div>
          <h1>Low Stock Items</h1>
          <div className="breadcrumb">General {'>'} Low Stock</div>
        </div>
        <div className="alert-badge">{lowStockItems.length} items need attention</div>
      </div>

      <div className="low-stock-grid">
        {lowStockItems.length === 0 ? (
          <div className="no-items">All items are well stocked! 🎉</div>
        ) : (
          lowStockItems.map(item => (
            <div key={item.id} className="low-stock-card">
              <div className="low-stock-icon">{getCategoryIcon(item.category)}</div>
              <div className="low-stock-content">
                <h3>{item.name}</h3>
                <p className="low-stock-category">{item.category}</p>
                <div className="low-stock-info">
                  <div className="stock-warning">
                    <span className="warning-icon">⚠️</span>
                    <span>Only {item.stock} left</span>
                  </div>
                  <div className="stock-price">${parseFloat(item.price).toFixed(2)} each</div>
                </div>
                <div className="low-stock-actions">
                  <button className="btn-edit-small" onClick={() => handleEdit(item)}>
                    Update Stock
                  </button>
                  <button className="btn-delete-small" onClick={() => handleDelete(item.id)}>
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

// Suppliers Page
function SuppliersPage({ inventory }) {
  const categories = [...new Set(inventory.map(item => item.category))]
  const categoryData = categories.map(category => {
    const items = inventory.filter(item => item.category === category)
    const totalValue = items.reduce((sum, item) => sum + (parseFloat(item.price) * item.stock), 0)
    return {
      name: category,
      itemCount: items.length,
      totalValue
    }
  })

  return (
    <div className="suppliers-page">
      <div className="page-title-section">
        <div>
          <h1>Categories</h1>
          <div className="breadcrumb">General {'>'} Categories</div>
        </div>
      </div>

      <div className="suppliers-grid">
        {categoryData.map((category, index) => (
          <div key={index} className="supplier-card">
            <div className="supplier-avatar">🏷️</div>
            <h3>{category.name}</h3>
            <div className="supplier-stats">
              <div className="supplier-stat">
                <span className="stat-label">Products</span>
                <span className="stat-value">{category.itemCount}</span>
              </div>
              <div className="supplier-stat">
                <span className="stat-label">Total Value</span>
                <span className="stat-value">${(category.totalValue / 1000).toFixed(1)}K</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Reports Page
function ReportsPage({ inventory, totalItems, totalValue }) {
  const categoryBreakdown = inventory.reduce((acc, item) => {
    const category = item.category || 'Uncategorized'
    if (!acc[category]) {
      acc[category] = { count: 0, value: 0 }
    }
    acc[category].count += 1
    acc[category].value += parseFloat(item.price) * item.stock
    return acc
  }, {})

  return (
    <div className="reports-page">
      <div className="page-title-section">
        <div>
          <h1>Inventory Reports</h1>
          <div className="breadcrumb">General {'>'} Reports</div>
        </div>
      </div>

      <div className="reports-content">
        <div className="report-card">
          <h3>📊 Summary Report</h3>
          <div className="report-data">
            <div className="report-item">
              <span>Total Products:</span>
              <strong>{totalItems}</strong>
            </div>
            <div className="report-item">
              <span>Total Inventory Value:</span>
              <strong>${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong>
            </div>
            <div className="report-item">
              <span>Low Stock Items:</span>
              <strong>{inventory.filter(item => item.stock < 20).length}</strong>
            </div>
          </div>
        </div>

        <div className="report-card">
          <h3>📈 Category Breakdown</h3>
          <div className="report-list">
            {Object.entries(categoryBreakdown).map(([category, data]) => (
              <div key={category} className="report-list-item">
                <span>{category}</span>
                <strong>{data.count} items - ${data.value.toFixed(2)}</strong>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// Settings Page
function SettingsPage() {
  return (
    <div className="settings-page">
      <div className="page-title-section">
        <div>
          <h1>Settings</h1>
          <div className="breadcrumb">General {'>'} Settings</div>
        </div>
      </div>

      <div className="settings-content">
        <div className="settings-section">
          <h3>General Settings</h3>
          <div className="setting-item">
            <label>Low Stock Threshold</label>
            <input type="number" defaultValue="20" />
          </div>
          <div className="setting-item">
            <label>Currency</label>
            <select>
              <option>USD ($)</option>
              <option>EUR (€)</option>
              <option>GBP (£)</option>
            </select>
          </div>
        </div>

        <div className="settings-section">
          <h3>Notifications</h3>
          <div className="setting-item">
            <label>
              <input type="checkbox" defaultChecked />
              Email notifications for low stock
            </label>
          </div>
          <div className="setting-item">
            <label>
              <input type="checkbox" defaultChecked />
              Weekly inventory reports
            </label>
          </div>
        </div>
      </div>
    </div>
  )
}

// Main App Component
function App() {
  const [inventory, setInventory] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [activeNav, setActiveNav] = useState('Dashboard')
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    stock: ''
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('All')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Load products from backend API
  const fetchProducts = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${API_BASE_URL}/products`)
      if (response.data.success) {
        setInventory(response.data.data)
      }
    } catch (err) {
      setError('Failed to fetch products')
      console.error('Error fetching products:', err)
    } finally {
      setLoading(false)
    }
  }

  // Load products on component mount
  useEffect(() => {
    fetchProducts()
  }, [])

  // Get unique categories for filter
  const categories = ['All', ...new Set(inventory.map(item => item.category))]

  // Filter inventory based on search and category
  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (item.category && item.category.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesCategory = filterCategory === 'All' || item.category === filterCategory
    return matchesSearch && matchesCategory
  })

  // Calculate statistics
  const totalItems = inventory.length
  const totalValue = inventory.reduce((sum, item) => sum + (parseFloat(item.price) * item.stock), 0)
  const lowStockItems = inventory.filter(item => item.stock < 20).length
  const recentItems = [...inventory].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 5)

  // Open modal for adding new product
  const handleAdd = () => {
    setEditingItem(null)
    setFormData({
      name: '',
      category: '',
      price: '',
      stock: ''
    })
    setIsModalOpen(true)
  }

  // Open modal for editing existing product
  const handleEdit = (item) => {
    setEditingItem(item)
    setFormData({
      name: item.name,
      category: item.category,
      price: item.price.toString(),
      stock: item.stock.toString()
    })
    setIsModalOpen(true)
  }

  // Handle form submission (Create or Update)
  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const productData = {
        name: formData.name,
        category: formData.category,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock)
      }

      if (editingItem) {
        // Update existing product
        await axios.put(`${API_BASE_URL}/products/${editingItem.id}`, productData)
      } else {
        // Create new product
        await axios.post(`${API_BASE_URL}/products`, productData)
      }

      // Refresh the product list
      await fetchProducts()
      setIsModalOpen(false)
      setFormData({
        name: '',
        category: '',
        price: '',
        stock: ''
      })
    } catch (err) {
      setError('Failed to save product')
      console.error('Error saving product:', err)
    }
  }

  // Handle delete
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await axios.delete(`${API_BASE_URL}/products/${id}`)
        await fetchProducts() // Refresh the list
      } catch (err) {
        setError('Failed to delete product')
        console.error('Error deleting product:', err)
      }
    }
  }

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Get category icon
  const getCategoryIcon = (category) => {
    const icons = {
      'Electronics': '💻',
      'Furniture': '🪑',
      'Kitchen': '🍳',
      'Office': '📎',
      'Sports': '⚽'
    }
    return icons[category] || '📦'
  }

  // Generate calendar days
  const currentDate = new Date()
  const currentMonth = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay()
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  
  const calendarDays = []
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(null)
  }
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day)
  }

  // Render current page based on activeNav
  const renderPage = () => {
    if (loading) {
      return <div className="loading">Loading...</div>
    }

    if (error) {
      return <div className="error">{error}</div>
    }

    switch (activeNav) {
      case 'Dashboard':
        return (
          <DashboardPage
            inventory={inventory}
            totalItems={totalItems}
            totalValue={totalValue}
            lowStockItems={lowStockItems}
            recentItems={recentItems}
            getCategoryIcon={getCategoryIcon}
          />
        )
      case 'All Items':
        return (
          <AllItemsPage
            inventory={inventory}
            filteredInventory={filteredInventory}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filterCategory={filterCategory}
            setFilterCategory={setFilterCategory}
            categories={categories}
            handleAdd={handleAdd}
            handleEdit={handleEdit}
            handleDelete={handleDelete}
          />
        )
      case 'Low Stock':
        return (
          <LowStockPage
            inventory={inventory}
            handleEdit={handleEdit}
            handleDelete={handleDelete}
            getCategoryIcon={getCategoryIcon}
          />
        )
      case 'Suppliers':
        return <SuppliersPage inventory={inventory} />
      case 'Reports':
        return (
          <ReportsPage
            inventory={inventory}
            totalItems={totalItems}
            totalValue={totalValue}
          />
        )
      case 'Settings':
        return <SettingsPage />
      default:
        return (
          <DashboardPage
            inventory={inventory}
            totalItems={totalItems}
            totalValue={totalValue}
            lowStockItems={lowStockItems}
            recentItems={recentItems}
            getCategoryIcon={getCategoryIcon}
          />
        )
    }
  }

  return (
    <div className="app">
      {/* Top Bar */}
      <header className="top-bar">
        <div className="top-bar-left">
          <div className="top-logo">
            <div className="top-logo-icon">📦</div>
            <span className="top-logo-text">Inventory Manager</span>
          </div>
        </div>
        <div className="top-bar-center">
          <div className="top-search">
            <span className="search-icon">🔍</span>
            <input 
              type="text" 
              placeholder="Search products..." 
              className="top-search-input" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="top-bar-right">
          <button className="top-icon-btn">🔔</button>
          <div className="top-user-avatar">👤</div>
        </div>
      </header>

      {/* Left Sidebar */}
      <aside className="sidebar">
        <nav className="sidebar-nav">
          <button 
            className={`nav-item ${activeNav === 'Dashboard' ? 'active' : ''}`}
            onClick={() => setActiveNav('Dashboard')}
          >
            <span className="nav-icon">📊</span>
            <span className="nav-text">Dashboard</span>
          </button>
          <button 
            className={`nav-item ${activeNav === 'All Items' ? 'active' : ''}`}
            onClick={() => setActiveNav('All Items')}
          >
            <span className="nav-icon">📋</span>
            <span className="nav-text">All Items</span>
          </button>
          <button 
            className={`nav-item ${activeNav === 'Low Stock' ? 'active' : ''}`}
            onClick={() => setActiveNav('Low Stock')}
          >
            <span className="nav-icon">⚠️</span>
            <span className="nav-text">Low Stock</span>
          </button>
          <button 
            className={`nav-item ${activeNav === 'Suppliers' ? 'active' : ''}`}
            onClick={() => setActiveNav('Suppliers')}
          >
            <span className="nav-icon">🏷️</span>
            <span className="nav-text">Categories</span>
          </button>
          <button 
            className={`nav-item ${activeNav === 'Reports' ? 'active' : ''}`}
            onClick={() => setActiveNav('Reports')}
          >
            <span className="nav-icon">📈</span>
            <span className="nav-text">Reports</span>
          </button>
          <button 
            className={`nav-item ${activeNav === 'Settings' ? 'active' : ''}`}
            onClick={() => setActiveNav('Settings')}
          >
            <span className="nav-icon">⚙️</span>
            <span className="nav-text">Settings</span>
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {renderPage()}
      </main>

      {/* Right Sidebar */}
      <aside className="right-sidebar">
        <div className="calendar-widget">
          <div className="calendar-header">
            <button className="calendar-nav">←</button>
            <h3>{currentMonth}</h3>
            <button className="calendar-nav">→</button>
          </div>
          <div className="calendar-grid">
            {weekDays.map(day => (
              <div key={day} className="calendar-weekday">{day}</div>
            ))}
            {calendarDays.map((day, index) => (
              <div 
                key={index} 
                className={`calendar-day ${day === currentDate.getDate() ? 'today' : ''}`}
              >
                {day}
              </div>
            ))}
          </div>
        </div>

        <div className="recent-activity">
          <div className="activity-header">
            <h3>Recent Products</h3>
          </div>
          <div className="activity-list">
            {recentItems.slice(0, 4).map(item => (
              <div key={item.id} className="activity-item">
                <div className="activity-avatar">{getCategoryIcon(item.category)}</div>
                <div className="activity-info">
                  <div className="activity-name">{item.name}</div>
                  <div className="activity-id">Stock: {item.stock}</div>
                </div>
                <div className="activity-status"></div>
              </div>
            ))}
          </div>
        </div>

        <div className="stats-widget">
          <div className="stat-widget-item">
            <div className="stat-widget-value">{totalItems}</div>
            <div className="stat-widget-label">Total Products</div>
          </div>
          <div className="stat-widget-item">
            <div className="stat-widget-value">${(totalValue / 1000).toFixed(1)}K</div>
            <div className="stat-widget-label">Total Value</div>
          </div>
          <div className="stat-widget-item">
            <div className="stat-widget-value">{lowStockItems}</div>
            <div className="stat-widget-label">Low Stock</div>
          </div>
        </div>
      </aside>

      {/* Modal for Add/Edit */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingItem ? 'Edit Product' : 'Add New Product'}</h2>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}>
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit} className="form">
              <div className="form-group">
                <label>Product Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Category *</label>
                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Price ($) *</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Stock *</label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleInputChange}
                    min="0"
                    required
                  />
                </div>
              </div>
              <div className="form-actions">
                <button type="button" className="btn-cancel" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-submit">
                  {editingItem ? 'Update' : 'Add'} Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default App