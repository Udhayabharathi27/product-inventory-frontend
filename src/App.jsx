import { useState, useEffect, useCallback } from 'react'
import './App.css'
import axios from 'axios'
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
  FaInbox,
  FaArrowUp,
  FaArrowDown
} from 'react-icons/fa'

const API_BASE_URL = 'https://product-inventory-backend-eg9l.onrender.com/api'

const NAV_ITEMS = [
  { key: 'Dashboard', label: 'Dashboard', icon: FaChartBar, color: '#6366f1' },
  { key: 'All Items', label: 'All Items', icon: FaList, color: '#0ea5e9' },
  { key: 'Low Stock', label: 'Low Stock', icon: FaExclamationTriangle, color: '#f97316' },
  // { key: 'Suppliers', label: 'Suppliers', icon: FaBuilding, color: '#14b8a6' },
  { key: 'Reports', label: 'Reports', icon: FaChartLine, color: '#22c55e' },
  { key: 'Settings', label: 'Settings', icon: FaCog, color: '#8b5cf6' }
]

// Dashboard Component with Graphs
function DashboardPage({ inventory, totalItems, totalValue, lowStockItems, recentItems, getCategoryIcon, handleAdd }) {
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

  const mediumStock = inventory.filter(item => item.quantity >= 20 && item.quantity < 50).length
  const highStock = inventory.filter(item => item.quantity >= 50).length
  const safeTotalItems = totalItems || 1

  const createTrend = (items, isPositive = true) => {
    const percent = Math.min(99, Math.max(3, Math.round((items / safeTotalItems) * 100)))
    return {
      direction: isPositive ? 'up' : 'down',
      label: `${isPositive ? '+' : '-'}${percent}% vs last month`
    }
  }

  const summaryStats = [
    {
      key: 'medium-stock',
      label: 'Medium Stock',
      className: 'unpaid',
      icon: <FaClock />,
      items: mediumStock,
      value: `$${(inventory.filter(item => item.quantity >= 20 && item.quantity < 50).reduce((sum, item) => sum + (item.price * item.quantity), 0) / 1000).toFixed(1)}K`,
      trend: createTrend(mediumStock, true)
    },
    {
      key: 'low-stock',
      label: 'Low Stock',
      className: 'overdue',
      icon: <FaExclamationTriangle />,
      items: lowStockItems,
      value: `$${(inventory.filter(item => item.quantity < 20).reduce((sum, item) => sum + (item.price * item.quantity), 0) / 1000).toFixed(1)}K`,
      trend: createTrend(lowStockItems, false)
    },
    {
      key: 'total-items',
      label: 'Total Items',
      className: 'draft',
      icon: <FaBox />,
      items: totalItems,
      value: `$${(totalValue / 1000).toFixed(1)}K`,
      trend: createTrend(totalItems, true)
    }
  ]

  return (
    <div className="dashboard-page">
      <div className="page-title-section">
        <div>
          <h1>Inventory</h1>
          <div className="breadcrumb">General {'>'} All Inventory</div>
        </div>
        <button className="btn-create" onClick={handleAdd}>
          + Create Item
        </button>
      </div>

      <div className="summary-cards">
        {summaryStats.map(stat => (
          <div key={stat.key} className={`summary-card ${stat.className}`}>
            <div className="summary-card-top">
              <div className="summary-card-label">{stat.label}</div>
              <div className="summary-card-icon-badge">{stat.icon}</div>
            </div>
            <div className="summary-card-main">
              <div className="summary-card-metric">
                <div className="summary-card-metric-value">{stat.items}</div>
                <div className="summary-card-metric-caption">Items</div>
              </div>
              <div className="summary-card-metric">
                <div className="summary-card-metric-value">{stat.value}</div>
                <div className="summary-card-metric-caption">Value</div>
              </div>
            </div>
            <div className={`summary-card-trend ${stat.trend.direction}`}>
              {stat.trend.direction === 'up' ? <FaArrowUp /> : <FaArrowDown />}
              <span>{stat.trend.label}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h3>Items by Category</h3>
          <div className="bar-chart">
            {categoryNames.map((category, index) => (
              <div key={category} className="bar-chart-item">
                <div className="bar-label">{category}</div>
                <div className="bar-container">
                  <div className="bar-track">
                    <div
                      className="bar-fill"
                      style={{
                        width: `${(categoryCounts[index] / maxCount) * 100}%`
                      }}
                    />
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
          + Create Item
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
          <option value="price">Price</option>
          <option value="stock">Stock Count</option>
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
              <th>S.No</th>
              <th>Item Name</th>
              <th>Category</th>
              <th>Qty</th>
              <th>Price</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedInventory.length === 0 ? (
              <tr>
                <td colSpan="6" className="no-data-cell">
                  <div className="no-data-message">
                    <FaInbox className="no-data-icon" />
                    <p>No items found</p>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedInventory.map((item, index) => (
                <tr key={item.id} className={item.quantity < 20 ? 'low-stock-row' : ''}>
                  <td>{startIndex + index + 1}</td>
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
// function SuppliersPage({ inventory }) {
//   const suppliers = [...new Set(inventory.map(item => item.supplier))]
//   const supplierData = suppliers.map(supplier => {
//     const items = inventory.filter(item => item.supplier === supplier)
//     const totalValue = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
//     return {
//       name: supplier,
//       itemCount: items.length,
//       totalValue
//     }
//   })

//   return (
//     <div className="suppliers-page">
//       <div className="page-title-section">
//         <div>
//           <h1>Suppliers</h1>
//           <div className="breadcrumb">General {'>'} Suppliers</div>
//         </div>
//       </div>

//       <div className="suppliers-grid">
//         {supplierData.map((supplier, index) => (
//           <div key={index} className="supplier-card">
//             <div className="supplier-avatar"><FaBuilding /></div>
//             <h3>{supplier.name}</h3>
//             <div className="supplier-stats">
//               <div className="supplier-stat">
//                 <span className="stat-label">Items</span>
//                 <span className="stat-value">{supplier.itemCount}</span>
//               </div>
//               <div className="supplier-stat">
//                 <span className="stat-label">Total Value</span>
//                 <span className="stat-value">${(supplier.totalValue / 1000).toFixed(1)}K</span>
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   )
// }

// Reports Page
function ReportsPage({ inventory, totalItems, totalValue }) {
  const totalQuantity = inventory.reduce((sum, item) => sum + item.quantity, 0)
  const averageItemValue = totalItems > 0 ? totalValue / totalItems : 0
  const averageUnitPrice = totalQuantity > 0 ? totalValue / totalQuantity : 0

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
              <span>Average Item Value:</span>
              <strong>${averageItemValue.toFixed(2)}</strong>
            </div>
            <div className="report-item">
              <span>Average Unit Price:</span>
              <strong>${averageUnitPrice.toFixed(2)}</strong>
            </div>
          </div>
        </div>

        <div className="report-card">
          <h3><FaChartLine /> Category Breakdown</h3>
          <div className="report-list">
            {[...new Set(inventory.map(item => item.category))].map(category => {
              const categoryItems = inventory.filter(item => item.category === category)
              const categoryValue = categoryItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
              return (
                <div key={category} className="report-list-item">
                  <span>{category}</span>
                  <strong>{categoryItems.length} items - ${categoryValue.toFixed(2)}</strong>
                </div>
              )
            })}
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
  const [theme, setTheme] = useState('dark')
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
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchInventory = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const response = await axios.get(`${API_BASE_URL}/products`)
      const data = response?.data
      const records = Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data)
          ? data
          : []

      if (!Array.isArray(records)) {
        throw new Error('Unexpected response from server')
      }

      const parseDate = (value) => {
        if (!value) return null
        const parsed = Date.parse(value)
        return Number.isNaN(parsed) ? null : parsed
      }

      const formatDate = (value) => {
        if (!value) return ''
        const parsed = parseDate(value)
        if (parsed === null) {
          return typeof value === 'string' ? value : ''
        }
        return new Date(parsed).toLocaleDateString()
      }

      const transformed = records.map(product => {
        const quantityRaw = Number(product.quantity ?? product.stock ?? 0)
        const priceRaw = Number(product.price ?? 0)
        const updatedAtRaw = product.updated_at ?? product.updatedAt ?? product.lastUpdated ?? product.created_at ?? product.createdAt ?? null
        const createdAtRaw = product.created_at ?? product.createdAt ?? product.added_at ?? updatedAtRaw
        const updatedAtTimestamp = parseDate(updatedAtRaw) ?? parseDate(createdAtRaw)

        return {
          id: product.id,
          name: product.name || 'Unnamed Item',
          category: product.category || 'Uncategorized',
          quantity: Number.isNaN(quantityRaw) ? 0 : quantityRaw,
          price: Number.isNaN(priceRaw) ? 0 : priceRaw,
          supplier: product.supplier || 'General Supplier',
          description: product.description || '',
          lastUpdated: formatDate(updatedAtRaw || createdAtRaw),
          updatedAtTimestamp
        }
      })

      setInventory(transformed)
    } catch (err) {
      console.error('Error fetching inventory:', err)
      setError('Failed to load inventory. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchInventory()
  }, [fetchInventory])

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
                         item.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = filterCategory === 'All' || item.category === filterCategory
    return matchesSearch && matchesCategory
  })

  // Sort filtered inventory
  const sortedInventory = [...filteredInventory].sort((a, b) => {
    if (sortBy === 'none') return 0

    let comparison = 0
    if (sortBy === 'price') {
      comparison = a.price - b.price
    } else if (sortBy === 'stock') {
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
  }, [searchTerm, filterCategory, sortBy, sortOrder])

  // Calculate statistics
  const totalItems = inventory.length
  const totalValue = inventory.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const lowStockItems = inventory.filter(item => item.quantity < 20).length
  const recentItems = inventory.slice(-5).reverse()

  // Get current date info
  const currentDate = new Date()
  const currentMonth = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay()

  // Open modal for adding new item
  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      quantity: '',
      price: '',
      supplier: '',
      description: ''
    })
    setEditingItem(null)
  }

  const handleAdd = () => {
    resetForm()
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
      description: item.description
    })
    setIsModalOpen(true)
  }

  // Handle form submission (Create or Update)
  const handleSubmit = async (e) => {
    e.preventDefault()

    const payload = {
      name: formData.name,
      category: formData.category,
      price: parseFloat(formData.price) || 0,
      stock: parseInt(formData.quantity, 10) || 0,
      supplier: formData.supplier,
      description: formData.description
    }

    try {
      setError('')

      if (editingItem) {
        await axios.put(`${API_BASE_URL}/products/${editingItem.id}`, payload)
      } else {
        await axios.post(`${API_BASE_URL}/products`, payload)
      }

      await fetchInventory()
      setIsModalOpen(false)
      resetForm()
    } catch (err) {
      console.error('Error saving item:', err)
      setError('Failed to save item. Please try again.')
    }
  }

  // Handle delete
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) {
      return
    }

    try {
      setError('')
      await axios.delete(`${API_BASE_URL}/products/${id}`)
      await fetchInventory()
    } catch (err) {
      console.error('Error deleting item:', err)
      setError('Failed to delete item. Please try again.')
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
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

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
            handleAdd={handleAdd}
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
      // case 'Suppliers':
      //   return <SuppliersPage inventory={inventory} />
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
            <span className="top-logo-text">Product Inventory Management</span>
          </div>
        </div>
        <div className="top-bar-center">
          <div className="top-search">
            <FaSearch className="search-icon" />
            <input type="text" placeholder="Search" className="top-search-input" />
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
        {!sidebarCollapsed && (
          <div>
          </div>
        )}
        <nav className="sidebar-nav">
          {NAV_ITEMS.map(item => {
            const Icon = item.icon
            const isActive = activeNav === item.key
            return (
              <button
                key={item.key}
                className={`nav-item ${item.key.replace(/\s+/g, '-').toLowerCase()} ${isActive ? 'active' : ''}`}
                onClick={() => {
                  setActiveNav(item.key)
                  if (isMobile) setSidebarCollapsed(true)
                }}
              >
                <span
                  className="nav-icon"
                  style={{ color: isActive ? '#ffffff' : item.color }}
                >
                  <Icon />
                </span>
                <span className="nav-text">{item.label}</span>
              </button>
            )
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className={`main-content ${sidebarCollapsed ? 'sidebar-collapsed' : ''} ${isMobile ? 'mobile-content' : ''}`}>
        {loading ? (
          <div className="loading-state">
            <p>{error || 'Loading inventory...'}</p>
            <div className="spinner"></div>
          </div>
        ) : (
          renderPage()
        )}
      </main>

      {/* Bottom Navigation Bar for Mobile */}
      {isMobile && (
        <nav className="bottom-nav">
          {NAV_ITEMS.map(item => {
            const Icon = item.icon
            const isActive = activeNav === item.key
            return (
              <button
                key={item.key}
                className={`bottom-nav-item ${item.key.replace(/\s+/g, '-').toLowerCase()} ${isActive ? 'active' : ''}`}
                onClick={() => setActiveNav(item.key)}
                title={item.label}
              >
                <span className="bottom-nav-icon">
                  <Icon />
                </span>
                <span className="bottom-nav-label">
                  {item.label}
                </span>
              </button>
            )
          })}
        </nav>
      )}

      {/* Right Sidebar */}
      <aside className="right-sidebar">
        <div className="calendar-widget">
          <div className="calendar-header">
            <button className="calendar-nav"><FaChevronLeft /></button>
            <h3>{currentMonth}</h3>
            <button className="calendar-nav"><FaChevronRight /></button>
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

        {/* <div className="recent-activity">
          <div className="activity-header">
            <h3>Recent Items</h3>
            <a href="#" className="see-all">See all</a>
          </div>
          <div className="activity-list">
            {recentItems.slice(0, 4).map(item => (
              <div key={item.id} className="activity-item">
                <div className="activity-avatar">{getCategoryIcon(item.category)}</div>
                <div className="activity-info">
                  <div className="activity-name">{item.name}</div>
                  <div className="activity-id">ID: {item.id}</div>
                </div>
                <div className="activity-status"></div>
              </div>
            ))}
          </div>
        </div> */}

        {/* <div className="stats-widget">
          <div className="stat-widget-item">
            <div className="stat-widget-value">{totalItems}</div>
            <div className="stat-widget-label">Total Items</div>
          </div>
          <div className="stat-widget-item">
            <div className="stat-widget-value">${(totalValue / 1000).toFixed(1)}K</div>
            <div className="stat-widget-label">Total Value</div>
          </div>
          <div className="stat-widget-item">
            <div className="stat-widget-value">{lowStockItems}</div>
            <div className="stat-widget-label">Low Stock</div>
          </div>
        </div> */}
      </aside>



      {/* Modal for Add/Edit */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingItem ? 'Edit Item' : 'Add New Item'}</h2>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}>
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="form">
              <div className="form-group">
                <label>Item Name *</label>
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
                  <label>Quantity *</label>
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
              </div>
              <div className="form-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => {
                    setIsModalOpen(false)
                    resetForm()
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-submit">
                  {editingItem ? 'Update' : 'Add'} Item
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
