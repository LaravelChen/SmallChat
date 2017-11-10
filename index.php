<?php

include_once __DIR__ . "/vendor/autoload.php";
$webSocket = new \Chat\ChatServer();

$webSocket->run();