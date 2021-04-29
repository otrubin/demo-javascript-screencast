const video = document.getElementById('video');
const btnStart = document.getElementById('btn-start');
const btnStop = document.getElementById('btn-stop');
const messageBox = document.getElementById('message-box');
const uploadProgress = document.getElementById('upload-progress');
const uploadProgressBar = document.getElementById('upload-progress-bar');
const screencastTable = document.getElementById('video-table');

/**
 * основные функции
 */

// начинаем запись
async function startCapture() {
  try {
    hideMessage();
    const recordInfo = await dr_startDisplayRecord(endRecord, true);
    if (recordInfo.video) {
      if (!recordInfo.audio) {
        showInfoMessage('Звук не записывается')
      }
      recordStartState();
    } else {
      showErrorMessage('Запись экрана отменена');
    }

  } catch (error) {
    console.log(error);
  }
}

// останавливаем запись
function stopCapture() {
  dr_stopDisplayRecord();
}

// коллбек, который будет вызван при окончании записи
function endRecord(recordData) {
  video.src = window.URL.createObjectURL(recordData); // делаем записанное видео ссылкой для проигрывателя
  sendScreencast(recordData); // отправляем записанное видео на сервер ajax-запросом
  recordStopState();
}

// отправка записи на сервер
function sendScreencast(blob) {
  showInfoMessage('Загружаем запись на сервер');
  uploadProgressBar.style.width = '0%';
  uploadProgressBar.innerText = 'Загружено 0%';
  uploadProgress.classList.remove('d-none'); // показываем прогресс загрузки

  const fileName = Date.now() + '.webm';
  const fd = new FormData();
  fd.append('screencast', blob, fileName); // запись с именем файла

  $.ajax({
    type: "POST",
    url: "saveScreencast.php", //url-файла к которому идет ajax запрос
    data: fd,
    cache: false,
    processData: false,
    contentType: false,
    dataType: 'json',
    xhr: function () {
      var xhr = $.ajaxSettings.xhr(); // получаем объект XMLHttpRequest
      xhr.upload.addEventListener('progress', function (event) { // добавляем обработчик события progress (onprogress)
        if (event.lengthComputable) { // если известно количество байт
          // высчитываем процент загруженного
          var percentComplete = Math.ceil(event.loaded / event.total * 100);
          uploadProgressBar.innerText = 'Загружено ' + percentComplete + '%';
          uploadProgressBar.style.width = `${percentComplete}%`;
        }
      }, false);
      return xhr;
    },
    success: function (response) {
      //console.log(response);
      if (response.result) {
        showSuccessMessage(`Файл "${fileName}" успешно загружен на сервер`);
        showScreencastList(response.files);
      } else {
        showErrorMessage(`Произошла ошибка: "${response.error}"`);
      }
      uploadProgress.classList.add('d-none'); // скрываем прогресс-бар
    },
    error(jqXHR, textStatus, errorThrown) {
      showErrorMessage(`Ошибка: "${textStatus}"`);
      uploadProgress.classList.add('d-none'); // скрываем прогресс-бар
    },
  });
}

// Получает список загруженных файлов
function getScreencastFiles(cbSuccess) {
  $.ajax({
    type: "POST",
    url: "screencastFiles.php", //url-файла к которому идет ajax запрос
    dataType: 'json',
    success: function (response) {
      if (response.result) {
        cbSuccess(response.files);
      } else {
        showErrorMessage(`Ошибка. Не удалось получить список записей: "${response.error}"`);
      }
    },
    error(jqXHR, textStatus, errorThrown) {
      showErrorMessage(`Ошибка. Не удалось получить список записей: "${textStatus}"`);
    },
  });
}

// обработчик кликов по таблице со списком файлов
// отлавливаем только клики по кнопкам "Просмотреть" и "Удалить"
function screencastTableClick(event) {
  if(!event.target.dataset.action) {
    return;
  }
  const fileName = event.target.dataset.screencast;
  switch (event.target.dataset.action) {
    case 'view':
      screencastView(fileName);
      break;
    case 'delete':
      screencastDelete(fileName, function() {
        // если удаление прошло успешно,
        // просто полностью обновляем список (проект учебный:)
        getScreencastFiles(showScreencastList);
      });
      break;
  }
}

