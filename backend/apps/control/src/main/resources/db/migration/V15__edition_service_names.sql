ALTER TABLE shared.service_heartbeats DROP CONSTRAINT service_heartbeats_service_check;
UPDATE shared.service_heartbeats SET service = CASE service
    WHEN 'space-management' THEN 'edition-management'
    WHEN 'space-worker' THEN 'edition-worker'
END;
ALTER TABLE shared.service_heartbeats ADD CONSTRAINT service_heartbeats_service_check
    CHECK (service IN ('edition-management', 'edition-worker'));
