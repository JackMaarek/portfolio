FROM elixir:latest

LABEL maintainer="Jack Maarek <https://github.com/JackMaarek/portfolio>"


RUN mix local.hex --force &&\
    mix local.rebar --force &&\
    mix archive.install hex phx_new 1.4.16 --force

RUN apt-get update && \
  ## install inotify-tool for phoenix hot reload
  apt-get install -y inotify-tools && \
  # install nodejs and npm on globaly
  curl -sL https://deb.nodesource.com/setup_14.x | bash - && \
   apt-get install -y -q nodejs && \
  # Install postgres client
  apt-get install -y postgresql-client && \
  # Clear apt cache
   rm -rf /var/lib/apt/lists/*

WORKDIR /phoenix

COPY . /phoenix

EXPOSE 4000