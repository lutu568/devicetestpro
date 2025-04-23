document.addEventListener('DOMContentLoaded', function() {
    // DOM元素
    const quickTest = document.getElementById('quickTest');
    const playFrequency = document.getElementById('playFrequency');
    const stopFrequency = document.getElementById('stopFrequency');
    const testLeft = document.getElementById('testLeft');
    const testRight = document.getElementById('testRight');
    const testBoth = document.getElementById('testBoth');
    const channelStatus = document.getElementById('channelStatus');
    const frequencyRange = document.getElementById('frequencyRange');
    const frequencyValue = document.getElementById('frequencyValue');
    const playTone = document.getElementById('playTone');
    const stopTone = document.getElementById('stopTone');
    const sweepRange = document.getElementById('sweepRange');
    const sweepDuration = document.getElementById('sweepDuration');
    const startSweep = document.getElementById('startSweep');
    const stopSweep = document.getElementById('stopSweep');
    const sweepVisualizer = document.getElementById('sweepVisualizer');
    const sweepInfo = document.getElementById('sweepInfo');
    const sweepProgress = document.querySelector('#sweepProgress .progress-fill');
    const volumeRange = document.getElementById('volumeRange');
    const volumeValue = document.getElementById('volumeValue');
    const stopAllSounds = document.getElementById('stopAllSounds');
    const soundSamples = document.querySelectorAll('.sound-sample');
    
    // 音频上下文和变量
    let audioContext = null;
    let oscillator = null;
    let gainNode = null;
    let sweepInterval = null;
    let currentSample = null;
    let audioBuffer = null;
    let startTime = 0;
    let sweepStartFreq = 20;
    let sweepEndFreq = 20000;
    let isPlaying = false;
    let isSweeping = false;
    let currentFrequency = 440;
    let volumeLevel = 0.8;
    const samplesMap = new Map();
    
    // 初始化音频上下文
    function initAudioContext() {
        if (audioContext === null) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            gainNode = audioContext.createGain();
            gainNode.gain.value = volumeLevel;
            gainNode.connect(audioContext.destination);
        }
    }
    
    // 播放频率
    function playFreq(frequency, channel = 'both') {
        initAudioContext();
        stopAllAudio();
        
        oscillator = audioContext.createOscillator();
        oscillator.type = 'sine';
        oscillator.frequency.value = frequency;
        
        if (channel === 'left' || channel === 'right') {
            const splitter = audioContext.createChannelSplitter(2);
            const merger = audioContext.createChannelMerger(2);
            
            oscillator.connect(splitter);
            
            if (channel === 'left') {
                splitter.connect(merger, 0, 0);
            } else if (channel === 'right') {
                splitter.connect(merger, 0, 1);
            }
            
            merger.connect(gainNode);
        } else {
            oscillator.connect(gainNode);
        }
        
        oscillator.start();
        isPlaying = true;
        currentFrequency = frequency;
        
        if (channel === 'left') {
            channelStatus.textContent = "正在测试左声道...";
        } else if (channel === 'right') {
            channelStatus.textContent = "正在测试右声道...";
        } else {
            channelStatus.textContent = "正在测试双声道...";
        }
        
        // 更新UI
        updatePlayingUI();
    }
    
    // 停止所有音频
    function stopAllAudio() {
        if (oscillator) {
            oscillator.stop();
            oscillator.disconnect();
            oscillator = null;
        }
        
        if (currentSample) {
            currentSample.stop();
            currentSample = null;
        }
        
        if (sweepInterval) {
            clearInterval(sweepInterval);
            sweepInterval = null;
        }
        
        isPlaying = false;
        isSweeping = false;
        
        // 更新UI
        updateStoppedUI();
    }
    
    // 进行频率扫描
    function startFrequencySweep() {
        initAudioContext();
        stopAllAudio();
        
        // 获取扫描范围和持续时间
        const range = sweepRange.value;
        const duration = parseInt(sweepDuration.value) * 1000;
        
        // 设置扫描范围
        switch (range) {
            case 'low':
                sweepStartFreq = 20;
                sweepEndFreq = 200;
                break;
            case 'mid':
                sweepStartFreq = 200;
                sweepEndFreq = 5000;
                break;
            case 'high':
                sweepStartFreq = 5000;
                sweepEndFreq = 20000;
                break;
            default:
                sweepStartFreq = 20;
                sweepEndFreq = 20000;
                break;
        }
        
        // 创建振荡器
        oscillator = audioContext.createOscillator();
        oscillator.type = 'sine';
        oscillator.frequency.value = sweepStartFreq;
        oscillator.connect(gainNode);
        oscillator.start();
        
        // 显示信息
        sweepInfo.textContent = `从 ${sweepStartFreq} Hz 到 ${sweepEndFreq} Hz 扫描`;
        
        // 设置持续时间
        startTime = audioContext.currentTime;
        const endTime = startTime + (duration / 1000);
        
        // 指数扫频
        oscillator.frequency.exponentialRampToValueAtTime(sweepEndFreq, endTime);
        
        // 更新进度条
        const updateInterval = 50; // 50毫秒更新一次
        let elapsed = 0;
        
        sweepInterval = setInterval(() => {
            elapsed += updateInterval;
            const progress = Math.min(100, (elapsed / duration) * 100);
            sweepProgress.style.width = `${progress}%`;
            
            // 绘制频率视觉效果
            drawFrequency(sweepStartFreq * Math.pow(sweepEndFreq / sweepStartFreq, elapsed / duration));
            
            if (elapsed >= duration) {
                clearInterval(sweepInterval);
                sweepInterval = null;
                stopAllAudio();
            }
        }, updateInterval);
        
        // 更新UI状态
        isPlaying = true;
        isSweeping = true;
        updateSweepingUI();
    }
    
    // 绘制频率到可视化器
    function drawFrequency(freq) {
        const canvas = sweepVisualizer;
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        
        // 清除画布
        ctx.clearRect(0, 0, width, height);
        
        // 绘制频率轴和刻度
        ctx.fillStyle = '#f5f5f5';
        ctx.fillRect(0, 0, width, height);
        
        // 计算当前频率位置
        const minFreq = Math.log10(sweepStartFreq);
        const maxFreq = Math.log10(sweepEndFreq);
        const currentPos = ((Math.log10(freq) - minFreq) / (maxFreq - minFreq)) * width;
        
        // 绘制频率条
        const gradient = ctx.createLinearGradient(0, 0, width, 0);
        gradient.addColorStop(0, '#3f51b5');
        gradient.addColorStop(0.5, '#2196f3');
        gradient.addColorStop(1, '#03a9f4');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, height - 40, currentPos, 30);
        
        // 绘制频率标签
        ctx.fillStyle = '#333';
        ctx.font = '12px Arial';
        
        // 显示一些频率标签
        const freqLabels = [20, 100, 500, 1000, 5000, 10000, 20000];
        for (const f of freqLabels) {
            if (f >= sweepStartFreq && f <= sweepEndFreq) {
                const x = ((Math.log10(f) - minFreq) / (maxFreq - minFreq)) * width;
                ctx.fillText(`${f >= 1000 ? (f / 1000) + 'k' : f}`, x - 10, height - 5);
                
                // 绘制刻度线
                ctx.beginPath();
                ctx.moveTo(x, height - 45);
                ctx.lineTo(x, height - 40);
                ctx.stroke();
            }
        }
        
        // 绘制当前频率指示
        ctx.fillStyle = '#e91e63';
        ctx.beginPath();
        ctx.arc(currentPos, height - 25, 8, 0, Math.PI * 2);
        ctx.fill();
        
        // 显示当前频率
        ctx.fillStyle = '#000';
        ctx.font = 'bold 14px Arial';
        ctx.fillText(`${freq.toFixed(0)} Hz`, 10, 20);
    }
    
    // 播放声音样本
    function playSoundSample(sampleName) {
        initAudioContext();
        stopAllAudio();
        
        // 如果已缓存，直接播放
        if (samplesMap.has(sampleName)) {
            const audioBuffer = samplesMap.get(sampleName);
            playSample(audioBuffer);
            return;
        }
        
        // 否则加载并缓存
        let sampleUrl;
        switch (sampleName) {
            case 'white-noise':
                sampleUrl = '../audio/white-noise.mp3';
                break;
            case 'pink-noise':
                sampleUrl = '../audio/pink-noise.mp3';
                break;
            case 'speech':
                sampleUrl = '../audio/speech-sample.mp3';
                break;
            case 'music':
                sampleUrl = '../audio/music-sample.mp3';
                break;
            default:
                console.error('未知声音样本:', sampleName);
                return;
        }
        
        fetch(sampleUrl)
            .then(response => response.arrayBuffer())
            .then(data => audioContext.decodeAudioData(data))
            .then(buffer => {
                // 缓存音频
                samplesMap.set(sampleName, buffer);
                // 播放
                playSample(buffer);
            })
            .catch(err => {
                console.error('加载声音样本失败:', err);
                channelStatus.textContent = "加载声音样本失败!";
            });
    }
    
    // 播放样本
    function playSample(buffer) {
        currentSample = audioContext.createBufferSource();
        currentSample.buffer = buffer;
        currentSample.connect(gainNode);
        currentSample.start();
        
        // 更新UI
        isPlaying = true;
        channelStatus.textContent = "正在播放声音样本...";
        updatePlayingUI();
    }
    
    // 更新正在播放的UI
    function updatePlayingUI() {
        playFrequency.disabled = true;
        stopFrequency.disabled = false;
        playTone.disabled = true;
        stopTone.disabled = false;
        soundSamples.forEach(btn => btn.disabled = true);
        stopAllSounds.disabled = false;
    }
    
    // 更新停止播放的UI
    function updateStoppedUI() {
        playFrequency.disabled = false;
        stopFrequency.disabled = true;
        playTone.disabled = false;
        stopTone.disabled = true;
        soundSamples.forEach(btn => btn.disabled = false);
        stopAllSounds.disabled = true;
        channelStatus.textContent = "准备测试";
        sweepProgress.style.width = '0%';
    }
    
    // 更新扫频时的UI
    function updateSweepingUI() {
        startSweep.disabled = true;
        stopSweep.disabled = false;
        sweepRange.disabled = true;
        sweepDuration.disabled = true;
        
        // 其他按钮也需要禁用
        updatePlayingUI();
    }
    
    // 频率滑块事件
    frequencyRange.addEventListener('input', function() {
        const freq = parseInt(this.value);
        frequencyValue.textContent = freq;
        
        // 如果正在播放，更新频率
        if (isPlaying && oscillator && !isSweeping) {
            oscillator.frequency.value = freq;
            currentFrequency = freq;
        }
    });
    
    // 音量滑块事件
    volumeRange.addEventListener('input', function() {
        const volume = parseInt(this.value) / 100;
        volumeValue.textContent = this.value;
        volumeLevel = volume;
        
        // 更新音量
        if (gainNode) {
            gainNode.gain.value = volume;
        }
    });
    
    // 单击预设频率按钮
    document.querySelectorAll('.btn.mini').forEach(btn => {
        btn.addEventListener('click', function() {
            const freq = parseInt(this.dataset.freq);
            frequencyRange.value = freq;
            frequencyValue.textContent = freq;
            
            // 如果正在播放，更新频率
            if (isPlaying && oscillator && !isSweeping) {
                oscillator.frequency.value = freq;
                currentFrequency = freq;
            }
        });
    });
    
    // 声音样本按钮事件
    soundSamples.forEach(btn => {
        btn.addEventListener('click', function() {
            const sample = this.dataset.sample;
            playSoundSample(sample);
        });
    });
    
    // 按钮事件处理
    quickTest.addEventListener('click', function() {
        // 快速测试将按顺序执行所有测试
        alert('快速测试将依次播放左声道、右声道和频率扫描测试。');
        
        // 首先测试左声道
        playFreq(440, 'left');
        
        // 2秒后测试右声道
        setTimeout(() => {
            if (isPlaying) {
                playFreq(440, 'right');
                
                // 2秒后测试频率扫描
                setTimeout(() => {
                    if (isPlaying) {
                        stopAllAudio();
                        startFrequencySweep();
                    }
                }, 2000);
            }
        }, 2000);
    });
    
    playFrequency.addEventListener('click', function() {
        playFreq(currentFrequency);
    });
    
    stopFrequency.addEventListener('click', function() {
        stopAllAudio();
    });
    
    testLeft.addEventListener('click', function() {
        playFreq(currentFrequency, 'left');
    });
    
    testRight.addEventListener('click', function() {
        playFreq(currentFrequency, 'right');
    });
    
    testBoth.addEventListener('click', function() {
        playFreq(currentFrequency);
    });
    
    playTone.addEventListener('click', function() {
        playFreq(parseInt(frequencyRange.value));
    });
    
    stopTone.addEventListener('click', function() {
        stopAllAudio();
    });
    
    startSweep.addEventListener('click', function() {
        startFrequencySweep();
    });
    
    stopSweep.addEventListener('click', function() {
        stopAllAudio();
    });
    
    stopAllSounds.addEventListener('click', function() {
        stopAllAudio();
    });
    
    // 初始化页面
    updateStoppedUI();
});