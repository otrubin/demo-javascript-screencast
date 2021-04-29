**Учебный проект по записи экрана и звука при помощи возможностей javascript интерфейса Screen Capture API.**

Проект разрабатывался и тестировался в браузере google chrome, в других браузерах не тестировался.

Проект учебный в нем НЕ используются многие возможности, современного javascript.

База данных не используется файлы просто складываются в папку *upload-video*.

**Проблема:** в [статье на MDN](https://developer.mozilla.org/ru/docs/Web/API/Screen_Capture_API/Using_Screen_Capture) описывалось, что вместе с записью экрана можно записывать и звук, но добиться этого не удалось. По этой причине, для записи звука, использовался метод navigator.mediaDevices.getUserMedia

Демо:  [https://screen.techmotiv.ru/](https://screen.techmotiv.ru/)

## Возможности учебного проекта:

-   Запись экрана и звука (можно не давать разрешение на использование микрофона, тогда будет записываться без звука)
-   Просмотр записанных скринкастов
-   Скачивание записанных скринкастов
-   Удаление записанных скринкастов

По нажатию кнопки “Начать запись” показывается окно выбора части экрана для записи.

Затем запрашивается доступ к микрофону (google chrome запоминает ваш выбор и повторно доступ к микрофону не запрашивается, изменить это можно здесь [http://joxi.ru/823aVopia6dVMr](http://joxi.ru/823aVopia6dVMr)

После начала записи показывается кнопка остановки записи. По нажатию на нее запись останавливается, видео загружается на сервер и появляется в списке записей.
Также видео загружается в проигрыватель.

## Файлы проекта

### Фронтенд:

**index.html** \- верстка, подключение скриптов, и стилей. Использовался css-фреймворк bootstrap, его файлы подключены из CDN.

**css/style.css** \- стили проекта

**js/display-recorder.js** \- модуль содержит код, собственно для записи скринкаста и звука, может использоваться в других проектах.

Функции:

-   dr_startDisplayRecord - начинает запись скринкаста (подробные комментарии в коде)
-   dr_stopDisplayRecord - останавливает запись скринкаста

**js/app.js** \- содержит код, реализующий всю логику этого проекта:

-   начало и остановка записи
-   загрузка видео на сервер
-   формирование списка видео
-   функционал кнопок “Просмотреть”, “Скачать”, “Удалить”
-   показ сообщений

### Бэкенд:

**config.php** \- конфиг :)

**functions.php** \- функции используемые в других модулях

**saveScreencast.php** \- вызывается POST ajax-запросом для загрузки видео на сервер.

Файлы загружаются в каталог указанный в config.php, в проекте это upload-video (каталог должен существовать).
*Параметры запроса:* видеофайл, который нужно сохранить.
*Возвращает:* JSON, содержащий поля:
result \- результат работы скрипта true или false
files \- массив имен файлов загруженных видео
error \- если поле result === false, содержит текстовое описание ошибки

**screencastFiles.php** \- вызывается POST ajax-запросом для получения списка загруженных видеофайлов.
*Параметры запроса:* нет.
*Возвращает:* JSON, содержащий поля:
result \- результат работы скрипта true или false
files \- массив имен файлов загруженных видео
error \- если поле result === false, содержит текстовое описание ошибки

**deleteScreencast.php** \- вызывается POST ajax-запросом для удаления
*Параметры запроса:* имя файла для удаления
*Возвращает:* JSON, содержащий поля:
result \- результат работы скрипта true или false
error \- если поле result === false, содержит текстовое описание ошибки

## Установка на сервер

Просто загрузить файлы проекта в какую-то папку.
Важно! Сайт должен работать по защищенному HTTPS-протоколу

## Установка на локальный сервер

[https://ospanel.io/](https://www.google.com/url?q=https://ospanel.io/&sa=D&source=editors&ust=1619681992901000&usg=AOvVaw0jVuAbfDOODTa8H4N2JcWL) \- лучше использовать этот локальный сервер.

После установки создать какой-то домен и загрузить файлы проекта в папку этого домена.

Поскольку сайт должен работать по протоколу HTTPS, нужно создать ssl-сертификат на open server, например по этой инструкции: [https://wp-kama.ru/note/ssl-openserver](https://wp-kama.ru/note/ssl-openserver)

## Полезные ссылки

[https://developer.mozilla.org/ru/docs/Web/API/Screen\_Capture\_API/Using\_Screen\_Capture](https://developer.mozilla.org/ru/docs/Web/API/Screen_Capture_API/Using_Screen_Capture)
[https://developer.mozilla.org/ru/docs/Web/API/MediaRecorder](https://developer.mozilla.org/ru/docs/Web/API/MediaRecorder)
[https://developer.mozilla.org/ru/docs/Web/API/MediaDevices/getUserMedia](https://developer.mozilla.org/ru/docs/Web/API/MediaDevices/getUserMedia)
[https://developer.mozilla.org/ru/docs/Web/API/MediaStream\_Recording\_API/Using\_the\_MediaStream\_Recording\_API](https://developer.mozilla.org/ru/docs/Web/API/MediaStream_Recording_API/Using_the_MediaStream_Recording_API)
[https://webrtchacks.com/jitsi-recording-getdisplaymedia-audio/](https://webrtchacks.com/jitsi-recording-getdisplaymedia-audio/)