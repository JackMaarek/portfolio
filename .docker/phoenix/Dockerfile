FROM elixir:latest

LABEL maintainer="Jack Maarek <https://github.com/JackMaarek/portfolio>"

RUN mix local.hex --force &&\
    mix local.rebar --force &&\
    mix archive.install hex phx_new 1.5.9 --force

RUN apt-get update && \
  ## install apt-utils
  apt-get install -y apt-utils && \
  # install nodejs
  curl -sL https://deb.nodesource.com/setup_12.x | bash - && \
  apt-get install -y nodejs && \
  ## install inotify-tool for phoenix hot reload
  apt-get install -y inotify-tools && \
  # Install postgres client
  apt-get install -y postgresql-client && \
  # Clear apt cache
   rm -rf /var/lib/apt/lists/*

WORKDIR /phoenix

COPY . .

EXPOSE 4000