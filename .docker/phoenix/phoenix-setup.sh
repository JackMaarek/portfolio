#!/usr/bin/env bash

while ! pg_isready -q -h $PGHOST -p $PGPORT -U $PGUSER
do
  echo "$(date) - waiting for database to start"
  sleep 10
done

# Create, migrate, and seed database if it doesn't exist.
if [[ -z `psql -Atqc "\\list $PGDATABASE"` ]]; then
  cd portfolio
  echo "Database $PGDATABASE does not exist. Creating..."
  mix deps.get
  mix ecto.create
  mix ecto.migrate
  mix run priv/repo/seeds.exs
  echo "Database $PGDATABASE created."
  cd assets
  npm install
  echo "Node dependencies has been installed"
  cd ../
  exec mix phx.server
else
  cd portfolio
  mix deps.get
  echo "Hex dependencies has been installed"
  cd assets
  npm install
  echo "Node dependencies has been installed"
  cd ../
  exec mix phx.server
fi