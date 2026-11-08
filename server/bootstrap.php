<?php
declare(strict_types=1);
ini_set('display_errors','0');
date_default_timezone_set('UTC');
function cfg(): array {
 static $c; if ($c !== null) return $c;
 $path = getenv('AK_CONFIG') ?: dirname(__DIR__,2).'/ak-config.php';
 if (!is_file($path)) throw new RuntimeException('Configuration unavailable');
 $c = require $path;
 if (strlen($c['secret'] ?? '') < 32) throw new RuntimeException('Invalid configuration');
 return $c;
}
function db(): PDO {
 static $db; if ($db) return $db; $c=cfg();
 return $db=new PDO($c['dsn'],$c['user'],$c['password'],[PDO::ATTR_ERRMODE=>PDO::ERRMODE_EXCEPTION,PDO::ATTR_EMULATE_PREPARES=>false,PDO::ATTR_TIMEOUT=>3]);
}
function query(string $sql,array $values=[]): PDOStatement { $s=db()->prepare($sql);$s->execute($values);return $s; }
function h($v): string {return htmlspecialchars((string)$v,ENT_QUOTES,'UTF-8');}
function ip(): string { return filter_var($_SERVER['REMOTE_ADDR']??'',FILTER_VALIDATE_IP) ?: ''; }
function limit(string $area,int $max): void {
 $bucket=$area.':'.hash_hmac('sha256',ip(),cfg()['secret']).':'.gmdate('YmdHi');
 query('INSERT INTO limits(bucket,hits,expires_at) VALUES (?,1,DATE_ADD(UTC_TIMESTAMP(),INTERVAL 2 MINUTE)) ON DUPLICATE KEY UPDATE hits=hits+1',[$bucket]);
 if ((int)query('SELECT hits FROM limits WHERE bucket=?',[$bucket])->fetchColumn()>$max) {http_response_code(429);exit;}
}
function geo(): array {
 $file=cfg()['geo_csv']??''; if (!$file || !is_readable($file)) return ['Unknown','Unknown'];
 $addr=inet_pton(ip()); if (!$addr) return ['Unknown','Unknown'];
 $f=fopen($file,'r');try {while(($r=fgetcsv($f))!==false){
 [$net,$bits]=array_pad(explode('/',$r[0]),2,null);$n=@inet_pton($net);
 if(!$n || strlen($n)!==strlen($addr) || !is_numeric($bits) || $bits<0 || $bits>strlen($n)*8)continue;
 $bytes=intdiv((int)$bits,8);$rem=(int)$bits%8;
 if(substr($n,0,$bytes)===substr($addr,0,$bytes) && (!$rem || ((ord($n[$bytes])^ord($addr[$bytes])) & (255 << (8-$rem)))===0))return [substr($r[1]??'Unknown',0,100),substr($r[2]??'Unknown',0,100)];
 }} finally {fclose($f);} return ['Unknown','Unknown'];
}
function adminSession(): void {
 session_name('ak_admin');session_set_cookie_params(['httponly'=>true,'secure'=>(!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS']!=='off'),'samesite'=>'Strict','path'=>rtrim(str_replace('\\','/',dirname($_SERVER['SCRIPT_NAME'] ?? '/dashboard/index.php')),'/').'/']);session_start();
 if(isset($_SESSION['last']) && time()-$_SESSION['last']>1800)$_SESSION=[];
 $_SESSION['last']=time(); $_SESSION['csrf']??=bin2hex(random_bytes(32));
 header('Cache-Control: no-store');header('X-Robots-Tag: noindex, nofollow');
 header("Content-Security-Policy: default-src 'self'; style-src 'self' 'unsafe-inline'; form-action 'self'; frame-ancestors 'none'; base-uri 'none'");
 header('X-Content-Type-Options: nosniff');
}
function csrf(): void {if(!hash_equals($_SESSION['csrf'],(string)($_POST['csrf']??''))){http_response_code(403);exit('Invalid request');}}
