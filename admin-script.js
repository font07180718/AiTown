document.addEventListener('DOMContentLoaded', function() {
    // API基础URL
    const API_BASE_URL = 'http://localhost:3000/api';
    
    // 获取模态框元素
    const agentModal = document.getElementById('agent-modal');
    const newsModal = document.getElementById('news-modal');
    const addAgentBtn = document.getElementById('add-agent-btn');
    const addNewsBtn = document.getElementById('add-news-btn');
    const closeModalBtns = document.querySelectorAll('.close-modal, .cancel-btn');
    
    // 获取导航项和内容部分
    const navItems = document.querySelectorAll('.nav-item');
    const contentSections = document.querySelectorAll('.content-section');
    
    // 加载数据
    loadAllData();
    
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
    
    // 仪表盘中的"查看全部"链接
    const viewAllLinks = document.querySelectorAll('.view-all');
    viewAllLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const sectionToShow = this.getAttribute('data-section');
            
            // 模拟点击对应的导航项
            document.querySelector(`.nav-item[data-section="${sectionToShow}"]`).click();
        });
    });
    
    // 主题切换功能
    const themeToggle = document.querySelector('.theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            document.body.classList.toggle('dark-theme');
            
            // 切换图标
            const icon = this.querySelector('i');
            if (icon.classList.contains('fa-moon')) {
                icon.classList.remove('fa-moon');
                icon.classList.add('fa-sun');
            } else {
                icon.classList.remove('fa-sun');
                icon.classList.add('fa-moon');
            }
        });
    }
    
    // 打开代理人模态框
    if (addAgentBtn) {
        addAgentBtn.addEventListener('click', function() {
            // 重置表单
            const form = document.getElementById('agent-form');
            if (form) {
                form.reset();
                form.dataset.id = '';
                
                // 更改模态框标题
                const title = document.getElementById('agent-modal-title');
                if (title) title.textContent = '添加代理人';
                
                // 显示模态框
                if (agentModal) agentModal.classList.add('active');
            }
        });
    }
    
    // 打开新闻模态框
    if (addNewsBtn) {
        addNewsBtn.addEventListener('click', function() {
            // 重置表单
            const form = document.getElementById('news-form');
            if (form) {
                form.reset();
                form.dataset.id = '';
                
                // 更改模态框标题
                const title = document.getElementById('news-modal-title');
                if (title) title.textContent = '添加新闻';
                
                // 显示模态框
                if (newsModal) newsModal.classList.add('active');
            }
        });
    }
    
    // 关闭模态框
    closeModalBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            if (agentModal) agentModal.classList.remove('active');
            if (newsModal) newsModal.classList.remove('active');
        });
    });
    
    // 点击模态框外部关闭
    window.addEventListener('click', function(e) {
        if (e.target === agentModal) agentModal.classList.remove('active');
        if (e.target === newsModal) newsModal.classList.remove('active');
    });
    
    // 加载所有数据
    async function loadAllData() {
        try {
            // 显示加载状态
            showLoading(true);
            
            // 加载代理人数据
            const agents = await loadAgents();
            
            // 加载新闻数据
            await loadNews();
            
            // 加载对话数据
            await loadTalks(agents);
            
            // 加载设置数据
            await loadSettings();
            
            // 隐藏加载状态
            showLoading(false);
        } catch (error) {
            console.error('加载数据失败:', error);
            showLoading(false);
            showError('无法从服务器加载数据，请稍后再试。');
        }
    }
    
    // 显示/隐藏加载状态
    function showLoading(show) {
        // 这里可以添加加载指示器的显示/隐藏逻辑
        const loadingElements = document.querySelectorAll('.loading');
        loadingElements.forEach(el => {
            if (el) {
                el.style.display = show ? 'block' : 'none';
            }
        });
    }
    
    // 显示错误消息
    function showError(message) {
        alert(message);
    }
    
    // 加载代理人数据
    async function loadAgents() {
        try {
            const response = await fetch(`${API_BASE_URL}/agents`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const agents = await response.json();
            
            // 更新代理人表格
            updateAgentsTable(agents);
            
            // 更新仪表盘上的代理人数量
            updateAgentCount(agents.length);
            
            return agents;
        } catch (error) {
            console.error('加载代理人数据失败:', error);
            showError('加载代理人数据失败，请检查服务器是否正常运行。');
            return [];
        }
    }
    
    // 更新代理人表格
    function updateAgentsTable(agents) {
        const tableBody = document.querySelector('.agents-table tbody');
        if (!tableBody) {
            console.error('找不到代理人表格');
            return;
        }
        
        // 清空表格
        tableBody.innerHTML = '';
        
        // 添加代理人行
        agents.forEach(agent => {
            const row = document.createElement('tr');
            row.dataset.id = agent.id;
            
            const statusClass = agent.status ? 'online' : 'offline';
            const statusText = agent.status ? '在线' : '离线';
            
            row.innerHTML = `
                <td><img src="${agent.avatar}" alt="${agent.name}" class="table-avatar"></td>
                <td>${agent.name}</td>
                <td>${agent.title}</td>
                <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                <td>${agent.addDate || '未知'}</td>
                <td>
                    <button class="action-btn edit-btn" data-id="${agent.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete-btn" data-id="${agent.id}">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </td>
            `;
            
            tableBody.appendChild(row);
        });
        
        // 为编辑按钮添加点击事件
        const editButtons = document.querySelectorAll('.agents-table .edit-btn');
        console.log('找到编辑按钮数量:', editButtons.length);
        
        editButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                const agentId = this.dataset.id;
                console.log('点击编辑按钮, 代理人ID:', agentId);
                editAgent(agentId);
            });
        });
        
        // 为删除按钮添加点击事件
        const deleteButtons = document.querySelectorAll('.agents-table .delete-btn');
        deleteButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                const agentId = this.dataset.id;
                deleteAgent(agentId);
            });
        });
    }
    
    // 更新代理人数量
    function updateAgentCount(count) {
        const agentCountElement = document.querySelector('.stat-card:nth-child(1) .stat-info h3');
        if (agentCountElement) {
            agentCountElement.textContent = count;
        }
    }
    
    // 编辑代理人
    async function editAgent(agentId) {
        console.log('开始编辑代理人, ID:', agentId);
        try {
            // 获取代理人数据
            const response = await fetch(`${API_BASE_URL}/agents/${agentId}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const agent = await response.json();
            console.log('获取到的代理人数据:', agent);
            
            // 填充表单
            document.getElementById('agent-name').value = agent.name || '';
            document.getElementById('agent-title').value = agent.title || '';
            document.getElementById('agent-bio').value = agent.bio || '';
            document.getElementById('agent-avatar').value = agent.avatar || '';
            document.getElementById('agent-status').checked = agent.status || false;
            
            if (agent.stats) {
                if (document.getElementById('agent-stat-value1')) {
                    document.getElementById('agent-stat-value1').value = agent.stats.value1 || '';
                }
                if (document.getElementById('agent-stat-label1')) {
                    document.getElementById('agent-stat-label1').value = agent.stats.label1 || '';
                }
                if (document.getElementById('agent-stat-value2')) {
                    document.getElementById('agent-stat-value2').value = agent.stats.value2 || '';
                }
                if (document.getElementById('agent-stat-label2')) {
                    document.getElementById('agent-stat-label2').value = agent.stats.label2 || '';
                }
            }
            
            // 设置表单ID
            const form = document.getElementById('agent-form');
            if (form) {
                form.dataset.id = agentId;
            } else {
                console.error('找不到代理人表单');
            }
            
            // 更改模态框标题
            const title = document.getElementById('agent-modal-title');
            if (title) {
                title.textContent = '编辑代理人';
            }
            
            // 显示模态框
            const modal = document.getElementById('agent-modal');
            if (modal) {
                modal.classList.add('active');
                console.log('代理人模态框已显示');
            } else {
                console.error('找不到代理人模态框');
            }
        } catch (error) {
            console.error('获取代理人数据失败:', error);
            showError(`获取代理人数据失败: ${error.message}`);
        }
    }
    
    // 删除代理人
    async function deleteAgent(agentId) {
        try {
            // 获取代理人名称
            const row = document.querySelector(`.agents-table tr[data-id="${agentId}"]`);
            if (!row) {
                throw new Error('找不到代理人行');
            }
            
            const name = row.querySelector('td:nth-child(2)').textContent;
            
            if (confirm(`确定要删除代理人 "${name}" 吗？`)) {
                // 发送删除请求
                const response = await fetch(`${API_BASE_URL}/agents/${agentId}`, {
                    method: 'DELETE'
                });
                
                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.error || `HTTP error! status: ${response.status}`);
                }
                
                // 重新加载代理人数据
                await loadAgents();
                alert('代理人已删除！');
            }
        } catch (error) {
            console.error('删除代理人失败:', error);
            showError(`删除代理人失败: ${error.message}`);
        }
    }
    
    // 加载新闻数据
    async function loadNews() {
        try {
            const response = await fetch(`${API_BASE_URL}/news`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const news = await response.json();
            
            // 更新新闻表格
            updateNewsTable(news);
            
            // 更新仪表盘上的新闻数量
            updateNewsCount(news.length);
            
            return news;
        } catch (error) {
            console.error('加载新闻数据失败:', error);
            showError('加载新闻数据失败，请检查服务器是否正常运行。');
            return [];
        }
    }
    
    // 更新新闻表格
    function updateNewsTable(newsItems) {
        const tableBody = document.querySelector('.news-table tbody');
        if (!tableBody) return;
        
        // 清空表格
        tableBody.innerHTML = '';
        
        // 添加新闻行
        newsItems.forEach(item => {
            const row = document.createElement('tr');
            row.dataset.id = item.id;
            
            row.innerHTML = `
                <td>
                    <div class="news-date-small">
                        <span class="day">${item.day}</span>
                        <span class="month">${item.month}</span>
                    </div>
                </td>
                <td>${item.title}</td>
                <td>${item.content.substring(0, 50)}${item.content.length > 50 ? '...' : ''}</td>
                <td>${item.time}</td>
                <td>
                    <button class="action-btn edit-btn" data-id="${item.id}"><i class="fas fa-edit"></i></button>
                    <button class="action-btn delete-btn" data-id="${item.id}"><i class="fas fa-trash-alt"></i></button>
                </td>
            `;
            
            tableBody.appendChild(row);
        });
        
        // 重新绑定编辑和删除按钮事件
        bindNewsActionButtons();
    }
    
    // 更新新闻数量
    function updateNewsCount(count) {
        const newsCountElement = document.querySelector('.stat-card:nth-child(2) .stat-info h3');
        if (newsCountElement) {
            newsCountElement.textContent = count;
        }
    }
    
    // 绑定新闻操作按钮事件
    function bindNewsActionButtons() {
        console.log('绑定新闻操作按钮事件');
        
        // 编辑按钮
        const editButtons = document.querySelectorAll('.news-table .edit-btn');
        editButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                console.log('点击新闻编辑按钮');
                const newsId = this.getAttribute('data-id');
                console.log('新闻ID:', newsId);
                editNews(newsId);
            });
        });
        
        // 删除按钮
        const deleteButtons = document.querySelectorAll('.news-table .delete-btn');
        deleteButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                const newsId = this.getAttribute('data-id');
                deleteNews(newsId);
            });
        });
    }
    
    // 编辑新闻
    async function editNews(newsId) {
        console.log('编辑新闻:', newsId);
        try {
            // 获取新闻数据
            const response = await fetch(`${API_BASE_URL}/news/${newsId}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const news = await response.json();
            console.log('获取到的新闻数据:', news);
            
            // 填充表单
            const form = document.getElementById('news-form');
            if (!form) {
                console.error('找不到新闻表单');
                return;
            }
            
            document.getElementById('news-day').value = news.day || '';
            document.getElementById('news-month').value = news.month || '';
            document.getElementById('news-title').value = news.title || '';
            document.getElementById('news-content').value = news.content || '';
            document.getElementById('news-time').value = news.time || '';
            
            // 设置表单ID
            form.dataset.id = newsId;
            
            // 更改模态框标题
            const title = document.getElementById('news-modal-title');
            if (title) title.textContent = '编辑新闻';
            
            // 显示模态框
            const modal = document.getElementById('news-modal');
            if (modal) {
                modal.classList.add('active');
                console.log('显示新闻模态框');
            } else {
                console.error('找不到新闻模态框元素');
            }
        } catch (error) {
            console.error('获取新闻数据失败:', error);
            showError(`获取新闻数据失败: ${error.message}`);
        }
    }
    
    // 删除新闻
    async function deleteNews(newsId) {
        try {
            // 获取新闻标题
            const row = document.querySelector(`.news-table tr[data-id="${newsId}"]`);
            if (!row) {
                throw new Error('找不到新闻行');
            }
            
            const title = row.querySelector('td:nth-child(2)').textContent;
            
            if (confirm(`确定要删除新闻 "${title}" 吗？`)) {
                // 发送删除请求
                const response = await fetch(`${API_BASE_URL}/news/${newsId}`, {
                    method: 'DELETE'
                });
                
                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.error || `HTTP error! status: ${response.status}`);
                }
                
                // 重新加载新闻数据
                await loadNews();
                alert('新闻已删除！');
            }
        } catch (error) {
            console.error('删除新闻失败:', error);
            showError(`删除新闻失败: ${error.message}`);
        }
    }
    
    // 加载设置数据
    async function loadSettings() {
        try {
            const response = await fetch(`${API_BASE_URL}/settings`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const settings = await response.json();
            
            // 填充设置表单
            if (document.getElementById('site-title')) {
                document.getElementById('site-title').value = settings.title || '';
            }
            if (document.getElementById('site-description')) {
                document.getElementById('site-description').value = settings.description || '';
            }
            if (document.getElementById('site-logo')) {
                document.getElementById('site-logo').value = settings.logo || '';
            }
            if (document.getElementById('primary-color')) {
                document.getElementById('primary-color').value = settings.primaryColor || '#6c5ce7';
            }
            
            return settings;
        } catch (error) {
            console.error('加载设置数据失败:', error);
            showError('加载设置数据失败，请检查服务器是否正常运行。');
            return {};
        }
    }
    
    // 代理人表单提交
    const agentForm = document.getElementById('agent-form');
    if (agentForm) {
        agentForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // 获取表单数据
            const formData = {
                name: document.getElementById('agent-name').value,
                title: document.getElementById('agent-title').value,
                bio: document.getElementById('agent-bio').value,
                avatar: document.getElementById('agent-avatar').value,
                status: document.getElementById('agent-status').checked,
                stats: {
                    value1: document.getElementById('agent-stat-value1') ? document.getElementById('agent-stat-value1').value : "$0",
                    label1: document.getElementById('agent-stat-label1') ? document.getElementById('agent-stat-label1').value : "Value",
                    value2: document.getElementById('agent-stat-value2') ? document.getElementById('agent-stat-value2').value : "0%",
                    label2: document.getElementById('agent-stat-label2') ? document.getElementById('agent-stat-label2').value : "Rate"
                },
                addDate: new Date().toISOString().split('T')[0] // 添加日期字段
            };
            
            try {
                let response;
                const agentId = this.dataset.id;
                
                console.log('提交的代理人数据:', formData);
                console.log('代理人ID:', agentId);
                
                if (agentId) {
                    // 更新现有代理人
                    response = await fetch(`${API_BASE_URL}/agents/${agentId}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(formData)
                    });
                } else {
                    // 添加新代理人
                    response = await fetch(`${API_BASE_URL}/agents`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(formData)
                    });
                }
                
                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.error || `HTTP error! status: ${response.status}`);
                }
                
                // 重新加载代理人数据
                await loadAgents();
                
                // 关闭模态框
                const modal = document.getElementById('agent-modal');
                if (modal) modal.classList.remove('active');
                
                // 显示成功消息
                alert(agentId ? '代理人已更新！' : '代理人已添加！');
            } catch (error) {
                console.error('保存代理人失败:', error);
                showError(`保存代理人失败: ${error.message}`);
            }
        });
    }
    
    // 新闻表单提交
    const newsForm = document.getElementById('news-form');
    if (newsForm) {
        newsForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // 获取表单数据
            const formData = {
                day: document.getElementById('news-day').value,
                month: document.getElementById('news-month').value,
                title: document.getElementById('news-title').value,
                content: document.getElementById('news-content').value,
                time: document.getElementById('news-time').value
            };
            
            try {
                let response;
                const newsId = this.dataset.id;
                
                console.log('提交的新闻数据:', formData);
                console.log('新闻ID:', newsId);
                
                if (newsId) {
                    // 更新现有新闻
                    response = await fetch(`${API_BASE_URL}/news/${newsId}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(formData)
                    });
                } else {
                    // 添加新新闻
                    response = await fetch(`${API_BASE_URL}/news`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(formData)
                    });
                }
                
                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.error || `HTTP error! status: ${response.status}`);
                }
                
                // 重新加载新闻数据
                await loadNews();
                
                // 关闭模态框
                const modal = document.getElementById('news-modal');
                if (modal) modal.classList.remove('active');
                
                // 显示成功消息
                alert(newsId ? '新闻已更新！' : '新闻已添加！');
            } catch (error) {
                console.error('保存新闻失败:', error);
                showError(`保存新闻失败: ${error.message}`);
            }
        });
    }
    
    // 网站设置表单提交
    const siteSettingsForm = document.getElementById('site-settings-form');
    if (siteSettingsForm) {
        siteSettingsForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // 获取表单数据
            const formData = {
                title: document.getElementById('site-title').value,
                description: document.getElementById('site-description').value,
                logo: document.getElementById('site-logo').value,
                primaryColor: document.getElementById('primary-color').value
            };
            
            try {
                // 更新设置
                const response = await fetch(`${API_BASE_URL}/settings`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });
                
                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.error || `HTTP error! status: ${response.status}`);
                }
                
                // 显示成功消息
                alert('网站设置已保存！');
            } catch (error) {
                console.error('保存设置失败:', error);
                showError(`保存设置失败: ${error.message}`);
            }
        });
    }

    // 加载对话数据
    async function loadTalks(agents) {
        try {
            const response = await fetch(`${API_BASE_URL}/talks`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const talks = await response.json();
            
            // 更新对话表格
            updateTalksTable(talks, agents);
            
            // 更新仪表盘上的对话数量
            updateTalkCount(talks.length);
            
            return talks;
        } catch (error) {
            console.error('加载对话数据失败:', error);
            showError('加载对话数据失败，请检查服务器是否正常运行。');
            return [];
        }
    }

    // 更新对话表格
    function updateTalksTable(talks, agents) {
        const tableBody = document.querySelector('.talks-table tbody');
        if (!tableBody) {
            console.error('找不到对话表格');
            return;
        }
        
        // 清空表格
        tableBody.innerHTML = '';
        
        // 添加对话行
        talks.forEach(talk => {
            const row = document.createElement('tr');
            row.dataset.id = talk.id;
            
            // 获取参与者名称
            const participantNames = talk.participants
                .map(id => {
                    const agent = agents.find(a => a.id === id);
                    return agent ? agent.name : 'Unknown';
                })
                .join(', ');
            
            row.innerHTML = `
                <td>${talk.title}</td>
                <td>${participantNames}</td>
                <td>${talk.date}</td>
                <td>${talk.messages.length}</td>
                <td>${talk.tags.join(', ')}</td>
                <td>
                    <button class="action-btn edit-btn" data-id="${talk.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete-btn" data-id="${talk.id}">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </td>
            `;
            
            tableBody.appendChild(row);
        });
        
        // 为编辑按钮添加点击事件
        const editButtons = document.querySelectorAll('.talks-table .edit-btn');
        editButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                const talkId = this.dataset.id;
                editTalk(talkId);
            });
        });
        
        // 为删除按钮添加点击事件
        const deleteButtons = document.querySelectorAll('.talks-table .delete-btn');
        deleteButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                const talkId = this.dataset.id;
                deleteTalk(talkId);
            });
        });
    }

    // 更新对话数量
    function updateTalkCount(count) {
        const countElement = document.getElementById('talks-count');
        if (countElement) {
            countElement.textContent = count;
        }
    }

    // 编辑对话
    async function editTalk(talkId) {
        try {
            // 获取对话数据
            const response = await fetch(`${API_BASE_URL}/talks/${talkId}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const talk = await response.json();
            console.log('获取到的对话数据:', talk);
            
            // 填充表单
            document.getElementById('talk-title').value = talk.title || '';
            document.getElementById('talk-date').value = talk.date || '';
            document.getElementById('talk-tags').value = talk.tags ? talk.tags.join(', ') : '';
            
            // 设置参与者
            const participantsContainer = document.getElementById('participants-container');
            if (participantsContainer) {
                // 清空容器
                participantsContainer.innerHTML = '';
                
                // 获取所有代理人
                const agentsResponse = await fetch(`${API_BASE_URL}/agents`);
                const agents = await agentsResponse.json();
                
                // 添加代理人选项
                agents.forEach(agent => {
                    const isSelected = talk.participants.includes(agent.id);
                    
                    const checkbox = document.createElement('label');
                    checkbox.className = 'checkbox-label';
                    checkbox.innerHTML = `
                        <input type="checkbox" name="participants" value="${agent.id}" ${isSelected ? 'checked' : ''}>
                        <span>${agent.name}</span>
                    `;
                    
                    participantsContainer.appendChild(checkbox);
                });
            }
            
            // 设置消息
            const messagesContainer = document.getElementById('messages-container');
            if (messagesContainer) {
                // 清空容器
                messagesContainer.innerHTML = '';
                
                // 添加消息输入
                talk.messages.forEach((message, index) => {
                    addMessageInput(messagesContainer, message, index);
                });
            }
            
            // 设置表单ID
            const form = document.getElementById('talk-form');
            if (form) {
                form.dataset.id = talkId;
            }
            
            // 更改模态框标题
            const title = document.getElementById('talk-modal-title');
            if (title) {
                title.textContent = '编辑对话';
            }
            
            // 显示模态框
            const modal = document.getElementById('talk-modal');
            if (modal) {
                modal.classList.add('active');
            }
        } catch (error) {
            console.error('获取对话数据失败:', error);
            showError(`获取对话数据失败: ${error.message}`);
        }
    }

    // 添加消息输入
    function addMessageInput(container, message = {}, index) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message-input';
        messageDiv.dataset.index = index;
        
        messageDiv.innerHTML = `
            <div class="form-row">
                <div class="form-group">
                    <label for="message-sender-${index}">发送者</label>
                    <select id="message-sender-${index}" class="message-sender" required>
                        <option value="">选择代理人</option>
                        <!-- 代理人选项将通过JavaScript动态添加 -->
                    </select>
                </div>
                <div class="form-group">
                    <label for="message-time-${index}">时间</label>
                    <input type="text" id="message-time-${index}" class="message-time" value="${message.time || ''}" required>
                </div>
            </div>
            <div class="form-group">
                <label for="message-content-${index}">内容</label>
                <textarea id="message-content-${index}" class="message-content" rows="2" required>${message.content || ''}</textarea>
            </div>
            <button type="button" class="remove-message-btn" data-index="${index}">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        container.appendChild(messageDiv);
        
        // 获取发送者选择框
        const senderSelect = messageDiv.querySelector(`#message-sender-${index}`);
        
        // 获取所有代理人并填充选择框
        fetch(`${API_BASE_URL}/agents`)
            .then(res => res.json())
            .then(agents => {
                agents.forEach(agent => {
                    const option = document.createElement('option');
                    option.value = agent.id;
                    option.textContent = agent.name;
                    
                    // 如果有消息数据，选中对应的发送者
                    if (message.senderId && message.senderId === agent.id) {
                        option.selected = true;
                    }
                    
                    senderSelect.appendChild(option);
                });
            });
        
        // 为删除按钮添加事件
        const removeBtn = messageDiv.querySelector('.remove-message-btn');
        removeBtn.addEventListener('click', function() {
            messageDiv.remove();
        });
    }

    // 删除对话
    async function deleteTalk(talkId) {
        try {
            // 获取对话标题
            const response = await fetch(`${API_BASE_URL}/talks/${talkId}`);
            const talk = await response.json();
            
            if (confirm(`确定要删除对话 "${talk.title}" 吗？`)) {
                // 发送删除请求
                const deleteResponse = await fetch(`${API_BASE_URL}/talks/${talkId}`, {
                    method: 'DELETE'
                });
                
                if (!deleteResponse.ok) {
                    const error = await deleteResponse.json();
                    throw new Error(error.error || `HTTP error! status: ${deleteResponse.status}`);
                }
                
                // 重新加载对话数据
                const agents = await fetch(`${API_BASE_URL}/agents`).then(res => res.json());
                await loadTalks(agents);
                alert('对话已删除！');
            }
        } catch (error) {
            console.error('删除对话失败:', error);
            showError(`删除对话失败: ${error.message}`);
        }
    }

    // 打开添加对话模态框
    const addTalkBtn = document.getElementById('add-talk-btn');
    if (addTalkBtn) {
        addTalkBtn.addEventListener('click', function() {
            // 重置表单
            const form = document.getElementById('talk-form');
            if (form) {
                form.reset();
                form.dataset.id = '';
                
                // 更改模态框标题
                const title = document.getElementById('talk-modal-title');
                if (title) title.textContent = '添加对话';
                
                // 清空参与者容器
                const participantsContainer = document.getElementById('participants-container');
                if (participantsContainer) {
                    participantsContainer.innerHTML = '';
                    
                    // 获取所有代理人并添加选项
                    fetch(`${API_BASE_URL}/agents`)
                        .then(res => res.json())
                        .then(agents => {
                            agents.forEach(agent => {
                                const checkbox = document.createElement('label');
                                checkbox.className = 'checkbox-label';
                                checkbox.innerHTML = `
                                    <input type="checkbox" name="participants" value="${agent.id}">
                                    <span>${agent.name}</span>
                                `;
                                
                                participantsContainer.appendChild(checkbox);
                            });
                        });
                }
                
                // 清空消息容器
                const messagesContainer = document.getElementById('messages-container');
                if (messagesContainer) {
                    messagesContainer.innerHTML = '';
                }
                
                // 显示模态框
                const modal = document.getElementById('talk-modal');
                if (modal) modal.classList.add('active');
            }
        });
    }

    // 添加消息按钮
    const addMessageBtn = document.getElementById('add-message-btn');
    if (addMessageBtn) {
        addMessageBtn.addEventListener('click', function() {
            const messagesContainer = document.getElementById('messages-container');
            if (messagesContainer) {
                const index = messagesContainer.children.length;
                addMessageInput(messagesContainer, {}, index);
            }
        });
    }

    // 对话表单提交
    const talkForm = document.getElementById('talk-form');
    if (talkForm) {
        talkForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            try {
                // 获取表单数据
                const formData = {
                    title: document.getElementById('talk-title').value,
                    date: document.getElementById('talk-date').value,
                    participants: [],
                    messages: [],
                    tags: document.getElementById('talk-tags').value.split(',').map(tag => tag.trim()).filter(tag => tag)
                };
                
                // 获取选中的参与者
                const participantCheckboxes = document.querySelectorAll('#participants-container input[type="checkbox"]:checked');
                participantCheckboxes.forEach(checkbox => {
                    formData.participants.push(parseInt(checkbox.value));
                });
                
                // 获取消息
                const messageInputs = document.querySelectorAll('.message-input');
                messageInputs.forEach(input => {
                    const senderId = parseInt(input.querySelector('.message-sender').value);
                    const content = input.querySelector('.message-content').value;
                    const time = input.querySelector('.message-time').value;
                    
                    if (senderId && content && time) {
                        formData.messages.push({
                            senderId,
                            content,
                            time
                        });
                    }
                });
                
                // 验证数据
                if (formData.participants.length < 2) {
                    throw new Error('至少需要选择两个参与者');
                }
                
                if (formData.messages.length === 0) {
                    throw new Error('至少需要添加一条消息');
                }
                
                let response;
                const talkId = this.dataset.id;
                
                if (talkId) {
                    // 更新现有对话
                    response = await fetch(`${API_BASE_URL}/talks/${talkId}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(formData)
                    });
                } else {
                    // 添加新对话
                    response = await fetch(`${API_BASE_URL}/talks`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(formData)
                    });
                }
                
                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.error || `HTTP error! status: ${response.status}`);
                }
                
                // 重新加载对话数据
                const agents = await fetch(`${API_BASE_URL}/agents`).then(res => res.json());
                await loadTalks(agents);
                
                // 关闭模态框
                const modal = document.getElementById('talk-modal');
                if (modal) modal.classList.remove('active');
                
                // 显示成功消息
                alert(talkId ? '对话已更新！' : '对话已添加！');
            } catch (error) {
                console.error('保存对话失败:', error);
                showError(`保存对话失败: ${error.message}`);
            }
        });
    }
}); 