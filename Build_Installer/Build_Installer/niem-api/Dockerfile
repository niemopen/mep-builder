FROM node:lts
WORKDIR /app
COPY package.json .
RUN npm install
EXPOSE 9090
#Copy everything in the current folder to the container
COPY . .
CMD npm start