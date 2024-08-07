// Web Audio API のセットアップ
const audioContext = new (window.AudioContext || window.webkitAudioContext)();
let oscillator = null;

// 音階の周波数マップ
const noteFrequencies = {
    'C': {
        3: 130.81,
        4: 261.63,
        5: 523.25
    },
    'D': {
        3: 146.83,
        4: 293.66,
        5: 587.33
    },
    'E': {
        3: 164.81,
        4: 329.63,
        5: 659.25
    },
    'F': {
        3: 174.61,
        4: 349.23,
        5: 698.46
    },
    'G': {
        3: 196.00,
        4: 392.00,
        5: 783.99
    },
    'A': {
        3: 220.00,
        4: 440.00,
        5: 880.00
    },
    'B': {
        3: 246.94,
        4: 493.88,
        5: 987.77
    }
};

// 音を生成する関数
function playNote(note, octave, waveform) {
    if (oscillator) {
        oscillator.stop();
    }

    const gainNode = audioContext.createGain();
    oscillator = audioContext.createOscillator();
    oscillator.type = waveform;
    oscillator.frequency.setValueAtTime(noteFrequencies[note][octave], audioContext.currentTime);

    // 波形ごとの音量調整
    let gainValue;
    switch (waveform) {
        case 'sine':
            gainValue = 0.5;
            break;
        case 'square':
            gainValue = 0.2;
            break;
        case 'sawtooth':
            gainValue = 0.2;
            break;
        case 'triangle':
            gainValue = 0.5;
            break;
        default:
            gainValue = 0.5;
    }

    gainNode.gain.setValueAtTime(gainValue, audioContext.currentTime);

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    oscillator.start();

    // 1秒後に音を停止
    setTimeout(() => {
        oscillator.stop();
        oscillator = null;
    }, 1000);
}

// 波形の種類を設定する関数
function setWaveform(waveformName) {
    const waveformMap = {
        'サイン波': 'sine',
        '正弦波': 'sine',
        '矩形波': 'square',
        'ノコギリ波': 'sawtooth',
        '三角波': 'triangle'
    };

    if (waveformMap.hasOwnProperty(waveformName)) {
        document.getElementById('waveformType').value = waveformMap[waveformName];
        return `波形を${waveformName}に変更しました。`;
    }
    return null;
}

// 音声認識の結果を処理する関数
function processVoiceInput(transcript) {
    const waveformType = document.getElementById('waveformType').value;
    let response = '';

    // 「〜を再生して」というパターンを検出
    const noteMatch = transcript.match(/([A-Ga-g])\s*(\d)\s*を再生して/);
    if (noteMatch) {
        const note = noteMatch[1].toUpperCase();
        const octave = parseInt(noteMatch[2]);
        if (noteFrequencies[note] && noteFrequencies[note][octave]) {
            playNote(note, octave, waveformType);
            response = `${note} ${octave}の音を再生しました。`;
        } else {
            response = '指定された音階は範囲外です。';
        }
    } 
    // 「〜波に変更して」というパターンを検出
    else if (transcript.includes('に変更して')) {
        const waveformResponse = setWaveform(transcript.replace('に変更して', '').trim());
        if (waveformResponse) {
            response = waveformResponse;
        }
    }

    return response || '認識できませんでした。';
}