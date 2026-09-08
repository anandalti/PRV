exports.up = (pgm) => {
    pgm.createTable('ImportToolUsers', {
        Id: 'id',
        SsoId: { type: 'varchar(255)', notNull: true },
        Email: { type: 'varchar(255)', notNull: true },
        Role: { type: 'varchar(50)', notNull: true },
        CreatedAt: { type: 'timestamp', default: pgm.func('current_timestamp') },
        UpdatedAt: { type: 'timestamp', default: pgm.func('current_timestamp') }
    });
    pgm.createTable('ImportToolFiles', {
        Id: 'id',
        Filename: { type: 'varchar(255)', notNull: true },
        Blob: { type: 'bytea', notNull: true },
        UploadStatus: { type: 'varchar(50)', default: 'pending', check: "UploadStatus IN ('pending', 'completed', 'failed')" },
        ParseStatus: { type: 'varchar(50)', default: 'pending', check: "ParseStatus IN ('pending', 'completed', 'failed')" },
        ErrorMessage: { type: 'text' },
        UserId: {
            type: 'integer',
            references: '"ImportToolUsers"(Id)',
            onDelete: 'CASCADE'
        },
        CreatedAt: { type: 'timestamp', default: pgm.func('current_timestamp') },
        UpdatedAt: { type: 'timestamp', default: pgm.func('current_timestamp') },
    });
};

exports.down = (pgm) => {
    pgm.dropTable('ImportToolFiles');
    pgm.dropTable('ImportToolUsers');
};
