document.addEventListener('DOMContentLoaded', function() {
    console.log('对话页面已加载');
    
    // 全局变量
    let talks = [];
    let agents = [];
    
    // 初始化
    init();
    
    // 初始化函数
    function init() {
        // 加载数据
        loadData();
        
        // 设置搜索功能
        setupSearch();
        
        // 将表格转换为卡片布局
        convertTableToCards();
    }
    
    // 加载数据
    function loadData() {
        console.log('加载对话和代理人数据');
        
        // 显示加载状态
        showLoading(true);
        
        // 并行加载对话和代理人数据
        Promise.all([
            fetch('/api/talks').then(res => res.json()),
            fetch('/api/agents').then(res => res.json())
        ])
        .then(([talksData, agentsData]) => {
            console.log('数据加载成功:', { talks: talksData, agents: agentsData });
            
            // 保存数据到全局变量
            talks = talksData;
            agents = agentsData;
            
            // 按日期排序，最新的在前面
            talks.sort((a, b) => {
                const dateA = new Date(a.date || 0);
                const dateB = new Date(b.date || 0);
                return dateB - dateA; // 降序排序，最新的在前
            });
            
            // 渲染卡片
            renderTalkCards();
            
            // 隐藏加载状态
            showLoading(false);
        })
        .catch(error => {
            console.error('加载数据失败:', error);
            showError('加载数据失败，请刷新页面重试');
            showLoading(false);
        });
    }
    
    // 设置搜索功能
    function setupSearch() {
        const searchBtn = document.querySelector('#search-btn');
        const searchInput = document.querySelector('#talk-search');
        
        if (searchBtn && searchInput) {
            searchBtn.addEventListener('click', function() {
                const keyword = searchInput.value.trim().toLowerCase();
                
                if (!keyword) {
                    // 如果关键词为空，显示所有对话
                    renderTalkCards();
                    return;
                }
                
                // 过滤对话
                const filteredTalks = talks.filter(talk => {
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
            });
            
            // 回车键触发搜索
            searchInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    searchBtn.click();
                }
            });
        }
    }
    
    // 将表格转换为卡片布局
    function convertTableToCards() {
        console.log('将表格转换为卡片布局');
        
        // 查找表格
        const table = document.querySelector('table');
        if (!table) {
            console.log('未找到表格，创建卡片容器');
            
            // 查找可能的容器
            const container = document.querySelector('.content-section.active') || 
                              document.querySelector('#talks-section') || 
                              document.querySelector('main');
            
            if (container) {
                // 创建卡片容器
                const cardsContainer = document.createElement('div');
                cardsContainer.className = 'talks-grid';
                cardsContainer.style.display = 'grid';
                cardsContainer.style.gridTemplateColumns = 'repeat(auto-fill, minmax(300px, 1fr))';
                cardsContainer.style.gap = '20px';
                cardsContainer.style.marginTop = '20px';
                
                // 添加到页面
                container.appendChild(cardsContainer);
            }
        } else {
            console.log('找到表格，替换为卡片布局');
            
            // 创建卡片容器
            const cardsContainer = document.createElement('div');
            cardsContainer.className = 'talks-grid';
            cardsContainer.style.display = 'grid';
            cardsContainer.style.gridTemplateColumns = 'repeat(auto-fill, minmax(300px, 1fr))';
            cardsContainer.style.gap = '20px';
            cardsContainer.style.marginTop = '20px';
            
            // 替换表格
            table.parentNode.replaceChild(cardsContainer, table);
        }
    }
    
    // 渲染对话卡片
    function renderTalkCards(talksToRender = talks) {
        console.log('渲染对话卡片:', talksToRender.length);
        
        // 查找卡片容器
        const cardsContainer = document.querySelector('.talks-grid');
        if (!cardsContainer) {
            console.error('找不到卡片容器');
            return;
        }
        
        // 清空容器
        cardsContainer.innerHTML = '';
        
        // 如果没有对话数据
        if (!talksToRender || talksToRender.length === 0) {
            cardsContainer.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 30px; color: #666;">暂无对话数据</div>';
            return;
        }
        
        // 创建对话卡片
        talksToRender.forEach(talk => {
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
                participantsHTML = `<div style="margin-top: 5px; font-size: 14px; color: #666;">参与者: ${participantsList.join(', ')}</div>`;
            }
            
            // 格式化标签
            let tagsHTML = '';
            if (talk.tags && Array.isArray(talk.tags) && talk.tags.length > 0) {
                tagsHTML = `<div style="margin-top: 10px;">${talk.tags.map(tag => `
                    <span style="
                        display: inline-block;
                        background-color: #e9ecef;
                        color: #495057;
                        padding: 2px 8px;
                        border-radius: 12px;
                        font-size: 12px;
                        margin-right: 5px;
                        margin-bottom: 5px;
                    ">${tag}</span>
                `).join('')}</div>`;
            }
            
            // 获取摘要
            let summary = '';
            if (talk.messages && Array.isArray(talk.messages) && talk.messages.length > 0) {
                summary = talk.messages[0].content;
                if (summary.length > 100) {
                    summary = summary.substring(0, 100) + '...';
                }
            }
            
            // 创建卡片
            const card = document.createElement('div');
            card.style.backgroundColor = '#fff';
            card.style.borderRadius = '8px';
            card.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
            card.style.overflow = 'hidden';
            card.style.transition = 'transform 0.3s, box-shadow 0.3s';
            card.style.cursor = 'pointer';
            
            card.innerHTML = `
                <div style="padding: 15px; border-bottom: 1px solid #eee;">
                    <h3 style="margin: 0; font-size: 18px; color: #333;">${talk.title || '无标题'}</h3>
                    <div style="margin-top: 5px; font-size: 14px; color: #666;">${formattedDate}</div>
                    ${participantsHTML}
                    ${tagsHTML}
                </div>
                <div style="padding: 15px; min-height: 80px;">
                    <p style="margin: 0; color: #555; font-size: 14px; line-height: 1.5;">${summary || '点击查看详情'}</p>
                </div>
                <div style="padding: 10px 15px; border-top: 1px solid #eee; text-align: right;">
                    <button style="
                        background-color: #6c5ce7;
                        color: white;
                        border: none;
                        padding: 8px 15px;
                        border-radius: 4px;
                        cursor: pointer;
                        font-size: 14px;
                    ">查看详情</button>
                </div>
            `;
            
            // 添加鼠标悬停效果
            card.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-5px)';
                this.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.2)';
            });
            
            card.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0)';
                this.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
            });
            
            // 添加点击事件
            card.addEventListener('click', function() {
                openTalkDetail(talk);
            });
            
            cardsContainer.appendChild(card);
        });
    }
    
    // 打开对话详情
    function openTalkDetail(talk) {
        console.log('打开对话详情:', talk);
        
        // 创建模态框
        const modal = document.createElement('div');
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
    }
    
    // 显示加载状态
    function showLoading(show) {
        let loadingElement = document.querySelector('.loading-indicator');
        
        if (!loadingElement && show) {
            loadingElement = document.createElement('div');
            loadingElement.className = 'loading-indicator';
            loadingElement.style.position = 'fixed';
            loadingElement.style.top = '0';
            loadingElement.style.left = '0';
            loadingElement.style.width = '100%';
            loadingElement.style.height = '100%';
            loadingElement.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
            loadingElement.style.display = 'flex';
            loadingElement.style.justifyContent = 'center';
            loadingElement.style.alignItems = 'center';
            loadingElement.style.zIndex = '999';
            
            loadingElement.innerHTML = `
                <div style="text-align: center;">
                    <div style="
                        border: 4px solid #f3f3f3;
                        border-top: 4px solid #6c5ce7;
                        border-radius: 50%;
                        width: 40px;
                        height: 40px;
                        animation: spin 2s linear infinite;
                        margin: 0 auto;
                    "></div>
                    <p style="margin-top: 10px;">加载中...</p>
                </div>
            `;
            
            // 添加动画样式
            const style = document.createElement('style');
            style.textContent = `
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `;
            document.head.appendChild(style);
            
            document.body.appendChild(loadingElement);
        } else if (loadingElement) {
            if (show) {
                loadingElement.style.display = 'flex';
            } else {
                loadingElement.style.display = 'none';
            }
        }
    }
    
    // 显示错误消息
    function showError(message) {
        const errorElement = document.createElement('div');
        errorElement.style.position = 'fixed';
        errorElement.style.top = '20px';
        errorElement.style.left = '50%';
        errorElement.style.transform = 'translateX(-50%)';
        errorElement.style.backgroundColor = '#f44336';
        errorElement.style.color = 'white';
        errorElement.style.padding = '10px 20px';
        errorElement.style.borderRadius = '4px';
        errorElement.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.2)';
        errorElement.style.zIndex = '1001';
        errorElement.textContent = message;
        
        document.body.appendChild(errorElement);
        
        // 3秒后自动移除
        setTimeout(() => {
            errorElement.style.opacity = '0';
            errorElement.style.transition = 'opacity 0.5s';
            
            setTimeout(() => {
                errorElement.remove();
            }, 500);
        }, 3000);
    }
}); 