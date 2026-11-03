<?php
if(PHP_SAPI!=='cli'){http_response_code(404);exit;}
require __DIR__.'/bootstrap.php';
query('UPDATE events SET ip=NULL WHERE ip IS NOT NULL AND created_at < DATE_SUB(UTC_TIMESTAMP(),INTERVAL 30 DAY)');
query('DELETE FROM limits WHERE expires_at < UTC_TIMESTAMP()');
echo "Retention completed\n";
