# Microphone Test Tool / 麦克风测试工具

A simple, fast, and free online microphone testing tool that helps users check if their microphone is working properly, providing detailed audio analysis and troubleshooting.

一个简单、快速、免费的在线麦克风测试工具，帮助用户检测麦克风是否正常工作，并提供详细的音频分析和问题诊断。

## Features / 功能特点

- **Real-time Audio Visualization** - Visually display audio waveforms and frequency distribution
- **Detailed Audio Analysis** - Measure volume levels and frequency characteristics
- **Intelligent Problem Diagnosis** - Automatically detect common microphone problems and provide solutions
- **Test Results Saving** - Save test results as text files or share directly
- **Responsive Design** - Works well on any device
- **No Installation Required** - Pure web application, no software download or installation needed
- **Bilingual Support** - Full English and Chinese language support
- **Apple Design System** - Modern, clean interface inspired by Apple's design principles

## How to Use / 使用方法

1. Open the website homepage
2. Click "Start Test" button
3. Allow microphone access when prompted by the browser
4. Speak into the microphone or make sounds
5. Click "Stop Test" button to view detailed analysis results
6. Save or share test results as needed

## Technology Implementation / 技术实现

- Pure frontend implementation using HTML, CSS, and JavaScript
- Utilizes Web Audio API for audio capture and analysis
- Uses Canvas for audio visualization
- Responsive design adapts to various device screens
- Follows Apple Design System guidelines for interface design
- Implements language detection and localization

## Local Development / 本地开发

1. Clone the repository to your local machine
```
git clone https://github.com/yourusername/mic-test-tool.git
```

2. Run the project using a local server (due to security restrictions, microphone access requires HTTPS or localhost)
```
# Using Node.js server
npm start

# Or using simple Python server
python -m http.server
```

3. Visit `http://localhost:3000` or corresponding port in your browser

## Browser Compatibility / 浏览器兼容性

- Chrome 55+
- Firefox 53+
- Edge 79+
- Safari 11+
- Opera 42+

Older browsers may not support certain features, especially the audio analysis and visualization parts.

## Design System / 设计系统

This project uses a design system inspired by Apple's interface guidelines:

- Clean, minimal aesthetic with ample white space
- Blue accent color scheme (#007aff)
- Rounded card-based interface components
- Subtle shadows and depth
- System fonts optimized for readability
- Responsive design that works on all devices
- Blur effects on header navigation

## License / 许可证

MIT

## Future Plans / 未来计划

- Add more audio testing tools (speaker test, audio latency test, etc.)
- Provide more detailed audio quality analysis
- Add comparison testing features to save and compare multiple test results
- Expand language support to more languages 