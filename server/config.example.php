<?php
return [
 'dsn'=>'mysql:host=localhost;dbname=YOUR_DATABASE;charset=utf8mb4',
 'user'=>'YOUR_DATABASE_USER', 'password'=>'YOUR_DATABASE_PASSWORD',
 'secret'=>'REPLACE_WITH_64_RANDOM_HEX_CHARACTERS',
 'admin_user'=>'admin', 'admin_hash'=>'PASTE_PASSWORD_HASH',
 'geo_csv'=>'', // Optional private CSV: CIDR,country,city. IPv4 and IPv6 supported.
];
