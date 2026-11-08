<?php
require dirname(__DIR__).'/server/bootstrap.php';
header('Content-Type: application/json');header('Cache-Control: no-store');
function reply(int $code,array $data): never {http_response_code($code);echo json_encode($data);exit;}
try {
 if($_SERVER['REQUEST_METHOD']!=='POST')reply(405,['ok'=>false]);
 if(stripos($_SERVER['CONTENT_TYPE']??'','application/json')!==0)reply(415,['ok'=>false]);
 if(($_SERVER['HTTP_SEC_FETCH_SITE']??'same-origin')==='cross-site')reply(403,['ok'=>false]);
 $raw=file_get_contents('php://input',false,null,0,60001);if(strlen($raw)>60000)reply(413,['ok'=>false]);
 $d=json_decode($raw,true,32,JSON_THROW_ON_ERROR);if(!is_array($d))reply(422,['ok'=>false]);
 limit('collect',90);
 $visitor=preg_match('/^[a-zA-Z0-9-]{16,64}$/',$d['visitor']??'')?$d['visitor']:'';
 $session=preg_match('/^[a-zA-Z0-9-]{16,64}$/',$d['session']??'')?$d['session']:'';
 if(!$visitor || !$session)reply(422,['ok'=>false]);
 [$country,$city]=geo();$kind=$d['kind']??'';
 if($kind==='order'){
  limit('order',10);$f=$d['fields']??[];
  foreach(['name','phone','shipper','cargo','origin','destination','shipmentMode'] as $key)if(!is_string($f[$key]??null)||!trim($f[$key])||strlen($f[$key])>200)reply(422,['ok'=>false,'error'=>'required_fields']);
  if(!in_array($f['shipmentMode'],['Sea Freight - FCL','Sea Freight - LCL','Air Freight','Land Transport'],true))reply(422,['ok'=>false]);
  if($f['shipmentMode']==='Sea Freight - FCL' && (empty($f['containerSize']) || empty($f['containerType']) || !filter_var($f['qty']??0,FILTER_VALIDATE_INT,['options'=>['min_range'=>1]])))reply(422,['ok'=>false]);
  if(!empty($f['customsEnabled']) && (empty($f['ccLocation']) || !in_array($f['ccType']??'',['Import','Export'],true)))reply(422,['ok'=>false]);
  if(!empty($f['truckEnabled']) && $f['shipmentMode']!=='Land Transport'){
   $leg=$f['truckLeg']??'';
   if(!in_array($leg,['origin','destination','both'],true) || (in_array($leg,['origin','both'],true)&&empty($f['truckPickup'])) || (in_array($leg,['destination','both'],true)&&empty($f['truckDelivery'])))reply(422,['ok'=>false]);
  }
  if(!preg_match('/^[a-zA-Z0-9-]{16,64}$/',$d['request_id']??''))reply(422,['ok'=>false]);
  query('INSERT INTO orders(request_id,reference,created_at,name,company,phone,service,visitor,country,payload) VALUES(?,?,UTC_TIMESTAMP(),?,?,?,?,?,?,?) ON DUPLICATE KEY UPDATE request_id=VALUES(request_id)',[$d['request_id'],substr($d['reference']??'',0,64),$f['name'],substr((string)($f['shipper']??''),0,200),$f['phone'],$f['shipmentMode'],$visitor,$country,json_encode($d,JSON_UNESCAPED_UNICODE|JSON_THROW_ON_ERROR)]);
  reply(200,['ok'=>true]);
 }
 if(!in_array($kind,['pageview','quote_start','whatsapp_open'],true))reply(422,['ok'=>false]);
 if(preg_match('/bot|crawler|spider|headless/i',$_SERVER['HTTP_USER_AGENT']??''))reply(200,['ok'=>true]);
 query('INSERT INTO events(created_at,visitor,session_id,kind,page,ip,country,city) VALUES(UTC_TIMESTAMP(),?,?,?,?,?,?,?)',[$visitor,$session,$kind,substr((string)($d['page']??''),0,250),ip(),$country,$city]);
 reply(200,['ok'=>true]);
} catch(Throwable $e){error_log('AK collection unavailable: '.get_class($e));reply(503,['ok'=>false,'error'=>'unavailable']);}
