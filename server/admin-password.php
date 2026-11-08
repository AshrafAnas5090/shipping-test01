<?php
if(PHP_SAPI!=='cli'){http_response_code(404);exit;}
fwrite(STDERR,"Enter password (12+ characters); terminal input may be visible: ");
$password=trim(fgets(STDIN));if(strlen($password)<12)exit("Too short\n");echo password_hash($password,PASSWORD_DEFAULT).PHP_EOL;
