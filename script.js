document.addEventListener('DOMContentLoaded', function() {
    // API基础URL
    const API_BASE_URL = 'http://localhost:3000/api';
    
    // 获取导航项和内容部分
    const navItems = document.querySelectorAll('.nav-item');
    const contentSections = document.querySelectorAll('.content-section');
    
    // 从API加载数据
    loadDataFromAPI();
    
    // 为导航项添加点击事件
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            // 获取要显示的部分
            const sectionToShow = this.getAttribute('data-section');
            
            // 移除所有导航项的active类
            navItems.forEach(nav => nav.classList.remove('active'));
            
            // 为当前点击的导航项添加active类
            this.classList.add('active');
            
            // 隐藏所有内容部分
            contentSections.forEach(section => section.classList.remove('active'));
            
            // 显示对应的内容部分
            document.getElementById(`${sectionToShow}-section`).classList.add('active');
        });
    });
    
    // 拦截所有从服务器返回的代理人数据
    const originalFetch = window.fetch;
    window.fetch = function(url, options) {
        return originalFetch(url, options).then(response => {
            const clonedResponse = response.clone();
            
            // 只处理代理人API的响应
            if (typeof url === 'string' && url.includes('/api/agents')) {
                return clonedResponse.json().then(data => {
                    // 如果是数组（获取所有代理人），为每个代理人添加空的stats属性
                    if (Array.isArray(data)) {
                        data.forEach(agent => {
                            if (!agent.stats) {
                                agent.stats = { value1: '', label1: '', value2: '', label2: '' };
                            }
                        });
                    } 
                    // 如果是单个对象（获取单个代理人），添加空的stats属性
                    else if (data && typeof data === 'object') {
                        if (!data.stats) {
                            data.stats = { value1: '', label1: '', value2: '', label2: '' };
                        }
                    }
                    
                    // 创建一个新的响应对象，包含修改后的数据
                    const modifiedResponse = new Response(JSON.stringify(data), {
                        status: response.status,
                        statusText: response.statusText,
                        headers: response.headers
                    });
                    
                    return modifiedResponse;
                }).catch(() => {
                    // 如果解析JSON失败，返回原始响应
                    return response;
                });
            }
            
            // 对于其他API，返回原始响应
            return response;
        });
    };
    
    // 从API加载数据
    async function loadDataFromAPI() {
        try {
            // 显示加载状态
            showLoading(true);
            
            console.log('开始从API加载数据...');
            
            // 修改API基础URL，确保它指向正确的服务器地址
            const API_BASE_URL = 'http://localhost:3000/api';
            
            // 单独请求talks数据，以便更好地调试
            console.log('请求对话数据...');
            const talksResponse = await fetch(`${API_BASE_URL}/talks`);
            if (!talksResponse.ok) {
                throw new Error(`获取对话数据失败: ${talksResponse.status}`);
            }
            const talks = await talksResponse.json();
            console.log('对话数据请求成功:', talks);
            
            // 请求其他数据
            console.log('请求其他数据...');
            const [agents, news, settings] = await Promise.all([
                fetch(`${API_BASE_URL}/agents`).then(res => {
                    if (!res.ok) throw new Error(`获取代理人数据失败: ${res.status}`);
                    return res.json();
                }),
                fetch(`${API_BASE_URL}/news`).then(res => {
                    if (!res.ok) throw new Error(`获取新闻数据失败: ${res.status}`);
                    return res.json();
                }),
                fetch(`${API_BASE_URL}/settings`).then(res => {
                    if (!res.ok) throw new Error(`获取设置数据失败: ${res.status}`);
                    return res.json();
                })
            ]);
            
            console.log('所有数据加载成功');
            
            // 渲染数据
            renderAgents(agents);
            renderNews(news);
            console.log('准备渲染对话数据...');
            renderTalks(talks, agents);
            applySettings(settings);
            
            // 隐藏加载状态
            showLoading(false);
        } catch (error) {
            console.error('加载数据失败:', error);
            showLoading(false);
            showError(`无法从服务器加载数据: ${error.message}`);
        }
    }
    
    // 显示/隐藏加载状态
    function showLoading(show) {
        // 这里可以添加加载指示器的显示/隐藏逻辑
        // 例如：document.getElementById('loading-indicator').style.display = show ? 'block' : 'none';
    }
    
    // 显示错误消息
    function showError(message) {
        alert(message);
    }
    
    // 渲染代理人数据
    function renderAgents(agents) {
        const agentsGrid = document.querySelector('.agents-grid');
        if (!agentsGrid) return;
        
        // 清空现有内容
        agentsGrid.innerHTML = '';
        
        // 添加代理人卡片
        agents.forEach(agent => {
            const agentCard = document.createElement('div');
            agentCard.className = 'agent-card';
            agentCard.dataset.id = agent.id;
            
            const statusClass = agent.status ? 'online' : '';
            
            agentCard.innerHTML = `
                <div class="agent-avatar">
                    <img src="${agent.avatar || ''}" alt="${agent.name || '未命名'}" 
                         onerror="this.src='data:image/svg+xml,%3Csvg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'200\\' height=\\'200\\' viewBox=\\'0 0 200 200\\'%3E%3Crect width=\\'200\\' height=\\'200\\' fill=\\'%23f0f0f0\\' /%3E%3Ctext x=\\'50%25\\' y=\\'50%25\\' font-size=\\'18\\' text-anchor=\\'middle\\' alignment-baseline=\\'middle\\' font-family=\\'Arial, sans-serif\\' fill=\\'%23999999\\'%3E无图像%3C/text%3E%3C/svg%3E'">
                </div>
                <div class="agent-info">
                    <h4>${agent.name || '未命名'}</h4>
                    <p class="agent-title">${agent.title || ''}</p>
                    <p class="agent-bio">${agent.bio || ''}</p>
                    <button class="agent-contact">Contact Agent</button>
                </div>
            `;
            
            agentsGrid.appendChild(agentCard);
            
            // 添加联系按钮事件
            agentCard.querySelector('.agent-contact').addEventListener('click', function() {
                const agentCard = this.closest('.agent-card');
                const agentId = agentCard.dataset.id;
                
                // 获取代理人数据
                fetch(`${API_BASE_URL}/agents/${agentId}`)
                    .then(response => response.json())
                    .then(agent => {
                        // 直接打开聊天模态框，不显示alert
                        openChatModal(agent);
                    })
                    .catch(error => {
                        console.error('获取代理人数据失败:', error);
                        alert('无法加载代理人数据，请稍后再试');
                    });
            });
        });
        
        // 重新绑定联系按钮事件
        bindContactButtons();
    }
    
    // 绑定联系按钮事件
    function bindContactButtons() {
        const contactButtons = document.querySelectorAll('.agent-contact');
        contactButtons.forEach(button => {
            button.addEventListener('click', function() {
                const agentCard = this.closest('.agent-card');
                const agentId = agentCard.dataset.id;
                
                // 获取代理人数据
                fetch(`${API_BASE_URL}/agents/${agentId}`)
                    .then(response => response.json())
                    .then(agent => {
                        // 直接打开聊天模态框，不显示alert
                        openChatModal(agent);
                    })
                    .catch(error => {
                        console.error('获取代理人数据失败:', error);
                        alert('无法加载代理人数据，请稍后再试');
                    });
            });
        });
    }
    
    // 渲染新闻数据
    function renderNews(news) {
        const newsContainer = document.querySelector('.news-container');
        if (!newsContainer) {
            console.error('找不到新闻容器元素');
            return;
        }
        
        // 如果没有新闻数据或发生错误，使用硬编码的数据
        if (!news || news.length === 0) {
            console.log('使用硬编码的新闻数据');
            news = [
                {
                    id: 1,
                    title: "New Liquidity Protocol Launches with $30M TVL",
                    date: "2023-06-15",
                    summary: "HyperSwap, a new automated market maker, has launched on Ethereum with innovative features and $30M in initial liquidity.",
                    content: "HyperSwap, a new automated market maker (AMM), has officially launched on the Ethereum mainnet with $30 million in Total Value Locked (TVL)."
                },
                {
                    id: 2,
                    title: "Major DAO Votes to Expand Cross-Chain Operations",
                    date: "2023-06-10",
                    summary: "One of the largest DAOs in DeFi has voted to expand operations to Arbitrum and Optimism L2 networks.",
                    content: "In a significant governance decision, members of DeFiDAO have voted overwhelmingly in favor of expanding operations to Arbitrum and Optimism."
                }
            ];
        }
        
        // 清空现有内容
        newsContainer.innerHTML = '';
        
        // 添加新闻卡片
        news.forEach(item => {
            // 创建新闻卡片元素
            const newsCard = document.createElement('div');
            newsCard.className = 'news-card';
            newsCard.dataset.id = item.id;
            
            // 获取日期和月份 - 处理两种可能的数据格式
            let day = 'N/A';
            let month = '';
            
            // 如果直接有day和month字段，优先使用
            if (item.day && item.month) {
                day = item.day;
                month = item.month;
                console.log('使用直接提供的day和month:', day, month);
            }
            // 否则尝试从date字段解析
            else if (item.date && typeof item.date === 'string') {
                try {
                    const dateParts = item.date.split('-');
                    if (dateParts.length === 3) {
                        const year = parseInt(dateParts[0]);
                        const month_num = parseInt(dateParts[1]) - 1; // 月份从0开始
                        const day_num = parseInt(dateParts[2]);
                        
                        if (!isNaN(year) && !isNaN(month_num) && !isNaN(day_num)) {
                            day = day_num;
                            const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
                            month = monthNames[month_num];
                            console.log('从date解析出day和month:', day, month);
                        }
                    }
                } catch (error) {
                    console.error('日期解析错误:', error);
                }
            }
            
            // 获取摘要 - 如果没有summary字段，使用content的前100个字符
            const summary = item.summary || (item.content ? item.content.substring(0, 100) + '...' : '无内容');
            
            // 设置卡片内容
            newsCard.innerHTML = `
                <div class="news-date">
                    <span class="month">${month}</span>
                    <span class="day">${day}</span>
                </div>
                <div class="news-content">
                    <h3>${item.title || '无标题'}</h3>
                    <p>${summary}</p>
                    <button class="read-more-btn" data-id="${item.id}">阅读更多</button>
                </div>
            `;
            
            // 添加到容器
            newsContainer.appendChild(newsCard);
        });
        
        // 绑定阅读更多按钮事件
        bindReadMoreButtons(news);
    }
    
    // 绑定阅读更多按钮事件
    function bindReadMoreButtons(news) {
        const readMoreButtons = document.querySelectorAll('.read-more-btn');
        
        readMoreButtons.forEach(button => {
            button.addEventListener('click', function() {
                const newsId = parseInt(this.getAttribute('data-id'));
                const newsItem = news.find(item => item.id === newsId);
                
                if (newsItem) {
                    openNewsModal(newsItem);
                } else {
                    console.error('找不到对应的新闻项:', newsId);
                }
            });
        });
    }
    
    // 打开新闻详情模态框
    function openNewsModal(newsItem) {
        // 创建模态框
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.id = 'news-detail-modal';
        
        // 获取日期和月份 - 处理两种可能的数据格式
        let day = 'N/A';
        let month = '';
        
        // 如果直接有day和month字段，优先使用
        if (newsItem.day && newsItem.month) {
            day = newsItem.day;
            month = newsItem.month;
            console.log('使用直接提供的day和month:', day, month);
        }
        // 否则尝试从date字段解析
        else if (newsItem.date && typeof newsItem.date === 'string') {
            try {
                const dateParts = newsItem.date.split('-');
                if (dateParts.length === 3) {
                    const year = parseInt(dateParts[0]);
                    const month_num = parseInt(dateParts[1]) - 1; // 月份从0开始
                    const day_num = parseInt(dateParts[2]);
                    
                    if (!isNaN(year) && !isNaN(month_num) && !isNaN(day_num)) {
                        day = day_num;
                        const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
                        month = monthNames[month_num];
                        console.log('从date解析出day和month:', day, month);
                    }
                }
            } catch (error) {
                console.error('日期解析错误:', error);
            }
        }
        
        // 设置模态框内容
        modal.innerHTML = `
            <div class="modal-content news-modal-content">
                <span class="close-modal">&times;</span>
                <div class="modal-header">
                    <h3>${newsItem.title || '无标题'}</h3>
                    <div class="date-badge">
                        <span class="month">${month}</span>
                        <span class="day">${day}</span>
                    </div>
                </div>
                <div class="modal-body">
                    <div class="news-content-full">
                        ${newsItem.content || newsItem.summary || '无内容'}
                    </div>
                </div>
            </div>
        `;
        
        // 添加到文档
        document.body.appendChild(modal);
        
        // 显示模态框
        modal.style.display = 'block';
        
        // 关闭按钮事件
        modal.querySelector('.close-modal').addEventListener('click', function() {
            modal.remove();
        });
        
        // 点击模态框外部关闭
        window.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }
    
    // 分页设置
    const TALKS_PER_PAGE = 3; // 每页显示的对话数量
    let currentTalksPage = 1;
    let totalTalksPages = 1;
    let allTalks = []; // 存储所有对话

    // 渲染对话数据
    function renderTalks(talks, agents) {
        console.log('开始渲染对话数据...');
        console.log('对话数据:', talks);
        console.log('代理人数据:', agents);
        
        const talksContainer = document.querySelector('.talks-container');
        if (!talksContainer) {
            console.error('找不到对话容器元素 .talks-container');
            return;
        }
        
        // 清空现有内容
        talksContainer.innerHTML = '';
        
        // 如果没有对话数据
        if (!talks || talks.length === 0) {
            console.log('没有对话数据可显示');
            talksContainer.innerHTML = '<div class="empty-state">暂无对话数据</div>';
            return;
        }
        
        console.log(`找到 ${talks.length} 条对话数据，开始创建表格...`);
        
        // 创建对话表格
        const table = document.createElement('table');
        table.className = 'talks-table';
        
        // 添加表头
        table.innerHTML = `
            <thead>
                <tr>
                    <th>ID</th>
                    <th>标题</th>
                    <th>日期</th>
                    <th>操作</th>
                </tr>
            </thead>
            <tbody>
            </tbody>
        `;
        
        const tbody = table.querySelector('tbody');
        
        // 添加对话行
        talks.forEach(talk => {
            console.log(`处理对话: ID=${talk.id}, 标题=${talk.title}`);
            
            const row = document.createElement('tr');
            
            // 格式化日期
            let formattedDate = '未知日期';
            try {
                if (talk.date) {
                    const talkDate = new Date(talk.date);
                    if (!isNaN(talkDate.getTime())) {
                        formattedDate = talkDate.toLocaleDateString('zh-CN', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit'
                        });
                        console.log(`成功格式化日期: ${talk.date} -> ${formattedDate}`);
                    } else {
                        console.warn(`无效的日期格式: ${talk.date}`);
                    }
                } else {
                    console.warn(`对话 ID=${talk.id} 没有日期字段`);
                }
            } catch (error) {
                console.error('日期格式化错误:', error);
            }
            
            row.innerHTML = `
                <td>${talk.id}</td>
                <td>${talk.title || '无标题'}</td>
                <td>${formattedDate}</td>
                <td>
                    <button class="view-talk-btn" data-id="${talk.id}">查看</button>
                    <button class="delete-talk-btn" data-id="${talk.id}">删除</button>
                </td>
            `;
            
            tbody.appendChild(row);
        });
        
        // 添加表格到容器
        talksContainer.appendChild(table);
        console.log('表格已添加到容器');
        
        // 绑定按钮事件
        bindViewTalkButtons(agents);
        bindDeleteTalkButtons();
        console.log('按钮事件已绑定');
    }
    
    // 绑定删除对话按钮事件
    function bindDeleteTalkButtons() {
        const deleteButtons = document.querySelectorAll('.delete-talk-btn');
        deleteButtons.forEach(button => {
            button.addEventListener('click', function() {
                const talkId = this.getAttribute('data-id');
                
                if (confirm('确定要删除这个对话吗？')) {
                    // 发送删除请求
                    fetch(`${API_BASE_URL}/talks/${talkId}`, {
                        method: 'DELETE'
                    })
                    .then(response => {
                        if (!response.ok) throw new Error('删除失败');
                        return response.json();
                    })
                    .then(() => {
                        // 重新加载数据
                        loadDataFromAPI();
                    })
                    .catch(error => {
                        console.error('删除对话失败:', error);
                        showError('无法删除对话，请稍后再试');
                    });
                }
            });
        });
    }
    
    // 应用网站设置
    function applySettings(settings) {
        // 设置网站标题
        document.title = settings.title;
        
        // 设置主题色
        document.documentElement.style.setProperty('--primary-color', settings.primaryColor);
        
        // 更新其他可能的设置...
    }
    
    // 获取聊天模态框元素
    const chatModal = document.getElementById('chat-modal');
    const chatAgentAvatar = document.getElementById('chat-agent-avatar');
    const chatAgentName = document.getElementById('chat-agent-name');
    const chatAgentTitle = document.getElementById('chat-agent-title');
    const chatMessages = document.getElementById('chat-messages');
    const chatInput = document.getElementById('chat-input');
    const sendMessageBtn = document.getElementById('send-message-btn');

    // 当前聊天的代理人
    let currentChatAgent = null;

    // 打开聊天模态框
    function openChatModal(agent) {
        currentChatAgent = agent;
        
        // 设置代理人信息
        chatAgentAvatar.src = agent.avatar || '';
        chatAgentAvatar.onerror = function() {
            this.src = 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'50\' height=\'50\' viewBox=\'0 0 50 50\'%3E%3Crect width=\'50\' height=\'50\' fill=\'%23f0f0f0\' /%3E%3Ctext x=\'50%25\' y=\'50%25\' font-size=\'8\' text-anchor=\'middle\' alignment-baseline=\'middle\' font-family=\'Arial, sans-serif\' fill=\'%23999999\'%3E无图像%3C/text%3E%3C/svg%3E';
        };
        chatAgentName.textContent = agent.name || '未命名';
        chatAgentTitle.textContent = agent.title || '';
        
        // 清空聊天消息
        chatMessages.innerHTML = '';
        
        // 加载聊天历史记录
        loadChatHistory(agent.id);
        
        // 如果没有历史记录，添加自定义欢迎消息
        if (chatMessages.children.length === 0) {
            // 从prompt中提取欢迎语，如果没有则使用默认欢迎语
            let welcomeMessage = `您好！我是${agent.name}，${agent.title}。有什么我可以帮助您的吗？`;
            
            if (agent.prompt) {
                // 尝试从prompt中提取欢迎语
                const welcomeMatch = agent.prompt.match(/欢迎语是：['"](.+?)['"]/) || 
                                    agent.prompt.match(/欢迎消息是：['"](.+?)['"]/) ||
                                    agent.prompt.match(/你的问候语是：['"](.+?)['"]/);
                
                if (welcomeMatch && welcomeMatch[1]) {
                    welcomeMessage = welcomeMatch[1];
                }
            }
            
            addAgentMessage(welcomeMessage);
            
            // 保存这条欢迎消息到历史记录
            saveChatMessage(agent.id, {
                sender: 'agent',
                message: welcomeMessage,
                timestamp: new Date().toISOString()
            });
        }
        
        // 添加清除历史按钮
        addClearHistoryButton();
        
        // 显示模态框
        chatModal.style.display = 'block';
    }

    // 加载聊天历史记录
    function loadChatHistory(agentId) {
        try {
            // 从localStorage获取聊天历史
            const chatHistoryJSON = localStorage.getItem(`chat_history_${agentId}`);
            if (!chatHistoryJSON) return;
            
            const chatHistory = JSON.parse(chatHistoryJSON);
            
            // 渲染聊天历史
            chatHistory.forEach(item => {
                if (item.sender === 'user') {
                    addUserMessage(item.message, false);
                } else {
                    addAgentMessage(item.message, false);
                }
            });
            
            // 滚动到底部
            chatMessages.scrollTop = chatMessages.scrollHeight;
        } catch (error) {
            console.error('加载聊天历史失败:', error);
        }
    }

    // 保存聊天消息到历史记录
    function saveChatMessage(agentId, messageData) {
        try {
            // 从localStorage获取现有聊天历史
            const chatHistoryJSON = localStorage.getItem(`chat_history_${agentId}`);
            let chatHistory = chatHistoryJSON ? JSON.parse(chatHistoryJSON) : [];
            
            // 添加新消息
            chatHistory.push(messageData);
            
            // 如果历史记录太长，可以限制保存的消息数量
            const MAX_MESSAGES = 100;
            if (chatHistory.length > MAX_MESSAGES) {
                chatHistory = chatHistory.slice(chatHistory.length - MAX_MESSAGES);
            }
            
            // 保存回localStorage
            localStorage.setItem(`chat_history_${agentId}`, JSON.stringify(chatHistory));
        } catch (error) {
            console.error('保存聊天消息失败:', error);
        }
    }

    // 添加用户消息
    function addUserMessage(message, save = true) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'chat-message user';
        messageDiv.innerHTML = `
            <div class="message-bubble">${message}</div>
        `;
        chatMessages.appendChild(messageDiv);
        
        // 滚动到底部
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        // 保存消息到历史记录
        if (save && currentChatAgent) {
            saveChatMessage(currentChatAgent.id, {
                sender: 'user',
                message: message,
                timestamp: new Date().toISOString()
            });
        }
    }

    // 添加代理人消息
    function addAgentMessage(message, save = true) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'chat-message agent';
        messageDiv.innerHTML = `
            <div class="message-bubble">${message}</div>
        `;
        chatMessages.appendChild(messageDiv);
        
        // 滚动到底部
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        // 保存消息到历史记录
        if (save && currentChatAgent) {
            saveChatMessage(currentChatAgent.id, {
                sender: 'agent',
                message: message,
                timestamp: new Date().toISOString()
            });
        }
    }

    // 显示正在输入指示器
    function showTypingIndicator() {
        const indicatorDiv = document.createElement('div');
        indicatorDiv.className = 'chat-message agent typing-indicator-container';
        indicatorDiv.innerHTML = `
            <div class="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
            </div>
        `;
        chatMessages.appendChild(indicatorDiv);
        
        // 滚动到底部
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        return indicatorDiv;
    }

    // 发送消息
    function sendMessage() {
        const message = chatInput.value.trim();
        if (!message) return;
        
        // 添加用户消息
        addUserMessage(message);
        
        // 清空输入框
        chatInput.value = '';
        
        // 显示代理人正在输入
        const typingIndicator = showTypingIndicator();
        
        // 模拟AI响应（这里可以替换为实际的AI API调用）
        setTimeout(() => {
            // 移除输入指示器
            typingIndicator.remove();
            
            // 根据代理人的自定义prompt生成响应
            let response = '';
            
            if (currentChatAgent.prompt) {
                // 使用自定义prompt生成响应
                response = generateResponseWithPrompt(message, currentChatAgent.prompt);
            } else {
                // 使用默认方法生成响应
                if (currentChatAgent.title.includes('DeFi')) {
                    response = generateDeFiResponse(message);
                } else if (currentChatAgent.title.includes('Security')) {
                    response = generateSecurityResponse(message);
                } else if (currentChatAgent.title.includes('Governance')) {
                    response = generateGovernanceResponse(message);
                } else {
                    response = generateGenericResponse(message);
                }
            }
            
            // 添加代理人消息
            addAgentMessage(response);
        }, 1500); // 模拟延迟
    }

    // 使用自定义prompt生成响应
    function generateResponseWithPrompt(message, prompt) {
        // 这里是一个简化的实现，实际应用中可能需要调用OpenAI API等
        // 根据代理人角色和prompt的内容，生成更个性化的响应
        
        // 提取prompt中的关键词，用于生成相关回复
        const keywords = {
            'DeFi': ['收益率', '流动性', '风险管理', '投资策略', '市场分析'],
            'Security': ['安全审计', '漏洞防护', '私钥管理', '钓鱼攻击', '多重签名'],
            'Governance': ['DAO结构', '投票机制', '提案流程', '社区参与', '权力分配']
        };
        
        // 确定代理人类型
        let agentType = 'Generic';
        if (prompt.includes('DeFi') || prompt.includes('投资') || prompt.includes('策略')) {
            agentType = 'DeFi';
        } else if (prompt.includes('安全') || prompt.includes('Security') || prompt.includes('漏洞')) {
            agentType = 'Security';
        } else if (prompt.includes('治理') || prompt.includes('Governance') || prompt.includes('DAO')) {
            agentType = 'Governance';
        }
        
        // 根据代理人类型和用户消息生成响应
        const relevantKeywords = keywords[agentType] || keywords['Generic'];
        const randomKeyword = relevantKeywords[Math.floor(Math.random() * relevantKeywords.length)];
        
        // 根据代理人类型生成响应
        if (agentType === 'DeFi') {
            return generateDeFiResponse(message);
        } else if (agentType === 'Security') {
            return generateSecurityResponse(message);
        } else if (agentType === 'Governance') {
            return generateGovernanceResponse(message);
        } else {
            return generateGenericResponse(message);
        }
    }

    // 生成DeFi相关响应
    function generateDeFiResponse(message) {
        const responses = [
            "从DeFi策略角度来看，我建议考虑分散投资于多个协议，以降低风险。",
            "目前收益农场的APY确实很诱人，但请记住高收益通常伴随着高风险。",
            "我们可以设计一个定制的DeFi策略，结合稳定币借贷和流动性挖矿，以平衡风险和收益。",
            "最近的市场波动确实影响了一些DeFi协议，但长期来看，这个领域仍有巨大潜力。",
            "我可以帮您分析几个顶级DeFi协议的风险和收益情况，然后制定适合您的策略。"
        ];
        return responses[Math.floor(Math.random() * responses.length)];
    }

    // 生成安全相关响应
    function generateSecurityResponse(message) {
        const responses = [
            "从安全角度考虑，我建议您定期审核智能合约并使用硬件钱包存储您的加密资产。",
            "最近我们发现了一些新的钓鱼攻击手段，请务必验证所有交易网站的URL。",
            "多重签名钱包是企业级资产管理的最佳安全实践之一。",
            "我可以帮您进行安全审计，确保您的DeFi操作不会面临不必要的风险。",
            "记住，永远不要分享您的私钥或助记词，即使是声称来自官方团队的人也不例外。"
        ];
        return responses[Math.floor(Math.random() * responses.length)];
    }

    // 生成治理相关响应
    function generateGovernanceResponse(message) {
        const responses = [
            "在DAO治理中，投票权重和参与度是两个关键指标，我们需要平衡这两者。",
            "我们可以设计一个更有效的提案流程，确保社区成员有足够的时间审查和讨论。",
            "治理代币的分配模型直接影响DAO的决策质量，我们应该仔细设计这个方面。",
            "链下讨论和链上投票的结合是目前最有效的DAO治理模式之一。",
            "我可以帮您分析几个成功的DAO案例，从中汲取经验用于您的项目。"
        ];
        return responses[Math.floor(Math.random() * responses.length)];
    }

    // 生成通用响应
    function generateGenericResponse(message) {
        const responses = [
            "这是个很好的问题。让我思考一下最佳的解决方案。",
            "我理解您的关注点，我们可以一起探讨几种可能的方案。",
            "基于我的经验，我建议您考虑多种因素后再做决定。",
            "这个领域正在快速发展，我们需要保持灵活性和前瞻性。",
            "我很乐意深入讨论这个话题，您有什么具体的疑问吗？"
        ];
        return responses[Math.floor(Math.random() * responses.length)];
    }

    // 发送按钮点击事件
    sendMessageBtn.addEventListener('click', sendMessage);

    // 输入框回车键发送消息
    chatInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    // 关闭聊天模态框
    document.querySelector('#chat-modal .close-modal').addEventListener('click', function() {
        chatModal.style.display = 'none';
    });

    // 点击模态框外部关闭
    window.addEventListener('click', function(e) {
        if (e.target === chatModal) {
            chatModal.style.display = 'none';
        }
    });

    // 在聊天模态框中添加清除历史按钮
    function addClearHistoryButton() {
        // 检查是否已经存在清除按钮
        if (document.getElementById('clear-chat-history')) return;
        
        const clearButton = document.createElement('button');
        clearButton.id = 'clear-chat-history';
        clearButton.className = 'clear-history-btn';
        clearButton.innerHTML = '<i class="fas fa-trash"></i> 清除聊天记录';
        
        clearButton.addEventListener('click', function() {
            if (confirm('确定要清除与该代理人的所有聊天记录吗？')) {
                clearChatHistory();
            }
        });
        
        // 将按钮添加到模态框头部
        document.querySelector('#chat-modal .modal-header').appendChild(clearButton);
    }

    // 清除当前代理人的聊天历史
    function clearChatHistory() {
        if (!currentChatAgent) return;
        
        // 从localStorage中删除聊天历史
        localStorage.removeItem(`chat_history_${currentChatAgent.id}`);
        
        // 清空聊天消息
        chatMessages.innerHTML = '';
        
        // 添加新的欢迎消息
        addAgentMessage(`您好！我是${currentChatAgent.name}，${currentChatAgent.title}。有什么我可以帮助您的吗？`);
        
        // 保存这条欢迎消息到历史记录
        saveChatMessage(currentChatAgent.id, {
            sender: 'agent',
            message: `您好！我是${currentChatAgent.name}，${currentChatAgent.title}。有什么我可以帮助您的吗？`,
            timestamp: new Date().toISOString()
        });
    }

    // 绑定查看对话按钮事件
    function bindViewTalkButtons(agents) {
        const viewButtons = document.querySelectorAll('.view-talk-btn');
        viewButtons.forEach(button => {
            button.addEventListener('click', function() {
                const talkId = this.getAttribute('data-id');
                
                // 查找对应的对话
                fetch(`${API_BASE_URL}/talks/${talkId}`)
                    .then(response => response.json())
                    .then(talk => {
                        openTalkDetail(talk, agents);
                    })
                    .catch(error => {
                        console.error('获取对话数据失败:', error);
                        showError('无法加载对话数据，请稍后再试');
                    });
            });
        });
    }

    // 打开对话详情
    function openTalkDetail(talk, agents) {
        console.log('打开对话详情:', talk);
        
        // 获取代理人数据，用于显示发送者信息
        fetch('/api/agents')
            .then(response => response.json())
            .then(agents => {
                // 创建模态框
                const modal = document.createElement('div');
                modal.className = 'modal';
                modal.id = 'talk-detail-modal';
                
                // 获取参与者名称
                const participantNames = talk.participants ? talk.participants.map(id => {
                    const agent = agents.find(a => a.id === id);
                    return agent ? agent.name : '未知代理人';
                }).join(', ') : '未知参与者';
                
                // 格式化日期
                let formattedDate = '未知日期';
                try {
                    if (talk.date) {
                        const talkDate = new Date(talk.date);
                        if (!isNaN(talkDate.getTime())) {
                            formattedDate = talkDate.toLocaleDateString('zh-CN', {
                                year: 'numeric',
                                month: '2-digit',
                                day: '2-digit'
                            });
                        }
                    }
                } catch (error) {
                    console.error('日期格式化错误:', error);
                }
                
                // 创建消息HTML
                let messagesHTML = '';
                if (talk.messages && Array.isArray(talk.messages)) {
                    talk.messages.forEach(message => {
                        const sender = agents.find(a => a.id === message.senderId);
                        const senderName = sender ? sender.name : (message.sender === 'user' ? '用户' : '未知发送者');
                        const senderAvatar = sender ? sender.avatar : '';
                        
                        messagesHTML += `
                            <div class="talk-message">
                                <div class="message-avatar">
                                    <img src="${senderAvatar}" alt="${senderName}" 
                                         onerror="this.src='data:image/svg+xml,%3Csvg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'50\\' height=\\'50\\' viewBox=\\'0 0 50 50\\'%3E%3Crect width=\\'50\\' height=\\'50\\' fill=\\'%23f0f0f0\\' /%3E%3Ctext x=\\'50%25\\' y=\\'50%25\\' font-size=\\'8\\' text-anchor=\\'middle\\' alignment-baseline=\\'middle\\' font-family=\\'Arial, sans-serif\\' fill=\\'%23999999\\'%3E无图像%3C/text%3E%3C/svg%3E'">
                                </div>
                                <div class="message-content">
                                    <div class="message-sender">${senderName}</div>
                                    <p class="message-text">${message.content}</p>
                                    <div class="message-time">${message.time || ''}</div>
                                </div>
                            </div>
                        `;
                    });
                } else {
                    messagesHTML = '<div class="empty-message">暂无消息</div>';
                }
                
                // 设置模态框内容
                modal.innerHTML = `
                    <div class="modal-content talk-modal-content">
                        <span class="close-modal">&times;</span>
                        <div class="modal-header">
                            <h3>${talk.title || '无标题对话'}</h3>
                            <span class="talk-date">${formattedDate}</span>
                        </div>
                        <div class="modal-body">
                            <div class="talk-info">
                                <p><strong>参与者:</strong> ${participantNames}</p>
                                <div class="talk-tags">
                                    ${talk.tags ? talk.tags.map(tag => `<span class="tag">${tag}</span>`).join('') : ''}
                                </div>
                            </div>
                            <div class="talk-messages">
                                ${messagesHTML}
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button class="close-btn">关闭</button>
                        </div>
                    </div>
                `;
                
                // 添加到文档
                document.body.appendChild(modal);
                
                // 显示模态框
                modal.style.display = 'block';
                
                // 关闭按钮事件
                const closeModalBtn = modal.querySelector('.close-modal');
                if (closeModalBtn) {
                    closeModalBtn.addEventListener('click', function() {
                        modal.remove();
                    });
                }
                
                // 关闭按钮事件
                const closeBtn = modal.querySelector('.close-btn');
                if (closeBtn) {
                    closeBtn.addEventListener('click', function() {
                        modal.remove();
                    });
                }
                
                // 点击模态框外部关闭
                window.addEventListener('click', function(e) {
                    if (e.target === modal) {
                        modal.remove();
                    }
                });
            })
            .catch(error => {
                console.error('获取代理人数据失败:', error);
                alert('无法加载代理人数据，请稍后再试');
            });
    }

    // 加载对话数据并渲染到页面
    function loadTalks() {
        console.log('加载对话数据');
        
        // 查找对话容器（尝试多种可能的选择器）
        let talksContainer = document.querySelector('.talks-container');
        
        // 如果找不到容器，创建一个新的
        if (!talksContainer) {
            console.log('找不到.talks-container元素，尝试查找#talks-section');
            const talksSection = document.querySelector('#talks-section');
            
            if (talksSection) {
                console.log('找到#talks-section，创建.talks-container');
                talksContainer = document.createElement('div');
                talksContainer.className = 'talks-container';
                talksSection.appendChild(talksContainer);
            } else {
                console.log('找不到#talks-section，尝试查找Agent Talks标题');
                
                // 尝试通过标题查找
                const headers = Array.from(document.querySelectorAll('h2, h3'));
                const talksHeader = headers.find(h => h.textContent.includes('Agent Talks'));
                
                if (talksHeader) {
                    console.log('找到Agent Talks标题，创建容器');
                    const parent = talksHeader.parentElement;
                    talksContainer = document.createElement('div');
                    talksContainer.className = 'talks-container';
                    parent.appendChild(talksContainer);
                } else {
                    console.error('无法找到任何可用的容器位置');
                    return;
                }
            }
        }
        
        console.log('找到对话容器:', talksContainer);
        
        // 显示加载状态
        talksContainer.innerHTML = '<div class="loading">加载中...</div>';
        
        // 获取对话数据
        fetch('/api/talks')
            .then(response => {
                if (!response.ok) {
                    throw new Error('获取对话数据失败');
                }
                return response.json();
            })
            .then(data => {
                console.log('获取到对话数据:', data);
                
                // 按日期排序，最新的在前面
                data.sort((a, b) => {
                    const dateA = new Date(a.date || 0);
                    const dateB = new Date(b.date || 0);
                    return dateB - dateA; // 降序排序，最新的在前
                });
                
                // 将容器转换为卡片网格
                convertToCardGrid(talksContainer);
                
                // 渲染对话卡片
                renderTalkCards(data, talksContainer);
            })
            .catch(error => {
                console.error('加载对话数据失败:', error);
                talksContainer.innerHTML = '<div class="error">加载对话数据失败，请刷新页面重试</div>';
            });
    }

    // 将容器转换为卡片网格
    function convertToCardGrid(container) {
        if (!container) return;
        
        console.log('将容器转换为卡片网格');
        
        // 添加网格类
        container.classList.add('talks-grid');
        container.style.display = 'grid';
        container.style.gridTemplateColumns = 'repeat(auto-fill, minmax(300px, 1fr))';
        container.style.gap = '20px';
        container.style.marginTop = '20px';
        
        // 清空容器
        container.innerHTML = '';
    }

    // 渲染对话卡片
    function renderTalkCards(talks, container) {
        if (!container) {
            console.error('未提供容器元素');
            return;
        }
        
        console.log('渲染对话卡片到容器:', container);
        
        // 如果没有对话数据
        if (!talks || !Array.isArray(talks) || talks.length === 0) {
            container.innerHTML = '<div class="empty-state">暂无对话数据</div>';
            return;
        }
        
        // 加载代理人数据，用于显示参与者名称
        fetch('/api/agents')
            .then(response => response.json())
            .then(agents => {
                console.log('获取到代理人数据:', agents.length);
                
                // 创建对话卡片
                talks.forEach(talk => {
                    // 格式化日期
                    let formattedDate = '未知日期';
                    try {
                        if (talk.date) {
                            const talkDate = new Date(talk.date);
                            if (!isNaN(talkDate.getTime())) {
                                formattedDate = talkDate.toLocaleDateString('zh-CN', {
                                    year: 'numeric',
                                    month: '2-digit',
                                    day: '2-digit'
                                });
                            }
                        }
                    } catch (error) {
                        console.error('日期格式化错误:', error);
                    }
                    
                    // 获取参与者名称
                    let participantsHTML = '<div class="talk-participants">无参与者</div>';
                    if (talk.participants && Array.isArray(talk.participants) && talk.participants.length > 0) {
                        const participantsList = talk.participants.map(id => {
                            const agent = agents.find(a => a.id == id);
                            return agent ? agent.name : `未知(ID:${id})`;
                        });
                        participantsHTML = `<div class="talk-participants">参与者: ${participantsList.join(', ')}</div>`;
                    }
                    
                    // 格式化标签
                    let tagsHTML = '';
                    if (talk.tags && Array.isArray(talk.tags) && talk.tags.length > 0) {
                        tagsHTML = `<div class="talk-tags">${talk.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}</div>`;
                    }
                    
                    // 获取摘要
                    let summary = '';
                    if (talk.messages && talk.messages.length > 0) {
                        summary = talk.messages[0].content;
                        if (summary.length > 100) {
                            summary = summary.substring(0, 100) + '...';
                        }
                    }
                    
                    // 创建卡片
                    const card = document.createElement('div');
                    card.className = 'talk-card';
                    card.innerHTML = `
                        <h3>${talk.title || '无标题'}</h3>
                        <div class="talk-date">${formattedDate}</div>
                        ${participantsHTML}
                        ${tagsHTML}
                        <p>${summary || '点击查看详情'}</p>
                        <button class="view-btn" data-id="${talk.id}">查看详情</button>
                    `;
                    
                    // 添加点击事件
                    card.querySelector('.view-btn').addEventListener('click', function() {
                        viewTalkDetail(talk.id, agents);
                    });
                    
                    container.appendChild(card);
                });
            })
            .catch(error => {
                console.error('获取代理人数据失败:', error);
                container.innerHTML = '<div class="error">加载数据失败，请刷新页面重试</div>';
            });
    }

    // 查看对话详情
    function viewTalkDetail(talkId, agents) {
        fetch(`/api/talks/${talkId}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('获取对话详情失败');
                }
                return response.json();
            })
            .then(talk => {
                // 创建模态框
                const modal = document.createElement('div');
                modal.className = 'modal';
                modal.style.position = 'fixed';
                modal.style.top = '0';
                modal.style.left = '0';
                modal.style.width = '100%';
                modal.style.height = '100%';
                modal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
                modal.style.display = 'flex';
                modal.style.justifyContent = 'center';
                modal.style.alignItems = 'center';
                modal.style.zIndex = '1000';
                
                // 格式化日期
                let formattedDate = '未知日期';
                try {
                    if (talk.date) {
                        const talkDate = new Date(talk.date);
                        if (!isNaN(talkDate.getTime())) {
                            formattedDate = talkDate.toLocaleDateString('zh-CN', {
                                year: 'numeric',
                                month: '2-digit',
                                day: '2-digit'
                            });
                        }
                    }
                } catch (error) {
                    console.error('日期格式化错误:', error);
                }
                
                // 获取参与者名称
                let participantsHTML = '';
                if (talk.participants && Array.isArray(talk.participants) && talk.participants.length > 0) {
                    const participantsList = talk.participants.map(id => {
                        const agent = agents.find(a => a.id == id);
                        return agent ? agent.name : `未知(ID:${id})`;
                    });
                    participantsHTML = `<p><strong>参与者:</strong> ${participantsList.join(', ')}</p>`;
                }
                
                // 创建消息HTML
                let messagesHTML = '';
                if (talk.messages && Array.isArray(talk.messages) && talk.messages.length > 0) {
                    messagesHTML = talk.messages.map(message => {
                        // 查找发送者
                        let senderName = '未知';
                        let senderAvatar = '';
                        if (message.senderId) {
                            const agent = agents.find(a => a.id == message.senderId);
                            if (agent) {
                                senderName = agent.name;
                                senderAvatar = agent.avatar ? 
                                    `<img src="${agent.avatar}" alt="${agent.name}" style="width: 40px; height: 40px; border-radius: 50%; margin-right: 10px;">` : 
                                    '';
                            }
                        }
                        
                        return `
                            <div style="margin-bottom: 20px; display: flex;">
                                ${senderAvatar}
                                <div style="flex: 1;">
                                    <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                                        <strong>${senderName}</strong>
                                        <span style="color: #777;">${message.time || ''}</span>
                                    </div>
                                    <div style="background-color: #f5f5f5; padding: 10px; border-radius: 8px;">
                                        ${message.content}
                                    </div>
                                </div>
                            </div>
                        `;
                    }).join('');
                } else {
                    messagesHTML = '<p>暂无消息</p>';
                }
                
                // 设置模态框内容
                modal.innerHTML = `
                    <div style="
                        background-color: white;
                        border-radius: 8px;
                        width: 80%;
                        max-width: 800px;
                        max-height: 80vh;
                        overflow-y: auto;
                        padding: 20px;
                        position: relative;
                    ">
                        <button style="
                            position: absolute;
                            top: 10px;
                            right: 10px;
                            background: none;
                            border: none;
                            font-size: 24px;
                            cursor: pointer;
                        ">&times;</button>
                        
                        <h2 style="margin-top: 0;">${talk.title || '无标题对话'}</h2>
                        
                        <div style="margin: 15px 0; padding-bottom: 15px; border-bottom: 1px solid #eee;">
                            <p><strong>日期:</strong> ${formattedDate}</p>
                            ${participantsHTML}
                        </div>
                        
                        <h3>对话内容</h3>
                        <div style="margin-top: 15px;">
                            ${messagesHTML}
                        </div>
                        
                        <div style="text-align: right; margin-top: 20px;">
                            <button style="
                                background-color: #6c5ce7;
                                color: white;
                                border: none;
                                padding: 8px 15px;
                                border-radius: 4px;
                                cursor: pointer;
                            ">关闭</button>
                        </div>
                    </div>
                `;
                
                // 添加到文档
                document.body.appendChild(modal);
                
                // 关闭按钮事件
                const closeButtons = modal.querySelectorAll('button');
                closeButtons.forEach(button => {
                    button.addEventListener('click', function() {
                        modal.remove();
                    });
                });
                
                // 点击模态框外部关闭
                modal.addEventListener('click', function(e) {
                    if (e.target === modal) {
                        modal.remove();
                    }
                });
            })
            .catch(error => {
                console.error('获取对话详情失败:', error);
                alert('获取对话详情失败，请稍后再试');
            });
    }

    // 页面加载完成后执行
    document.addEventListener('DOMContentLoaded', function() {
        // 加载对话数据
        loadTalks();
        
        // 绑定搜索按钮事件
        const searchBtn = document.getElementById('search-btn');
        const searchInput = document.getElementById('talk-search');
        
        if (searchBtn && searchInput) {
            searchBtn.addEventListener('click', function() {
                const keyword = searchInput.value.trim().toLowerCase();
                
                // 如果关键词为空，加载所有对话
                if (!keyword) {
                    loadTalks();
                    return;
                }
                
                // 获取所有对话数据
                fetch('/api/talks')
                    .then(response => response.json())
                    .then(data => {
                        // 按日期排序，最新的在前面
                        data.sort((a, b) => {
                            const dateA = new Date(a.date || 0);
                            const dateB = new Date(b.date || 0);
                            return dateB - dateA; // 降序排序，最新的在前
                        });
                        
                        // 过滤对话
                        const filteredTalks = data.filter(talk => {
                            // 搜索标题
                            if (talk.title && talk.title.toLowerCase().includes(keyword)) {
                                return true;
                            }
                            
                            // 搜索标签
                            if (talk.tags && Array.isArray(talk.tags)) {
                                for (const tag of talk.tags) {
                                    if (tag.toLowerCase().includes(keyword)) {
                                        return true;
                                    }
                                }
                            }
                            
                            // 搜索消息内容
                            if (talk.messages && Array.isArray(talk.messages)) {
                                for (const message of talk.messages) {
                                    if (message.content && message.content.toLowerCase().includes(keyword)) {
                                        return true;
                                    }
                                }
                            }
                            
                            return false;
                        });
                        
                        // 将表格容器转换为卡片网格
                        const talksContainer = document.querySelector('.talks-container');
                        convertToCardGrid(talksContainer);
                        
                        // 渲染过滤后的对话
                        renderTalkCards(filteredTalks, talksContainer);
                    })
                    .catch(error => {
                        console.error('搜索对话失败:', error);
                        alert('搜索失败，请稍后再试');
                    });
            });
            
            // 回车键触发搜索
            searchInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    searchBtn.click();
                }
            });
        }

        // 等待一小段时间确保其他脚本已执行
        setTimeout(function() {
            console.log('开始转换表格为卡片布局...');
            
            // 查找表格
            const table = document.querySelector('#talks-section table');
            if (!table) {
                console.log('未找到表格，可能已经是卡片布局');
                return;
            }
            
            // 获取表格数据
            const rows = Array.from(table.querySelectorAll('tbody tr'));
            if (rows.length === 0) {
                console.log('表格中没有数据');
                return;
            }
            
            // 创建卡片容器
            const cardsContainer = document.createElement('div');
            cardsContainer.className = 'talks-grid';
            cardsContainer.style.display = 'grid';
            cardsContainer.style.gridTemplateColumns = 'repeat(auto-fill, minmax(300px, 1fr))';
            cardsContainer.style.gap = '20px';
            cardsContainer.style.marginTop = '20px';
            
            // 遍历表格行，创建卡片
            rows.forEach(row => {
                const cells = Array.from(row.querySelectorAll('td'));
                if (cells.length < 3) return;
                
                // 获取数据
                const title = cells[0].textContent.trim();
                const date = cells[1].textContent.trim();
                const viewButton = cells[2].querySelector('button');
                const talkId = viewButton ? viewButton.getAttribute('data-id') : '';
                
                // 创建卡片
                const card = document.createElement('div');
                card.className = 'talk-card';
                card.style.backgroundColor = 'white';
                card.style.borderRadius = '12px';
                card.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
                card.style.padding = '20px';
                card.style.transition = 'transform 0.3s, box-shadow 0.3s';
                card.style.cursor = 'pointer';
                
                // 设置卡片内容
                card.innerHTML = `
                    <h3 style="margin-top: 0; color: #6c5ce7;">${title}</h3>
                    <div style="color: #666; margin-bottom: 10px;">${date}</div>
                    <button class="view-btn" data-id="${talkId}" style="
                        background-color: #6c5ce7;
                        color: white;
                        border: none;
                        padding: 8px 15px;
                        border-radius: 4px;
                        cursor: pointer;
                        width: 100%;
                        margin-top: 10px;
                    ">查看详情</button>
                `;
                
                // 添加悬停效果
                card.addEventListener('mouseenter', function() {
                    this.style.transform = 'translateY(-5px)';
                    this.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.2)';
                });
                
                card.addEventListener('mouseleave', function() {
                    this.style.transform = '';
                    this.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
                });
                
                // 添加点击事件
                const cardButton = card.querySelector('.view-btn');
                if (cardButton && viewButton) {
                    cardButton.addEventListener('click', function() {
                        viewButton.click(); // 触发原始按钮的点击事件
                    });
                }
                
                cardsContainer.appendChild(card);
            });
            
            // 替换表格
            table.parentNode.replaceChild(cardsContainer, table);
            
            console.log('表格已转换为卡片布局');
        }, 1000); // 等待1秒确保页面加载完成
    });
}); 