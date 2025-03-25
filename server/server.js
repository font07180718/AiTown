const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const http = require('http');

const app = express();
let PORT = process.env.PORT || 3000;

// 中间件
app.use(cors({
    origin: '*', // 允许所有来源
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../')));
console.log('静态文件目录:', path.join(__dirname, '../'));

// 数据文件路径
const dataPath = path.join(__dirname, 'data');
const agentsFile = path.join(dataPath, 'agents.json');
const newsFile = path.join(dataPath, 'news.json');
const settingsFile = path.join(dataPath, 'settings.json');
const talksFile = path.join(dataPath, 'talks.json');

// 确保数据目录存在
if (!fs.existsSync(dataPath)) {
    try {
        fs.mkdirSync(dataPath, { recursive: true });
        console.log('数据目录已创建:', dataPath);
    } catch (error) {
        console.error('创建数据目录失败:', error);
    }
}

// 创建HTTP服务器
const server = http.createServer(app);
let serverInstance = null;

// 尝试启动服务器，如果端口被占用则尝试下一个端口
function startServer(port) {
    // 如果有之前的服务器实例，先关闭它
    if (serverInstance) {
        try {
            serverInstance.close();
        } catch (error) {
            console.error('关闭之前的服务器实例时出错:', error);
        }
    }
    
    serverInstance = server.listen(port, () => {
        console.log(`服务器运行在 http://localhost:${port}`);
        console.log(`后台管理界面: http://localhost:${port}/admin`);
    }).on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            console.log(`端口 ${port} 已被占用，尝试端口 ${port + 1}`);
            startServer(port + 1);
        } else {
            console.error('启动服务器时出错:', err);
        }
    });
}

