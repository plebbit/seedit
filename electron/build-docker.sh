root_path=$(cd `dirname $0` && cd .. && pwd)
cd "$root_path"

# install node_modules
if [[ ! -f node_modules ]]
then
  yarn || { echo "Error: failed installing 'node_modules' with 'yarn'" ; exit 1; }
fi

# download ipfs clients
node electron/download-ipfs || { echo "Error: failed script 'node electron/download-ipfs'" ; exit 1; }

dockerfile='
FROM electronuserland/builder:16

# install node_modules
WORKDIR /usr/src/seedit
COPY ./package.json .
COPY ./yarn.lock .
RUN yarn

# build native dependencies like sqlite3
RUN electron-builder install-app-deps

# copy source files
COPY ./bin ./bin
COPY ./electron ./electron
COPY ./src ./src
COPY ./public ./public

# required or yarn build fails
COPY ./.eslintrc.json ./.eslintrc.json
COPY ./.prettierrc ./.prettierrc

# react build
RUN yarn build
'

# build electron-builder docker image
# temporary .dockerignore to save build time
echo $'node_modules\ndist' > .dockerignore
echo "$dockerfile" | sudo docker build \
  . \
  --tag seedit-electron-builder \
  --file -
rm .dockerignore

# build linux binary
sudo docker run \
  --name seedit-electron-builder \
  --volume "$root_path"/dist:/usr/src/seedit/dist \
  --rm \
  seedit-electron-builder \
  yarn electron:build:linux

# build windows binary
sudo docker run \
  --name seedit-electron-builder \
  --volume "$root_path"/dist:/usr/src/seedit/dist \
  --rm \
  seedit-electron-builder \
  yarn electron:build:windows
