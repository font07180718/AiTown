// 获取所有代理人
app.get('/api/agents', (req, res) => {
    try {
        const agents = JSON.parse(fs.readFileSync('./data/agents.json', 'utf8'));
        res.json(agents);
    } catch (error) {
        console.error('读取代理人数据失败:', error);
        res.status(500).json({ error: '无法读取代理人数据' });
    }
});

// 添加代理人
app.post('/api/agents', (req, res) => {
    try {
        const agents = JSON.parse(fs.readFileSync('./data/agents.json', 'utf8'));
        const newAgent = {
            ...req.body,
            id: agents.length > 0 ? Math.max(...agents.map(a => a.id)) + 1 : 1
        };
        agents.push(newAgent);
        fs.writeFileSync('./data/agents.json', JSON.stringify(agents, null, 2));
        res.json(newAgent);
    } catch (error) {
        console.error('添加代理人失败:', error);
        res.status(500).json({ error: '无法添加代理人' });
    }
});

// 获取单个代理人
app.get('/api/agents/:id', (req, res) => {
    try {
        const agents = JSON.parse(fs.readFileSync('./data/agents.json', 'utf8'));
        const agent = agents.find(a => a.id === parseInt(req.params.id));
        
        if (!agent) {
            return res.status(404).json({ error: '找不到该代理人' });
        }
        
        res.json(agent);
    } catch (error) {
        console.error('读取代理人数据失败:', error);
        res.status(500).json({ error: '无法读取代理人数据' });
    }
});

// 获取所有对话
app.get('/api/talks', (req, res) => {
    console.log('收到获取对话的请求');
    try {
        const talks = JSON.parse(fs.readFileSync('./server/data/talks.json', 'utf8'));
        console.log(`成功读取对话数据，共 ${talks.length} 条`);
        
        // 按日期降序排序（最新的在前）
        talks.sort((a, b) => {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            return dateB - dateA; // 降序排序
        });
        
        res.json(talks);
    } catch (error) {
        console.error('读取对话数据失败:', error);
        res.status(500).json({ error: '无法读取对话数据' });
    }
});

// 获取单个对话
app.get('/api/talks/:id', (req, res) => {
    try {
        const talks = JSON.parse(fs.readFileSync('./server/data/talks.json', 'utf8'));
        const talk = talks.find(t => t.id === parseInt(req.params.id));
        
        if (!talk) {
            return res.status(404).json({ error: '找不到该对话' });
        }
        
        res.json(talk);
    } catch (error) {
        console.error('读取对话数据失败:', error);
        res.status(500).json({ error: '无法读取对话数据' });
    }
});

// 删除对话
app.delete('/api/talks/:id', (req, res) => {
    try {
        let talks = JSON.parse(fs.readFileSync('./server/data/talks.json', 'utf8'));
        const talkId = parseInt(req.params.id);
        
        // 过滤掉要删除的对话
        talks = talks.filter(t => t.id !== talkId);
        
        // 保存更新后的数据
        fs.writeFileSync('./server/data/talks.json', JSON.stringify(talks, null, 2));
        
        res.json({ success: true, message: '对话已删除' });
    } catch (error) {
        console.error('删除对话失败:', error);
        res.status(500).json({ error: '无法删除对话' });
    }
});

// 获取所有新闻
app.get('/api/news', (req, res) => {
    console.log('收到获取新闻的请求');
    try {
        let news = JSON.parse(fs.readFileSync('./server/data/news.json', 'utf8'));
        
        // 确保每条新闻都有必要的字段
        news = news.map(item => {
            return {
                id: item.id || Date.now(),
                title: item.title || '无标题',
                date: item.date || new Date().toISOString().split('T')[0],
                summary: item.summary || item.content || '无内容',
                content: item.content || item.summary || '无内容'
            };
        });
        
        res.json(news);
    } catch (error) {
        console.error('读取新闻数据失败:', error);
        res.status(500).json({ error: '无法读取新闻数据' });
    }
}); 