// 初始化数据文件
function initDataFiles() {
    console.log('初始化数据文件...');
    
    // 初始化代理人数据
    if (!fs.existsSync(agentsFile)) {
        const defaultAgents = [
            {
                id: 1,
                name: "Agent Alpha",
                title: "DeFi Strategist",
                bio: "Former Wall Street quant with 8+ years in algorithmic trading. Pioneered several yield farming strategies that consistently outperform market benchmarks.",
                avatar: "https://randomuser.me/api/portraits/men/32.jpg",
                status: true,
                stats: {
                    value1: "$12.4M",
                    label1: "TVL Managed",
                    value2: "32%",
                    label2: "APY"
                }
            },
            {
                id: 2,
                name: "Agent Nova",
                title: "Security Specialist",
                bio: "Cybersecurity expert with background in ethical hacking. Conducted security audits for 20+ major DeFi protocols and identified critical vulnerabilities.",
                avatar: "https://randomuser.me/api/portraits/women/44.jpg",
                status: true,
                stats: {
                    value1: "47",
                    label1: "Audits",
                    value2: "100%",
                    label2: "Success Rate"
                }
            },
            {
                id: 3,
                name: "Agent Omega",
                title: "Governance Specialist",
                bio: "Political science PhD with expertise in decentralized governance. Advised multiple DAOs on governance structures and voting mechanisms.",
                avatar: "https://randomuser.me/api/portraits/men/67.jpg",
                status: false,
                stats: {
                    value1: "15",
                    label1: "DAOs Advised",
                    value2: "28",
                    label2: "Proposals Passed"
                }
            }
        ];
        try {
            fs.writeFileSync(agentsFile, JSON.stringify(defaultAgents, null, 2));
            console.log('代理人数据文件已创建');
        } catch (error) {
            console.error('创建代理人数据文件失败:', error);
        }
    }

    // 初始化新闻数据
    if (!fs.existsSync(newsFile)) {
        const defaultNews = [
            {
                id: 1,
                day: "15",
                month: "JUN",
                title: "New Liquidity Protocol Launches with $30M TVL",
                content: "HyperSwap, a new automated market maker, has launched on Ethereum with innovative features for concentrated liquidity and reduced impermanent loss.",
                time: "2 hours ago"
            },
            {
                id: 2,
                day: "14",
                month: "JUN",
                title: "Crypto Valley DAO Votes on Expansion Proposal",
                content: "The governing DAO of Crypto Valley has initiated voting on a proposal to expand operations to Layer 2 networks, aiming to reduce gas fees for users.",
                time: "1 day ago"
            },
            {
                id: 3,
                day: "12",
                month: "JUN",
                title: "Security Alert: Phishing Attempts Targeting DeFi Users",
                content: "Agent Nova has issued a security alert about sophisticated phishing attempts targeting DeFi users. Learn how to protect your assets.",
                time: "3 days ago"
            },
            {
                id: 4,
                day: "10",
                month: "JUN",
                title: "Weekly Market Analysis: DeFi Tokens Show Strong Recovery",
                content: "Agent Alpha's weekly market analysis shows DeFi tokens outperforming the broader crypto market, with lending protocols leading the recovery.",
                time: "5 days ago"
            }
        ];
        try {
            fs.writeFileSync(newsFile, JSON.stringify(defaultNews, null, 2));
            console.log('新闻数据文件已创建');
        } catch (error) {
            console.error('创建新闻数据文件失败:', error);
        }
    }

    // 初始化设置数据
    if (!fs.existsSync(settingsFile)) {
        const defaultSettings = {
            title: "Crypto Valley: DeFi Utopia",
            description: "探索去中心化金融的未来世界，与顶尖加密货币专家一起导航DeFi生态系统。",
            primaryColor: "#6c5ce7",
            logo: ""
        };
        try {
            fs.writeFileSync(settingsFile, JSON.stringify(defaultSettings, null, 2));
            console.log('设置数据文件已创建');
        } catch (error) {
            console.error('创建设置数据文件失败:', error);
        }
    }

    // 初始化对话数据
    if (!fs.existsSync(talksFile)) {
        const defaultTalks = [
            {
                id: 1,
                title: "DeFi流动性挖矿策略讨论",
                date: "2023-06-18",
                participants: [1, 2], // 代理人ID
                messages: [
                    {
                        senderId: 1,
                        content: "我最近在研究一种新的流动性挖矿策略，利用多链部署来分散风险。你对此有什么看法？",
                        time: "10:15 AM"
                    },
                    {
                        senderId: 2,
                        content: "多链策略很有前景，但你需要考虑跨链桥的安全风险。去年有多个桥被黑客攻击，造成了巨大损失。",
                        time: "10:18 AM"
                    },
                    {
                        senderId: 1,
                        content: "确实，我计划只使用经过多重审计的成熟桥接方案，如Wormhole或Axelar。你认为这些足够安全吗？",
                        time: "10:22 AM"
                    },
                    {
                        senderId: 2,
                        content: "即使是经过审计的桥也存在风险。我建议将资金分散在多个桥上，并设置风险敞口上限。另外，考虑使用原生跨链协议而不是传统桥。",
                        time: "10:25 AM"
                    }
                ],
                tags: ["DeFi", "流动性挖矿", "跨链"]
            },
            {
                id: 2,
                title: "DAO治理模型优化",
                date: "2023-06-15",
                participants: [3, 1],
                messages: [
                    {
                        senderId: 3,
                        content: "我们的DAO面临投票参与率低的问题，你有什么建议来提高社区参与度？",
                        time: "2:30 PM"
                    },
                    {
                        senderId: 1,
                        content: "投票参与率低是大多数DAO的共同问题。你们可以考虑实施投票激励机制，比如为参与投票的成员提供额外的代币奖励。",
                        time: "2:33 PM"
                    },
                    {
                        senderId: 3,
                        content: "代币激励听起来不错，但我担心这会导致无意义的投票，人们只为了奖励而不是真正思考提案。",
                        time: "2:36 PM"
                    },
                    {
                        senderId: 1,
                        content: "这是个合理的担忧。另一种方法是实施分级投票系统，重要提案需要更高的参与率。你们还可以尝试改进提案展示方式，使其更容易理解，并提前在社区中进行充分讨论。",
                        time: "2:40 PM"
                    }
                ],
                tags: ["DAO", "治理", "社区参与"]
            }
        ];
        try {
            fs.writeFileSync(talksFile, JSON.stringify(defaultTalks, null, 2));
            console.log('对话数据文件已创建');
        } catch (error) {
            console.error('创建对话数据文件失败:', error);
        }
    }
}

// API路由
// 获取所有代理人
app.get('/api/agents', (req, res) => {
    try {
        const agents = JSON.parse(fs.readFileSync(agentsFile));
        res.json(agents);
    } catch (error) {
        res.status(500).json({ error: '无法读取代理人数据' });
    }
});

