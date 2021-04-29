<?php
  require_once './config.php';

  $file = filter_input(INPUT_POST, 'file');

  $fullName = __DIR__ . DIRECTORY_SEPARATOR  . UPLOAD_CATALOG . DIRECTORY_SEPARATOR . $file;

  $result = [];
  if(file_exists($fullName))
  {
    try {
      unlink($fullName);
      $result['result'] = true;
    } catch (Exception $e) {
      $result['result'] = false;
	    $result['error'] = $e->getMessage();
    }
  } else {
    $result['result'] = false;
    $result['error'] = 'Файл не найден: ' . $file;
  }

  echo json_encode($result);
?>