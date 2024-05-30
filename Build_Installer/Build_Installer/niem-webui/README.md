# niem-webui

Everything we need to build and deploy locally. This will need to be updated later with instructions to deploy to our cloud environments

## Local Setup

### Prerequisites

Have Git and Node.js installed

Ensure correct node packet manager is installed

run 'npm install -g npm@6.14.11'

### Clone Repository

In a parent directory (ex: C:\DEV), open a Git Bash Terminal

Clone the niem-webui repository using:
 - git clone https://github.boozallencsn.com/NIEM/niem-webui.git

### Install Project

Change directory to the niem-webui folder
    Ex: cd C:\DEV\niem-webui

run 'npm install'

### Run the Application

While still in the niem-webui folder, run 'npm start'

# Helpful Docker Commands

#### Cleanup Dangling Images

Every now and then it’s good to clean out "dangling images", which are the ones with `<none>` for a tag. These are temporary and get created during builds:

`docker rmi $(docker images --filter "dangling=true" -q --no-trunc)`

#### Stop all running containers

`docker stop $(docker ps -aq)`

#### Remove all containers
`docker rm -v $(docker ps -aq)`

#### Remove all images
*WARNING: This will require you to rebuild every Docker image on your local machine. Use this only if you need to "nuke and pave" your whole setup (i.e. if testing these scripts for onboarding...)*

`docker rmi $(docker images -q)`

#### List docker volumes
`docker volume ls`

#### Remove docker dangling volumes
`docker volume rm $(docker volume ls -q)`