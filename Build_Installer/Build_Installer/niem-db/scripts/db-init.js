let niemDbName = 'niemdb';
let user = { name: 'niemuser', password: 'example' };

let conn = new Mongo();
let db = conn.getDB(niemDbName);

// create db user
db.createUser({
	user: user.name,
	pwd: user.password,
	roles: [{ role: 'readWrite', db: niemDbName }],
});

// NOTE: additional collections are being created and imported with data in scripts/imports/niem-db.sh

// create empty collections that will be populated by the application
db.createCollection('niemdatas'); // will contain the NIEM Reference Data
db.createCollection('packages'); // will contain package data
db.createCollection('fileblobs'); // will contain the blob objects of files
db.createCollection('mappingdocs'); // will contain the mapping sheet JSON Array string for each package
db.createCollection('artifacttrees'); // will contain the artifact tree JSON Array string for each package

// create collections for common NIEM components
db.createCollection('typecommonniemcomponents');
db.createCollection('propertycommonniemcomponents');

// create collections for mapping spreadsheet components by sheet
db.createCollection('propertycomponents');
db.createCollection('typecomponents');
db.createCollection('typehaspropertycomponents');
db.createCollection('codesfacetscomponents');
db.createCollection('namespacecomponents');
db.createCollection('localterminologycomponents');
db.createCollection('typeunioncomponents');
db.createCollection('metadatacomponents');

// creates collections for NIEM Release Data
db.createCollection('niemfacets');
db.createCollection('niemlocalterms');
db.createCollection('niemmetadatas');
db.createCollection('niemnamespaces');
db.createCollection('niemproperties');
db.createCollection('niemtypecontainsproperties');
db.createCollection('niemtypes');
db.createCollection('niemtypeunions');

// update column names to match other column names in db
db.niemproperties.update({}, { $rename: { PropertyNS: 'PropertyNamespacePrefix' } }, false, true);
db.niemtypes.update({}, { $rename: { TypeNS: 'TypeNamespacePrefix' } }, false, true);
// Namespace 3.0 was converted from xlsx to csv, therefore some of the columns do not match other columns in the db.
db.niemnamespaces.update(
	{ Release: 3.0 },
	{
		$rename: {
			'Abbreviated Name': 'NamespacePrefix',
			'Full Name': 'NamespaceFile',
			Version: 'VersionReleaseNumber',
			Style: 'NamespaceStyle',
			URI: 'VersionURI',
		},
	},
	false,
	true
);

// creates collections for NIEM Change Log Data
db.createCollection('niemchangelogproperties');
db.createCollection('niemchangelogtypes');
db.createCollection('niemchangelogtypecontainsproperties');
db.createCollection('niemchangelogfacets');
db.createCollection('niemchangelognamespaces');

// create collection that will store error logs
db.createCollection('errorlogs');
