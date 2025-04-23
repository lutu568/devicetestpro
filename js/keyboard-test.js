// 键盘测试应用主类
class KeyboardTester {
    constructor() {
        // 状态变量
        this.isTestActive = false;
        this.testedKeys = new Set();
        this.keyLog = [];
        this.startTime = null;
        this.testDuration = 0;
        this.consecutiveKeysPressed = 0;
        this.maxConsecutiveKeys = 0;
        
        // DOM元素
        this.statusDot = document.querySelector('.dot');
        this.statusText = document.querySelector('.status-text');
        this.progressInfo = document.querySelector('.progress-info');
        this.keyInfoValues = {
            lastKey: document.querySelector('.last-key-value'),
            keyCode: document.querySelector('.key-code-value'),
            keyName: document.querySelector('.key-name-value'),
            totalTested: document.querySelector('.total-tested-value')
        };
        this.resultSummary = document.querySelector('.result-summary');
        
        // 键盘元素
        this.allKeys = document.querySelectorAll('.key');
        this.totalKeys = this.allKeys.length;
        
        // 按钮事件
        this.startButton = document.getElementById('start-test');
        this.saveButton = document.getElementById('save-results');
        this.copyButton = document.getElementById('copy-results');
        this.printButton = document.getElementById('print-results');
        this.resetButton = document.getElementById('reset-test');
        
        // 初始化
        this.init();
    }
    
    // 初始化方法
    init() {
        // 设置初始界面
        this.updateKeyInfo('', '', '', 0);
        this.updateStatusDisplay(false);
        
        // 事件监听
        document.addEventListener('keydown', this.handleKeyDown.bind(this));
        document.addEventListener('keyup', this.handleKeyUp.bind(this));
        
        // 虚拟键盘点击事件
        this.allKeys.forEach(key => {
            key.addEventListener('click', () => {
                const keyCode = key.getAttribute('data-keycode');
                if (keyCode) {
                    this.simulateKeyPress(keyCode);
                }
            });
        });
        
        // 按钮事件监听
        this.startButton.addEventListener('click', this.toggleTest.bind(this));
        this.saveButton.addEventListener('click', this.saveResults.bind(this));
        this.copyButton.addEventListener('click', this.copyResults.bind(this));
        this.printButton.addEventListener('click', this.printResults.bind(this));
        this.resetButton.addEventListener('click', this.resetTest.bind(this));
        
        // 语言选择器
        const languageSelector = document.getElementById('language-selector');
        if (languageSelector) {
            languageSelector.addEventListener('change', (e) => {
                this.changeLanguage(e.target.value);
            });
        }
    }
    
    // 处理按键按下事件
    handleKeyDown(event) {
        if (!this.isTestActive) return;
        
        const keyCode = event.keyCode || event.which;
        const keyName = event.key;
        
        // 寻找与keyCode匹配的按键元素
        const keyElement = document.querySelector(`.key[data-keycode="${keyCode}"]`);
        
        if (keyElement) {
            keyElement.classList.add('pressed');
            
            // 如果该键尚未测试过，则标记为已测试
            if (!this.testedKeys.has(keyCode)) {
                this.testedKeys.add(keyCode);
                keyElement.classList.add('tested');
                
                // 记录按键事件
                this.keyLog.push({
                    keyCode: keyCode,
                    keyName: keyName,
                    timestamp: new Date().getTime()
                });
                
                // 更新连续按键计数
                this.consecutiveKeysPressed++;
                this.maxConsecutiveKeys = Math.max(this.maxConsecutiveKeys, this.consecutiveKeysPressed);
            }
        }
        
        // 更新界面信息
        this.updateKeyInfo(
            keyName,
            keyCode,
            this.getKeyNameForDisplay(keyName, keyCode),
            this.testedKeys.size
        );
        
        // 更新进度信息
        this.updateProgressInfo();
    }
    
    // 处理按键释放事件
    handleKeyUp(event) {
        const keyCode = event.keyCode || event.which;
        const keyElement = document.querySelector(`.key[data-keycode="${keyCode}"]`);
        
        if (keyElement) {
            keyElement.classList.remove('pressed');
        }
        
        // 重置连续按键计数
        this.consecutiveKeysPressed = 0;
    }
    
    // 模拟键盘按下（用于点击虚拟键盘）
    simulateKeyPress(keyCode) {
        if (!this.isTestActive) return;
        
        keyCode = parseInt(keyCode);
        const keyElement = document.querySelector(`.key[data-keycode="${keyCode}"]`);
        let keyName = keyElement.textContent.trim();
        
        // 特殊键名称处理
        if (keyName === '') {
            keyName = 'Space';
        } else if (keyName.length > 10) {
            keyName = keyElement.getAttribute('data-key-name') || keyName;
        }
        
        // 添加按下效果
        keyElement.classList.add('pressed');
        setTimeout(() => {
            keyElement.classList.remove('pressed');
        }, 200);
        
        // 如果该键尚未测试过，则标记为已测试
        if (!this.testedKeys.has(keyCode)) {
            this.testedKeys.add(keyCode);
            keyElement.classList.add('tested');
            
            // 记录按键事件
            this.keyLog.push({
                keyCode: keyCode,
                keyName: keyName,
                timestamp: new Date().getTime()
            });
        }
        
        // 更新界面信息
        this.updateKeyInfo(
            keyName,
            keyCode,
            this.getKeyNameForDisplay(keyName, keyCode),
            this.testedKeys.size
        );
        
        // 更新进度信息
        this.updateProgressInfo();
    }
    
