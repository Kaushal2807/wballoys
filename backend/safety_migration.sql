-- =============================================
-- Safety Feature Database Migration Script
-- =============================================
-- Run this script on existing databases to add safety functionality
-- For new databases, the models will be created automatically

-- Create safety_parameters table
CREATE TABLE IF NOT EXISTS safety_parameters (
    id SERIAL PRIMARY KEY,
    name VARCHAR NOT NULL,
    category VARCHAR NOT NULL,
    description VARCHAR,
    is_required BOOLEAN DEFAULT TRUE,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create safety_checklist_items table
CREATE TABLE IF NOT EXISTS safety_checklist_items (
    id SERIAL PRIMARY KEY,
    request_id INTEGER NOT NULL,
    safety_parameter_id INTEGER NOT NULL,
    checked_by INTEGER NOT NULL,
    checked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notes TEXT,

    -- Foreign key constraints
    CONSTRAINT fk_safety_checklist_request
        FOREIGN KEY (request_id) REFERENCES service_requests(id),
    CONSTRAINT fk_safety_checklist_parameter
        FOREIGN KEY (safety_parameter_id) REFERENCES safety_parameters(id),
    CONSTRAINT fk_safety_checklist_user
        FOREIGN KEY (checked_by) REFERENCES users(id)
);

-- Add safety fields to existing job_photos table
ALTER TABLE job_photos
ADD COLUMN IF NOT EXISTS safety_category VARCHAR,
ADD COLUMN IF NOT EXISTS safety_notes TEXT,
ADD COLUMN IF NOT EXISTS file_id INTEGER;

-- Add foreign key constraint for file_id (if files table exists)
-- Note: Only add this if the files table exists in your database
-- ALTER TABLE job_photos
-- ADD CONSTRAINT fk_job_photo_file
--     FOREIGN KEY (file_id) REFERENCES files(id);

-- Insert default safety parameters
INSERT INTO safety_parameters (name, category, is_required, order_index) VALUES
-- Personal Protection Equipment
('Hard hat/helmet properly fitted', 'personal_protection', TRUE, 1),
('Safety glasses/goggles worn', 'personal_protection', TRUE, 2),
('Appropriate work boots worn', 'personal_protection', TRUE, 3),
('High-visibility clothing if required', 'personal_protection', FALSE, 4),

-- Site Safety
('Work area hazards identified', 'site_safety', TRUE, 10),
('Emergency exits located', 'site_safety', TRUE, 11),
('First aid location identified', 'site_safety', TRUE, 12),
('Site-specific safety briefing completed', 'site_safety', FALSE, 13),

-- Equipment Safety
('Tools inspected before use', 'equipment_safety', TRUE, 20),
('Equipment lockout/tagout verified', 'equipment_safety', TRUE, 21),
('Electrical hazards assessed', 'equipment_safety', TRUE, 22),

-- Emergency Procedures
('Emergency contact numbers available', 'emergency_procedures', TRUE, 30),
('Evacuation procedures understood', 'emergency_procedures', FALSE, 31)

-- Only insert if these parameters don't already exist
ON CONFLICT DO NOTHING;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_safety_checklist_request_id
    ON safety_checklist_items(request_id);

CREATE INDEX IF NOT EXISTS idx_safety_checklist_parameter_id
    ON safety_checklist_items(safety_parameter_id);

CREATE INDEX IF NOT EXISTS idx_safety_checklist_checked_by
    ON safety_checklist_items(checked_by);

CREATE INDEX IF NOT EXISTS idx_safety_parameters_category
    ON safety_parameters(category);

CREATE INDEX IF NOT EXISTS idx_safety_parameters_required
    ON safety_parameters(is_required);

CREATE INDEX IF NOT EXISTS idx_job_photos_safety_category
    ON job_photos(safety_category);

-- =============================================
-- Verification Queries
-- =============================================
-- Run these to verify the migration was successful

-- Check if tables were created
-- SELECT table_name FROM information_schema.tables
-- WHERE table_schema = 'public'
-- AND table_name IN ('safety_parameters', 'safety_checklist_items');

-- Check if columns were added to job_photos
-- SELECT column_name, data_type
-- FROM information_schema.columns
-- WHERE table_name = 'job_photos'
-- AND column_name IN ('safety_category', 'safety_notes', 'file_id');

-- Check if default safety parameters were inserted
-- SELECT COUNT(*) as parameter_count FROM safety_parameters;

-- =============================================
-- Rollback Script (if needed)
-- =============================================
-- CAUTION: This will remove all safety data
-- Uncomment and run only if you need to completely remove safety functionality

-- DROP TABLE IF EXISTS safety_checklist_items;
-- DROP TABLE IF EXISTS safety_parameters;
-- ALTER TABLE job_photos DROP COLUMN IF EXISTS safety_category;
-- ALTER TABLE job_photos DROP COLUMN IF EXISTS safety_notes;
-- ALTER TABLE job_photos DROP COLUMN IF EXISTS file_id;