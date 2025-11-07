import { useState, useEffect } from 'react'
import './App.css'
import { 
  FaBox, 
  FaChartBar, 
  FaList, 
  FaExclamationTriangle, 
  FaBuilding, 
  FaChartLine, 
  FaCog,
  FaSearch,
  FaBell,
  FaUser,
  FaCheck,
  FaClock,
  FaTrash,
  FaEdit,
  FaInfoCircle,
  FaSun,
  FaMoon,
  FaChevronLeft,
  FaChevronRight,
  FaChevronUp,
  FaChevronDown,
  FaLaptop,
  FaKeyboard,
  FaChair,
  FaTimes,
  FaInbox
} from 'react-icons/fa'

// Sample data (you can replace this with your JSON import)
const sampleData = [
  {
    id: 1,
    name: "MacBook Pro",
    category: "Electronics",
    quantity: 15,
    price: 1999.99,
    supplier: "Apple Inc",
    description: "16-inch MacBook Pro with M1 Pro chip",
    lastUpdated: "2024-01-15"
  },
  {
    id: 2,
    name: "Office Chair",
    category: "Furniture",
    quantity: 8,
    price: 299.99,
    supplier: "Office Comfort",
    description: "Ergonomic office chair with lumbar support",
    lastUpdated: "2024-01-10"
  },
  {
    id: 3,
    name: "Wireless Keyboard",
    category: "Accessories",
    quantity: 25,
    price: 89.99,
    supplier: "TechGear Inc",
    description: "Mechanical wireless keyboard",
    lastUpdated: "2024-01-12"
  },
  {
    id: 4,
    name: "Gaming Monitor",
    category: "Electronics",
    quantity: 5,
    price: 499.99,
    supplier: "DisplayTech",
    description: "27-inch 144Hz gaming monitor",
    lastUpdated: "2024-01-08"
  },
  {
    id: 5,
    name: "Desk Lamp",
    category: "Furniture",
    quantity: 30,
    price: 45.99,
    supplier: "Home Essentials",
    description: "LED desk lamp with adjustable brightness",
    lastUpdated: "2024-01-14"
  }
];

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
    .sort((a, b) => (b.price * b.quantity) - (a.price * a.quantity))
    .slice(0, 5)

  // Stock level distribution
  const stockLevels = {
    low: inventory.filter(item => item.quantity < 20).length,
    medium: inventory.filter(item => item.quantity >= 20 && item.quantity < 50).length,
    high: inventory.filter(item => item.quantity >= 50).length
  }

  const inStockItems = inventory.filter(item => item.quantity >= 20).length
  const mediumStock = inventory.filter(item => item.quantity >= 20 && item.quantity < 50).length
  const highStock = inventory.filter(item => item.quantity >= 50).length

  return (
    <div className="dashboard-page">
      <div className="page-title-section">
        <div>
          <h1>Inventory Dashboard</h1>
          <div className="breadcrumb">General {'>'} All Inventory</div>
        </div>
      </div>

      <div className="summary-cards">
        <div className="summary-card paid">
          <div className="summary-card-icon"><FaCheck /></div>
          <div className="summary-card-content">
            <div className="summary-card-label">In Stock</div>
            <div className="summary-card-value">Items: {inStockItems}</div>
            <div className="summary-card-amount">Value: ${(inventory.filter(item => item.quantity >= 20).reduce((sum, item) => sum + (item.price * item.quantity), 0) / 1000).toFixed(1)}K</div>
          </div>
        </div>
        <div className="summary-card unpaid">
          <div className="summary-card-icon"><FaClock /></div>
          <div className="summary-card-content">
            <div className="summary-card-label">Medium Stock</div>
            <div className="summary-card-value">Items: {mediumStock}</div>
            <div className="summary-card-amount">Value: ${(inventory.filter(item => item.quantity >= 20 && item.quantity < 50).reduce((sum, item) => sum + (item.price * item.quantity), 0) / 1000).toFixed(1)}K</div>
          </div>
        </div>
        <div className="summary-card overdue">
          <div className="summary-card-icon"><FaExclamationTriangle /></div>
          <div className="summary-card-content">
            <div className="summary-card-label">Low Stock</div>
            <div className="summary-card-value">Items: {lowStockItems}</div>
            <div className="summary-card-amount">Value: ${(inventory.filter(item => item.quantity < 20).reduce((sum, item) => sum + (item.price * item.quantity), 0) / 1000).toFixed(1)}K</div>
          </div>
        </div>
        <div className="summary-card draft">
          <div className="summary-card-icon"><FaBox /></div>
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
                      background: `linear-gradient(90deg, #ff6b35 0%, #ff8c5a 100%)`
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
            <div className="pie-chart-wrapper">
              <svg className="pie-chart-svg" viewBox="0 0 200 200">
                {(() => {
                  const total = stockLevels.low + stockLevels.medium + stockLevels.high
                  if (total === 0) {
                    return (
                      <>
                        <circle cx="100" cy="100" r="80" fill="#f3f4f6" />
                        <circle cx="100" cy="100" r="60" fill="white" />
                      </>
                    )
                  }
                  
                  let currentOffset = 0
                  const radius = 80
                  const centerX = 100
                  const centerY = 100
                  
                  const lowPercentage = total > 0 ? (stockLevels.low / total) * 100 : 0
                  const mediumPercentage = total > 0 ? (stockLevels.medium / total) * 100 : 0
                  const highPercentage = total > 0 ? (stockLevels.high / total) * 100 : 0
                  
                  const createArc = (percentage, color) => {
                    if (percentage <= 0) return null
                    
                    const startAngle = (currentOffset / 100) * 360 - 90
                    const endAngle = ((currentOffset + percentage) / 100) * 360 - 90
                    currentOffset += percentage
                    
                    const startAngleRad = (startAngle * Math.PI) / 180
                    const endAngleRad = (endAngle * Math.PI) / 180
                    
                    const x1 = centerX + radius * Math.cos(startAngleRad)
                    const y1 = centerY + radius * Math.sin(startAngleRad)
                    const x2 = centerX + radius * Math.cos(endAngleRad)
                    const y2 = centerY + radius * Math.sin(endAngleRad)
                    
                    const largeArcFlag = percentage > 50 ? 1 : 0
                    
                    return (
                      <path
                        key={color}
                        d={`M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`}
                        fill={color}
                        stroke="white"
                        strokeWidth="3"
                      />
                    )
                  }
                  
                  return (
                    <>
                      {createArc(lowPercentage, '#ef4444')}
                      {createArc(mediumPercentage, '#f59e0b')}
                      {createArc(highPercentage, '#10b981')}
                      <circle cx="100" cy="100" r="50" fill="white" />
                    </>
                  )
                })()}
              </svg>
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
                  <div className="top-item-value">${(item.price * item.quantity).toFixed(2)}</div>
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
                  <div className="timeline-date">{item.lastUpdated}</div>
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
  paginatedInventory,
  totalPages,
  currentPage,
  setCurrentPage,
  itemsPerPage,
  setItemsPerPage,
  sortedInventoryLength,
  searchTerm, 
  setSearchTerm,
  filterCategory,
  setFilterCategory,
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder,
  categories,
  handleAdd,
  handleEdit,
  handleDelete 
}) {
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = Math.min(startIndex + itemsPerPage, sortedInventoryLength)

  return (
    <div className="all-items-page">
      <div className="page-title-section">
        <div>
          <h1>All Inventory Items</h1>
          <div className="breadcrumb">General {'>'} All Items</div>
        </div>
        <button className="btn-create" onClick={handleAdd}>
          + Add Item
        </button>
      </div>

      <div className="list-controls">
        <div className="search-input-wrapper">
          <FaSearch className="search-icon-inline" />
          <input
            type="text"
            placeholder="Search items..."
            className="search-input-main"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
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
        <select
          className="filter-dropdown"
          value={sortBy}
          onChange={(e) => {
            setSortBy(e.target.value)
            if (e.target.value !== 'none') {
              setSortOrder('asc')
            }
          }}
        >
          <option value="none">Sort by...</option>
          <option value="name">Name</option>
          <option value="price">Price</option>
          <option value="quantity">Stock</option>
        </select>
        {sortBy !== 'none' && (
          <button
            className="sort-order-btn"
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            title={sortOrder === 'asc' ? 'Ascending' : 'Descending'}
          >
            {sortOrder === 'asc' ? <FaChevronUp /> : <FaChevronDown />}
          </button>
        )}
      </div>

      <div className="table-wrapper">
        <table className="items-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Item Name</th>
              <th>Category</th>
              <th>Stock</th>
              <th>Price</th>
              <th>Total Value</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedInventory.length === 0 ? (
              <tr>
                <td colSpan="7" className="no-data-cell">
                  <div className="no-data-message">
                    <FaInbox className="no-data-icon" />
                    <p>No items found</p>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedInventory.map((item, index) => (
                <tr key={item.id} className={item.quantity < 20 ? 'low-stock-row' : ''}>
                  <td>{item.id}</td>
                  <td>
                    <div className="item-name-cell">
                      <strong>{item.name}</strong>
                      <small>{item.description}</small>
                    </div>
                  </td>
                  <td>
                    <span className="category-tag">{item.category}</span>
                  </td>
                  <td>
                    <span className={item.quantity < 20 ? 'quantity-low' : 'quantity-ok'}>
                      {item.quantity}
                    </span>
                  </td>
                  <td>${item.price.toFixed(2)}</td>
                  <td>${(item.price * item.quantity).toFixed(2)}</td>
                  <td>
                    <div className="table-actions">
                      <button className="btn-edit-small" onClick={() => handleEdit(item)} title="Edit">
                        <FaEdit />
                      </button>
                      <button className="btn-delete-small" onClick={() => handleDelete(item.id)} title="Delete">
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <div className="pagination-info">
            <span>Items per page:</span>
            <select
              className="pagination-select"
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value))
                setCurrentPage(1)
              }}
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
            </select>
            <span className="pagination-count">
              Showing {sortedInventoryLength > 0 ? startIndex + 1 : 0}-{endIndex} of {sortedInventoryLength} items
            </span>
          </div>
          <div className="pagination-controls">
            <button
              className="pagination-btn"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              <FaChevronLeft /> Previous
            </button>
            <div className="pagination-numbers">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
                if (
                  page === 1 ||
                  page === totalPages ||
                  (page >= currentPage - 1 && page <= currentPage + 1)
                ) {
                  return (
                    <button
                      key={page}
                      className={`pagination-number ${currentPage === page ? 'active' : ''}`}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </button>
                  )
                } else if (page === currentPage - 2 || page === currentPage + 2) {
                  return <span key={page} className="pagination-ellipsis">...</span>
                }
                return null
              })}
            </div>
            <button
              className="pagination-btn"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Next <FaChevronRight />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// Low Stock Page