// 获取单个代理人
app.get('/api/agents/:id', (req, res) => {
    try {
        const agents = JSON.parse(fs.readFileSync(agentsFile));
        const agent = agents.find(a => a.id === parseInt(req.params.id));
        
        if (agent) {
            res.json(agent);
        } else {
            res.status(404).json({ error: '找不到该代理人' });
        }
    } catch (error) {
        res.status(500).json({ error: '无法读取代理人数据' });
    }
});

// 添加代理人
app.post('/api/agents', (req, res) => {
    try {
        const agents = JSON.parse(fs.readFileSync(agentsFile));
        const newAgent = req.body;
        
        // 生成新ID
        newAgent.id = agents.length > 0 ? Math.max(...agents.map(a => a.id)) + 1 : 1;
        
        agents.push(newAgent);
        fs.writeFileSync(agentsFile, JSON.stringify(agents, null, 2));
        
        res.status(201).json(newAgent);
    } catch (error) {
        res.status(500).json({ error: '无法添加代理人' });
    }
});

// 更新代理人
app.put('/api/agents/:id', (req, res) => {
    try {
        const agents = JSON.parse(fs.readFileSync(agentsFile));
        const id = parseInt(req.params.id);
        const updatedAgent = req.body;
        
        const index = agents.findIndex(a => a.id === id);
        
        if (index !== -1) {
            agents[index] = { ...agents[index], ...updatedAgent, id };
            fs.writeFileSync(agentsFile, JSON.stringify(agents, null, 2));
            res.json(agents[index]);
        } else {
            res.status(404).json({ error: '找不到该代理人' });
        }
    } catch (error) {
        res.status(500).json({ error: '无法更新代理人' });
    }
});

// 删除代理人
app.delete('/api/agents/:id', (req, res) => {
    try {
        const agents = JSON.parse(fs.readFileSync(agentsFile));
        const id = parseInt(req.params.id);
        
        const filteredAgents = agents.filter(a => a.id !== id);
        
        if (filteredAgents.length < agents.length) {
            fs.writeFileSync(agentsFile, JSON.stringify(filteredAgents, null, 2));
            res.json({ message: '代理人已删除' });
        } else {
            res.status(404).json({ error: '找不到该代理人' });
        }
    } catch (error) {
        res.status(500).json({ error: '无法删除代理人' });
    }
});

// 新闻API路由
// 获取所有新闻
app.get('/api/news', (req, res) => {
    try {
        const news = JSON.parse(fs.readFileSync(newsFile));
        res.json(news);
    } catch (error) {
        res.status(500).json({ error: '无法读取新闻数据' });
    }
});

// 获取单个新闻
app.get('/api/news/:id', (req, res) => {
    try {
        const news = JSON.parse(fs.readFileSync(newsFile));
        const item = news.find(n => n.id === parseInt(req.params.id));
        
        if (item) {
            res.json(item);
        } else {
            res.status(404).json({ error: '找不到该新闻' });
        }
    } catch (error) {
        res.status(500).json({ error: '无法读取新闻数据' });
    }
});

// 添加新闻
app.post('/api/news', (req, res) => {
    try {
        const news = JSON.parse(fs.readFileSync(newsFile));
        const newItem = req.body;
        
        // 生成新ID
        newItem.id = news.length > 0 ? Math.max(...news.map(n => n.id)) + 1 : 1;
        
        news.push(newItem);
        fs.writeFileSync(newsFile, JSON.stringify(news, null, 2));
        
        res.status(201).json(newItem);
    } catch (error) {
        res.status(500).json({ error: '无法添加新闻' });
    }
});

// 更新新闻
app.put('/api/news/:id', (req, res) => {
    try {
        const news = JSON.parse(fs.readFileSync(newsFile));
        const id = parseInt(req.params.id);
        const updatedItem = req.body;
        
        const index = news.findIndex(n => n.id === id);
        
        if (index !== -1) {
            news[index] = { ...news[index], ...updatedItem, id };
            fs.writeFileSync(newsFile, JSON.stringify(news, null, 2));
            res.json(news[index]);
        } else {
            res.status(404).json({ error: '找不到该新闻' });
        }
    } catch (error) {
        res.status(500).json({ error: '无法更新新闻' });
    }
});

