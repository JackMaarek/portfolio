FROM elixir:latest

LABEL maintainer="Jack Maarek <https://github.com/JackMaarek/portfolio>"


RUN mix local.hex --force &&\
    mix local.rebar --force &&\
    mix archive.install hex phx_new 1.5.1 --force

RUN apt-get update && \
  ## install inotify-tool for phoenix hot reload
  apt-get install -y inotify-tools && \
  # Install postgres client
  apt-get install -y postgresql-client && \
  # Clear apt cache
   rm -rf /var/lib/apt/lists/*

WORKDIR /phoenix

EXPOSE 4000