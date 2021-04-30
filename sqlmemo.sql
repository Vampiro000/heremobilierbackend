CREATE FUNCTION evaluate_earth_distance(
   "latitude1" numeric,
   "longitude1" numeric,
   "latitude2" numeric,
   "longitude2" numeric
)
RETURNS numeric AS
$body$
DECLARE
   degToRad NUMERIC;
   radToDeg NUMERIC;
   pi NUMERIC;
   theta NUMERIC;
   distance NUMERIC;
BEGIN
   pi := 3.14159265358979323846;
   degToRad := pi / 180;
   radToDeg := 180 / pi;
   theta := longitude2 - longitude1;

   distance := sin(latitude1 * degToRad) * sin(latitude2 * degToRad) + cos(latitude1 * degToRad) * cos(latitude2 * degToRad) * cos(theta * degToRad);
   distance := acos(distance);
   distance := distance * radToDeg;
   distance := distance * 60 * 1.1515 * 1.609344;

   RETURN distance;
END;
$body$
LANGUAGE 'plpgsql';




SELECT evaluate_earth_distance(45.547291,-73.641446, 45.522651,-73.593373);
-- 4,63949681350483 km

SELECT * FROM public.dvf WHERE code_postal = 13320  
SELECT * FROM public.dvf   WHERE  code_postal = 13320 AND evaluate_earth_distance(43.45942,5.402147,  latitude ,  longitude) <= 0.5  
SELECT latitude ,  longitude FROM public.dvf   WHERE  code_postal = 13320 AND evaluate_earth_distance(43.45942,5.402147,  latitude ,  longitude) <= 0.5 

SELECT * FROM (SELECT * FROM public.dvf WHERE code_postal = 13320 ) AS D WHERE evaluate_earth_distance(43.45942,5.402147, D.latitude , D.longitude) <= 0.5 

ALTER TABLE public.dvf
DROP COLUMN id_mutation  ,  numero_disposition  ,  adresse_suffixe  ,  adresse_code_voie  ,  ancien_code_commune  ,  ancien_nom_commune  ,  id_parcelle  ,  ancien_id_parcelle  ,  numero_volume  ,  lot1_numero  ,  lot1_surface_carrez  ,  lot2_numero  ,  lot2_surface_carrez  ,  lot3_numero  ,  lot3_surface_carrez  ,  lot4_numero  ,  lot4_surface_carrez  ,  lot5_numero  ,  lot5_surface_carrez  ,  nombre_lots  ,  code_type_local  ,  code_nature_culture  ,  nature_culture  ,  code_nature_culture_speciale  ,  nature_culture_speciale  ,  section_prefixe 



SELECT * FROM public.dvf WHERE code_postal = 13320 AND type_local = 'Appartement'

SELECT * FROM refactor_dvf WHERE code_postal = 13320 AND type_local = 'Appartement'

SELECT COLUMN_NAME

FROM INFORMATION_SCHEMA.COLUMNS

WHERE TABLE_NAME = 'dvf'

ORDER BY ORDINAL_POSITION

 DROP COLUMN id_mutation , 
 DROP COLUMN numero_disposition , 
 DROP COLUMN adresse_suffixe , 
 DROP COLUMN adresse_code_voie , 
 DROP COLUMN ancien_code_commune , 
 DROP COLUMN ancien_nom_commune , 
 DROP COLUMN id_parcelle , 
 DROP COLUMN ancien_id_parcelle , 
 DROP COLUMN numero_volume , 
 DROP COLUMN lot1_numero , 
 DROP COLUMN lot1_surface_carrez , 
 DROP COLUMN lot2_numero , 
 DROP COLUMN lot2_surface_carrez , 
 DROP COLUMN lot3_numero , 
 DROP COLUMN lot3_surface_carrez , 
 DROP COLUMN lot4_numero , 
 DROP COLUMN lot4_surface_carrez , 
 DROP COLUMN lot5_numero , 
 DROP COLUMN lot5_surface_carrez , 
 DROP COLUMN nombre_lots , 
 DROP COLUMN code_type_local , 
 DROP COLUMN code_nature_culture , 
 DROP COLUMN nature_culture , 
 DROP COLUMN code_nature_culture_speciale , 
 DROP COLUMN nature_culture_speciale , 
 DROP COLUMN section_prefixe ;
, 
