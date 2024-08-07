// Web Audio API ‚ÌƒZƒbƒgƒAƒbƒv
const audioContext = new (window.AudioContext || window.webkitAudioContext)();
let oscillator = null;

// ‰¹ŠK‚Ìü”g”ƒ}ƒbƒv
const noteFrequencies = {
    'ƒh': 261.63,
    'ƒŒ': 293.66,
    'ƒ~': 329.63,
    'ƒtƒ@': 349.23,
    'ƒ\': 392.00,
    'ƒ‰': 440.00,
    'ƒV': 493.88
};

// ‰¹‚ğ¶¬‚·‚éŠÖ”
function playNote(note, waveform) {
    if (oscillator) {
        oscillator.stop();
    }

    oscillator = audioContext.createOscillator();
    oscillator.type = waveform;
    oscillator.frequency.setValueAtTime(noteFrequencies[note], audioContext.currentTime);

    oscillator.connect(audioContext.destination);
    oscillator.start();

    // 1•bŒã‚É‰¹‚ğ’â~
    setTimeout(() => {
        oscillator.stop();
        oscillator = null;
    }, 1000);
}

// ‰¹º”F¯‚ÌŒ‹‰Ê‚ğˆ—‚·‚éŠÖ”
function processVoiceInput(transcript) {
    const waveformType = document.getElementById('waveformType').value;

    if (noteFrequencies.hasOwnProperty(transcript)) {
        playNote(transcript, waveformType);
    } else if (['ƒTƒCƒ“”g', '³Œ·”g', '‹éŒ`”g', 'ƒmƒRƒMƒŠ”g', 'OŠp”g'].includes(transcript)) {
        // ”gŒ`‚Ìí—Ş‚ğİ’è
        document.getElementById('waveformType').value = {
            'ƒTƒCƒ“”g': 'sine',
            '³Œ·”g': 'sine',
            '‹éŒ`”g': 'square',
            'ƒmƒRƒMƒŠ”g': 'sawtooth',
            'OŠp”g': 'triangle'
        }[transcript];
    }
}

// Šù‘¶‚ÌƒR[ƒh‚ğC³‚µ‚ÄAprocessVoiceInput ŠÖ”‚ğŒÄ‚Ño‚·
asr.onresult = function (event) {
    let transcript = event.results[event.resultIndex][0].transcript;

    if (event.results[event.resultIndex].isFinal) {
        asr.abort();
        processVoiceInput(transcript);

        output += '<div id="yourtext">' + transcript + '</div>';
        output += '<div id="answer">‰¹‚ğÄ¶‚µ‚Ü‚µ‚½</div>';

        tts.text = "‰¹‚ğÄ¶‚µ‚Ü‚µ‚½";
        tts.onend = function (event) {
            asr.start();
        }

        speechSynthesis.speak(tts);
    } else {
        output_not_final = '<div id="outputting">' + transcript + '</div>';
    }
    resultOutput.innerHTML = output + output_not_final;
}