// посмотреть скринкаст
function screencastView(fileName) {
  video.src = fileName;
}

// удалить скринкаст
function screencastDelete(fileName, cbSuccess) {
  if (!confirm(`Подтверждаете удаление записи "${fileName}"`)) {
    return;
  }
  $.ajax({
    type: "POST",
    url: "deleteScreencast.php", //url-файла к которому идет ajax запрос
    data: `file=${fileName}`,
    dataType: 'json',
    success: function (response) {
      if (response.result) {
        showSuccessMessage(`Файл "${fileName}" удален.`);
        cbSuccess(); // вызываем коллбек
      } else {
        showErrorMessage(`Ошибка. Не удалось удалить файл: "${response.error}" -- success`);
      }
    },
    error(jqXHR, textStatus, errorThrown) {
      showErrorMessage(`Ошибка. Не удалось удалить файл: "${textStatus}" -- error`);
    },
  });
}

/**
* Вспомогательные функции
*/

function getFileNameFromUrl(url) {
  const pos = url.lastIndexOf('/');
  return pos !== -1 ? url.slice(pos + 1) : url;
}


/**
* UI функции
*/

// управление внешним видом кнопок, при старте записи
function recordStartState() {
  btnStart.classList.remove('btn-primary');
  btnStart.classList.add('btn-danger');
  btnStart.innerHTML = '!!! Идет запись';
  btnStart.setAttribute('disabled', 'disabled');

  btnStop.classList.remove('d-none');
}

// управление внешним видом кнопок, когда запись окончена
function recordStopState() {
  btnStart.classList.remove('btn-danger');
  btnStart.classList.add('btn-primary');
  btnStart.removeAttribute('disabled');
  btnStart.innerHTML = 'Начать запись';

  btnStop.classList.add('d-none');
}

 function showSuccessMessage($msg) {
  messageBox.innerHTML = `<div class="alert alert-success alert-dismissible fade show" role="alert">
      ${$msg}
      <button type="button" class="close" data-dismiss="alert" aria-label="Close">
        <span aria-hidden="true">&times;</span>
      </button>
    </div>`;
}


function showErrorMessage($msg) {
  messageBox.innerHTML = `<div class="alert alert-danger alert-dismissible fade show" role="alert">
      ${$msg}
      <button type="button" class="close" data-dismiss="alert" aria-label="Close">
        <span aria-hidden="true">&times;</span>
      </button>
    </div>`;
}

function showInfoMessage($msg) {
  messageBox.innerHTML = `<div class="alert alert-primary alert-dismissible fade show" role="alert">
      ${$msg}
      <button type="button" class="close" data-dismiss="alert" aria-label="Close">
        <span aria-hidden="true">&times;</span>
      </button>
    </div>`;
}

function hideMessage() {
  messageBox.innerHTML = '';
}

function showScreencastList(screencastList) {
  let fileName;
  let rows = '';
  screencastList.forEach(screencast => {
    fileName = getFileNameFromUrl(screencast);
    rows += `<tr>
        <td><b>${fileName}</b></td>
        <td>
          <button class="btn btn-sm btn-outline-primary " data-action="view" data-screencast="${screencast}">Просмотреть</button>
          <a download href="${screencast}" class="btn btn-sm btn-outline-success" data-action="download">Скачать</a>
          <button class="btn btn-sm btn-outline-danger" data-action="delete" data-screencast="${fileName}">Удалить</button>
        </td>
      </tr>`;
  });
  screencastTable.innerHTML = rows;
}


/**
* Инициализация
*/
btnStart.addEventListener('click', startCapture);
btnStop.addEventListener('click', stopCapture);
screencastTable.addEventListener('click', screencastTableClick);

getScreencastFiles(showScreencastList); //показываем список загруженных скринкастов

