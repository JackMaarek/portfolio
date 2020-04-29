defmodule Porfolio.Repo do
  use Ecto.Repo,
    otp_app: :porfolio,
    adapter: Ecto.Adapters.Postgres
end
