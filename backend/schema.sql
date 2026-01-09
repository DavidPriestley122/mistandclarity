-- Mist and Clarity Paintings Database Schema

-- Artists table
CREATE TABLE IF NOT EXISTS artists (
    id SERIAL PRIMARY KEY,
    name_preferred VARCHAR(255) NOT NULL,
    name_pinyin VARCHAR(255),
    bio TEXT,
    birth_year INTEGER,
    death_year INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Paintings table
CREATE TABLE IF NOT EXISTS paintings (
    id SERIAL PRIMARY KEY,
    catalog_number VARCHAR(50) UNIQUE,
    catalog_reference VARCHAR(100) UNIQUE,
    artist_id INTEGER REFERENCES artists(id),
    theme VARCHAR(100),
    artists_title VARCHAR(255),
    descriptive_title TEXT,
    medium_type VARCHAR(100),
    medium_detail TEXT,
    dimensions_h NUMERIC(10, 2),
    dimensions_w NUMERIC(10, 2),
    signature_location VARCHAR(255),
    notes TEXT,
    dropbox_link_front TEXT,
    dropbox_link_reverse TEXT,
    framed BOOLEAN,
    mounted BOOLEAN,
    condition VARCHAR(100),
    number_of_seals INTEGER,
    quality_rating INTEGER CHECK (quality_rating >= 1 AND quality_rating <= 100),
    location_code VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Collections table (for curated exhibitions)
CREATE TABLE IF NOT EXISTS collections (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Collection paintings junction table (with ordering)
CREATE TABLE IF NOT EXISTS collection_paintings (
    id SERIAL PRIMARY KEY,
    collection_id INTEGER REFERENCES collections(id) ON DELETE CASCADE,
    painting_id INTEGER REFERENCES paintings(id) ON DELETE CASCADE,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(collection_id, painting_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_paintings_artist_id ON paintings(artist_id);
CREATE INDEX IF NOT EXISTS idx_paintings_theme ON paintings(theme);
CREATE INDEX IF NOT EXISTS idx_paintings_catalog_number ON paintings(catalog_number);
CREATE INDEX IF NOT EXISTS idx_collection_paintings_collection_id ON collection_paintings(collection_id);
CREATE INDEX IF NOT EXISTS idx_collection_paintings_display_order ON collection_paintings(display_order);

-- Insert the two main artists
INSERT INTO artists (name_preferred, name_pinyin, bio) VALUES
    ('Fei Cheng-wu', 'Fei Chengwu', 'Chinese artist active in London in the 1950s'),
    ('Chang Chien-ying', 'Zhang Qianying', 'Chinese artist active in London in the 1950s, married to Fei Cheng-wu')
ON CONFLICT DO NOTHING;
