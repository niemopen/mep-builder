#!/bin/bash

# Variables for MongoDB
MDB_USER=niemadmin
MDB_PWD=example
MDB_HOST=localhost
MDB_PORT=27017
MDB_IMAGE=mongodb

MDB_NAME=niemdb

# Data Collections for NIEM DB
COLLECTION_USER=users
COLLECTION_TYPECOMMONCOMPONENTS=typecommonniemcomponents
COLLECTION_PROPERTYCOMMONCOMPONENTS=propertycommonniemcomponents
COLLECTION_NIEMFACETS=niemfacets
COLLECTION_NIEMGLOSSARIES=niemglossaries
COLLECTION_NIEMMETADATAS=niemmetadatas
COLLECTION_NIEMNAMESPACES=niemnamespaces
COLLECTION_NIEMPROPERTIES=niemproperties
COLLECTION_NIEMTYPES=niemtypes
COLLECTION_NIEMTYPECONTAINSPROPERTIES=niemtypecontainsproperties
COLLECTION_NIEMTYPEUNIONS=niemtypeunions
COLLECTION_NIEMLOCALTERMS=niemlocalterms
COLLECTION_NIEMCHANGELOGPROPERTIES=niemchangelogproperties
COLLECTION_NIEMCHANGELOGTYPES=niemchangelogtypes
COLLECTION_NIEMCHANGELOGTYPECONTAINSPROPERTIES=niemchangelogtypecontainsproperties
COLLECTION_NIEMCHANGELOGFACETS=niemchangelogfacets
COLLECTION_NIEMCHANGELOGNAMESPACES=niemchangelognamespaces


# Wait until Mongo is ready to accept connections
# Checks for
until mongo --quiet --host $MDB_HOST --eval "printjson(db.runCommand( { connectionStatus: 1, showPrivileges: true } ))"; do
  sleep 10
  echo "Waiting 10 seconds for DB Connection.."
done

# Drops the collection and imports the data
echo "Succesfully connecting. Starting data import commands."
echo "Loading User Data..."
mongoimport --host $MDB_HOST --db $MDB_NAME --drop --collection $COLLECTION_USER \
  --type json --file /data/user_initialdata.json --jsonArray

echo "Loading Property Common NIEM Components..."
mongoimport --host $MDB_HOST --db $MDB_NAME --drop --collection $COLLECTION_PROPERTYCOMMONCOMPONENTS \
  --type csv --headerline --file /data/PropertyCommonNIEMComponents.csv

echo "Loading Type Common NIEM Components..."
mongoimport --host $MDB_HOST --db $MDB_NAME --drop --collection $COLLECTION_TYPECOMMONCOMPONENTS \
  --type csv --headerline --file /data/TypeCommonNIEMComponents.csv

# Load NIEM release and changelog CSV files into DB
releases=('5.2' '5.1' '5.0' '4.2' '4.1' '4.0' '3.2' '3.1' '3.0' )
echo "Loading NIEM Releases..."
for item in "${releases[@]}"; 
do
  mongoimport --host $MDB_HOST --db $MDB_NAME --collection $COLLECTION_NIEMFACETS \
    --type csv --headerline --file /data/Facet_$item.csv 

  mongoimport --host $MDB_HOST --db $MDB_NAME --collection $COLLECTION_NIEMGLOSSARIES \
    --type csv --headerline --file /data/Glossary_$item.csv 

  mongoimport --host $MDB_HOST --db $MDB_NAME --collection $COLLECTION_NIEMMETADATAS \
    --type csv --headerline --file /data/Metadata_$item.csv 

  mongoimport --host $MDB_HOST --db $MDB_NAME --collection $COLLECTION_NIEMNAMESPACES \
    --type csv --headerline --file /data/Namespace_$item.csv 

  mongoimport --host $MDB_HOST --db $MDB_NAME --collection $COLLECTION_NIEMPROPERTIES \
    --type csv --headerline --file /data/Property_$item.csv 

  mongoimport --host $MDB_HOST --db $MDB_NAME --collection $COLLECTION_NIEMTYPES \
    --type csv --headerline --file /data/Type_$item.csv 

  mongoimport --host $MDB_HOST --db $MDB_NAME --collection $COLLECTION_NIEMTYPECONTAINSPROPERTIES \
    --type csv --headerline --file /data/TypeContainsProperty_$item.csv 

  mongoimport --host $MDB_HOST --db $MDB_NAME --collection $COLLECTION_NIEMTYPEUNIONS \
    --type csv --headerline --file /data/TypeUnion_$item.csv 

  mongoimport --host $MDB_HOST --db $MDB_NAME --collection $COLLECTION_NIEMLOCALTERMS \
    --type csv --headerline --file /data/LocalTerm_$item.csv 

  mongoimport --host $MDB_HOST --db $MDB_NAME --collection $COLLECTION_NIEMCHANGELOGPROPERTIES \
    --type csv --headerline --file /data/Changelog_Property_$item.csv 

  mongoimport --host $MDB_HOST --db $MDB_NAME --collection $COLLECTION_NIEMCHANGELOGTYPES \
    --type csv --headerline --file /data/Changelog_Type_$item.csv 

  mongoimport --host $MDB_HOST --db $MDB_NAME --collection $COLLECTION_NIEMCHANGELOGTYPECONTAINSPROPERTIES \
    --type csv --headerline --file /data/Changelog_TypeContainsProperty_$item.csv 

  mongoimport --host $MDB_HOST --db $MDB_NAME --collection $COLLECTION_NIEMCHANGELOGFACETS \
    --type csv --headerline --file /data/Changelog_Facet_$item.csv 

  mongoimport --host $MDB_HOST --db $MDB_NAME --collection $COLLECTION_NIEMCHANGELOGNAMESPACES \
    --type csv --headerline --file /data/Changelog_Namespace_$item.csv 
done


echo "Data loading complete"

echo "Shutting down Mongo DB Seed."