// 删除新闻
app.delete('/api/news/:id', (req, res) => {
    try {
        const news = JSON.parse(fs.readFileSync(newsFile));
        const id = parseInt(req.params.id);
        
        const filteredNews = news.filter(n => n.id !== id);
        
        if (filteredNews.length < news.length) {
            fs.writeFileSync(newsFile, JSON.stringify(filteredNews, null, 2));
            res.json({ message: '新闻已删除' });
        } else {
            res.status(404).json({ error: '找不到该新闻' });
        }
    } catch (error) {
        res.status(500).json({ error: '无法删除新闻' });
    }
});

// 设置API路由
app.get('/api/settings', (req, res) => {
    try {
        const settings = JSON.parse(fs.readFileSync(settingsFile));
        res.json(settings);
    } catch (error) {
        res.status(500).json({ error: '无法读取设置数据' });
    }
});

app.put('/api/settings', (req, res) => {
    try {
        const settings = JSON.parse(fs.readFileSync(settingsFile));
        const updatedSettings = { ...settings, ...req.body };
        
        fs.writeFileSync(settingsFile, JSON.stringify(updatedSettings, null, 2));
        res.json(updatedSettings);
    } catch (error) {
        res.status(500).json({ error: '无法更新设置' });
    }
});

// Talks API路由
// 获取所有对话
app.get('/api/talks', (req, res) => {
    try {
        const talks = JSON.parse(fs.readFileSync(talksFile));
        res.json(talks);
    } catch (error) {
        res.status(500).json({ error: '无法读取对话数据' });
    }
});

// 获取单个对话
app.get('/api/talks/:id', (req, res) => {
    try {
        const talks = JSON.parse(fs.readFileSync(talksFile));
        const talk = talks.find(t => t.id === parseInt(req.params.id));
        
        if (talk) {
            res.json(talk);
        } else {
            res.status(404).json({ error: '找不到该对话' });
        }
    } catch (error) {
        res.status(500).json({ error: '无法读取对话数据' });
    }
});

// 添加对话
app.post('/api/talks', (req, res) => {
    try {
        const talks = JSON.parse(fs.readFileSync(talksFile));
        const newTalk = req.body;
        
        // 生成新ID
        newTalk.id = talks.length > 0 ? Math.max(...talks.map(t => t.id)) + 1 : 1;
        
        talks.push(newTalk);
        fs.writeFileSync(talksFile, JSON.stringify(talks, null, 2));
        
        res.status(201).json(newTalk);
    } catch (error) {
        res.status(500).json({ error: '无法添加对话' });
    }
});

// 更新对话
app.put('/api/talks/:id', (req, res) => {
    try {
        const talks = JSON.parse(fs.readFileSync(talksFile));
        const id = parseInt(req.params.id);
        const updatedTalk = req.body;
        
        const index = talks.findIndex(t => t.id === id);
        
        if (index !== -1) {
            talks[index] = { ...talks[index], ...updatedTalk, id };
            fs.writeFileSync(talksFile, JSON.stringify(talks, null, 2));
            res.json(talks[index]);
        } else {
            res.status(404).json({ error: '找不到该对话' });
        }
    } catch (error) {
        res.status(500).json({ error: '无法更新对话' });
    }
});

// 删除对话
app.delete('/api/talks/:id', (req, res) => {
    try {
        const talks = JSON.parse(fs.readFileSync(talksFile));
        const id = parseInt(req.params.id);
        
        const filteredTalks = talks.filter(t => t.id !== id);
        
        if (filteredTalks.length < talks.length) {
            fs.writeFileSync(talksFile, JSON.stringify(filteredTalks, null, 2));
            res.json({ message: '对话已删除' });
        } else {
            res.status(404).json({ error: '找不到该对话' });
        }
    } catch (error) {
        res.status(500).json({ error: '无法删除对话' });
    }
});

// 添加一个路由来提供admin.html文件
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, '../admin.html'));
});

// 添加一个路由来提供talks.html文件
app.get('/talks', (req, res) => {
    res.sendFile(path.join(__dirname, '../talks.html'));
});

// 初始化数据
initDataFiles();

// 启动服务器
startServer(PORT); 