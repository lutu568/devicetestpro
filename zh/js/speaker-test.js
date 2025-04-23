// 音频上下文和音频元素
let audioContext;
let gainNode;
let oscillator = null;
let sweepInterval = null;
let currentAudio = null;
let noiseBuffer = null;
let currentChannel = 'both';

// DOM元素
const frequencySlider = document.getElementById('frequencySlider');
const frequencyValue = document.getElementById('frequencyValue');
const volumeSlider = document.getElementById('volumeSlider');
const volumeValue = document.getElementById('volumeValue');
const sweepCanvas = document.getElementById('sweepCanvas');
const sweepInfo = document.getElementById('sweepInfo');
const progressFill = document.querySelector('.progress-fill');

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    // 初始化音频上下文
    try {
        window.AudioContext = window.AudioContext || window.webkitAudioContext;
        audioContext = new AudioContext();
        
        // 创建主增益节点
        gainNode = audioContext.createGain();
        gainNode.gain.value = 0.5; // 默认音量50%
        gainNode.connect(audioContext.destination);
        
        // 设置事件监听器
        setupEventListeners();
        
        // 创建频率扫描可视化
        setupSweepCanvas();
        
        // 预先创建噪音缓冲区
        createNoiseBuffer('white');
        createNoiseBuffer('pink');
    } catch(e) {
        alert('您的浏览器不支持Web Audio API。请尝试使用Chrome或Firefox。');
        console.error('Web Audio API不受支持', e);
    }
});

// 设置事件监听器
function setupEventListeners() {
    // 音量滑块
    const volumeSlider = document.getElementById('volumeSlider');
    const volumeValue = document.getElementById('volumeValue');
    
    volumeSlider.addEventListener('input', function() {
        const volume = parseFloat(this.value);
        volumeValue.textContent = Math.round(volume * 100) + '%';
        if (gainNode) {
            gainNode.gain.value = volume;
        }
    });
    
    // 频率滑块
    const frequencySlider = document.getElementById('frequencySlider');
    const frequencyValue = document.getElementById('frequencyValue');
    
    frequencySlider.addEventListener('input', function() {
        const frequency = parseInt(this.value);
        updateFrequencyDisplay(frequency);
        
        // 如果振荡器正在运行，更新频率
        if (oscillator !== null) {
            oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
        }
    });
    
    // 窗口大小改变时更新canvas
    window.addEventListener('resize', function() {
        setupSweepCanvas();
    });
}

// 声道测试
function testChannel(channel) {
    stopAllSounds();
    currentChannel = channel;
    
    let audioFile;
    switch(channel) {
        case 'left':
            audioFile = 'audio/test-left.mp3';
            break;
        case 'right':
            audioFile = 'audio/test-right.mp3';
            break;
        case 'both':
        default:
            audioFile = 'audio/test-stereo.mp3';
            break;
    }
    
    playAudioFile(audioFile);
}

// 播放频率
function playFrequency(freq) {
    // 停止之前的声音
    stopFrequency();
    
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }
    
    // 如果没有指定频率，使用滑块的值
    const frequency = freq || parseInt(document.getElementById('frequencySlider').value);
    updateFrequencyDisplay(frequency);
    
    // 创建并配置振荡器
    oscillator = audioContext.createOscillator();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
    
    // 根据当前选择的声道路由音频
    routeAudioToChannels(oscillator);
    
    // 开始播放
    oscillator.start();
}

// 停止频率
function stopFrequency() {
    if (oscillator !== null) {
        oscillator.stop();
        oscillator.disconnect();
        oscillator = null;
    }
}

// 更新频率显示
function updateFrequencyDisplay(frequency) {
    const frequencyValue = document.getElementById('frequencyValue');
    if (frequency >= 1000) {
        frequencyValue.textContent = (frequency / 1000).toFixed(1) + ' kHz';
    } else {
        frequencyValue.textContent = frequency + ' Hz';
    }
    
    // 同时更新滑块位置（如果不是来自滑块事件）
    const frequencySlider = document.getElementById('frequencySlider');
    if (parseInt(frequencySlider.value) !== frequency) {
        frequencySlider.value = frequency;
    }
}

