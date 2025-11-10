// Global variables
let activityChart = null;
let categoriesChart = null;

// DOM Elements
const refreshBtn = document.getElementById('refresh-btn');
const totalChatsEl = document.getElementById('total-chats');
const totalMessagesEl = document.getElementById('total-messages');
const positiveFeedbackEl = document.getElementById('positive-feedback');
const negativeFeedbackEl = document.getElementById('negative-feedback');
const logsTableBody = document.getElementById('logs-table-body');

// Format timestamp for display
function formatTimestamp(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleString();
}

// Format text preview (truncate long text)
function formatPreview(text, maxLength = 50) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

// Fetch stats data
async function fetchStats() {
  try {
    // For now, using mock data
    // In the future, this will fetch from /api/stats
    return {
      totalChats: 124,
      totalMessages: 342,
      positiveFeedback: 89,
      negativeFeedback: 12,
      dailyActivity: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        data: [12, 19, 15, 17, 22, 30, 25]
      },
      topCategories: {
        labels: ['Services', 'Capabilities', 'Process', 'About', 'Contact'],
        data: [45, 38, 27, 18, 15]
      }
    };
  } catch (error) {
    console.error('Error fetching stats:', error);
    return null;
  }
}

// Fetch logs data
async function fetchLogs() {
  try {
    // For now, using mock data
    // In the future, this will fetch from /api/logs
    return [
      {
        timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
        user_query: "What services do you offer?",
        response: "We offer a comprehensive range of IT services including software development, cloud solutions, and cybersecurity services.",
        category: "Services",
        feedback: "positive"
      },
      {
        timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
        user_query: "Tell me about Oracle HCM",
        response: "Oracle HCM Cloud is a complete suite of applications for managing human resources.",
        category: "Capabilities",
        feedback: "positive"
      },
      {
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        user_query: "How does your development process work?",
        response: "Our process includes requirements gathering, design, development, testing, and deployment phases.",
        category: "Process",
        feedback: "negative"
      },
      {
        timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
        user_query: "Contact information?",
        response: "You can reach us at contact@yvi.com or call us at +1-234-567-8900.",
        category: "Contact",
        feedback: null
      },
      {
        timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
        user_query: "About your company",
        response: "YVI Tech Solutions is a leading IT consulting firm specializing in enterprise solutions.",
        category: "About",
        feedback: "positive"
      }
    ];
  } catch (error) {
    console.error('Error fetching logs:', error);
    return [];
  }
}

// Update stats cards
function updateStatsCards(stats) {
  if (!stats) return;
  
  totalChatsEl.textContent = stats.totalChats;
  totalMessagesEl.textContent = stats.totalMessages;
  positiveFeedbackEl.textContent = stats.positiveFeedback;
  negativeFeedbackEl.textContent = stats.negativeFeedback;
}

// Render activity chart
function renderActivityChart(data) {
  const ctx = document.getElementById('activity-chart').getContext('2d');
  
  // Destroy existing chart if it exists
  if (activityChart) {
    activityChart.destroy();
  }
  
  activityChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: data.labels,
      datasets: [{
        label: 'Chats per Day',
        data: data.data,
        borderColor: '#10a37f',
        backgroundColor: 'rgba(16, 163, 127, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.3
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          mode: 'index',
          intersect: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: getComputedStyle(document.body).getPropertyValue('--border-color') || 'rgba(0, 0, 0, 0.1)'
          },
          ticks: {
            color: getComputedStyle(document.body).getPropertyValue('--text-secondary') || '#666'
          }
        },
        x: {
          grid: {
            color: getComputedStyle(document.body).getPropertyValue('--border-color') || 'rgba(0, 0, 0, 0.1)'
          },
          ticks: {
            color: getComputedStyle(document.body).getPropertyValue('--text-secondary') || '#666'
          }
        }
      }
    }
  });
}

// Render categories chart
function renderCategoriesChart(data) {
  const ctx = document.getElementById('categories-chart').getContext('2d');
  
  // Destroy existing chart if it exists
  if (categoriesChart) {
    categoriesChart.destroy();
  }
  
  categoriesChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: data.labels,
      datasets: [{
        label: 'Query Count',
        data: data.data,
        backgroundColor: [
          'rgba(16, 163, 127, 0.7)',
          'rgba(26, 103, 173, 0.7)',
          'rgba(255, 159, 64, 0.7)',
          'rgba(153, 102, 255, 0.7)',
          'rgba(255, 99, 132, 0.7)'
        ],
        borderColor: [
          'rgba(16, 163, 127, 1)',
          'rgba(26, 103, 173, 1)',
          'rgba(255, 159, 64, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 99, 132, 1)'
        ],
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: getComputedStyle(document.body).getPropertyValue('--border-color') || 'rgba(0, 0, 0, 0.1)'
          },
          ticks: {
            color: getComputedStyle(document.body).getPropertyValue('--text-secondary') || '#666'
          }
        },
        x: {
          grid: {
            display: false
          },
          ticks: {
            color: getComputedStyle(document.body).getPropertyValue('--text-secondary') || '#666'
          }
        }
      }
    }
  });
}

// Update logs table
function updateLogsTable(logs) {
  logsTableBody.innerHTML = '';
  
  if (!logs || logs.length === 0) {
    const row = document.createElement('tr');
    row.innerHTML = '<td colspan="5">No data available</td>';
    logsTableBody.appendChild(row);
    return;
  }
  
  logs.forEach(log => {
    const row = document.createElement('tr');
    
    // Format feedback display
    let feedbackDisplay = '—';
    if (log.feedback === 'positive') {
      feedbackDisplay = '👍 Positive';
    } else if (log.feedback === 'negative') {
      feedbackDisplay = '👎 Negative';
    }
    
    row.innerHTML = `
      <td>${formatTimestamp(log.timestamp)}</td>
      <td>${formatPreview(log.user_query)}</td>
      <td>${formatPreview(log.response)}</td>
      <td>${log.category || '—'}</td>
      <td>${feedbackDisplay}</td>
    `;
    
    logsTableBody.appendChild(row);
  });
}

// Load dashboard data
async function loadDashboard() {
  // Show loading state
  refreshBtn.disabled = true;
  refreshBtn.textContent = 'Loading...';
  
  try {
    // Fetch data
    const stats = await fetchStats();
    const logs = await fetchLogs();
    
    // Update UI
    updateStatsCards(stats);
    
    if (stats) {
      renderActivityChart(stats.dailyActivity);
      renderCategoriesChart(stats.topCategories);
    }
    
    updateLogsTable(logs);
  } catch (error) {
    console.error('Error loading dashboard:', error);
  } finally {
    // Restore button state
    refreshBtn.disabled = false;
    refreshBtn.textContent = '🔄 Refresh';
  }
}

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
  // Load initial data
  loadDashboard();
  
  // Set up event listeners
  refreshBtn.addEventListener('click', loadDashboard);
  
  // Check for theme preference
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'light') {
    document.body.classList.add('light-theme');
  }
});