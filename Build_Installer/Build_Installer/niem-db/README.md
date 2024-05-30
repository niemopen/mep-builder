# NIEM Database #

## Info ##
This is a fork off of the couchbase docker image from here https://github.com/couchbase/server-sandbox/ It loads up the initial data on startup via a shellscript executing couchbase_cli commands to load json data, and will run queries to create indicies.

## Execution ##
How do you work this thing?

Build the docker image with "docker build -t niem-db ."

then run the container with "docker run -it -p 8091-8094:8091-8094 -p 11210:11210 --name <name_your_container> niem-db"