    // 开始/停止测试
    toggleTest() {
        this.isTestActive = !this.isTestActive;
        
        if (this.isTestActive) {
            // 开始测试
            this.startTime = new Date().getTime();
            this.startButton.textContent = '停止测试';
            this.startButton.classList.add('active');
        } else {
            // 停止测试
            const endTime = new Date().getTime();
            this.testDuration = (endTime - this.startTime) / 1000; // 转换为秒
            this.startButton.textContent = '开始测试';
            this.startButton.classList.remove('active');
            
            // 显示测试结果摘要
            this.showTestResults();
        }
        
        this.updateStatusDisplay(this.isTestActive);
    }
    
    // 重置测试
    resetTest() {
        if (this.isTestActive) {
            this.toggleTest(); // 如果测试正在进行，先停止测试
        }
        
        // 重置所有状态
        this.testedKeys = new Set();
        this.keyLog = [];
        this.startTime = null;
        this.testDuration = 0;
        this.maxConsecutiveKeys = 0;
        
        // 重置所有按键的样式
        this.allKeys.forEach(key => {
            key.classList.remove('tested');
            key.classList.remove('pressed');
        });
        
        // 重置界面
        this.updateKeyInfo('', '', '', 0);
        this.updateProgressInfo();
        this.resultSummary.innerHTML = '';
    }
    
    // 更新按键信息显示
    updateKeyInfo(lastKey, keyCode, keyName, totalTested) {
        this.keyInfoValues.lastKey.textContent = lastKey || '-';
        this.keyInfoValues.keyCode.textContent = keyCode || '-';
        this.keyInfoValues.keyName.textContent = keyName || '-';
        this.keyInfoValues.totalTested.textContent = totalTested;
    }
    
    // 更新测试状态显示
    updateStatusDisplay(isActive) {
        if (isActive) {
            this.statusDot.classList.add('active');
            this.statusText.textContent = '测试进行中';
        } else {
            this.statusDot.classList.remove('active');
            this.statusText.textContent = '测试未开始';
        }
    }
    
    // 更新进度信息
    updateProgressInfo() {
        const percentage = Math.round((this.testedKeys.size / this.totalKeys) * 100);
        this.progressInfo.textContent = `已测试: ${this.testedKeys.size}/${this.totalKeys} 键 (${percentage}%)`;
    }
    
    // 显示测试结果
    showTestResults() {
        // 计算测试结果数据
        const testedCount = this.testedKeys.size;
        const percentage = Math.round((testedCount / this.totalKeys) * 100);
        const timeStr = this.testDuration.toFixed(1);
        
        // 创建结果摘要
        let resultHTML = `
            <p>测试完成! 您已测试了 <span>${testedCount}</span> 个按键, 
            占总数的 <span>${percentage}%</span>, 
            耗时 <span>${timeStr}</span> 秒.
            `;
        
        if (this.maxConsecutiveKeys > 5) {
            resultHTML += `最大连续按键次数: <span>${this.maxConsecutiveKeys}</span>.</p>`;
        } else {
            resultHTML += `</p>`;
        }
        
        // 添加未测试的键
        if (testedCount < this.totalKeys) {
            const untestedKeys = [];
            this.allKeys.forEach(key => {
                const keyCode = parseInt(key.getAttribute('data-keycode'));
                if (!this.testedKeys.has(keyCode)) {
                    let keyText = key.textContent.trim();
                    if (keyText === '') {
                        keyText = key.getAttribute('data-key-name') || 'Space';
                    }
                    if (keyText && keyText.length < 8) {
                        untestedKeys.push(keyText);
                    }
                }
            });
            
            if (untestedKeys.length > 0 && untestedKeys.length <= 15) {
                resultHTML += `<p>未测试的按键: <span>${untestedKeys.join(', ')}</span></p>`;
            }
        }
        
        this.resultSummary.innerHTML = resultHTML;
    }
    
