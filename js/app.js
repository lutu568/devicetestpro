document.addEventListener('DOMContentLoaded', function() {
    // 全局变量
    let audioContext = null;
    let microphone = null;
    let analyser = null;
    let scriptProcessor = null;
    let audioData = new Uint8Array(0);
    let freqData = new Uint8Array(0);
    let isRecording = false;
    let animationFrame = null;
    let volumeSum = 0;
    let volumeCount = 0;
    let lastUpdate = Date.now();
    let testStartTime = 0;
    let testDuration = 0;
    
    // DOM元素
    const startTestBtn = document.getElementById('startTest');
    const stopTestBtn = document.getElementById('stopTest');
    const micStatusDot = document.querySelector('#micStatus .dot');
    const micStatusText = document.querySelector('#micStatus .status-text');
    const audioVisualizer = document.getElementById('audioVisualizer');
    const freqVisualizer = document.getElementById('frequencyVisualizer');
    const volumeMeter = document.getElementById('volumeMeter');
    const volumeValue = document.getElementById('volumeValue');
    const resultArea = document.getElementById('resultArea');
    const testResults = document.getElementById('testResults');
    const saveResultsBtn = document.getElementById('saveResults');
    const shareResultsBtn = document.getElementById('shareResults');
    const upgradeCta = document.getElementById('upgradeCta');
    
    // 检查是否支持AudioContext
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    
    if (!AudioContext) {
        showError('您的浏览器不支持AudioContext API，请尝试使用Chrome或Firefox的最新版本。');
        return;
    }
    
    // 初始化Canvas
    const audioCtx = audioVisualizer.getContext('2d');
    const freqCtx = freqVisualizer.getContext('2d');
    
    // 设置Canvas
    function setupCanvas() {
        // 设置音频可视化Canvas
        audioCtx.fillStyle = '#f5f5f5';
        audioCtx.fillRect(0, 0, audioVisualizer.width, audioVisualizer.height);
        
        // 设置频率分析Canvas
        freqCtx.fillStyle = '#f5f5f5';
        freqCtx.fillRect(0, 0, freqVisualizer.width, freqVisualizer.height);
    }
    
    // 开始测试按钮事件
    startTestBtn.addEventListener('click', function() {
        startMicTest();
    });
    
    // 停止测试按钮事件
    stopTestBtn.addEventListener('click', function() {
        stopMicTest();
    });
    
    // 升级按钮事件
    upgradeCta.addEventListener('click', function() {
        showUpgradeModal();
    });
    
    // 保存结果按钮事件
    saveResultsBtn.addEventListener('click', function() {
        saveResults();
    });
    
    // 分享结果按钮事件
    shareResultsBtn.addEventListener('click', function() {
        shareResults();
    });
    
    // 开始麦克风测试
    async function startMicTest() {
        try {
            // 请求麦克风权限
            updateStatus('requesting', '正在请求麦克风权限...');
            
            // 创建AudioContext
            audioContext = new AudioContext();
            
            // 获取麦克风流
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
            
            // 连接麦克风到AudioContext
            microphone = audioContext.createMediaStreamSource(stream);
            
            // 创建分析器节点
            analyser = audioContext.createAnalyser();
            analyser.fftSize = 2048;
            analyser.smoothingTimeConstant = 0.8;
            
            // 创建处理节点
            scriptProcessor = audioContext.createScriptProcessor(4096, 1, 1);
            
            // 连接节点: 麦克风 -> 分析器 -> 处理器 -> 目标
            microphone.connect(analyser);
            analyser.connect(scriptProcessor);
            scriptProcessor.connect(audioContext.destination);
            
            // 创建数据数组
            audioData = new Uint8Array(analyser.fftSize);
            freqData = new Uint8Array(analyser.frequencyBinCount);
            
            // 音频处理事件
            scriptProcessor.onaudioprocess = handleAudioProcess;
            
            // 开始绘制
            isRecording = true;
            testStartTime = Date.now();
            drawVisualizer();
            
            // 更新状态
            updateStatus('success', '麦克风已连接并正常工作');
            
            // 更新UI
            startTestBtn.disabled = true;
            stopTestBtn.disabled = false;
            
        } catch (error) {
            console.error('麦克风测试错误:', error);
            let errorMsg = '无法访问麦克风。';
            
            if (error.name === 'NotAllowedError') {
                errorMsg = '麦克风访问被拒绝。请在浏览器设置中允许麦克风访问。';
            } else if (error.name === 'NotFoundError') {
                errorMsg = '未找到麦克风设备。请确保您的麦克风已正确连接。';
            }
            
            showError(errorMsg);
        }
    }
    
    // 停止麦克风测试
    function stopMicTest() {
        if (isRecording) {
            isRecording = false;
            
            // 计算测试时长
            testDuration = (Date.now() - testStartTime) / 1000;
            
            // 停止并断开连接
            if (scriptProcessor) {
                scriptProcessor.onaudioprocess = null;
                scriptProcessor.disconnect();
            }
            
            if (analyser) {
                analyser.disconnect();
            }
            
            if (microphone) {
                microphone.disconnect();
                // 停止所有tracks
                microphone.mediaStream.getTracks().forEach(track => track.stop());
            }
            
            if (audioContext) {
                if (audioContext.state !== 'closed') {
                    audioContext.close();
                }
            }
            
            if (animationFrame) {
                cancelAnimationFrame(animationFrame);
            }
            
            // 显示测试结果
            showTestResults();
            
            // 更新UI
            startTestBtn.disabled = false;
            stopTestBtn.disabled = true;
            updateStatus('waiting', '测试已停止');
        }
    }
    
    // 处理音频数据
    function handleAudioProcess(event) {
        // 获取音频数据
        analyser.getByteTimeDomainData(audioData);
        analyser.getByteFrequencyData(freqData);
        
        // 计算音量
        let sum = 0;
        let max = 0;
        
        for (let i = 0; i < audioData.length; i++) {
            const value = (audioData[i] - 128) / 128;
            sum += value * value;
            if (Math.abs(value) > max) {
                max = Math.abs(value);
            }
        }
        
        const rms = Math.sqrt(sum / audioData.length);
        const db = 20 * Math.log10(rms) + 60; // 添加60dB使值始终为正
        
        // 累计音量数据用于平均值
        volumeSum += db;
        volumeCount++;
        
        // 更新音量指示器
        updateVolumeIndicator(db);
    }
    
    // 绘制可视化效果
    function drawVisualizer() {
        if (!isRecording) return;
        
        // 清除画布
        audioCtx.clearRect(0, 0, audioVisualizer.width, audioVisualizer.height);
        freqCtx.clearRect(0, 0, freqVisualizer.width, freqVisualizer.height);
        
        // 绘制波形
        audioCtx.lineWidth = 2;
        audioCtx.strokeStyle = '#2196F3';
        audioCtx.beginPath();
        
        const sliceWidth = audioVisualizer.width / audioData.length;
        let x = 0;
        
        for (let i = 0; i < audioData.length; i++) {
            const v = audioData[i] / 128.0;
            const y = v * audioVisualizer.height / 2;
            
            if (i === 0) {
                audioCtx.moveTo(x, y);
            } else {
                audioCtx.lineTo(x, y);
            }
            
            x += sliceWidth;
        }
        
        audioCtx.lineTo(audioVisualizer.width, audioVisualizer.height / 2);
        audioCtx.stroke();
        
        // 绘制频谱
        const barWidth = (freqVisualizer.width / freqData.length) * 2.5;
        let barHeight;
        let barX = 0;
        
        for (let i = 0; i < freqData.length; i++) {
            barHeight = (freqData[i] / 255) * freqVisualizer.height;
            
            // 根据频率设置颜色
            const hue = i / freqData.length * 360;
            freqCtx.fillStyle = `hsl(${hue}, 90%, 50%)`;
            
            freqCtx.fillRect(barX, freqVisualizer.height - barHeight, barWidth, barHeight);
            barX += barWidth + 1;
            
            // 只绘制部分频率数据以适应画布宽度
            if (barX > freqVisualizer.width) break;
        }
        
        // 循环绘制
        animationFrame = requestAnimationFrame(drawVisualizer);
    }
    
    // 更新音量指示器
    function updateVolumeIndicator(db) {
        // 将dB值转换为百分比 (0-100)
        // 假设有效范围在 -10 到 30 dB (已添加60dB偏移)
        const minDB = 50; // (-10 + 60)
        const maxDB = 85; // (25 + 60)
        let percent = Math.max(0, Math.min(100, (db - minDB) / (maxDB - minDB) * 100));
        
        // 设置音量计颜色
        let color = '#4CAF50'; // 绿色适中音量
        
        if (percent < 30) {
            color = '#FFC107'; // 黄色低音量
        } else if (percent > 80) {
            color = '#F44336'; // 红色高音量
        }
        
        // 更新UI
        volumeMeter.style.width = percent + '%';
        volumeMeter.style.backgroundColor = color;
        volumeValue.textContent = db.toFixed(1) + ' dB';
    }
    
    // 更新连接状态
    function updateStatus(type, message) {
        // 移除所有状态类
        micStatusDot.classList.remove('waiting', 'success', 'error', 'requesting');
        
        // 添加当前状态类
        micStatusDot.classList.add(type);
        
        // 更新状态文本
        micStatusText.textContent = message;
    }
    
    // 显示错误
    function showError(message) {
        updateStatus('error', message);
        startTestBtn.disabled = false;
        stopTestBtn.disabled = true;
    }
    
    // 显示测试结果
    function showTestResults() {
        // 计算平均音量
        const avgVolume = volumeCount > 0 ? volumeSum / volumeCount : 0;
        
        // 分析结果
        let qualityText = '良好';
        let recommendations = [];
        
        if (avgVolume < 55) {
            qualityText = '较弱';
            recommendations.push('麦克风音量偏低。请尝试在系统设置中调高麦克风增益，或将麦克风靠近声源。');
        } else if (avgVolume > 80) {
            qualityText = '过强';
            recommendations.push('麦克风音量偏高，可能导致声音失真。请尝试在系统设置中调低麦克风增益，或将麦克风远离声源。');
        }
        
        if (testDuration < 5) {
            recommendations.push('测试时间过短，结果可能不准确。建议进行至少10秒以上的测试以获得更准确的结果。');
        }
        
        // 构建结果HTML
        let resultHTML = `
            <div class="result-section">
                <div class="result-header">测试摘要</div>
                <div class="result-item">
                    <div class="label">测试时长</div>
                    <div class="value">${testDuration.toFixed(1)}秒</div>
                </div>
                <div class="result-item">
                    <div class="label">平均音量</div>
                    <div class="value">${avgVolume.toFixed(1)} dB</div>
                </div>
                <div class="result-item">
                    <div class="label">音量质量</div>
                    <div class="value">${qualityText}</div>
                </div>
            </div>
        `;
        
        if (recommendations.length > 0) {
            resultHTML += `
                <div class="result-section">
                    <div class="result-header">建议</div>
                    <ul class="recommendations-list">
                        ${recommendations.map(rec => `<li>${rec}</li>`).join('')}
                    </ul>
                </div>
            `;
        }
        
        // 更新结果区域
        testResults.innerHTML = resultHTML;
        resultArea.style.display = 'block';
    }
    
    // 保存测试结果
    function saveResults() {
        alert('测试结果保存功能将在专业版中提供。');
    }
    
    // 分享测试结果
    function shareResults() {
        alert('测试结果分享功能将在专业版中提供。');
    }
    
    // 显示升级模态框
    function showUpgradeModal() {
        alert('感谢您对我们专业版的兴趣！专业版正在开发中，敬请期待。');
    }
    
    // 初始化设置
    setupCanvas();
}); 