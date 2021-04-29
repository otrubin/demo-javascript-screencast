<?php

require_once './config.php';
require_once './functions.php';

$result = [
  'files' => []
];
try {
		// Каталог для скринкастов
	$dir = __DIR__ . DIRECTORY_SEPARATOR . UPLOAD_CATALOG;

	// Проверяем наличие каталога для скринкастов
	if (!is_dir($dir))
	{
		mkdir($dir, 0777, true); // Если ее нет, то создаем
	}
	$path = $dir . DIRECTORY_SEPARATOR;

	// перемещаем загруженный файл в каталог для скринкастов
	$urlPath = UPLOAD_CATALOG;
	$result['result'] = move_uploaded_file($_FILES['screencast']['tmp_name'], $path . $_FILES['screencast']['name']);
	if ($result['result'])
	{
		$files = getScreencastFiles($dir);
		foreach ($files as $file) {
			$result['files'][] = "$urlPath/$file";
		}
	} else {
		$result['error'] = 'Неизвестная ошибка';
	}
} catch (Exception $e) {
	$result['result'] = false;
	$result['error'] = $e->getMessage();
}

echo json_encode($result);

?>