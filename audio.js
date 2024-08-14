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

    // 複数の音階を検出
    const notesMatch = transcript.match(/([A-Ga-g]\s*\d\s*)+/g);
    if (notesMatch) {
        const notes = notesMatch[0].match(/[A-Ga-g]\s*\d/g).map(note => {
            const [noteName, octave] = note.trim().split(' ');
            return [noteName.toUpperCase(), parseInt(octave)];
        });
        playSequentialNotes(notes);
        response = `${notes.map(n => n.join(' ')).join(', ')}の音を再生しました。`;
    }
    // 「〜波に変更して」というパターンを検出
    else if (transcript.includes('に変更して')) {
        const waveformResponse = setWaveform(transcript.replace('に変更して', '').trim());
        if (waveformResponse) {
            response = waveformResponse;
        }
    }
    // 「コードを教えて」というパターンを検出
    else if (transcript.includes('コードを教えて')) {
        window.location.href = "https://www.shinko-music.co.jp/reading_score_piano/p-3-1/"; // URLに移動
        return response || 'こちらがコードの一覧です。';
    }

    return response || '認識できませんでした。';
}

// 音を連続再生する関数
function playSequentialNotes(notes) {
    const waveformType = document.getElementById('waveformType').value;
    const gainNode = audioContext.createGain();
    gainNode.connect(audioContext.destination);

    // 波形ごとの音量調整
    let gainValue;
    switch (waveformType) {
        case 'sine': gainValue = 0.3; break;
        case 'square': gainValue = 0.1; break;
        case 'sawtooth': gainValue = 0.1; break;
        case 'triangle': gainValue = 0.3; break;
        default: gainValue = 0.3;
    }
    gainNode.gain.setValueAtTime(gainValue, audioContext.currentTime);

    notes.forEach((noteInfo, index) => {
        const [note, octave] = noteInfo;
        const frequency = noteFrequencies[note][octave];

        setTimeout(() => {
            const oscillator = audioContext.createOscillator();
            oscillator.type = waveformType;
            oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
            oscillator.connect(gainNode);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 1); // 1秒間再生
        }, index * 1000);
    });
}