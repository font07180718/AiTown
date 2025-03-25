document.addEventListener('DOMContentLoaded', function() {
    // Simulate log data
    const sampleLogs = [
        {
            id: 1,
            timestamp: new Date('2023-05-20T09:15:32'),
            content: 'VitalikAI proposed a new governance model for DeFi protocol',
            type: 'governance',
            icon: 'G'
        },
        {
            id: 2,
            timestamp: new Date('2023-05-20T10:23:17'),
            content: 'SBF Agent executed 500 ETH swap on Uniswap V3',
            type: 'transactions',
            icon: 'T'
        },
        {
            id: 3,
            timestamp: new Date('2023-05-20T11:05:43'),
            content: 'CZ Binance detected and prevented a potential exploit attempt',
            type: 'events',
            icon: 'E'
        },
        {
            id: 4,
            timestamp: new Date('2023-05-20T12:30:21'),
            content: 'Hayden Adams optimized gas fees for token swaps',
            type: 'transactions',
            icon: 'T'
        },
        {
            id: 5,
            timestamp: new Date('2023-05-20T13:45:11'),
            content: 'Crypto Valley monthly governance voting has started',
            type: 'governance',
            icon: 'G'
        },
        {
            id: 6,
            timestamp: new Date('2023-05-20T14:20:05'),
            content: 'New AI agent has joined Crypto Valley: Robert Leshner',
            type: 'events',
            icon: 'E'
        },
        {
            id: 7,
            timestamp: new Date('2023-05-20T15:10:38'),
            content: 'ETH price oracle updated with new decentralized data sources',
            type: 'events',
            icon: 'E'
        },
        {
            id: 8,
            timestamp: new Date('2023-05-20T16:05:22'),
            content: 'SushiSwap integration completed with improved liquidity pools',
            type: 'transactions',
            icon: 'T'
        }
    ];

    let filteredLogs = [...sampleLogs];
    const logsContainer = document.querySelector('.logs-container');
    const searchInput = document.querySelector('.search-input');
    const filterSelect = document.querySelector('.filter-select');
    const loadMoreBtn = document.querySelector('.load-more-btn');

    // Format timestamp
    function formatTimestamp(date) {
        const options = {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        };
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString(undefined, options);
    }

    // Render log entries
    function renderLogs(logs) {
        logsContainer.innerHTML = '';
        
        if (logs.length === 0) {
            logsContainer.innerHTML = '<div class="no-logs">No logs found matching your criteria</div>';
            return;
        }
        
        logs.forEach(log => {
            const logEntry = document.createElement('div');
            logEntry.className = 'log-entry';
            logEntry.setAttribute('data-id', log.id);
            
            logEntry.innerHTML = `
                <div class="log-icon">${log.icon}</div>
                <div class="log-timestamp">${formatTimestamp(log.timestamp)}</div>
                <div class="log-content">${log.content}</div>
            `;
            
            // Add click event to show log details
            logEntry.addEventListener('click', () => {
                showLogDetails(log);
            });
            
            logsContainer.appendChild(logEntry);
        });
    }
    
    // Filter logs
    function filterLogs() {
        const searchTerm = searchInput.value.toLowerCase();
        const filterValue = filterSelect.value;
        
        filteredLogs = sampleLogs.filter(log => {
            // Check search term
            const matchesSearch = log.content.toLowerCase().includes(searchTerm);
            
            // Check filter
            const matchesFilter = filterValue === 'all' || log.type === filterValue;
            
            return matchesSearch && matchesFilter;
        });
        
        renderLogs(filteredLogs);
    }
    
    // Show log details (modal popup)
    function showLogDetails(log) {
        console.log('Show log details:', log);
        
        // Create modal element
        const modal = document.createElement('div');
        modal.className = 'log-modal';
        modal.innerHTML = `
            <div class="log-modal-content">
                <span class="close-modal">&times;</span>
                <h3>Log Details</h3>
                <div class="log-detail-timestamp">
                    <strong>Timestamp:</strong> ${formatTimestamp(log.timestamp)}
                </div>
                <div class="log-detail-type">
                    <strong>Type:</strong> ${log.type.charAt(0).toUpperCase() + log.type.slice(1)}
                </div>
                <div class="log-detail-content">
                    <strong>Content:</strong> ${log.content}
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Add close functionality
        const closeModal = modal.querySelector('.close-modal');
        closeModal.addEventListener('click', () => {
            modal.remove();
        });
        
        // Close on click outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }
    
    // Add event listeners
    searchInput.addEventListener('input', filterLogs);
    filterSelect.addEventListener('change', filterLogs);
    
    loadMoreBtn.addEventListener('click', () => {
        // In a real application, this would load more logs from the server
        alert('In a real application, this would load more logs from the backend');
    });
    
    // Connect wallet button
    const connectBtn = document.querySelector('.connect-btn');
    connectBtn.addEventListener('click', () => {
        alert('This would connect to a Web3 wallet in a real application');
    });
    
    // Initial render
    renderLogs(sampleLogs);
    
    // Add modal styles dynamically
    const style = document.createElement('style');
    style.textContent = `
        .log-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
        }
        
        .log-modal-content {
            background-color: #111;
            border: 1px solid var(--border-color);
            border-radius: 8px;
            padding: 30px;
            position: relative;
            width: 90%;
            max-width: 600px;
        }
        
        .close-modal {
            position: absolute;
            top: 15px;
            right: 15px;
            font-size: 24px;
            cursor: pointer;
            color: var(--primary-text);
        }
        
        .log-modal h3 {
            margin-bottom: 20px;
            color: var(--secondary-blue);
        }
        
        .log-detail-timestamp,
        .log-detail-type,
        .log-detail-content {
            margin-bottom: 15px;
        }
    `;
    document.head.appendChild(style);
}); 