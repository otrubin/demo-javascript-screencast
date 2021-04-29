<?php
require_once './config.php';
require_once './functions.php';

$result = [
  'result' => true,
  'files' => []
];

try {
  $urlPath = UPLOAD_CATALOG;
  $files = getScreencastFiles(__DIR__ . DIRECTORY_SEPARATOR . UPLOAD_CATALOG);
  foreach ($files as $file) {
    $result['files'][] = "$urlPath/$file";
  }
} catch (Exception $e) {
	$result['result'] = false;
	$result['error'] = $e->getMessage();
}

echo json_encode($result);

?>