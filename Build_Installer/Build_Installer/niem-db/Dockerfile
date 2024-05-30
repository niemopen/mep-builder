# create database image
FROM mongo:5.0.2

COPY data /data
COPY scripts /docker-entrypoint-initdb.d/
RUN chmod -R +x /docker-entrypoint-initdb.d/

EXPOSE 8081 27017

CMD ["mongod"]