// 播放音频文件
function playAudioFile(url) {
    if (currentAudio) {
        currentAudio.pause();
        currentAudio = null;
    }
    
    currentAudio = new Audio(url);
    currentAudio.volume = gainNode.gain.value;
    
    currentAudio.addEventListener('error', function() {
        alert('无法加载音频文件: ' + url);
    });
    
    currentAudio.play();
}

// 播放声音样本
function playSound(type) {
    stopAllSounds();
    
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }
    
    switch(type) {
        case 'voice':
            playAudioFile('audio/voice-sample.mp3');
            break;
        case 'music':
            playAudioFile('audio/music-sample.mp3');
            break;
        case 'nature':
            playAudioFile('audio/nature-sample.mp3');
            break;
        case 'white-noise':
            playNoise('white');
            break;
        case 'pink-noise':
            playNoise('pink');
            break;
    }
}

// 播放噪音
function playNoise(type) {
    stopFrequency();
    
    // 创建噪音源
    const noiseSource = audioContext.createBufferSource();
    
    if (type === 'white') {
        noiseSource.buffer = createNoiseBuffer('white');
    } else if (type === 'pink') {
        noiseSource.buffer = createNoiseBuffer('pink');
    }
    
    // 路由到正确的声道
    routeAudioToChannels(noiseSource);
    
    // 让它循环播放
    noiseSource.loop = true;
    noiseSource.start();
    
    // 保存引用以便可以停止
    oscillator = noiseSource;
}

// 创建噪音缓冲区
function createNoiseBuffer(type) {
    const bufferSize = audioContext.sampleRate * 2; // 2秒噪音
    const buffer = audioContext.createBuffer(2, bufferSize, audioContext.sampleRate);
    
    // 获取左右声道数据
    const leftChannel = buffer.getChannelData(0);
    const rightChannel = buffer.getChannelData(1);
    
    // 白噪音是随机值
    if (type === 'white') {
        for (let i = 0; i < bufferSize; i++) {
            const value = Math.random() * 2 - 1;
            leftChannel[i] = value;
            rightChannel[i] = value;
        }
    } 
    // 粉噪音使用滤波的白噪音
    else if (type === 'pink') {
        let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
        
        for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            
            b0 = 0.99886 * b0 + white * 0.0555179;
            b1 = 0.99332 * b1 + white * 0.0750759;
            b2 = 0.96900 * b2 + white * 0.1538520;
            b3 = 0.86650 * b3 + white * 0.3104856;
            b4 = 0.55000 * b4 + white * 0.5329522;
            b5 = -0.7616 * b5 - white * 0.0168980;
            
            const value = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
            leftChannel[i] = value * 0.11;  // 缩放为合理音量
            rightChannel[i] = value * 0.11;
            
            b6 = white * 0.115926;
        }
    }
    
    return buffer;
}

// 根据当前选择的声道路由音频
function routeAudioToChannels(source) {
    // 如果是单声道测试，需要使用立体声声相节点
    if (currentChannel !== 'both') {
        const stereoPanner = audioContext.createStereoPanner();
        
        if (currentChannel === 'left') {
            stereoPanner.pan.value = -1;  // 全左
        } else if (currentChannel === 'right') {
            stereoPanner.pan.value = 1;   // 全右
        }
        
        source.connect(stereoPanner);
        stereoPanner.connect(gainNode);
    } else {
        // 双声道直接连接到增益节点
        source.connect(gainNode);
    }
}

// 停止所有声音
function stopAllSounds() {
    stopFrequency();
    stopSweep();
    
    if (currentAudio) {
        currentAudio.pause();
        currentAudio = null;
    }
}

