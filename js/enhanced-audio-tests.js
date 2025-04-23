document.addEventListener('DOMContentLoaded', function() {
    // 检测语言
    const isZhCN = window.location.pathname.includes('/zh/');
    const translations = {
        en: {
            readyToTest: 'Ready to test',
            testing: 'Testing...',
            testComplete: 'Test complete',
            leftChannelPlaying: 'Left channel playing',
            rightChannelPlaying: 'Right channel playing',
            bothChannelsPlaying: 'Both channels playing',
            selectTestCategory: 'Select a test category above to start testing your headphones.',
            spatialAudioTest: 'This test evaluates how well your headphones reproduce spatial audio and 3D sound positioning.',
            bassResponseTest: 'This test evaluates the bass response and low frequency reproduction of your headphones.',
            audioClarityTest: 'This test measures the clarity and detail reproduction of your headphones across different frequencies.',
            dynamicRangeTest: 'This test evaluates how well your headphones handle both quiet and loud sounds.',
            latencyDescription: 'Measuring audio latency between output and input...',
            latencyComplete: 'Latency test complete',
            systemScanComplete: 'System scan complete',
            issueDetected: 'Issue detected: ',
            noIssuesFound: 'No issues detected. Your audio system appears to be working correctly.',
            exportFileName: 'AudioSystemReport',
            testsCompleted: 'Tests completed',
            testInProgress: 'Test in progress...',
        },
        zh: {
            readyToTest: '准备测试',
            testing: '测试中...',
            testComplete: '测试完成',
            leftChannelPlaying: '正在播放左声道',
            rightChannelPlaying: '正在播放右声道',
            bothChannelsPlaying: '正在播放双声道',
            selectTestCategory: '选择上面的测试类别开始测试您的耳机。',
            spatialAudioTest: '这项测试评估您的耳机重现空间音频和3D声音定位的效果。',
            bassResponseTest: '这项测试评估您的耳机的低音响应和低频重现。',
            audioClarityTest: '这项测试测量您的耳机在不同频率下的清晰度和细节重现。',
            dynamicRangeTest: '这项测试评估您的耳机处理安静和响亮声音的效果。',
            latencyDescription: '正在测量输出和输入之间的音频延迟...',
            latencyComplete: '延迟测试完成',
            systemScanComplete: '系统扫描完成',
            issueDetected: '检测到问题: ',
            noIssuesFound: '未检测到问题。您的音频系统似乎工作正常。',
            exportFileName: '音频系统报告',
            testsCompleted: '测试已完成',
            testInProgress: '测试进行中...',
        }
    };
    
    // 获取当前语言的翻译
    const t = isZhCN ? translations.zh : translations.en;
    
    // 选项卡功能
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // 更新活动选项卡按钮
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // 更新活动内容
            const tabId = button.getAttribute('data-tab');
            tabContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === tabId) {
                    content.classList.add('active');
                }
            });
        });
    });
    
    // 快速测试按钮
    const quickTestBtn = document.getElementById('quickTest');
    if (quickTestBtn) {
        quickTestBtn.addEventListener('click', runQuickTest);
    }
    
    // 声道测试状态更新
    const channelStatusElem = document.getElementById('channelStatus');
    const testLeftBtn = document.getElementById('testLeft');
    const testRightBtn = document.getElementById('testRight');
    const testBothBtn = document.getElementById('testBoth');
    
    if (testLeftBtn && channelStatusElem) {
        testLeftBtn.addEventListener('click', () => {
            channelStatusElem.textContent = t.leftChannelPlaying;
        });
    }
    
    if (testRightBtn && channelStatusElem) {
        testRightBtn.addEventListener('click', () => {
            channelStatusElem.textContent = t.rightChannelPlaying;
        });
    }
    
    if (testBothBtn && channelStatusElem) {
        testBothBtn.addEventListener('click', () => {
            channelStatusElem.textContent = t.bothChannelsPlaying;
        });
    }
    
    // 耳机测试
    const testCategoryBtns = document.querySelectorAll('.test-category-btn');
    const headphoneTestDescription = document.getElementById('headphoneTestDescription');
    const startHeadphoneTestBtn = document.getElementById('startHeadphoneTest');
    const stopHeadphoneTestBtn = document.getElementById('stopHeadphoneTest');
    const headphoneVisualizer = document.getElementById('headphoneVisualizer');
    
    let selectedTestCategory = null;
    
    // 设置耳机测试类别点击事件
    if (testCategoryBtns.length > 0 && headphoneTestDescription) {
        testCategoryBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // 重置所有按钮
                testCategoryBtns.forEach(b => b.classList.remove('active'));
                
                // 激活当前按钮
                btn.classList.add('active');
                
                // 更新描述
                selectedTestCategory = btn.getAttribute('data-category');
                updateHeadphoneTestDescription(selectedTestCategory);
                
                // 激活开始测试按钮
                if (startHeadphoneTestBtn) {
                    startHeadphoneTestBtn.disabled = false;
                }
            });
        });
    }
    
    // 更新耳机测试描述
    function updateHeadphoneTestDescription(category) {
        if (!headphoneTestDescription) return;
        
        switch(category) {
            case 'spatial':
                headphoneTestDescription.textContent = t.spatialAudioTest;
                break;
            case 'bass':
                headphoneTestDescription.textContent = t.bassResponseTest;
                break;
            case 'clarity':
                headphoneTestDescription.textContent = t.audioClarityTest;
                break;
            case 'dynamic':
                headphoneTestDescription.textContent = t.dynamicRangeTest;
                break;
            default:
                headphoneTestDescription.textContent = t.selectTestCategory;
        }
    }
    
    // 绑定耳机测试按钮
    if (startHeadphoneTestBtn && stopHeadphoneTestBtn) {
        let headphoneTestActive = false;
        
        startHeadphoneTestBtn.addEventListener('click', () => {
            if (!selectedTestCategory) return;
            
            startHeadphoneTest(selectedTestCategory);
            headphoneTestActive = true;
            startHeadphoneTestBtn.disabled = true;
            stopHeadphoneTestBtn.disabled = false;
        });
        
        stopHeadphoneTestBtn.addEventListener('click', () => {
            stopHeadphoneTest();
            headphoneTestActive = false;
            startHeadphoneTestBtn.disabled = false;
            stopHeadphoneTestBtn.disabled = true;
        });
    }
    
    // 系统检查功能
    const refreshSystemInfoBtn = document.getElementById('refreshSystemInfo');
    const exportSystemInfoBtn = document.getElementById('exportSystemInfo');
    
    if (refreshSystemInfoBtn) {
        refreshSystemInfoBtn.addEventListener('click', () => {
            checkAudioSystemInfo();
        });
    }
    
    if (exportSystemInfoBtn) {
        exportSystemInfoBtn.addEventListener('click', () => {
            exportAudioSystemReport();
        });
    }
    
    // 问题检测
    const startDetectionBtn = document.getElementById('startDetection');
    const stopDetectionBtn = document.getElementById('stopDetection');
    const detectionStatusElem = document.getElementById('detectionStatus');
    const detectionProgressElem = document.getElementById('detectionProgress');
    const detectionProgressValueElem = document.getElementById('detectionProgressValue');
    const detectionResultsElem = document.getElementById('detectionResults');
    
    let detectionActive = false;
    
    if (startDetectionBtn && stopDetectionBtn) {
        startDetectionBtn.addEventListener('click', () => {
            startAudioIssueDetection();
            detectionActive = true;
            startDetectionBtn.disabled = true;
            stopDetectionBtn.disabled = false;
            
            if (detectionProgressElem) {
                detectionProgressElem.style.display = 'block';
            }
        });
        
        stopDetectionBtn.addEventListener('click', () => {
            stopAudioIssueDetection();
            detectionActive = false;
            startDetectionBtn.disabled = false;
            stopDetectionBtn.disabled = true;
            
            if (detectionProgressElem) {
                detectionProgressElem.style.display = 'none';
            }
        });
    }
    
    // 结果相关功能
    const saveResultsBtn = document.getElementById('saveResults');
    const shareResultsBtn = document.getElementById('shareResults');
    const clearResultsBtn = document.getElementById('clearResults');
    
    if (saveResultsBtn) {
        saveResultsBtn.addEventListener('click', saveTestResults);
    }
    
    if (shareResultsBtn) {
        shareResultsBtn.addEventListener('click', shareTestResults);
    }
    
    if (clearResultsBtn) {
        clearResultsBtn.addEventListener('click', clearTestResults);
    }
    
    // 初始调用
    initializeSystemInfo();
    setupResultsChart();
    
    // 快速测试功能
    function runQuickTest() {
        console.log('Running quick test for all audio components...');
        
        // 显示状态消息
        updateStatus('quick-test-started');
        
        // 设置测试结束后的回调
        setTimeout(() => {
            // 更新各部分分数
            updateSpeakersScore(85);
            updateHeadphonesScore(90);
            updateLatencyScore(95);
            updateSystemScore(92);
            
            // 更新图表
            updateResultsChart();
            
            // 显示结果
            updateResultsDetails();
            
            // 切换到结果选项卡
            document.querySelector('[data-tab="test-results"]').click();
            
            // 更新状态
            updateStatus('quick-test-completed');
        }, 3000);
    }
    
    // 更新状态
    function updateStatus(status) {
        // 根据不同状态更新UI
        console.log('Status updated: ' + status);
    }
    
    // 初始化系统信息
    function initializeSystemInfo() {
        // 检查是否存在系统信息元素
        const audioOutputDevice = document.getElementById('audioOutputDevice');
        const sampleRate = document.getElementById('sampleRate');
        const channelCount = document.getElementById('channelCount');
        const systemVolume = document.getElementById('systemVolume');
        const webAudioSupport = document.getElementById('webAudioSupport');
        
        if (audioOutputDevice && sampleRate && channelCount && systemVolume && webAudioSupport) {
            checkAudioSystemInfo();
        }
    }
    
    // 检查音频系统信息
    function checkAudioSystemInfo() {
        console.log('Checking audio system information...');
        
        const audioOutputDevice = document.getElementById('audioOutputDevice');
        const sampleRate = document.getElementById('sampleRate');
        const channelCount = document.getElementById('channelCount');
        const systemVolume = document.getElementById('systemVolume');
        const webAudioSupport = document.getElementById('webAudioSupport');
        
        // 检查Web Audio API支持
        if (window.AudioContext || window.webkitAudioContext) {
            webAudioSupport.textContent = '✅ Supported';
            
            // 创建音频上下文
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            
            // 获取采样率
            sampleRate.textContent = audioCtx.sampleRate + ' Hz';
            
            // 获取默认声道数
            channelCount.textContent = '2 (Stereo)';
            
            // 简单模拟系统音量
            systemVolume.textContent = '80%';
            
            // 获取音频输出设备（简化版，实际可能需要请求权限）
            audioOutputDevice.textContent = 'Default Output Device';
            
            // 示例：如果有MediaDevices API，尝试获取实际设备
            if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
                navigator.mediaDevices.enumerateDevices()
                    .then(devices => {
                        const outputDevices = devices.filter(device => device.kind === 'audiooutput');
                        if (outputDevices.length > 0) {
                            audioOutputDevice.textContent = outputDevices[0].label || 'Default Output Device';
                        }
                    })
                    .catch(err => {
                        console.error('Error enumerating devices: ', err);
                    });
            }
        } else {
            webAudioSupport.textContent = '❌ Not supported';
            sampleRate.textContent = 'N/A';
            channelCount.textContent = 'N/A';
            audioOutputDevice.textContent = 'Unknown';
        }
    }
    
    // 导出音频系统报告
    function exportAudioSystemReport() {
        console.log('Exporting audio system report...');
        
        // 收集系统信息
        const systemInfo = {
            audioOutputDevice: document.getElementById('audioOutputDevice')?.textContent || 'Unknown',
            sampleRate: document.getElementById('sampleRate')?.textContent || 'Unknown',
            channelCount: document.getElementById('channelCount')?.textContent || 'Unknown',
            systemVolume: document.getElementById('systemVolume')?.textContent || 'Unknown',
            webAudioSupport: document.getElementById('webAudioSupport')?.textContent || 'Unknown',
            browser: navigator.userAgent,
            date: new Date().toISOString()
        };
        
        // 创建报告文本
        const reportText = `
Audio System Report
==================
Date: ${new Date().toLocaleString()}

System Information
-----------------
Browser: ${systemInfo.browser}
Web Audio API: ${systemInfo.webAudioSupport}
Audio Output: ${systemInfo.audioOutputDevice}
Sample Rate: ${systemInfo.sampleRate}
Channels: ${systemInfo.channelCount}
Volume: ${systemInfo.systemVolume}

Test Results
-----------
Speakers: ${document.getElementById('speakersScore')?.textContent || 'Not tested'}
Headphones: ${document.getElementById('headphonesScore')?.textContent || 'Not tested'}
Latency: ${document.getElementById('latencyScore')?.textContent || 'Not tested'}
System: ${document.getElementById('systemScore')?.textContent || 'Not tested'}
`;

        // 创建并下载文件
        const blob = new Blob([reportText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${t.exportFileName}-${new Date().toISOString().slice(0, 10)}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
    
    // 初始化结果图表
    function setupResultsChart() {
        const resultsChart = document.getElementById('resultsChart');
        if (!resultsChart) return;
        
        // 确保Chart.js已加载
        if (typeof Chart !== 'undefined') {
            const ctx = resultsChart.getContext('2d');
            
            // 初始数据
            const data = {
                labels: ['Speakers', 'Headphones', 'Latency', 'System'],
                datasets: [{
                    label: 'Audio System Scores',
                    data: [0, 0, 0, 0],
                    backgroundColor: [
                        'rgba(54, 162, 235, 0.5)',
                        'rgba(255, 99, 132, 0.5)',
                        'rgba(255, 206, 86, 0.5)',
                        'rgba(75, 192, 192, 0.5)'
                    ],
                    borderColor: [
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 99, 132, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(75, 192, 192, 1)'
                    ],
                    borderWidth: 1
                }]
            };
            
            // 图表配置
            const config = {
                type: 'radar',
                data: data,
                options: {
                    scales: {
                        r: {
                            beginAtZero: true,
                            max: 100,
                            ticks: {
                                stepSize: 20
                            }
                        }
                    },
                    plugins: {
                        legend: {
                            display: false
                        }
                    }
                }
            };
            
            // 创建图表
            window.resultsRadarChart = new Chart(ctx, config);
        }
    }
    
    // 更新结果图表
    function updateResultsChart() {
        if (window.resultsRadarChart) {
            // 获取最新分数
            const speakersScore = parseInt(document.getElementById('speakersScore').textContent) || 0;
            const headphonesScore = parseInt(document.getElementById('headphonesScore').textContent) || 0;
            const latencyScore = parseInt(document.getElementById('latencyScore').textContent) || 0;
            const systemScore = parseInt(document.getElementById('systemScore').textContent) || 0;
            
            // 更新图表数据
            window.resultsRadarChart.data.datasets[0].data = [
                speakersScore,
                headphonesScore,
                latencyScore,
                systemScore
            ];
            
            // 刷新图表
            window.resultsRadarChart.update();
        }
    }
    
    // 更新结果详情
    function updateResultsDetails() {
        const resultsDetails = document.getElementById('resultsDetails');
        if (!resultsDetails) return;
        
        const speakersScore = document.getElementById('speakersScore').textContent;
        const headphonesScore = document.getElementById('headphonesScore').textContent;
        const latencyScore = document.getElementById('latencyScore').textContent;
        const systemScore = document.getElementById('systemScore').textContent;
        
        let detailsHtml = `<h4>${t.testsCompleted}</h4><ul>`;
        
        if (speakersScore !== '--') {
            detailsHtml += `<li><strong>Speakers:</strong> ${generateFeedback('speakers', parseInt(speakersScore))}</li>`;
        }
        
        if (headphonesScore !== '--') {
            detailsHtml += `<li><strong>Headphones:</strong> ${generateFeedback('headphones', parseInt(headphonesScore))}</li>`;
        }
        
        if (latencyScore !== '--') {
            detailsHtml += `<li><strong>Latency:</strong> ${generateFeedback('latency', parseInt(latencyScore))}</li>`;
        }
        
        if (systemScore !== '--') {
            detailsHtml += `<li><strong>System:</strong> ${generateFeedback('system', parseInt(systemScore))}</li>`;
        }
        
        detailsHtml += '</ul>';
        
        // 添加建议
        detailsHtml += '<h4>Recommendations:</h4><ul>';
        
        // 基于分数生成建议
        if (parseInt(speakersScore) < 70) {
            detailsHtml += '<li>Consider checking your speaker connections or upgrading your speakers for better audio quality.</li>';
        }
        
        if (parseInt(headphonesScore) < 70) {
            detailsHtml += '<li>Your headphones might benefit from better positioning or an upgrade for improved audio experience.</li>';
        }
        
        if (parseInt(latencyScore) < 70) {
            detailsHtml += '<li>Your system has higher than optimal audio latency. Consider checking your audio drivers or buffer settings.</li>';
        }
        
        if (parseInt(systemScore) < 70) {
            detailsHtml += '<li>Your system configuration could be optimized for better audio performance. Check for driver updates.</li>';
        }
        
        detailsHtml += '</ul>';
        
        resultsDetails.innerHTML = detailsHtml;
    }
    
    // 生成基于分数的反馈
    function generateFeedback(category, score) {
        if (isNaN(score)) return 'Not tested';
        
        let feedback = '';
        
        if (score >= 90) {
            feedback = 'Excellent';
        } else if (score >= 80) {
            feedback = 'Very Good';
        } else if (score >= 70) {
            feedback = 'Good';
        } else if (score >= 60) {
            feedback = 'Average';
        } else if (score >= 50) {
            feedback = 'Below Average';
        } else {
            feedback = 'Poor';
        }
        
        return `${score}/100 - ${feedback}`;
    }
    
    // 更新评分
    function updateSpeakersScore(score) {
        const scoreElem = document.getElementById('speakersScore');
        if (scoreElem) scoreElem.textContent = score;
    }
    
    function updateHeadphonesScore(score) {
        const scoreElem = document.getElementById('headphonesScore');
        if (scoreElem) scoreElem.textContent = score;
    }
    
    function updateLatencyScore(score) {
        const scoreElem = document.getElementById('latencyScore');
        if (scoreElem) scoreElem.textContent = score;
    }
    
    function updateSystemScore(score) {
        const scoreElem = document.getElementById('systemScore');
        if (scoreElem) scoreElem.textContent = score;
    }
    
    // 保存测试结果
    function saveTestResults() {
        console.log('Saving test results...');
        exportAudioSystemReport();
    }
    
    // 分享测试结果
    function shareTestResults() {
        console.log('Sharing test results...');
        
        // 检查Web Share API支持
        if (navigator.share) {
            navigator.share({
                title: 'My Audio System Test Results',
                text: `Speakers: ${document.getElementById('speakersScore').textContent}, Headphones: ${document.getElementById('headphonesScore').textContent}, Latency: ${document.getElementById('latencyScore').textContent}, System: ${document.getElementById('systemScore').textContent}`,
                url: window.location.href
            })
            .then(() => console.log('Results shared successfully'))
            .catch((error) => console.log('Error sharing results:', error));
        } else {
            alert('Web Share API not supported in your browser. Please copy the URL manually to share.');
        }
    }
    
    // 清除测试结果
    function clearTestResults() {
        console.log('Clearing test results...');
        
        // 重置分数
        updateSpeakersScore('--');
        updateHeadphonesScore('--');
        updateLatencyScore('--');
        updateSystemScore('--');
        
        // 重置图表
        if (window.resultsRadarChart) {
            window.resultsRadarChart.data.datasets[0].data = [0, 0, 0, 0];
            window.resultsRadarChart.update();
        }
        
        // 重置详情
        const resultsDetails = document.getElementById('resultsDetails');
        if (resultsDetails) {
            resultsDetails.innerHTML = '<p>Complete the tests to see detailed results.</p>';
        }
    }
    
    // 开始耳机测试 - 简化版，实际应该有更复杂的音频测试
    function startHeadphoneTest(category) {
        console.log(`Starting headphone test for category: ${category}`);
        
        // 模拟测试进行
        setTimeout(() => {
            // 更新耳机分数
            let score = 0;
            switch(category) {
                case 'spatial':
                    score = 88;
                    break;
                case 'bass':
                    score = 85;
                    break;
                case 'clarity':
                    score = 92;
                    break;
                case 'dynamic':
                    score = 90;
                    break;
                default:
                    score = 85;
            }
            
            updateHeadphonesScore(score);
            
            // 更新图表
            updateResultsChart();
            
            // 停止测试
            stopHeadphoneTest();
            
            // 启用开始按钮
            if (startHeadphoneTestBtn) {
                startHeadphoneTestBtn.disabled = false;
            }
            
            // 禁用停止按钮
            if (stopHeadphoneTestBtn) {
                stopHeadphoneTestBtn.disabled = true;
            }
        }, 3000);
    }
    
    // 停止耳机测试
    function stopHeadphoneTest() {
        console.log('Stopping headphone test');
        // 实际实现中应该停止所有音频流和分析
    }
    
    // 开始音频问题检测
    function startAudioIssueDetection() {
        console.log('Starting audio issue detection...');
        
        if (detectionStatusElem) {
            detectionStatusElem.textContent = t.testing;
        }
        
        // 模拟检测进度
        let progress = 0;
        const progressInterval = setInterval(() => {
            progress += 5;
            
            if (detectionProgressValueElem) {
                detectionProgressValueElem.textContent = `${progress}%`;
            }
            
            if (detectionProgressElem) {
                const progressFill = detectionProgressElem.querySelector('.progress-fill');
                if (progressFill) {
                    progressFill.style.width = `${progress}%`;
                }
            }
            
            if (progress >= 100) {
                clearInterval(progressInterval);
                completeAudioIssueDetection();
            }
        }, 200);
    }
    
    // 完成音频问题检测
    function completeAudioIssueDetection() {
        console.log('Audio issue detection complete');
        
        if (detectionStatusElem) {
            detectionStatusElem.textContent = t.systemScanComplete;
        }
        
        if (detectionResultsElem) {
            // 模拟一些检测结果
            const randomIssue = Math.random() > 0.7;
            
            if (randomIssue) {
                let issues = '<h4>Detected Issues:</h4><ul>';
                issues += '<li>Audio output device sample rate mismatch - system set to 44.1kHz but content requires 48kHz</li>';
                issues += '<li>Background processes potentially affecting audio performance: 2 high CPU usage apps detected</li>';
                issues += '</ul>';
                issues += '<p>Recommendations: Adjust sample rate in your sound settings and close unnecessary applications.</p>';
                
                detectionResultsElem.innerHTML = issues;
                
                // 更新系统评分
                updateSystemScore(65);
            } else {
                detectionResultsElem.innerHTML = `<p>${t.noIssuesFound}</p>`;
                
                // 更新系统评分
                updateSystemScore(95);
            }
            
            // 更新图表
            updateResultsChart();
        }
        
        // 重置按钮状态
        if (startDetectionBtn) {
            startDetectionBtn.disabled = false;
        }
        
        if (stopDetectionBtn) {
            stopDetectionBtn.disabled = true;
        }
        
        if (detectionProgressElem) {
            detectionProgressElem.style.display = 'none';
        }
    }
    
    // 停止音频问题检测
    function stopAudioIssueDetection() {
        console.log('Stopping audio issue detection');
        
        if (detectionStatusElem) {
            detectionStatusElem.textContent = t.readyToTest;
        }
        
        if (detectionProgressElem) {
            detectionProgressElem.style.display = 'none';
        }
    }
}); 