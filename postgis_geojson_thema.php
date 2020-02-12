<?php
include 'geoweb_pg_open.php';
# Es sollen die Spalten mit Name, Nachricht, Thema des Feedbacks und Click-Position ausgewählt werden
$sql = 'SELECT left(name,1) AS "Name",  nachricht AS "Nachricht", f_thema, public.ST_AsGeoJSON(the_geom, 6) AS geojson FROM g05.feedback_gemaprima';

$result = pg_query($sql);
if (!$result) {
echo "An SQL error occured.\n";
exit;
}

$geojson = array(
'type' => 'FeatureCollection',
'features' => array()
);

while ($row = pg_fetch_assoc($result)) {
$properties = $row;

unset($properties['geojson']);
unset($properties['the_geom']);
unset($properties['f_datum']);
unset($properties['f_geoweb']);
unset($properties['f_mail']);
unset($properties['f_anrede']);
$feature = array(
'type' => 'Feature',
'geometry' => json_decode($row['geojson'], true),
'properties' => $properties
);

array_push($geojson['features'], $feature);
}
header('Access-Control-Allow-Origin: *');
header('Content-type: application/json; charset=utf-8');
echo json_encode($geojson, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES |
JSON_NUMERIC_CHECK);
include 'geoweb_pg_close.php';
?>