// 频率扫描
function startSweep() {
    stopAllSounds();
    
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }
    
    // 获取扫描设置
    const sweepRangeSelect = document.getElementById('sweepRange');
    const sweepDurationSelect = document.getElementById('sweepDuration');
    
    let startFreq, endFreq;
    switch(sweepRangeSelect.value) {
        case 'low':
            startFreq = 20;
            endFreq = 200;
            break;
        case 'mid':
            startFreq = 200;
            endFreq = 5000;
            break;
        case 'high':
            startFreq = 5000;
            endFreq = 20000;
            break;
        case 'full':
        default:
            startFreq = 20;
            endFreq = 20000;
            break;
    }
    
    const duration = parseInt(sweepDurationSelect.value);
    const sweepInfo = document.getElementById('sweepInfo');
    const progressFill = document.querySelector('.progress-fill');
    
    // 设置扫描信息显示
    sweepInfo.textContent = `正在扫描: ${startFreq}Hz 到 ${endFreq}Hz`;
    
    // 创建振荡器
    oscillator = audioContext.createOscillator();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(startFreq, audioContext.currentTime);
    
    // 指数扫描频率
    const now = audioContext.currentTime;
    oscillator.frequency.exponentialRampToValueAtTime(endFreq, now + duration);
    
    // 路由到正确的声道
    routeAudioToChannels(oscillator);
    
    // 开始播放
    oscillator.start();
    
    // 更新进度条
    let progress = 0;
    const updateInterval = 50; // 毫秒
    
    sweepInterval = setInterval(function() {
        progress += updateInterval / (duration * 1000);
        if (progress >= 1) {
            progress = 1;
            clearInterval(sweepInterval);
            sweepInterval = null;
            sweepInfo.textContent = `扫描完成: ${startFreq}Hz 到 ${endFreq}Hz`;
        }
        
        progressFill.style.width = (progress * 100) + '%';
        
        // 更新当前频率显示
        const logProgress = Math.pow(progress, 0.5); // 使进度在对数刻度上更线性
        const currentFreq = startFreq * Math.pow(endFreq / startFreq, logProgress);
        updateFrequencyDisplay(Math.round(currentFreq));
    }, updateInterval);
    
    // 设置振荡器计时器，在扫描完成后停止
    setTimeout(function() {
        if (oscillator) {
            oscillator.stop();
            oscillator.disconnect();
            oscillator = null;
        }
    }, duration * 1000);
}

// 停止频率扫描
function stopSweep() {
    if (sweepInterval) {
        clearInterval(sweepInterval);
        sweepInterval = null;
    }
    
    stopFrequency();
    
    const sweepInfo = document.getElementById('sweepInfo');
    sweepInfo.textContent = '准备就绪';
    
    const progressFill = document.querySelector('.progress-fill');
    progressFill.style.width = '0%';
}

// 设置扫描可视化
function setupSweepCanvas() {
    const canvas = document.getElementById('sweepCanvas');
    if (!canvas) return;
    
    const container = canvas.parentElement;
    canvas.width = container.clientWidth;
    
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 绘制频率刻度
    drawFrequencyScale(ctx, canvas.width, canvas.height);
}

// 绘制频率刻度
function drawFrequencyScale(ctx, width, height) {
    ctx.fillStyle = '#f5f5f5';
    ctx.fillRect(0, 0, width, height);
    
    ctx.strokeStyle = '#ddd';
    ctx.lineWidth = 1;
    ctx.beginPath();
    
    // 绘制水平线
    for (let i = 0; i <= 10; i++) {
        const y = height - (i * height / 10);
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
    }
    
    // 主要频率标记
    const frequencies = [20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000];
    const logMin = Math.log10(20);
    const logMax = Math.log10(20000);
    const logRange = logMax - logMin;
    
    for (let freq of frequencies) {
        // 在对数刻度上放置标记
        const logVal = Math.log10(freq);
        const x = ((logVal - logMin) / logRange) * width;
        
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
    }
    
    ctx.stroke();
    
    // 绘制频率标签
    ctx.fillStyle = '#666';
    ctx.font = '10px Arial';
    ctx.textAlign = 'center';
    
    for (let freq of frequencies) {
        const logVal = Math.log10(freq);
        const x = ((logVal - logMin) / logRange) * width;
        
        let label;
        if (freq >= 1000) {
            label = (freq / 1000) + 'k';
        } else {
            label = freq.toString();
        }
        
        ctx.fillText(label, x, height - 5);
    }
    
    // 绘制标题
    ctx.fillStyle = '#333';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('频率响应图 (Hz)', width / 2, 15);
} 