defmodule Porfolio.Accounts.User do
  use Ecto.Schema
  import Ecto.Changeset
  alias Portfolio.Accounts.Encryption

  schema "users" do
    field :encrypted_password, :string
    field :username, :string
    field :is_admin, :boolean, default: false, null: false

    # Virtual fields

    field :password, :string, virtual: true
    field :password_confirmation, :string, virtual: true

    timestamps()
  end

  @doc false
  def changeset(user, attrs) do
    user
    |> cast(attrs, [:username, :password, :is_admin])
    |> validate_required([:username, :password])
    |> validate_length(:password, min: 6)
    |> validate_confirmation(:password)
    |> validate_format(:username, ~r/^[a-z0-9][a-z0-9]+[a-z0-9]$/i)
    |> validate_length(:username, min: 3)
    |> unique_constraint(:username)
    |> encrypt_password
  end

  defp encrypt_password(changeset) do
    password = get_change(changeset, :password)

    if password do
      encrypted_password = Encryption.hash_password(password)
      put_change(changeset, :encrypted_password, encrypted_password)
    else
      changeset
    end
  end
end
