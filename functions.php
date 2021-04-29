<?php

// возвращает массив с именами файлов скринкастов
function getScreencastFiles($dir)
{
  $files = scandir($dir, SCANDIR_SORT_DESCENDING);
  $res = [];
  foreach ($files as $file) {
    if(strpos($file, '.webm') !== false)
    {
      $res[] = $file;
    }
  }
  return $res;
}

?>