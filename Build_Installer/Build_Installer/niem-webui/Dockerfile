FROM node:17.4.0

COPY . '/niem-webui'
WORKDIR /niem-webui
RUN npm install -g npm@6.14.11
RUN npm install
RUN echo "npm start" > startup.sh
RUN chmod +x startup.sh
CMD [ "./startup.sh" ]