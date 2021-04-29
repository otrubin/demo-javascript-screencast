const displayMediaOptions = {
  video: {
    cursor: "always"
  },
  audio: true
};

let mediaRecorder = null;

/**
 * Начинает запись, после разрешения пользователем, собственно записи экрана и доступа к микрофону
 *
 * Получает:
 * 1. коллбек cbEndRecord, который будет вызван после остановки записи, и в него будет передан Blob-объект,
 * содержащий собственно запись.
 * 2. Если 2-й параметр isAudio установлен в true, то будет записываться и звук.
 *
 * Возвращает объект с двумя логическими свойствами video и audio
 * Если только audio === false, значит пишется скринкаст без звука
 * Если video === flase, значит пользователь не разрешил запись (писать только звук смысла нет)
 *
 * @param {Function} cbEndRecord
 * @param {Boolean} isAudio
 *
 * @returns {Object}
 */
async function dr_startDisplayRecord(cbEndRecord, isAudio) {
  mediaRecorder = null;

  const result = {
    video: true,
    audio: isAudio
  };

  // запрос на запись видео с экрана
  let captireStream = null;
  try {
    captireStream = await navigator.mediaDevices.getDisplayMedia(displayMediaOptions);
  } catch (error) {
    if (error.name === 'NotAllowedError') {
      result.video = false;
      return result; // если пользователь не разрешил запись скринкаста, выходим
    } else {
      throw error;
    }
  }

  // запрос на запись аудио
  let audioStream = null;
  try {
    audioStream = isAudio ? await navigator.mediaDevices.getUserMedia({ video: false, audio: true }) : false;
    result.audio = Boolean(audioStream);
  } catch (error) {
    if (error.name === 'NotAllowedError') {
      result.audio = false;
    } else {
      throw error;
    }
  }

  // если пользователь дал доступ к микрофону микшируем аудио и видео дорожки
  // если не дал, то пишется только видео
  const recorderStream = audioStream ? dr_mixer(audioStream, captireStream) : captireStream;

  const chunks = [];
  mediaRecorder = new MediaRecorder(recorderStream, { mimeType: 'video/webm' });

  // обработчик события получение данных записи от mediaRecorder
  mediaRecorder.ondataavailable = function (e) {
    chunks.push(e.data);
  }

  // обработчик события остановки записи
  mediaRecorder.onstop = function (e) {
    recorderStream.getTracks().forEach(track => track.stop());
    captireStream.getTracks().forEach(track => track.stop());
    if (audioStream) {
      audioStream.getTracks().forEach(track => track.stop());
    }
    const blob = new Blob(chunks, { mimeType: 'video/webm' });
    cbEndRecord(blob); // вызываем коллбек и передаем ему записанный скринкаст (со звуком)
  }

  mediaRecorder.start();
  return result;
}


/**
 * Остнавливает запись
 */
function dr_stopDisplayRecord() {
  if (mediaRecorder) {
    mediaRecorder.stop();
  }
}



/**
 * Микширует несколько звуковых дорожек и первую найденную видеодорожку
 * */
function dr_mixer(stream1, stream2) {
  const ctx = new AudioContext();
  const dest = ctx.createMediaStreamDestination();

  if (stream1.getAudioTracks().length > 0)
    ctx.createMediaStreamSource(stream1).connect(dest);

  if (stream2.getAudioTracks().length > 0)
    ctx.createMediaStreamSource(stream2).connect(dest);

  let tracks = dest.stream.getTracks();
  tracks = tracks.concat(stream1.getVideoTracks()).concat(stream2.getVideoTracks());

  return new MediaStream(tracks)
}