    // 保存测试结果
    saveResults() {
        if (this.keyLog.length === 0) {
            alert('没有可保存的测试结果');
            return;
        }
        
        const results = this.generateResultsReport();
        const blob = new Blob([results], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        
        a.href = url;
        a.download = `keyboard-test-results-${new Date().toISOString().slice(0, 10)}.txt`;
        document.body.appendChild(a);
        a.click();
        
        setTimeout(() => {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }, 100);
    }
    
    // 复制测试结果到剪贴板
    copyResults() {
        if (this.keyLog.length === 0) {
            alert('没有可复制的测试结果');
            return;
        }
        
        const results = this.generateResultsReport();
        
        navigator.clipboard.writeText(results).then(() => {
            alert('测试结果已复制到剪贴板');
        }).catch(err => {
            console.error('复制失败:', err);
            alert('复制失败，请手动复制');
        });
    }
    
    // 打印测试结果
    printResults() {
        if (this.keyLog.length === 0) {
            alert('没有可打印的测试结果');
            return;
        }
        
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
            <head>
                <title>键盘测试结果</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; }
                    h1 { color: #3498db; }
                    .container { max-width: 800px; margin: 0 auto; }
                    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                    th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
                    th { background-color: #f2f2f2; }
                    .summary { background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
                    .footer { margin-top: 30px; font-size: 12px; color: #777; text-align: center; }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>键盘测试结果</h1>
                    <div class="summary">
                        ${this.resultSummary.innerHTML}
                    </div>
                    <h2>测试详情</h2>
                    <table>
                        <tr>
                            <th>按键码</th>
                            <th>按键名称</th>
                            <th>时间</th>
                        </tr>
                        ${this.keyLog.map(log => `
                            <tr>
                                <td>${log.keyCode}</td>
                                <td>${log.keyName}</td>
                                <td>${new Date(log.timestamp).toLocaleTimeString()}</td>
                            </tr>
                        `).join('')}
                    </table>
                    <div class="footer">
                        <p>测试时间: ${new Date().toLocaleString()}</p>
                        <p>键盘测试工具 v1.0</p>
                    </div>
                </div>
            </body>
            </html>
        `);
        
        printWindow.document.close();
        printWindow.focus();
        
        setTimeout(() => {
            printWindow.print();
        }, 500);
    }
    
    // 生成测试结果报告
    generateResultsReport() {
        // 生成基本信息
        const testedCount = this.testedKeys.size;
        const percentage = Math.round((testedCount / this.totalKeys) * 100);
        const date = new Date().toLocaleString();
        
        let report = `键盘测试结果报告\n`;
        report += `====================\n\n`;
        report += `测试时间: ${date}\n`;
        report += `测试时长: ${this.testDuration.toFixed(1)}秒\n`;
        report += `测试按键数: ${testedCount}/${this.totalKeys} (${percentage}%)\n`;
        report += `最大连续按键数: ${this.maxConsecutiveKeys}\n\n`;
        
        // 添加未测试的按键
        if (testedCount < this.totalKeys) {
            const untestedKeys = [];
            this.allKeys.forEach(key => {
                const keyCode = parseInt(key.getAttribute('data-keycode'));
                if (!this.testedKeys.has(keyCode)) {
                    let keyText = key.textContent.trim();
                    if (keyText === '') {
                        keyText = key.getAttribute('data-key-name') || 'Space';
                    }
                    if (keyText && keyText.length < 8) {
                        untestedKeys.push(`${keyText}(${keyCode})`);
                    }
                }
            });
            
            if (untestedKeys.length > 0) {
                report += `未测试的按键: ${untestedKeys.join(', ')}\n\n`;
            }
        }
        
        // 添加按键日志
        report += `按键日志:\n`;
        report += `====================\n`;
        report += `键码\t按键名称\t\t时间\n`;
        
        this.keyLog.forEach(log => {
            const time = new Date(log.timestamp).toLocaleTimeString();
            let name = log.keyName;
            // 确保名称列对齐
            if (name.length < 8) {
                name = name + '\t';
            }
            report += `${log.keyCode}\t${name}\t${time}\n`;
        });
        
        return report;
    }
    
    // 获取用于显示的按键名称
    getKeyNameForDisplay(keyName, keyCode) {
        // 特殊按键名称映射
        const specialKeyNames = {
            ' ': 'Space',
            'Control': 'Ctrl',
            'ArrowUp': '↑',
            'ArrowDown': '↓',
            'ArrowLeft': '←',
            'ArrowRight': '→',
            'Enter': 'Enter',
            'Escape': 'Esc',
            'ShiftLeft': 'Shift',
            'ShiftRight': 'Shift',
            'ControlLeft': 'Ctrl',
            'ControlRight': 'Ctrl',
            'AltLeft': 'Alt',
            'AltRight': 'Alt',
            'MetaLeft': 'Win',
            'MetaRight': 'Win',
            'ContextMenu': 'Menu'
        };
        
        // 使用特殊名称映射，如果没有则使用原始名称
        return specialKeyNames[keyName] || keyName;
    }
    
    // 修改UI语言
    changeLanguage(language) {
        // 这里可以实现语言切换逻辑
        console.log(`语言已切换为: ${language}`);
        // 实际项目中，这里应该加载相应的语言文件并替换页面上的文本
    }
}

// 页面加载完成后初始化键盘测试器
document.addEventListener('DOMContentLoaded', () => {
    const keyboardTester = new KeyboardTester();
}); 