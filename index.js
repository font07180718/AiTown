// 渲染代理人卡片
function renderAgentCard(agent) {
    try {
        const card = document.createElement('div');
        card.className = 'agent-card';
        
        card.innerHTML = `
            <div class="agent-avatar">
                <img src="${agent.avatar || ''}" alt="${agent.name || '未命名'}" 
                     onerror="this.src='data:image/svg+xml,%3Csvg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'200\\' height=\\'200\\' viewBox=\\'0 0 200 200\\'%3E%3Crect width=\\'200\\' height=\\'200\\' fill=\\'%23f0f0f0\\' /%3E%3Ctext x=\\'50%25\\' y=\\'50%25\\' font-size=\\'18\\' text-anchor=\\'middle\\' alignment-baseline=\\'middle\\' font-family=\\'Arial, sans-serif\\' fill=\\'%23999999\\'%3E无图像%3C/text%3E%3C/svg%3E'">
            </div>
            <div class="agent-info">
                <h3>${agent.name || '未命名'}</h3>
                <p class="agent-title">${agent.title || ''}</p>
                <p class="agent-bio">${agent.bio || ''}</p>
                <button class="agent-contact">Contact Agent</button>
            </div>
        `;
        
        return card;
    } catch (error) {
        console.error('创建代理人卡片时出错:', error, agent);
        const errorCard = document.createElement('div');
        errorCard.className = 'agent-card error';
        errorCard.textContent = '加载代理人信息失败';
        return errorCard;
    }
}

// 在document.ready函数中添加
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
        
        // 搜索对话
        searchTalks(keyword);
    });
    
    // 回车键触发搜索
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchBtn.click();
        }
    });
}

// 加载对话数据
function loadTalks() {
    console.log('加载对话数据');
    
    // 显示加载状态
    const talksGrid = document.querySelector('.talks-grid');
    if (talksGrid) {
        talksGrid.innerHTML = '<div class="loading">加载中...</div>';
    }
    
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
            
            // 渲染对话卡片
            renderTalkCards(data);
        })
        .catch(error => {
            console.error('加载对话数据失败:', error);
            if (talksGrid) {
                talksGrid.innerHTML = '<div class="error">加载对话数据失败，请刷新页面重试</div>';
            }
        });
}

// 搜索对话
function searchTalks(keyword) {
    console.log('搜索对话:', keyword);
    
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
            
            // 渲染过滤后的对话
            renderTalkCards(filteredTalks);
        })
        .catch(error => {
            console.error('搜索对话失败:', error);
            alert('搜索失败，请稍后再试');
        });
}

// 渲染对话卡片
function renderTalkCards(talks) {
    const talksGrid = document.querySelector('.talks-grid');
    if (!talksGrid) {
        console.error('找不到.talks-grid元素');
        return;
    }
    
    // 清空容器
    talksGrid.innerHTML = '';
    
    // 如果没有对话数据
    if (!talks || !Array.isArray(talks) || talks.length === 0) {
        talksGrid.innerHTML = '<div class="empty-state">暂无对话数据</div>';
        return;
    }
    
    // 加载代理人数据，用于显示参与者名称
    fetch('/api/agents')
        .then(response => response.json())
        .then(agents => {
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
                
                talksGrid.appendChild(card);
            });
        })
        .catch(error => {
            console.error('获取代理人数据失败:', error);
            talksGrid.innerHTML = '<div class="error">加载数据失败，请刷新页面重试</div>';
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