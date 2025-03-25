document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM已加载');
    
    // 检查agents-list元素
    const agentsList = document.querySelector('#agents-list');
    console.log('agents-list元素:', agentsList);
    
    // 检查所有可能的容器
    console.log('所有可能的容器:');
    console.log('#agents-list:', document.querySelector('#agents-list'));
    console.log('.agents-list:', document.querySelector('.agents-list'));
    console.log('table tbody:', document.querySelector('table tbody'));
    
    // 全局变量
    let agents = [];
    let talks = [];
    let news = [];
    let settings = {};
    let currentMessages = [];
    
    // 导航项和内容部分
    const navItems = document.querySelectorAll('.nav-item');
    const contentSections = document.querySelectorAll('.content-section');
    
    // 模态框元素
    const agentModal = document.getElementById('agent-modal');
    const talkModal = document.getElementById('talk-modal');
    const messageModal = document.getElementById('message-modal');
    const newsModal = document.getElementById('news-modal');
    
    // 初始化
    init();
    
    // 初始化函数
    function init() {
        // 加载所有数据
        loadDataFromAPI();
        
        // 设置导航事件
        setupNavigation();
        
        // 设置按钮事件
        setupButtonEvents();
        
        // 设置表单提交事件
        setupFormSubmits();
        
        // 设置模态框关闭事件
        setupModalCloseEvents();
        
        // 初始化对话管理功能
        setupTalksManagement();
    }
    
    // 设置导航事件
    function setupNavigation() {
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
                const targetSection = document.getElementById(`${sectionToShow}-section`);
                targetSection.classList.add('active');
                
                // 如果切换到对话页面，渲染对话数据
                if (sectionToShow === 'talks') {
                    console.log('切换到对话页面，渲染对话数据');
                    renderTalks();
                }
            });
        });
    }
    
    // 设置按钮事件
    function setupButtonEvents() {
        // 添加代理人按钮
        document.getElementById('add-agent-btn').addEventListener('click', function() {
            document.getElementById('agent-modal-title').textContent = '添加代理人';
            document.getElementById('agent-form').reset();
            document.getElementById('agent-id').value = '';
            document.getElementById('avatar-preview').innerHTML = '';
            
            // 移除status字段的设置
            const agentModal = document.getElementById('agent-modal');
            if (agentModal) {
                agentModal.style.display = 'block';
            } else {
                console.error('找不到agent-modal元素');
            }
        });
        
        // 取消代理人按钮
        document.getElementById('cancel-agent-btn').addEventListener('click', function() {
            agentModal.style.display = 'none';
        });
        
        // 添加对话按钮
        document.getElementById('add-talk-btn').addEventListener('click', function() {
            document.getElementById('talk-modal-title').textContent = '添加对话';
            document.getElementById('talk-form').reset();
            document.getElementById('talk-id').value = '';
            document.getElementById('messages-container').innerHTML = '';
            currentMessages = [];
            
            // 填充代理人选项
            const participantsSelect = document.getElementById('talk-participants');
            participantsSelect.innerHTML = '';
            agents.forEach(agent => {
                const option = document.createElement('option');
                option.value = agent.id;
                option.textContent = agent.name;
                participantsSelect.appendChild(option);
            });
            
            talkModal.style.display = 'block';
        });
        
        // 取消对话按钮
        document.getElementById('cancel-talk-btn').addEventListener('click', function() {
            talkModal.style.display = 'none';
        });
        
        // 添加消息按钮
        document.getElementById('add-message-btn').addEventListener('click', function() {
            document.getElementById('message-form').reset();
            document.getElementById('message-index').value = '';
            
            // 填充代理人选项
            const senderSelect = document.getElementById('message-sender');
            senderSelect.innerHTML = '';
            agents.forEach(agent => {
                const option = document.createElement('option');
                option.value = agent.id;
                option.textContent = agent.name;
                senderSelect.appendChild(option);
            });
            
            messageModal.style.display = 'block';
        });
        
        // 取消消息按钮
        document.getElementById('cancel-message-btn').addEventListener('click', function() {
            messageModal.style.display = 'none';
        });
        
        // 添加新闻按钮
        document.getElementById('add-news-btn').addEventListener('click', function() {
            document.getElementById('news-modal-title').textContent = '添加新闻';
            document.getElementById('news-form').reset();
            document.getElementById('news-id').value = '';
            newsModal.style.display = 'block';
        });
        
        // 取消新闻按钮
        document.getElementById('cancel-news-btn').addEventListener('click', function() {
            newsModal.style.display = 'none';
        });
        
        // 头像预览
        document.getElementById('agent-avatar').addEventListener('input', function() {
            const avatarUrl = this.value;
            const previewDiv = document.getElementById('avatar-preview');
            
            if (avatarUrl) {
                previewDiv.innerHTML = `<img src="${avatarUrl}" alt="头像预览" style="max-width: 100px; margin-top: 10px;">`;
            } else {
                previewDiv.innerHTML = '';
            }
        });
    }
    
    // 设置模态框关闭事件
    function setupModalCloseEvents() {
        // 关闭模态框的X按钮
        document.querySelectorAll('.close-modal').forEach(closeBtn => {
            closeBtn.addEventListener('click', function() {
                this.closest('.modal').style.display = 'none';
            });
        });
        
        // 点击模态框外部关闭
        window.addEventListener('click', function(event) {
            if (event.target.classList.contains('modal')) {
                event.target.style.display = 'none';
            }
        });
    }
    
    // 设置表单提交事件
    function setupFormSubmits() {
        // 代理人表单提交
        document.getElementById('agent-form').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const agentId = document.getElementById('agent-id').value;
            const agentData = {
                name: document.getElementById('agent-name').value,
                title: document.getElementById('agent-title').value,
                bio: document.getElementById('agent-bio').value,
                avatar: document.getElementById('agent-avatar').value,
                prompt: document.getElementById('agent-prompt').value
            };
            
            // 如果有ID，则更新；否则添加
            if (agentId) {
                agentData.id = parseInt(agentId);
                
                // 发送更新请求
                fetch(`/api/agents/${agentId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(agentData)
                })
                .then(response => {
                    if (!response.ok) throw new Error('更新失败');
                    return response.json();
                })
                .then(updatedAgent => {
                    // 更新本地数据
                    const index = agents.findIndex(a => a.id === updatedAgent.id);
                    if (index !== -1) {
                        agents[index] = updatedAgent;
                    }
                    
                    // 重新渲染
                    renderAgents();
                    
                    // 关闭模态框
                    document.getElementById('agent-modal').style.display = 'none';
                    
                    showNotification('代理人已更新', 'success');
                })
                .catch(error => {
                    console.error('更新代理人失败:', error);
                    showNotification('无法更新代理人，请稍后再试', 'error');
                });
            } else {
                // 发送添加请求
                fetch('/api/agents', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(agentData)
                })
                .then(response => {
                    if (!response.ok) throw new Error('添加失败');
                    return response.json();
                })
                .then(newAgent => {
                    // 添加到本地数据
                    agents.push(newAgent);
                    
                    // 重新渲染
                    renderAgents();
                    
                    // 关闭模态框
                    document.getElementById('agent-modal').style.display = 'none';
                    
                    showNotification('代理人已添加', 'success');
                })
                .catch(error => {
                    console.error('添加代理人失败:', error);
                    showNotification('无法添加代理人，请稍后再试', 'error');
                });
            }
        });
        
        // 对话表单提交
        document.getElementById('talk-form').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const talkId = document.getElementById('talk-id').value;
            const title = document.getElementById('talk-title').value;
            const date = document.getElementById('talk-date').value;
            const tagsInput = document.getElementById('talk-tags').value;
            const tags = tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag);
            
            // 获取选中的参与者
            const participantsSelect = document.getElementById('talk-participants');
            const participants = Array.from(participantsSelect.selectedOptions).map(option => parseInt(option.value));
            
            const talkData = {
                title,
                date,
                tags,
                participants,
                messages: currentMessages
            };
            
            if (talkId) {
                // 更新现有对话
                updateTalk(talkId, talkData);
            } else {
                // 添加新对话
                addTalk(talkData);
            }
            
            talkModal.style.display = 'none';
        });
        
        // 消息表单提交
        document.getElementById('message-form').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const messageIndex = document.getElementById('message-index').value;
            const senderId = parseInt(document.getElementById('message-sender').value);
            const content = document.getElementById('message-content').value;
            const time = document.getElementById('message-time').value;
            
            const messageData = {
                senderId,
                content,
                time
            };
            
            if (messageIndex !== '') {
                // 更新现有消息
                currentMessages[messageIndex] = messageData;
            } else {
                // 添加新消息
                currentMessages.push(messageData);
            }
            
            renderMessages();
            messageModal.style.display = 'none';
        });
        
        // 新闻表单提交
        document.getElementById('news-form').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const newsId = document.getElementById('news-id').value;
            const newsData = {
                title: document.getElementById('news-title').value,
                content: document.getElementById('news-content').value,
                date: document.getElementById('news-date').value,
                image: document.getElementById('news-image').value,
                source: document.getElementById('news-source').value,
                url: document.getElementById('news-url').value
            };
            
            // 如果有ID，则更新；否则添加
            if (newsId) {
                newsData.id = parseInt(newsId);
                
                // 发送更新请求
                fetch(`/api/news/${newsId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(newsData)
                })
                .then(response => {
                    if (!response.ok) throw new Error('更新失败');
                    return response.json();
                })
                .then(updatedNews => {
                    // 更新本地数据
                    const index = news.findIndex(n => n.id === updatedNews.id);
                    if (index !== -1) {
                        news[index] = updatedNews;
                    }
                    
                    // 重新渲染
                    renderNews();
                    
                    // 关闭模态框
                    document.getElementById('news-modal').style.display = 'none';
                    
                    showNotification('新闻已更新', 'success');
                })
                .catch(error => {
                    console.error('更新新闻失败:', error);
                    showNotification('无法更新新闻，请稍后再试', 'error');
                });
            } else {
                // 发送添加请求
                fetch('/api/news', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(newsData)
                })
                .then(response => {
                    if (!response.ok) throw new Error('添加失败');
                    return response.json();
                })
                .then(newNews => {
                    // 添加到本地数据
                    news.push(newNews);
                    
                    // 重新渲染
                    renderNews();
                    
                    // 关闭模态框
                    document.getElementById('news-modal').style.display = 'none';
                    
                    showNotification('新闻已添加', 'success');
                })
                .catch(error => {
                    console.error('添加新闻失败:', error);
                    showNotification('无法添加新闻，请稍后再试', 'error');
                });
            }
        });
    }
    
    // 辅助函数：将月份数字转换为名称
    function getMonthName(monthIndex) {
        const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
        return months[monthIndex] || 'JAN';
    }
    
    // 从API加载数据
    function loadDataFromAPI() {
        console.log('开始从API加载数据...');
        
        // 显示加载状态
        if (typeof window.toggleLoading === 'function') {
            window.toggleLoading(true);
        } else {
            console.log('加载中...');
        }
        
        // 加载代理人数据
        fetch('/api/agents')
            .then(response => response.json())
            .then(data => {
                console.log('代理人数据加载成功:', data);
                window.agents = data;
                agents = data; // 同时更新局部变量
                renderAgents();
            })
            .catch(error => {
                console.error('请求代理人数据失败:', error);
                if (typeof window.showError === 'function') {
                    window.showError('无法加载代理人数据，请刷新页面重试');
                } else {
                    console.error('无法加载代理人数据，请刷新页面重试');
                }
            });
        
        // 加载新闻数据
        fetch('/api/news')
            .then(response => response.json())
            .then(data => {
                console.log('新闻数据加载成功:', data);
                window.news = data;
                news = data; // 同时更新局部变量
                renderNews();
            })
            .catch(error => {
                console.error('请求新闻数据失败:', error);
                if (typeof window.showError === 'function') {
                    window.showError('无法加载新闻数据，请刷新页面重试');
                } else {
                    console.error('无法加载新闻数据，请刷新页面重试');
                }
            });
        
        // 加载设置数据
        fetch('/api/settings')
            .then(response => response.json())
            .then(data => {
                console.log('设置数据加载成功:', data);
                window.settings = data;
                settings = data; // 同时更新局部变量
                renderSettings();
            })
            .catch(error => {
                console.error('请求设置数据失败:', error);
                if (typeof window.showError === 'function') {
                    window.showError('无法加载设置数据，请刷新页面重试');
                } else {
                    console.error('无法加载设置数据，请刷新页面重试');
                }
            })
            .finally(() => {
                // 隐藏加载状态
                if (typeof window.toggleLoading === 'function') {
                    window.toggleLoading(false);
                } else {
                    console.log('加载完成');
                }
            });
        
        // 加载对话数据
        fetch('/api/talks')
            .then(response => response.json())
            .then(data => {
                console.log('对话数据加载成功:', data);
                window.talks = data;
                talks = data; // 同时更新局部变量
                
                // 如果当前在对话页面，渲染对话数据
                const talksSection = document.getElementById('talks-section');
                if (talksSection && talksSection.classList.contains('active')) {
                    renderTalks();
                }
            })
            .catch(error => {
                console.error('请求对话数据失败:', error);
                if (typeof window.showError === 'function') {
                    window.showError('无法加载对话数据，请刷新页面重试');
                } else {
                    console.error('无法加载对话数据，请刷新页面重试');
                }
            });
    }
    
    // 渲染代理人列表
    function renderAgents() {
        console.log('开始渲染代理人列表，数据:', window.agents);
        
        // 获取代理人表格
        const agentsTable = document.querySelector('table');
        if (!agentsTable) {
            console.error('找不到代理人表格元素');
            return;
        }
        
        // 获取表格体
        let tbody = agentsTable.querySelector('tbody');
        if (!tbody) {
            console.log('创建tbody元素');
            tbody = document.createElement('tbody');
            tbody.id = 'agents-list';
            agentsTable.appendChild(tbody);
        }
        
        // 清空表格
        tbody.innerHTML = '';
        
        // 检查代理人数据
        if (!window.agents || !Array.isArray(window.agents) || window.agents.length === 0) {
            console.log('没有代理人数据可显示');
            const tr = document.createElement('tr');
            tr.innerHTML = `<td colspan="5" style="text-align: center; padding: 20px;">暂无代理人数据</td>`;
            tbody.appendChild(tr);
            return;
        }
        
        // 添加代理人行
        window.agents.forEach(agent => {
            console.log(`处理代理人: ID=${agent.id}, 名称=${agent.name}`);
            
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${agent.id || ''}</td>
                <td>
                    ${agent.avatar ? `<img src="${agent.avatar}" alt="${agent.name}" style="width: 40px; height: 40px; border-radius: 50%;">` : '无头像'}
                </td>
                <td>${agent.name || '未命名'}</td>
                <td>${agent.title || '无职位'}</td>
                <td>
                    <button class="edit-agent-btn" data-id="${agent.id}" style="background-color: #4caf50; color: white; border: none; padding: 5px 10px; border-radius: 4px; margin-right: 5px;">编辑</button>
                    <button class="delete-agent-btn" data-id="${agent.id}" style="background-color: #f44336; color: white; border: none; padding: 5px 10px; border-radius: 4px;">删除</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
        
        // 绑定代理人按钮事件
        bindAgentButtons();
        
        console.log('代理人列表渲染完成');
    }
    
    // 检查并移除重复的"新建对话"按钮
    function checkAndRemoveDuplicateButtons() {
        console.log('检查重复的新建对话按钮');
        
        try {
            // 使用更安全的选择器方式
            const addButtons = [];
            
            // 查找所有可能的新建对话按钮
            document.querySelectorAll('button').forEach(button => {
                const text = button.textContent.trim();
                if (text === '新建对话' || text === '添加对话' || 
                    button.id === 'add-talk-btn' || 
                    button.classList.contains('add-talk-btn')) {
                    addButtons.push(button);
                }
            });
            
            console.log(`找到${addButtons.length}个新建对话按钮`);
            
            // 如果有多个按钮，保留第一个，移除其他的
            if (addButtons.length > 1) {
                console.log('移除重复的按钮');
                for (let i = 1; i < addButtons.length; i++) {
                    if (addButtons[i] && addButtons[i].parentNode) {
                        addButtons[i].parentNode.removeChild(addButtons[i]);
                    }
                }
            }
        } catch (error) {
            console.error('移除重复按钮时出错:', error);
        }
    }
    
    // 渲染对话列表
    function renderTalks() {
        console.log('开始渲染对话列表，数据:', window.talks || talks);
        
        try {
            // 使用window.talks或局部变量talks
            const talksData = window.talks || talks;
            
            // 检查是否有重复的对话管理标题
            const talkHeaders = [];
            document.querySelectorAll('h2, h3').forEach(header => {
                if (header.textContent.includes('对话管理')) {
                    talkHeaders.push(header);
                }
            });
            
            if (talkHeaders.length > 1) {
                console.log('发现重复的对话管理标题，保留第一个');
                for (let i = 1; i < talkHeaders.length; i++) {
                    if (talkHeaders[i] && talkHeaders[i].parentNode) {
                        talkHeaders[i].parentNode.removeChild(talkHeaders[i]);
                    }
                }
            }
            
            // 检查是否有重复的表格
            const tables = document.querySelectorAll('#talks-section table');
            if (tables.length > 1) {
                console.log('发现重复的表格，保留第一个');
                for (let i = 1; i < tables.length; i++) {
                    if (tables[i] && tables[i].parentNode) {
                        tables[i].parentNode.removeChild(tables[i]);
                    }
                }
            }
            
            // 检查并移除重复的"新建对话"按钮
            checkAndRemoveDuplicateButtons();
            
            // 获取对话表格
            const talksTable = document.querySelector('#talks-section table');
            if (!talksTable) {
                console.error('找不到对话表格元素');
                return;
            }
            
            // 获取表格体
            let tbody = talksTable.querySelector('tbody');
            if (!tbody) {
                console.log('创建tbody元素');
                tbody = document.createElement('tbody');
                talksTable.appendChild(tbody);
            }
            
            // 清空表格
            tbody.innerHTML = '';
            
            // 检查对话数据
            if (!talksData || !Array.isArray(talksData) || talksData.length === 0) {
                console.log('没有对话数据可显示');
                const tr = document.createElement('tr');
                tr.innerHTML = `<td colspan="6" style="text-align: center; padding: 20px;">暂无对话数据</td>`;
                tbody.appendChild(tr);
                return;
            }
            
            // 加载代理人数据，用于显示参与者名称
            const agentsData = window.agents || agents;
            
            // 添加对话行
            talksData.forEach(talk => {
                console.log(`处理对话: ID=${talk.id}, 标题=${talk.title}`);
                
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
                let participantNames = '无参与者';
                if (talk.participants && Array.isArray(talk.participants) && talk.participants.length > 0) {
                    const names = talk.participants.map(id => {
                        const agent = agentsData.find(a => a.id == id);
                        return agent ? agent.name : `未知(ID:${id})`;
                    });
                    participantNames = names.join(', ');
                }
                
                // 格式化标签
                let tagsHTML = '无标签';
                if (talk.tags && Array.isArray(talk.tags) && talk.tags.length > 0) {
                    tagsHTML = talk.tags.map(tag => `
                        <span style="
                            background-color: #e9ecef; 
                            color: #495057; 
                            padding: 2px 8px; 
                            border-radius: 12px; 
                            font-size: 11px;
                            display: inline-block;
                            margin: 2px;
                        ">${tag}</span>
                    `).join('');
                }
                
                // 创建行
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${talk.id}</td>
                    <td>${talk.title || '无标题'}</td>
                    <td>${formattedDate}</td>
                    <td>${participantNames}</td>
                    <td>${tagsHTML}</td>
                    <td>
                        <button class="view-talk-btn" data-id="${talk.id}">查看</button>
                        <button class="edit-talk-btn" data-id="${talk.id}">编辑</button>
                        <button class="delete-talk-btn" data-id="${talk.id}">删除</button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
            
            // 绑定按钮事件
            bindTalkButtonEvents();
            
            console.log('对话表格渲染完成');
        } catch (error) {
            console.error('渲染对话列表时出错:', error);
        }
    }
    
    // 渲染新闻列表
    function renderNews() {
        console.log('开始渲染新闻列表，数据:', window.news);
        
        // 获取新闻表格
        const newsTable = document.getElementById('news-table');
        if (!newsTable) {
            console.error('找不到news-table元素');
            return;
        }
        
        // 获取表格体
        const tbody = newsTable.querySelector('tbody');
        if (!tbody) {
            console.error('找不到news-table的tbody元素');
            return;
        }
        
        // 清空表格
        tbody.innerHTML = '';
        
        // 检查新闻数据
        if (!window.news || !Array.isArray(window.news) || window.news.length === 0) {
            console.log('无新闻数据或数据为空');
            const tr = document.createElement('tr');
            tr.innerHTML = `<td colspan="5" style="text-align: center; padding: 20px;">暂无新闻数据</td>`;
            tbody.appendChild(tr);
            return;
        }
        
        // 添加新闻行
        window.news.forEach(item => {
            // 格式化日期
            let formattedDate = '未知日期';
            try {
                if (item.date) {
                    const newsDate = new Date(item.date);
                    if (!isNaN(newsDate.getTime())) {
                        formattedDate = newsDate.toLocaleDateString('zh-CN', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit'
                        });
                    }
                }
            } catch (error) {
                console.error('日期格式化错误:', error);
            }
            
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${item.id}</td>
                <td>${formattedDate}</td>
                <td>${item.title || '无标题'}</td>
                <td>${item.time || ''}</td>
                <td>
                    <button class="edit-news-btn" data-id="${item.id}">编辑</button>
                    <button class="delete-news-btn" data-id="${item.id}">删除</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
        
        // 绑定新闻按钮事件
        bindNewsButtons();
        
        console.log('新闻数据渲染完成');
    }
    
    // 渲染设置
    function renderSettings() {
        console.log('开始渲染设置，数据:', settings);
        
        if (!settings) {
            console.error('设置数据为空');
            return;
        }
        
        // 设置表单值
        const titleInput = document.getElementById('site-title');
        const descriptionInput = document.getElementById('site-description');
        const colorInput = document.getElementById('primary-color');
        const logoInput = document.getElementById('site-logo');
        
        if (titleInput) titleInput.value = settings.title || '';
        if (descriptionInput) descriptionInput.value = settings.description || '';
        if (colorInput) colorInput.value = settings.primaryColor || '#6c5ce7';
        
        // 显示当前logo
        const logoPreview = document.getElementById('logo-preview');
        if (logoPreview && settings.logo) {
            logoPreview.innerHTML = `<img src="${settings.logo}" alt="网站Logo">`;
        }
    }
    
    // 渲染消息列表
    function renderMessages() {
        console.log('开始渲染消息列表，数据:', currentMessages);
        
        const messagesContainer = document.getElementById('messages-container');
        if (!messagesContainer) {
            console.error('找不到messages-container元素');
            return;
        }
        
        // 清空列表
        messagesContainer.innerHTML = '';
        
        // 检查数据
        if (!currentMessages || currentMessages.length === 0) {
            messagesContainer.innerHTML = '<div class="empty-state">暂无消息</div>';
            return;
        }
        
        // 添加消息
        currentMessages.forEach((message, index) => {
            try {
                const messageDiv = document.createElement('div');
                messageDiv.className = 'message-item';
                
                // 查找发送者名称
                let senderName = '未知发送者';
                try {
                    if (message.sender === 'user') {
                        senderName = '用户';
                    } else {
                        const sender = agents.find(a => a.id === parseInt(message.sender));
                        if (sender) {
                            senderName = sender.name;
                        }
                    }
                } catch (error) {
                    console.error('处理发送者时出错:', error);
                }
                
                messageDiv.innerHTML = `
                    <div class="message-header">
                        <span class="message-sender">${senderName}</span>
                        <span class="message-time">${message.time || ''}</span>
                        <div class="message-actions">
                            <button class="btn btn-sm edit-message" data-index="${index}">
                                编辑
                            </button>
                            <button class="btn btn-sm delete-message" data-index="${index}">
                                删除
                            </button>
                        </div>
                    </div>
                    <div class="message-content">${message.content || ''}</div>
                `;
                
                messagesContainer.appendChild(messageDiv);
                
                // 添加编辑按钮事件
                messageDiv.querySelector('.edit-message').addEventListener('click', function() {
                    const messageIndex = this.getAttribute('data-index');
                    editMessage(messageIndex);
                });
                
                // 添加删除按钮事件
                messageDiv.querySelector('.delete-message').addEventListener('click', function() {
                    const messageIndex = this.getAttribute('data-index');
                    if (confirm('确定要删除这条消息吗？')) {
                        currentMessages.splice(messageIndex, 1);
                        renderMessages();
                    }
                });
            } catch (error) {
                console.error('渲染消息时出错:', error, message);
            }
        });
    }
    
    // 添加对话
    function addTalk(talkData) {
        fetch('/api/talks', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(talkData)
        })
        .then(response => {
            if (!response.ok) throw new Error('添加失败');
            return response.json();
        })
        .then(() => {
            // 重新加载对话数据
            loadTalksData();
            showNotification('对话已添加', 'success');
        })
        .catch(error => {
            console.error('添加对话失败:', error);
            showNotification('无法添加对话，请稍后再试', 'error');
        });
    }
    
    // 编辑对话
    function editTalk(talkId) {
        console.log('编辑对话:', talkId);
        
        // 查找对话数据
        const talksData = window.talks || talks;
        const talk = talksData.find(t => t.id == talkId);
        
        if (!talk) {
            console.error('找不到对话数据:', talkId);
            alert('找不到对话数据');
            return;
        }
        
        // 获取模态框元素
        const talkModal = document.getElementById('talk-modal');
        const talkForm = document.getElementById('talk-form');
        const talkIdInput = document.getElementById('talk-id');
        const talkTitleInput = document.getElementById('talk-title');
        const talkDateInput = document.getElementById('talk-date');
        const talkTagsInput = document.getElementById('talk-tags');
        const talkParticipantsSelect = document.getElementById('talk-participants');
        const messagesContainer = document.getElementById('messages-container');
        
        // 设置表单标题
        document.getElementById('talk-modal-title').textContent = '编辑对话';
        
        // 填充表单数据
        talkIdInput.value = talk.id;
        talkTitleInput.value = talk.title || '';
        talkDateInput.value = talk.date || '';
        talkTagsInput.value = talk.tags ? talk.tags.join(', ') : '';
        
        // 清空参与者选择
        talkParticipantsSelect.innerHTML = '';
        
        // 填充代理人选项
        const agentsData = window.agents || agents;
        agentsData.forEach(agent => {
            const option = document.createElement('option');
            option.value = agent.id;
            option.textContent = agent.name;
            
            // 如果是已选择的参与者，设置为选中
            if (talk.participants && talk.participants.includes(agent.id)) {
                option.selected = true;
            }
            
            talkParticipantsSelect.appendChild(option);
        });
        
        // 清空消息容器
        messagesContainer.innerHTML = '';
        
        // 填充消息
        if (talk.messages && Array.isArray(talk.messages)) {
            talk.messages.forEach((message, index) => {
                const messageDiv = document.createElement('div');
                messageDiv.className = 'message-input';
                messageDiv.innerHTML = `
                    <button type="button" class="remove-message-btn" data-index="${index}">&times;</button>
                    <div class="form-group">
                        <label>发送者</label>
                        <select class="form-control message-sender">
                            ${agentsData.map(agent => `
                                <option value="${agent.id}" ${message.senderId == agent.id ? 'selected' : ''}>
                                    ${agent.name}
                                </option>
                            `).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label>内容</label>
                        <textarea class="form-control message-content">${message.content || ''}</textarea>
                    </div>
                    <div class="form-group">
                        <label>时间</label>
                        <input type="text" class="form-control message-time" value="${message.time || ''}">
                    </div>
                `;
                
                messagesContainer.appendChild(messageDiv);
                
                // 绑定删除消息按钮事件
                const removeBtn = messageDiv.querySelector('.remove-message-btn');
                if (removeBtn) {
                    removeBtn.addEventListener('click', function() {
                        messageDiv.remove();
                    });
                }
            });
        }
        
        // 显示模态框
        talkModal.style.display = 'block';
    }
    
    // 删除对话
    function deleteTalk(talkId) {
        console.log('删除对话:', talkId);
        
        if (confirm('确定要删除这个对话吗？')) {
            fetch(`/api/talks/${talkId}`, {
                method: 'DELETE'
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('删除失败');
                }
                return response.json();
            })
            .then(data => {
                console.log('删除成功:', data);
                
                // 从本地数据中移除
                if (window.talks) {
                    window.talks = window.talks.filter(t => t.id != talkId);
                }
                if (talks) {
                    talks = talks.filter(t => t.id != talkId);
                }
                
                // 重新渲染
                renderTalks();
                
                alert('对话已删除');
            })
            .catch(error => {
                console.error('删除对话失败:', error);
                alert('删除对话失败: ' + error.message);
            });
        }
    }
    
    // 添加对话管理功能
    function setupTalksManagement() {
        console.log('设置对话管理功能');
        
        // 获取对话管理部分
        const talksSection = document.getElementById('talks-section');
        if (!talksSection) {
            console.error('找不到talks-section元素');
            return;
        }
        
        // 检查是否已存在talks-container
        let talksContainer = talksSection.querySelector('.talks-container');
        
        // 如果不存在，创建一个
        if (!talksContainer) {
            console.log('创建talks-container元素');
            talksContainer = document.createElement('div');
            talksContainer.className = 'talks-container';
            
            // 创建标题和添加按钮的容器
            const headerContainer = document.createElement('div');
            headerContainer.className = 'section-header';
            headerContainer.style.display = 'flex';
            headerContainer.style.justifyContent = 'space-between';
            headerContainer.style.alignItems = 'center';
            headerContainer.style.marginBottom = '20px';
            
            // 添加标题
            const title = document.createElement('h2');
            title.textContent = '对话管理';
            headerContainer.appendChild(title);
            
            // 添加新建对话按钮
            const addTalkBtn = document.createElement('button');
            addTalkBtn.id = 'add-talk-btn';
            addTalkBtn.className = 'add-talk-btn';
            addTalkBtn.innerHTML = '<i class="fas fa-plus"></i> 新建对话';
            addTalkBtn.style.backgroundColor = '#6c5ce7';
            addTalkBtn.style.color = 'white';
            addTalkBtn.style.border = 'none';
            addTalkBtn.style.padding = '10px 15px';
            addTalkBtn.style.borderRadius = '4px';
            addTalkBtn.style.cursor = 'pointer';
            headerContainer.appendChild(addTalkBtn);
            
            // 将标题和按钮容器添加到对话部分
            talksSection.appendChild(headerContainer);
            
            // 将对话容器添加到对话部分
            talksSection.appendChild(talksContainer);
            
            // 添加新建对话按钮点击事件
            addTalkBtn.addEventListener('click', function() {
                // 检查是否已有openTalkEditModal函数
                if (typeof window.openTalkEditModal === 'function') {
                    window.openTalkEditModal();
                } else {
                    // 使用现有的对话模态框
                    const talkModal = document.getElementById('talk-modal');
                    if (talkModal) {
                        document.getElementById('talk-modal-title').textContent = '添加对话';
                        document.getElementById('talk-form').reset();
                        document.getElementById('talk-id').value = '';
                        document.getElementById('messages-container').innerHTML = '';
                        
                        // 填充代理人选项
                        const participantsSelect = document.getElementById('talk-participants');
                        participantsSelect.innerHTML = '';
                        window.agents.forEach(agent => {
                            const option = document.createElement('option');
                            option.value = agent.id;
                            option.textContent = agent.name;
                            participantsSelect.appendChild(option);
                        });
                        
                        talkModal.style.display = 'block';
                    } else {
                        console.error('找不到talk-modal元素');
                        alert('无法打开对话编辑窗口，请刷新页面重试');
                    }
                }
            });
        }
        
        // 加载对话数据
        loadTalksData();
        
        console.log('对话管理功能设置完成');
    }

    // 加载对话数据
    function loadTalksData() {
        console.log('开始加载对话数据');
        
        fetch('/api/talks')
            .then(response => response.json())
            .then(data => {
                console.log('对话数据加载成功:', data);
                renderTalksTable(data);
            })
            .catch(error => {
                console.error('加载对话数据失败:', error);
                // 检查是否有showNotification函数
                if (typeof window.showNotification === 'function') {
                    window.showNotification('加载对话数据失败，请刷新页面重试', 'error');
                } else {
                    alert('加载对话数据失败，请刷新页面重试');
                }
            });
    }

    // 渲染对话表格
    function renderTalksTable(talks) {
        console.log('开始渲染对话表格');
        
        // 获取对话列表容器
        const talksContainer = document.querySelector('.talks-container');
        if (!talksContainer) {
            console.error('找不到.talks-container元素');
            return;
        }
        
        // 清空现有内容
        talksContainer.innerHTML = '';
        
        // 创建表格
        const table = document.createElement('table');
        table.className = 'talks-table';
        table.style.width = '100%';
        table.style.borderCollapse = 'collapse';
        table.style.marginTop = '20px';
        
        // 创建表头
        const thead = document.createElement('thead');
        thead.innerHTML = `
            <tr>
                <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">ID</th>
                <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">标题</th>
                <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">日期</th>
                <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">参与者</th>
                <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">标签</th>
                <th style="padding: 12px; text-align: center; border-bottom: 2px solid #ddd;">操作</th>
            </tr>
        `;
        table.appendChild(thead);
        
        // 创建表体
        const tbody = document.createElement('tbody');
        
        // 获取代理人数据，用于显示参与者名称
        fetch('/api/agents')
            .then(response => response.json())
            .then(agents => {
                console.log('代理人数据加载成功:', agents);
                
                // 添加行
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
                    let participantNames = '无参与者';
                    if (talk.participants && Array.isArray(talk.participants) && talk.participants.length > 0) {
                        participantNames = talk.participants.map(id => {
                            const agent = agents.find(a => a.id === id);
                            return agent ? agent.name : '未知代理人';
                        }).join(', ');
                    }
                    
                    // 获取标签
                    let tagsHTML = '无标签';
                    if (talk.tags && Array.isArray(talk.tags) && talk.tags.length > 0) {
                        tagsHTML = talk.tags.map(tag => `
                            <span style="
                                background-color: #e9ecef; 
                                color: #495057; 
                                padding: 2px 8px; 
                                border-radius: 12px; 
                                font-size: 11px;
                                display: inline-block;
                                margin: 2px;
                            ">${tag}</span>
                        `).join('');
                    }
                    
                    // 创建行
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td style="padding: 12px; text-align: left; border-bottom: 1px solid #ddd;">${talk.id}</td>
                        <td style="padding: 12px; text-align: left; border-bottom: 1px solid #ddd;">${talk.title || '无标题'}</td>
                        <td style="padding: 12px; text-align: left; border-bottom: 1px solid #ddd;">${formattedDate}</td>
                        <td style="padding: 12px; text-align: left; border-bottom: 1px solid #ddd;">${participantNames}</td>
                        <td style="padding: 12px; text-align: left; border-bottom: 1px solid #ddd;">${tagsHTML}</td>
                        <td style="padding: 12px; text-align: center; border-bottom: 1px solid #ddd;">
                            <button class="view-talk-btn" data-id="${talk.id}" style="background-color: #6c5ce7; color: white; border: none; padding: 5px 10px; border-radius: 4px; margin-right: 5px;">查看</button>
                            <button class="edit-talk-btn" data-id="${talk.id}" style="background-color: #4caf50; color: white; border: none; padding: 5px 10px; border-radius: 4px; margin-right: 5px;">编辑</button>
                            <button class="delete-talk-btn" data-id="${talk.id}" style="background-color: #f44336; color: white; border: none; padding: 5px 10px; border-radius: 4px;">删除</button>
                        </td>
                    `;
                    tbody.appendChild(tr);
                });
                
                table.appendChild(tbody);
                talksContainer.appendChild(table);
                
                // 绑定按钮事件
                bindTalkButtonEvents();
                
                console.log('对话表格渲染完成');
            })
            .catch(error => {
                console.error('获取代理人数据失败:', error);
                // 检查是否有showNotification函数
                if (typeof window.showNotification === 'function') {
                    window.showNotification('获取代理人数据失败，请刷新页面重试', 'error');
                } else {
                    alert('获取代理人数据失败，请刷新页面重试');
                }
            });
    }

    // 绑定对话按钮事件
    function bindTalkButtonEvents() {
        console.log('绑定对话按钮事件');
        
        // 查看按钮
        const viewButtons = document.querySelectorAll('.view-talk-btn');
        viewButtons.forEach(button => {
            button.addEventListener('click', function() {
                const talkId = this.getAttribute('data-id');
                viewTalk(talkId);
            });
        });
        
        // 编辑按钮
        const editButtons = document.querySelectorAll('.edit-talk-btn');
        editButtons.forEach(button => {
            button.addEventListener('click', function() {
                const talkId = this.getAttribute('data-id');
                editTalk(talkId);
            });
        });
        
        // 删除按钮
        const deleteButtons = document.querySelectorAll('.delete-talk-btn');
        deleteButtons.forEach(button => {
            button.addEventListener('click', function() {
                const talkId = this.getAttribute('data-id');
                deleteTalk(talkId);
            });
        });
    }

    // 查看对话
    function viewTalk(talkId) {
        console.log('查看对话:', talkId);
        
        // 查找对话数据
        const talksData = window.talks || talks;
        const talk = talksData.find(t => t.id == talkId);
        
        if (!talk) {
            console.error('找不到对话数据:', talkId);
            alert('找不到对话数据');
            return;
        }
        
        // 创建模态框
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.display = 'block';
        
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
        const agentsData = window.agents || agents;
        let participantNames = '无参与者';
        if (talk.participants && Array.isArray(talk.participants) && talk.participants.length > 0) {
            const names = talk.participants.map(id => {
                const agent = agentsData.find(a => a.id == id);
                return agent ? agent.name : `未知(ID:${id})`;
            });
            participantNames = names.join(', ');
        }
        
        // 创建消息HTML
        let messagesHTML = '';
        if (talk.messages && Array.isArray(talk.messages) && talk.messages.length > 0) {
            messagesHTML = talk.messages.map(message => {
                // 查找发送者
                let senderName = '未知';
                if (message.senderId) {
                    const agent = agentsData.find(a => a.id == message.senderId);
                    senderName = agent ? agent.name : `未知(ID:${message.senderId})`;
                }
                
                return `
                    <div class="message" style="margin-bottom: 15px; padding: 10px; border-radius: 8px; background-color: #f5f5f5;">
                        <div class="message-header" style="margin-bottom: 5px;">
                            <strong>${senderName}</strong>
                            <span style="color: #777; margin-left: 10px;">${message.time || ''}</span>
                        </div>
                        <div class="message-content">${message.content}</div>
                    </div>
                `;
            }).join('');
        } else {
            messagesHTML = '<p>暂无消息</p>';
        }
        
        // 设置模态框内容
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 800px;">
                <span class="close-modal">&times;</span>
                <h3>${talk.title || '无标题'}</h3>
                <div style="margin: 15px 0;">
                    <p><strong>日期:</strong> ${formattedDate}</p>
                    <p><strong>参与者:</strong> ${participantNames}</p>
                </div>
                <h4>消息:</h4>
                <div class="messages-container" style="max-height: 400px; overflow-y: auto;">
                    ${messagesHTML}
                </div>
            </div>
        `;
        
        // 添加到文档
        document.body.appendChild(modal);
        
        // 关闭按钮事件
        const closeBtn = modal.querySelector('.close-modal');
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
    }

    // 显示通知
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
                <span>${message}</span>
            </div>
            <button class="close-notification">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        document.body.appendChild(notification);
        
        // 添加关闭按钮事件
        notification.querySelector('.close-notification').addEventListener('click', function() {
            notification.remove();
        });
        
        // 3秒后自动关闭
        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => {
                notification.remove();
            }, 500);
        }, 3000);
    }
    
    // 全局错误处理
    window.addEventListener('error', function(event) {
        console.error('全局错误:', event.error);
        showNotification('发生错误: ' + (event.error ? event.error.message : '未知错误'), 'error');
    });

    // 处理未捕获的Promise错误
    window.addEventListener('unhandledrejection', function(event) {
        console.error('未处理的Promise错误:', event.reason);
        showNotification('API请求失败: ' + (event.reason ? event.reason.message : '未知错误'), 'error');
    });

    // 显示或隐藏加载状态
    function showLoading(show) {
        // 检查是否存在加载指示器
        let loadingIndicator = document.querySelector('.loading-indicator');
        
        // 如果不存在且需要显示，则创建一个
        if (!loadingIndicator && show) {
            loadingIndicator = document.createElement('div');
            loadingIndicator.className = 'loading-indicator';
            loadingIndicator.innerHTML = `
                <div class="spinner"></div>
                <p>加载中...</p>
            `;
            document.body.appendChild(loadingIndicator);
        }
        
        // 如果存在，根据show参数显示或隐藏
        if (loadingIndicator) {
            loadingIndicator.style.display = show ? 'flex' : 'none';
        }
    }

    // 显示错误消息
    function showError(message) {
        // 使用已有的showNotification函数
        showNotification(message, 'error');
    }

    // 绑定代理人按钮事件
    function bindAgentButtons() {
        console.log('绑定代理人按钮事件');
        
        // 编辑按钮
        const editButtons = document.querySelectorAll('.edit-agent-btn');
        editButtons.forEach(button => {
            button.addEventListener('click', function() {
                const agentId = this.getAttribute('data-id');
                editAgent(agentId);
            });
        });
        
        // 删除按钮
        const deleteButtons = document.querySelectorAll('.delete-agent-btn');
        deleteButtons.forEach(button => {
            button.addEventListener('click', function() {
                const agentId = this.getAttribute('data-id');
                deleteAgent(agentId);
            });
        });
    }

    // 编辑代理人
    function editAgent(agentId) {
        console.log('编辑代理人:', agentId);
        
        // 查找代理人数据
        const agent = window.agents.find(a => a.id == agentId);
        if (!agent) {
            console.error('找不到代理人数据:', agentId);
            showNotification('找不到代理人数据', 'error');
            return;
        }
        
        // 填充表单
        document.getElementById('agent-modal-title').textContent = '编辑代理人';
        document.getElementById('agent-id').value = agent.id;
        document.getElementById('agent-name').value = agent.name || '';
        document.getElementById('agent-title').value = agent.title || '';
        document.getElementById('agent-bio').value = agent.bio || '';
        document.getElementById('agent-avatar').value = agent.avatar || '';
        document.getElementById('agent-prompt').value = agent.prompt || '';
        
        // 显示头像预览
        const previewDiv = document.getElementById('avatar-preview');
        if (agent.avatar) {
            previewDiv.innerHTML = `<img src="${agent.avatar}" alt="头像预览" style="max-width: 100px; margin-top: 10px;">`;
        } else {
            previewDiv.innerHTML = '';
        }
        
        // 显示模态框
        document.getElementById('agent-modal').style.display = 'block';
    }

    // 删除代理人
    function deleteAgent(agentId) {
        console.log('删除代理人:', agentId);
        
        if (confirm('确定要删除这个代理人吗？')) {
            fetch(`/api/agents/${agentId}`, {
                method: 'DELETE'
            })
            .then(response => {
                if (!response.ok) throw new Error('删除失败');
                return response.json();
            })
            .then(() => {
                // 从本地数据中移除
                window.agents = window.agents.filter(a => a.id != agentId);
                
                // 重新渲染
                renderAgents();
                
                showNotification('代理人已删除', 'success');
            })
            .catch(error => {
                console.error('删除代理人失败:', error);
                showNotification('删除代理人失败，请稍后再试', 'error');
            });
        }
    }

    // 绑定新闻按钮事件
    function bindNewsButtons() {
        console.log('绑定新闻按钮事件');
        
        // 编辑按钮
        const editButtons = document.querySelectorAll('.edit-news-btn');
        editButtons.forEach(button => {
            button.addEventListener('click', function() {
                const newsId = this.getAttribute('data-id');
                editNews(newsId);
            });
        });
        
        // 删除按钮
        const deleteButtons = document.querySelectorAll('.delete-news-btn');
        deleteButtons.forEach(button => {
            button.addEventListener('click', function() {
                const newsId = this.getAttribute('data-id');
                deleteNews(newsId);
            });
        });
    }

    // 编辑新闻
    function editNews(newsId) {
        console.log('编辑新闻:', newsId);
        
        // 确保news数据已加载
        if (!window.news || !Array.isArray(window.news)) {
            console.error('新闻数据未加载或格式不正确');
            
            // 尝试重新加载新闻数据
            fetch('/api/news')
                .then(response => response.json())
                .then(data => {
                    window.news = data;
                    console.log('新闻数据重新加载成功:', data);
                    
                    // 重新调用编辑函数
                    editNews(newsId);
                })
                .catch(error => {
                    console.error('加载新闻数据失败:', error);
                    showNotification('无法加载新闻数据，请刷新页面重试', 'error');
                });
            return;
        }
        
        // 查找新闻数据
        const newsItem = window.news.find(n => n.id == newsId);
        if (!newsItem) {
            console.error('找不到新闻数据:', newsId);
            showNotification('找不到新闻数据', 'error');
            return;
        }
        
        // 检查模态框元素是否存在
        const newsModal = document.getElementById('news-modal');
        const titleElement = document.getElementById('news-modal-title');
        const idElement = document.getElementById('news-id');
        const titleInput = document.getElementById('news-title');
        const contentInput = document.getElementById('news-content');
        const dateInput = document.getElementById('news-date');
        const imageInput = document.getElementById('news-image');
        const sourceInput = document.getElementById('news-source');
        const urlInput = document.getElementById('news-url');
        
        // 检查所有必要的元素
        if (!newsModal || !titleElement || !idElement || !titleInput || 
            !contentInput || !dateInput || !imageInput || !sourceInput || !urlInput) {
            console.error('新闻模态框元素缺失');
            console.log('newsModal:', newsModal);
            console.log('titleElement:', titleElement);
            console.log('idElement:', idElement);
            console.log('titleInput:', titleInput);
            console.log('contentInput:', contentInput);
            console.log('dateInput:', dateInput);
            console.log('imageInput:', imageInput);
            console.log('sourceInput:', sourceInput);
            console.log('urlInput:', urlInput);
            
            showNotification('无法打开编辑窗口，请刷新页面重试', 'error');
            return;
        }
        
        // 填充表单
        titleElement.textContent = '编辑新闻';
        idElement.value = newsItem.id;
        titleInput.value = newsItem.title || '';
        contentInput.value = newsItem.content || '';
        dateInput.value = newsItem.date || '';
        imageInput.value = newsItem.image || '';
        sourceInput.value = newsItem.source || '';
        urlInput.value = newsItem.url || '';
        
        // 显示模态框
        newsModal.style.display = 'block';
    }

    // 删除新闻
    function deleteNews(newsId) {
        console.log('删除新闻:', newsId);
        
        // 确保news数据已加载
        if (!window.news || !Array.isArray(window.news)) {
            console.error('新闻数据未加载或格式不正确');
            showNotification('新闻数据未加载，请刷新页面重试', 'error');
            return;
        }
        
        if (confirm('确定要删除这条新闻吗？')) {
            fetch(`/api/news/${newsId}`, {
                method: 'DELETE'
            })
            .then(response => {
                if (!response.ok) throw new Error('删除失败');
                return response.json();
            })
            .then(() => {
                // 从本地数据中移除
                window.news = window.news.filter(n => n.id != newsId);
                
                // 重新渲染
                renderNews();
                
                showNotification('新闻已删除', 'success');
            })
            .catch(error => {
                console.error('删除新闻失败:', error);
                showNotification('删除新闻失败，请稍后再试', 'error');
            });
        }
    }
}); 