function LowStockPage({ inventory, handleEdit, handleDelete, getCategoryIcon }) {
  const lowStockItems = inventory.filter(item => item.quantity < 20)

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
                    <FaExclamationTriangle className="warning-icon" />
                    <span>Only {item.quantity} left</span>
                  </div>
                  <div className="stock-price">${item.price.toFixed(2)} each</div>
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
  const suppliers = [...new Set(inventory.map(item => item.supplier))].filter(Boolean)
  const supplierData = suppliers.map(supplier => {
    const items = inventory.filter(item => item.supplier === supplier)
    const totalValue = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    return {
      name: supplier,
      itemCount: items.length,
      totalValue
    }
  })

  return (
    <div className="suppliers-page">
      <div className="page-title-section">
        <div>
          <h1>Suppliers</h1>
          <div className="breadcrumb">General {'>'} Suppliers</div>
        </div>
      </div>

      <div className="suppliers-grid">
        {supplierData.length === 0 ? (
          <div className="no-items">No suppliers found</div>
        ) : (
          supplierData.map((supplier, index) => (
            <div key={index} className="supplier-card">
              <div className="supplier-avatar"><FaBuilding /></div>
              <h3>{supplier.name}</h3>
              <div className="supplier-stats">
                <div className="supplier-stat">
                  <span className="stat-label">Items</span>
                  <span className="stat-value">{supplier.itemCount}</span>
                </div>
                <div className="supplier-stat">
                  <span className="stat-label">Total Value</span>
                  <span className="stat-value">${(supplier.totalValue / 1000).toFixed(1)}K</span>
                </div>
              </div>
            </div>
          ))
        )}
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
    acc[category].value += (item.price * item.quantity)
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
          <h3><FaChartBar /> Summary Report</h3>
          <div className="report-data">
            <div className="report-item">
              <span>Total Items:</span>
              <strong>{totalItems}</strong>
            </div>
            <div className="report-item">
              <span>Total Inventory Value:</span>
              <strong>${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong>
            </div>
            <div className="report-item">
              <span>Low Stock Items:</span>
              <strong>{inventory.filter(item => item.quantity < 20).length}</strong>
            </div>
          </div>
        </div>

        <div className="report-card">
          <h3><FaChartLine /> Category Breakdown</h3>
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
  const [theme, setTheme] = useState('light')
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    quantity: '',
    price: '',
    supplier: '',
    description: ''
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('All')
  const [sortBy, setSortBy] = useState('none')
  const [sortOrder, setSortOrder] = useState('asc')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Load sample data on component mount
  useEffect(() => {
    setInventory(sampleData)
  }, [])

  // Check if mobile and set sidebar collapsed by default on mobile
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 768
      setIsMobile(mobile)
      if (mobile) {
        setSidebarCollapsed(true)
      }
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Get unique categories for filter
  const categories = ['All', ...new Set(inventory.map(item => item.category))]

  // Filter inventory based on search and category
  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (item.category && item.category.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesCategory = filterCategory === 'All' || item.category === filterCategory
    return matchesSearch && matchesCategory
  })

  // Sort filtered inventory
  const sortedInventory = [...filteredInventory].sort((a, b) => {
    if (sortBy === 'none') return 0
    
    let comparison = 0
    if (sortBy === 'name') {
      comparison = a.name.localeCompare(b.name)
    } else if (sortBy === 'price') {
      comparison = a.price - b.price
    } else if (sortBy === 'quantity') {
      comparison = a.quantity - b.quantity
    }
    
    return sortOrder === 'asc' ? comparison : -comparison
  })

  // Pagination calculations
  const totalPages = Math.ceil(sortedInventory.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedInventory = sortedInventory.slice(startIndex, endIndex)

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, filterCategory, sortBy, sortOrder, itemsPerPage])

  // Calculate statistics
  const totalItems = inventory.length
  const totalValue = inventory.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const lowStockItems = inventory.filter(item => item.quantity < 20).length
  const recentItems = [...inventory].sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated)).slice(0, 5)

  // Get current date info
  const currentDate = new Date()
  const currentMonth = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay()

  // Open modal for adding new item
  const handleAdd = () => {
    setEditingItem(null)
    setFormData({
      name: '',
      category: '',
      quantity: '',
      price: '',
      supplier: '',
      description: ''
    })
    setIsModalOpen(true)
  }

  // Open modal for editing existing item
  const handleEdit = (item) => {
    setEditingItem(item)
    setFormData({
      name: item.name,
      category: item.category,
      quantity: item.quantity.toString(),
      price: item.price.toString(),
      supplier: item.supplier,
      description: item.description || ''
    })
    setIsModalOpen(true)
  }

  // Handle form submission (Create or Update)
  const handleSubmit = (e) => {
    e.preventDefault()
    const newItem = {
      id: editingItem ? editingItem.id : Date.now(),
      name: formData.name,
      category: formData.category,
      quantity: parseInt(formData.quantity),
      price: parseFloat(formData.price),
      supplier: formData.supplier,
      description: formData.description,
      lastUpdated: new Date().toISOString().split('T')[0]
    }

    if (editingItem) {
      setInventory(inventory.map(item => 
        item.id === editingItem.id ? newItem : item
      ))
    } else {
      setInventory([...inventory, newItem])
    }

    setIsModalOpen(false)
    setFormData({
      name: '',
      category: '',
      quantity: '',
      price: '',
      supplier: '',
      description: ''
    })
  }

  // Handle delete
  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      setInventory(inventory.filter(item => item.id !== id))
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
      'Electronics': <FaLaptop />,
      'Accessories': <FaKeyboard />,
      'Furniture': <FaChair />
    }
    return icons[category] || <FaBox />
  }

  // Generate calendar days
  const calendarDays = []
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  
  // Adjust for Sunday-first week (0 = Sunday)
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(null)
  }
  
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day)
  }

  // Render current page based on activeNav
  const renderPage = () => {
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
            paginatedInventory={paginatedInventory}
            totalPages={totalPages}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            itemsPerPage={itemsPerPage}
            setItemsPerPage={setItemsPerPage}
            sortedInventoryLength={sortedInventory.length}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filterCategory={filterCategory}
            setFilterCategory={setFilterCategory}
            sortBy={sortBy}
            setSortBy={setSortBy}
            sortOrder={sortOrder}
            setSortOrder={setSortOrder}
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

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light')
  }

  return (
    <div className={`app ${theme}`}>
      {/* Top Bar */}
      <header className="top-bar">
        <div className="top-bar-left">
          <div className="top-logo">
            <div className="top-logo-icon"><FaBox /></div>
            <span className="top-logo-text">Inventory Manager</span>
          </div>
        </div>
        <div className="top-bar-center">
          <div className="top-search">
            <FaSearch className="search-icon" />
            <input 
              type="text" 
              placeholder="Search items..." 
              className="top-search-input" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="top-bar-right">
          <button className="top-icon-btn theme-toggle" onClick={toggleTheme} title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}>
            {theme === 'light' ? <FaMoon /> : <FaSun />}
          </button>
          <button className="top-icon-btn"><FaBell /></button>
          <div className="top-user-avatar"><FaUser /></div>
        </div>
      </header>

      {/* Left Sidebar - Hidden on Mobile */}
      <aside className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''} ${isMobile ? 'mobile-hidden' : ''}`}>
        <button 
          className="sidebar-toggle"
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          title={sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {sidebarCollapsed ? <FaChevronRight /> : <FaChevronLeft />}
        </button>

        <nav className="sidebar-nav">
          {[
            { id: 'Dashboard', icon: <FaChartBar /> },
            { id: 'All Items', icon: <FaList /> },
            { id: 'Low Stock', icon: <FaExclamationTriangle /> },
            { id: 'Suppliers', icon: <FaBuilding /> },
            { id: 'Reports', icon: <FaChartLine /> },
            { id: 'Settings', icon: <FaCog /> }
          ].map(item => (
            <button
              key={item.id}
              className={`nav-item ${activeNav === item.id ? 'active' : ''}`}
              onClick={() => setActiveNav(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              {!sidebarCollapsed && <span className="nav-text">{item.id}</span>}
            </button>
          ))}
        </nav>
      </aside>

      {/* Mobile Bottom Navigation */}
      {isMobile && (
        <nav className="mobile-bottom-nav">
          {[
            { id: 'Dashboard', icon: <FaChartBar /> },
            { id: 'All Items', icon: <FaList /> },
            { id: 'Low Stock', icon: <FaExclamationTriangle /> },
            { id: 'Suppliers', icon: <FaBuilding /> },
            { id: 'Reports', icon: <FaChartLine /> }
          ].map(item => (
            <button
              key={item.id}
              className={`mobile-nav-item ${activeNav === item.id ? 'active' : ''}`}
              onClick={() => setActiveNav(item.id)}
            >
              <span className="mobile-nav-icon">{item.icon}</span>
              <span className="mobile-nav-text">{item.id}</span>
            </button>
          ))}
        </nav>
      )}

      {/* Main Content */}
      <main className={`main-content ${sidebarCollapsed ? 'sidebar-collapsed' : ''} ${isMobile ? 'mobile' : ''}`}>
        {renderPage()}
      </main>

      {/* Add/Edit Item Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>{editingItem ? 'Edit Item' : 'Add New Item'}</h2>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}>
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label>Item Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Category</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Furniture">Furniture</option>
                  <option value="Accessories">Accessories</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Quantity</label>
                  <input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    min="0"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Price ($)</label>
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
              </div>
              <div className="form-group">
                <label>Supplier</label>
                <input
                  type="text"
                  name="supplier"
                  value={formData.supplier}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-save">
                  {editingItem ? 'Update Item' : 'Add Item'}
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