// Web Audio API �̃Z�b�g�A�b�v
const audioContext = new (window.AudioContext || window.webkitAudioContext)();
let oscillator = null;

// ���K�̎��g���}�b�v
const noteFrequencies = {
    '�h': 261.63,
    '��': 293.66,
    '�~': 329.63,
    '�t�@': 349.23,
    '�\': 392.00,
    '��': 440.00,
    '�V': 493.88
};

// ���𐶐�����֐�
function playNote(note, waveform) {
    if (oscillator) {
        oscillator.stop();
    }

    oscillator = audioContext.createOscillator();
    oscillator.type = waveform;
    oscillator.frequency.setValueAtTime(noteFrequencies[note], audioContext.currentTime);

    oscillator.connect(audioContext.destination);
    oscillator.start();

    // 1�b��ɉ����~
    setTimeout(() => {
        oscillator.stop();
        oscillator = null;
    }, 1000);
}

// �����F���̌��ʂ���������֐�
function processVoiceInput(transcript) {
    const waveformType = document.getElementById('waveformType').value;

    if (noteFrequencies.hasOwnProperty(transcript)) {
        playNote(transcript, waveformType);
    } else if (['�T�C���g', '�����g', '��`�g', '�m�R�M���g', '�O�p�g'].includes(transcript)) {
        // �g�`�̎�ނ�ݒ�
        document.getElementById('waveformType').value = {
            '�T�C���g': 'sine',
            '�����g': 'sine',
            '��`�g': 'square',
            '�m�R�M���g': 'sawtooth',
            '�O�p�g': 'triangle'
        }[transcript];
    }
}

// �����̃R�[�h���C�����āAprocessVoiceInput �֐����Ăяo��
asr.onresult = function (event) {
    let transcript = event.results[event.resultIndex][0].transcript;

    if (event.results[event.resultIndex].isFinal) {
        asr.abort();
        processVoiceInput(transcript);

        output += '<div id="yourtext">' + transcript + '</div>';
        output += '<div id="answer">�����Đ����܂���</div>';

        tts.text = "�����Đ����܂���";
        tts.onend = function (event) {
            asr.start();
        }

        speechSynthesis.speak(tts);
    } else {
        output_not_final = '<div id="outputting">' + transcript + '</div>';
    }
    resultOutput.innerHTML = output + output_not_final;
}