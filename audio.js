// Web Audio API のセットアップ
const audioContext = new (window.AudioContext || window.webkitAudioContext)();
let oscillator = null;

// 音階の周波数マップ
const noteFrequencies = {
    'ド': 261.63,
    'レ': 293.66,
    'ミ': 329.63,
    'ファ': 349.23,
    'ソ': 392.00,
    'ラ': 440.00,
    'シ': 493.88
};

// 音を生成する関数
function playNote(note, waveform) {
    if (oscillator) {
        oscillator.stop();
    }

    oscillator = audioContext.createOscillator();
    oscillator.type = waveform;
    oscillator.frequency.setValueAtTime(noteFrequencies[note], audioContext.currentTime);

    oscillator.connect(audioContext.destination);
    oscillator.start();

    // 1秒後に音を停止
    setTimeout(() => {
        oscillator.stop();
        oscillator = null;
    }, 1000);
}

// 音声認識の結果を処理する関数
function processVoiceInput(transcript) {
    const waveformType = document.getElementById('waveformType').value;

    if (noteFrequencies.hasOwnProperty(transcript)) {
        playNote(transcript, waveformType);
    } else if (['サイン波', '正弦波', '矩形波', 'ノコギリ波', '三角波'].includes(transcript)) {
        // 波形の種類を設定
        document.getElementById('waveformType').value = {
            'サイン波': 'sine',
            '正弦波': 'sine',
            '矩形波': 'square',
            'ノコギリ波': 'sawtooth',
            '三角波': 'triangle'
        }[transcript];
    }
}

// 既存のコードを修正して、processVoiceInput 関数を呼び出す
asr.onresult = function (event) {
    let transcript = event.results[event.resultIndex][0].transcript;

    if (event.results[event.resultIndex].isFinal) {
        asr.abort();
        processVoiceInput(transcript);

        output += '<div id="yourtext">' + transcript + '</div>';
        output += '<div id="answer">音を再生しました</div>';

        tts.text = "音を再生しました";
        tts.onend = function (event) {
            asr.start();
        }

        speechSynthesis.speak(tts);
    } else {
        output_not_final = '<div id="outputting">' + transcript + '</div>';
    }
    resultOutput.innerHTML = output + output_not_final;
}