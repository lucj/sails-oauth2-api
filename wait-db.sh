#!/bin/bash

# This script waits for MongoDB to be available before running the API service
# Connection check is done using the MONGODB_URL env variable provided
# Standard mongo URL: mongodb://[username:password@]host1[:port1][,host2[:port2],...[,hostN[:portN]]][/[database][?options]]

# Make sure MONGODB_URL is provided
if [[ -z "$MONGODB_URL" ]];then
    echo "MONGODB_URL environment variable needs to be setup"
    exit 1
fi

# Variables
LOGIN=
PASSWORD=
DATABASE=
HOSTS=

# Get credentials
function parseURI {
    # Check presence of @ char
    if [[ -n "$(echo $1 | grep "@")" ]];then
        echo "credential present"
        LOGIN=$(echo $1 | cut -d'/' -f3 | cut -d'@' -f1 | cut -d':' -f1)
        PASSWORD=$(echo $1 | cut -d'/' -f3 | cut -d'@' -f1 | cut -d':' -f2)
        HOSTS=$(echo $1 | cut -d'/' -f3 | cut -d'@' -f2)
    else
        HOSTS=$(echo $1 | cut -d'/' -f3)
    fi
    DATABASE=$(echo $1 | cut -d'/' -f4 | cut -d'?' -f1)
}

# Extract elements from MONGODB_URL environment variable
parseURI $MONGODB_URL

# Check connection
while true; do

    if [[ -n "$LOGIN" ]];then
      echo mongo -u $LOGIN -p $PASSWORD --host $HOSTS $DATABASE --eval 'db.serverStatus()'
      mongo -u $LOGIN -p $PASSWORD --host $HOSTS $DATABASE --eval 'db.serverStatus()' 1>/dev/null 2>/dev/null
    else
      echo mongo --host $HOSTS $DATABASE --eval 'db.serverStatus()'
      mongo --host $HOSTS $DATABASE --eval 'db.serverStatus()' 1>/dev/null 2>/dev/null
    fi

    if [ $? -eq 0 ]; then echo "DB available [$MONGODB_URL] => running API service"; exit 0; fi

    echo "Seems the database is not up yet, will retry to connect in 2 seconds" && sleep 2
done
