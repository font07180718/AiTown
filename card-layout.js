// 等待页面完全加载
window.addEventListener('load', function() {
    console.log('页面完全加载，开始转换表格为卡片布局...');
    
    // 延迟执行，确保其他脚本已完成
    setTimeout(function() {
        convertTableToCards();
    }, 2000);
    
    // 转换表格为卡片布局
    function convertTableToCards() {
        console.log('执行表格转换函数');
        
        // 查找表格
        const table = document.querySelector('table');
        if (!table) {
            console.log('未找到表格，尝试查找其他元素');
            return;
        }
        
        console.log('找到表格:', table);
        
        // 获取表格数据
        const rows = Array.from(table.querySelectorAll('tbody tr'));
        if (rows.length === 0) {
            console.log('表格中没有数据行');
            return;
        }
        
        console.log('找到数据行:', rows.length);
        
        // 创建卡片容器
        const cardsContainer = document.createElement('div');
        cardsContainer.className = 'talks-grid';
        cardsContainer.style.display = 'grid';
        cardsContainer.style.gridTemplateColumns = 'repeat(auto-fill, minmax(300px, 1fr))';
        cardsContainer.style.gap = '20px';
        cardsContainer.style.marginTop = '20px';
        
        // 遍历表格行，创建卡片
        rows.forEach((row, index) => {
            console.log(`处理第${index+1}行`);
            
            const cells = Array.from(row.querySelectorAll('td'));
            if (cells.length < 3) {
                console.log(`第${index+1}行单元格数量不足，跳过`);
                return;
            }
            
            // 获取数据
            const title = cells[0].textContent.trim();
            const date = cells[1].textContent.trim();
            const viewButton = cells[2].querySelector('button');
            
            console.log(`行数据: 标题=${title}, 日期=${date}, 按钮=${viewButton ? '存在' : '不存在'}`);
            
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
                <div class="button-container"></div>
            `;
            
            // 添加按钮
            if (viewButton) {
                const buttonContainer = card.querySelector('.button-container');
                const newButton = document.createElement('button');
                newButton.textContent = '查看详情';
                newButton.style.backgroundColor = '#6c5ce7';
                newButton.style.color = 'white';
                newButton.style.border = 'none';
                newButton.style.padding = '8px 15px';
                newButton.style.borderRadius = '4px';
                newButton.style.cursor = 'pointer';
                newButton.style.width = '100%';
                
                // 复制原始按钮的点击事件
                newButton.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    viewButton.click();
                });
                
                buttonContainer.appendChild(newButton);
            }
            
            // 添加悬停效果
            card.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-5px)';
                this.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.2)';
            });
            
            card.addEventListener('mouseleave', function() {
                this.style.transform = '';
                this.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
            });
            
            cardsContainer.appendChild(card);
        });
        
        // 替换表格
        if (cardsContainer.children.length > 0) {
            console.log('创建了卡片，准备替换表格');
            table.parentNode.replaceChild(cardsContainer, table);
            console.log('表格已替换为卡片布局');
        } else {
            console.log('没有创建任何卡片，不替换表格');
        }
    }
}); 